# ViT → TFLite Conversion Guide — SKINgenius

> **Scope:** Convert the fine-tuned `google/vit-base-patch16-224` (Fitzpatrick 17k, 93.5% test accuracy, 31 classes) to TensorFlow Lite for on-device inference in a React Native / Expo mobile app.

---

## TL;DR / Executive Summary

- **Recommended Pipeline:** HuggingFace PyTorch → **ONNX** → **TensorFlow SavedModel** → **TFLite** (with optional INT8 quantization).
- **Why not HuggingFace → TFLite directly?** The HuggingFace `optimum[exporters-tf]` TFLite path has **limited ViT support** and is primarily text-model focused. ONNX is the battle-tested bridge for vision transformers.
- **Recommended Quantization:** Start with **dynamic-range quantization** (4× smaller, ~2× faster CPU). Then evaluate **full-integer (INT8)** if you need maximum speed / low-end device support, using a **representative dataset** for calibration.
- **Delegates:**
  - **Android:** Use the **GPU delegate** (OpenCL) as primary; **NNAPI** is deprecated as of TensorFlow Lite 2.x. Fallback to CPU with XNNPACK.
  - **iOS:** Use **Core ML delegate** on A12+ devices (Neural Engine). Fallback to **GPU delegate** (Metal) if Core ML fails to initialize.
- **React Native:** Use **`react-native-tflite`** or **`expo-tflite`** (Expo SDK) depending on whether you are in bare or managed workflow. `react-native-fast-tflite` is another community option but verify Expo compatibility.
- **Preprocessing:** Do **resize + normalize in JS** (Expo `ImageManipulator` or `react-native-image-resizer`) before feeding the TFLite interpreter. Do **not** bake preprocessing into the model unless you must support non-JS runtimes.
- **Expected Latency (mid-tier):** ~**80–250 ms** on Snapdragon 7xx / Apple A14 for FP32; ~**50–150 ms** for INT8 on CPU; ~**30–80 ms** with GPU/CoreML delegate.
- **Expected Size:**
  - FP32: ~**350 MB** (from ~327 MB `model.safetensors`).
  - FP16: ~**175 MB**.
  - Dynamic-range / INT8: ~**85–90 MB**.

---

## 1. Pipeline: Why ONNX → SavedModel → TFLite?

### 1.1 Option A: HuggingFace `optimum` direct TFLite export (NOT recommended for ViT)

```bash
# Install optimum exporters
pip install optimum[exporters-tf]

# Attempt direct export (may fail or silently omit vision-specific ops)
optimum-cli export tflite \
  --model /home/jason/.openclaw/workspaces/skingenius/training/fitzpatrick17k/model_output/best \
  --task image-classification \
  --width 224 --height 224 --num_channels 3 \
  ./vit_tflite_direct/
```

**Verdict:** The `optimum.exporters.tflite` module officially supports only a **limited set** of architectures (Albert, BERT, Camembert, ConvBert, Deberta, DistilBert, Electra, Flaubert, MobileBert, MPNet, ResNet, Roberta, RoFormer, XLM, XLMRoberta). **ViT is not listed** in the supported architectures for direct TFLite export.

> **Risk:** If you force this, you may get a model that exports but has incorrect attention subgraphs or missing GELU approximations, leading to silent accuracy degradation.

### 1.2 Option B: HuggingFace → ONNX → TensorFlow SavedModel → TFLite (RECOMMENDED)

This is the community-proven path for ViT on mobile.

```
PyTorch (HuggingFace) ──► ONNX ──► TensorFlow SavedModel ──► TFLite (.tflite)
```

**Why this works:**
- `transformers.onnx` / `optimum.exporters.onnx` **does** support ViT (`ViTForImageClassification`).
- `onnx2tf` (or `onnx-tensorflow`) converts ONNX to a TF SavedModel.
- `tf.lite.TFLiteConverter.from_saved_model(...)` is mature and handles all ViT ops (LayerNorm, GELU, Softmax, MatMul) correctly.

---

## 2. Required Tools & Versions

| Tool | Version | Purpose |
|------|---------|---------|
| `transformers` | `>=4.46.0` | Load ViT, export to ONNX |
| `optimum[onnx]` | latest | Alternative ONNX export CLI |
| `onnx` | `>=1.14.0` | ONNX IR manipulation |
| `onnxruntime` | `>=1.16.0` | Validate ONNX model |
| `onnx2tf` | `>=1.17.0` | ONNX → TensorFlow SavedModel |
| `tensorflow` | `>=2.15.0` | TFLite conversion, quantization |
| `tf-keras` | bundled with TF | SavedModel ingestion |
| `numpy`, `Pillow` | latest | Preprocessing, calibration data |

```bash
# One-shot install
pip install \
  transformers optimum[onnx] \
  onnx onnxruntime \
  onnx2tf \
  tensorflow>=2.15.0 \
  numpy pillow
```

---

## 3. Step-by-Step Conversion

### Step 1: Export HuggingFace ViT to ONNX

```python
from pathlib import Path
from transformers import ViTForImageClassification, ViTImageProcessor
import torch

model_path = "/home/jason/.openclaw/workspaces/skingenius/training/fitzpatrick17k/model_output/best"
onnx_out = Path("./vit_fitzpatrick17k.onnx")

model = ViTForImageClassification.from_pretrained(model_path)
processor = ViTImageProcessor.from_pretrained(model_path)

# Dummy input matching preprocessor config (224×224, RGB)
dummy_input = torch.randn(1, 3, 224, 224)

# Export
torch.onnx.export(
    model,
    dummy_input,
    onnx_out,
    input_names=["pixel_values"],
    output_names=["logits"],
    dynamic_axes={"pixel_values": {0: "batch"}, "logits": {0: "batch"}},
    opset_version=14,  # GELU, LayerNorm support
    do_constant_folding=True,
)
print(f"ONNX saved to {onnx_out}")
```

**Validation:**
```bash
python -m onnxruntime.tools.check_onnx_model_static_shape vit_fitzpatrick17k.onnx
```

### Step 2: ONNX → TensorFlow SavedModel

```bash
onnx2tf -i vit_fitzpatrick17k.onnx -o vit_saved_model
```

Expected output:
```
INFO: onnx2tf - SavedModel output directory: vit_saved_model
INFO: onnx2tf - Conversion completed.
```

> **Gotcha:** `onnx2tf` sometimes generates `tf.keras.layers.LayerNormalization` that TFLite does not natively support in older TF versions. Ensure TF ≥ 2.15 so the TFLite converter fuses it.

### Step 3: SavedModel → TFLite (FP32 baseline)

```python
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model("vit_saved_model")
tflite_fp32 = converter.convert()

with open("vit_fitzpatrick17k_fp32.tflite", "wb") as f:
    f.write(tflite_fp32)

print(f"FP32 TFLite size: {len(tflite_fp32)/1024/1024:.1f} MB")
```

### Step 4: Dynamic-Range Quantization (quick win)

```python
converter = tf.lite.TFLiteConverter.from_saved_model("vit_saved_model")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_dynamic = converter.convert()

with open("vit_fitzpatrick17k_dynamic.tflite", "wb") as f:
    f.write(tflite_dynamic)

print(f"Dynamic-quant size: {len(tflite_dynamic)/1024/1024:.1f} MB")
```

**Expected:** ~85–90 MB (4× reduction from ~350 MB).

### Step 5: Full-Integer Quantization (INT8) — requires calibration

```python
import numpy as np
from PIL import Image

def representative_dataset():
    """
    Yield ~100–500 representative images.
    Use a subset of Fitzpatrick 17k validation images.
    """
    image_dir = "/path/to/fitzpatrick17k/val_subset"  # TODO: point to real data
    for img_path in sorted(Path(image_dir).glob("*.jpg"))[:200]:
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr = np.array(img, dtype=np.float32) / 255.0
        # Normalize with ViT preprocessor stats: mean=0.5, std=0.5
        arr = (arr - 0.5) / 0.5
        arr = np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)
        yield [arr]

converter = tf.lite.TFLiteConverter.from_saved_model("vit_saved_model")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_dataset

# Ensure all ops are INT8 (for Edge TPU / MCU compatibility; optional for mobile)
# converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
# converter.inference_input_type = tf.uint8   # or tf.int8
# converter.inference_output_type = tf.uint8  # or tf.int8

tflite_int8 = converter.convert()
with open("vit_fitzpatrick17k_int8.tflite", "wb") as f:
    f.write(tflite_int8)

print(f"INT8 TFLite size: {len(tflite_int8)/1024/1024:.1f} MB")
```

**Calibration rules:**
- Use **100–500** images minimum.
- Cover all **31 classes** and **Fitzpatrick III–VI** skin tones.
- Do **not** use purely random noise — that produces bad scale factors.

---

## 4. Quantization Accuracy Impact & Calibration

| Quantization | Size | Accuracy Impact (Typical) | Notes |
|--------------|------|---------------------------|-------|
| FP32 (baseline) | ~350 MB | — | Reference |
| FP16 | ~175 MB | **Negligible** (<0.1%) | Good for GPU delegate |
| Dynamic-range (weights INT8, activations float) | ~85–90 MB | **Small** (0.5–1.5%) | Fastest to implement |
| Full-integer INT8 | ~85–90 MB | **Small–Moderate** (1–3%) | Needs calibration dataset |
| INT16 activations / INT8 weights (experimental) | ~90 MB | **Minimal** (0.3–0.8%) | Slower, not hardware-accelerated yet |

**SKINgenius-specific risk:**
- Your model was trained on **Fitzpatrick III–VI** (darker skin tones). Ensure the calibration dataset reflects this distribution. A mismatched calibration set (e.g., mostly light skin) can skew quantization scales and drop accuracy on the target demographic.

**Recommended strategy:**
1. Convert FP32 baseline.
2. Convert dynamic-range quantized model.
3. Evaluate both on your **hold-out test set** (or a balanced subset).
4. If accuracy drop > 1.5%, switch to **full-integer with 300+ calibration images**.
5. If still unacceptable, consider **FP16** (2× size) and rely on GPU delegate speed.

---

## 5. TFLite Delegates: Android vs. iOS

### 5.1 Android

| Delegate | Status | Model Types | Notes |
|----------|--------|-------------|-------|
| **GPU (OpenCL / OpenGL ES)** | Active | FP32, FP16, INT8 | **Recommended primary delegate**. Up to 5× speedup. |
| **NNAPI** | **Deprecated** | — | Do **not** use for new code. Google recommends migrating to GPU or XNNPACK. |
| **XNNPACK** | Active | All | Fast CPU inference using ARM NEON. Good fallback. |
| **Hexagon DSP** | Deprecated | INT8 | For older Qualcomm devices without NNAPI. |

**Delegate selection code (Java / Kotlin):**
```kotlin
val compatList = CompatibilityList()
val gpuOptions = GpuDelegate.Options().apply {
    if (compatList.isDelegateSupportedOnThisDevice) {
        // Use GPU
    }
}
val gpuDelegate = GpuDelegate(gpuOptions)
val interpreter = Interpreter(model, Interpreter.Options().addDelegate(gpuDelegate))
```

### 5.2 iOS

| Delegate | Status | Model Types | Notes |
|----------|--------|-------------|-------|
| **Core ML** | Beta / Active | FP32, FP16 | **Recommended on A12+** (Neural Engine). Falls back to CPU on older devices. |
| **GPU (Metal)** | Active | FP32, FP16, INT8 | Fallback when Core ML is unavailable. |

**Delegate selection code (Swift):**
```swift
var delegate = CoreMLDelegate()
if delegate == nil {
    delegate = MetalDelegate()  // Fallback
}
let interpreter = try Interpreter(modelPath: modelPath, delegates: [delegate!])
```

> **Important:** Core ML delegate does **not** support INT8 models. If you choose INT8 for Android, you must ship a **FP32 or FP16** model for iOS Core ML, or fallback to the Metal GPU delegate on iOS (which does support INT8). See Section 10 for the dual-model strategy.

---

## 6. ViT Architecture Gotchas in TFLite

### 6.1 Attention Layers
- ViT uses **Multi-Head Self-Attention** (MatMul + Softmax). TFLite handles these fine, but:
  - **Softmax numerical stability:** TFLite’s quantized Softmax can have a reduced dynamic range. If your model has very sharp attention weights, INT8 may clip them.
  - **Large intermediate tensors:** The attention score matrix is `(batch, heads, 197, 197)` for 224×224 images with patch size 16. At FP32 this is ~0.6 MB per layer; at INT8 it’s ~0.15 MB. Still manageable on modern phones.

### 6.2 GELU Activation
- TFLite has a native `GELU` op (TF 2.10+), but older runtimes approximate it with `tanh` or `erf`. Ensure your **TFLite runtime** on the phone matches the TF version used for conversion, or accuracy may drift.
- **Mitigation:** After ONNX export, inspect the graph to ensure `GELU` is not decomposed into many tiny ops. `onnx2tf` usually preserves it as `tf.nn.gelu`.

### 6.3 Layer Normalization
- TFLite converter in TF ≥ 2.15 **fuses** `LayerNormalization` into a single op. Without this fusion, you get a scatter of `Mean`, `Sub`, `Mul`, `Add` ops, increasing latency and model size.

### 6.4 Input Shape
- ViT expects **NCHW** `(1, 3, 224, 224)` in PyTorch, but TFLite mobile interpreters often prefer **NHWC** `(1, 224, 224, 3)`.
- `onnx2tf` converts to NHWC by default. Double-check with Netron.
- If your TFLite model ends up NCHW, you will need to transpose inputs in JS, which is slow. Re-export with explicit NHWC if needed.

### 6.5 Classifier Head
- Your model has **31 output classes**. Ensure the final `FullyConnected` (Dense) layer is not accidentally quantized to INT8 if you need probability scores — though TFLite handles this fine.

---

## 7. Inference Latency Expectations

Benchmarks are indicative for **ViT-Base (86M params, 12 layers)**:

| Device Tier | Chip | FP32 CPU | INT8 CPU | FP16 GPU / CoreML | Notes |
|-------------|------|----------|----------|-------------------|-------|
| Mid Android | Snapdragon 7 Gen 1 / 778G | ~250 ms | ~120 ms | ~60 ms (Adreno GPU) | GPU delegate recommended |
| Mid Android | Snapdragon 7+ Gen 2 | ~200 ms | ~100 ms | ~50 ms | |
| Mid iOS | Apple A14 (iPhone 12) | ~180 ms | ~90 ms | ~40 ms (Neural Engine via CoreML) | CoreML on A12+ is excellent |
| High iOS | Apple A17 Pro | ~80 ms | ~40 ms | ~20 ms | |

**Target for SKINgenius:** Sub-200 ms on mid-tier devices. **Dynamic-range INT8 on CPU + GPU delegate** should comfortably hit this.

---

## 8. Preprocessing: JS vs. TFLite Model

Your `preprocessor_config.json` says:
- Resize to 224×224
- Rescale by `1/255`
- Normalize with `mean=0.5, std=0.5`

**Recommendation: Do it in JS** before passing the tensor to TFLite.

```javascript
// Expo example using expo-image-manipulator
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

async function preprocessImage(uri) {
  const resized = await manipulateAsync(
    uri,
    [{ resize: { width: 224, height: 224 } }],
    { format: SaveFormat.JPEG, base64: true }
  );
  // Decode base64 -> Uint8Array -> Float32Array
  const binary = Buffer.from(resized.base64, 'base64');
  // ... then use a small JS tensor library or plain arrays to normalize
  // mean=0.5, std=0.5  =>  pixel = (pixel/255 - 0.5) / 0.5
}
```

**Why not bake into TFLite?**
- TFLite does support `ResizeBilinear`, `Div`, `Sub`, `Mul` ops, but baking them adds ~3–4 ops to the graph and complicates updates.
- JS preprocessing gives you flexibility to add augmentation, cropping, or skin-segmentation masks later.

**Exception:** If you plan to share the model with non-JS backends (e.g., pure native Android app), include preprocessing in the model.

---

## 9. React Native / Expo TFLite Libraries

| Library | Expo Managed | Bare Workflow | TFLite Version | Notes |
|---------|--------------|---------------|----------------|-------|
| **`expo-tflite`** | ✅ Yes | ✅ Yes | LiteRT (TF 2.16+) | **Recommended for Expo SDK 50+**. Native module wrapper. |
| **`react-native-tflite`** | ❌ No | ✅ Yes | TF Lite 2.x | Community maintained. Good API. |
| **`react-native-fast-tflite`** | ❌ No | ✅ Yes | TF Lite 2.x | Claims speed, but verify iOS Metal delegate support. |
| **`@tensorflow/tfjs-react-native`** | ❌ No | ✅ Yes | TF.js (WebGL) | Slower; not recommended for ViT. |

**Recommended:**
- If you are in **Expo managed workflow**, use **`expo-tflite`** (or `expo` plugin for `react-native-tflite` if available).
- If you are in **bare workflow**, use **`react-native-tflite`** with manual delegate configuration in Android/iOS native code.

### Example: `expo-tflite` usage (conceptual)

```typescript
import { useTensorFlowModel } from 'expo-tflite';

const model = useTensorFlowModel(require('./assets/vit_fitzpatrick17k_int8.tflite'));

async function classify(imageData: Uint8Array) {
  const output = await model.run(imageData); // imageData must be preprocessed float32 NHWC
  return output[0]; // logits array of length 31
}
```

> **Note:** Verify that `expo-tflite` supports GPU/CoreML delegate options. As of early 2025, some wrappers only expose CPU. If so, patch the native module or switch to `react-native-tflite`.

---

## 10. Single Model vs. Dual-Model Strategy

### Option A: One TFLite Model (Dynamic-range / INT8)
- **Android:** Runs on CPU (XNNPACK) and GPU (if delegate supports INT8 — yes, GPU delegate does).
- **iOS:** Core ML delegate **does NOT support INT8**. You would fall back to Metal GPU delegate or CPU.
- **Verdict:** Acceptable if you are okay with iOS running on Metal/CPU.

### Option B: Dual Model (RECOMMENDED for best performance)
| Platform | Model | Delegate | Reason |
|----------|-------|----------|--------|
| Android | `vit_fitzpatrick17k_int8.tflite` | GPU + XNNPACK fallback | INT8 runs great on Adreno GPU and XNNPACK CPU. |
| iOS | `vit_fitzpatrick17k_fp16.tflite` | CoreML (Neural Engine) | CoreML requires FP32/FP16. FP16 is 2× smaller than FP32 with negligible accuracy loss. |

**Build pipeline:**
```bash
# Android model (INT8)
python convert_int8.py  # from Section 3, Step 5
mv vit_fitzpatrick17k_int8.tflite assets/models/android/

# iOS model (FP16)
python convert_fp16.py  # from Section 3, add converter.target_spec.supported_types = [tf.float16]
mv vit_fitzpatrick17k_fp16.tflite assets/models/ios/
```

**Packaging:**
Use React Native platform-specific `require`:
```typescript
const modelPath = Platform.OS === 'android'
  ? require('./assets/models/android/vit_fitzpatrick17k_int8.tflite')
  : require('./assets/models/ios/vit_fitzpatrick17k_fp16.tflite');
```

---

## 11. Risk Assessment & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-------------|------------|
| **Optimum direct TFLite fails for ViT** | High | High | Use **ONNX → SavedModel → TFLite** pipeline. |
| **INT8 quantization drops accuracy >2% on darker skin tones** | High | Medium | Calibrate with **Fitzpatrick III–VI** images. Evaluate per-Fitzpatrick group. |
| **GELU/LayerNorm not fused → slow inference** | Medium | Medium | Ensure TF ≥ 2.15. Validate with Netron. |
| **CoreML delegate rejected on iOS < A12** | Medium | Low | Fallback to Metal delegate in code. |
| **Expo wrapper lacks GPU delegate** | Medium | Medium | Patch native module or switch to bare workflow + `react-native-tflite`. |
| **Model size >100 MB app store limit (if not split)** | Medium | Low | Use **App Bundle / Dynamic Delivery** on Android; **On-Demand Resources** on iOS. Or host model on server for first launch. |
| **NCHW vs NHWC mismatch** | Medium | Medium | Verify with Netron. Transpose in JS if needed, or re-export. |
| **Privacy: skin photos on-device** | Low | N/A | On-device inference is a **privacy win**. No mitigation needed; highlight in marketing. |

---

## 12. Testing & Validation Checklist

- [ ] ONNX model runs in `onnxruntime` and logits match PyTorch (max diff < 1e-4).
- [ ] TFLite FP32 model runs in Python `tf.lite.Interpreter` and logits match ONNX.
- [ ] Dynamic-range model size ≈ 85–90 MB.
- [ ] INT8 model size ≈ 85–90 MB.
- [ ] Evaluate FP32, dynamic, INT8 on **balanced test set** (31 classes, all Fitzpatrick types).
- [ ] Accuracy drop **< 1.5%** acceptable; **> 2%** → investigate calibration or switch to FP16.
- [ ] Benchmark latency on physical devices (not emulator).
- [ ] Verify delegate initialization logs on Android (`GpuDelegate`) and iOS (`CoreMLDelegate`).
- [ ] Test app with model loaded from local asset and from remote URL (for on-demand delivery).

---

## 13. Quick Command Reference

```bash
# 1. Env setup
pip install transformers optimum[onnx] onnx onnxruntime onnx2tf tensorflow>=2.15.0 pillow

# 2. ONNX export (Python script in Section 3, Step 1)
python export_vit_onnx.py

# 3. SavedModel
onnx2tf -i vit_fitzpatrick17k.onnx -o vit_saved_model

# 4. TFLite FP32
python convert_fp32.py

# 5. TFLite Dynamic-range
python convert_dynamic.py

# 6. TFLite INT8 (needs calibration data path)
python convert_int8.py

# 7. TFLite FP16 (iOS CoreML)
python convert_fp16.py

# 8. Verify with Netron (visual graph inspection)
netron vit_fitzpatrick17k_int8.tflite

# 9. Android benchmark (push to device)
adb push vit_fitzpatrick17k_int8.tflite /data/local/tmp/
adb shell /data/local/tmp/benchmark_model \
  --graph=/data/local/tmp/vit_fitzpatrick17k_int8.tflite \
  --num_threads=4 --use_gpu=true
```

---

## 14. Links & Further Reading

- [HuggingFace Optimum TFLite Docs](https://huggingface.co/docs/optimum/exporters/tflite/overview)
- [HuggingFace Transformers ONNX Export](https://huggingface.co/docs/transformers/v4.46.0/en/tflite)
- [TensorFlow Lite Post-Training Quantization](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/lite/g3doc/performance/post_training_quantization.md)
- [TensorFlow Lite Delegates Overview](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/lite/g3doc/performance/delegates.md)
- [CoreML Delegate](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/lite/g3doc/performance/coreml_delegate.md)
- [GPU Delegate](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/lite/g3doc/performance/gpu.md)
- [Expo TFLite (if available in SDK)](https://docs.expo.dev/versions/latest/sdk/tflite/)
- [react-native-tflite](https://github.com/expo/expo/tree/main/packages/expo-tflite) (if community package)

---

*Document version: 1.0 — 2025-05-30*
*Author: SKINgenius AI (sub-agent review)*
*Next step: Execute Step 1–3 in the training environment, validate logits, then proceed to quantization.*

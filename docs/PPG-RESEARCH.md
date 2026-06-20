# PPG (Photoplethysmography) Technical Research Report

## For SKINgenius: Smartphone-Based Face Video Analysis for Skin Health

**Date:** May 30, 2026  
**Research Areas Covered:**
1. PPG Signal Extraction from Face Video
2. Vital Signs Extraction Accuracy
3. Skin Tone Calibration (CRITICAL)
4. Open Source Libraries & On-Device Models
5. Competitive Landscape

---

## 1. PPG Signal Extraction from Face Video

### 1.1 How Face-Based PPG Works

Remote photoplethysmography (rPPG) detects volumetric variations in blood using video cameras. When body tissues are illuminated by surrounding light, tiny fluctuations in reflected light intensities due to variations in hemoglobin concentration can be captured by conventional cameras, producing the rPPG signal.

**Core Principle:**
- Blood volume changes in the microvascular bed cause minute color changes in the skin
- These changes are imperceptible to the human eye but detectable by digital cameras
- The green channel contains the strongest PPG signal due to hemoglobin absorption characteristics
- Red and blue channels contain additional information that can be used for motion artifact removal

**Pipeline:**
1. Face detection and ROI (Region of Interest) extraction
2. Spatial averaging of skin pixels to reduce noise
3. Temporal signal extraction from RGB channels
4. Signal processing (detrending, bandpass filtering)
5. Algorithmic transformation (POS, CHROM, ICA, or LGI)
6. Heart rate extraction via peak detection or frequency analysis

### 1.2 Best Algorithms: POS, CHROM, ICA, LGI

Based on the literature review (PMC11161609, De Haan et al., Wang et al.), the following algorithms are the gold standard:

| Algorithm | Year | Method | Best For |
|-----------|------|--------|----------|
| **POS** (Plane-Orthogonal-to-Skin) | 2016 | Blind source separation projecting onto skin-tone-orthogonal plane | **Mobile/Real-time** |
| **CHROM** (Chrominance) | 2013 | Chrominance-based color space projection | Motion robustness |
| **ICA** (Independent Component Analysis) | 1994 | Statistical signal separation | Signal quality |
| **LGI** (Local Group Invariance) | 2018 | Local gradient invariance | Complex motion |

**POS Algorithm (Recommended for SKINgenius):**
```python
import numpy as np

def pos_algorithm(r, g, b, fps=30):
    """
    Plane-Orthogonal-to-Skin (POS) algorithm for rPPG.
    r, g, b: 1D numpy arrays of average RGB values over time.
    """
    # Detrending
    r = detrend(r)
    g = detrend(g)
    b = detrend(b)
    
    # Normalization
    r = normalize(r)
    g = normalize(g)
    b = normalize(b)
    
    # Temporal projection
    # POS uses 2.0 * g - r - b as the primary signal projection
    pos_signal = 2.0 * g - r - b
    
    # Bandpass filter for heart rate range (0.65 - 4 Hz = 39-240 BPM)
    pos_signal = bandpass_filter(pos_signal, 0.65, 4.0, fps)
    
    return pos_signal

def detrend(signal, lambda_param=100):
    """Smoothness priors approach for detrending."""
    T = len(signal)
    I = np.eye(T)
    D2 = np.diff(I, n=2, axis=0)
    trend = np.linalg.solve(I + lambda_param**2 * D2.T @ D2, signal)
    return signal - trend

def normalize(signal):
    """Zero-mean, unit-variance normalization."""
    return (signal - np.mean(signal)) / np.std(signal)

def bandpass_filter(signal, low, high, fps, order=6):
    """Butterworth bandpass filter."""
    from scipy.signal import butter, filtfilt
    nyquist = fps / 2.0
    low_norm = low / nyquist
    high_norm = high / nyquist
    b, a = butter(order, [low_norm, high_norm], btype='band')
    return filtfilt(b, a, signal)
```

**CHROM Algorithm (More Robust to Motion):**
```python

def chrom_algorithm(r, g, b, fps=30):
    """
    CHROM (Chrominance) algorithm for rPPG.
    Separates color information related to blood flow.
    """
    # Temporal normalization
    r_norm = r / np.mean(r) - 1
    g_norm = g / np.mean(g) - 1
    b_norm = b / np.mean(b) - 1
    
    # Chrominance components
    X = 3 * r_norm - 2 * g_norm
    Y = 1.5 * r_norm + g_norm - 1.5 * b_norm
    
    # Standard deviation-based alpha tuning
    alpha = np.std(X) / np.std(Y)
    
    # Final signal
    chrom_signal = X - alpha * Y
    
    # Bandpass filter
    chrom_signal = bandpass_filter(chrom_signal, 0.65, 4.0, fps)
    
    return chrom_signal
```

### 1.3 Minimum Video Duration

| Parameter | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| Heart Rate | 10 seconds | 30 seconds | 60 seconds |
| HRV (Stress) | 60 seconds | 2 minutes | 5 minutes |
| SpO2 | 30 seconds | 60 seconds | 90 seconds |
| Respiratory Rate | 30 seconds | 60 seconds | 120 seconds |

**Key Finding:**
- For heart rate, 10-second windows can yield acceptable accuracy
- For HRV (stress analysis), at least 60 seconds required for frequency-domain analysis
- Welch's method for frequency analysis performs best with 30+ second windows

### 1.4 Camera Requirements

| Parameter | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| Resolution | 320x240 | 640x480 | 1080p |
| Frame Rate | 15 fps | 30 fps | 60 fps |
| Color Depth | RGB24 | RGB24 | RGB24 |
| Lighting | >50 lux | 200-500 lux | 500+ lux (diffuse) |
| Exposure | Auto | Fixed preferred | Fixed, low gain |

**Critical Notes:**
- Higher frame rates improve temporal resolution for HRV analysis
- Fixed exposure prevents artifacts from auto-exposure adjustments
- Diffuse, even lighting reduces specular reflections
- Face should occupy at least 20% of frame for adequate ROI size

---

## 2. Vital Signs from PPG

### 2.1 Heart Rate Accuracy Benchmarks

| Method | Dataset | MAE (bpm) | RMSE (bpm) | Correlation (r) |
|--------|---------|-----------|------------|-----------------|
| POS | PURE | 2-3 | 3-4 | 0.95 |
| POS | LGI-PPGI | 5-6 | 7-8 | 0.85 |
| CHROM | PURE | 2-3 | 3-4 | 0.94 |
| CHROM | LGI-PPGI | 5-7 | 7-9 | 0.83 |
| ML-based (LSTM) | PURE | **0.52** | 1.2 | **0.99** |
| ML-based (LSTM) | MR-NIRP | 7.45 | 9.1 | 0.84 |

**Key Paper:** PMC11161609 (Communications Medicine, 2024) - Machine learning-based rPPG construction using LSTM networks achieved state-of-the-art results.

### 2.2 SpO2 from Face Alone — Feasibility

**Answer: YES, but with caveats.**

**Research Finding (PMC10968547, 2024):**
- Deep learning models can estimate SpO2 from facial videos
- Best results: MAE = 1.274%, RMSE = 1.710% (EfficientNet-B3 + RGB)
- This EXCEEDS the international standard of 4% for approved pulse oximeters
- Traditional "Ratio of Ratios" method performs poorly (RMSE: 2.5-5.1%)

**Technical Approach:**
```
1. Generate Spatial-Temporal Maps (STMaps) from face video
2. Split face into 64 patches (8x8 grid)
3. Average pool each patch temporally
4. Feed STMap into CNN (ResNet-50, DenseNet-121, or EfficientNet-B3)
5. Predict single SpO2 value
```

**Limitations:**
- Requires training on diverse skin tones
- VIPL-HR dataset (used in research) mostly Fitzpatrick III-IV (Asian subjects)
- Performance on darker skin (Fitzpatrick V-VI) remains underexplored
- Requires controlled lighting conditions

### 2.3 Respiratory Rate Accuracy

- Respiratory rate can be extracted from rPPG via:
  - Amplitude modulation of PPG signal
  - Frequency analysis in 0.1-0.5 Hz range (6-30 breaths/min)
  - Baseline wander extraction
- Accuracy: ±2-3 breaths/min in controlled conditions
- Challenging during physical activity

### 2.4 Blood Pressure — Partial Feasibility

**Current State:**
- Research stage only (PMC11161609, Frey et al. 2022)
- PPG waveform morphology correlates with BP
- Deep learning models (PPG2ABP) show promise but require calibration
- **NOT ready for standalone use**
- Requires initial calibration with cuff-based device
- Features: pulse transit time, pulse wave velocity, waveform morphology

### 2.5 Stress via HRV Analysis

**HRV Metrics from rPPG (PMC10376629):**

| Metric | Time Domain | Frequency Domain | Unit |
|--------|-------------|------------------|------|
| SDNN | Std dev of NN intervals | - | ms |
| RMSSD | Root mean square of successive differences | - | ms |
| pNN50 | % of intervals >50ms different | - | % |
| LF Power | - | 0.04-0.15 Hz | ms² |
| HF Power | - | 0.15-0.4 Hz | ms² |
| LF/HF Ratio | - | LF/HF | ratio |

**Stress Indicators:**
- Low HF power: Increased sympathetic activity
- High LF/HF ratio: Stress/anxiety state
- Low RMSSD: Reduced parasympathetic activity

**Research Finding:**
- rPPG-derived HRV correlates with ECG-derived HRV (r > 0.85)
- Requires stable 60-120 second recordings
- Motion artifacts significantly degrade accuracy

---

## 3. Skin Tone Calibration (CRITICAL)

### 3.1 Why PPG Accuracy Degrades on Darker Skin

**Core Problem: Melanin Absorption**

| Wavelength | Melanin Absorption | Hemoglobin Absorption |
|------------|-------------------|----------------------|
| Green (525nm) | **HIGH** | Moderate |
| Red (660nm) | Moderate | Moderate |
| Infrared (940nm) | **LOW** | Low |

**Mechanism:**
1. Melanin in epidermis absorbs incident light (particularly green/blue)
2. Less light reaches the dermal vascular bed
3. Reduced signal-to-noise ratio in detected PPG signal
4. Weaker pulsatile component relative to DC baseline
5. Algorithmic amplification increases noise

**Research Evidence (PMC12592569, 2025):**
- Apple Watch: <5 bpm variation across skin tones
- Other brands (WearOS): 10-15 bpm underestimation at rest, >20% error during activity
- Garmin/Fitbit: Error rates up to 20% during cycling in darker-skinned users
- Smartwatch PPG bias confirmed across 23 studies (PRISMA review)

**Phantom Study (PMC12646468, 2025):**
- In vitro vascular finger phantom with tunable skin pigmentation
- Statistically significant differences (p<0.001) between skin tones
- Signal degradation increases with skin pigmentation
- Green wavelength most affected

### 3.2 Calibration Methods for Diverse Fitzpatrick Types

**Fitzpatrick Scale Overview:**
| Type | Description | Melanin Level |
|------|-------------|---------------|
| I | Very fair, always burns | Very low |
| II | Fair, usually burns | Low |
| III | Medium, sometimes burns | Moderate |
| IV | Olive, rarely burns | Moderate-High |
| V | Brown, very rarely burns | High |
| VI | Dark brown/black, never burns | Very high |

**Calibration Approaches:**

#### A. Algorithm-Level Calibration
```python

def adaptive_skin_tone_calibration(r, g, b, fps=30):
    """
    Adaptive calibration based on skin tone classification.
    Uses luminance to estimate melanin content and adjust algorithm weights.
    """
    # Calculate skin luminance (perceived brightness)
    luminance = 0.299 * r + 0.587 * g + 0.114 * b
    mean_luminance = np.mean(luminance)
    
    # Normalize luminance to 0-1 scale (0=dark, 1=light)
    # Typical camera range: dark skin ~40-80, light skin ~150-200
    skin_tone_score = np.clip((mean_luminance - 40) / 160, 0, 1)
    
    # Adaptive POS weights based on skin tone
    # Darker skin: increase red/infrared influence, reduce green
    # Lighter skin: standard green-based approach
    
    if skin_tone_score < 0.3:  # Dark skin (Fitzpatrick V-VI)
        # Use more red channel, less green
        alpha = 0.5  # Reduce green emphasis
        beta = 1.5   # Increase red emphasis
        gamma = 1.0
    elif skin_tone_score < 0.7:  # Medium skin (Fitzpatrick III-IV)
        # Balanced approach
        alpha = 1.0
        beta = 1.0
        gamma = 1.0
    else:  # Light skin (Fitzpatrick I-II)
        # Standard green emphasis
        alpha = 2.0
        beta = 0.5
        gamma = 0.5
    
    # Adaptive POS projection
    signal = alpha * g - beta * r - gamma * b
    
    # Bandpass filter
    signal = bandpass_filter(signal, 0.65, 4.0, fps)
    
    return signal, skin_tone_score
```

#### B. Signal Amplification for Dark Skin
```python

def melanin_compensated_amplification(signal, skin_tone_score):
    """
    Apply compensated amplification based on estimated melanin content.
    Uses noise-aware amplification to avoid amplifying noise.
    """
    if skin_tone_score < 0.3:
        # Estimate signal quality (SNR)
        signal_power = np.var(signal)
        noise_power = estimate_noise_power(signal)
        snr = signal_power / noise_power
        
        # Only amplify if SNR is acceptable
        if snr > 2.0:
            # Compensate for melanin absorption (up to 3x)
            amplification = 1.0 + (1.0 - skin_tone_score) * 2.0
            # Apply with soft clipping to prevent distortion
            amplified = np.clip(signal * amplification, -3, 3)
            return amplified
    
    return signal
```

#### C. Multi-Wavelength Approach
```python

def multi_wavelength_ppg(r, g, b, skin_tone_score):
    """
    Use different wavelength combinations based on skin tone.
    Darker skin benefits from red+infrared, lighter from green.
    """
    if skin_tone_score < 0.3:
        # For dark skin: red-dominant signal
        # Red light penetrates deeper, less melanin absorption
        primary_signal = r
        secondary_signal = g
        weights = [0.6, 0.3, 0.1]  # [R, G, B]
    elif skin_tone_score > 0.7:
        # For light skin: green-dominant signal
        primary_signal = g
        secondary_signal = r
        weights = [0.2, 0.7, 0.1]
    else:
        # Medium skin: balanced
        primary_signal = 0.5 * g + 0.5 * r
        weights = [0.3, 0.6, 0.1]
    
    return primary_signal, weights
```

### 3.3 Adaptive Algorithms

**Key Research: PMC12297079 (2025)**
- Face region selection matters significantly for rPPG
- Forehead and cheeks provide best signals
- Optimal face region varies by skin tone
- "The role of face regions in remote photoplethysmography"

**Adaptive Region Selection:**
```python

def adaptive_roi_selection(frame, face_landmarks, skin_tone_score):
    """
    Select optimal face regions based on skin tone.
    Darker skin: prefer regions with thinner epidermis (temples, under-eye)
    Lighter skin: forehead and cheeks work well.
    """
    if skin_tone_score < 0.3:
        # Dark skin: Use multiple small regions to average out noise
        rois = [
            face_landmarks['temple_left'],
            face_landmarks['temple_right'],
            face_landmarks['forehead_center'],
            face_landmarks['under_eye_left'],
            face_landmarks['under_eye_right'],
        ]
        # Average signals from all regions
        roi_weights = np.ones(len(rois)) / len(rois)
    else:
        # Light/medium skin: Standard forehead + cheeks
        rois = [
            face_landmarks['forehead'],
            face_landmarks['left_cheek'],
            face_landmarks['right_cheek'],
        ]
        roi_weights = [0.5, 0.25, 0.25]
    
    return rois, roi_weights
```

### 3.4 Published Research on PPG Fairness

**Key Papers:**
1. **PMC12592569** (2025) - "Photoplethysmography in Diverse Skin Tones" - Comprehensive PRISMA review of 23 studies showing systematic bias
2. **PMC12646468** (2025) - "Evaluation of skin pigmentation effect on PPG signals" - In vitro phantom study proving measurable impact
3. **PMC11983641** (2025) - "Investigating the accuracy of Garmin PPG sensors on differing skin types" - Device-specific bias quantification
4. **PMC8175478** (2021) - "Evaluation of biases in remote photoplethysmography methods" - Algorithmic bias analysis

**Key Findings:**
- Bias is not uniform across devices: Apple Watch <5 bpm error, others 10-20%
- Green light (used by most wearables) most affected by melanin
- Red and infrared light less affected, suggesting hardware solutions
- Algorithmic solutions (adaptive calibration, multi-wavelength) show promise
- **Standardized validation by Fitzpatrick type is essential**

---

## 4. Open Source Libraries & On-Device Models

### 4.1 Python Libraries

#### **pyVHR** (Recommended for Research)
- **Repo:** https://github.com/phuselab/pyVHR
- **Paper:** PMC9044207 (PeerJ Computer Science, 2022)
- **Features:**
  - Complete rPPG pipeline
  - Face detection via MediaPipe
  - Multiple algorithms (POS, CHROM, LGI, ICA)
  - HRV analysis
  - Dataset evaluation tools
  
```bash
pip install pyvhr
```

```python
from pyVHR.analysis.pipeline import Pipeline
import matplotlib.pyplot as plt

# Initialize pipeline
pipe = Pipeline()

# Run on video
result = pipe.run_on_video(
    videoFile='face_video.mp4',
    method='pos',  # 'pos', 'chrom', 'ica', 'lgi'
    cuda=True,
    roi_method='convexhull',  # 'convexhull', 'faceparsing'
    roi_approach='holistic'   # 'holistic', 'patches'
)

# Extract heart rate
hr = result['hr']
time = result['time']

plt.plot(time, hr)
plt.xlabel('Time (s)')
plt.ylabel('Heart Rate (bpm)')
plt.show()
```

#### **yarppg** (Lightweight, Real-time)
- **Repo:** https://github.com/SamProell/yarppg
- **Features:**
  - Real-time rPPG from webcam
  - Simple, clean codebase
  - Qt-based GUI
  - Multiple algorithms

```bash
pip install yarppg
```

```python
import yarppg

# Simple usage
rppg = yarppg.RPPG()
rppg.set_source(0)  # Webcam
rppg.set_processor('pos')  # or 'chrom', 'green'

for frame in rppg.get_frames():
    hr = rppg.get_heart_rate()
    print(f"HR: {hr:.1f} bpm")
```

#### **PythonVideoPulserate** (CHROM Implementation)
- **Repo:** https://github.com/MartinChristiaan/PythonVideoPulserate
- **Features:**
  - CHROM method implementation
  - Real-time GUI
  - .MAT file export for MATLAB analysis
  - HSV skin classification

#### **open-rppg** (Deep Learning)
- **Repo:** https://github.com/KegangWangCCNU/open-rppg
- **Features:**
  - Deep learning-based rPPG
  - End-to-end neural network approaches
  - Modern architectures

### 4.2 MediaPipe Face Mesh Integration

MediaPipe provides 468 face landmarks, enabling precise ROI selection:

```python
import mediapipe as mp
import cv2
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Key landmarks for rPPG ROI
FOREHEAD_LANDMARKS = [107, 66, 69, 109, 10, 338, 299, 296, 336, 9]
LEFT_CHEEK_LANDMARKS = [118, 119, 100, 126, 209, 49, 129, 203, 205, 50]
RIGHT_CHEEK_LANDMARKS = [347, 348, 329, 355, 429, 279, 358, 423, 425, 280]

def extract_roi_pixels(frame, landmarks, target_landmarks):
    """Extract pixels from specific face regions."""
    h, w = frame.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    
    points = []
    for idx in target_landmarks:
        landmark = landmarks.landmark[idx]
        x = int(landmark.x * w)
        y = int(landmark.y * h)
        points.append([x, y])
    
    points = np.array(points)
    cv2.fillConvexPoly(mask, points, 255)
    
    # Extract pixels
    roi_pixels = frame[mask > 0]
    return roi_pixels

def get_face_rgb_signals(frame):
    """Extract average RGB from face ROIs."""
    results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    
    if not results.multi_face_landmarks:
        return None
    
    landmarks = results.multi_face_landmarks[0]
    
    # Get forehead pixels
    forehead_pixels = extract_roi_pixels(frame, landmarks, FOREHEAD_LANDMARKS)
    
    # Get cheek pixels
    left_cheek = extract_roi_pixels(frame, landmarks, LEFT_CHEEK_LANDMARKS)
    right_cheek = extract_roi_pixels(frame, landmarks, RIGHT_CHEEK_LANDMARKS)
    
    # Average all skin pixels
    all_skin = np.vstack([forehead_pixels, left_cheek, right_cheek])
    
    r = np.mean(all_skin[:, 2])  # BGR in OpenCV
    g = np.mean(all_skin[:, 1])
    b = np.mean(all_skin[:, 0])
    
    return r, g, b
```

### 4.3 JavaScript/Browser Implementation

For web-based SKINgenius app:

```javascript
class RPPGProcessor {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvas.getContext('2d');
        this.rValues = [];
        this.gValues = [];
        this.bValues = [];
        this.maxSamples = 300; // 10 seconds at 30fps
        
        // Use MediaPipe Face Mesh via CDN
        this.faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
    }
    
    async start() {
        this.faceMesh.onResults(this.onResults.bind(this));
        this.processFrame();
    }
    
    onResults(results) {
        if (!results.multiFaceLandmarks) return;
        
        const landmarks = results.multiFaceLandmarks[0];
        
        // Extract forehead ROI (simplified)
        const foreheadLandmarks = [10, 109, 67, 103, 54];
        const pixels = this.getRegionPixels(landmarks, foreheadLandmarks);
        
        // Calculate average RGB
        let r = 0, g = 0, b = 0;
        for (const pixel of pixels) {
            r += pixel[0];
            g += pixel[1];
            b += pixel[2];
        }
        r /= pixels.length;
        g /= pixels.length;
        b /= pixels.length;
        
        // Store values
        this.rValues.push(r);
        this.gValues.push(g);
        this.bValues.push(b);
        
        // Keep fixed window
        if (this.rValues.length > this.maxSamples) {
            this.rValues.shift();
            this.gValues.shift();
            this.bValues.shift();
        }
        
        // Calculate heart rate every 1 second
        if (this.gValues.length >= 90) { // 3 seconds minimum
            const hr = this.calculateHeartRate();
            this.onHeartRateUpdate(hr);
        }
    }
    
    calculateHeartRate() {
        // Apply POS algorithm
        const signal = this.applyPOS();
        
        // Find dominant frequency
        const fft = this.fft(signal);
        const freqs = this.getFrequencies();
        
        // Find peak in 0.65-4 Hz range (39-240 BPM)
        let maxPower = 0;
        let peakFreq = 0;
        
        for (let i = 0; i < freqs.length; i++) {
            if (freqs[i] >= 0.65 && freqs[i] <= 4.0) {
                if (fft[i] > maxPower) {
                    maxPower = fft[i];
                    peakFreq = freqs[i];
                }
            }
        }
        
        return peakFreq * 60; // Convert to BPM
    }
    
    applyPOS() {
        const r = this.normalize(this.detrend(this.rValues));
        const g = this.normalize(this.detrend(this.gValues));
        const b = this.normalize(this.detrend(this.bValues));
        
        // POS projection
        const signal = g.map((gi, i) => 2 * gi - r[i] - b[i]);
        
        // Simple bandpass (can be improved with proper filter)
        return this.movingAverage(signal, 5); // Very simplified
    }
    
    normalize(signal) {
        const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
        const std = Math.sqrt(signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length);
        return signal.map(v => (v - mean) / std);
    }
    
    detrend(signal) {
        // Simple linear detrending
        const n = signal.length;
        const x = Array.from({length: n}, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = signal.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((a, b, i) => a + b * signal[i], 0);
        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return signal.map((y, i) => y - (slope * i + intercept));
    }
    
    async processFrame() {
        if (this.video.readyState >= 2) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.ctx.drawImage(this.video, 0, 0);
            await this.faceMesh.send({image: this.canvas});
        }
        requestAnimationFrame(() => this.processFrame());
    }
    
    getRegionPixels(landmarks, indices) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const pixels = [];
        
        for (const idx of indices) {
            const lm = landmarks[idx];
            const x = Math.floor(lm.x * w);
            const y = Math.floor(lm.y * h);
            
            // Get pixel data around landmark
            const imageData = this.ctx.getImageData(x-5, y-5, 10, 10);
            for (let i = 0; i < imageData.data.length; i += 4) {
                pixels.push([
                    imageData.data[i],     // R
                    imageData.data[i + 1], // G
                    imageData.data[i + 2]  // B
                ]);
            }
        }
        
        return pixels;
    }
    
    fft(signal) {
        // Use a library like dsp.js or implement Cooley-Tukey
        // Simplified placeholder
        return signal; // Replace with actual FFT
    }
    
    getFrequencies() {
        const fs = 30; // 30 fps
        const n = this.maxSamples;
        return Array.from({length: n}, (_, i) => i * fs / n);
    }
    
    movingAverage(signal, window) {
        const result = [];
        for (let i = 0; i < signal.length; i++) {
            const start = Math.max(0, i - window + 1);
            const subset = signal.slice(start, i + 1);
            result.push(subset.reduce((a, b) => a + b, 0) / subset.length);
        }
        return result;
    }
    
    onHeartRateUpdate(hr) {
        console.log(`Heart Rate: ${hr.toFixed(1)} BPM`);
        // Dispatch event or callback
    }
}

// Usage
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const rppg = new RPPGProcessor(video, canvas);
rppg.start();
```

### 4.4 TensorFlow Lite On-Device Models

For mobile deployment (SKINgenius app):

**Approach: Convert trained model to TFLite**

```python
import tensorflow as tf

# Train a lightweight model (example with EfficientNet-B0 backbone)
def create_rppg_model(input_shape=(128, 128, 3)):
    base_model = tf.keras.applications.EfficientNetB0(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base
    base_model.trainable = False
    
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(1)  # Predict HR
    ])
    
    return model

# Convert to TFLite for mobile
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]  # Quantization

tflite_model = converter.convert()

with open('rppg_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

**Android Integration:**
```java
// Load TFLite model
Interpreter tflite = new Interpreter(loadModelFile("rppg_model.tflite"));

// Preprocess camera frame
float[][][][] input = preprocessFrame(cameraFrame);

// Run inference
float[][] output = new float[1][1];
tflite.run(input, output);

float heartRate = output[0][0];
```

### 4.5 Reference Implementations Summary

| Library | Language | Real-time | Algorithms | Best For |
|---------|----------|-----------|------------|----------|
| pyVHR | Python | Yes | POS, CHROM, ICA, LGI | Research, prototyping |
| yarppg | Python | Yes | POS, CHROM, Green | Lightweight, educational |
| PythonVideoPulserate | Python | Yes | CHROM | GUI, offline analysis |
| open-rppg | Python | No | Deep Learning | SOTA accuracy |
| MediaPipe + Custom | JS/Python | Yes | Custom | Web/mobile integration |

---

## 5. Competitive Landscape

### 5.1 YOU(th) Health Tech

- **Approach:** Face video PPG for vital signs
- **Technology:** Proprietary rPPG algorithms + deep learning
- **Website:** https://www.youth-healthtech.com
- **Products:** Contactless health monitoring SDK
- **Status:** Active commercial solution

### 5.2 Apple Watch

- **Technology:** Green LED PPG + infrared + electrical heart sensor
- **Features:**
  - Heart rate (resting, workout, recovery)
  - ECG (electrical, not optical)
  - Blood oxygen (Series 6+)
  - Irregular rhythm notifications
- **Accuracy:** <5 bpm variation across skin tones (PMC12592569)
- **Limitation:** Contact-based, requires device purchase

### 5.3 Samsung Health

- **Technology:** Green LED PPG (Galaxy Watch)
- **Features:**
  - Heart rate
  - SpO2
  - Blood pressure (calibration required)
  - Body composition
- **Accuracy:** Variable by model; some WearOS devices show 10-15 bpm bias

### 5.4 Google Health / Fitbit

- **Technology:** PurePulse (green LED PPG)
- **Features:**
  - 24/7 heart rate
  - Active Zone Minutes
  - SpO2 (some models)
  - Stress Score (HRV-based)
- **Accuracy:** Up to 20% error during activity in darker skin (PMC12592569)

### 5.5 PanopticAI (Research)

- **Approach:** Contactless SpO2 from face video
- **Paper:** PMC10968547 (2024)
- **Results:** MAE 1.274% SpO2, exceeds pulse oximeter standard
- **Technology:** EfficientNet-B3 + Spatial-Temporal Maps

### 5.6 State of the Art Summary

| Company | Contactless | SpO2 | HR | HRV | BP | Skin Tone Aware |
|---------|-------------|------|-----|-----|-----|----------------|
| YOU(th) Health Tech | Yes | Yes | Yes | ? | ? | ? |
| Apple | No | Yes | Yes | Yes | No | Partial |
| Samsung | No | Yes | Yes | Yes | Partial | Partial |
| Google/Fitbit | No | Yes | Yes | Yes | No | Partial |
| PanopticAI | Yes | Yes | Yes | ? | ? | No |
| **SKINgenius (Target)** | **Yes** | **Yes** | **Yes** | **Yes** | **Research** | **Yes** |

---

## 6. Implementation Recommendations for SKINgenius

### 6.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SKINgenius App                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Camera Input │→ │ Face Detect  │→ │  ROI Extract │      │
│  │   (WebRTC)   │  │  (MediaPipe) │  │ (Landmarks)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Skin Tone    │→ │ rPPG Signal  │→ │ Vital Signs  │      │
│  │ Classifier   │  │ Extraction   │  │  Extractor   │      │
│  │(Luminance-   │  │(POS/CHROM)   │  │(HR/SpO2/HRV) │      │
│  │  based)      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                                                    │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ Calibration  │→ │  Display &   │                          │
│  │  Engine      │  │   Store      │                          │
│  │(Fitzpatrick  │  │ (Dashboard)  │                          │
│  │  Adaptive)   │  │              │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Phase 1: MVP (Heart Rate + Skin Tone Calibration)

**Timeline:** 4-6 weeks

**Components:**
1. **MediaPipe Face Mesh** integration for face detection
2. **POS Algorithm** for rPPG signal extraction
3. **Skin Tone Classifier** based on face luminance
4. **Adaptive Calibration** weights based on Fitzpatrick estimation
5. **Heart Rate** extraction via FFT peak detection

**Code Skeleton:**
```python
class SKINgeniusPPG:
    def __init__(self):
        self.fps = 30
        self.buffer_size = 300  # 10 seconds
        self.r_buffer = CircularBuffer(self.buffer_size)
        self.g_buffer = CircularBuffer(self.buffer_size)
        self.b_buffer = CircularBuffer(self.buffer_size)
        self.face_mesh = mp.solutions.face_mesh.FaceMesh()
        
    def process_frame(self, frame):
        # Detect face and extract ROIs
        face_data = self.detect_face(frame)
        if not face_data:
            return None
        
        # Extract average RGB from skin regions
        r, g, b = self.extract_skin_rgb(frame, face_data)
        
        # Estimate skin tone (Fitzpatrick proxy)
        skin_tone = self.estimate_skin_tone(r, g, b)
        
        # Store in buffers
        self.r_buffer.push(r)
        self.g_buffer.push(g)
        self.b_buffer.push(b)
        
        # Calculate vital signs if enough data
        if self.g_buffer.is_full():
            hr = self.calculate_heart_rate(skin_tone)
            return {
                'heart_rate': hr,
                'skin_tone_score': skin_tone,
                'signal_quality': self.estimate_quality()
            }
        
        return None
    
    def calculate_heart_rate(self, skin_tone):
        # Get buffered signals
        r = self.r_buffer.get_all()
        g = self.g_buffer.get_all()
        b = self.b_buffer.get_all()
        
        # Apply adaptive POS based on skin tone
        signal = self.adaptive_pos(r, g, b, skin_tone)
        
        # FFT-based heart rate
        freqs, powers = self.welch_spectrum(signal, self.fps)
        
        # Find peak in HR range
        hr_range = (freqs >= 0.65) & (freqs <= 4.0)
        peak_idx = np.argmax(powers[hr_range])
        hr = freqs[hr_range][peak_idx] * 60
        
        return hr
    
    def adaptive_pos(self, r, g, b, skin_tone):
        # Detrend
        r = detrend(r)
        g = detrend(g)
        b = detrend(b)
        
        # Normalize
        r = normalize(r)
        g = normalize(g)
        b = normalize(b)
        
        # Adaptive weights based on skin tone
        if skin_tone < 0.3:  # Dark
            weights = {'g': 1.0, 'r': 1.5, 'b': 0.5}
        elif skin_tone > 0.7:  # Light
            weights = {'g': 2.0, 'r': 0.5, 'b': 0.5}
        else:  # Medium
            weights = {'g': 1.5, 'r': 1.0, 'b': 0.5}
        
        signal = (weights['g'] * g - 
                  weights['r'] * r - 
                  weights['b'] * b)
        
        # Bandpass
        return bandpass_filter(signal, 0.65, 4.0, self.fps)
    
    def estimate_skin_tone(self, r, g, b):
        # Use luminance as proxy for melanin content
        luminance = 0.299 * r + 0.587 * g + 0.114 * b
        # Normalize to 0-1 based on expected camera ranges
        return np.clip((luminance - 40) / 160, 0, 1)
```

### 6.3 Phase 2: Advanced Vital Signs

**Timeline:** 8-12 weeks

**Additions:**
1. **SpO2** estimation via deep learning (EfficientNet-B3 on STMaps)
2. **HRV Analysis** for stress (60-120 second recordings)
3. **Respiratory Rate** via baseline modulation
4. **Signal Quality Assessment** to reject poor readings
5. **Motion Artifact Detection** using MediaPipe face stability

### 6.4 Phase 3: On-Device Optimization

**Timeline:** 12-16 weeks

**Optimizations:**
1. Convert ML models to **TensorFlow Lite**
2. Implement **Core ML** version for iOS
3. Optimize signal processing with **WebAssembly** for web
4. Add **offline mode** with local processing
5. Implement **background processing** for continuous monitoring

### 6.5 Testing Protocol

**Critical: Test across Fitzpatrick I-VI**

| Test Group | Fitzpatrick | Minimum N |
|------------|-------------|-----------|
| Very Light | I-II | 20 |
| Medium | III-IV | 30 |
| Dark | V-VI | 30 |

**Validation Metrics:**
- Heart Rate: MAE < 5 bpm vs. pulse oximeter
- SpO2: MAE < 4% vs. pulse oximeter (if implemented)
- HRV: Correlation r > 0.8 vs. ECG
- Skin Tone Bias: < 2 bpm difference between groups

---

## 7. Key Papers & References

### Core rPPG Research
1. **PMC11161609** - "A machine learning-based approach for constructing remote photoplethysmogram signals from video cameras" (Communications Medicine, 2024)
2. **PMC12297079** - "The role of face regions in remote photoplethysmography for contactless heart rate monitoring" (npj Digital Medicine, 2025)
3. **PMC10542939** - "Estimation of vital signs from facial videos via video magnification and deep learning" (iScience, 2023)

### Skin Tone & Fairness
4. **PMC12592569** - "Photoplethysmography in Diverse Skin Tones: Evaluating Bias in Smartwatch Health Monitoring" (Cureus, 2025)
5. **PMC12646468** - "Evaluation of skin pigmentation effect on photoplethysmography signals using a vascular finger phantom" (JBO, 2025)
6. **PMC11983641** - "Investigating the accuracy of Garmin PPG sensors on differing skin types" (Frontiers, 2025)
7. **PMC8175478** - "Evaluation of biases in remote photoplethysmography methods" (npj Digital Medicine, 2021)

### SpO2 & Advanced Vitals
8. **PMC10968547** - "Contactless Blood Oxygen Saturation Estimation from Facial Videos Using Deep Learning" (Bioengineering, 2024)
9. **PMC10376629** - "Heart Rate Variability Analysis from Face Video" (Bioengineering, 2023)

### Algorithm Foundations
10. **De Haan & Jeanne (2013)** - "Robust pulse rate from chrominance-based rPPG" (IEEE TBME)
11. **Wang et al. (2016)** - "Algorithmic principles of remote PPG" (IEEE TBME)
12. **Pilz et al. (2018)** - "Local group invariance for heart rate estimation from face videos" (CVPRW)

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Poor accuracy on dark skin | Medium | **Critical** | Skin-tone adaptive algorithms, multi-wavelength, diverse testing |
| Motion artifacts | High | Medium | Motion detection, quality assessment, user guidance |
| Poor lighting conditions | High | Medium | Lighting guidance, quality feedback, fallback modes |
| Regulatory issues | Low | High | Position as wellness, not medical device |
| Battery drain | Medium | Medium | Optimize processing, batch processing |
| User privacy | Medium | High | On-device processing, no cloud storage |

---

## 9. Summary

### For SKINgenius, face-based PPG is:
- **Feasible** for heart rate, HRV/stress, and potentially SpO2
- **Challenging** for blood pressure (research stage)
- **Critical** to address skin tone bias through adaptive calibration
- **Best implemented** with POS/CHROM algorithms + MediaPipe face mesh
- **Most accurate** with 30-60 second recordings at 30fps

### Immediate Next Steps:
1. **Prototype** heart rate extraction with MediaPipe + POS algorithm
2. **Test** across diverse Fitzpatrick skin types immediately
3. **Implement** skin-tone adaptive calibration
4. **Validate** against FDA-cleared pulse oximeter
5. **Iterate** on SpO2 and HRV features

---

*Report generated for SKINgenius skin health platform.*  
*Focus: Cross-Fitzpatrick (I-VI) compatibility with emphasis on darker skin calibration.*

# FLAME 2023 Open Model Setup Notes

## Overview
FLAME (Faces Learned with an Articulated Model and Expressions) is a versatile 3D face model that combines linear shape spaces with articulated joints (jaw, neck, eyeballs) and expression blendshapes. The FLAME 2023 Open model is released under CC-BY-4.0 license, making it suitable for both research and commercial applications.

## Download Information
- **Official Source**: https://flame.is.tue.mpg.de/
- **Direct Download Link**: https://download.is.tue.mpg.de/download.php?domain=flame&sfile=FLAME2023Open.zip
- **License**: CC BY 4.0 (Open Model License)
- **Release Date**: November 25, 2023 (based on website news)
- **Requirements**: Registration/Login required for download

## Model Structure
Based on FLAME documentation and related resources, the FLAME 2023 Open model typically includes:

### Core Components
1. **Shape Space**: PCA model trained on ~3800 3D scans
   - Shape parameters: 300 dimensions (betas)
   - Represents identity/facial shape variations

2. **Expression Space**: 
   - Expression parameters: 100 dimensions (expressions)
   - Captures facial expressions and pose-dependent deformations

3. **Pose Parameters**:
   - Global pose: 3 dimensions (global orientation)
   - Jaw pose: 3 dimensions (jaw articulation)
   - Neck pose: 3 dimensions (neck pose)

4. **Translation**: 3 dimensions (global position)

5. **Vertex Template**: Base mesh topology
   - Typically ~5023 vertices
   - ~9976 faces (triangular mesh)

### File Structure (Expected)
After extracting FLAME2023Open.zip, you should expect:
```
FLAME2023Open/
├── flame2023_Open.pkl          # Main model file (Pickle format)
├── generic_model.pkl           # Generic template model
├── license.txt                 # CC BY 4.0 license
└── README.md                   # Model documentation
```

## Technical Specifications
- **Vertices**: ~5023
- **Faces**: ~9976
- **Shape Parameters**: 300
- **Expression Parameters**: 100
- **Pose Parameters**: 9 (3 global + 3 jaw + 3 neck)
- **Translation**: 3
- **Total Parameters**: 415 (300 shape + 100 expression + 9 pose + 3 translation + 3 scale?)

## Usage in Python
The model is typically loaded as a pickle file containing a dictionary with keys such as:
- `v_template`: Template vertices (n_v x 3)
- `shapedirs`: Shape blend shapes (n_v x 3 x n_shape)
- `posedirs`: Pose blend shapes (n_v x 3 x n_pose)
- `J_regressor`: Joint regressor matrix (n_joint x n_v)
- `weights`: Skinning weights (n_v x n_joint)
- `pose_mean`: Mean pose parameters
- `f`: Eyeballs and teeth vertices
- `ft`: Eyeballs and teeth faces
- `J_regressor_p`: Additional joint regressors
- `vertices`: Processed vertices

## Verification Approach
To verify the model loads correctly in Python:

```python
import pickle
import numpy as np
import torch

def verify_flame_model(model_path):
    """Verify FLAME model loads and has expected structure"""
    try:
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f, encoding='latin1')
        
        print("Model loaded successfully!")
        print(f"Model keys: {list(model_data.keys())}")
        
        # Check for essential components
        expected_keys = ['v_template', 'shapedirs', 'posedirs', 'J_regressor', 'weights']
        missing_keys = [key for key in expected_keys if key not in model_data]
        
        if missing_keys:
            print(f"WARNING: Missing expected keys: {missing_keys}")
        else:
            print("All essential model components found")
            
        # Print shapes of key components
        if 'v_template' in model_data:
            print(f"Template vertices shape: {model_data['v_template'].shape}")
        if 'shapedirs' in model_data:
            print(f"Shape blend shapes: {model_data['shapedirs'].shape}")
        if 'posedirs' in model_data:
            print(f"Pose blend shapes: {model_data['posedirs'].shape}")
        if 'J_regressor' in model_data:
            print(f"Joint regressor shape: {model_data['J_regressor'].shape}")
        if 'weights' in model_data:
            print(f"Skinning weights shape: {model_data['weights'].shape}")
            
        return model_data
        
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Example usage:
# model = verify_flame_model("/path/to/flame2023_Open.pkl")
```

## Alternative Access Methods
If direct download is not possible due to authentication requirements:

1. **Academic Request**: Contact the Max Planck Institute for Intelligent Systems for research access
2. **GitHub Resources**: Check https://github.com/TimoBolkart/FLAME-Universe for related code and resources
3. **Pre-converted Versions**: Some community projects may have converted versions available
4. **TensorFlow/PyTorch Ports**: Check https://github.com/soubhiksanyal/FLAME_PyTorch or https://github.com/TimoBolkart/TF_FLAME

## Integration with SKINgenius
For SKINgenius applications, the FLAME model can be used for:
- 3D facial morphology analysis
- Simulating treatment outcomes
- Creating personalized avatars for skincare visualization
- Tracking facial changes over time
- Modeling expression-dependent skin deformation

## References
1. Li, T., Bolkart, T., Black, M. J., Li, H., & Romero, J. (2017). 
   Learning a model of facial shape and expression from 4D scans. 
   ACM Transactions on Graphics (TOG), 36(6), 1-17.
2. FLAME Website: https://flame.is.tue.mpg.de/
3. FLAME-Universe: https://github.com/TimoBolkart/FLAME-Universe
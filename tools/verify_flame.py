#!/usr/bin/env python3
"""
FLAME 2023 Open Model Verification Script
Verifies that the FLAME model loads correctly and displays its structure
"""

import os
import pickle
import numpy as np
import sys
from pathlib import Path

def verify_flame_model(model_path):
    """Verify FLAME model loads and has expected structure"""
    model_path = Path(model_path)
    
    if not model_path.exists():
        print(f"ERROR: Model file not found at {model_path}")
        print("Please download the FLAME 2023 Open model from:")
        print("https://flame.is.tue.mpg.de/")
        print("Direct link: https://download.is.tue.mpg.de/download.php?domain=flame&sfile=FLAME2023Open.zip")
        print("(Registration/login required)")
        return False
    
    try:
        print(f"Loading FLAME model from: {model_path}")
        with open(model_path, 'rb') as f:
            # Try different encoding options for compatibility
            try:
                model_data = pickle.load(f, encoding='latin1')
            except UnicodeDecodeError:
                model_data = pickle.load(f, encoding='bytes')
        
        print("✓ Model loaded successfully!")
        
        # Display model information
        print(f"\nModel Information:")
        print(f"  File size: {model_path.stat().st_size / (1024*1024):.2f} MB")
        print(f"  Model keys: {list(model_data.keys())}")
        
        # Check for essential components
        expected_keys = ['v_template', 'shapedirs', 'posedirs', 'J_regressor', 'weights']
        missing_keys = [key for key in expected_keys if key not in model_data]
        
        if missing_keys:
            print(f"⚠ WARNING: Missing expected keys: {missing_keys}")
        else:
            print("✓ All essential model components found")
            
        # Print shapes and info of key components
        print(f"\nModel Component Details:")
        
        if 'v_template' in model_data:
            v_template = model_data['v_template']
            print(f"  v_template (vertices): {v_template.shape} "
                  f"[{v_template.dtype}]")
            print(f"    Range: [{v_template.min():.3f}, {v_template.max():.3f}]")
            
        if 'shapedirs' in model_data:
            shapedirs = model_data['shapedirs']
            print(f"  shapedirs (shape blendshapes): {shapedirs.shape} "
                  f"[{shapedirs.dtype}]")
            print(f"    Shape parameters: {shapedirs.shape[-1]}")
            
        if 'posedirs' in model_data:
            posedirs = model_data['posedirs']
            print(f"  posedirs (pose blendshapes): {posedirs.shape} "
                  f"[{posedirs.dtype}]")
            print(f"    Pose parameters: {posedirs.shape[-1]}")
            
        if 'J_regressor' in model_data:
            J_regressor = model_data['J_regressor']
            print(f"  J_regressor (joint regressor): {J_regressor.shape} "
                  f"[{J_regressor.dtype}]")
            print(f"    Number of joints: {J_regressor.shape[0]}")
            
        if 'weights' in model_data:
            weights = model_data['weights']
            print(f"  weights (skinning weights): {weights.shape} "
                  f"[{weights.dtype}]")
            print(f"    Number of influence joints: {weights.shape[1]}")
            
        # Check for expression-related components
        expression_keys = ['expressions', 'expression']  # Common alternative names
        exp_found = False
        for key in expression_keys:
            if key in model_data:
                exp_data = model_data[key]
                print(f"  {key} (expression parameters): {exp_data.shape} "
                      f"[{exp_data.dtype}]")
                exp_found = True
                break
        
        if not exp_found and 'shapedirs' in model_data:
            # Often expression is part of shapedirs or separate
            print(f"  Expression parameters: May be included in shapedirs or separate")
            
        # Check for template faces
        if 'f' in model_data and 'ft' in model_data:
            print(f"  f (template faces): {model_data['f'].shape}")
            print(f"  ft (face template): {model_data['ft'].shape}")
        elif 'faces' in model_data:
            print(f"  faces: {model_data['faces'].shape}")
            
        # Test basic functionality if we have the core components
        if all(key in model_data for key in ['v_template', 'shapedirs', 'posedirs']):
            print(f"\n✓ Model appears complete and ready for use")
            print(f"  Can generate personalized 3D faces using shape and expression parameters")
            return True
        else:
            print(f"\n⚠ Model may be missing critical components for full functionality")
            return False
            
    except Exception as e:
        print(f"✕ Error loading model: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

def main():
    """Main verification function"""
    print("=" * 60)
    print("FLAME 2023 Open Model Verification")
    print("=" * 60)
    
    # Default model location
    default_model_path = "/home/jason/.openclaw/workspaces/skingenius/data/models/flame/flame2023_Open.pkl"
    
    # Check if model exists at default location
    if len(sys.argv) > 1:
        model_path = sys.argv[1]
    else:
        model_path = default_model_path
    
    success = verify_flame_model(model_path)
    
    print("\n" + "=" * 60)
    if success:
        print("VERIFICATION PASSED: FLAME model is ready for use")
    else:
        print("VERIFICATION FAILED: Please check model installation")
        print("\nTo obtain the FLAME 2023 Open model:")
        print("1. Visit https://flame.is.tue.mpg.de/")
        print("2. Navigate to Downloads section") 
        print("3. Download FLAME 2023 Open Model (requires registration)")
        print("4. Extract and place flame2023_Open.pkl in:")
        print(f"   {os.path.dirname(default_model_path)}/")
    print("=" * 60)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Image Normalizer for SKINgenius Training Data Pipeline
Normalizes images to CUT standard: 256x256, RGB, [-1, 1] pixel range.
"""

import os
import csv
from PIL import Image
import numpy as np
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageNormalizer:
    def __init__(self):
        self.processed_path = Path("data/processed")
        self.clean_manifest_path = self.processed_path / "manifest_clean.csv"
        self.normalized_path = self.processed_path / "normalized"
        
        # Create output directory structure
        self.normalized_path.mkdir(exist_ok=True)
        
        # CUT model standards
        self.target_size = (256, 256)
        self.target_range = (-1, 1)  # Pixel value range after normalization
        
        # Statistics
        self.stats = {
            'total_processed': 0,
            'successfully_normalized': 0,
            'failed_normalization': 0,
            'per_treatment': {},
            'per_source': {'fda': 0, 'pmc': 0}
        }

    def normalize_image(self, img_path, output_path):
        """Normalize a single image to CUT standards."""
        try:
            # Open image
            with Image.open(img_path) as img:
                # Convert to RGB (removes alpha channel if present)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize to 256x256
                img_resized = img.resize(self.target_size, Image.Resampling.LANCZOS)
                
                # Convert to numpy array
                img_array = np.array(img_resized, dtype=np.float32)
                
                # Normalize pixel values to [-1, 1] range
                # Original range is [0, 255], so: (pixel / 127.5) - 1
                img_normalized = (img_array / 127.5) - 1.0
                
                # Clip to ensure values are in range (should already be, but safety first)
                img_normalized = np.clip(img_normalized, self.target_range[0], self.target_range[1])
                
                # Convert back to uint8 for saving (we'll save as PNG for lossless)
                # First convert back to [0, 255] range for saving as image
                img_for_save = ((img_normalized + 1.0) * 127.5).astype(np.uint8)
                img_save = Image.fromarray(img_for_save, mode='RGB')
                
                # Save normalized image
                img_save.save(output_path, format='PNG')
                
                return True, {
                    'original_size': img.size,
                    'original_mode': img.mode,
                    'normalized_shape': img_normalized.shape,
                    'value_range': (float(img_normalized.min()), float(img_normalized.max()))
                }
                
        except Exception as e:
            logger.error(f"Failed to normalize {img_path}: {e}")
            return False, str(e)

    def process_manifest(self):
        """Process all images listed in the clean manifest."""
        if not self.clean_manifest_path.exists():
            logger.error(f"Clean manifest not found: {self.clean_manifest_path}")
            return
            
        logger.info(f"Processing images from manifest: {self.clean_manifest_path}")
        
        try:
            with open(self.clean_manifest_path, 'r') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                
            logger.info(f"Found {len(rows)} entries in clean manifest")
            
            for i, row in enumerate(rows):
                if i % 50 == 0 and i > 0:
                    logger.info(f"Processed {i}/{len(rows)} images...")
                    
                # Get source file path
                file_path_str = row.get('file_path', '')
                if not file_path_str:
                    logger.warning(f"Missing file_path in row: {row}")
                    self.stats['failed_normalization'] += 1
                    continue
                    
                # Construct full path
                img_path = Path("data") / file_path_str
                if not img_path.exists():
                    logger.warning(f"Image file not found: {img_path}")
                    self.stats['failed_normalization'] += 1
                    continue
                
                # Determine output path
                source = row.get('source', 'unknown')
                treatment = row.get('treatment_type', 'unknown')
                before_after = row.get('before_after', 'unknown')
                filename = Path(row.get('filename', 'image')).stem
                
                # Create output directory: normalized/[treatment_type]/[before_after]/
                output_dir = self.normalized_path / treatment / before_after
                output_dir.mkdir(parents=True, exist_ok=True)
                
                output_filename = f"{filename}_normalized.png"
                output_path = output_dir / output_filename
                
                # Normalize image
                success, result = self.normalize_image(img_path, output_path)
                
                if success:
                    self.stats['successfully_normalized'] += 1
                    self.stats['per_source'][source] = self.stats['per_source'].get(source, 0) + 1
                    
                    # Update treatment stats
                    if treatment not in self.stats['per_treatment']:
                        self.stats['per_treatment'][treatment] = 0
                    self.stats['per_treatment'][treatment] += 1
                    
                    # Log first few successes for verification
                    if self.stats['successfully_normalized'] <= 3:
                        logger.info(f"✅ Normalized: {img_path.name} -> {output_path}")
                        logger.info(f"   Original size: {result['original_size']}, Mode: {result['original_mode']}")
                        logger.info(f"   Normalized range: {result['value_range']}")
                else:
                    self.stats['failed_normalization'] += 1
                    logger.error(f"❌ Failed to normalize {img_path}: {result}")
                    
                self.stats['total_processed'] += 1
                
        except Exception as e:
            logger.error(f"Error processing manifest: {e}")

    def run_normalization(self):
        """Run the image normalization process."""
        logger.info("Starting image normalization...")
        
        self.process_manifest()
        
        # Print summary
        self.print_summary()
        
        return self.stats

    def print_summary(self):
        """Print normalization summary."""
        print("\n" + "="*60)
        print("IMAGE NORMALIZATION SUMMARY")
        print("="*60)
        print(f"Total images processed: {self.stats['total_processed']}")
        print(f"Successfully normalized: {self.stats['successfully_normalized']}")
        print(f"Failed normalization: {self.stats['failed_normalization']}")
        print(f"Success rate: {self.stats['successfully_normalized']/max(self.stats['total_processed'],1)*100:.1f}%")
        
        print("\nBy source:")
        for source, count in self.stats['per_source'].items():
            print(f"  {source.upper()}: {count}")
            
        print("\nBy treatment type:")
        for treatment, count in sorted(self.stats['per_treatment'].items()):
            print(f"  {treatment}: {count}")
        
        # Save stats
        stats_path = self.processed_path / "normalization_stats.json"
        import json
        with open(stats_path, 'w') as f:
            json.dump(self.stats, f, indent=2)
        logger.info(f"Normalization stats saved to {stats_path}")

def main():
    """Main function to run the image normalizer."""
    normalizer = ImageNormalizer()
    stats = normalizer.run_normalization()
    
    print("\n✅ Image normalization completed!")
    print(f"📁 Normalized images saved to: data/processed/normalized/")
    print(f"📊 Stats: {stats['successfully_normalized']}/{stats['total_processed']} successful")

if __name__ == "__main__":
    main()
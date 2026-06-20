#!/usr/bin/env python3
"""
Synthetic Data Integrator for SKINgenius Training Data Pipeline
Integrates synthetic FLAME pairs into the training pipeline with appropriate weighting.
"""

import os
import csv
from PIL import Image
import numpy as np
from pathlib import Path
import logging
import shutil
import json
from collections import defaultdict

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SyntheticIntegrator:
    def __init__(self):
        self.synthetic_path = Path("data/synthetic")
        self.processed_path = Path("data/processed")
        self.synthetic_output_path = self.processed_path / "synthetic"
        
        # Create output directory structure
        self.synthetic_output_path.mkdir(exist_ok=True)
        
        # Load synthetic metadata
        self.metadata_path = self.synthetic_path / "synthetic_metadata.json"
        self.synthetic_metadata = self.load_synthetic_metadata()
        
        # Statistics
        self.stats = {
            'total_synthetic_pairs': 0,
            'successfully_integrated': 0,
            'failed_integration': 0,
            'per_treatment': {},
            'synthetic_weight': 0.2  # 20% weight for synthetic data in training
        }

    def load_synthetic_metadata(self):
        """Load synthetic data metadata."""
        if not self.metadata_path.exists():
            logger.warning(f"Synthetic metadata not found: {self.metadata_path}")
            return {}
            
        try:
            with open(self.metadata_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading synthetic metadata: {e}")
            return {}

    def normalize_synthetic_image(self, img_path, output_path):
        """Normalize a synthetic image to match real data standards."""
        try:
            # Open image
            with Image.open(img_path) as img:
                # Convert to RGB (removes alpha channel if present)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize to 256x256 (CUT standard)
                img_resized = img.resize((256, 256), Image.Resampling.LANCZOS)
                
                # Convert to numpy array
                img_array = np.array(img_resized, dtype=np.float32)
                
                # Normalize pixel values to [-1, 1] range
                # Original range is [0, 255], so: (pixel / 127.5) - 1
                img_normalized = (img_array / 127.5) - 1.0
                
                # Clip to ensure values are in range
                img_normalized = np.clip(img_normalized, -1.0, 1.0)
                
                # Convert back to uint8 for saving
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
            logger.error(f"Failed to normalize synthetic image {img_path}: {e}")
            return False, str(e)

    def extract_treatment_from_filename(self, filename):
        """Extract treatment type from synthetic filename."""
        name_lower = filename.lower()
        
        # Map synthetic filenames to treatment types
        if 'botox' in name_lower or 'botulinum' in name_lower:
            return 'botulinum_toxins'
        elif 'filler' in name_lower:
            return 'hyaluronic_acid_lips'  # Default filler type
        elif 'radiesse' in name_lower:
            return 'radiesse_(merz)'
        elif 'daxxify' in name_lower:
            return 'daxxify'
        elif 'sculptra' in name_lower:
            return 'sculptra'
        else:
            return 'unknown_synthetic'

    def integrate_synthetic_pairs(self):
        """Integrate synthetic pairs into the training pipeline."""
        logger.info("Integrating synthetic FLAME pairs...")
        
        if not self.synthetic_path.exists():
            logger.error(f"Synthetic data path not found: {self.synthetic_path}")
            return
            
        # Find all synthetic image files
        synthetic_files = []
        for ext in ['*.png', '*.jpg', '*.jpeg']:
            synthetic_files.extend(list(self.synthetic_path.glob(ext)))
            synthetic_files.extend(list(self.synthetic_path.glob(ext.upper())))
        
        logger.info(f"Found {len(synthetic_files)} synthetic image files")
        
        # Group files by treatment and view type
        synthetic_by_treatment = defaultdict(lambda: {'views': [], 'main': None})
        
        for img_path in synthetic_files:
            filename = img_path.name
            treatment = self.extract_treatment_from_filename(filename)
            
            # Determine if this is a main image or a view
            if '_view' in filename.lower():
                synthetic_by_treatment[treatment]['views'].append(img_path)
            else:
                synthetic_by_treatment[treatment]['main'] = img_path
        
        # Process each treatment
        for treatment, data in synthetic_by_treatment.items():
            main_img = data['main']
            views = data['views']
            
            if not main_img:
                logger.warning(f"No main image found for treatment: {treatment}")
                continue
                
            logger.info(f"Processing synthetic {treatment}: 1 main + {len(views)} views")
            
            # Create output directories for this treatment
            synth_dir = self.synthetic_output_path / treatment
            (synth_dir / "domain_A").mkdir(parents=True, exist_ok=True)  # Before/main
            (synth_dir / "domain_B").mkdir(parents=True, exist_ok=True)  # After/views
            
            # Process main image (domain A - before)
            main_output_dir = synth_dir / "domain_A"
            main_output_path = main_output_dir / f"{treatment}_synthetic_A_00000.png"
            
            success, result = self.normalize_synthetic_image(main_img, main_output_path)
            if success:
                self.stats['successfully_integrated'] += 1
                logger.debug(f"✅ Integrated synthetic main: {main_img.name} -> {main_output_path.name}")
            else:
                self.stats['failed_integration'] += 1
                logger.error(f"❌ Failed to integrate synthetic main {main_img}: {result}")
            
            # Process view images (domain B - after)
            for i, view_img in enumerate(views):
                view_output_dir = synth_dir / "domain_B"
                view_output_path = view_output_dir / f"{treatment}_synthetic_B_{i:05d}.png"
                
                success, result = self.normalize_synthetic_image(view_img, view_output_path)
                if success:
                    self.stats['successfully_integrated'] += 1
                    logger.debug(f"✅ Integrated synthetic view: {view_img.name} -> {view_output_path.name}")
                else:
                    self.stats['failed_integration'] += 1
                    logger.error(f"❌ Failed to integrate synthetic view {view_img}: {result}")
            
            # Update treatment statistics
            total_for_treatment = 1 + len(views)  # main + views
            self.stats['per_treatment'][treatment] = total_for_treatment
            self.stats['total_synthetic_pairs'] += len(views)  # Number of pairs (main-view combinations)
        
        logger.info(f"Synthetic integration complete:")
        logger.info(f"  Successfully integrated: {self.stats['successfully_integrated']}")
        logger.info(f"  Failed integration: {self.stats['failed_integration']}")

    def create_synthetic_manifest(self):
        """Create a manifest for synthetic data similar to the real data manifest."""
        logger.info("Creating synthetic data manifest...")
        
        manifest_path = self.processed_path / "manifest_synthetic.csv"
        
        # Collect all synthetic entries
        synthetic_entries = []
        
        # Walk through synthetic output directory
        for treatment_dir in self.synthetic_output_path.iterdir():
            if not treatment_dir.is_dir():
                continue
                
            treatment = treatment_dir.name
            
            for domain_dir in ['domain_A', 'domain_B']:
                domain_path = treatment_dir / domain_dir
                if not domain_path.exists():
                    continue
                    
                before_after = 'before' if domain_dir == 'domain_A' else 'after'
                
                for img_path in domain_path.glob("*.png"):
                    # Create manifest entry
                    entry = {
                        'filename': img_path.name,
                        'source': 'synthetic',
                        'treatment_type': treatment,
                        'timepoint': 'synthetic',
                        'before_after': before_after,
                        'width': '256',  # Standardized size
                        'height': '256',  # Standardized size
                        'file_path': str(img_path.relative_to(Path('data'))),
                        'validated': 'true',
                        'synthetic_weight': str(self.stats['synthetic_weight'])
                    }
                    synthetic_entries.append(entry)
        
        # Write synthetic manifest
        if synthetic_entries:
            fieldnames = ['filename', 'source', 'treatment_type', 'timepoint', 'before_after', 
                         'width', 'height', 'file_path', 'validated', 'synthetic_weight']
            
            with open(manifest_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(synthetic_entries)
                
            logger.info(f"Synthetic manifest saved to {manifest_path} with {len(synthetic_entries)} entries")
        else:
            logger.warning("No synthetic images found for manifest creation")

    def run_integration(self):
        """Run the synthetic data integration process."""
        logger.info("Starting synthetic data integration...")
        
        self.integrate_synthetic_pairs()
        self.create_synthetic_manifest()
        
        # Print summary
        self.print_summary()
        
        return self.stats

    def print_summary(self):
        """Print synthetic integration summary."""
        print("\n" + "="*60)
        print("SYNTHETIC DATA INTEGRATION SUMMARY")
        print("="*60)
        print(f"Total synthetic pairs processed: {self.stats['total_synthetic_pairs']}")
        print(f"Successfully integrated: {self.stats['successfully_integrated']}")
        print(f"Failed integration: {self.stats['failed_integration']}")
        print(f"Success rate: {self.stats['successfully_integrated']/max(self.stats['successfully_integrated'] + self.stats['failed_integration'], 1)*100:.1f}%")
        print(f"Synthetic data weight for training: {self.stats['synthetic_weight']*100}%")
        
        print("\nIntegrated by treatment type:")
        for treatment, count in sorted(self.stats['per_treatment'].items()):
            print(f"  {treatment}: {count} images")
        
        # Save stats
        stats_path = self.processed_path / "synthetic_stats.json"
        import json
        with open(stats_path, 'w') as f:
            json.dump(self.stats, f, indent=2)
        logger.info(f"Synthetic integration stats saved to {stats_path}")

def main():
    """Main function to run the synthetic data integrator."""
    integrator = SyntheticIntegrator()
    stats = integrator.run_integration()
    
    print("\n✅ Synthetic data integration completed!")
    print(f"📁 Synthetic data saved to: data/processed/synthetic/")
    print(f"📊 Stats: {stats['successfully_integrated']} images integrated")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Pair Matcher for SKINgenius Training Data Pipeline
Matches before/after images for CUT model training (domain A=before, domain B=after).
"""

import os
import csv
from PIL import Image
from pathlib import Path
import logging
import shutil
from collections import defaultdict
import json

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PairMatcher:
    def __init__(self):
        self.processed_path = Path("data/processed")
        self.clean_manifest_path = self.processed_path / "manifest_clean.csv"
        self.normalized_path = self.processed_path / "normalized"
        self.paired_path = self.processed_path / "paired"
        
        # Create output directory structure
        self.paired_path.mkdir(exist_ok=True)
        (self.paired_path / "domain_A").mkdir(exist_ok=True)  # Before images
        (self.paired_path / "domain_B").mkdir(exist_ok=True)  # After images
        
        # Statistics
        self.stats = {
            'total_pairs_processed': 0,
            'true_pairs_matched': 0,
            'pseudo_pairs_created': 0,
            'failed_to_pair': 0,
            'per_treatment': defaultdict(int),
            'domain_A_count': 0,
            'domain_B_count': 0
        }

    def load_normalized_images(self):
        """Load all normalized images and map them by their metadata."""
        logger.info("Loading normalized images from manifest...")
        
        # Dictionary to store images by treatment and before_after status
        images_by_treatment = defaultdict(lambda: {'before': [], 'after': []})
        
        if not self.clean_manifest_path.exists():
            logger.error(f"Clean manifest not found: {self.clean_manifest_path}")
            return images_by_treatment
            
        try:
            with open(self.clean_manifest_path, 'r') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                
            logger.info(f"Found {len(rows)} entries in clean manifest")
            
            for row in rows:
                # Get the normalized filename
                original_filename = row.get('filename', '')
                if not original_filename:
                    continue
                    
                # Create normalized filename
                name_without_ext = Path(original_filename).stem
                normalized_filename = f"{name_without_ext}_normalized.png"
                
                # Get metadata
                treatment = row.get('treatment_type', 'unknown').lower().replace(' ', '_')
                before_after = row.get('before_after', 'unknown').lower()
                
                # Normalize before_after values
                if 'before' in before_after or 'baseline' in before_after or 'pre' in before_after:
                    before_after_norm = 'before'
                elif 'after' in before_after or 'post' in before_after:
                    before_after_norm = 'after'
                else:
                    before_after_norm = 'unknown'
                
                # Construct path to normalized image
                file_path_str = row.get('file_path', '')
                if file_path_str:
                    # Convert original path to normalized path
                    original_path = Path("data") / file_path_str
                    # Create normalized path: data/processed/normalized/[treatment]/[before_after]/[filename]_normalized.png
                    normalized_dir = self.normalized_path / treatment / before_after_norm
                    normalized_path = normalized_dir / normalized_filename
                    
                    # Check if normalized image exists
                    if normalized_path.exists():
                        images_by_treatment[treatment][before_after_norm].append({
                            'original_path': original_path,
                            'normalized_path': normalized_path,
                            'filename': original_filename,
                            'normalized_filename': normalized_filename,
                            'treatment': treatment,
                            'before_after': before_after_norm,
                            'timepoint': row.get('timepoint', 'unknown'),
                            'source': row.get('source', 'unknown')
                        })
                    else:
                        logger.debug(f"Normalized image not found: {normalized_path}")
                        
        except Exception as e:
            logger.error(f"Error loading normalized images: {e}")
            
        # Log summary
        total_before = sum(len(images_by_treatment[t]['before']) for t in images_by_treatment)
        total_after = sum(len(images_by_treatment[t]['after']) for t in images_by_treatment)
        
        logger.info(f"Loaded images:")
        logger.info(f"  Total before images: {total_before}")
        logger.info(f"  Total after images: {total_after}")
        
        for treatment in images_by_treatment:
            before_count = len(images_by_treatment[treatment]['before'])
            after_count = len(images_by_treatment[treatment]['after'])
            if before_count > 0 or after_count > 0:
                logger.info(f"  {treatment}: {before_count} before, {after_count} after")
                
        return images_by_treatment

    def create_pairs(self, images_by_treatment):
        """Create true pairs and pseudo-pairs from organized images."""
        logger.info("Creating pairs from organized images...")
        
        true_pairs = []      # Genuine before/after pairs
        pseudo_pairs = []    # Pseudo-pairs for unpaired images
        
        # Process each treatment
        for treatment, before_after_dict in images_by_treatment.items():
            before_images = before_after_dict['before']
            after_images = before_after_dict['after']
            
            logger.info(f"Processing {treatment}: {len(before_images)} before, {len(after_images)} after")
            
            # Create true pairs (1:1 matching)
            num_true_pairs = min(len(before_images), len(after_images))
            
            for i in range(num_true_pairs):
                true_pairs.append({
                    'before': before_images[i],
                    'after': after_images[i],
                    'treatment': treatment,
                    'pair_type': 'true',
                    'pair_id': len(true_pairs)  # Sequential ID
                })
            
            # Handle unpaired before images
            if len(before_images) > len(after_images):
                extra_before = before_images[len(after_images):]
                for i, before_img in enumerate(extra_before):
                    # Create pseudo-pair by matching with after images (cycling)
                    after_idx = i % len(after_images) if after_images else 0
                    after_img = after_images[after_idx] if after_images else None
                    
                    if after_img:  # Only create if we have an after image to pair with
                        pseudo_pairs.append({
                            'before': before_img,
                            'after': after_img,
                            'treatment': treatment,
                            'pair_type': 'pseudo',
                            'pair_id': len(true_pairs) + len(pseudo_pairs)
                        })
            
            # Handle unpaired after images
            elif len(after_images) > len(before_images):
                extra_after = after_images[len(before_images):]
                for i, after_img in enumerate(extra_after):
                    # Create pseudo-pair by matching with before images (cycling)
                    before_idx = i % len(before_images) if before_images else 0
                    before_img = before_images[before_idx] if before_images else None
                    
                    if before_img:  # Only create if we have a before image to pair with
                        pseudo_pairs.append({
                            'before': before_img,
                            'after': after_img,
                            'treatment': treatment,
                            'pair_type': 'pseudo',
                            'pair_id': len(true_pairs) + len(pseudo_pairs)
                        })
        
        logger.info(f"Created {len(true_pairs)} true pairs and {len(pseudo_pairs)} pseudo-pairs")
        return true_pairs, pseudo_pairs

    def save_paired_images(self, true_pairs, pseudo_pairs):
        """Save paired images to domain A (before) and domain B (after) directories."""
        all_pairs = true_pairs + pseudo_pairs
        saved_count = 0
        
        logger.info(f"Saving {len(all_pairs)} pairs to domain directories...")
        
        for pair in all_pairs:
            try:
                treatment = pair['treatment']
                
                # Process before image (domain A)
                if pair['before'] is not None:
                    before_path = pair['before']['normalized_path']
                    
                    # Create subdirectory for treatment in domain A
                    domain_A_dir = self.paired_path / "domain_A" / treatment
                    domain_A_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Generate filename
                    before_filename = f"{treatment}_A_{pair['pair_id']:05d}.png"
                    domain_A_output = domain_A_dir / before_filename
                    
                    # Copy image
                    shutil.copy2(before_path, domain_A_output)
                    saved_count += 1
                
                # Process after image (domain B)
                if pair['after'] is not None:
                    after_path = pair['after']['normalized_path']
                    
                    # Create subdirectory for treatment in domain B
                    domain_B_dir = self.paired_path / "domain_B" / treatment
                    domain_B_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Generate filename
                    after_filename = f"{treatment}_B_{pair['pair_id']:05d}.png"
                    domain_B_output = domain_B_dir / after_filename
                    
                    # Copy image
                    shutil.copy2(after_path, domain_B_output)
                    saved_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to save pair {pair.get('pair_id', 'unknown')}: {e}")
                self.stats['failed_to_pair'] += 1
        
        return saved_count

    def run_pair_matching(self):
        """Run the pair matching process."""
        logger.info("Starting pair matching...")
        
        # Step 1: Load normalized images
        images_by_treatment = self.load_normalized_images()
        
        # Step 2: Create pairs
        true_pairs, pseudo_pairs = self.create_pairs(images_by_treatment)
        
        # Step 3: Save paired images
        saved_count = self.save_paired_images(true_pairs, pseudo_pairs)
        
        # Update statistics
        self.stats['total_pairs_processed'] = len(true_pairs) + len(pseudo_pairs)
        self.stats['true_pairs_matched'] = len(true_pairs)
        self.stats['pseudo_pairs_created'] = len(pseudo_pairs)
        self.stats['domain_A_count'] = saved_count // 2  # Each pair contributes 2 images
        self.stats['domain_B_count'] = saved_count // 2
        
        # Count by treatment
        for pair in true_pairs + pseudo_pairs:
            treatment = pair['treatment']
            self.stats['per_treatment'][treatment] += 1
        
        # Save pairing information
        self.save_pairing_info(true_pairs, pseudo_pairs)
        
        # Print summary
        self.print_summary()
        
        return self.stats

    def save_pairing_info(self, true_pairs, pseudo_pairs):
        """Save detailed pairing information to JSON file."""
        pairing_info = {
            'total_pairs': len(true_pairs) + len(pseudo_pairs),
            'true_pairs': len(true_pairs),
            'pseudo_pairs': len(pseudo_pairs),
            'true_pair_details': [],
            'pseudo_pair_details': []
        }
        
        # Add true pair details
        for pair in true_pairs:
            pair_info = {
                'pair_id': pair['pair_id'],
                'pair_type': 'true',
                'treatment': pair['treatment'],
                'before_image': {
                    'filename': pair['before']['filename'],
                    'normalized_filename': pair['before']['normalized_filename'],
                    'timepoint': pair['before']['timepoint'],
                    'source': pair['before']['source']
                },
                'after_image': {
                    'filename': pair['after']['filename'],
                    'normalized_filename': pair['after']['normalized_filename'],
                    'timepoint': pair['after']['timepoint'],
                    'source': pair['after']['source']
                }
            }
            pairing_info['true_pair_details'].append(pair_info)
        
        # Add pseudo pair details
        for pair in pseudo_pairs:
            pair_info = {
                'pair_id': pair['pair_id'],
                'pair_type': 'pseudo',
                'treatment': pair['treatment'],
                'before_image': {
                    'filename': pair['before']['filename'],
                    'normalized_filename': pair['before']['normalized_filename'],
                    'timepoint': pair['before']['timepoint'],
                    'source': pair['before']['source']
                },
                'after_image': {
                    'filename': pair['after']['filename'],
                    'normalized_filename': pair['after']['normalized_filename'],
                    'timepoint': pair['after']['timepoint'],
                    'source': pair['after']['source']
                }
            }
            pairing_info['pseudo_pair_details'].append(pair_info)
        
        info_path = self.processed_path / "pairing_info.json"
        with open(info_path, 'w') as f:
            json.dump(pairing_info, f, indent=2)
        
        logger.info(f"Pairing information saved to {info_path}")

    def print_summary(self):
        """Print pair matching summary."""
        print("\n" + "="*60)
        print("PAIR MATCHING SUMMARY")
        print("="*60)
        print(f"Total pairs processed: {self.stats['total_pairs_processed']}")
        print(f"True pairs matched: {self.stats['true_pairs_matched']}")
        print(f"Pseudo pairs created: {self.stats['pseudo_pairs_created']}")
        print(f"Failed to pair: {self.stats['failed_to_pair']}")
        print(f"Domain A (before) images: {self.stats['domain_A_count']}")
        print(f"Domain B (after) images: {self.stats['domain_B_count']}")
        
        print("\nPairs by treatment type:")
        for treatment, count in sorted(self.stats['per_treatment'].items()):
            print(f"  {treatment}: {count} pairs")
        
        # Save stats
        stats_path = self.processed_path / "pairing_stats.json"
        import json
        with open(stats_path, 'w') as f:
            json.dump(dict(self.stats), f, indent=2)
        logger.info(f"Pairing stats saved to {stats_path}")

def main():
    """Main function to run the pair matcher."""
    matcher = PairMatcher()
    stats = matcher.run_pair_matching()
    
    print("\n✅ Pair matching completed!")
    print(f"📁 Paired images saved to: data/processed/paired/")
    print(f"   Domain A (before): data/processed/paired/domain_A/")
    print(f"   Domain B (after): data/processed/paired/domain_B/")
    print(f"📊 Stats: {stats['true_pairs_matched']} true pairs + {stats['pseudo_pairs_created']} pseudo pairs")

if __name__ == "__main__":
    main()
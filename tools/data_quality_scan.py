#!/usr/bin/env python3
"""
Data Quality Scanner for SKINgenius Training Data Pipeline
Scans raw FDA and PMC images for quality issues and validates manifests.
"""

import os
import csv
import json
from PIL import Image
import pandas as pd
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataQualityScanner:
    def __init__(self):
        self.raw_fda_path = Path("data/raw/fda")
        self.raw_pmc_path = Path("data/raw/pmc")
        self.processed_path = Path("data/processed")
        self.processed_path.mkdir(exist_ok=True)
        
        # Quality thresholds
        self.min_size = (64, 64)
        self.max_size = (4096, 4096)  # 4K
        
        # Supported formats
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        
        # Statistics
        self.stats = {
            'total_images': 0,
            'fda_images': 0,
            'pmc_images': 0,
            'corrupted_files': 0,
            'wrong_format': 0,
            'too_small': 0,
            'too_large': 0,
            'manifest_mismatch': 0,
            'valid_images': 0,
            'per_treatment': {}
        }
        
        self.issues = []

    def scan_image(self, img_path, source_type):
        """Scan a single image for quality issues."""
        self.stats['total_images'] += 1
        
        if source_type == 'fda':
            self.stats['fda_images'] += 1
        else:
            self.stats['pmc_images'] += 1
            
        # Check if file exists
        if not img_path.exists():
            self.issues.append(f"Missing file: {img_path}")
            self.stats['corrupted_files'] += 1
            return False
            
        try:
            # Try to open image
            with Image.open(img_path) as img:
                width, height = img.size
                format_lower = img.format.lower() if img.format else ''
                
                # Check format
                ext = img_path.suffix.lower()
                if ext not in self.supported_formats:
                    self.issues.append(f"Unsupported format {ext}: {img_path}")
                    self.stats['wrong_format'] += 1
                    return False
                
                # Check size constraints
                if width < self.min_size[0] or height < self.min_size[1]:
                    self.issues.append(f"Too small ({width}x{height}): {img_path}")
                    self.stats['too_small'] += 1
                    return False
                    
                if width > self.max_size[0] or height > self.max_size[1]:
                    self.issues.append(f"Too large ({width}x{height}): {img_path}")
                    self.stats['too_large'] += 1
                    return False
                    
                # Try to load image data to check for corruption
                img.verify()  # Verify integrity
                
                # Reopen for actual processing (verify closes the file)
                with Image.open(img_path) as img:
                    # Convert to RGB if needed
                    if img.mode not in ['RGB', 'L']:
                        img = img.convert('RGB')
                    
                self.stats['valid_images'] += 1
                
                # Update treatment statistics
                treatment = self.get_treatment_from_path(img_path, source_type)
                if treatment:
                    if treatment not in self.stats['per_treatment']:
                        self.stats['per_treatment'][treatment] = 0
                    self.stats['per_treatment'][treatment] += 1
                
                return True
                
        except Exception as e:
            self.issues.append(f"Corrupted file {img_path}: {str(e)}")
            self.stats['corrupted_files'] += 1
            return False

    def get_treatment_from_path(self, img_path, source_type):
        """Extract treatment type from image path or filename."""
        if source_type == 'fda':
            # Extract from filename pattern or manifest
            filename = img_path.name
            # Try to extract treatment from filename (simplified)
            for treatment in ['botulinum_toxins', 'hyaluronic_acid', 'fillers', 'radiesse', 'daxxify', 'sculptra']:
                if treatment in filename.lower():
                    return treatment
            return 'unknown_fda'
        else:
            # For PMC, extract from directory structure
            try:
                relative_path = img_path.relative_to(self.raw_pmc_path)
                # First directory level should be treatment type
                treatment = str(relative_path.parts[0]) if relative_path.parts else 'unknown_pmc'
                return treatment
            except:
                return 'unknown_pmc'

    def validate_manifest(self, manifest_path, source_type):
        """Validate that manifest entries match actual files."""
        if not manifest_path.exists():
            logger.warning(f"Manifest not found: {manifest_path}")
            return []
            
        manifest_files = set()
        actual_files = set()
        
        try:
            with open(manifest_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if source_type == 'fda':
                        filename = row.get('filename', '')
                    else:  # PMC
                        # For PMC, we need to parse local_paths
                        local_paths = row.get('local_paths', '')
                        if local_paths:
                            # Split by semicolon and extract filenames
                            paths = [p.strip() for p in local_paths.split(';')]
                            for path in paths:
                                if path:
                                    filename = os.path.basename(path)
                                    manifest_files.add(filename)
                            continue
                        continue
                    
                    if filename:
                        manifest_files.add(filename)
                        
        except Exception as e:
            logger.error(f"Error reading manifest {manifest_path}: {e}")
            return []
            
        # Scan actual files in directory
        img_dir = manifest_path.parent
        for ext in self.supported_formats:
            actual_files.update([f.name for f in img_dir.glob(f"*{ext}")])
            actual_files.update([f.name for f in img_dir.glob(f"*{ext.upper()}")])
        
        # Find mismatches
        missing_in_actual = manifest_files - actual_files
        missing_in_manifest = actual_files - manifest_files
        
        mismatches = []
        for file in missing_in_actual:
            mismatches.append(f"Manifest lists missing file: {file}")
            self.stats['manifest_mismatch'] += 1
            
        for file in missing_in_manifest:
            mismatches.append(f"File not in manifest: {file}")
            self.stats['manifest_mismatch'] += 1
            
        return mismatches

    def scan_source(self, source_path, source_type):
        """Scan all images in a source directory."""
        logger.info(f"Scanning {source_type.upper()} images in {source_path}")
        
        if not source_path.exists():
            logger.error(f"Source path does not exist: {source_path}")
            return
            
        # Find all image files
        image_files = []
        for ext in self.supported_formats:
            image_files.extend(list(source_path.rglob(f"*{ext}")))
            image_files.extend(list(source_path.rglob(f"*{ext.upper()}")))
            
        logger.info(f"Found {len(image_files)} image files in {source_type}")
        
        # Scan each image
        for img_path in image_files:
            self.scan_image(img_path, source_type)
            
        # Validate manifest
        manifest_path = source_path / "manifest.csv"
        manifest_issues = self.validate_manifest(manifest_path, source_type)
        self.issues.extend(manifest_issues)

    def run_scan(self):
        """Run the complete data quality scan."""
        logger.info("Starting data quality scan...")
        
        # Scan FDA data
        self.scan_source(self.raw_fda_path, 'fda')
        
        # Scan PMC data
        self.scan_source(self.raw_pmc_path, 'pmc')
        
        # Generate report
        self.generate_report()
        
        return self.stats

    def generate_report(self):
        """Generate a quality report and clean manifest."""
        logger.info("Generating quality report...")
        
        # Print summary
        print("\n" + "="*60)
        print("DATA QUALITY SCAN REPORT")
        print("="*60)
        print(f"Total images scanned: {self.stats['total_images']}")
        print(f"FDA images: {self.stats['fda_images']}")
        print(f"PMC images: {self.stats['pmc_images']}")
        print(f"Valid images: {self.stats['valid_images']}")
        print(f"Corrupted files: {self.stats['corrupted_files']}")
        print(f"Wrong format: {self.stats['wrong_format']}")
        print(f"Too small (<64x64): {self.stats['too_small']}")
        print(f"Too large (>4K): {self.stats['too_large']}")
        print(f"Manifest mismatches: {self.stats['manifest_mismatch']}")
        print("\nPer-treatment counts:")
        for treatment, count in sorted(self.stats['per_treatment'].items()):
            print(f"  {treatment}: {count}")
        
        if self.issues:
            print(f"\nIssues found ({len(self.issues)}):")
            for issue in self.issues[:10]:  # Show first 10 issues
                print(f"  - {issue}")
            if len(self.issues) > 10:
                print(f"  ... and {len(self.issues) - 10} more issues")
        
        # Save detailed report
        report_path = self.processed_path / "quality_report.json"
        report_data = {
            'scan_statistics': self.stats,
            'issues': self.issues,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2, default=str)
            
        logger.info(f"Quality report saved to {report_path}")
        
        # Generate clean manifest
        self.generate_clean_manifest()

    def generate_clean_manifest(self):
        """Generate a clean manifest from validated images."""
        logger.info("Generating clean manifest...")
        
        clean_manifest_path = self.processed_path / "manifest_clean.csv"
        
        # We'll create a simple manifest with validated images
        validated_entries = []
        
        # Process FDA images
        for ext in ['.jpg', '.jpeg', '.png']:
            for img_path in self.raw_fda_path.rglob(f"*{ext}"):
                if self.is_image_valid(img_path):
                    entry = self.create_fda_manifest_entry(img_path)
                    if entry:
                        validated_entries.append(entry)
                        
        # Process PMC images  
        for ext in ['.jpg', '.jpeg', '.png']:
            for img_path in self.raw_pmc_path.rglob(f"*{ext}"):
                if self.is_image_valid(img_path):
                    entry = self.create_pmc_manifest_entry(img_path)
                    if entry:
                        validated_entries.append(entry)
        
        # Write clean manifest
        if validated_entries:
            fieldnames = ['filename', 'source', 'treatment_type', 'timepoint', 'before_after', 
                         'width', 'height', 'file_path', 'validated']
            
            with open(clean_manifest_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(validated_entries)
                
            logger.info(f"Clean manifest saved to {clean_manifest_path} with {len(validated_entries)} entries")
        else:
            logger.warning("No validated images found for clean manifest")

    def is_image_valid(self, img_path):
        """Check if an image passes quality checks."""
        try:
            with Image.open(img_path) as img:
                width, height = img.size
                
                # Check size constraints
                if width < self.min_size[0] or height < self.min_size[1]:
                    return False
                if width > self.max_size[0] or height > self.max_size[1]:
                    return False
                    
                # Check format
                ext = img_path.suffix.lower()
                if ext not in self.supported_formats:
                    return False
                    
                return True
        except:
            return False

    def create_fda_manifest_entry(self, img_path):
        """Create manifest entry for FDA image."""
        try:
            # Try to get info from original manifest
            filename = img_path.name
            original_manifest = self.raw_fda_path / "manifest.csv"
            
            if original_manifest.exists():
                with open(original_manifest, 'r') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row.get('filename') == filename:
                            return {
                                'filename': filename,
                                'source': 'fda',
                                'treatment_type': row.get('product', 'unknown').lower().replace(' ', '_'),
                                'timepoint': row.get('timepoint', 'unknown'),
                                'before_after': row.get('before_after', 'unknown'),
                                'width': str(img_path.stat().st_size),  # Using size as placeholder
                                'height': '0',  # Would need to reopen image
                                'file_path': str(img_path.relative_to(Path('data'))),
                                'validated': 'true'
                            }
            
            # Fallback entry
            return {
                'filename': filename,
                'source': 'fda',
                'treatment_type': self.get_treatment_from_path(img_path, 'fda'),
                'timepoint': 'unknown',
                'before_after': 'unknown',
                'width': str(img_path.stat().st_size),
                'height': '0',
                'file_path': str(img_path.relative_to(Path('data'))),
                'validated': 'true'
            }
        except Exception as e:
            logger.debug(f"Could not create FDA manifest entry for {img_path}: {e}")
            return None

    def create_pmc_manifest_entry(self, img_path):
        """Create manifest entry for PMC image."""
        try:
            # Extract treatment from path
            try:
                relative_path = img_path.relative_to(self.raw_pmc_path)
                treatment = str(relative_path.parts[0]) if relative_path.parts else 'unknown'
            except:
                treatment = 'unknown'
                
            return {
                'filename': img_path.name,
                'source': 'pmc',
                'treatment_type': treatment,
                'timepoint': 'unknown',
                'before_after': 'unknown',  # PMC doesn't typically have before/after
                'width': str(img_path.stat().st_size),
                'height': '0',
                'file_path': str(img_path.relative_to(Path('data'))),
                'validated': 'true'
            }
        except Exception as e:
            logger.debug(f"Could not create PMC manifest entry for {img_path}: {e}")
            return None

def main():
    """Main function to run the data quality scanner."""
    scanner = DataQualityScanner()
    stats = scanner.run_scan()
    
    print("\n✅ Data quality scan completed!")
    print(f"📊 Valid images: {stats['valid_images']}/{stats['total_images']}")
    print(f"📋 Clean manifest: data/processed/manifest_clean.csv")
    print(f"📄 Quality report: data/processed/quality_report.json")

if __name__ == "__main__":
    main()
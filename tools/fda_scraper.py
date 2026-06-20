#!/usr/bin/env python3
"""
FDA SSED PDF Scraper for SKINgenius
Extracts clinical before/after photos from FDA Summary of Safety and Effectiveness Data (SSED) documents
"""

import os
import requests
import fitz  # PyMuPDF
import pandas as pd
import hashlib
from pathlib import Path
from typing import List, Dict, Tuple
import re
import json

# FDA SSED PDF URLs for all products
FDA_PDFS = {
    # Juvéderm family
    "Juvéderm Voluma XC": "https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033b.pdf",
    "Juvéderm Volbella XC": "https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S018b.pdf",
    "Juvéderm Vollure XC": "https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S020D.pdf",
    "Juvéderm Ultra XC": "https://www.accessdata.fda.gov/cdrh_docs/pdf5/p050047s044c.pdf",
    "Juvéderm Volux XC": "https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S065B.pdf",
    "Juvéderm Ultra Plus XC": "https://www.accessdata.fda.gov/cdrh_docs/pdf5/p050047c.pdf",
    "Juvéderm Ultra XC (original)": "https://www.accessdata.fda.gov/cdrh_docs/pdf5/p050047s027b.pdf",
    
    # Restylane family
    "Restylane Lyft": "https://www.accessdata.fda.gov/cdrh_docs/pdf5/P050047S033b.pdf",
    "Restylane Silk": "https://www.accessdata.fda.gov/cdrh_docs/pdf5/P050047S040b.pdf",
    "Restylane Defyne": "https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S036b.pdf",
    "Restylane Contour": "https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S060b.pdf",
    
    # Other fillers
    "Radiesse (Merz)": "https://www.accessdata.fda.gov/cdrh_docs/pdf3/P030009b.pdf",
    "Belotero Balance (Merz)": "https://www.accessdata.fda.gov/cdrh_docs/pdf10/P100038b.pdf",
    
    # Neurotoxins
    "Dysport": "https://www.accessdata.fda.gov/cdrh_docs/pdf12/P125013b.pdf",
    "Jeuveau": "https://www.accessdata.fda.gov/cdrh_docs/pdf7/P701001b.pdf",
    "Daxxify": "https://www.accessdata.fda.gov/cdrh_docs/pdf21/P210022b.pdf",
    
    # Existing products
    "Sculptra": "https://www.accessdata.fda.gov/cdrh_docs/pdf2/P020050b.pdf"
}

# Treatment zones commonly found in dermal filler SSEDs
TREATMENT_ZONES = {
    "nasolabial folds": ["nl", "nlfs", "nasolabial fold", "nasolabial folds"],
    "lips": ["lip", "lips", "vermillion", "oral commissure"],
    "cheeks": ["cheek", "cheeks", "malar", "midface"],
    "chin": ["chin", "mental"],
    "jawline": ["jaw", "jawline", "mandibular"],
    "temples": ["temple", "temporal"],
    "hands": ["hand", "dorsal hand"],
    "temples": ["temple", "temporal"]
}

def download_pdf(url: str, product_name: str) -> Path:
    """Download PDF from URL and save to temporary location"""
    # Create safe filename
    safe_name = re.sub(r'[^\w\s-]', '', product_name).strip().replace(' ', '_')
    filename = f"{safe_name}.pdf"
    filepath = Path("/tmp") / filename
    
    print(f"Downloading {product_name} from {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    
    with open(filepath, 'wb') as f:
        f.write(response.content)
    
    print(f"Downloaded {product_name} to {filepath}")
    return filepath

def extract_images_from_pdf(pdf_path: Path, product_name: str) -> List[Dict]:
    """Extract all images from PDF and return metadata"""
    images_data = []
    
    try:
        doc = fitz.open(pdf_path)
        print(f"Processing {product_name}: {len(doc)} pages")
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            if image_list:
                print(f"  Page {page_num + 1}: Found {len(image_list)} images")
                
                for img_index, img in enumerate(image_list):
                    try:
                        # Get image data
                        xref = img[0]
                        pix = fitz.Pixmap(doc, xref)
                        
                        # Skip if image is too small (likely icons/logos)
                        if pix.width < 100 or pix.height < 100:
                            pix = None
                            continue
                        
                        # Convert to RGB if necessary
                        if pix.n - pix.alpha < 4:  # GRAY or RGB
                            img_data = pix.tobytes("png")
                        else:  # CMYK: convert to RGB first
                            pix1 = fitz.Pixmap(fitz.csRGB, pix)
                            img_data = pix1.tobytes("png")
                            pix1 = None
                        
                        # Generate unique filename
                        img_hash = hashlib.md5(img_data).hexdigest()[:8]
                        safe_product = re.sub(r'[^\w\s-]', '', product_name).strip().replace(' ', '_')
                        img_filename = f"{safe_product}_page{page_num+1}_img{img_index+1}_{img_hash}.png"
                        
                        # Try to extract caption/context for before/after classification
                        caption = extract_image_caption(page, img)
                        before_after = classify_before_after(caption, img_index)
                        
                        images_data.append({
                            'filename': img_filename,
                            'product': product_name,
                'page_number': page_num + 1,
                            'image_index': img_index,
                            'width': pix.width,
                            'height': pix.height,
                            'caption': caption,
                            'before_after': before_after,
                            'image_data': img_data,
                            'img_hash': img_hash
                        })
                        
                        pix = None
                        
                    except Exception as e:
                        print(f"    Error extracting image {img_index}: {e}")
                        continue
        
        doc.close()
        
    except Exception as e:
        print(f"Error processing PDF {pdf_path}: {e}")
    
    return images_data

def extract_image_caption(page, img_ref) -> str:
    """Attempt to extract text near image for caption/context"""
    try:
        # Get text blocks near the image
        text_dict = page.get_text("dict")
        blocks = text_dict["blocks"]
        
        # Simple approach: get text from surrounding area
        # In a more sophisticated version, we'd use image coordinates
        page_text = page.get_text()
        
        # Look for common before/after indicators in nearby text
        lines = page_text.split('\n')
        relevant_lines = []
        
        for line in lines:
            line_lower = line.lower()
            if any(indicator in line_lower for indicator in 
                   ['before', 'after', 'baseline', 'week', 'month', 'pre-treatment', 'post-treatment']):
                relevant_lines.append(line.strip())
        
        return ' '.join(relevant_lines[:3])  # Return first 3 relevant lines
        
    except Exception:
        return ""

def classify_before_after(caption: str, img_index: int) -> str:
    """Classify image as before, after, or unknown based on caption and position"""
    caption_lower = caption.lower()
    
    # Check for explicit before/after indicators
    if any(word in caption_lower for word in ['before', 'baseline', 'pre-treatment', 'pre']):
        return 'before'
    elif any(word in caption_lower for word in ['after', 'post-treatment', 'post', 'week', 'month']):
        return 'after'
    
    # Fallback: alternating pattern assumption (common in clinical studies)
    # Even indices = before, odd indices = after
    if img_index % 2 == 0:
        return 'before'
    else:
        return 'after'

def extract_treatment_info(caption: str, product_name: str) -> Dict:
    """Extract treatment zone, timepoint, and other metadata from caption"""
    caption_lower = caption.lower()
    
    # Initialize default values
    treatment_zone = "unknown"
    timepoint = "unknown"
    
    # Extract treatment zone
    for zone, keywords in TREATMENT_ZONES.items():
        if any(keyword in caption_lower for keyword in keywords):
            treatment_zone = zone
            break
    
    # Extract timepoint using regex patterns
    time_patterns = [
        r'(\d+)\s*week',
        r'(\d+)\s*month',
        r'baseline',
        r'pre.*treatment',
        r'post.*treatment'
    ]
    
    for pattern in time_patterns:
        match = re.search(pattern, caption_lower)
        if match:
            if pattern == r'baseline':
                timepoint = 'baseline'
            elif pattern == r'pre.*treatment':
                timepoint = 'pre-treatment'
            elif pattern == r'post.*treatment':
                timepoint = 'post-treatment'
            else:
                number = match.group(1)
                if 'week' in pattern:
                    timepoint = f'{number} weeks'
                else:
                    timepoint = f'{number} months'
            break
    
    return {
        'treatment_zone': treatment_zone,
        'timepoint': timepoint
    }

def save_image(image_data: Dict, product_dir: Path, before_after: str):
    """Save extracted image to appropriate directory"""
    # Create before/after subdirectories
    ba_dir = product_dir / before_after
    ba_dir.mkdir(parents=True, exist_ok=True)
    
    # Save image
    filepath = ba_dir / image_data['filename']
    with open(filepath, 'wb') as f:
        f.write(image_data['image_data'])
    
    return filepath

def create_manifest_entry(image_data: Dict, treatment_info: Dict, source_url: str) -> Dict:
    """Create manifest entry for CSV"""
    return {
        'filename': image_data['filename'],
        'product': image_data['product'],
        'treatment_zone': treatment_info['treatment_zone'],
        'timepoint': treatment_info['timepoint'],
        'before_after': image_data['before_after'],
        'page_number': image_data['page_number'],
        'width': image_data['width'],
        'height': image_data['height'],
        'caption': image_data['caption'][:200],  # Truncate long captions
        'source_url': source_url
    }

def main():
    """Main scraping function"""
    print("Starting FDA SSED PDF Scraper...")
    
    # Base directories
    base_raw_dir = Path("/home/jason/.openclaw/workspaces/skingenius/data/raw/fda")
    base_raw_dir.mkdir(parents=True, exist_ok=True)
    
    # Manifest data
    manifest_entries = []
    
    # Process each PDF
    for product_name, url in FDA_PDFS.items():
        try:
            print(f"\n{'='*50}")
            print(f"Processing: {product_name}")
            print(f"{'='*50}")
            
            # Download PDF
            pdf_path = download_pdf(url, product_name)
            
            # Create product directory
            safe_product_name = re.sub(r'[^\w\s-]', '', product_name).strip().replace(' ', '_')
            product_dir = base_raw_dir / safe_product_name
            product_dir.mkdir(exist_ok=True)
            
            # Extract images
            images_data = extract_images_from_pdf(pdf_path, product_name)
            
            if not images_data:
                print(f"No images found in {product_name}")
                continue
            
            print(f"Found {len(images_data)} images in {product_name}")
            
            # Process each image
            for img_data in images_data:
                try:
                    # Extract treatment information
                    treatment_info = extract_treatment_info(img_data['caption'], product_name)
                    
                    # Save image
                    saved_path = save_image(img_data, product_dir, img_data['before_after'])
                    print(f"  Saved: {saved_path.name} ({img_data['before_after']})")
                    
                    # Create manifest entry
                    manifest_entry = create_manifest_entry(img_data, treatment_info, url)
                    manifest_entries.append(manifest_entry)
                    
                except Exception as e:
                    print(f"  Error processing image: {e}")
                    continue
            
            # Clean up temporary PDF
            pdf_path.unlink()
            
        except Exception as e:
            print(f"Error processing {product_name}: {e}")
            continue
    
    # Save manifest CSV
    if manifest_entries:
        manifest_df = pd.DataFrame(manifest_entries)
        manifest_path = base_raw_dir / "manifest.csv"
        manifest_df.to_csv(manifest_path, index=False)
        print(f"\nManifest saved to: {manifest_path}")
        print(f"Total images extracted: {len(manifest_entries)}")
        
        # Print summary statistics
        print("\nSummary Statistics:")
        print(f"Products processed: {manifest_df['product'].nunique()}")
        print(f"Before images: {len(manifest_df[manifest_df['before_after'] == 'before'])}")
        print(f"After images: {len(manifest_df[manifest_df['before_after'] == 'after'])}")
        print(f"Treatment zones: {manifest_df['treatment_zone'].unique()}")
    else:
        print("No images were extracted!")
    
    print("\nFDA SSED PDF Scraping Complete!")

if __name__ == "__main__":
    main()
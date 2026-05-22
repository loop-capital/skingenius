#!/usr/bin/env python3
"""
Crawl4AI Product Scraper for SKINgenius
Scrapes brand websites for product catalogs
"""

import asyncio
import json
import sys
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig

async def scrape_products(url, brand_name, selectors=None):
    """Scrape products from a brand website"""
    
    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1920,
        viewport_height=1080,
    )
    
    run_config = CrawlerRunConfig(
        wait_for="body",
        word_count_threshold=10,
        excluded_tags=['nav', 'footer', 'header', 'aside'],
        remove_overlay_elements=True,
    )
    
    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(
            url=url,
            config=run_config
        )
        
        if result.success:
            print(f"✅ Scraped {url}")
            print(f"   Title: {result.metadata.get('title', 'N/A')}")
            print(f"   Content length: {len(result.markdown.raw_markdown) if result.markdown else 0}")
            
            # Extract product info from markdown
            content = result.markdown.raw_markdown if result.markdown else ""
            
            # Basic extraction - look for product patterns
            products = extract_products_from_markdown(content, brand_name)
            
            return products
        else:
            print(f"❌ Failed to scrape {url}: {result.error_message}")
            return []

def extract_products_from_markdown(markdown, brand_name):
    """Extract product information from markdown content"""
    products = []
    lines = markdown.split('\n')
    
    current_product = None
    
    for line in lines:
        line = line.strip()
        
        # Look for product names (headings or bold text with price)
        if line.startswith('# ') or line.startswith('## ') or line.startswith('### '):
            if current_product:
                products.append(current_product)
            
            name = line.replace('#', '').strip()
            if len(name) < 100 and not any(skip in name.lower() for skip in ['menu', 'search', 'cart', 'account', 'login']):
                current_product = {
                    'name': name,
                    'brand': brand_name,
                    'category': 'other',
                    'key_ingredients': [],
                    'best_for': [],
                    'evidence_grade': 'B',
                    'price_range': None
                }
        
        # Look for prices
        if '$' in line and current_product:
            import re
            prices = re.findall(r'\$[0-9]+(?:\.[0-9]+)?', line)
            if prices:
                current_product['price_range'] = prices[0]
        
        # Look for ingredients
        if any(kw in line.lower() for kw in ['ingredients', 'key ingredients', 'contains']):
            if current_product:
                # Extract ingredient-like words
                words = line.replace('Ingredients:', '').replace('Key Ingredients:', '').split(',')
                current_product['key_ingredients'] = [w.strip() for w in words[:10] if len(w.strip()) > 2]
    
    if current_product:
        products.append(current_product)
    
    # Filter out non-products
    products = [p for p in products if len(p['name']) > 3 and len(p['name']) < 200]
    
    return products

async def main():
    if len(sys.argv) < 3:
        print("Usage: python scrape_products.py <url> <brand_name>")
        sys.exit(1)
    
    url = sys.argv[1]
    brand_name = sys.argv[2]
    
    print(f"🌐 Scraping {brand_name} from {url}")
    products = await scrape_products(url, brand_name)
    
    if products:
        output_file = f'skincare-research/data/products-{brand_name.lower().replace(" ", "-")}.json'
        with open(output_file, 'w') as f:
            json.dump(products, f, indent=2)
        print(f"\n✅ Saved {len(products)} products to {output_file}")
    else:
        print("\n⚠️ No products found")

if __name__ == "__main__":
    asyncio.run(main())

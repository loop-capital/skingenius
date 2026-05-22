# Crawl4AI Setup Guide

## Status: ✅ Installed & Ready

- **Version:** 0.8.6
- **Location:** `/home/jason/.local/lib/python3.12/site-packages/crawl4ai`
- **Playwright browsers:** chromium (2 versions), headless shell, ffmpeg
- **Python:** 3.12

## Quick Usage

### Basic crawl (single URL)
```python
from crawl4ai import AsyncWebCrawler
import asyncio

async def crawl(url):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        print(result.markdown)  # Clean markdown output
        print(result.links)     # All extracted links

asyncio.run(crawl("https://example.com"))
```

### With config options
```python
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
import asyncio

async def crawl():
    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1280,
        viewport_height=720,
    )
    
    run_config = CrawlerRunConfig(
        wait_until="networkidle",       # Wait for page to fully load
        css_selector="main",            # Only grab main content
        exclude_external_links=True,    # Strip external links
        word_count_threshold=10,        # Min words per section
        screenshot=True,                # Take a screenshot
    )
    
    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(
            url="https://example.com",
            config=run_config
        )
        print(result.markdown)
        if result.screenshot:
            with open("screenshot.png", "wb") as f:
                f.write(result.screenshot)

asyncio.run(crawl())
```

### Batch crawl (multiple URLs)
```python
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
import asyncio

async def crawl_multiple(urls):
    async with AsyncWebCrawler() as crawler:
        results = await crawler.arun_many(
            urls=urls,
            config=CrawlerRunConfig(
                word_count_threshold=10,
            )
        )
        for result in results:
            print(f"=== {result.url} ===")
            print(result.markdown[:500])
            print()

asyncio.run(crawl_multiple([
    "https://example.com/page1",
    "https://example.com/page2",
]))
```

### Extract structured data (LLM-friendly)
```python
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.extraction_strategy import LLMExtractionStrategy
import asyncio

async def extract():
    strategy = LLMExtractionStrategy(
        provider="ollama",           # or "openai", "anthropic"
        model="nemotron-3-super",
        instruction="Extract all product names, prices, and descriptions",
    )
    
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://example.com/products",
            config=CrawlerRunConfig(extraction_strategy=strategy)
        )
        print(result.extracted_content)

asyncio.run(extract())
```

### Sitemap crawl
```python
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
import asyncio

async def sitemap_crawl():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://example.com/sitemap.xml",
            config=CrawlerRunConfig(
                deep_crawl_strategy=BFSDeepCrawlStrategy(
                    max_depth=2,
                    max_pages=20,
                )
            )
        )
        print(f"Crawled {len(result)} pages")

asyncio.run(sitemap_crawl())
```

## CLI (not installed as command, use Python directly)
The `crawl4ai` CLI isn't linked. Use Python directly:
```bash
python3 -c "
from crawl4ai import AsyncWebCrawler
import asyncio
async def main():
    async with AsyncWebCrawler() as c:
        r = await c.arun('https://example.com')
        print(r.markdown[:1000])
asyncio.run(main())
"
```

## Tips
- **Use `wait_until="networkidle"`** for JS-heavy pages
- **Use `css_selector`** to target specific content areas
- **`result.markdown`** is clean, LLM-friendly markdown
- **`result.links`** has internal + external links extracted
- **`result.media`** has images, videos, etc.
- **Browser cache** is at `~/.cache/ms-playwright/`

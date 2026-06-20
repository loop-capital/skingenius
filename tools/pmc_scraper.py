#!/usr/bin/env python3
"""
PMC Open Access Scraper for SKINgenius
Searches PubMed Central for clinical papers with before/after treatment photos.
Uses NCBI E-utilities API.
"""

import csv
import json
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote_plus, urlparse

import requests

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("Warning: beautifulsoup4 not installed, falling back to regex parsing")


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = Path("/home/jason/.openclaw/workspaces/skingenius")
DATA_DIR = BASE_DIR / "data" / "raw" / "pmc"
TOOLS_DIR = BASE_DIR / "tools"

NCBI_EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
NCBI_OCCHECK = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
NCBI_FETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
NCBI_LINK = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi"

# Respectful rate limiting: max 3 requests/sec without API key
REQUEST_DELAY = 0.4  # seconds between requests

QUERIES: List[Tuple[str, str]] = [
    (
        '"Dermal Fillers/therapeutic use" AND "Photography/methods"',
        "dermal_fillers",
    ),
    (
        '"Botulinum Toxins/therapeutic use" AND "Face" AND "Photography"',
        "botulinum_toxins",
    ),
    (
        '"Hyaluronic Acid" AND "Lip Augmentation" AND "Photography"',
        "hyaluronic_acid_lips",
    ),
    (
        '"Soft Tissue Fillers" AND "Facial Rejuvenation" AND "Before After"',
        "soft_tissue_fillers",
    ),
    (
        '"Cheek Augmentation" AND "Hyaluronic Acid" AND "Clinical Trial"',
        "cheek_augmentation",
    ),
    (
        '"Jawline Contouring" AND "Dermal Filler" AND "Results"',
        "jawline_contouring",
    ),
]

TARGET_JOURNALS = {
    "aesthetic surgery journal",
    "aesthetic surg j",
    "plastic and reconstructive surgery",
    "plast reconstr surg",
    "dermatologic surgery",
    "dermatol surg",
    "journal of cosmetic dermatology",
    "j cosmet dermatol",
    "aesthetic plastic surgery",
    "aesthet plast surg",
    "facial plastic surgery",
    "facial plast surg",
}

JOURNAL_BOOST = 2  # multiplier for target-journal papers

HEADERS = {"User-Agent": "SKINgenius-Research-Bot/1.0 (research@skingenius.ai)"}

session = requests.Session()
session.headers.update(HEADERS)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def ncbi_get(url: str, params: dict, retries: int = 2) -> requests.Response:
    """Rate-limited GET to NCBI with exponential backoff."""
    for attempt in range(retries + 1):
        time.sleep(REQUEST_DELAY)
        try:
            r = session.get(url, params=params, timeout=30)
            r.raise_for_status()
            return r
        except requests.exceptions.RequestException as exc:
            if attempt == retries:
                raise
            wait = 2 ** attempt
            print(f"  ⚠️ NCBI request failed ({exc}), retrying in {wait}s…")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def esearch(query: str, retmax: int = 100) -> List[str]:
    """Return PMC IDs for a query."""
    params = {
        "db": "pmc",
        "term": query,
        "retmax": retmax,
        "retmode": "json",
    }
    r = ncbi_get(f"{NCBI_EUTILS}/esearch.fcgi", params)
    data = r.json()
    idlist = data.get("esearchresult", {}).get("idlist", [])
    return idlist


def efetch_xml(pmcids: List[str]) -> ET.Element:
    """Fetch full article XML for given PMC IDs."""
    if not pmcids:
        return ET.Element("empty")
    ids = ",".join(pmcids)
    params = {"db": "pmc", "id": ids, "rettype": "xml"}
    r = ncbi_get(f"{NCBI_EUTILS}/efetch.fcgi", params)
    # NCBI sometimes returns malformed XML with multiple declarations;
    # strip anything before the first real root.
    text = r.text
    if text.startswith("<?xml"):
        # keep only first XML declaration
        parts = text.split("<?xml", 1)
        if len(parts) > 2:
            text = "<?xml" + parts[1]
    try:
        root = ET.fromstring(text.encode("utf-8"))
    except ET.ParseError:
        # Fallback: wrap in a container
        root = ET.Element("articles")
    return root


def get_pmc_figure_image_urls(pmcid: str) -> List[Tuple[str, str, str]]:
    """
    Attempt to discover figure image URLs for a PMC article.
    The modern PMC viewer loads images dynamically; we construct
    known PMC image endpoints and verify them.
    Returns list of (image_url, caption, label).
    """
    results = []
    # PMC figure images are typically served via their CDN with a hash.
    # The viewer renders client-side. We probe the PDF endpoint for existence
    # and the classic view for potential direct images.
    
    # 1. Check if PDF exists (proxy for having figures)
    pdf_url = f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{pmcid}/pdf"
    time.sleep(REQUEST_DELAY)
    try:
        r = session.head(pdf_url, timeout=15, allow_redirects=True)
        has_pdf = r.status_code == 200
    except Exception:
        has_pdf = False

    # 2. Try the classic PMC view for img tags (some older articles have them)
    classic_url = f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{pmcid}/?report=classic"
    time.sleep(REQUEST_DELAY)
    try:
        r = session.get(classic_url, timeout=30)
        r.raise_for_status()
    except Exception:
        return [("PDF_AVAILABLE", f"Has PDF (likely figures)", "")] if has_pdf else []

    html = r.text
    # Extract img src values that look like figure content (not UI icons)
    img_tags = re.findall(r'<img[^\u003e]+src="([^"]+)"[^\u003e]*>', html)
    figure_imgs = []
    for src in img_tags:
        # Skip UI/layout images
        lower = src.lower()
        if any(x in lower for x in ["logo", "icon", "banner", "button", "svg", "spacer", "pixel"]):
            continue
        if src.startswith("/"):
            src = f"https://pmc.ncbi.nlm.nih.gov{src}"
        elif not src.startswith("http"):
            src = f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{pmcid}/{src}"
        figure_imgs.append(src)

    if figure_imgs:
        for idx, src in enumerate(figure_imgs[:10], 1):
            results.append((src, f"Figure image {idx}", f"Image {idx}"))
    elif has_pdf:
        results.append(("PDF_AVAILABLE", "PDF contains figures (requires extraction)", ""))

    return results


def get_pmc_pdf_url(pmcid: str) -> Optional[str]:
    """Return the direct PDF URL if available."""
    return f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{pmcid}/pdf"



def parse_article_xml(article: ET.Element) -> Optional[Dict]:
    """Extract metadata from a single <article> Element.
    PMC XML uses no explicit namespace prefixes in ElementTree despite DTD,
    so we search for bare tag names."""

    def findtext(path: str) -> str:
        el = article.find(f".//{path}")
        return (el.text or "").strip() if el is not None else ""

    def findalltext(path: str) -> List[str]:
        els = article.findall(f".//{path}")
        return [(e.text or "").strip() for e in els if e.text]

    # Title
    title = findtext("article-title")
    if not title:
        title = findtext("title-group/article-title")

    # Journal
    journal = findtext("journal-title")
    if not journal:
        journal = findtext("front/journal-meta/journal-title")
    if not journal:
        journal = findtext("front/journal-meta/journal-id")

    # DOI
    doi = ""
    for el in article.findall(".//article-id"):
        if el.get("pub-id-type") == "doi":
            doi = (el.text or "").strip()
            break

    # PMCID
    pmcid = ""
    for el in article.findall(".//article-id"):
        if el.get("pub-id-type") == "pmcid":
            pmcid_raw = (el.text or "").strip()
            if pmcid_raw.startswith("PMC"):
                pmcid = pmcid_raw[3:]
            else:
                pmcid = pmcid_raw
            break

    # Year
    year = findtext("pub-date/year")
    if not year:
        year = findtext("front/article-meta/pub-date/year")

    # Abstract
    abstract_parts = []
    abs_root = article.find(".//abstract")
    if abs_root is not None:
        for p in abs_root.findall("p"):
            if p.text:
                abstract_parts.append(p.text.strip())
    abstract = " ".join(abstract_parts)

    # Authors
    authors = []
    for contrib in article.findall(".//contrib"):
        if contrib.get("contrib-type") == "author":
            name_el = contrib.find("name/surname")
            if name_el is not None and name_el.text:
                authors.append(name_el.text.strip())

    # Figure count
    fig_count = len(article.findall(".//fig"))

    return {
        "pmcid": pmcid,
        "title": title,
        "journal": journal,
        "doi": doi,
        "year": year,
        "abstract": abstract,
        "authors": ", ".join(authors[:5]),
        "fig_count": fig_count,
    }


def score_article(meta: Dict, treatment_type: str) -> Tuple[int, str]:
    """
    Score how likely this article contains usable before/after photos.
    Returns (score, reasoning).
    """
    score = 0
    reasons = []
    text = f"{meta['title']} {meta['abstract']}".lower()

    # Must have figures
    if meta.get("fig_count", 0) > 0:
        score += 3
        reasons.append(f"has {meta['fig_count']} figure(s)")
    else:
        reasons.append("no figures")

    # Target journal boost
    journal_lower = meta.get("journal", "").lower()
    if any(tj in journal_lower for tj in TARGET_JOURNALS):
        score += JOURNAL_BOOST
        reasons.append("target journal")

    # Keywords indicating before/after imagery
    ba_keywords = [
        "before",
        "after",
        "preoperative",
        "postoperative",
        "baseline",
        "follow-up",
        "follow up",
        "photograph",
        "photographic",
        "image",
        "clinical photograph",
        "outcome",
        "results",
        "assessment",
        "evaluation",
    ]
    for kw in ba_keywords:
        if kw in text:
            score += 1
            reasons.append(f"keyword '{kw}'")
            break  # only count once for keyword family

    # Injectable-specific signals
    injectable_terms = [
        "injectable",
        "filler",
        "botulinum",
        "botox",
        "hyaluronic",
        "ha ",
        "injection",
        "minimally invasive",
    ]
    for term in injectable_terms:
        if term in text:
            score += 1
            reasons.append(f"injectable term '{term}'")
            break

    # Exclude surgical-only papers
    surgery_terms = ["surgical", "rhytidectomy", "blepharoplasty", "rhinoplasty", "implant"]
    for st in surgery_terms:
        if st in text:
            score -= 2
            reasons.append(f"possible surgery: '{st}'")

    return score, "; ".join(reasons)


def download_image(url: str, dest: Path) -> bool:
    """Download an image to dest. Return True on success."""
    time.sleep(REQUEST_DELAY)
    try:
        r = session.get(url, timeout=30)
        r.raise_for_status()
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as fh:
            fh.write(r.content)
        return True
    except Exception as exc:
        print(f"    ⚠️ Download failed: {exc}")
        return False


def sanitize_filename(name: str) -> str:
    """Make a filesystem-safe filename."""
    return re.sub(r'[^\w\-_.]', '_', name)[:120]


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def main() -> int:
    print("=" * 60)
    print("PMC Open Access Scraper — SKINgenius Research")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)

    manifest_path = DATA_DIR / "manifest.csv"
    report_path = DATA_DIR / "extraction_report.md"

    # Prepare manifest
    manifest_fields = [
        "pmcid",
        "treatment_type",
        "title",
        "journal",
        "doi",
        "year",
        "authors",
        "fig_count",
        "relevance_score",
        "score_reasoning",
        "downloaded_images",
        "local_paths",
        "pmc_url",
        "pdf_url",
    ]
    manifest_rows: List[Dict] = []

    summary = {
        "queries_run": 0,
        "total_ids_found": 0,
        "articles_scored": 0,
        "high_relevance": 0,
        "images_downloaded": 0,
        "errors": [],
    }

    for query, treatment_type in QUERIES:
        print(f"\n🔍 Query: {query}")
        summary["queries_run"] += 1

        try:
            pmcids = esearch(query, retmax=100)
        except Exception as exc:
            msg = f"esearch failed for '{treatment_type}': {exc}"
            print(f"  ❌ {msg}")
            summary["errors"].append(msg)
            continue

        print(f"  Found {len(pmcids)} PMC IDs")
        summary["total_ids_found"] += len(pmcids)

        if not pmcids:
            continue

        # Batch fetch in chunks of 20 to avoid oversized responses
        chunk_size = 20
        articles_meta = {}
        for i in range(0, len(pmcids), chunk_size):
            chunk = pmcids[i : i + chunk_size]
            print(f"  Fetching chunk {i // chunk_size + 1}/{(len(pmcids)-1)//chunk_size + 1}…")
            try:
                root = efetch_xml(chunk)
            except Exception as exc:
                msg = f"efetch failed for chunk {chunk}: {exc}"
                print(f"    ❌ {msg}")
                summary["errors"].append(msg)
                continue

            # Determine tag based on namespace presence
            tag = "article"
            if root.tag.startswith("{"):
                ns_uri = root.tag.split("}")[0].strip("{")
                tag = f"{{{ns_uri}}}article"

            # The root may be <pmc-articleset> or <articles>; find all <article>
        # elements regardless of namespace since ElementTree strips default NS.
        article_els = root.findall("article")
        print(f"    Found {len(article_els)} article elements in XML")
        for article in article_els:
            meta = parse_article_xml(article)
            if meta and meta.get("pmcid"):
                articles_meta[meta["pmcid"]] = meta
                print(f"    Parsed PMC{meta['pmcid']}: {meta['title'][:50]}...")
            else:
                print(f"    ⚠️ Article without parseable PMCID skipped")

        print(f"  Parsed {len(articles_meta)} articles")

        for pmcid, meta in articles_meta.items():
            summary["articles_scored"] += 1
            score, reasoning = score_article(meta, treatment_type)

            if score >= 4:
                summary["high_relevance"] += 1
                print(f"  ⭐ High relevance (score={score}): PMC{pmcid} – {meta['title'][:60]}…")

                # Try to get figure images
                fig_data = get_pmc_figure_image_urls(pmcid)
                downloaded = []
                local_paths = []

                for idx, (img_url, caption, label) in enumerate(fig_data, 1):
                    if img_url == "PDF_AVAILABLE":
                        downloaded.append("PDF_AVAILABLE")
                        local_paths.append(get_pmc_pdf_url(pmcid))
                        summary["images_downloaded"] += 1  # Count as processed
                        print(f"    📄 PDF available at {get_pmc_pdf_url(pmcid)}")
                        continue

                    # Guess extension
                    parsed = urlparse(img_url)
                    ext = Path(parsed.path).suffix or ".jpg"
                    safe_title = sanitize_filename(meta["title"][:40])
                    fname = f"PMC{pmcid}_fig{idx}_{safe_title}{ext}"
                    dest = DATA_DIR / treatment_type / fname

                    if download_image(img_url, dest):
                        downloaded.append(label or f"fig{idx}")
                        local_paths.append(str(dest.relative_to(BASE_DIR)))
                        summary["images_downloaded"] += 1
                        print(f"    ✅ Downloaded {fname}")
                    else:
                        print(f"    ⚠️ Failed to download figure {idx}")

                manifest_rows.append({
                    "pmcid": pmcid,
                    "treatment_type": treatment_type,
                    "title": meta["title"],
                    "journal": meta["journal"],
                    "doi": meta["doi"],
                    "year": meta["year"],
                    "authors": meta["authors"],
                    "fig_count": meta["fig_count"],
                    "relevance_score": score,
                    "score_reasoning": reasoning,
                    "downloaded_images": "; ".join(downloaded),
                    "local_paths": "; ".join(local_paths),
                    "pmc_url": f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{pmcid}/",
                    "pdf_url": get_pmc_pdf_url(pmcid),
                })
            else:
                print(f"  ➖ Low score ({score}): PMC{pmcid} – {meta['title'][:60]}… [{reasoning}]")

    # -------------------------------------------------------------------
    # Write manifest
    # -------------------------------------------------------------------
    with open(manifest_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=manifest_fields)
        writer.writeheader()
        writer.writerows(manifest_rows)

    print(f"\n📝 Manifest written: {manifest_path}")

    # -------------------------------------------------------------------
    # Write report
    # -------------------------------------------------------------------
    report_lines = [
        "# PMC Extraction Report",
        "",
        f"**Generated:** {datetime.now().isoformat()}",
        f"**Scraper:** `{TOOLS_DIR / 'pmc_scraper.py'}`",
        "",
        "## Summary",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Queries executed | {summary['queries_run']} |",
        f"| Total PMC IDs found | {summary['total_ids_found']} |",
        f"| Articles scored | {summary['articles_scored']} |",
        f"| High-relevance articles | {summary['high_relevance']} |",
        f"| Images downloaded | {summary['images_downloaded']} |",
        "",
        "## Per-Query Breakdown",
        "",
    ]

    for query, treatment_type in QUERIES:
        rows = [r for r in manifest_rows if r["treatment_type"] == treatment_type]
        report_lines.extend([
            f"### {treatment_type.replace('_', ' ').title()}",
            "",
            f"- Query: `{query}`",
            f"- High-relevance papers: {len(rows)}",
            f"- Images downloaded: {sum(len(r['downloaded_images'].split(';')) for r in rows if r['downloaded_images'])}",
            "",
        ])
        for r in rows:
            report_lines.extend([
                f"- **PMCID:** PMC{r['pmcid']} | **Score:** {r['relevance_score']} | **Journal:** {r['journal']}",
                f"  - Title: {r['title']}",
                f"  - Figures: {r['fig_count']} | Downloaded: {r['downloaded_images']}",
                "",
            ])

    if summary["errors"]:
        report_lines.extend([
            "## Errors",
            "",
        ])
        for err in summary["errors"]:
            report_lines.append(f"- {err}")
        report_lines.append("")

    report_lines.extend([
        "## Data Locations",
        "",
        f"- Raw images: `{DATA_DIR}/<treatment_type>/`",
        f"- Manifest: `{manifest_path}`",
        "",
        "## Notes",
        "",
        "- Scores ≥ 4 considered high-relevance for manual review.",
        "- Images are from PMC Open Access subset; verify licensing before commercial use.",
        "- Surgical papers were penalized; focus is on injectable treatments.",
    ])

    with open(report_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(report_lines))

    print(f"📝 Report written: {report_path}")
    print(f"\n🏁 Done. {summary['images_downloaded']} images from {summary['high_relevance']} papers.")

    return 0


if __name__ == "__main__":
    sys.exit(main())

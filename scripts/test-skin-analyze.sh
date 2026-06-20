#!/usr/bin/env bash
# Test script for /api/v1/skin/analyze endpoint
# Usage: ./scripts/test-skin-analyze.sh

set -e

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1/skin/analyze"

echo "=== SKINgenius Skin Analysis API Test ==="
echo ""

# Test 1: GET info
echo "Test 1: GET $API_URL (info endpoint)..."
curl -s "$API_URL" | jq . || echo "GET info failed"
echo ""

# Test 2: POST without file (should error)
echo "Test 2: POST without photo (should return 400)..."
curl -s -X POST "$API_URL" -w "\nHTTP Status: %{http_code}\n" | tail -3
echo ""

# Test 3: POST with invalid file type
echo "Test 3: POST with text file (should return 400)..."
echo "not an image" > /tmp/fake.txt
curl -s -X POST "$API_URL" -F "photo=@/tmp/fake.txt" -w "\nHTTP Status: %{http_code}\n" | tail -3
echo ""

# Test 4: POST with a real image (requires test image)
echo "Test 4: POST with JPEG test image (Free tier)..."
if [ -f "./test-photo.jpg" ]; then
  curl -s -X POST "$API_URL" \
    -F "photo=@./test-photo.jpg" \
    -F "skin_tone=3" \
    -w "\nHTTP Status: %{http_code}\n" | jq . || echo "POST analyze failed"
else
  echo "⚠️  test-photo.jpg not found. Create a test image to run this test."
  echo "   Example: curl -L 'https://picsum.photos/400/400' -o test-photo.jpg"
fi
echo ""

# Test 5: Headers check
echo "Test 5: Check rate limit headers..."
if [ -f "./test-photo.jpg" ]; then
  curl -s -I -X POST "$API_URL" -F "photo=@./test-photo.jpg" | grep -i "x-ratelimit\|x-analysis" || echo "No rate limit headers"
else
  echo "⚠️  Skipped (no test image)"
fi
echo ""

echo "=== Tests Complete ==="
echo ""
echo "To test Pro tier, add header: -H 'x-test-user-id: YOUR_USER_ID'"
echo "Ensure Ollama is running: ollama run gemma2:2b"

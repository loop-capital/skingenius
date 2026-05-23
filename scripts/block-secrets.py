#!/usr/bin/env python3
"""Block commits containing secrets (API keys, tokens, passwords)."""
import sys
import re
import os

SECRET_PATTERNS = [
    # Supabase keys
    r'eyJ[a-zA-Z0-9_-]{50,}\.[a-zA-Z0-9_-]{50,}\.[a-zA-Z0-9_-]{50,}',
    # Generic high-entropy strings after secret-like var names
    r'(?i)(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key|supabase[_-]?anon[_-]?key)\s*[=:]\s*["\'][a-zA-Z0-9_/-]{20,}["\']',
    # AWS keys
    r'AKIA[0-9A-Z]{16}',
    # OpenAI / Anthropic keys
    r'sk-[a-zA-Z0-9]{20,}',
    r'sk-ant-[a-zA-Z0-9_-]{20,}',
]

ALLOWED_PATTERNS = [
    r'["\']test["\']',
    r'["\']xxx+["\']',
    r'["\']your[_-]?(api|secret|key|token)',
    r'process\.env\.',
    r'\$\{.*\}',
    r'env\.',
    r'NEXT_PUBLIC_',  # client-side env vars are OK
]

def is_allowed(line, match):
    for pattern in ALLOWED_PATTERNS:
        if re.search(pattern, line):
            return True
    return False

def main():
    staged = os.popen('git diff --cached --name-only --diff-filter=ACMR').read().strip().split('\n')
    blocked = []

    for filepath in staged:
        if not filepath.strip():
            continue
        if any(filepath.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg', '.lock', '.map']):
            continue

        try:
            content = os.popen(f'git show ":{filepath}" 2>/dev/null').read()
        except Exception:
            continue

        for line_num, line in enumerate(content.split('\n'), 1):
            for pattern in SECRET_PATTERNS:
                match = re.search(pattern, line)
                if match and not is_allowed(line, match):
                    blocked.append(f'{filepath}:{line_num}: {line.strip()[:80]}')

    if blocked:
        print('🚫 SECRET DETECTED — Commit blocked!')
        print()
        print('The following lines appear to contain secrets:')
        for b in blocked:
            print(f'  {b}')
        print()
        print('To fix:')
        print('  1. Move secrets to .env.local (already gitignored)')
        print('  2. Use process.env.SECRET_NAME instead of hardcoded values')
        print()
        print('To bypass (NOT recommended): git commit --no-verify')
        sys.exit(1)

    sys.exit(0)

if __name__ == '__main__':
    main()
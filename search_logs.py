#!/usr/bin/env python3
"""Search Claude Code conversation logs for Prayer Walk / Coverage discussions."""
import json
import os
import re
import sys
from pathlib import Path

LOG_DIR = Path(r"C:\Users\elija\.claude\projects\C--Users-elija")
SKIP_FILES = {"f92555ad-0a13-4614-8df1-f376fa6af8b9.jsonl"}  # current session

# Case-insensitive patterns
PATTERNS = [
    r"prayer\s*walk",
    r"prayer\s*walking",
    r"\bcoverage\b",
    r"prayer\s*map",
    r"prayer\s*ministry\s*director",
    r"intercession",
    r"intercessor",
    r"prayer\s*route",
]
COMBINED = re.compile("|".join(PATTERNS), re.IGNORECASE)

def extract_text(content):
    """Extract plain text from a content field that may be string or list."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                if item.get("type") == "text":
                    parts.append(item.get("text", ""))
                elif item.get("type") == "tool_use":
                    # include tool inputs as searchable text
                    parts.append(json.dumps(item.get("input", {}), ensure_ascii=False))
                elif item.get("type") == "tool_result":
                    c = item.get("content", "")
                    if isinstance(c, str):
                        parts.append(c)
                    elif isinstance(c, list):
                        for sub in c:
                            if isinstance(sub, dict) and sub.get("type") == "text":
                                parts.append(sub.get("text", ""))
        return "\n".join(parts)
    return ""

def scan_file(path):
    hits = []
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for lineno, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                # cheap pre-filter
                if not COMBINED.search(line):
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = rec.get("message", {})
                role = msg.get("role") or rec.get("type", "unknown")
                content = msg.get("content", "")
                text = extract_text(content)
                if not text:
                    continue
                # Skip tool results that just contain the search pattern as part of metadata
                for m in COMBINED.finditer(text):
                    start = max(0, m.start() - 500)
                    end = min(len(text), m.end() + 200)
                    snippet = text[start:end]
                    ts = rec.get("timestamp", "")
                    hits.append({
                        "file": path.name,
                        "line": lineno,
                        "role": role,
                        "ts": ts,
                        "match": m.group(0),
                        "snippet": snippet,
                    })
                    break  # one hit per line is enough
    except Exception as e:
        print(f"ERROR reading {path.name}: {e}", file=sys.stderr)
    return hits

def main():
    all_hits = []
    files = sorted(LOG_DIR.glob("*.jsonl"))
    for p in files:
        if p.name in SKIP_FILES:
            continue
        hits = scan_file(p)
        all_hits.extend(hits)
        if hits:
            print(f"{p.name}: {len(hits)} hits", file=sys.stderr)
    # Group by file, sort by line
    all_hits.sort(key=lambda h: (h["file"], h["line"]))
    out = Path(r"C:\Users\elija\coverage\search_results.txt")
    with open(out, "w", encoding="utf-8") as f:
        cur_file = None
        for h in all_hits:
            if h["file"] != cur_file:
                cur_file = h["file"]
                f.write(f"\n\n{'='*80}\nFILE: {cur_file}\n{'='*80}\n")
            f.write(f"\n--- line {h['line']} | role={h['role']} | ts={h['ts']} | match='{h['match']}' ---\n")
            f.write(h["snippet"])
            f.write("\n")
    print(f"Total hits: {len(all_hits)}", file=sys.stderr)
    print(f"Written to {out}", file=sys.stderr)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Find ONLY user-role messages that mention prayer-walk / coverage substantively (not just file dumps)."""
import json
import re
from pathlib import Path

LOG_DIR = Path(r"C:\Users\elija\.claude\projects\C--Users-elija")
SKIP_FILES = {"f92555ad-0a13-4614-8df1-f376fa6af8b9.jsonl"}

PATTERNS = [
    r"prayer\s*walk",
    r"\bcoverage\b",
    r"prayer\s*map",
    r"prayer\s*ministry\s*director",
]
COMBINED = re.compile("|".join(PATTERNS), re.IGNORECASE)

# Strings that mark a tool-result / file-dump rather than Elijah's own words
DUMP_MARKERS = [
    "# Ideas Backlog",
    "Ideas Backlog — Unstarted",
    "## Prayer Walk App",
    "### Prayer Walk App",
    "/coverage\n",  # gitignore
    "New project ideas stored",
    "<system-reminder>",
    "spin 10x + 70% swell",
    "## Apps & Tools (Mobile/Web)",
    "tool_use_id",
    "policy_spec",
]

def extract_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text", ""))
        return "\n".join(parts)
    return ""

def is_dump(text):
    return any(m in text for m in DUMP_MARKERS)

def main():
    hits = []
    for p in sorted(LOG_DIR.glob("*.jsonl")):
        if p.name in SKIP_FILES:
            continue
        try:
            with open(p, "r", encoding="utf-8", errors="replace") as f:
                for lineno, line in enumerate(f, 1):
                    if not COMBINED.search(line):
                        continue
                    try:
                        rec = json.loads(line)
                    except:
                        continue
                    if rec.get("type") != "user":
                        continue
                    msg = rec.get("message", {})
                    if msg.get("role") != "user":
                        continue
                    content = msg.get("content", "")
                    text = extract_text(content)
                    if not text or is_dump(text):
                        continue
                    if not COMBINED.search(text):
                        continue
                    # Substantive: must be user-typed (not a tool-result paste)
                    # Heuristic: relatively short, no markdown table dumps, no opening "1\t"
                    if text.startswith(tuple(str(i) for i in range(10))) and "\t" in text[:5]:
                        continue
                    hits.append({
                        "file": p.name,
                        "line": lineno,
                        "ts": rec.get("timestamp", ""),
                        "text": text.strip()
                    })
        except Exception as e:
            print(f"err {p.name}: {e}")
    hits.sort(key=lambda h: h["ts"])
    out = Path(r"C:\Users\elija\coverage\user_reactions.txt")
    with open(out, "w", encoding="utf-8") as f:
        for h in hits:
            f.write(f"\n=== {h['file']} | line {h['line']} | {h['ts']} ===\n")
            f.write(h["text"][:2000])
            f.write("\n")
    print(f"Wrote {len(hits)} substantive user messages to {out}")

if __name__ == "__main__":
    main()

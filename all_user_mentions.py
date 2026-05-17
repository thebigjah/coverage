#!/usr/bin/env python3
"""Cast a wider net: every user-role STRING content (not list) containing the patterns, any date."""
import json, re
from pathlib import Path

LOG_DIR = Path(r"C:\Users\elija\.claude\projects\C--Users-elija")
SKIP = {"f92555ad-0a13-4614-8df1-f376fa6af8b9.jsonl"}
PAT = re.compile(r"prayer\s*walk|prayer\s*map|prayer\s*ministry|prayer\s*route|intercession|intercessor|\bcoverage\b", re.IGNORECASE)

results = []
for p in sorted(LOG_DIR.glob("*.jsonl")):
    if p.name in SKIP: continue
    try:
        with open(p, "r", encoding="utf-8", errors="replace") as f:
            for ln, line in enumerate(f, 1):
                if not PAT.search(line): continue
                try: rec = json.loads(line)
                except: continue
                if rec.get("type") != "user": continue
                msg = rec.get("message", {})
                content = msg.get("content")
                if not isinstance(content, str): continue
                text = content.strip()
                if not text or len(text) > 1500: continue
                if "<system-reminder>" in text or "<command-" in text or "<task-notification>" in text or "<local-command" in text: continue
                if not PAT.search(text): continue
                results.append((rec.get("timestamp",""), p.name, ln, text))
    except: pass

results.sort()
out = Path(r"C:\Users\elija\coverage\all_user_typed.txt")
with open(out, "w", encoding="utf-8") as f:
    for ts, fn, ln, t in results:
        f.write(f"\n=== {ts} | {fn}:{ln} ===\n{t}\n")
print(f"{len(results)} user-typed mentions")

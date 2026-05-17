#!/usr/bin/env python3
"""Dump every user-role message (typed input only, not tool_result) for sessions after May 14 — look for ANY reaction."""
import json
from pathlib import Path

LOG_DIR = Path(r"C:\Users\elija\.claude\projects\C--Users-elija")
# Sessions on/after 2026-05-14
TARGETS = [
    "ad5705f9-e786-45e5-b84f-76f31356f66b.jsonl",  # May 14/15
    "2267a7c0-cbcc-4369-8ded-dcdb6cdd24a3.jsonl",  # May 15 (autonomous block + PR-FAQ)
    "40c49235-dbf5-4621-a143-b893c644b5cc.jsonl",  # May 15
    "ee4a3168-3bb8-487a-ae38-628875ba3681.jsonl",  # May 12
]
# Get all sessions sorted by mtime to find post-May-15 sessions
import os
all_files = [(p, p.stat().st_mtime) for p in LOG_DIR.glob("*.jsonl")]
all_files.sort(key=lambda x: x[1])

out = Path(r"C:\Users\elija\coverage\user_msgs_chronological.txt")
with open(out, "w", encoding="utf-8") as f:
    for p, mt in all_files:
        if p.name == "f92555ad-0a13-4614-8df1-f376fa6af8b9.jsonl":
            continue
        try:
            with open(p, "r", encoding="utf-8", errors="replace") as fh:
                for lineno, line in enumerate(fh, 1):
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
                    # Only show typed strings (skip tool_result lists)
                    if not isinstance(content, str):
                        continue
                    text = content.strip()
                    if not text or len(text) > 800:
                        continue
                    # skip command outputs that begin with file dumps / system reminders
                    if text.startswith("<command-") or "<system-reminder>" in text[:200]:
                        continue
                    ts = rec.get("timestamp", "")
                    if ts < "2026-05-15T14:00":
                        continue
                    f.write(f"\n=== {p.name} | line {lineno} | {ts} ===\n{text}\n")
        except Exception as e:
            pass
print(f"Wrote to {out}")

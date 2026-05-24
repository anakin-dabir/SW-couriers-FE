#!/usr/bin/env python3
from pathlib import Path

tag = "div"
for rel in [
    "src/components/pages/Billing/AccountStatementGeneratePreview.tsx",
]:
    p = Path(__file__).resolve().parents[1] / rel
    t = p.read_text(encoding="utf-8")
    t = t.replace("<motion ", f"<{tag} ")
    t = t.replace("</motion>", f"</{tag}>")
    p.write_text(t, encoding="utf-8")
    print("fixed", rel)

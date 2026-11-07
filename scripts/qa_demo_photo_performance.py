#!/usr/bin/env python3
"""Verify mobile demo images and generated links before a Pages release."""
import argparse
import json
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("--root", default=".output/public")
args = p.parse_args()
root = Path(args.root)
report = root / "demos/image-performance.json"
assert report.exists(), "Missing optimizer manifest"
m = json.loads(report.read_text(encoding="utf-8"))
assert m["image_count"] >= 35, "Too few optimized photos"
assert m["saved_percent"] > 38, "Too little data saved"
gallery = (root / "demos/index.html").read_text(encoding="utf-8")
for name in ("sova/resources/03-campaign.webp",
             "golden-grid/resources/golden-1.webp",
             "la-vie-in-pink/resources/36a1bfe5-3660-4b7e-964d-8031fe824941.webp",
             "marea-wigs-miami/resources/01-hero.webp"):
    assert "/demos/" + name in gallery, "Gallery image not optimized: " + name
# The interactive website preview iframe must load immediately when opened.
# Only image thumbnails need deferred loading in the catalog.
import re
card_images = re.findall(r'<div class="demo-art">\s*(<img\b[^>]*>)', gallery)
assert len(card_images) >= 10, "Expected demo catalog card photos"
assert all('loading="lazy"' in img for img in card_images), "A catalog card is still eagerly loaded"
# The visible hero can use eager to improve first-screen display.
for demo in ("la-vie-in-pink", "golden-grid", "marea-wigs-miami", "sova", "lavender-edit"):
    items = [a for a in m["assets"] if a["demo"] == demo]
    assert len(items) >= (7 if demo == "lavender-edit" else 8), (demo, len(items))
    assert m["replacements"][demo] > 0, "References not updated: " + demo
    for a in items:
        assert (root / "demos" / demo / a["output"]).is_file()
        assert a["optimized_bytes"] <= a["original_bytes"] * 0.92
js = (root / "demos/la-vie-in-pink/assets/index-BnbJ7qEi.js").read_text(encoding="utf-8")
assert "36a1bfe5-3660-4b7e-964d-8031fe824941.webp" in js, "Hero photo not converted in La Vie"
assert any(".webp" in f.read_text(encoding="utf-8")
           for f in (root / "demos/golden-grid/assets").glob("*.js")), "Golden Grid JS not updated"
print("PASS: Optimized", m["image_count"], "images; transferred bytes down", m["saved_percent"], "%")

#!/usr/bin/env python3
"""Create fast first-party WebP variants for the public booking-flow and setup cards.
Build-only output, no external dependencies beyond Pillow (already in Pages CI).
The approved source images stay untouched. Run before Vite builds and route QA.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "bundle-landing"
OUTPUT = SOURCE / "optimized"
OUTPUT.mkdir(parents=True, exist_ok=True)

for name in ("booking", "command", "hero", "ai"):
    original = SOURCE / f"bundle-{name}.png"
    with Image.open(original) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        wide = img.copy()
        wide.thumbnail((1120, 760), Image.Resampling.LANCZOS)
        wide_file = OUTPUT / f"{name}.webp"
        wide.save(wide_file, "WEBP", quality=78, method=6)
        assert wide_file.stat().st_size < 320000, f"Too large: {wide_file}"
        print(f"FLOW WIDE {name}: {wide.width}x{wide.height}, {wide_file.stat().st_size} bytes")
        if name != "ai":
            portrait = ImageOps.fit(
                img, (320, 420), method=Image.Resampling.LANCZOS,
                centering=(0.5, 0.32)
            )
            thumb_file = OUTPUT / f"{name}-thumb.webp"
            portrait.save(thumb_file, "WEBP", quality=76, method=6)
            assert thumb_file.stat().st_size < 90000, f"Too large: {thumb_file}"
            print(f"FLOW THUMB {name}: {thumb_file.stat().st_size} bytes")
print("FLOW IMAGE QA: all approved photographs optimized locally")

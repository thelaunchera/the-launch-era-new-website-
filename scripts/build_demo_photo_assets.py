#!/usr/bin/env python3
"""Prepare the sample demo's user-owned cleaning images as local, optimized WebP.

These source Drive assets were selected from folders that the owner has shared
with anyone who has the link. They are ONLY used in the fictional public sample.
The live website does not request Google Drive URLs. Each image has a safe local
fallback already in the repository, so a transient Drive failure never renders
a broken photo in a customer's browser.

Usage: python scripts/build_demo_photo_assets.py
"""
from __future__ import annotations

import io
import json
import os
import pathlib
import sys
import urllib.request
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/demo-services"
MAX_WIDTH = 1080
MAX_HEIGHT = 760

PHOTOS = {
    "regular": ("1iVGFc3xiJ_9h6XBDLKw9ED90FqXOTV-_", "public/assets/lead-demo/cleaner-in-home.png"),
    "deep": ("1T8IwsLz7trh4MXDg4LZhygijvGvpwfms", "public/assets/lead-demo/pristine-kitchen.png"),
    "move": ("1gWI0VX9T4deCt1mO2CQm9V0OUCwfyepi", "public/assets/lead-demo/hero-luxury-home.png"),
    "office": ("1Y4f_6WNZzddPTJ_6tmsZzryNhuu_xD1V", "public/assets/lead-demo/spotless-office.png"),
    "retail": ("1D-i5Iwx8wsS64eT9pKoYYEk4nGrAU3VT", "public/assets/lead-demo/spotless-office.png"),
    "medical": ("1VPTEfj4eP3Ehx6Uhj2RTaBrmRGpEVGFB", "public/assets/lead-demo/cleaner-in-home.png"),
    "floor": ("1AI4lKiquJe8Y52mtzBOlGsFtt61KCtF7", "public/assets/lead-demo/spotless-office.png"),
}

def read_drive(photo_id: str) -> bytes:
    urls = (
        f"https://drive.google.com/thumbnail?id={photo_id}&sz=w1200",
        f"https://drive.usercontent.google.com/download?id={photo_id}&export=download&confirm=t",
    )
    for url in urls:
        try:
            request = urllib.request.Request(
                url, headers={"User-Agent": "Mozilla/5.0 (TLE Sample Photo Import)"}
            )
            with urllib.request.urlopen(request, timeout=22) as response:
                data = response.read(18_000_000)
            if len(data) < 2048:
                continue
            img = Image.open(io.BytesIO(data))
            img.verify()
            return data
        except (OSError, ValueError, UnidentifiedImageError) as err:
            print(f"WARN: Drive thumbnail unavailable for {photo_id}: {type(err).__name__}", flush=True)
    return b""

def build() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    fallback_count = 0
    for name, (file_id, fallback) in PHOTOS.items():
        data = read_drive(file_id)
        source = "drive"
        if data:
            img = Image.open(io.BytesIO(data))
        else:
            source = "local-fallback"
            fallback_count += 1
            img = Image.open(ROOT / fallback)
        img = ImageOps.exif_transpose(img).convert("RGB")
        img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
        target = OUTPUT / f"{name}.webp"
        img.save(target, format="WEBP", quality=81, method=5)
        with Image.open(target) as check:
            assert check.format == "WEBP" and check.width >= 400 and check.height >= 200
        assert target.stat().st_size < 400_000, f"Too heavy: {target}"
        manifest[name] = {
            "source": source, "drive_id": file_id, "local_path": "/assets/demo-services/" + target.name,
            "bytes": target.stat().st_size,
        }
        print(f"PHOTO {name}: {source}, {target.stat().st_size} bytes", flush=True)
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")
    print(f"PHOTO RESULT: {len(manifest)} optimized images; {fallback_count} fallback(s).", flush=True)

if __name__ == "__main__":
    build()

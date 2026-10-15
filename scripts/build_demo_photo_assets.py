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
from concurrent.futures import ThreadPoolExecutor
import json
import os
import pathlib
import sys
import urllib.request
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/demo-services"
COMPARE_OUTPUT = ROOT / "public/assets/demo-transformations"
MAX_WIDTH = 1080
MAX_HEIGHT = 760

PHOTOS = {
    # No people in these service photographs: only the cleaned space.
    "regular": ("1f5q0FsrrLIwlg27P-Rv7Co8CZ16f3XoT", "public/assets/cleaning-demo/living-room-original.jpg"),
    "deep": ("1PLZIlv2Rh-QxSOOB2DGHQkkoTINMEvOt", "public/assets/lead-demo/pristine-kitchen.png"),
    "move": ("1zpWEXni_tfNuo-_bERTsQqPjCdmtM1zY", "public/assets/lead-demo/hero-luxury-home.png"),
    "office": ("1RgzYfITPbBkoK-Vkduto9ZA3Wksx98a6", "public/assets/lead-demo/spotless-office.png"),
    "retail": ("1Y4f_6WNZzddPTJ_6tmsZzryNhuu_xD1V", "public/assets/lead-demo/spotless-office.png"),
    "medical": ("1r7AcdXLbmKw4Z7sGra401HCKirx3GKJ1", "public/assets/lead-demo/pristine-kitchen.png"),
    "floor": ("1AI4lKiquJe8Y52mtzBOlGsFtt61KCtF7", "public/assets/lead-demo/spotless-office.png"),
}

# Matched before/after sample pairs from the owner's link-visible Drive library.
# These are illustrative images, NOT verified work by a particular client.
TRANSFORMATIONS = {
    "grout-before": "1SkXPez5hn5teDqKDarWQuue3HxmZMlbj",
    "grout-after": "1NI4NCYnrH1o4ijzLbgL0FN7khuzeeviW",
    "bed-before": "1Jmm1J7EcMvzU-TGIfjCbSIEjr2mixNNi",
    "bed-after": "1rKIMLZwWFepjlfNlVstdZqETg-FLKFfr",
    "pantry-before": "1Zps22cYeqaKlUKaVIR4QRYLx1wY-gkF0",
    "pantry-after": "1t_qWRwVD9sBfP3D1feCv6ewFEuJcg9wI",
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
            with urllib.request.urlopen(request, timeout=12) as response:
                data = response.read(18_000_000)
            if len(data) < 2048:
                continue
            img = Image.open(io.BytesIO(data))
            img.verify()
            return data
        except (OSError, ValueError, UnidentifiedImageError) as err:
            print(f"WARN: Drive thumbnail unavailable for {photo_id}: {type(err).__name__}", flush=True)
    return b""

def convert_one(item: tuple[str, tuple[str, str]]) -> tuple[str, dict]:
    name, (file_id, fallback) = item
    data = read_drive(file_id)
    source = "drive"
    if data:
        img = Image.open(io.BytesIO(data))
    else:
        source = "local-fallback"
        img = Image.open(ROOT / fallback)
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
    target = OUTPUT / f"{name}.webp"
    img.save(target, format="WEBP", quality=81, method=5)
    with Image.open(target) as check:
        assert check.format == "WEBP" and check.width >= 400 and check.height >= 200
    assert target.stat().st_size < 400_000, f"Too heavy: {target}"
    print(f"PHOTO {name}: {source}, {target.stat().st_size} bytes", flush=True)
    return name, {
        "source": source, "drive_id": file_id,
        "local_path": "/assets/demo-services/" + target.name,
        "bytes": target.stat().st_size,
    }

def convert_transformation(item: tuple[str, str]) -> tuple[str, dict]:
    name, photo_id = item
    data = read_drive(photo_id)
    if not data:
        # Never fake a transformation by showing two unrelated fallback photos.
        print(f"WARN: no confirmed matching before/after image for {name}", flush=True)
        return name, {"available": False, "source": "missing", "drive_id": photo_id}
    img = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    img.thumbnail((900, 1000), Image.Resampling.LANCZOS)
    target = COMPARE_OUTPUT / f"{name}.webp"
    img.save(target, "WEBP", quality=80, method=5)
    with Image.open(target) as check:
        assert check.width >= 400 and check.height >= 400
    assert target.stat().st_size < 480_000, f"Too heavy: {target}"
    print(f"COMPARE {name}: Drive, {target.stat().st_size} bytes", flush=True)
    return name, {
        "available": True, "source": "drive", "drive_id": photo_id,
        "local_path": "/assets/demo-transformations/" + target.name,
        "bytes": target.stat().st_size,
    }

def build() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    COMPARE_OUTPUT.mkdir(parents=True, exist_ok=True)
    # Run downloads concurrently to avoid delaying unrelated website deployments.
    with ThreadPoolExecutor(max_workers=7) as executor:
        manifest = dict(executor.map(convert_one, PHOTOS.items()))
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")
    fallback_count = sum(p["source"] == "local-fallback" for p in manifest.values())
    print(f"PHOTO RESULT: {len(manifest)} optimized images; {fallback_count} fallback(s).", flush=True)
    with ThreadPoolExecutor(max_workers=6) as executor:
        transformations = dict(executor.map(convert_transformation, TRANSFORMATIONS.items()))
    (COMPARE_OUTPUT / "manifest.json").write_text(
        json.dumps(transformations, indent=2) + "\n", encoding="utf8")
    print(f"COMPARE RESULT: {sum(v['available'] for v in transformations.values())}/"
          f"{len(transformations)} illustrative photos optimized", flush=True)


if __name__ == "__main__":
    build()

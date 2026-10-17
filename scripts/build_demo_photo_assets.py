#!/usr/bin/env python3
"""Prepare the sample demo's cleaning-service images as local, optimized WebP.

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
    # Working cleaners and visible detail replace beautiful-but-empty interiors.
    "regular": ("1S6jtvi5zjF_406RSvYqmKWWIu5IZwpmG", "public/assets/cleaning-demo/cleaner-action.png"),
    "deep": ("1XeSx3BLRzsnBORYJfexjObaqRCCqrRLV", "public/assets/cleaning-demo/cleaner-action.png"),
    "move": ("1RLDhPCYZRz5E9nR46ld3ORuYzTq1sXLd", "public/assets/cleaning-demo/cleaner-action.png"),
    "office": ("1D56-v3lVV6FpBqW3FqYH442kiPVvjlLT", "public/assets/lead-demo/spotless-office.png"),
    "retail": ("173q939tEw2c0I1jLFv8nkMtQEECNib10", "public/assets/cleaning-demo/cleaner-action.png"),
    "medical": ("1VPTEfj4eP3Ehx6Uhj2RTaBrmRGpEVGFB", "public/assets/cleaning-demo/cleaner-action.png"),
    "floor": ("1-__BedqBlAqkTkfY5RkoUw0ok7kRcGqu", "public/assets/lead-demo/spotless-office.png"),
}

# Matched before/after sample pairs from the owner's link-visible Drive library.
# These are illustrative images, NOT verified work by a particular client.
TRANSFORMATIONS = {
    "grout-before": "1a7BDMhN69nn3JU1eaq3HhxepR0fVGOF0",
    "grout-after": "1OWiVlmtTiDOs6ZYDyEOzo6bG8LAd915d",
    "bed-before": "1Jmm1J7EcMvzU-TGIfjCbSIEjr2mixNNi",
    "bed-after": "1rKIMLZwWFepjlfNlVstdZqETg-FLKFfr",
    "vanity-before": "12Hgmr2Qsn6zQLuUhrC0Ll3rMzw2JFAjB",
    "vanity-after": "1JySU3I6EccZsgL5j7WlPFdVZvUETifND",
    "track-before": "1N6tOp2TwYgzVnDa0kmDqPSaUZBAydRbq",
    "track-after": "1bhww33DGwvyhty8LEWQPGRQOunL4BVz0",
}


def read_drive(photo_id: str) -> bytes:
    urls = (
        (photo_id if photo_id.startswith("https://") else f"https://drive.google.com/thumbnail?id={photo_id}&sz=w1200"),
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
    source = "unsplash" if file_id.startswith("https://") else "drive"
    if not data and source == "unsplash":
        # Shared Drive backups remain public and show professional spaces.
        drive_backup = {"retail": "1ZcBDf1NSKNycxkgC63G6LgWHJ4Mj7Lsy",
                        "medical": "1D56-v3lVV6FpBqW3FqYH442kiPVvjlLT"}
        data = read_drive(drive_backup[name])
        if data:
            source = "drive-fallback"
    if data:
        img = Image.open(io.BytesIO(data))
    else:
        source = "local-fallback"
        img = Image.open(ROOT / fallback)
    img = ImageOps.exif_transpose(img).convert("RGB")
    if name == "retail" and source == "drive" and not file_id.startswith("https://"):
        # The licensed source compares an office BEFORE/AFTER side-by-side.
        # Show only the clean AFTER half in the service catalog.
        img = img.crop((img.width // 2, 0, img.width, img.height))
    img.thumbnail((MAX_WIDTH, 1120 if name == "retail" else MAX_HEIGHT), Image.Resampling.LANCZOS)
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


# Five NEW and non-repeating photos for the hotel-inspired booking sample,
# separate from the hero's five images. No client-owned photo is modified.
EDITORIAL_PHOTOS = {
    "story-room": ("1f5q0FsrrLIwlg27P-Rv7Co8CZ16f3XoT", "public/assets/lead-demo/sunroom.png"),
    "story-detail": ("1kpLBLpYXmZ__HBlo-Je3PgFdoiNCYRL9", "public/assets/lead-demo/poolside-living.png"),
    "service-standard": ("1cHABVpf2gfnoJBIOyz2gtr9NGesOwptx", "public/assets/cleaning-demo/living-room-original.jpg"),
    "service-deep": ("17YR_MIQ-Qbe6wHqSbNBPadxU1CYp66Ib", "public/assets/lead-demo/pristine-kitchen.png"),
    "service-move": ("1JWKxVid9rb8d95BiODZf1Bs7-ZpkxyOd", "public/assets/lead-demo/hero-luxury-home.png"),
}


def convert_editorial(item: tuple[str, tuple[str, str]]) -> tuple[str, dict]:
    name, (photo_id, fallback) = item
    data = read_drive(photo_id)
    source = "drive" if data else "local-fallback"
    img = Image.open(io.BytesIO(data)) if data else Image.open(ROOT / fallback)
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((1300, 900), Image.Resampling.LANCZOS)
    target_dir = ROOT / "public/assets/demo-editorial"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"{name}.webp"
    img.save(target, "WEBP", quality=82, method=6)
    assert target.stat().st_size < 450_000, f"Heavy editorial photo: {target}"
    with Image.open(target) as check:
        assert check.width >= 400 and check.height >= 200
    return name, {"source": source, "drive_id": photo_id,
                  "local_path": f"/assets/demo-editorial/{name}.webp",
                  "bytes": target.stat().st_size}


# Distinct, already-approved sample interiors used by the optional swipe deck.
# Every conversion is from a checked-in local file; never fetch customer data.
# Hand-picked non-repeating cleaning work, not decorated empty rooms.
# Names match existing 10-card responsive/gallery QA and frontend selectors.
WORK_GALLERY_PHOTOS = {
    "kitchen-refresh": "1qsB1km7L6s2uMU5Lqld2scQOq6vR-LTw", # Kitchen faucet detail
    "living-space": "1T8IwsLz7trh4MXDg4LZhygijvGvpwfms", # Cleaner on shower glass
    "bathroom-detail": "1UH-TCxlkopy8FRkl9F2LFcQAg2-FT0br", # Window track deep detail
    "dining-room": "1yS4NMb8qzpKVoh6FENY42nZRKJZ55Hws", # Oven rack
    "bedroom": "1p7I-DGGCL-LQHI9HiQ2lQCsyRIJeFwMk", # Baseboards/door jamb
    "miami-condo": "1ogJNjnuze8u2KDlbNwR5YMy92QKVLhRP", # Sofa seam vacuum
    "sunroom": "1xHhJURdyu5lXGaXJHEkJV9cbav7epcEe", # Ceiling fan
    "poolside-living": "1k0iUBlcHWBM9je9a86pp_EVaEqCRaZCz", # Stainless fingerprints
    "office": "1p1b4uHgnA0xeuTmOzQgnDoyhyqUOdNpO", # Patio glass
    "whole-home": "1rAdK0u2xltni8OfJiZLOYbRcBtS_d7Ym", # Oven finish inspection
}

# Distinct cleaning work chosen from the owner's Drive gallery.
# All output is optimized locally at build, no Google image URL is served.
DEMO_CLEANING_PHOTOS = {
    "hero": "1iVGFc3xiJ_9h6XBDLKw9ED90FqXOTV-_",   # Cleaner wiping kitchen island
    "journey-service": "19YlYsb4Nh0WHYzzhZ1LdlGOB2-JyGnMZ", # Laundry counter
    "journey-property": "1NsvLuh2VyOxlfuBcAvyP2Y0Imx2TPbuH", # Bathroom faucet polishing
    "journey-schedule": "1kGjyffimouv--0LdYzpS2_JocWX8qJ8I", # Vacuum in progress
    "journey-review": "1zGSf7ZI1pIUncr0WmITKHqE_EmE-vwG8", # Window cleaning
}


def convert_demo_cleaning(item: tuple[str, str]) -> tuple[str, dict]:
    name, file_id = item
    data = read_drive(file_id)
    if not data:
        raise RuntimeError(f"Required cleaning photo is unavailable from Drive: {name} ({file_id})")
    img = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    img.thumbnail((1400, 1550) if name == "hero" else (980, 1000), Image.Resampling.LANCZOS)
    target_dir = ROOT / "public/assets/demo-cleaning-20261017"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / (name + ".webp")
    img.save(target, format="WEBP", quality=78, method=5)
    assert target.stat().st_size < 425_000, f"Too heavy: {name} {target.stat().st_size}"
    with Image.open(target) as check:
        assert check.width >= 400 and check.height >= 200
    return name, {"source": "drive", "drive_id": file_id,
                  "local_path": "/assets/demo-cleaning-20261017/" + target.name,
                  "bytes": target.stat().st_size}


def convert_work_gallery(item: tuple[str, str]) -> tuple[str, dict]:
    name, file_id = item
    data = read_drive(file_id)
    if not data:
        raise RuntimeError(f"Required cleaning gallery photo unavailable from Drive: {name} ({file_id})")
    img = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    img.thumbnail((940, 1100), Image.Resampling.LANCZOS)
    target = ROOT / "public/assets/demo-work-gallery" / f"{name}.webp"
    target.parent.mkdir(parents=True, exist_ok=True)
    img.save(target, format="WEBP", quality=77, method=5)
    assert target.stat().st_size < 360_000, f"Heavy gallery image: {target}"
    return name, {"source": "drive-cleaning-action", "drive_id": file_id,
                  "local_path": "/assets/demo-work-gallery/" + target.name,
                  "bytes": target.stat().st_size}


def build() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    COMPARE_OUTPUT.mkdir(parents=True, exist_ok=True)
    # Run downloads concurrently to avoid delaying unrelated website deployments.
    with ThreadPoolExecutor(max_workers=7) as executor:
        manifest = dict(executor.map(convert_one, PHOTOS.items()))
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")
    fallback_count = sum(p["source"] == "local-fallback" for p in manifest.values())
    print(f"PHOTO RESULT: {len(manifest)} optimized images; {fallback_count} fallback(s).", flush=True)
    with ThreadPoolExecutor(max_workers=5) as executor:
        editorial = dict(executor.map(convert_editorial, EDITORIAL_PHOTOS.items()))
    (ROOT / "public/assets/demo-editorial/manifest.json").write_text(
        json.dumps(editorial, indent=2) + "\n", encoding="utf8")
    print(f"EDITORIAL: {len(editorial)} photographs prepared; "
          f"{sum(v['source'] == 'drive' for v in editorial.values())} from Drive.", flush=True)
    with ThreadPoolExecutor(max_workers=5) as executor:
        action_photos = dict(executor.map(convert_demo_cleaning, DEMO_CLEANING_PHOTOS.items()))
    (ROOT / "public/assets/demo-cleaning-20261017/manifest.json").write_text(
        json.dumps(action_photos, indent=2) + "\n", encoding="utf8")
    print(f"DEMO CLEANING: {len(action_photos)} unique hero/journey Drive photos optimized.", flush=True)
    with ThreadPoolExecutor(max_workers=5) as executor:
        work_gallery = dict(executor.map(convert_work_gallery, WORK_GALLERY_PHOTOS.items()))
    (ROOT / "public/assets/demo-work-gallery/manifest.json").write_text(
        json.dumps(work_gallery, indent=2) + "\n", encoding="utf8")
    print(f"WORK GALLERY: {len(work_gallery)} optimized sample photos prepared.", flush=True)
    with ThreadPoolExecutor(max_workers=6) as executor:
        transformations = dict(executor.map(convert_transformation, TRANSFORMATIONS.items()))
    (COMPARE_OUTPUT / "manifest.json").write_text(
        json.dumps(transformations, indent=2) + "\n", encoding="utf8")
    print(f"COMPARE RESULT: {sum(v['available'] for v in transformations.values())}/"
          f"{len(transformations)} illustrative photos optimized", flush=True)


if __name__ == "__main__":
    build()

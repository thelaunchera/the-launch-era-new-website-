#!/usr/bin/env python3
"""Optimize published demo photos only; master/source photos stay unchanged."""
import argparse
import json
import re
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

TARGETS = ("la-vie-in-pink", "marea-wigs-miami", "golden-grid",
           "sova", "lavender-edit", "crumb")
MIN_BYTES = 320000
QUALITY = 80
MAX_EDGE = 1600
TEXT_EXT = {".html", ".js", ".css", ".mjs"}


def optimize(source):
    output = source.with_suffix(".webp")
    if output.exists():
        return None
    try:
        with Image.open(source) as raw:
            im = ImageOps.exif_transpose(raw)
            icc = im.info.get("icc_profile")
            if max(im.size) > MAX_EDGE:
                im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
            with_alpha = "A" in im.getbands() or "transparency" in im.info
            im = im.convert("RGBA" if with_alpha else "RGB")
            opts = {"format": "WEBP", "quality": QUALITY, "method": 6}
            if icc:
                opts["icc_profile"] = icc
            im.save(output, **opts)
            dims = im.size
    except (OSError, ValueError, UnidentifiedImageError) as exc:
        print("SKIP", source.name, exc)
        output.unlink(missing_ok=True)
        return None
    if output.stat().st_size >= source.stat().st_size * 0.92:
        output.unlink(missing_ok=True)
        return None
    return output, dims


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".output/public")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    demos = root / "demos"
    if not (demos / "index.html").is_file():
        raise SystemExit("Demo library not in Pages build")
    assets = []
    mappings = {}
    bytes_before = bytes_after = 0
    for slug in TARGETS:
        folder = demos / slug
        if not folder.is_dir():
            raise SystemExit("Missing demo: " + slug)
        pairs = []
        for source in sorted(folder.rglob("*")):
            if not source.is_file() or source.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
                continue
            if source.stat().st_size < MIN_BYTES:
                continue
            result = optimize(source)
            if not result:
                continue
            output, dimensions = result
            before, after = source.stat().st_size, output.stat().st_size
            bytes_before += before
            bytes_after += after
            old, new = source.relative_to(folder).as_posix(), output.relative_to(folder).as_posix()
            pairs.append((old, new))
            assets.append({"demo": slug, "source": old, "output": new,
                           "original_bytes": before, "optimized_bytes": after,
                           "width": dimensions[0], "height": dimensions[1]})
        mappings[slug] = pairs
    if len(assets) < 35 or bytes_after > bytes_before * 0.62:
        raise SystemExit("Image optimization coverage or size reduction insufficient")
    replacement_counts = {slug: 0 for slug in TARGETS}
    edited_files = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXT or path.stat().st_size > 20000000:
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        text = original
        rel_file = path.relative_to(root).as_posix()
        for slug, pairs in mappings.items():
            for old, new in pairs:
                # Golden Grid's campaign headline and product lettering are baked
                # into the approved master image. Preserve lossless PNG on the
                # FULL hero (tablet/desktop/phone) instead of WebP quality 80.
                # Catalog cards and galleries still use the optimized WebP.
                if rel_file == "demos/golden-grid/index.html" and old == "resources/golden-1.png":
                    continue
                # La Vie's approved PINK cover has large lettering baked in.
                # Preserve the original lossless master in the public catalog as
                # well as inside its demo; keep the optimized WebP for other art.
                if (rel_file == "demos/index.html" and slug == "la-vie-in-pink"
                        and old == "photos/lavie_pink_hero_editorial.png"):
                    continue
                absolute_old, absolute_new = "/demos/" + slug + "/" + old, "/demos/" + slug + "/" + new
                if absolute_old in text:
                    replacement_counts[slug] += text.count(absolute_old)
                    text = text.replace(absolute_old, absolute_new)
            if rel_file.startswith("demos/" + slug + "/"):
                for old, new in pairs:
                    if rel_file == "demos/golden-grid/index.html" and old == "resources/golden-1.png":
                        continue
                    if old in text:
                        replacement_counts[slug] += text.count(old)
                        text = text.replace(old, new)
                    else:
                        name_old, name_new = Path(old).name, Path(new).name
                        if name_old in text:
                            replacement_counts[slug] += text.count(name_old)
                            text = text.replace(name_old, name_new)
                if slug == "golden-grid" and len(pairs) == 9:
                    # Lightbox builds numbered filenames dynamically.
                    text = re.sub(r"(\+\s*)(['\"])\.png\2",
                                  lambda m: m.group(1) + m.group(2) + ".webp" + m.group(2), text)
        if rel_file == "demos/la-vie-in-pink/index.html":
            # The selected PINK cover has large letterforms baked into its art.
            # Preserve its full-resolution master instead of lossy WebP.
            text = text.replace(
                "photos/lavie_pink_hero_editorial.webp",
                "photos/lavie_pink_hero_editorial.png")
        if rel_file == "demos/golden-grid/index.html":
            # Final immutable quality gate: the 1122×1402 lossless master is
            # the visible hero, even if an earlier pass optimizes a duplicate
            # filename or a later catalog substitution adds a WebP URL.
            # Keep WebP for gallery/catalog only. Never degrade baked-in type.
            master = "./resources/golden-1.png?v=20261108-master-hq"
            hero_match = re.search(
                r'(<div class="hero-art">\s*<img\b[^>]*?\bsrc=")([^"]+)(")', text)
            if not hero_match:
                raise SystemExit("Golden Grid approved hero is missing")
            text = (text[:hero_match.start(2)] + master +
                    text[hero_match.end(2):])
            poster_match = re.search(
                r'(<video\b[^>]*?\bposter=")([^"]+)(")', text)
            if poster_match:
                text = (text[:poster_match.start(2)] + master +
                        text[poster_match.end(2):])
        if rel_file == "demos/index.html":
            # Catalog cards are below the hero and must stay lazy.
            text = re.sub(r'(<div class="demo-art">\s*<img\b[^>]*?)loading="eager"',
                          lambda m: m.group(1) + 'loading="lazy"', text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            edited_files.append(rel_file)
    for image in assets:
        if not (demos / image["demo"] / image["output"]).is_file():
            raise SystemExit("Missing optimized file: " + str(image))
    manifest = {"image_count": len(assets), "original_bytes": bytes_before,
                "optimized_bytes": bytes_after,
                "saved_percent": round(100 * (1 - bytes_after / bytes_before), 1),
                "changed_files": len(edited_files), "replacements": replacement_counts,
                "assets": assets}
    (demos / "image-performance.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print("Optimized", len(assets), "demo images:",
          round(bytes_before / 1048576, 1), "MiB to",
          round(bytes_after / 1048576, 1), "MiB,",
          manifest["saved_percent"], "% saved,",
          len(edited_files), "HTML/JS/CSS files updated")


if __name__ == "__main__":
    main()

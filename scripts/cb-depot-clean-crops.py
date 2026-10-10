"""Create website-friendly BMW service close-up crops from the existing client assets.

Only changes derived client imagery. Keeps the original images and buyer design.
"""
from pathlib import Path
from PIL import Image

BASE = Path("public/assets/clients/cb-depot/photos")
CROPS = {
    # Normalized boxes stay stable if the input photos are reoptimized.
    "card-exterior.webp": ("exterior.webp", (0.276, 0.369, 0.980, 0.679)),
    "card-paint.webp": ("paint.webp", (0.267, 0.435, 0.963, 0.735)),
    "card-interior.webp": ("interior.webp", (0.160, 0.390, 0.945, 0.725)),
    # Exclude the panda on the left of the hero; show the BMW's front and wheel.
    "card-full.webp": ("full.webp", (0.389, 0.276, 0.981, 0.840)),
}

for output, (source, ratios) in CROPS.items():
    with Image.open(BASE / source) as image:
        image = image.convert("RGB")
        box = tuple(round(v * dim) for v, dim in zip(ratios, (image.width, image.height, image.width, image.height)))
        cropped = image.crop(box)
        if cropped.width > 960:
            cropped.thumbnail((960, 960), Image.Resampling.LANCZOS)
        cropped.save(BASE / output, "WEBP", quality=84, method=6)
        print(f"{output}: {cropped.size}, {(BASE / output).stat().st_size} bytes")

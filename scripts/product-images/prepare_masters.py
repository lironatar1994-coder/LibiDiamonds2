"""Prepare transparent, metal-accurate catalog masters.

Generated source photography is kept in the private assets repository. This
script removes the baked studio background, creates 2400px transparent masters,
and derives yellow/white metal variants without changing product geometry.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE_ROOT = PROJECT_ROOT.parent / "LibiDiamondsAssets" / "sources"
DEFAULT_MASTER_ROOT = PROJECT_ROOT.parent / "LibiDiamondsAssets" / "masters"
MANIFEST_PATH = PROJECT_ROOT / "media" / "catalog.manifest.json"
MASTER_SIZE = 2400

EXISTING_METALS = {
    "aura-solitaire-ring": "yellow",
    "nova-halo-ring": "rose",
    "trio-three-stone-ring": "white",
    "lumiere-pave-ring": "yellow",
    "stella-diamond-studs": "white",
    "glow-halo-earrings": "yellow",
    "luna-diamond-hoops": "rose",
    "riviera-tennis-necklace": "white",
    "claire-solitaire-pendant": "yellow",
    "drop-bezel-necklace": "rose",
    "icon-tennis-bracelet": "white",
    "one-diamond-bangle": "yellow",
}


def smoothstep(edge0: float, edge1: float, value: np.ndarray) -> np.ndarray:
    scaled = np.clip((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return scaled * scaled * (3.0 - 2.0 * scaled)


def rgb_to_hsv(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    maximum = rgb.max(axis=2)
    minimum = rgb.min(axis=2)
    delta = maximum - minimum
    saturation = np.divide(delta, maximum, out=np.zeros_like(delta), where=maximum > 0)
    hue = np.zeros_like(maximum)
    nonzero = delta > 1e-6

    red = (maximum == rgb[:, :, 0]) & nonzero
    green = (maximum == rgb[:, :, 1]) & nonzero
    blue = (maximum == rgb[:, :, 2]) & nonzero
    hue[red] = ((rgb[:, :, 1][red] - rgb[:, :, 2][red]) / delta[red]) % 6
    hue[green] = (rgb[:, :, 2][green] - rgb[:, :, 0][green]) / delta[green] + 2
    hue[blue] = (rgb[:, :, 0][blue] - rgb[:, :, 1][blue]) / delta[blue] + 4
    hue /= 6
    return hue, saturation, maximum


def recolor_metal(image: Image.Image, target: str, source: str = "yellow") -> Image.Image:
    pixels = np.asarray(image.convert("RGBA"), dtype=np.float32) / 255.0
    rgb = pixels[:, :, :3]
    alpha = pixels[:, :, 3]
    hue, saturation, value = rgb_to_hsv(rgb)
    luminance = rgb[:, :, 0] * 0.2126 + rgb[:, :, 1] * 0.7152 + rgb[:, :, 2] * 0.0722

    if source == "white":
        # White metal is identified conservatively so bright diamond facets stay neutral.
        neutral = 1.0 - smoothstep(0.08, 0.28, saturation)
        midtone = smoothstep(0.10, 0.30, luminance) * (1.0 - smoothstep(0.84, 0.98, luminance))
        metal_mask = neutral * midtone
    elif source == "rose":
        rose_hue = np.maximum(
            smoothstep(0.90, 0.98, hue) * (1.0 - smoothstep(0.995, 1.0, hue)),
            (1.0 - smoothstep(0.08, 0.16, hue)),
        )
        metal_mask = smoothstep(0.08, 0.35, saturation) * rose_hue
    else:
        yellow_hue = smoothstep(0.035, 0.075, hue) * (1.0 - smoothstep(0.19, 0.28, hue))
        metal_mask = smoothstep(0.07, 0.32, saturation) * yellow_hue

    metal_mask *= smoothstep(0.04, 0.28, alpha)

    if target == "white":
        target_rgb = np.stack(
            [
                np.clip(luminance * 0.98 + 0.025, 0, 1),
                np.clip(luminance * 1.00 + 0.035, 0, 1),
                np.clip(luminance * 1.025 + 0.045, 0, 1),
            ],
            axis=2,
        )
    else:
        # Preserve the source luminance so reflections remain photographic.
        target_rgb = np.stack(
            [
                np.clip(luminance * 1.12 + 0.10, 0, 1),
                np.clip(luminance * 0.82 + 0.055, 0, 1),
                np.clip(luminance * 0.38 + 0.015, 0, 1),
            ],
            axis=2,
        )

    blend = np.clip(metal_mask[:, :, None], 0, 1)
    pixels[:, :, :3] = rgb * (1.0 - blend) + target_rgb * blend
    return Image.fromarray(np.round(np.clip(pixels, 0, 1) * 255).astype(np.uint8), "RGBA")


def normalized_master(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    return image.resize((MASTER_SIZE, MASTER_SIZE), Image.Resampling.LANCZOS)


def extract_generated(source: Path, session) -> Image.Image:
    with Image.open(source) as image:
        rgba = image.convert("RGBA")
    extracted = remove(
        rgba,
        session=session,
        alpha_matting=False,
        post_process_mask=True,
    )
    if not isinstance(extracted, Image.Image):
        extracted = Image.open(extracted)
    return normalized_master(extracted)


def save(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True)
    print(destination)


def prepare_generated(product: dict, source_root: Path, master_root: Path, session) -> bool:
    product_source = source_root / product["slug"] / "yellow"
    if not product_source.exists():
        return False

    for view in product["views"]:
        source = product_source / f"{view}.png"
        if not source.exists():
            raise FileNotFoundError(f"Missing generated source: {source}")
        yellow = extract_generated(source, session)
        legacy = master_root / product["slug"] / f"{view}.png"
        if EXISTING_METALS.get(product["slug"]) == "white" and legacy.exists():
            with Image.open(legacy) as image:
                white = normalized_master(image)
        else:
            white = recolor_metal(yellow, "white", "yellow")
        save(yellow, master_root / product["slug"] / "yellow" / f"{view}.png")
        save(white, master_root / product["slug"] / "white" / f"{view}.png")
    return True


def migrate_existing(product: dict, master_root: Path) -> None:
    slug = product["slug"]
    source_metal = EXISTING_METALS[slug]
    for view in product["views"]:
        legacy = master_root / slug / f"{view}.png"
        if not legacy.exists():
            raise FileNotFoundError(f"Missing legacy master: {legacy}")
        with Image.open(legacy) as image:
            original = normalized_master(image)

        if source_metal == "yellow":
            yellow = original
        elif source_metal == "rose":
            yellow = recolor_metal(original, "yellow", "rose")
        else:
            yellow = recolor_metal(original, "yellow", "white")

        white = original if source_metal == "white" else recolor_metal(yellow, "white", "yellow")
        save(yellow, master_root / slug / "yellow" / f"{view}.png")
        save(white, master_root / slug / "white" / f"{view}.png")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--product", action="append")
    parser.add_argument("--source-root", type=Path, default=DEFAULT_SOURCE_ROOT)
    parser.add_argument("--master-root", type=Path, default=DEFAULT_MASTER_ROOT)
    parser.add_argument("--model", default="birefnet-general-lite")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    products = manifest["products"]
    if args.product:
        selected = set(args.product)
        products = [product for product in products if product["slug"] in selected]
        missing = selected - {product["slug"] for product in products}
        if missing:
            raise ValueError(f"Unknown product slug(s): {', '.join(sorted(missing))}")

    generated = [product for product in products if (args.source_root / product["slug"]).exists()]
    session = new_session(args.model) if generated else None

    for product in products:
        if prepare_generated(product, args.source_root, args.master_root, session):
            continue
        if product["slug"] not in EXISTING_METALS:
            raise FileNotFoundError(f"No source or existing-master rule for {product['slug']}")
        migrate_existing(product, args.master_root)


if __name__ == "__main__":
    main()

"""Create exact-pixel transparent masters from the current baked-background catalog.

This migration helper is not part of production. Install its optional dependencies
with `python -m pip install -r scripts/product-images/legacy-requirements.txt`.
"""

import argparse
import json
from pathlib import Path

from rembg import new_session, remove


PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG = json.loads((PROJECT_ROOT / "media/catalog.config.json").read_text("utf-8"))
MANIFEST = json.loads((PROJECT_ROOT / "media/catalog.manifest.json").read_text("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--product", help="Process one product slug")
    parser.add_argument(
        "--master-root",
        type=Path,
        default=(PROJECT_ROOT / CONFIG["defaultMasterRoot"]).resolve(),
    )
    args = parser.parse_args()

    products = [
        product
        for product in MANIFEST["products"]
        if not args.product or product["slug"] == args.product
    ]
    if args.product and not products:
        raise SystemExit(f"Unknown product slug: {args.product}")

    session = new_session("birefnet-general-lite")
    for product in products:
        sources = product.get("legacySources", {})
        for view in product["views"]:
            relative_source = sources.get(view)
            if not relative_source:
                raise SystemExit(f"Missing legacy source for {product['slug']}-{view}")
            source = PROJECT_ROOT / relative_source
            destination = args.master_root / product["slug"] / f"{view}.png"
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(
                remove(
                    source.read_bytes(),
                    session=session,
                    alpha_matting=False,
                    post_process_mask=True,
                )
            )
            print(f"Extracted {product['slug']}-{view}")


if __name__ == "__main__":
    main()

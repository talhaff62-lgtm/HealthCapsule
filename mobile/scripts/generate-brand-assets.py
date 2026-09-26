#!/usr/bin/env python
"""Derive the full Expo brand-asset set from D:/Work/healthcapsule_icon.png.

Generates: splash-icon.png, icon.png, adaptive-icon.png,
monochrome-icon.png (black silhouette), favicon.png.
Writes them into mobile/assets/images/.
"""
from pathlib import Path

from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR.parent / "assets" / "images"
SRC = Path("D:/Work/healthcapsule_icon.png")
WHITE = (255, 255, 255)

SPECS = [
    # (filename, size, mode, bg, mark_height)
    # Mark heights are kept well inside the Android adaptive-icon safe zone
    # (66/108 ≈ 61% of the canvas): launcher masks crop up to that circle, so
    # anything larger reads as a tight, edge-cropped logo on the home screen.
    ("splash-icon.png", 1024, "RGBA", None, 560),
    ("icon.png", 1024, "RGB", WHITE, 610),
    ("adaptive-icon.png", 1024, "RGBA", None, 560),
    ("monochrome-icon.png", 1024, "RGBA", "mono", 560),
    ("favicon.png", 48, "RGB", WHITE, 30),
]


# Compression noise leaves ~700 stray pixels at alpha 1-16 across the canvas.
# Floor anything below this so the crop finds the mark, not the whole image.
NOISE_FLOOR = 24


def key_white_to_alpha(src_rgb: Image.Image) -> Image.Image:
    px = list(src_rgb.getdata())
    raw = [255 - min(r, g, b) for r, g, b in px]
    scale = 255 / max(raw)
    print(f"alpha scale factor: {scale:.4f}")
    out = []
    for (r, g, b), a_raw in zip(px, raw):
        a = min(255, round(a_raw * scale))
        if a <= NOISE_FLOOR:
            out.append((0, 0, 0, 0))
        else:
            inv = 255 - a
            out.append(
                (
                    max(0, min(255, round((r - inv) * 255 / a))),
                    max(0, min(255, round((g - inv) * 255 / a))),
                    max(0, min(255, round((b - inv) * 255 / a))),
                    a,
                )
            )
    keyed = Image.new("RGBA", src_rgb.size)
    keyed.putdata(out)
    return keyed


def place(canvas_size: int, mark: Image.Image, target_h: int, bg) -> Image.Image:
    w, h = mark.size
    nw = max(1, round(w * target_h / h))
    scaled = mark.resize((nw, target_h), Image.Resampling.LANCZOS)
    if bg == "mono":
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        black = Image.new("RGBA", scaled.size, (0, 0, 0, 255))
        black.putalpha(scaled.split()[3])
        scaled = black
    elif bg is None:
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    else:
        canvas = Image.new("RGBA", (canvas_size, canvas_size), bg + (255,))
    x = int(round((canvas_size - scaled.size[0]) / 2))
    y = int(round((canvas_size - scaled.size[1]) / 2))
    canvas.alpha_composite(scaled, (x, y))
    return canvas


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"missing source image: {SRC}")
    if not OUT_DIR.is_dir():
        raise SystemExit(f"missing output dir: {OUT_DIR}")

    keyed = key_white_to_alpha(Image.open(SRC).convert("RGB"))
    w, h = keyed.size
    for cx, cy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        assert keyed.getpixel((cx, cy))[3] == 0, f"corner {(cx, cy)} not transparent"
    # The mark is a C-shape, so its centre is background — assert on peak alpha instead.
    assert max(p[3] for p in keyed.getdata()) == 255, "no fully opaque pixel"

    bbox = keyed.split()[3].getbbox()
    print(f"mark bbox: {bbox}")
    assert bbox, "empty alpha bbox"
    mark = keyed.crop(bbox)

    rows = []
    for name, size, mode, bg, mh in SPECS:
        img = place(size, mark, mh, bg)
        if mode == "RGB":
            img = img.convert("RGB")
            assert img.mode == "RGB", f"{name} still has alpha"
        path = OUT_DIR / name
        img.save(path)
        rows.append((name, img.mode, f"{img.size[0]}x{img.size[1]}", path.stat().st_size))

    print(f"{'file':<22}{'mode':<6}{'size':<10}{'bytes'}")
    for name, mode, dims, nbytes in rows:
        print(f"{name:<22}{mode:<6}{dims:<10}{nbytes}")


if __name__ == "__main__":
    main()

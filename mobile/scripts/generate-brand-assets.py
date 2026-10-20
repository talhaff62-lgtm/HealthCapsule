#!/usr/bin/env python
"""Derive the full Expo brand-asset set from brand-assets/capsule_logo.jpg.

The source is the circular Capsule lockup (gradient ring, white interior,
"capsule" wordmark) on a solid black background. It is masked to the
inscribed circle and placed on the canvases below.

Generates: splash-icon.png, icon.png, adaptive-icon.png,
monochrome-icon.png (black silhouette), favicon.png.
Writes them into mobile/assets/images/.
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

SCRIPT_DIR = Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR.parent / "assets" / "images"
SRC = SCRIPT_DIR.parent.parent / "brand-assets" / "capsule_logo.jpg"
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


# JPEG ringing around the solid-black background stays below this level.
NOISE_FLOOR = 64


def circle_mark(src_rgb: Image.Image) -> Image.Image:
    """Mask the source to its inscribed logo circle (4x supersampled edge)."""
    r_ch, g_ch, b_ch = src_rgb.split()
    peak = ImageChops.lighter(ImageChops.lighter(r_ch, g_ch), b_ch)
    bbox = peak.point(lambda v: 255 if v > NOISE_FLOOR else 0).getbbox()
    if not bbox:
        raise SystemExit("no content found above the noise floor")
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    radius = max(bbox[2] - bbox[0], bbox[3] - bbox[1]) / 2
    alpha = Image.new("L", (src_rgb.width * 4, src_rgb.height * 4), 0)
    ImageDraw.Draw(alpha).ellipse(
        ((cx - radius) * 4, (cy - radius) * 4, (cx + radius) * 4, (cy + radius) * 4),
        fill=255,
    )
    alpha = alpha.resize(src_rgb.size, Image.Resampling.LANCZOS)
    out = src_rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


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

    mark = circle_mark(Image.open(SRC).convert("RGB"))
    w, h = mark.size
    for cx, cy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        assert mark.getpixel((cx, cy))[3] == 0, f"corner {(cx, cy)} not transparent"
    # The mark is a solid disc, so its centre is opaque — assert on peak alpha.
    assert mark.getchannel("A").getextrema()[1] == 255, "no fully opaque pixel"

    bbox = mark.split()[3].getbbox()
    print(f"mark bbox: {bbox}")
    assert bbox, "empty alpha bbox"
    mark = mark.crop(bbox)

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

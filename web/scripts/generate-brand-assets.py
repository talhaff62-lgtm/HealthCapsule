#!/usr/bin/env python
"""Derive the web brand assets from the canonical circular logo source.

Reads brand-assets/capsule_logo.jpg (circular lockup on a solid black
background) and writes:
- web/public/images/logo.png  (512x512, circular transparent crop, ~92% fill)
- web/src/app/favicon.ico     (16/32/48 from the circular PNG)
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
SRC = ROOT / "brand-assets" / "capsule_logo.jpg"
OUT_LOGO = ROOT / "web" / "public" / "images" / "logo.png"
OUT_FAVICON = ROOT / "web" / "src" / "app" / "favicon.ico"

CANVAS = 512
FILL = 0.92  # circle diameter as a fraction of the canvas
# JPEG ringing around the solid-black background stays below this level.
NOISE_FLOOR = 64


def fit_circle(src: Image.Image) -> tuple[float, float, float]:
    """Locate the inscribed logo circle; returns (cx, cy, r) in source pixels."""
    r_ch, g_ch, b_ch = src.split()
    peak = ImageChops.lighter(ImageChops.lighter(r_ch, g_ch), b_ch)
    bbox = peak.point(lambda v: 255 if v > NOISE_FLOOR else 0).getbbox()
    if not bbox:
        raise SystemExit("no content found above the noise floor")
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    radius = max(bbox[2] - bbox[0], bbox[3] - bbox[1]) / 2
    return cx, cy, radius


def circular(src: Image.Image, cx: float, cy: float, r: float) -> Image.Image:
    """Return src as RGBA masked to the circle (4x supersampled for a smooth edge)."""
    alpha = Image.new("L", (src.width * 4, src.height * 4), 0)
    ImageDraw.Draw(alpha).ellipse(
        ((cx - r) * 4, (cy - r) * 4, (cx + r) * 4, (cy + r) * 4), fill=255
    )
    alpha = alpha.resize(src.size, Image.Resampling.LANCZOS)
    out = src.convert("RGBA")
    out.putalpha(alpha)
    return out


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"missing source image: {SRC}")

    src = Image.open(SRC).convert("RGB")
    cx, cy, r = fit_circle(src)
    print(f"circle: center=({cx:.1f}, {cy:.1f}) radius={r:.1f}")

    box = (round(cx - r), round(cy - r), round(cx + r), round(cy + r))
    mark = circular(src, cx, cy, r).crop(box)
    for corner in [(0, 0), (mark.width - 1, 0), (0, mark.height - 1), (mark.width - 1, mark.height - 1)]:
        assert mark.getpixel(corner)[3] == 0, f"corner {corner} not transparent"
    assert mark.getchannel("A").getextrema()[1] == 255, "no fully opaque pixel"

    diameter = round(CANVAS * FILL)
    logo = mark.resize((diameter, diameter), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    off = (CANVAS - diameter) // 2
    canvas.alpha_composite(logo, (off, off))
    OUT_LOGO.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT_LOGO)
    print(
        f"wrote {OUT_LOGO} {canvas.size[0]}x{canvas.size[1]} "
        f"{OUT_LOGO.stat().st_size} bytes"
    )

    OUT_FAVICON.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT_FAVICON, sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"wrote {OUT_FAVICON} {OUT_FAVICON.stat().st_size} bytes")


if __name__ == "__main__":
    main()

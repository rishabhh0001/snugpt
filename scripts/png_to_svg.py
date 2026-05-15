"""Convert avatar.png to a web-optimized public/avatar.svg."""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "avatar.png"
OUT = ROOT / "public" / "avatar.svg"
ICON = ROOT / "src" / "app" / "icon.png"
SIZE = 512


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    im = im.resize((SIZE, SIZE), Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {SIZE} {SIZE}" role="img" aria-label="SNUGPT">
  <image width="{SIZE}" height="{SIZE}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{b64}"/>
</svg>
"""
    OUT.write_text(svg, encoding="utf-8")

    ICON.parent.mkdir(parents=True, exist_ok=True)
    im.save(ICON, format="PNG", optimize=True)

    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
    print(f"Wrote {ICON} ({ICON.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()

"""Crops the owner's reference photos into box and product images.

Usage: python3 scripts/crop-reference-photos.py <dir-with-1..5.jpg>
"""
import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
root = Path(__file__).resolve().parent.parent / "public" / "images"

# (source, output, (left, top, right, bottom), rotate_degrees)
BOXES = [
    ("1.jpg", "boxes/signature-6000.jpg", (110, 290, 1230, 1000), 0),
    ("2.jpg", "boxes/classic-1699.jpg", (120, 270, 1360, 1400), 0),
    ("3.jpg", "boxes/golden-heart-3000.jpg", (60, 230, 1450, 1240), 0),
    ("4.jpg", "boxes/dubai-kunafa-5000.jpg", (40, 215, 1580, 1250), 0),
    ("5.jpg", "boxes/truffle-fruit-3000.jpg", (160, 300, 1470, 1180), 0),
]
ITEMS = [
    ("2.jpg", "items/dairy-milk.jpg", (215, 375, 460, 870), 0),
    ("2.jpg", "items/kitkat-2-finger.jpg", (680, 1060, 1090, 1290), 0),
    ("2.jpg", "items/snickers.jpg", (1060, 730, 1280, 1270), 90),
    ("1.jpg", "items/mars.jpg", (555, 335, 705, 850), 90),
    ("4.jpg", "items/dubai-kunafa.jpg", (165, 325, 610, 1120), 0),
    ("3.jpg", "items/ailisha-heart.jpg", (250, 615, 730, 1140), 0),
    ("5.jpg", "items/truffle-heart.jpg", (225, 660, 675, 1095), 0),
    ("3.jpg", "items/kitkat-4-finger.jpg", (880, 400, 1320, 705), 0),
    ("5.jpg", "items/fruit-candy.jpg", (640, 410, 925, 690), 0),
    ("5.jpg", "items/chia-gummy.jpg", (625, 795, 825, 1065), 0),
]

for name, out, box, rot in BOXES + ITEMS:
    img = Image.open(src / name).convert("RGB").crop(box)
    if rot:
        img = img.rotate(rot, expand=True)
    dest = root / out
    img.save(dest, "JPEG", quality=86, optimize=True, progressive=True)
    print(out, img.size)

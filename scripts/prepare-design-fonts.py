#!/usr/bin/env python3
"""
One-time script to convert approved HankenGrotesk.woff2 into static TrueType (TTF)
fonts for weights 400 (Regular), 600 (SemiBold), and 700 (Bold) for next/og Satori rendering.
"""

import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE_FONT = "docs/design/2026-10-26-cool-social/HankenGrotesk.woff2"
TARGET_DIR = "src/app/fonts"

WEIGHTS = {
    400: "HankenGrotesk-Regular.ttf",
    600: "HankenGrotesk-SemiBold.ttf",
    700: "HankenGrotesk-Bold.ttf",
}

def main():
    if not os.path.exists(SOURCE_FONT):
        raise FileNotFoundError(f"Source font not found: {SOURCE_FONT}")

    os.makedirs(TARGET_DIR, exist_ok=True)

    for weight, filename in WEIGHTS.items():
        print(f"Instantiating weight {weight} -> {filename}...")
        font = TTFont(SOURCE_FONT)
        instance = instancer.instantiateVariableFont(font, {"wght": weight})
        instance.flavor = None  # Unset woff2 compression to output standard TTF

        out_path = os.path.join(TARGET_DIR, filename)
        instance.save(out_path)
        print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

    print("Font preparation complete.")

if __name__ == "__main__":
    main()

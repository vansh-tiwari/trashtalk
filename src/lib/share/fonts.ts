import fs from "node:fs/promises";
import path from "node:path";

export interface CardFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
}

let cachedFonts: CardFont[] | null = null;

/**
 * Loads and caches static TTF font assets for server-side Satori/next/og rendering.
 * Loads 400 (Regular), 600 (SemiBold), and 700 (Bold) faces offline.
 */
export async function getCardFonts(): Promise<CardFont[]> {
  if (cachedFonts) {
    return cachedFonts;
  }

  const fontDir = path.join(process.cwd(), "src/app/fonts");

  const [regularBuf, semiBoldBuf, boldBuf] = await Promise.all([
    fs.readFile(path.join(fontDir, "HankenGrotesk-Regular.ttf")),
    fs.readFile(path.join(fontDir, "HankenGrotesk-SemiBold.ttf")),
    fs.readFile(path.join(fontDir, "HankenGrotesk-Bold.ttf")),
  ]);

  cachedFonts = [
    {
      name: "Hanken Grotesk",
      data: regularBuf.buffer.slice(
        regularBuf.byteOffset,
        regularBuf.byteOffset + regularBuf.byteLength
      ),
      weight: 400,
      style: "normal",
    },
    {
      name: "Hanken Grotesk",
      data: semiBoldBuf.buffer.slice(
        semiBoldBuf.byteOffset,
        semiBoldBuf.byteOffset + semiBoldBuf.byteLength
      ),
      weight: 600,
      style: "normal",
    },
    {
      name: "Hanken Grotesk",
      data: boldBuf.buffer.slice(
        boldBuf.byteOffset,
        boldBuf.byteOffset + boldBuf.byteLength
      ),
      weight: 700,
      style: "normal",
    },
  ];

  return cachedFonts;
}

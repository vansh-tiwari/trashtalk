export type CardFormat = "og" | "square" | "story";

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Returns canonical battle URL for a given origin and snapshot ID.
 * Safely strips trailing slashes and URI-encodes the snapshot ID.
 */
export function getCanonicalBattleUrl(origin: string, id: string): string {
  const cleanOrigin = origin.replace(/\/+$/, "");
  const encodedId = encodeURIComponent(id);
  if (!cleanOrigin) {
    return `/battle/${encodedId}`;
  }
  return `${cleanOrigin}/battle/${encodedId}`;
}

/**
 * Returns the URL to the OG image generation endpoint for the requested format.
 */
export function getCardUrl(
  id: string,
  format: CardFormat,
  download?: boolean
): string {
  const encodedId = encodeURIComponent(id);
  const encodedFormat = encodeURIComponent(format);
  const downloadParam = download ? "&download=true" : "";
  return `/api/og?id=${encodedId}&format=${encodedFormat}${downloadParam}`;
}

/**
 * Copies text using navigator.clipboard, propagating any errors so callers
 * can present honest feedback or fallback dialogs.
 */
export async function copyText(text: string): Promise<void> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== "function"
  ) {
    throw new Error("Clipboard API not available");
  }
  await navigator.clipboard.writeText(text);
}

/**
 * Uses Web Share API if supported.
 * Treats user cancellation (AbortError) quietly as 'cancelled'.
 * Returns 'unsupported' if navigator.share is unavailable.
 * Throws any other system or permission error.
 */
export async function shareBattle(
  data: ShareData
): Promise<"shared" | "unsupported" | "cancelled"> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  try {
    await navigator.share(data);
    return "shared";
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name: string }).name === "AbortError"
    ) {
      return "cancelled";
    }
    throw err;
  }
}

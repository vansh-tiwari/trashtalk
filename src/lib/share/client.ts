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
  * Builds a punchy social share caption with the battle verdict, roast quote, and link.
  */
export function buildSocialShareText(params: {
  p1Handle: string;
  p2Handle: string;
  winnerHandle?: string | null;
  loserHandle?: string | null;
  margin?: number;
  roastText: string;
  url: string;
}): string {
  const { p1Handle, p2Handle, winnerHandle, loserHandle, margin, roastText, url } = params;
  const headline =
    winnerHandle && loserHandle
      ? `@${winnerHandle} cooked @${loserHandle}${typeof margin === "number" && margin > 0 ? ` (+${margin} pts)` : ""} on TrashTalk:`
      : `@${p1Handle} vs @${p2Handle} on TrashTalk:`;
  return `${headline}\n\n"${roastText}"\n\n${url}`;
}

/**
  * Returns an X (Twitter) intent URL.
  */
export function getTwitterShareUrl(shareText: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
}

/**
  * Returns a WhatsApp share intent URL.
  */
export function getWhatsAppShareUrl(shareText: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
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
  * Copies the rendered PNG card image directly to the clipboard.
  */
export async function copyCardImageToClipboard(cardUrl: string): Promise<void> {
  if (
    typeof ClipboardItem === "undefined" ||
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.write !== "function"
  ) {
    throw new Error("Image clipboard not supported");
  }
  const res = await fetch(cardUrl);
  if (!res.ok) {
    throw new Error("Failed to fetch card image");
  }
  const blob = await res.blob();
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
}

/**
  * Shares the actual PNG card file via Web Share API Level 2 (ideal for Instagram Stories / WhatsApp on mobile),
  * or triggers a direct download + copies the caption on desktop browsers.
  */
export async function shareOrDownloadCardImage(params: {
  id: string;
  format: CardFormat;
  title: string;
  caption: string;
  url: string;
}): Promise<"shared" | "downloaded" | "cancelled"> {
  const { id, format, title, caption, url } = params;
  const cardUrl = getCardUrl(id, format);
  const downloadUrl = getCardUrl(id, format, true);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const res = await fetch(cardUrl);
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `trashtalk-${id}-${format}.png`, { type: "image/png" });
        if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title,
            text: caption,
          });
          return "shared";
        }
      }
      await navigator.share({
        title,
        text: caption,
        url,
      });
      return "shared";
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name: string }).name === "AbortError"
    ) {
      return "cancelled";
    }
  }

  // Desktop fallback: copy caption to clipboard and trigger PNG download
  try {
    await copyText(caption);
  } catch {
    // ignore clipboard failure
  }

  if (typeof document !== "undefined") {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `trashtalk-${id}-${format}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return "downloaded";
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

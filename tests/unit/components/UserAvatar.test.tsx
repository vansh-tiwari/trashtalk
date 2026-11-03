import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import UserAvatar, { normalizeAvatarUrl, getAvatarInitials } from "@/components/ui/UserAvatar";

describe("UserAvatar Component & Helpers", () => {
  describe("normalizeAvatarUrl", () => {
    it("normalizes protocol-relative URLs starting with //", () => {
      expect(normalizeAvatarUrl("//userpic.codeforces.org/test.jpg")).toBe(
        "https://userpic.codeforces.org/test.jpg"
      );
    });

    it("preserves secure HTTPS URLs", () => {
      expect(normalizeAvatarUrl("https://userpic.codeforces.org/avatar.jpg")).toBe(
        "https://userpic.codeforces.org/avatar.jpg"
      );
    });

    it("returns undefined for empty, missing, or whitespace URLs", () => {
      expect(normalizeAvatarUrl(undefined)).toBeUndefined();
      expect(normalizeAvatarUrl("")).toBeUndefined();
      expect(normalizeAvatarUrl("   ")).toBeUndefined();
    });
  });

  describe("getAvatarInitials", () => {
    it("derives deterministic uppercase initials from handle", () => {
      expect(getAvatarInitials("tourist")).toBe("TO");
      expect(getAvatarInitials("Petr")).toBe("PE");
      expect(getAvatarInitials("@tourist")).toBe("TO");
      expect(getAvatarInitials("x")).toBe("X");
      expect(getAvatarInitials("")).toBe("??");
    });
  });

  describe("Rendering & Accessible Content", () => {
    it("renders monogram initials with accessible label when no avatar URL is provided", () => {
      const html = renderToStaticMarkup(<UserAvatar handle="tourist" side="p1" />);
      expect(html).toContain("TO");
      expect(html).toContain('aria-label="@tourist"');
      expect(html).not.toContain("<img");
    });

    it("renders img tag with accessible alt when valid avatar URL is provided", () => {
      const html = renderToStaticMarkup(
        <UserAvatar
          handle="tourist"
          avatarUrl="https://userpic.codeforces.org/avatar.jpg"
          side="p1"
        />
      );
      expect(html).toContain("<img");
      expect(html).toContain('src="https://userpic.codeforces.org/avatar.jpg"');
      expect(html).toContain('alt="@tourist"');
    });

    it("falls back to deterministic initials when avatarUrl is an empty string or whitespace", () => {
      const html = renderToStaticMarkup(<UserAvatar handle="Petr" avatarUrl="   " side="p2" />);
      expect(html).toContain("PE");
      expect(html).toContain('aria-label="@Petr"');
      expect(html).not.toContain("<img");
    });

    it("does not leak third-party random avatar services into the fallback", () => {
      const html = renderToStaticMarkup(<UserAvatar handle="anonymous" />);
      expect(html).not.toContain("dicebear");
      expect(html).not.toContain("gravatar");
      expect(html).toContain("AN");
    });
  });
});

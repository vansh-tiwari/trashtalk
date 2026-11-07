import { describe, it, expect } from "vitest";
import Icon, { size as iconSize, contentType as iconContentType } from "@/app/icon";
import AppleIcon, { size as appleSize, contentType as appleContentType } from "@/app/apple-icon";
import manifest from "@/app/manifest";

describe("Favicon Set & Web App Manifest (Item 6)", () => {
  it("exports correct 32x32 favicon dimensions", () => {
    expect(iconSize.width).toBe(32);
    expect(iconSize.height).toBe(32);
    expect(iconContentType).toBe("image/png");
  });

  it("renders a valid 32x32 favicon ImageResponse", () => {
    const res = Icon();
    expect(res).toBeDefined();
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("exports correct 180x180 Apple touch icon dimensions", () => {
    expect(appleSize.width).toBe(180);
    expect(appleSize.height).toBe(180);
    expect(appleContentType).toBe("image/png");
  });

  it("renders a valid 180x180 Apple Touch Icon ImageResponse", () => {
    const res = AppleIcon();
    expect(res).toBeDefined();
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("generates a valid web app manifest", () => {
    const data = manifest();
    expect(data.name).toContain("TrashTalk");
    expect(data.short_name).toBe("TrashTalk");
    expect(data.theme_color).toBe("#15171B");
    expect(data.background_color).toBe("#F2F2F0");
    expect(data.display).toBe("standalone");
    expect(data.icons?.length).toBeGreaterThan(0);
  });
});

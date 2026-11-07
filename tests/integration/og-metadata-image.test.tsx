import { describe, it, expect } from "vitest";
import OpenGraphImage, { size, contentType } from "@/app/opengraph-image";

describe("Root OpenGraph & Twitter Image (Item 5)", () => {
  it("exports correct image dimensions and contentType", () => {
    expect(size.width).toBe(1200);
    expect(size.height).toBe(630);
    expect(contentType).toBe("image/png");
  });

  it("renders a valid ImageResponse object", async () => {
    const response = await OpenGraphImage();
    expect(response).toBeDefined();
    expect(response.headers.get("content-type")).toContain("image/png");
  });
});

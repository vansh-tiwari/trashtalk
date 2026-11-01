import { describe, it, expect } from "vitest";
import { resolveMotionMode, MOTION_PRESETS } from "@/lib/motion/presets";

describe("Motion Policy Resolution", () => {
  it("resolves full mode when reduced motion is false and paused is false", () => {
    expect(resolveMotionMode(false, false)).toBe("full");
  });

  it("resolves reduced mode when prefersReduced is true (takes priority over unpaused)", () => {
    expect(resolveMotionMode(true, false)).toBe("reduced");
  });

  it("resolves paused mode when prefersReduced is false and paused is true", () => {
    expect(resolveMotionMode(false, true)).toBe("paused");
  });

  it("resolves reduced mode when prefersReduced is true even if paused is true", () => {
    expect(resolveMotionMode(true, true)).toBe("reduced");
  });

  it("defines explicit millisecond and second presets conforming to the spec timeline", () => {
    expect(MOTION_PRESETS.headline.durationMs).toBe(450);
    expect(MOTION_PRESETS.panelSlide.durationMs).toBe(500);
    expect(MOTION_PRESETS.scoreCount.durationMs).toBe(850);
    expect(MOTION_PRESETS.vsSlab.durationMs).toBe(380);
    expect(MOTION_PRESETS.winnerStamp.durationMs).toBe(450);
    expect(MOTION_PRESETS.roast.durationMs).toBe(420);
    expect(MOTION_PRESETS.pairedBars.durationMs).toBe(650);
    expect(MOTION_PRESETS.radar.durationMs).toBe(900);
    expect(MOTION_PRESETS.sharePreview.durationMs).toBe(460);
  });
});

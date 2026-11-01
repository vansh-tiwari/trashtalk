import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BattlePage from "@/app/battle/page";
import SoloRoastPage from "@/app/roast/page";
import EvolutionPage from "@/app/evolution/page";
import NotFound from "@/app/not-found";
import ErrorBoundary from "@/app/error";
import Loading from "@/app/loading";
import { generateMetadata } from "@/app/battle/[id]/page";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  notFound: vi.fn(),
}));

describe("Route States & Product Alignment (Task 11)", () => {
  describe("Battle Page (/battle)", () => {
    it("renders battle entry form with truthful Codeforces defaults", () => {
      const html = renderToStaticMarkup(<BattlePage />);
      expect(html).toContain("the arena");
      expect(html).toContain("settle it");
      expect(html).not.toContain("AI Commentary");
      expect(html).not.toContain("Gemini");
    });
  });

  describe("Solo Mirror Page (/roast)", () => {
    it("labels experience as mirror match without claiming dedicated solo analysis engine", () => {
      const html = renderToStaticMarkup(<SoloRoastPage />);
      expect(html).toContain("mirror match");
      expect(html).not.toContain("AI commentary teardown");
      expect(html).not.toContain("individual evaluation snapshot");
      expect(html).not.toContain("Gemini");
    });
  });

  describe("Evolution Page (/evolution)", () => {
    it("renders restrained engineering history without self-grading or hype", () => {
      const html = renderToStaticMarkup(<EvolutionPage />);
      expect(html).toContain("2020");
      expect(html).toContain("2026");
      expect(html).toContain("legacy/");
      expect(html).not.toContain("Senior Staff");
      expect(html).not.toContain("AI-native");
    });
  });

  describe("NotFound Surface (not-found.tsx)", () => {
    it("renders clean 404 message and navigation back to arena", () => {
      const html = renderToStaticMarkup(<NotFound />);
      expect(html).toContain("match not found");
      expect(html).toContain("the arena");
      expect(html).toContain('href="/"');
    });
  });

  describe("Error Surface (error.tsx)", () => {
    it("renders safe error boundary with retry without dumping raw system internals", () => {
      const resetMock = vi.fn();
      const testError = new Error("INTERNAL_SECRET_LEAK: server at /var/run/trashtalk");
      const html = renderToStaticMarkup(
        <ErrorBoundary error={testError} reset={resetMock} />
      );

      expect(html).toContain("something went wrong");
      expect(html).toContain("try again");
      expect(html).not.toContain("/var/run/trashtalk");
      expect(html).not.toContain("INTERNAL_SECRET_LEAK");
    });
  });

  describe("Loading Surface (loading.tsx)", () => {
    it("renders clean accessible loading indicator", () => {
      const html = renderToStaticMarkup(<Loading />);
      expect(html).toContain("loading");
    });
  });

  describe("Result Metadata (/battle/[id])", () => {
    it("generates truthful metadata using bounded roast without AI judge branding", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ id: PREPARED_TOURIST_VS_PETR.id }),
      });

      expect(metadata.title).toContain("tourist vs Petr");
      expect(metadata.title).not.toContain("AI");
      expect(metadata.description).toContain("@tourist takes it · +7");
      expect(metadata.description).not.toContain("AI");
      expect(metadata.openGraph?.images).toBeDefined();
    });
  });
});

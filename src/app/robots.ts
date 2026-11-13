import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trashtalk.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/battle", "/battle/*", "/evolution", "/roast", "/privacy", "/api/og"],
      disallow: ["/api/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

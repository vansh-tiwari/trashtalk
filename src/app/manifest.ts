import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrashTalk — Developer Battle Arena",
    short_name: "TrashTalk",
    description: "Compare developer stats and let the receipts do the talking.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2F2F0",
    theme_color: "#15171B",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

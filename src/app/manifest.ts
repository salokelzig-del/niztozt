import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rega",
    short_name: "Rega",
    description:
      "Videos cortos de contenido judío: tradición, humor, música e historia.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#05070d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

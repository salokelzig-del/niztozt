import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://regatv.vercel.app"),
  title: "Rega",
  description: "Videos cortos de contenido judío: tradición, humor, música e historia.",
  openGraph: {
    siteName: "Rega",
    title: "Rega",
    description: "Videos cortos de contenido judío: tradición, humor, música e historia.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={{
        variables: {
          colorPrimary: "#d4af37",
          colorBackground: "#0d0f16",
          colorForeground: "#f5f5f5",
          colorInput: "#1a1d27",
          colorInputForeground: "#f5f5f5",
          colorMutedForeground: "#f5f5f5",
        },
        elements: {
          socialButtonsBlockButtonText: { color: "#ffffff" },
          userButtonPopoverActionButton: { color: "#ffffff" },
          userButtonPopoverActionButtonIcon: { color: "#ffffff" },
          userButtonPopoverFooterPagesLink: { color: "#f5f5f5" },
        },
      }}
    >
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-black text-white">
          <ServiceWorkerRegister />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

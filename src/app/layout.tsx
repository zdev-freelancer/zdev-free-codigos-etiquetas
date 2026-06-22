import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getCurrentTenant } from "@/lib/tenant";
import { GoogleAnalytics } from "@next/third-parties/google";

// Inter — single, uniform sans for the whole UI.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Geist Mono — used only for small technical labels.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export async function generateMetadata(): Promise<Metadata> {
  // Brand name comes from this front's tenant row; structural defaults
  // (tagline, description, keywords) stay in siteConfig as template defaults.
  const tenant = await getCurrentTenant();
  const name = tenant.name;
  const title = `${name} — ${siteConfig.tagline}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s · ${name}`,
    },
    description: siteConfig.description,
    applicationName: name,
    keywords: [
      "etiquetas",
      "código de barras",
      "ribbons",
      "impresoras de etiquetas",
      "lectores de código de barras",
      "Zebra",
      "Perú",
      "Lima",
    ],
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: name,
      title,
      description: siteConfig.description,
      url: siteConfig.url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteConfig.description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.locale}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}

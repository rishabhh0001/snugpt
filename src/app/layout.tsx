import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL("https://snugpt.rishabhj.in"),
  title: "SNUGPT — Shiv Nadar University AI Assistant",
  description: "Your intelligent AI companion for Shiv Nadar University. Ask about admissions, academics, campus life, fees, and more.",
  icons: {
    icon: [{ url: "/avatar.svg", type: "image/svg+xml" }],
    apple: "/avatar.svg",
  },
  openGraph: {
    title: "SNUGPT",
    description: "AI assistant for Shiv Nadar University students and parents.",
    type: "website",
    images: [
      {
        url: "/avatar.svg",
        width: 512,
        height: 512,
        alt: "SNUGPT Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SNUGPT",
    description: "AI assistant for Shiv Nadar University students and parents.",
    images: ["/avatar.svg"],
  },
  verification: {
    google: "google-site-verification-placeholder", // Replace with your actual Google Search Console code
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMaintenance = true;
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WC0W93TW0F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WC0W93TW0F');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Providers>
          {isMaintenance ? (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-6 border-2 shadow-xl"
                    style={{ borderColor: "rgba(242,169,0,0.3)", background: "#fff", margin: "0 auto 1.5rem" }}>
                <img src="/avatar.svg" alt="SNUGPT logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--color-snu-yellow, #f2a900)" }}>System Under Maintenance</h1>
              <p className="text-lg max-w-lg mx-auto" style={{ color: "var(--color-muted)" }}>
                We are currently undergoing scheduled maintenance and rebuilding our knowledge base. 
                <br/><br/>
                SNUGPT will be back online by <strong>16/06/2026 02:00 PM</strong>. Thank you for your patience!
              </p>
            </div>
          ) : (
            children
          )}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

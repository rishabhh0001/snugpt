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
                SNUGPT will be back online by <strong>18/06/2026 01:00 PM</strong>. Thank you for your patience!
              </p>
              
              <a 
                href="https://rishabhj.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-10 group relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all duration-300 ease-out bg-[#0a0a0a] border border-[#f2a900]/30 rounded-full shadow-[0_0_15px_rgba(242,169,0,0.2)] hover:shadow-[0_0_30px_rgba(242,169,0,0.4)] hover:bg-[#111] hover:border-[#f2a900]/60 hover:-translate-y-1 active:translate-y-0 active:scale-95 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <span className="relative flex items-center gap-2 z-10" style={{ color: "var(--color-snu-yellow, #f2a900)" }}>
                  Checkout My Portfolio 
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
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

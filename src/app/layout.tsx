import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "SnuGPT — Shiv Nadar University AI Assistant",
  description: "Your intelligent AI companion for Shiv Nadar University. Ask about admissions, academics, campus life, fees, and more.",
  icons: {
    icon: [{ url: "/avatar.svg", type: "image/svg+xml" }],
    apple: "/avatar.svg",
  },
  openGraph: {
    title: "SnuGPT",
    description: "AI assistant for Shiv Nadar University students and parents.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}

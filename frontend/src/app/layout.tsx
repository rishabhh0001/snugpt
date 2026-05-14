import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SnuGPT — Shiv Nadar University AI Assistant",
  description: "Your intelligent AI companion for Shiv Nadar University. Ask about admissions, academics, campus life, fees, and more.",
  openGraph: {
    title: "SnuGPT",
    description: "AI assistant for Shiv Nadar University students and parents.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "YabaSafe Alert",
  description:
    "Real-time emergency alerts for students and guardians of Yaba College of Technology, with clear instructions and muster points.",
      icons: { icon: "/icons/192", apple: "/icons/180" },
  appleWebApp: { capable: true, title: "YabaSafe", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#0A0F1C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

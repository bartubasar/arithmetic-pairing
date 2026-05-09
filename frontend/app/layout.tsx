import type { Metadata } from "next";
import { Cinzel, Noto_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-tile",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Aritmetik Mahjong",
  description: "Aritmetik Mahjong MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${cinzel.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

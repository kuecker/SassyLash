import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sassy Lash & Skin — Book an Appointment",
  description: "Book your lash and skin services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream-canvas">{children}</body>
    </html>
  );
}

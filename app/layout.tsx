import type { Metadata } from "next";
import "./globals.css";
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "Limitless Club",
  description: "Admin Portal for Limitless Club",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={sarabun.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}


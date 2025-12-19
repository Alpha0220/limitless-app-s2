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
  title: "Queue Master - Restaurant Room Booking",
  description: "Book restaurant rooms with ease",
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


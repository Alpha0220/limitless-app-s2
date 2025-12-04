import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}


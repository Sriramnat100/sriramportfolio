import type { Metadata } from "next";
import { Anton, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Toy-packaging pairing: Anton — a heavy condensed display face — for names,
// section plates and anything that should read like it's printed on a box;
// IBM Plex for body text and the small stamped technical labels.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Sriram Natarajan — CS + Linguistics at Illinois",
  description:
    "Portfolio of Sriram Natarajan: software engineer, CS + Linguistics major at UIUC. Projects, experience, an interactive island, and a globe of everyone who's visited.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}>{children}</body>
    </html>
  );
}

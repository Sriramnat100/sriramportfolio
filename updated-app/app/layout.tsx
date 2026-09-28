import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// The type comes from the system first (SF Pro on Apple devices). Inter is
// only the fallback for everything else, so it is loaded but never forced.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sriram Natarajan",
  description:
    "Sriram Natarajan — software engineer studying Computer Science + Linguistics at the University of Illinois. Embedded software at Rivian, forward-deployed engineering at C3 AI, and machine learning that leaves the screen.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Scroll reveals start hidden only when script is running, so the
            page is fully readable if JavaScript never loads — and if it
            starts but the page's bundle fails, the observer never checks in
            and reveals are released after three seconds. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.classList.contains('io'))d.classList.remove('js')},3000)",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

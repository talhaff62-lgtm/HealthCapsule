import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterGate from "@/components/layout/FooterGate";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ScrollProgressBar } from "@/components/ui/motion";
import GoogleTranslate from "@/components/GoogleTranslate";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HealthCapsule — Find Verified Doctors in Chattogram",
  description:
    "Search verified doctors by specialty, area, and name. Book appointments and manage your practice with HealthCapsule.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen">
        <ScrollProgressBar />
        <SessionProvider>
          <GoogleTranslate />
          <Navbar />
          <main className="flex-1">{children}</main>
          <FooterGate />
        </SessionProvider>
      </body>
    </html>
  );
}

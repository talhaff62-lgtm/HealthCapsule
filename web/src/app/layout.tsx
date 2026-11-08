import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterGate from "@/components/layout/FooterGate";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ScrollProgressBar } from "@/components/ui/motion";
import { LanguageProvider } from "@/components/language-provider";
import { getServerLocale } from "@/lib/i18n-server";

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
  title: "Capsule — Find Verified Doctors in Chattogram",
  description:
    "Search verified doctors by specialty, area, and name. Book appointments and manage your practice with Capsule.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen">
        <ScrollProgressBar />
        <SessionProvider>
          <LanguageProvider initialLocale={locale}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <FooterGate />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

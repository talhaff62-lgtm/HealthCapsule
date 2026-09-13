"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/staff") || pathname?.startsWith("/admin")) return null;
  return <Footer />;
}

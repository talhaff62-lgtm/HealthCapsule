"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function BackButton({ fallbackHref }: { fallbackHref?: string }) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <button
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-sky transition hover:text-brand-sky-dark cursor-pointer"
      onClick={() => {
        if (fallbackHref && window.history.length <= 1) router.push(fallbackHref);
        else router.back();
      }}
    >
      <ArrowLeft className="h-4 w-4" />
      {t("common.back")}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-sky transition hover:text-brand-sky-dark cursor-pointer"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      Go Back
    </button>
  );
}

"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";

type DeleteChamberButtonProps = {
  doctorId: string;
  chamberId: string;
  action: () => Promise<void>;
};

export default function DeleteChamberButton({
  doctorId,
  chamberId,
  action,
}: DeleteChamberButtonProps) {
  // doctorId/chamberId are accepted for clarity; the bound `action` already
  // carries them from the server component closure.
  void doctorId;
  void chamberId;

  const { t } = useLanguage();

  return (
    <form
      action={action}
      className="mt-4 flex justify-end border-t border-brand-gray pt-4"
    >
      <button
        type="submit"
        onClick={(e) => {
          if (
            !window.confirm(t("doctorPortal.deleteChamber.confirmMessage"))
          ) {
            e.preventDefault();
          }
        }}
        className="rounded-lg border border-status-emergency/30 bg-white px-3 py-1.5 text-sm font-medium text-status-emergency transition hover:bg-status-emergency hover:text-white"
      >
        {t("doctorPortal.deleteChamber.buttonLabel")}
      </button>
    </form>
  );
}

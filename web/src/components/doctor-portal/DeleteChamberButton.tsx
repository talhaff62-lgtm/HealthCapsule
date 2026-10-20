"use client";

import React from "react";

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

  return (
    <form
      action={action}
      className="mt-4 flex justify-end border-t border-brand-gray pt-4"
    >
      <button
        type="submit"
        onClick={(e) => {
          if (
            !window.confirm(
              "Delete this chamber and its schedules? This cannot be undone."
            )
          ) {
            e.preventDefault();
          }
        }}
        className="rounded-lg border border-status-emergency/30 bg-white px-3 py-1.5 text-sm font-medium text-status-emergency transition hover:bg-status-emergency hover:text-white"
      >
        Delete chamber
      </button>
    </form>
  );
}

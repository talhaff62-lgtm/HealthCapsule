"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChamber, updateChamber, ScheduleInput } from "@/app/portal/doctor/chambers/actions";
import { useLanguage } from "@/components/language-provider";

type ChamberFormProps = {
  doctorId: string;
  areas: { id: string; name: string }[];
  initial?: {
    id: string;
    address: string | null;
    areaId: string | null;
    consultationFee: string | null;
    schedules: ScheduleInput[];
  };
  onCancel?: () => void;
};

const days = [
  { key: 0, label: "common.dayLabels.sun" },
  { key: 1, label: "common.dayLabels.mon" },
  { key: 2, label: "common.dayLabels.tue" },
  { key: 3, label: "common.dayLabels.wed" },
  { key: 4, label: "common.dayLabels.thu" },
  { key: 5, label: "common.dayLabels.fri" },
  { key: 6, label: "common.dayLabels.sat" },
];

function emptySchedule(): ScheduleInput {
  return { dayOfWeek: 0, startTime: "09:00", endTime: "13:00" };
}

export default function ChamberForm({
  doctorId,
  areas,
  initial,
  onCancel,
}: ChamberFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [address, setAddress] = useState(initial?.address ?? "");
  const [areaId, setAreaId] = useState(initial?.areaId ?? "");
  const [fee, setFee] = useState(initial?.consultationFee ?? "");
  const [schedules, setSchedules] = useState<ScheduleInput[]>(
    initial && initial.schedules.length > 0 ? initial.schedules : [emptySchedule()]
  );
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus(null);

    const payload = {
      address,
      areaId: areaId || undefined,
      consultationFee: fee || undefined,
      schedules,
    };

    const result = initial
      ? await updateChamber(doctorId, initial.id, payload)
      : await createChamber(doctorId, payload);

    setPending(false);
    if (result.ok) {
      setStatus({ type: "success", message: initial ? "Chamber updated." : "Chamber added." });
      router.refresh();
      if (!initial) {
        setAddress("");
        setAreaId("");
        setFee("");
        setSchedules([emptySchedule()]);
      }
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  function updateSchedule(index: number, patch: Partial<ScheduleInput>) {
    setSchedules((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-brand-gray bg-brand-cream/40 p-4">
      {status && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status.type === "success"
              ? "bg-status-verified-light text-status-verified"
              : "bg-status-emergency-light text-status-emergency"
          }`}
        >
          {status.message}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">{t("form.facility.labels.address")}</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder={t("doctorPortal.chamberForm.addressPlaceholder")}
          className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">{t("form.facility.labels.area")}</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
          >
            <option value="">{t("doctorPortal.chamberForm.selectAreaPlaceholder")}</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">{t("form.doctor.labels.consultationFee")}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder={t("doctorPortal.chamberForm.feePlaceholder")}
            className="w-full rounded-lg border border-brand-gray bg-white px-4 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-brand-muted">{t("doctorPortal.chamberForm.weeklyScheduleLabel")}</label>
        <div className="space-y-2">
          {schedules.map((schedule, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <select
                value={schedule.dayOfWeek}
                onChange={(e) =>
                  updateSchedule(index, { dayOfWeek: parseInt(e.target.value, 10) })
                }
                className="rounded-lg border border-brand-gray bg-white px-3 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                {days.map((day) => (
                  <option key={day.key} value={day.key}>
                    {t(day.label)}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => updateSchedule(index, { startTime: e.target.value })}
                className="rounded-lg border border-brand-gray bg-white px-3 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
              <span className="text-brand-muted">to</span>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => updateSchedule(index, { endTime: e.target.value })}
                className="rounded-lg border border-brand-gray bg-white px-3 py-2 text-sm text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
              <button
                type="button"
                onClick={() => setSchedules((prev) => prev.filter((_, i) => i !== index))}
                className="text-sm font-medium text-status-emergency hover:underline"
              >
                {t("doctorPortal.chamberForm.removeSchedule")}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSchedules((prev) => [...prev, emptySchedule()])}
          className="mt-2 text-sm font-semibold text-brand-navy hover:text-brand-gold"
        >
          {t("doctorPortal.chamberForm.addScheduleSlot")}
        </button>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-navy-light disabled:opacity-60"
        >
          {pending
            ? t("doctorPortal.chamberForm.saving")
            : initial
            ? t("doctorPortal.chamberForm.updateChamber")
            : t("doctorPortal.chamberForm.addChamber")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-brand-gray bg-white px-5 py-2 text-sm font-medium text-brand-slate transition hover:bg-brand-cream"
          >
            {t("common.form.cancel")}
          </button>
        )}
      </div>
    </form>
  );
}

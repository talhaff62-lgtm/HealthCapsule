"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChamber, updateChamber, ScheduleInput } from "@/app/portal/doctor/chambers/actions";

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
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-brand-gray bg-brand-gray/30 p-4">
      {status && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status.type === "success"
              ? "bg-status-verified/10 text-status-verified"
              : "bg-status-emergency/10 text-status-emergency"
          }`}
        >
          {status.message}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-slate">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder="Chamber address"
          className="w-full rounded-xl border border-brand-gray bg-brand-white px-4 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-slate">Area</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="w-full rounded-xl border border-brand-gray bg-brand-white px-4 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
          >
            <option value="">Select area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-slate">Consultation fee (৳)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="500"
            className="w-full rounded-xl border border-brand-gray bg-brand-white px-4 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-brand-slate">Weekly schedule</label>
        <div className="space-y-2">
          {schedules.map((schedule, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <select
                value={schedule.dayOfWeek}
                onChange={(e) =>
                  updateSchedule(index, { dayOfWeek: parseInt(e.target.value, 10) })
                }
                className="rounded-xl border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
              >
                {days.map((day, i) => (
                  <option key={day} value={i}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => updateSchedule(index, { startTime: e.target.value })}
                className="rounded-xl border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
              />
              <span className="text-brand-muted">to</span>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => updateSchedule(index, { endTime: e.target.value })}
                className="rounded-xl border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-slate focus:border-brand-teal focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSchedules((prev) => prev.filter((_, i) => i !== index))}
                className="text-sm text-status-emergency hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSchedules((prev) => [...prev, emptySchedule()])}
          className="mt-2 text-sm font-medium text-brand-teal hover:underline"
        >
          + Add schedule slot
        </button>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-teal px-5 py-2 text-sm font-medium text-white hover:bg-brand-navy disabled:opacity-60"
        >
          {pending ? "Saving..." : initial ? "Update chamber" : "Add chamber"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-brand-gray px-5 py-2 text-sm font-medium text-brand-slate hover:bg-brand-gray"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Building2, Lock, MapPin, Phone, Stethoscope, User } from "lucide-react";
import { FacilityType } from "@prisma/client";
import { registerDoctor, registerFacility, RegisterResult } from "./actions";

type SpecialtyOption = { id: string; name: string };
type AreaOption = { id: string; name: string; slug: string };

type RegisterFormProps = {
  defaultType: "doctor" | "facility";
  specialties: SpecialtyOption[];
  areas: AreaOption[];
};

const FACILITY_TYPES: { value: FacilityType; label: string }[] = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "DIAGNOSTIC_CENTER", label: "Diagnostic Center" },
  { value: "CLINIC", label: "Clinic" },
];

export default function RegisterForm({ defaultType, specialties, areas }: RegisterFormProps) {
  const router = useRouter();
  const [type, setType] = useState<"doctor" | "facility">(defaultType);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Doctor fields
  const [bmdcRegNo, setBmdcRegNo] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");

  // Facility fields
  const [facilityType, setFacilityType] = useState<FacilityType>("HOSPITAL");
  const [areaId, setAreaId] = useState("");
  const [address, setAddress] = useState("");

  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function resetForm() {
    setPhone("");
    setPassword("");
    setName("");
    setBmdcRegNo("");
    setSpecialtyId("");
    setFacilityType("HOSPITAL");
    setAreaId("");
    setAddress("");
    setStatus(null);
  }

  function handleTabChange(next: "doctor" | "facility") {
    setType(next);
    resetForm();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus(null);

    let result: RegisterResult;
    if (type === "doctor") {
      result = await registerDoctor({
        phone,
        password,
        name,
        bmdcRegNo,
        specialtyId,
      });
    } else {
      result = await registerFacility({
        phone,
        password,
        name,
        type: facilityType,
        areaId,
        address,
      });
    }

    if (!result.ok) {
      setPending(false);
      setStatus({ type: "error", message: result.error });
      return;
    }

    const signInResult = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setPending(false);

    if (signInResult?.error) {
      setStatus({
        type: "success",
        message: "Registration successful. Please sign in with your phone and password.",
      });
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  const isDoctor = type === "doctor";

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-gray bg-white shadow-lg">
      <div className="bg-brand-navy px-8 py-8 text-center">
        <h1 className="font-serif text-2xl font-semibold text-white">Join HealthCapsule</h1>
        <p className="mt-2 text-sm text-white/70">Create your account to get listed.</p>
      </div>

      <div className="p-8">
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-brand-cloud p-1">
          <button
            type="button"
            onClick={() => handleTabChange("doctor")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              isDoctor
                ? "bg-white text-brand-navy shadow-sm"
                : "text-brand-muted hover:text-brand-slate"
            }`}
          >
            Doctor
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("facility")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              !isDoctor
                ? "bg-white text-brand-navy shadow-sm"
                : "text-brand-muted hover:text-brand-slate"
            }`}
          >
            Healthcare Center
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {status && (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                status.type === "success"
                  ? "bg-status-verified-light text-status-verified"
                  : "bg-status-emergency-light text-status-emergency"
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              {isDoctor ? "Full name" : "Facility name"}
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isDoctor ? "Dr. Abdullah Al Mamun" : "Chittagong Medical Center"}
                className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
          </div>

          {/* Doctor-specific fields */}
          {isDoctor && (
            <>
              <div>
                <label
                  htmlFor="bmdcRegNo"
                  className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                >
                  BMDC registration number
                </label>
                <div className="relative mt-1">
                  <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <input
                    id="bmdcRegNo"
                    type="text"
                    required
                    value={bmdcRegNo}
                    onChange={(e) => setBmdcRegNo(e.target.value)}
                    placeholder="A-12345"
                    className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                >
                  Primary specialty
                </label>
                <div className="relative mt-1">
                  <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <select
                    id="specialty"
                    required
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                  >
                    <option value="" disabled>
                      Select a specialty
                    </option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Facility-specific fields */}
          {!isDoctor && (
            <>
              <div>
                <label
                  htmlFor="facilityType"
                  className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                >
                  Facility type
                </label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <select
                    id="facilityType"
                    required
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                    className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                  >
                    {FACILITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="area"
                  className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                >
                  Area
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <select
                    id="area"
                    required
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                  >
                    <option value="" disabled>
                      Select an area
                    </option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / road / landmark"
                  className="block w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                />
              </div>
            </>
          )}

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              Phone
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="phone"
                type="tel"
                required
                pattern="[0-9]{10,}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
            <p className="mt-1 text-xs text-brand-muted">This will be your login number.</p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
            <p className="mt-1 text-xs text-brand-muted">At least 6 characters.</p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-navy py-2.5 font-semibold text-white transition hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Creating account..." : `Register as ${isDoctor ? "Doctor" : "Healthcare Center"}`}
          </button>

          <p className="text-center text-sm text-brand-muted">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-brand-sky hover:text-brand-sky-dark">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

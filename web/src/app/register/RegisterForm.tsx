"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Award, Building2, Lock, Mail, MapPin, Stethoscope, User } from "lucide-react";
import { FacilityType } from "@prisma/client";
import { registerDoctor, registerFacility, RegisterResult } from "./actions";
import { useLanguage } from "@/components/language-provider";

type SpecialtyOption = { id: string; name: string };
type AreaOption = { id: string; name: string; slug: string };

type RegisterFormProps = {
  defaultType: "doctor" | "facility";
  specialties: SpecialtyOption[];
  areas: AreaOption[];
};

const FACILITY_TYPES: { value: FacilityType; label: string }[] = [
  { value: "HOSPITAL", label: "form.facility.options.facilityType.hospital" },
  { value: "DIAGNOSTIC_CENTER", label: "form.facility.options.facilityType.diagnosticCenter" },
  { value: "CLINIC", label: "form.facility.options.facilityType.clinic" },
];

export default function RegisterForm({ defaultType, specialties, areas }: RegisterFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [type, setType] = useState<"doctor" | "facility">(defaultType);

  const [email, setEmail] = useState("");
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
    setEmail("");
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
        email,
        password,
        name,
        bmdcRegNo,
        specialtyId,
      });
    } else {
      result = await registerFacility({
        email,
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
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (signInResult?.error) {
      setStatus({
        type: "success",
        message: t("register.successMessage"),
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
        <h1 className="font-serif text-2xl font-semibold text-white">{t("register.joinCapsule")}</h1>
        <p className="mt-2 text-sm text-white/70">{t("register.createAccountToGetListed")}</p>
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
            {t("register.tabDoctor")}
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
            {t("register.tabHealthcareCenter")}
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
              {isDoctor ? t("register.fullNameLabel") : t("register.facilityNameLabel")}
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isDoctor ? t("register.fullNamePlaceholder") : t("register.facilityNamePlaceholder")}
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
                  {t("form.doctor.labels.bmdcRegNo")}
                </label>
                <div className="relative mt-1">
                  <Award className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <input
                    id="bmdcRegNo"
                    type="text"
                    required
                    value={bmdcRegNo}
                    onChange={(e) => setBmdcRegNo(e.target.value)}
                    placeholder={t("form.doctor.placeholders.bmdcExample")}
                    className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="text-xs font-medium uppercase tracking-wider text-brand-muted"
                >
                  {t("register.primarySpecialtyLabel")}
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
                      {t("register.selectSpecialtyPlaceholder")}
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
                  {t("form.facility.labels.facilityType")}
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
                    {FACILITY_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>
                        {t(ft.label)}
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
                  {t("form.facility.labels.area")}
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
                      {t("register.selectAreaPlaceholder")}
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
                  {t("form.facility.labels.address")}
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("register.addressPlaceholder")}
                  className="block w-full rounded-lg border border-brand-gray bg-white px-4 py-2.5 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              {t("login.emailLabel")}
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-sm text-brand-slate outline-none transition focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
            <p className="mt-1 text-xs text-brand-muted">{t("register.loginEmailHint")}</p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              {t("login.passwordLabel")}
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
            <p className="mt-1 text-xs text-brand-muted">{t("register.passwordHint")}</p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-navy py-2.5 font-semibold text-white transition hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? t("register.creatingAccount")
              : isDoctor
              ? t("register.registerAsDoctor")
              : t("register.registerAsHealthcareCenter")}
          </button>

          <p className="text-center text-sm text-brand-muted">
            {t("register.alreadyHaveAccount")}{" "}
            <a href="/login" className="font-semibold text-brand-sky hover:text-brand-sky-dark">
              {t("login.signIn")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, FormEvent } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/client-fetch";
import { useLanguage } from "@/components/language-provider";
import {
  Button,
  SectionTitle,
  TextAreaField,
  TextField,
} from "@/components/panel/ui";

type DoctorOption = { id: string; name: string };

export type VideoFormPayload = {
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  isFeatured: boolean;
  displayOrder: number;
  doctorId?: string;
  authorName?: string;
};

export type VideoFormInitialValues = Partial<{
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  duration: string;
  isFeatured: boolean;
  displayOrder: string;
  doctorId: string;
  authorName: string;
}>;

export type VideoFormProps = {
  mode: "create" | "edit";
  initialValues?: VideoFormInitialValues;
  onSubmit: (payload: VideoFormPayload) => Promise<void>;
  submitting: boolean;
  error?: string;
  submitLabel?: string;
};

export function VideoForm({
  initialValues,
  onSubmit,
  submitting,
  error,
  submitLabel = "Save video",
}: VideoFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(() => initialValues?.title ?? "");
  const [description, setDescription] = useState(
    () => initialValues?.description ?? ""
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    () => initialValues?.youtubeUrl ?? ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    () => initialValues?.thumbnailUrl ?? ""
  );
  const [duration, setDuration] = useState(() => initialValues?.duration ?? "");
  const [isFeatured, setIsFeatured] = useState(
    () => initialValues?.isFeatured ?? false
  );
  const [displayOrder, setDisplayOrder] = useState(
    () => initialValues?.displayOrder ?? "0"
  );
  const [authorName, setAuthorName] = useState(
    () => initialValues?.authorName ?? ""
  );
  const [localError, setLocalError] = useState("");

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorId, setDoctorId] = useState(
    () => initialValues?.doctorId ?? ""
  );

  useEffect(() => {
    let alive = true;
    api<DoctorOption[]>("/api/v1/doctors")
      .then((data) => {
        if (alive) setDoctors(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!youtubeUrl.trim()) {
      setLocalError("YouTube URL is required");
      return;
    }

    const parsedOrder = displayOrder.trim()
      ? parseInt(displayOrder.trim(), 10)
      : 0;

    const payload: VideoFormPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      youtubeUrl: youtubeUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      duration: duration.trim() || undefined,
      isFeatured,
      displayOrder: !isNaN(parsedOrder) ? parsedOrder : 0,
      doctorId: doctorId || undefined,
      authorName: doctorId ? undefined : authorName.trim() || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Submit failed");
    }
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <SectionTitle className="mb-3">{t("admin.videos.videoSection")}</SectionTitle>

        <TextField
          id="title"
          label={t("admin.videos.titleLabel")}
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextAreaField
          id="description"
          label={`${t("admin.videos.descriptionLabel")} ${t("common.form.optional")}`}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          id="youtubeUrl"
          label={t("admin.videos.youtubeUrlLabel")}
          required
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">{t("admin.videos.displaySection")}</SectionTitle>

        <TextField
          id="thumbnailUrl"
          label={`${t("admin.videos.thumbnailUrlLabel")} ${t("common.form.optional")}`}
          type="text"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
        />

        <TextField
          id="duration"
          label={`${t("admin.videos.durationLabel")} ${t("common.form.optional")}`}
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 12:34"
        />

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-brand-slate">
            {t("admin.videos.featuredLabel")}
          </span>
          <button
            type="button"
            aria-pressed={isFeatured}
            onClick={() => setIsFeatured(!isFeatured)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
              isFeatured
                ? "border-brand-sky bg-brand-sky-bg text-brand-sky-deep font-semibold"
                : "border-brand-gray bg-white text-brand-slate hover:bg-brand-mist"
            }`}
          >
            {isFeatured && <Check className="h-4 w-4 shrink-0" />}
            {t("admin.videos.featureThisVideo")}
          </button>
        </div>

        <TextField
          id="displayOrder"
          label={t("admin.videos.displayOrderLabel")}
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">{t("admin.videos.attributionSection")}</SectionTitle>

        <div>
          <label
            htmlFor="doctor"
            className="mb-1.5 block text-sm font-semibold text-brand-slate"
          >
            {t("admin.videos.attributedDoctorLabel")} {t("common.form.optional")}
          </label>
          <select
            id="doctor"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="h-11 w-full rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          >
            <option value="">{t("admin.videos.noDoctorOption")}</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {!doctorId && (
          <TextField
            id="authorName"
            label={`${t("admin.videos.authorNameLabel")} ${t("common.form.optional")}`}
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t("admin.videos.authorNamePlaceholder")}
          />
        )}
      </div>

      {displayError && (
        <div className="rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
          {displayError}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-brand-gray/60 bg-white/95 px-4 py-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

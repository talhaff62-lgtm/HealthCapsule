"use client";

import { useEffect, useState, FormEvent } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/client-fetch";
import {
  Button,
  SectionTitle,
  TextAreaField,
  TextField,
} from "@/components/panel/ui";

type DoctorOption = { id: string; name: string };

const BLOG_STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"];

export type BlogPostFormPayload = {
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  status: string;
  isFeatured: boolean;
  doctorId?: string;
  authorName?: string;
};

export type BlogPostFormInitialValues = Partial<{
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string;
  status: string;
  isFeatured: boolean;
  doctorId: string;
  authorName: string;
}>;

export type BlogPostFormProps = {
  mode: "create" | "edit";
  initialValues?: BlogPostFormInitialValues;
  onSubmit: (payload: BlogPostFormPayload) => Promise<void>;
  submitting: boolean;
  error?: string;
  submitLabel?: string;
};

export function BlogPostForm({
  initialValues,
  onSubmit,
  submitting,
  error,
  submitLabel = "Save post",
}: BlogPostFormProps) {
  const [title, setTitle] = useState(() => initialValues?.title ?? "");
  const [excerpt, setExcerpt] = useState(() => initialValues?.excerpt ?? "");
  const [content, setContent] = useState(() => initialValues?.content ?? "");
  const [tags, setTags] = useState(() => initialValues?.tags ?? "");
  const [status, setStatus] = useState(
    () => initialValues?.status ?? "PUBLISHED"
  );
  const [isFeatured, setIsFeatured] = useState(
    () => initialValues?.isFeatured ?? false
  );
  const [authorName, setAuthorName] = useState(
    () => initialValues?.authorName ?? ""
  );

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorId, setDoctorId] = useState(
    () => initialValues?.doctorId ?? ""
  );

  const [coverImageUrl, setCoverImageUrl] = useState(
    () => initialValues?.coverImageUrl ?? ""
  );
  const [coverPreview, setCoverPreview] = useState(
    () => initialValues?.coverImageUrl ?? ""
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [localError, setLocalError] = useState("");

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

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      setUploadError("Please select an image file");
      return;
    }
    setCoverPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog");
      const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        image?: { url?: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.success || !data?.image?.url) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }
      setCoverImageUrl(data.image.url);
    } catch (err) {
      e.target.value = "";
      setCoverImageUrl("");
      setCoverPreview("");
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const payload: BlogPostFormPayload = {
      title: title.trim(),
      excerpt: excerpt.trim() || undefined,
      content,
      coverImageUrl: coverImageUrl || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      isFeatured,
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
        <SectionTitle className="mb-3">Post</SectionTitle>

        <TextField
          id="title"
          label="Title"
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          id="excerpt"
          label="Excerpt (optional)"
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary shown in listings"
        />

        <TextAreaField
          id="content"
          label="Content"
          required
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <TextField
          id="tags"
          label="Tags (optional)"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. nutrition, heart-health — comma separated"
        />
      </div>

      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Publication</SectionTitle>

        <div>
          <label
            htmlFor="status"
            className="mb-1.5 block text-sm font-semibold text-brand-slate"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          >
            {BLOG_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-brand-slate">
            Featured
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
            Feature this post
          </button>
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-brand-slate">
            Cover Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-full file:border-0 file:bg-brand-sky-bg file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-sky-deep hover:file:bg-brand-sky/20"
          />
          {uploading && <p className="mt-2 text-sm text-brand-muted">Uploading...</p>}
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover image preview"
              className="mt-2 h-24 w-40 rounded-xl object-cover"
            />
          )}
          {uploadError && (
            <p className="mt-2 text-sm font-medium text-status-emergency">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle className="mt-6 mb-3">Attribution</SectionTitle>

        <div>
          <label
            htmlFor="doctor"
            className="mb-1.5 block text-sm font-semibold text-brand-slate"
          >
            Attributed Doctor (optional)
          </label>
          <select
            id="doctor"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="h-11 w-full rounded-xl border border-brand-gray bg-white px-3 text-sm focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25"
          >
            <option value="">No doctor (custom author)</option>
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
            label="Author Name (optional)"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Shown when no doctor is attributed"
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

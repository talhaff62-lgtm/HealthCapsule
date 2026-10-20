"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import {
  VideoForm,
  VideoFormInitialValues,
  VideoFormPayload,
} from "@/components/admin/VideoForm";
import { Eyebrow } from "@/components/panel/ui";

type VideoResponse = {
  id: string;
  title: string;
  description?: string | null;
  youtubeUrl: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  authorName?: string | null;
  doctor?: { id: string; name: string } | null;
};

export default function AdminEditVideoPage() {
  const { me, loading: meLoading } = useMe();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [initialValues, setInitialValues] =
    useState<VideoFormInitialValues | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const video = await api<VideoResponse>(`/api/v1/admin/videos/${id}`);
        if (!alive) return;
        setInitialValues({
          title: video.title ?? "",
          description: video.description ?? "",
          youtubeUrl: video.youtubeUrl ?? "",
          thumbnailUrl: video.thumbnailUrl ?? "",
          duration: video.duration ?? "",
          isFeatured: video.isFeatured ?? false,
          displayOrder:
            video.displayOrder != null ? String(video.displayOrder) : "0",
          doctorId: video.doctor?.id ?? "",
          authorName: video.authorName ?? "",
        });
      } catch (err) {
        if (alive) {
          setFetchError(err instanceof Error ? err.message : "Video not found");
        }
      } finally {
        if (alive) setFetchLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (meLoading || (fetchLoading && me)) {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
      </div>
    );
  }

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">Not authorized</div>
      </div>
    );
  }

  if (fetchError || !initialValues) {
    return (
      <AdminShell title="Edit video" userName={me.name}>
        <div className="text-center py-12">
          <div className="text-status-emergency text-lg font-medium mb-2">
            {fetchError || "Video not found"}
          </div>
        </div>
      </AdminShell>
    );
  }

  const handleSubmit = async (payload: VideoFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api(`/api/v1/admin/videos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      router.push("/admin/videos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Edit video" userName={me.name}>
      <Eyebrow className="mb-4 block">EDIT VIDEO</Eyebrow>
      <VideoForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="Save changes"
      />
    </AdminShell>
  );
}

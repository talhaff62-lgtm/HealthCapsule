"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import { Button, Card, Eyebrow } from "@/components/panel/ui";

type VideoItem = {
  id: string;
  title: string;
  isFeatured: boolean;
  displayOrder: number;
  authorName?: string | null;
  doctor?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
};

export default function AdminVideosPage() {
  const { me, loading: meLoading } = useMe();
  const router = useRouter();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    if (me.role !== "ADMIN") {
      router.replace("/staff");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const data = await api<VideoItem[]>("/api/v1/admin/videos");
        if (alive) setVideos(data);
      } catch (err) {
        if (alive)
          setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [me, router]);

  if (meLoading || (loading && me)) {
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

  const handleDelete = async (video: VideoItem) => {
    if (!window.confirm(`Delete "${video.title}"?`)) return;
    setDeletingId(video.id);
    try {
      await api(`/api/v1/admin/videos/${video.id}`, { method: "DELETE" });
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell>
      <Eyebrow className="mb-1 block">VIDEOS</Eyebrow>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold text-brand-navy">
          Videos
        </h1>
        <Link href="/admin/videos/new">
          <Button variant="primary" size="sm">
            Add video
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-5 p-4">
          <p className="text-sm text-status-emergency">{error}</p>
        </Card>
      )}

      {videos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-brand-muted">No videos yet.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-gray bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-brand-mist font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="border-t border-brand-gray/70 transition-colors hover:bg-brand-sky-bg-soft"
                >
                  <td className="px-4 py-3.5 font-semibold text-brand-navy">
                    <span className="inline-flex items-center gap-1.5">
                      {video.title}
                      {video.isFeatured && (
                        <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-brand-slate">
                    {video.doctor?.name || video.authorName || video.createdBy?.name || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-brand-slate tabular-nums">
                    {video.displayOrder}
                  </td>
                  <td className="px-4 py-3.5 text-brand-muted tabular-nums">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/videos/${video.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlineDanger"
                        size="sm"
                        onClick={() => handleDelete(video)}
                        loading={deletingId === video.id}
                        aria-label={`Delete ${video.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

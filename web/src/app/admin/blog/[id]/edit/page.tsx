"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import {
  BlogPostForm,
  BlogPostFormInitialValues,
  BlogPostFormPayload,
} from "@/components/admin/BlogPostForm";
import { Eyebrow } from "@/components/panel/ui";

type BlogPostResponse = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  tags: string[];
  status: string;
  isFeatured: boolean;
  authorName?: string | null;
  doctor?: { id: string; name: string } | null;
};

export default function AdminEditBlogPostPage() {
  const { me, loading: meLoading } = useMe();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [initialValues, setInitialValues] =
    useState<BlogPostFormInitialValues | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const post = await api<BlogPostResponse>(`/api/v1/admin/blog/${id}`);
        if (!alive) return;
        setInitialValues({
          title: post.title ?? "",
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          coverImageUrl: post.coverImageUrl ?? "",
          tags: (post.tags ?? []).join(", "),
          status: post.status ?? "PUBLISHED",
          isFeatured: post.isFeatured ?? false,
          doctorId: post.doctor?.id ?? "",
          authorName: post.authorName ?? "",
        });
      } catch (err) {
        if (alive) {
          setFetchError(err instanceof Error ? err.message : "Post not found");
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
      <AdminShell title="Edit blog post" userName={me.name}>
        <div className="text-center py-12">
          <div className="text-status-emergency text-lg font-medium mb-2">
            {fetchError || "Post not found"}
          </div>
        </div>
      </AdminShell>
    );
  }

  const handleSubmit = async (payload: BlogPostFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api(`/api/v1/admin/blog/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Edit blog post" userName={me.name}>
      <Eyebrow className="mb-4 block">EDIT BLOG POST</Eyebrow>
      <BlogPostForm
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

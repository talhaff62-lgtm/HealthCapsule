"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { api } from "@/lib/client-fetch";
import {
  BlogPostForm,
  BlogPostFormPayload,
} from "@/components/admin/BlogPostForm";
import { Eyebrow } from "@/components/panel/ui";

export default function AdminNewBlogPostPage() {
  const { me, loading } = useMe();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
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

  const handleSubmit = async (payload: BlogPostFormPayload) => {
    setError("");
    setSubmitting(true);
    try {
      await api("/api/v1/admin/blog", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Add blog post" userName={me.name}>
      <Eyebrow className="mb-4 block">NEW BLOG POST</Eyebrow>
      <BlogPostForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="Create post"
      />
    </AdminShell>
  );
}

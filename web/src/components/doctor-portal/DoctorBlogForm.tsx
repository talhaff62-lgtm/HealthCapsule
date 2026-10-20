"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitBlogPost, SubmitBlogPostResult } from "@/app/portal/doctor/blog/actions";
import { Button, TextAreaField, TextField } from "@/components/panel/ui";

export default function DoctorBlogForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setStatus(null);

    const result: SubmitBlogPostResult = await submitBlogPost({
      title: title.trim(),
      excerpt: excerpt.trim() || undefined,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setPending(false);
    if (result.ok) {
      setStatus({
        type: "success",
        message: "Submitted for review — the Capsule team will publish it after checking.",
      });
      setTitle("");
      setExcerpt("");
      setContent("");
      setTags("");
      router.refresh();
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-status-verified-light text-status-verified"
              : "bg-status-emergency-light text-status-emergency"
          }`}
        >
          {status.message}
        </div>
      )}

      <TextField
        id="doctor-blog-title"
        label="Title"
        required
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextField
        id="doctor-blog-excerpt"
        label="Excerpt (optional)"
        type="text"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short summary shown in listings"
      />

      <TextAreaField
        id="doctor-blog-content"
        label="Content"
        required
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <TextField
        id="doctor-blog-tags"
        label="Tags (optional)"
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g. nutrition, heart-health — comma separated"
      />

      <Button type="submit" variant="primary" loading={pending}>
        Submit for review
      </Button>
    </form>
  );
}

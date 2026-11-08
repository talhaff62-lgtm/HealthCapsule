"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/panel/admin-shell";
import { useMe } from "@/components/panel/use-me";
import { useLanguage } from "@/components/language-provider";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/client-fetch";
import { Button, Card, Eyebrow } from "@/components/panel/ui";

type BlogPostItem = {
  id: string;
  title: string;
  status: string;
  isFeatured: boolean;
  authorName?: string | null;
  doctor?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
};

export default function AdminBlogPage() {
  const { t } = useLanguage();
  const { me, loading: meLoading } = useMe();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPostItem[]>([]);
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
        const data = await api<BlogPostItem[]>("/api/v1/admin/blog");
        if (alive) setPosts(data);
      } catch (err) {
        if (alive)
          setError(err instanceof Error ? err.message : t("admin.blog.errorLoadPostsFailed"));
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
        <div className="text-brand-muted">{t("common.ui.loading")}</div>
      </div>
    );
  }

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-cloud flex items-center justify-center">
        <div className="text-status-emergency">{t("common.ui.notAuthorized")}</div>
      </div>
    );
  }

  const handleDelete = async (post: BlogPostItem) => {
    if (!window.confirm(t("admin.blog.confirmDelete", { title: post.title }))) return;
    setDeletingId(post.id);
    try {
      await api(`/api/v1/admin/blog/${post.id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.blog.errorDeleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell>
      <Eyebrow className="mb-1 block">{t("admin.blog.eyebrow")}</Eyebrow>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold text-brand-navy">
          {t("admin.blog.headingBlogPosts")}
        </h1>
        <Link href="/admin/blog/new">
          <Button variant="primary" size="sm">
            {t("admin.blog.buttonAddPost")}
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-5 p-4">
          <p className="text-sm text-status-emergency">{error}</p>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-brand-muted">{t("admin.blog.emptyNoPosts")}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-gray bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-brand-mist font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">{t("admin.blog.tableHeaderTitle")}</th>
                <th className="px-4 py-3 text-left">{t("admin.blog.tableHeaderAuthor")}</th>
                <th className="px-4 py-3 text-left">{t("admin.blog.tableHeaderStatus")}</th>
                <th className="px-4 py-3 text-left">{t("admin.blog.tableHeaderDate")}</th>
                <th className="px-4 py-3 text-right">{t("admin.blog.tableHeaderActions")}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t border-brand-gray/70 transition-colors hover:bg-brand-sky-bg-soft"
                >
                  <td className="px-4 py-3.5 font-semibold text-brand-navy">
                    <span className="inline-flex items-center gap-1.5">
                      {post.title}
                      {post.isFeatured && (
                        <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-brand-slate">
                    {post.doctor?.name || post.authorName || post.createdBy?.name || t("common.ui.fallbackDash")}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3.5 text-brand-muted tabular-nums">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                      >
                        {t("admin.blog.buttonEdit")}
                      </Button>
                      <Button
                        variant="outlineDanger"
                        size="sm"
                        onClick={() => handleDelete(post)}
                        loading={deletingId === post.id}
                        aria-label={t("admin.blog.ariaLabelDelete", { title: post.title })}
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

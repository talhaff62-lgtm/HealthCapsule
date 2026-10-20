import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DoctorBlogForm from "@/components/doctor-portal/DoctorBlogForm";

export const metadata: Metadata = {
  title: "My Blog Posts — Capsule",
  description: "Write health articles for the Capsule blog.",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: "bg-status-warning-light text-status-warning",
  PUBLISHED: "bg-status-verified-light text-status-verified",
};

export default async function DoctorBlogPage() {
  const user = await requireRole(UserRole.DOCTOR).catch(() => null);
  if (!user) {
    redirect("/login");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!doctor) {
    notFound();
  }

  const posts = await prisma.blogPost.findMany({
    where: { doctorId: doctor.id, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      status: true,
      createdAt: true,
      viewsCount: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/portal/doctor"
            className="text-sm font-medium text-brand-sky-dark hover:text-brand-sky-deep"
          >
            ← Back to portal
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-navy sm:text-3xl">
            My Blog Posts
          </h1>
          <p className="mt-1 text-brand-muted">
            New posts are submitted for review and published by the Capsule
            team. Your name is shown as the author.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 font-serif text-lg font-semibold text-brand-navy">
            Write a new post
          </h2>
          <DoctorBlogForm />
        </div>

        <div className="mt-6 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-lg font-semibold text-brand-navy">
            Your posts
          </h2>

          {posts.length === 0 ? (
            <p className="mt-3 text-brand-muted">
              {"You haven't written any posts yet."}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-brand-gray">
              {posts.map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-brand-navy">{post.title}</p>
                    <p className="mt-0.5 text-sm text-brand-muted">
                      {post.createdAt.toLocaleDateString()} · {post.viewsCount} views
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      STATUS_BADGE[post.status] ?? "bg-brand-mist text-brand-muted"
                    }`}
                  >
                    {post.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

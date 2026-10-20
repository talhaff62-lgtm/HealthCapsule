import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { CalendarDays, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogPostStatus } from "@prisma/client";
import ShareButtons from "@/components/share/ShareButtons";
import BackButton from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

async function getPublishedPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: {
      slug,
      status: BlogPostStatus.PUBLISHED,
      deletedAt: null,
    },
    include: {
      doctor: { select: { name: true, slug: true } },
      createdBy: { select: { name: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    return {
      title: "Not Found — Capsule",
    };
  }

  return {
    title: `${post.title} — Capsule`,
    description: post.excerpt ?? post.content.slice(0, 150),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    notFound();
  }

  prisma.blogPost
    .update({
      where: { id: post.id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => {});

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/blog/${post.slug}`;

  const publishedAt = post.publishedAt ?? post.createdAt;
  const attributionName = post.authorName ?? post.createdBy.name;
  const paragraphs = post.content
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim().length > 0);

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="mt-4 overflow-hidden rounded-3xl border border-brand-gray bg-white shadow-sm">
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          )}

          <div className="p-6 sm:p-10">
            <h1 className="font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-wider text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand-sky" />
                <time dateTime={publishedAt.toISOString()}>
                  {publishedAt.toLocaleDateString()}
                </time>
              </span>

              {post.doctor ? (
                <Link
                  href={`/doctors/${post.doctor.slug}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-navy transition hover:text-brand-sky"
                >
                  <User className="h-3.5 w-3.5 text-brand-sky" />
                  {post.doctor.name}
                </Link>
              ) : attributionName ? (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-sky" />
                  {attributionName}
                </span>
              ) : null}
            </div>

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-sky-bg px-3 py-1 text-xs font-medium text-brand-sky-deep"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 space-y-5 border-t border-brand-gray pt-8">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="whitespace-pre-line text-[15px] leading-relaxed text-brand-slate"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 border-t border-brand-gray pt-6">
              <ShareButtons url={shareUrl} title={post.title} />
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

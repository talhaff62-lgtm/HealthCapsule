import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ShareButtons from "@/components/share/ShareButtons";
import BackButton from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

type VideoPageProps = {
  params: Promise<{ slug: string }>;
};

async function getVideoBySlug(slug: string) {
  return prisma.video.findFirst({
    where: { slug, deletedAt: null },
    include: {
      doctor: { select: { name: true, slug: true } },
      createdBy: { select: { name: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) {
    return {
      title: "Not Found — Capsule",
    };
  }

  return {
    title: `${video.title} — Capsule`,
    description: video.description?.slice(0, 150) ?? video.title,
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/videos/${video.slug}`;

  const attributionName = video.authorName ?? video.createdBy.name;
  const paragraphs = video.description
    ? video.description
        .split(/\n\s*\n/)
        .filter((paragraph) => paragraph.trim().length > 0)
    : [];

  return (
    <section className="min-h-screen bg-brand-cream py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="mt-4 overflow-hidden rounded-3xl border border-brand-gray bg-white shadow-sm">
          {/* 16:9 Player */}
          <div className="relative aspect-video w-full bg-brand-navy">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}`}
              title={video.title}
              loading="lazy"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>

          <div className="p-6 sm:p-10">
            <h1 className="font-serif text-3xl font-semibold text-brand-navy sm:text-4xl">
              {video.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-wider text-brand-muted">
              {video.doctor ? (
                <Link
                  href={`/doctors/${video.doctor.slug}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-navy transition hover:text-brand-sky"
                >
                  <User className="h-3.5 w-3.5 text-brand-sky" />
                  {video.doctor.name}
                </Link>
              ) : attributionName ? (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-sky" />
                  {attributionName}
                </span>
              ) : null}
            </div>

            {paragraphs.length > 0 && (
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
            )}

            <div className="mt-10 border-t border-brand-gray pt-6">
              <ShareButtons url={shareUrl} title={video.title} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

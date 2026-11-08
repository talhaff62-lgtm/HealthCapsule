import { prisma } from "@/lib/prisma";
import { Video } from "lucide-react";
import VideoCard from "@/components/videos/VideoCard";
import Pagination from "@/components/ui/Pagination";
import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export const metadata = {
  title: "Videos — Capsule",
  description:
    "Watch short health videos from verified doctors — tips, treatment explainers, and clinic walkthroughs.",
};

const PAGE_SIZE = 24;

type SearchParams = Promise<{ page?: string }>;

export default async function VideosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = await getServerLocale();
  const t = getT(locale);

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10) || 1;

  const where = { deletedAt: null };

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.video.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-brand-navy py-12 mb-8 border-b border-brand-sky/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[250px] w-[250px] rounded-full bg-brand-sky/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-brand-navy-light/40 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-brand-sky-bright">
            <Video className="h-3.5 w-3.5" />
            {t("videos.listing.healthVideos")}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            {t("videos.listing.watchAndLearn")}
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-xl">
            {t("videos.listing.shortPracticalVideos")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {total > 0 && (
          <p className="mb-4 text-sm text-brand-muted">
            {t("videos.listing.showingRange", { count: videos.length, total })}
          </p>
        )}

        {videos.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray bg-white p-12 text-center text-brand-muted">
            {t("videos.listing.noVideosFound")}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / PAGE_SIZE)}
                basePath="/videos"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

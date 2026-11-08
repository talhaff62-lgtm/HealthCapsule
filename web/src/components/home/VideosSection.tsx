import { getT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import Link from "next/link";
import { Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import VideoCard from "@/components/videos/VideoCard";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";

async function getFeaturedVideos() {
  try {
    const featured = await prisma.video.findMany({
      where: { deletedAt: null, isFeatured: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: 4,
    });
    if (featured.length >= 4) return featured;
    const pickedIds = featured.map((v) => v.id);
    const backfill = await prisma.video.findMany({
      where: { deletedAt: null, id: { notIn: pickedIds } },
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      take: 4 - featured.length,
    });
    return [...featured, ...backfill];
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    return [];
  }
}

export default async function VideosSection() {
  const locale = await getServerLocale();
  const t = getT(locale);
  const videos = await getFeaturedVideos();

  if (videos.length === 0) return null;

  return (
    <SectionCanvas tone="tint" id="videos">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            <Video className="h-3.5 w-3.5" />
            {t("home.videos.badge")}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            {t("home.videos.title")}
          </h2>
          <p className="mt-3 text-ink-muted">
            {t("home.videos.desc")}
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => (
            <StaggerItem key={video.id}>
              <VideoCard video={video} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-10 text-center">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:border-brand-sky hover:text-brand-sky-dark"
          >
            {t("home.videos.viewAll")}
          </Link>
        </div>
      </div>
    </SectionCanvas>
  );
}

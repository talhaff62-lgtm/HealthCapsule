import React from "react";
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
  const videos = await getFeaturedVideos();

  if (videos.length === 0) return null;

  return (
    <SectionCanvas tone="tint" id="videos">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20">
        <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            <Video className="h-3.5 w-3.5" />
            Health Videos
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Watch &amp; Learn
          </h2>
          <p className="mt-3 text-ink-muted">
            Short, practical videos from verified doctors — health tips, treatment explainers, and clinic walkthroughs.
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
            View All Videos
          </Link>
        </div>
      </div>
    </SectionCanvas>
  );
}

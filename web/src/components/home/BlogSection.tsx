import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogPostStatus } from "@prisma/client";
import BlogCard from "@/components/blog/BlogCard";
import { SectionCanvas } from "@/components/home/SectionCanvas";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion";

async function getFeaturedPosts() {
  try {
    const where = { status: BlogPostStatus.PUBLISHED, deletedAt: null };
    const featured = await prisma.blogPost.findMany({
      where: { ...where, isFeatured: true },
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: 4,
    });
    if (featured.length >= 4) return featured;
    const pickedIds = featured.map((p) => p.id);
    const backfill = await prisma.blogPost.findMany({
      where: { ...where, id: { notIn: pickedIds } },
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: 4 - featured.length,
    });
    return [...featured, ...backfill];
  } catch (error) {
    console.error("Error fetching featured blog posts:", error);
    return [];
  }
}

export default async function BlogSection() {
  const posts = await getFeaturedPosts();

  if (posts.length === 0) return null;

  return (
    <SectionCanvas tone="tint" id="blog">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-brand-sky-deep">
            <BookOpen className="h-3.5 w-3.5" />
            Health Blog
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            From the Blog
          </h2>
          <p className="mt-3 text-ink-muted">
            Practical articles and health guides written by verified doctors and the Capsule team.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <StaggerItem key={post.id}>
              <BlogCard post={post} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:border-brand-sky hover:text-brand-sky-dark"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </SectionCanvas>
  );
}

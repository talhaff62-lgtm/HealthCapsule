import Link from "next/link";

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorName: string | null;
  doctor?: { name: string } | null;
  publishedAt: Date | null;
  createdAt: Date;
};

export default function BlogCard({ post }: { post: BlogCardPost }) {
  const date = post.publishedAt ?? post.createdAt;
  const author = post.doctor?.name ?? post.authorName;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="premium-card group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-navy-light">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-brand-navy to-brand-navy-light"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-sky line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 border-t border-brand-gray pt-3 text-xs text-brand-muted">
          {author && <span className="truncate font-medium">{author}</span>}
          <time dateTime={date.toISOString()} className="ml-auto shrink-0 font-mono">
            {date.toLocaleDateString()}
          </time>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  queryParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
  params.set("page", page.toString());
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  pages.push(1);

  if (left > 2) {
    if (left === 3) {
      pages.push(2);
    } else {
      pages.push("...");
    }
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) {
    if (right === totalPages - 2) {
      pages.push(totalPages - 1);
    } else {
      pages.push("...");
    }
  }

  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const baseLinkClasses =
    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
  const activeClasses = "bg-brand-navy border-brand-navy text-white";
  const inactiveClasses =
    "bg-white border-brand-gray text-brand-navy hover:border-brand-sky";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      {currentPage > 1 && (
        <Link
          href={buildHref(basePath, queryParams, currentPage - 1)}
          className={`${baseLinkClasses} ${inactiveClasses}`}
        >
          Previous
        </Link>
      )}

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1.5 text-sm text-brand-muted"
            >
              …
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(basePath, queryParams, page)}
            aria-current={isCurrent ? "page" : undefined}
            className={`${baseLinkClasses} ${
              isCurrent ? activeClasses : inactiveClasses
            }`}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={buildHref(basePath, queryParams, currentPage + 1)}
          className={`${baseLinkClasses} ${inactiveClasses}`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}

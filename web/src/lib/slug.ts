// Shared slug helpers for Doctor and Facility records.
// Keeps slug generation and collision handling in one place so both registration
// flows behave identically.

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique slug for a given name.
 * `exists` should resolve true when the slug is already taken.
 * If the base slug is taken, appends a short random suffix and retries.
 */
export async function generateUniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name);
  if (!base) {
    throw new Error("Name cannot be empty");
  }

  let slug = base;
  if (!(await exists(slug))) {
    return slug;
  }

  // Try a few numbered suffixes first, then fall back to random.
  for (let i = 2; i <= 10; i++) {
    slug = `${base}-${i}`;
    if (!(await exists(slug))) {
      return slug;
    }
  }

  slug = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
  if (await exists(slug)) {
    throw new Error("Unable to generate a unique slug. Please try a different name.");
  }

  return slug;
}

export { slugify };

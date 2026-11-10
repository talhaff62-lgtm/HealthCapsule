// seed-district-slugs.ts — backfills District.slug for every district row
// (the /<district>/ URL routes need it). Idempotent: only fills null slugs.
// Usage: npx tsx prisma/seed-district-slugs.ts
import "dotenv/config";
import { prisma } from "@/lib/prisma";

const kebab = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const districts = await prisma.district.findMany({ select: { id: true, name: true, slug: true } });
  const taken = new Set(
    (await prisma.district.findMany({ where: { slug: { not: null } }, select: { slug: true } })).map(
      (d) => d.slug as string
    )
  );
  let filled = 0;
  for (const d of districts) {
    if (d.slug) continue;
    let slug = kebab(d.name);
    if (taken.has(slug)) slug = `${slug}-${kebab(d.id.slice(-4))}`;
    taken.add(slug);
    await prisma.district.update({ where: { id: d.id }, data: { slug } });
    console.log(`  + slug: ${d.name} -> ${slug}`);
    filled++;
  }
  console.log(`Done. ${filled} of ${districts.length} districts got slugs.`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

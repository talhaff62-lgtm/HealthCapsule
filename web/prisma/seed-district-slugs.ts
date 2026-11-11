// seed-district-slugs.ts — backfills District.slug & District.bnName for every district row
// (the /<district>/ URL routes need it). Idempotent: only fills null fields.
// Usage: npx tsx prisma/seed-district-slugs.ts
import "dotenv/config";
import { prisma } from "@/lib/prisma";

const kebab = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const BN_NAMES: Record<string, string> = {
  Chattogram: "চট্টগ্রাম",
  Noakhali: "নোয়াখালী",
  Dhaka: "ঢাকা",
  Rajshahi: "রাজশাহী",
  Cumilla: "কুমিল্লা",
  Mymensingh: "ময়মনসিংহ",
  Khulna: "খুলনা",
  Barishal: "বরিশাল",
  Sylhet: "সিলেট",
  Gazipur: "গাজীপুর",
  Narayanganj: "নারায়ণগঞ্জ",
  Rangpur: "রংপুর",
  "Cox's Bazar": "কক্সবাজার",
};

async function main() {
  const districts = await prisma.district.findMany({ select: { id: true, name: true, slug: true, bnName: true } });
  const taken = new Set(
    (await prisma.district.findMany({ where: { slug: { not: null } }, select: { slug: true } })).map(
      (d) => d.slug as string
    )
  );
  let filledSlugs = 0;
  let filledBn = 0;
  for (const d of districts) {
    const data: { slug?: string; bnName?: string } = {};
    if (!d.slug) {
      let slug = kebab(d.name);
      if (taken.has(slug)) slug = `${slug}-${kebab(d.id.slice(-4))}`;
      taken.add(slug);
      data.slug = slug;
      filledSlugs++;
    }
    if (!d.bnName && BN_NAMES[d.name]) {
      data.bnName = BN_NAMES[d.name];
      filledBn++;
    }
    if (Object.keys(data).length > 0) {
      await prisma.district.update({ where: { id: d.id }, data });
      console.log(`  + updated ${d.name}:`, data);
    }
  }
  console.log(`Done. ${filledSlugs} slugs filled, ${filledBn} bnNames filled.`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

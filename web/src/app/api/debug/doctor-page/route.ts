import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function errString(e: unknown): string {
  const name = e instanceof Error ? e.name : typeof e;
  const message = e instanceof Error ? e.message : String(e);
  const firstStack =
    e instanceof Error && e.stack
      ? e.stack.split("\n")[1]?.trim() ?? ""
      : "";
  return firstStack ? `${name}: ${message} @ ${firstStack}` : `${name}: ${message}`;
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("key") !== "hcdiag2026") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const steps: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any = null;
  let parsedHtml = "";

  try {
    const mod = await import("@/lib/prisma");
    prisma = mod.prisma;
    steps["prisma-import"] = "ok";
  } catch (e) {
    steps["prisma-import"] = errString(e);
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: {
        slug: "dr-salahuddin-kabir-siddique",
        verificationStatus: "VERIFIED",
        deletedAt: null,
        isActive: true,
      },
      include: {
        specialties: {
          include: { specialty: { select: { name: true, slug: true } } },
        },
        chambers: {
          where: { deletedAt: null, isActive: true },
          include: {
            area: { select: { name: true, slug: true } },
            facility: { select: { name: true, slug: true } },
            schedules: {
              where: { deletedAt: null, isActive: true },
              select: { dayOfWeek: true, startTime: true, endTime: true },
              orderBy: { dayOfWeek: "asc" },
            },
          },
        },
      },
    });
    steps["db-query"] = doctor ? "ok (found: true)" : "ok (found: false)";
  } catch (e) {
    steps["db-query"] = errString(e);
  }

  try {
    await import("marked");
    steps["marked-import"] = "ok";
  } catch (e) {
    steps["marked-import"] = errString(e);
  }

  try {
    const { marked } = await import("marked");
    parsedHtml = (await marked.parse("Hello **world**")) as string;
    steps["marked-parse"] = "ok";
  } catch (e) {
    steps["marked-parse"] = errString(e);
  }

  try {
    await import("isomorphic-dompurify");
    steps["dompurify-import"] = "ok";
  } catch (e) {
    steps["dompurify-import"] = errString(e);
  }

  try {
    const DOMPurify = (await import("isomorphic-dompurify")).default;
    DOMPurify.sanitize(parsedHtml);
    steps["dompurify-sanitize"] = "ok";
  } catch (e) {
    steps["dompurify-sanitize"] = errString(e);
  }

  try {
    const mod = await import("@/lib/doctors");
    mod.getNextAvailableSlot([]);
    steps["doctors-lib"] = "ok";
  } catch (e) {
    steps["doctors-lib"] = errString(e);
  }

  try {
    const mod = await import("@/components/ui/VerifiedBadge");
    steps["badge-import"] =
      typeof mod.default !== "undefined" ? "ok" : "ok (no default export)";
  } catch (e) {
    steps["badge-import"] = errString(e);
  }

  return NextResponse.json({ steps }, { status: 200 });
}

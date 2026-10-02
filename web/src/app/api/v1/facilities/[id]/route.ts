import { NextRequest, NextResponse } from "next/server";
import { ListingTier, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

const TIERS = new Set<string>([
  ListingTier.FREE,
  ListingTier.VERIFIED,
  ListingTier.FEATURED,
  ListingTier.PREMIUM,
]);

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    description?: unknown;
    listingTier?: unknown;
    featuredUntil?: unknown;
    logoUrl?: unknown;
    coverImageUrl?: unknown;
    address?: unknown;
    longDescription?: unknown;
    phone?: unknown;
    email?: unknown;
    website?: unknown;
    beds?: unknown;
    establishedYear?: unknown;
    hasIcu?: unknown;
    hasNicu?: unknown;
    hasEmergency?: unknown;
    hasAmbulance?: unknown;
    icuBeds?: unknown;
    nicuBeds?: unknown;
    operationTheaters?: unknown;
    hasBloodBank?: unknown;
    hasPharmacy?: unknown;
    hasPathologyLab?: unknown;
    hasHomeSampleCollection?: unknown;
    hasOnlineReport?: unknown;
    hasParkingAvailable?: unknown;
    emergencyPhone?: unknown;
    mobile?: unknown;
    ownership?: unknown;
    openingHours?: unknown;
    accreditation?: unknown;
    dghsLicenceNo?: unknown;
    insurancePanels?: unknown;
    diagnosticTests?: unknown;
    imagingServices?: unknown;
    rating?: unknown;
    totalReviews?: unknown;
    doctorsOnPanel?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: {
    name?: string;
    description?: string | null;
    listingTier?: ListingTier;
    featuredUntil?: Date | null;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    address?: string;
    longDescription?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    beds?: number | null;
    establishedYear?: number | null;
    hasIcu?: boolean;
    hasNicu?: boolean;
    hasEmergency?: boolean;
    hasAmbulance?: boolean;
    icuBeds?: number | null;
    nicuBeds?: number | null;
    operationTheaters?: number | null;
    hasBloodBank?: boolean;
    hasPharmacy?: boolean;
    hasPathologyLab?: boolean;
    hasHomeSampleCollection?: boolean;
    hasOnlineReport?: boolean;
    hasParkingAvailable?: boolean;
    emergencyPhone?: string | null;
    mobile?: string | null;
    ownership?: string | null;
    openingHours?: string | null;
    accreditation?: string | null;
    dghsLicenceNo?: string | null;
    insurancePanels?: string[];
    diagnosticTests?: string[];
    imagingServices?: string[];
    rating?: number | null;
    totalReviews?: number | null;
    doctorsOnPanel?: number | null;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    data.name = body.name.trim();
  }

  if (body.address !== undefined) {
    if (typeof body.address !== "string" || !body.address.trim()) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    data.address = body.address.trim();
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Invalid description" },
        { status: 400 }
      );
    }
    data.description = body.description === null ? null : (body.description as string);
  }

  if (body.longDescription !== undefined) {
    if (body.longDescription !== null && typeof body.longDescription !== "string") {
      return NextResponse.json(
        { error: "Invalid longDescription" },
        { status: 400 }
      );
    }
    data.longDescription = typeof body.longDescription === "string" ? body.longDescription.trim() : null;
  }

  if (body.phone !== undefined) {
    if (body.phone !== null && typeof body.phone !== "string") {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    data.phone = typeof body.phone === "string" ? body.phone.trim() : null;
  }

  if (body.email !== undefined) {
    if (body.email !== null && typeof body.email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    data.email = typeof body.email === "string" ? body.email.trim() : null;
  }

  if (body.website !== undefined) {
    if (body.website !== null && typeof body.website !== "string") {
      return NextResponse.json({ error: "Invalid website" }, { status: 400 });
    }
    data.website = typeof body.website === "string" ? body.website.trim() : null;
  }

  if (body.emergencyPhone !== undefined) {
    if (body.emergencyPhone !== null && typeof body.emergencyPhone !== "string") {
      return NextResponse.json({ error: "Invalid emergencyPhone" }, { status: 400 });
    }
    data.emergencyPhone = typeof body.emergencyPhone === "string" ? body.emergencyPhone.trim() : null;
  }

  if (body.mobile !== undefined) {
    if (body.mobile !== null && typeof body.mobile !== "string") {
      return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
    }
    data.mobile = typeof body.mobile === "string" ? body.mobile.trim() : null;
  }

  if (body.ownership !== undefined) {
    if (body.ownership !== null && typeof body.ownership !== "string") {
      return NextResponse.json({ error: "Invalid ownership" }, { status: 400 });
    }
    data.ownership = typeof body.ownership === "string" ? body.ownership.trim() : null;
  }

  if (body.openingHours !== undefined) {
    if (body.openingHours !== null && typeof body.openingHours !== "string") {
      return NextResponse.json({ error: "Invalid openingHours" }, { status: 400 });
    }
    data.openingHours = typeof body.openingHours === "string" ? body.openingHours.trim() : null;
  }

  if (body.accreditation !== undefined) {
    if (body.accreditation !== null && typeof body.accreditation !== "string") {
      return NextResponse.json({ error: "Invalid accreditation" }, { status: 400 });
    }
    data.accreditation = typeof body.accreditation === "string" ? body.accreditation.trim() : null;
  }

  if (body.dghsLicenceNo !== undefined) {
    if (body.dghsLicenceNo !== null && typeof body.dghsLicenceNo !== "string") {
      return NextResponse.json({ error: "Invalid dghsLicenceNo" }, { status: 400 });
    }
    data.dghsLicenceNo = typeof body.dghsLicenceNo === "string" ? body.dghsLicenceNo.trim() : null;
  }

  if (body.listingTier !== undefined) {
    if (typeof body.listingTier !== "string" || !TIERS.has(body.listingTier)) {
      return NextResponse.json(
        { error: "Invalid listingTier" },
        { status: 400 }
      );
    }
    data.listingTier = body.listingTier as ListingTier;
  }

  if (body.featuredUntil !== undefined) {
    if (body.featuredUntil === null || body.featuredUntil === "") {
      data.featuredUntil = null;
    } else if (typeof body.featuredUntil !== "string") {
      return NextResponse.json(
        { error: "Invalid featuredUntil" },
        { status: 400 }
      );
    } else {
      const time = Date.parse(body.featuredUntil);
      if (Number.isNaN(time)) {
        return NextResponse.json(
          { error: "Invalid featuredUntil" },
          { status: 400 }
        );
      }
      data.featuredUntil = new Date(time);
    }
  }

  if (body.logoUrl !== undefined) {
    if (body.logoUrl === null) {
      data.logoUrl = null;
    } else if (
      typeof body.logoUrl === "string" &&
      body.logoUrl.trim().length > 0 &&
      (body.logoUrl.startsWith("http://") || body.logoUrl.startsWith("https://"))
    ) {
      data.logoUrl = body.logoUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid logoUrl" },
        { status: 400 }
      );
    }
  }

  if (body.coverImageUrl !== undefined) {
    if (body.coverImageUrl === null) {
      data.coverImageUrl = null;
    } else if (
      typeof body.coverImageUrl === "string" &&
      body.coverImageUrl.trim().length > 0 &&
      (body.coverImageUrl.startsWith("http://") || body.coverImageUrl.startsWith("https://"))
    ) {
      data.coverImageUrl = body.coverImageUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid coverImageUrl" },
        { status: 400 }
      );
    }
  }

  if (body.beds !== undefined) {
    if (body.beds === null) {
      data.beds = null;
    } else {
      const val = Number(body.beds);
      if (typeof body.beds === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid beds" }, { status: 400 });
      }
      data.beds = val;
    }
  }

  if (body.establishedYear !== undefined) {
    if (body.establishedYear === null) {
      data.establishedYear = null;
    } else {
      const val = Number(body.establishedYear);
      if (typeof body.establishedYear === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid establishedYear" }, { status: 400 });
      }
      data.establishedYear = val;
    }
  }

  if (body.icuBeds !== undefined) {
    if (body.icuBeds === null) {
      data.icuBeds = null;
    } else {
      const val = Number(body.icuBeds);
      if (typeof body.icuBeds === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid icuBeds" }, { status: 400 });
      }
      data.icuBeds = val;
    }
  }

  if (body.nicuBeds !== undefined) {
    if (body.nicuBeds === null) {
      data.nicuBeds = null;
    } else {
      const val = Number(body.nicuBeds);
      if (typeof body.nicuBeds === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid nicuBeds" }, { status: 400 });
      }
      data.nicuBeds = val;
    }
  }

  if (body.operationTheaters !== undefined) {
    if (body.operationTheaters === null) {
      data.operationTheaters = null;
    } else {
      const val = Number(body.operationTheaters);
      if (typeof body.operationTheaters === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid operationTheaters" }, { status: 400 });
      }
      data.operationTheaters = val;
    }
  }

  if (body.rating !== undefined) {
    if (body.rating === null) {
      data.rating = null;
    } else {
      const val = Number(body.rating);
      if (typeof body.rating === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
      }
      data.rating = val;
    }
  }

  if (body.totalReviews !== undefined) {
    if (body.totalReviews === null) {
      data.totalReviews = null;
    } else {
      const val = Number(body.totalReviews);
      if (typeof body.totalReviews === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid totalReviews" }, { status: 400 });
      }
      data.totalReviews = val;
    }
  }

  if (body.doctorsOnPanel !== undefined) {
    if (body.doctorsOnPanel === null) {
      data.doctorsOnPanel = null;
    } else {
      const val = Number(body.doctorsOnPanel);
      if (typeof body.doctorsOnPanel === "boolean" || !Number.isFinite(val)) {
        return NextResponse.json({ error: "Invalid doctorsOnPanel" }, { status: 400 });
      }
      data.doctorsOnPanel = val;
    }
  }

  if (body.hasIcu !== undefined) {
    if (typeof body.hasIcu !== "boolean") {
      return NextResponse.json({ error: "Invalid hasIcu" }, { status: 400 });
    }
    data.hasIcu = body.hasIcu;
  }

  if (body.hasNicu !== undefined) {
    if (typeof body.hasNicu !== "boolean") {
      return NextResponse.json({ error: "Invalid hasNicu" }, { status: 400 });
    }
    data.hasNicu = body.hasNicu;
  }

  if (body.hasEmergency !== undefined) {
    if (typeof body.hasEmergency !== "boolean") {
      return NextResponse.json({ error: "Invalid hasEmergency" }, { status: 400 });
    }
    data.hasEmergency = body.hasEmergency;
  }

  if (body.hasAmbulance !== undefined) {
    if (typeof body.hasAmbulance !== "boolean") {
      return NextResponse.json({ error: "Invalid hasAmbulance" }, { status: 400 });
    }
    data.hasAmbulance = body.hasAmbulance;
  }

  if (body.hasBloodBank !== undefined) {
    if (typeof body.hasBloodBank !== "boolean") {
      return NextResponse.json({ error: "Invalid hasBloodBank" }, { status: 400 });
    }
    data.hasBloodBank = body.hasBloodBank;
  }

  if (body.hasPharmacy !== undefined) {
    if (typeof body.hasPharmacy !== "boolean") {
      return NextResponse.json({ error: "Invalid hasPharmacy" }, { status: 400 });
    }
    data.hasPharmacy = body.hasPharmacy;
  }

  if (body.hasPathologyLab !== undefined) {
    if (typeof body.hasPathologyLab !== "boolean") {
      return NextResponse.json({ error: "Invalid hasPathologyLab" }, { status: 400 });
    }
    data.hasPathologyLab = body.hasPathologyLab;
  }

  if (body.hasHomeSampleCollection !== undefined) {
    if (typeof body.hasHomeSampleCollection !== "boolean") {
      return NextResponse.json({ error: "Invalid hasHomeSampleCollection" }, { status: 400 });
    }
    data.hasHomeSampleCollection = body.hasHomeSampleCollection;
  }

  if (body.hasOnlineReport !== undefined) {
    if (typeof body.hasOnlineReport !== "boolean") {
      return NextResponse.json({ error: "Invalid hasOnlineReport" }, { status: 400 });
    }
    data.hasOnlineReport = body.hasOnlineReport;
  }

  if (body.hasParkingAvailable !== undefined) {
    if (typeof body.hasParkingAvailable !== "boolean") {
      return NextResponse.json({ error: "Invalid hasParkingAvailable" }, { status: 400 });
    }
    data.hasParkingAvailable = body.hasParkingAvailable;
  }

  if (body.insurancePanels !== undefined) {
    if (!Array.isArray(body.insurancePanels) || !body.insurancePanels.every((item) => typeof item === "string")) {
      return NextResponse.json({ error: "Invalid insurancePanels" }, { status: 400 });
    }
    data.insurancePanels = body.insurancePanels as string[];
  }

  if (body.diagnosticTests !== undefined) {
    if (!Array.isArray(body.diagnosticTests) || !body.diagnosticTests.every((item) => typeof item === "string")) {
      return NextResponse.json({ error: "Invalid diagnosticTests" }, { status: 400 });
    }
    data.diagnosticTests = body.diagnosticTests as string[];
  }

  if (body.imagingServices !== undefined) {
    if (!Array.isArray(body.imagingServices) || !body.imagingServices.every((item) => typeof item === "string")) {
      return NextResponse.json({ error: "Invalid imagingServices" }, { status: 400 });
    }
    data.imagingServices = body.imagingServices as string[];
  }

  const updated = await prisma.facility.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN, UserRole.STAFF]);
  const { id } = await params;

  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      collectedBy: { select: { name: true } },
      area: { select: { id: true, name: true, thana: { select: { name: true } } } },
      amenities: { include: { amenity: { select: { id: true, name: true } } } },
    },
  });
  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }
  return NextResponse.json(facility, { status: 200 });
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.facility.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  // Chambers detach rather than delete (they belong to doctors); appointments
  // at this facility go with it. Amenities/services/departments/images cascade.
  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { facilityId: id } }),
    prisma.chamber.updateMany({ where: { facilityId: id }, data: { facilityId: null } }),
    prisma.facility.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const GET = withApi(getHandler);
export const PATCH = withApi(handler);
export const DELETE = withApi(deleteHandler);

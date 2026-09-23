import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { requireAuth, withApi, ApiError } from "@/lib/api-guard";
import { storeImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FOLDERS = ["doctors", "facilities"] as const;

async function postHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const formData = await request.formData();

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new ApiError("File is required", 400);
  }

  const folder = formData.get("folder");
  if (typeof folder !== "string" || !ALLOWED_FOLDERS.includes(folder as (typeof ALLOWED_FOLDERS)[number])) {
    throw new ApiError('Invalid folder. Must be "doctors" or "facilities"', 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError("File too large", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const image = await storeImage({ data: buffer, folder, filename: file.name });
    return NextResponse.json({ success: true, image });
  } catch (e) {
    throw new ApiError(e instanceof Error ? e.message : "Upload failed", 500);
  }
}

export const POST = withApi(postHandler);

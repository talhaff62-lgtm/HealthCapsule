import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { detectDistrictFromHeaders } from "@/lib/geo";

export default async function DoctorsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const c = await cookies();
  const district = detectDistrictFromHeaders(h, c.get("capsule_district")?.value);
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (typeof val === "string") qs.set(key, val);
  }
  const query = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/${district}/doctors${query}`);
}

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { detectDistrictFromHeaders } from "@/lib/geo";

export default async function DoctorProfileRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const h = await headers();
  const c = await cookies();
  const district = detectDistrictFromHeaders(h, c.get("capsule_district")?.value);
  const { slug } = await params;
  redirect(`/${district}/doctors/${slug}`);
}

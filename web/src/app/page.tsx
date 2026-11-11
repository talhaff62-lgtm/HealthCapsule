import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { detectDistrictFromHeaders } from "@/lib/geo";

export default async function Home() {
  const h = await headers();
  const c = await cookies();
  const district = detectDistrictFromHeaders(h, c.get("capsule_district")?.value);
  redirect(`/${district}`);
}

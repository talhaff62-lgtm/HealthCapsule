export const DEFAULT_DISTRICT = "chattogram";
export const VALID_DISTRICTS = ["chattogram", "noakhali"] as const;
export type ValidDistrict = (typeof VALID_DISTRICTS)[number];

export function isValidDistrict(slug: string): slug is ValidDistrict {
  return (VALID_DISTRICTS as readonly string[]).includes(slug);
}

/**
 * Maps known Bangladesh city / town names (from GeoIP headers like x-vercel-ip-city)
 * to our active supported district slugs.
 */
export function mapCityToDistrict(city: string | null | undefined): ValidDistrict | null {
  if (!city) return null;
  const c = city.trim().toLowerCase();

  // Noakhali region cities/towns
  if (
    c.includes("noakhali") ||
    c.includes("maijdee") ||
    c.includes("chowmuhani") ||
    c.includes("chaumuhani") ||
    c.includes("begumganj") ||
    c.includes("sonaimuri")
  ) {
    return "noakhali";
  }

  // Chattogram region
  if (
    c.includes("chattogram") ||
    c.includes("chittagong") ||
    c.includes("hathazari") ||
    c.includes("sitakunda") ||
    c.includes("mirsharai") ||
    c.includes("patenga") ||
    c.includes("halishahar")
  ) {
    return "chattogram";
  }

  return null;
}

export function detectDistrictFromHeaders(
  headers: Headers,
  cookieVal?: string | null
): ValidDistrict {
  // 1. Explicit user cookie preference
  if (cookieVal && isValidDistrict(cookieVal)) {
    return cookieVal;
  }

  // 2. IP Geo headers (Vercel / Cloudflare)
  const city =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity") ||
    headers.get("x-city");

  const fromCity = mapCityToDistrict(city);
  if (fromCity) return fromCity;

  // 3. Fallback default
  return DEFAULT_DISTRICT;
}

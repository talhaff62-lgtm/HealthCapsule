// Normalize a Bangladesh mobile number to +880XXXXXXXXXX form.
// Returns null when the input does not represent a valid BD mobile.
//
// Accepts: 01XXXXXXXXX (11 digits starting with 01), 8801XXXXXXXXX,
// +8801XXXXXXXXX, with optional spaces, dashes, and parentheses.
// Valid BD mobile prefixes: 013, 014, 015, 016, 017, 018, 019.

const BD_MOBILE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

export function normalizeBangladeshMobile(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/[\s\-()]/g, "");
  if (!BD_MOBILE_RE.test(digits)) return null;
  if (digits.startsWith("+88")) return digits;
  if (digits.startsWith("88")) return `+${digits}`;
  if (digits.startsWith("01")) return `+88${digits}`;
  return null;
}

// Build a tel: URI from any plausible phone string. Returns null if nothing usable.
export function telUriFor(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return `tel:${trimmed.replace(/\s/g, "")}`;
}

// Build a wa.me URI for a normalized BD mobile.
export function whatsappUriFor(input: string | null | undefined): string | null {
  const mobile = normalizeBangladeshMobile(input);
  if (!mobile) return null;
  return `https://wa.me/${mobile.replace("+", "")}`;
}

// Small shared label helper for patient screens.

export function facilityTypeLabel(type: string): string {
  const normalized = type.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (normalized === "HOSPITAL") return "Hospital";
  if (normalized === "DIAGNOSTIC_CENTER" || normalized === "DIAGNOSTIC") {
    return "Diagnostic Center";
  }
  if (normalized === "CLINIC") return "Clinic";
  return type.trim() || "Facility";
}

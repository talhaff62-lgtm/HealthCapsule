// Panel (Bearer-auth) API surface for staff/admin.
import { apiFetch, authFetch } from "./config";
import type { AuthUser } from "@/types/dto";

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return apiFetch<{ token: string; user: AuthUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string): Promise<{ id: string; name: string; role: string }> {
  return authFetch("/api/v1/auth/me", { token });
}

export async function getMyFacilities<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/facilities/mine", { token });
}

export async function getMyDoctors<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/doctors/mine", { token });
}

export async function searchFacilityDirectory<T = unknown>(
  token: string,
  q: string,
): Promise<T> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return authFetch<T>(`/api/v1/facilities/directory${qs}`, { token });
}

export async function searchDoctorDirectory<T = unknown>(
  token: string,
  q: string,
): Promise<T> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return authFetch<T>(`/api/v1/doctors/directory${qs}`, { token });
}

export async function getAmenities<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/amenities", { token });
}

export async function getAreas<T = unknown>(token: string, query?: string): Promise<T> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  return authFetch<T>(`/api/v1/areas${qs}`, { token });
}

export async function getSpecialties<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/specialties", { token });
}

export async function getFacilityOptions<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/facilities/options", { token });
}

export async function createFacility<T = unknown>(
  token: string,
  body: Record<string, unknown>,
): Promise<T> {
  return authFetch<T>("/api/v1/facilities", {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createDoctor<T = unknown>(
  token: string,
  body: Record<string, unknown>,
): Promise<T> {
  return authFetch<T>("/api/v1/doctors", {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listPendingFacilities<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/facilities?verificationStatus=PENDING", { token });
}

export async function listPendingDoctors<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/doctors?verificationStatus=PENDING", { token });
}

export async function listAllFacilities<T = unknown>(
  token: string,
  status?: string,
): Promise<T> {
  const qs = status ? `?verificationStatus=${encodeURIComponent(status)}` : "";
  return authFetch<T>(`/api/v1/facilities${qs}`, { token });
}

export async function listAllDoctors<T = unknown>(
  token: string,
  status?: string,
): Promise<T> {
  const qs = status ? `?verificationStatus=${encodeURIComponent(status)}` : "";
  return authFetch<T>(`/api/v1/doctors${qs}`, { token });
}

export async function approveFacility<T = unknown>(
  token: string,
  id: string,
): Promise<T> {
  return authFetch<T>(`/api/v1/facilities/${encodeURIComponent(id)}/approve`, {
    token,
    method: "PATCH",
  });
}

export async function approveDoctor<T = unknown>(
  token: string,
  id: string,
): Promise<T> {
  return authFetch<T>(`/api/v1/doctors/${encodeURIComponent(id)}/approve`, {
    token,
    method: "PATCH",
  });
}

export async function rejectFacility<T = unknown>(
  token: string,
  id: string,
  reason: string,
): Promise<T> {
  return authFetch<T>(`/api/v1/facilities/${encodeURIComponent(id)}/reject`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ rejectReason: reason }),
  });
}

export async function rejectDoctor<T = unknown>(
  token: string,
  id: string,
  reason: string,
): Promise<T> {
  return authFetch<T>(`/api/v1/doctors/${encodeURIComponent(id)}/reject`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ rejectReason: reason }),
  });
}

export async function unverifyFacility<T = unknown>(
  token: string,
  id: string,
): Promise<T> {
  return authFetch<T>(`/api/v1/facilities/${encodeURIComponent(id)}/unverify`, {
    token,
    method: "PATCH",
  });
}

export async function unverifyDoctor<T = unknown>(
  token: string,
  id: string,
): Promise<T> {
  return authFetch<T>(`/api/v1/doctors/${encodeURIComponent(id)}/unverify`, {
    token,
    method: "PATCH",
  });
}

export async function listUsers<T = unknown>(token: string): Promise<T> {
  return authFetch<T>("/api/v1/users", { token });
}

export async function createUser<T = unknown>(
  token: string,
  body: { name: string; email: string; password: string; role: string },
): Promise<T> {
  return authFetch<T>("/api/v1/users", {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteUser<T = unknown>(token: string, id: string): Promise<T> {
  return authFetch<T>(`/api/v1/users/${encodeURIComponent(id)}`, {
    token,
    method: "DELETE",
  });
}

export async function getDoctor<T = unknown>(token: string, id: string): Promise<T> {
  return authFetch<T>(`/api/v1/doctors/${encodeURIComponent(id)}`, { token });
}

export async function getFacility<T = unknown>(token: string, id: string): Promise<T> {
  return authFetch<T>(`/api/v1/facilities/${encodeURIComponent(id)}`, { token });
}

export async function updateDoctor<T = unknown>(
  token: string,
  id: string,
  body: Record<string, unknown>,
): Promise<T> {
  return authFetch<T>(`/api/v1/doctors/${encodeURIComponent(id)}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updateFacility<T = unknown>(
  token: string,
  id: string,
  body: Record<string, unknown>,
): Promise<T> {
  return authFetch<T>(`/api/v1/facilities/${encodeURIComponent(id)}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteDoctor<T = unknown>(token: string, id: string): Promise<T> {
  return authFetch<T>(`/api/v1/doctors/${encodeURIComponent(id)}`, {
    token,
    method: "DELETE",
  });
}

export async function deleteFacility<T = unknown>(token: string, id: string): Promise<T> {
  return authFetch<T>(`/api/v1/facilities/${encodeURIComponent(id)}`, {
    token,
    method: "DELETE",
  });
}

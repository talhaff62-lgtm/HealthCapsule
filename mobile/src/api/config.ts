// Tiny wrapper over fetch with timeout, typed error, and JSON parsing.

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_TIMEOUT_MS = 8000;

const DEV_FALLBACK = "http://localhost:3000";

/** Testable resolver: decouples URL logic from process.env/__DEV__. */
export function resolveApiBaseUrl(env: {
  explicit?: string;
  isDev: boolean;
}): string {
  if (env.explicit && env.explicit.trim()) return env.explicit.replace(/\/$/, "");
  if (env.isDev) return DEV_FALLBACK;
  throw new ApiError(
    "EXPO_PUBLIC_API_URL is not configured for this build",
    0,
    "CONFIG",
  );
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl({
    explicit: process.env.EXPO_PUBLIC_API_URL,
    isDev: __DEV__,
  });
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const url = resolveUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        // FormData sets its own multipart boundary; a JSON content-type would break it.
        ...(init.body && !(typeof FormData !== "undefined" && init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...init.headers,
      },
    });
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const data = (await res.json()) as { message?: string; error?: string };
        if (data?.message) message = data.message;
        else if (data?.error) message = data.error;
      } catch {
        // ignore
      }
      throw new ApiError(message, res.status);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Request timed out", 0, "TIMEOUT");
    }
    throw new ApiError("Network unavailable", 0, "NETWORK");
  } finally {
    clearTimeout(timer);
  }
}

export async function authFetch<T>(
  path: string,
  options: { token: string } & RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const { token, ...init } = options;
  const headers = {
    ...init.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  return apiFetch<T>(path, { ...init, headers }, timeoutMs);
}

export function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

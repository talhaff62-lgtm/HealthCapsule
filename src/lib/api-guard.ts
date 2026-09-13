import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { verifyToken } from "./jwt-auth";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ userId: string; role: UserRole }> {
  const cookieToken = request.cookies.get("hc_token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    throw new ApiError("Not authenticated", 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw new ApiError("Not authenticated", 401);
  }

  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    throw new ApiError("Forbidden", 403);
  }

  return { userId: decoded.sub, role: decoded.role };
}

export function handleApiError(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function withApi<T extends unknown[]>(
  handler: (
    request: NextRequest,
    ...args: T
  ) => Promise<Response> | Response
): (request: NextRequest, ...args: T) => Promise<Response> {
  return async (request: NextRequest, ...args: T) => {
    try {
      return await handler(request, ...args);
    } catch (e) {
      return handleApiError(e);
    }
  };
}

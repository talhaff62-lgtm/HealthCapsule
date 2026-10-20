import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { verifyToken } from "./jwt-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  // First, try the hc_token cookie or Authorization: Bearer header (mobile/API clients)
  const cookieToken = request.cookies.get("hc_token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = cookieToken || bearerToken;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        throw new ApiError("Forbidden", 403);
      }
      return { userId: decoded.sub, role: decoded.role };
    }
  }

  // Fall back to NextAuth session (browser clients logged in via /login)
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session?.user?.role) {
    if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
      throw new ApiError("Forbidden", 403);
    }
    return { userId: session.user.id, role: session.user.role as UserRole };
  }

  throw new ApiError("Not authenticated", 401);
}

export function handleApiError(e: unknown): NextResponse {
  const response =
    e instanceof ApiError
      ? NextResponse.json({ error: e.message }, { status: e.status })
      : NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}

export function withApi<T extends unknown[]>(
  handler: (
    request: NextRequest,
    ...args: T
  ) => Promise<Response> | Response
): (request: NextRequest, ...args: T) => Promise<Response> {
  return async (request: NextRequest, ...args: T) => {
    try {
      const response = await handler(request, ...args);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    } catch (e) {
      return handleApiError(e);
    }
  };
}

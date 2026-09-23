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

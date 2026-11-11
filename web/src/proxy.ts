import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { detectDistrictFromHeaders } from "@/lib/geo";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * This file guards the role-based portals and staff/admin pages, and
 * redirects legacy national routes to their district-scoped equivalents.
 */

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return NextResponse.next();
  }

  // District-scoped routing: "/" and legacy "/doctors" / "/healthcares"
  // redirect to the detected district's equivalent page.
  if (
    pathname === "/" ||
    pathname === "/doctors" ||
    pathname.startsWith("/doctors/") ||
    pathname === "/healthcares" ||
    pathname.startsWith("/healthcares/")
  ) {
    const district = detectDistrictFromHeaders(
      req.headers,
      req.cookies.get("capsule_district")?.value
    );
    const sub = pathname
      .replace(/^\/healthcares/, "/healthcares")
      .replace(/^\/doctors/, "/doctors");
    const url = new URL(sub === "/" ? `/${district}` : `/${district}${sub}`, req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url, 307);
  }

  if (pathname.startsWith("/staff") || pathname.startsWith("/admin")) {
    // Use NextAuth's withAuth to guard staff/admin routes (mirrors /portal guard)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return staffAdminGuard(req as any, {} as any);
  }

  if (pathname.startsWith("/portal")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return portalGuard(req as any, {} as any);
  }

  return NextResponse.next();
}

const staffAdminGuard = withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    if (pathname.startsWith("/staff") && role !== "STAFF") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (req.nextUrl.pathname.startsWith("/staff") || req.nextUrl.pathname.startsWith("/admin")) {
          return token !== null;
        }
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

const portalGuard = withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/portal/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    if (pathname.startsWith("/portal/doctor") && role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (req.nextUrl.pathname.startsWith("/portal")) {
          return token !== null;
        }
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/doctors/:path*",
    "/healthcares/:path*",
    "/api/:path*",
    "/portal/:path*",
    "/staff/:path*",
    "/admin/:path*",
  ],
};

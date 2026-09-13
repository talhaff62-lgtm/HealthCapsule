import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * This file replaces `src/middleware.ts` and exports a named `proxy`
 * function that guards the role-based portals and staff/admin pages.
 */

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (
    (pathname.startsWith("/staff") || pathname.startsWith("/admin")) &&
    pathname !== "/staff/login" &&
    !req.cookies.get("hc_token")
  ) {
    return NextResponse.redirect(new URL("/staff/login", req.url));
  }

  if (pathname.startsWith("/portal")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return portalGuard(req as any, {} as any);
  }

  return NextResponse.next();
}

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
  matcher: ["/portal/:path*", "/staff/:path*", "/admin/:path*"],
};

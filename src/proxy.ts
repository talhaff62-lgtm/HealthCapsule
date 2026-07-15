import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * This file replaces `src/middleware.ts` and exports a named `proxy`
 * function that guards the role-based portals.
 */
export const proxy = withAuth(
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
  matcher: ["/portal/:path*"],
};

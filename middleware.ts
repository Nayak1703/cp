import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to dashboard routes
  if (
    pathname.startsWith("/hr/dashboard") ||
    pathname.startsWith("/candidate/dashboard")
  ) {
    try {
      // Get the JWT token from the request
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If no token, redirect to login
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check if userType is set in the token
      if (!token.userType) {
        // Allow access - let the dashboard components handle role validation
        return NextResponse.next();
      }

      // Enforce role-based access control
      if (pathname.startsWith("/hr/dashboard") && token.userType !== "hr") {
        // User is trying to access HR dashboard but is not HR
        if (token.userType === "candidate") {
          return NextResponse.redirect(
            new URL("/candidate/dashboard", request.url)
          );
        } else {
          return NextResponse.redirect(
            new URL("/login?error=Unauthorized", request.url)
          );
        }
      }

      if (
        pathname.startsWith("/candidate/dashboard") &&
        token.userType !== "candidate"
      ) {
        // User is trying to access candidate dashboard but is not candidate
        if (token.userType === "hr") {
          return NextResponse.redirect(new URL("/hr/dashboard", request.url));
        } else {
          return NextResponse.redirect(
            new URL("/login?error=Unauthorized", request.url)
          );
        }
      }

      // User has correct role, allow access
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.redirect(
        new URL("/login?error=MiddlewareError", request.url)
      );
    }
  }

  // For non-dashboard routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/hr/dashboard/:path*", "/candidate/dashboard/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/auth-utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get the session cookie
  const sessionCookie = request.cookies.get("session")?.value;

  // 2. Define path classifications
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // If there is a session, try to decrypt it
  let session = null;
  if (sessionCookie) {
    session = await decryptSession(sessionCookie);
  }

  // 3. Handle Guest/Auth Routes redirection
  if (isAuthRoute) {
    if (session) {
      const rolePath = session.role.toLowerCase();
      return NextResponse.redirect(new URL(`/dashboard/${rolePath}`, request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle Protected Dashboard Routes redirection
  if (isDashboardRoute) {
    if (!session) {
      // Clear cookie and redirect to login if session was invalid
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }

    // Role-based Access Control (RBAC)
    const userRole = session.role.toLowerCase(); // 'student', 'teacher', 'admin'
    const targetDashboard = `/dashboard/${userRole}`;

    // If a user tries to access a dashboard path that doesn't match their role
    if (!pathname.startsWith(targetDashboard)) {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  // Handle default home route redirect to login/dashboard
  if (pathname === "/") {
    if (session) {
      const rolePath = session.role.toLowerCase();
      return NextResponse.redirect(new URL(`/dashboard/${rolePath}`, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Matching paths
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};

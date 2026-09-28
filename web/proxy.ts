import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/auth-navigation";

export function proxy(request: NextRequest) {
  if (
    isProtectedPath(request.nextUrl.pathname) &&
    !request.cookies.get("token")?.value
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }
  // A cookie can be expired or invalid. Only /auth/me establishes a session;
  // never redirect away from sign-in merely because a cookie is present.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/my-tasks/:path*",
    "/workspaces/:path*",
    "/settings/:path*",
    "/notifications/:path*",
  ],
};

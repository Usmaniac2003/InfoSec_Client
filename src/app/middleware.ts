import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value || null;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  const isProtected =
    request.nextUrl.pathname.startsWith("/chat") ||
    request.nextUrl.pathname.startsWith("/secure-session") ||
    request.nextUrl.pathname.startsWith("/attacks") ||
    request.nextUrl.pathname.startsWith("/logs");

  // 🚫 If NOT logged in, block protected pages
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚫 If logged in, block login/register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

// ⭐ Apply middleware to the whole app
export const config = {
  matcher: [
    "/login",
    "/register",
    "/chat/:path*",
    "/secure-session/:path*",
    "/logs/:path*",
    "/attacks/:path*",
  ],
};

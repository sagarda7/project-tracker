import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ONLY_PATHS = ["/users", "/settings"];

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  if (
    isLoggedIn &&
    ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) &&
    req.auth?.user?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};

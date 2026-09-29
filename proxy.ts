import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ONLY_PATHS = ["/users", "/settings"];
const PUBLIC_PATHS = ["/login", "/about", "/contact", "/gunaso", "/maintenance"];

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isPublicPage = pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname.startsWith("/login");

  if (isStaticAsset) return;

  // Admins can still sign in and use the app during maintenance (e.g. to fix whatever
  // triggered it) — everyone else, logged in or not, gets the maintenance page for every
  // route. The env var is read on every request rather than cached, so flipping it takes
  // effect immediately without a redeploy.
  const maintenanceOn = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePage = pathname.startsWith("/maintenance");
  if (maintenanceOn && !isMaintenancePage && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.rewrite(new URL("/maintenance", origin), { status: 503 });
  }

  if (!isLoggedIn && !isPublicPage) {
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

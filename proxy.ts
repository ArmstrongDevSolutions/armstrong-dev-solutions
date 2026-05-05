import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  // Route the doubles subdomain root to the doubles foundation page.
  if (hostname.startsWith("doubles.armstrongdevsolutions.com") && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/doubles";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

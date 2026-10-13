import { NextResponse } from "next/server";
import { auth } from "./nextauth";
import { proxyRedirect } from "./proxy-rules";

/** Next 16 proxy: redirects anonymous visitors to /login and signed-in users away from it. */
export const authProxy = auth((request) => {
  const to = proxyRedirect(request.nextUrl.pathname, Boolean(request.auth));
  if (to) return NextResponse.redirect(new URL(to, request.nextUrl));
});

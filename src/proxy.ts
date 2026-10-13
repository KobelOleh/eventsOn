import { authProxy } from "@/features/auth";

export const proxy = authProxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

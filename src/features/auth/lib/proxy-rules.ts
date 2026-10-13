const AUTH_PAGES = ["/login", "/register"];

/**
 * Where the proxy sends a request, or null to let it through. Convenience
 * redirects only: Server Actions authenticate on their own.
 */
export function proxyRedirect(
  pathname: string,
  signedIn: boolean
): string | null {
  const isAuthPage = AUTH_PAGES.includes(pathname);
  if (!signedIn && !isAuthPage) return "/login";
  if (signedIn && isAuthPage) return "/";
  return null;
}

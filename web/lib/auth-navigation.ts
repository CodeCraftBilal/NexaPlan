export const protectedRoutes = ["/dashboard", "/projects", "/tasks", "/my-tasks", "/workspaces", "/settings", "/notifications"];

export function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value) || /%5c/i.test(value)) return "/dashboard";
  try {
    const target = new URL(value, "https://projectai.local");
    if (target.origin !== "https://projectai.local" || !isProtectedPath(target.pathname)) return "/dashboard";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/dashboard";
  }
}

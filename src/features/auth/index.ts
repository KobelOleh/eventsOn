// Public surface of the auth module. Other modules and app/ may import only
// from this file (and actions.ts); everything else is private (ADR 0001).
export { handlers } from "./lib/nextauth";
export { authProxy } from "./lib/proxy";
export {
  getSessionUser,
  requireOwnerId,
  UnauthorizedError,
} from "./lib/session";
export { LoginForm } from "./ui/LoginForm";
export { RegisterForm } from "./ui/RegisterForm";
export { SignOutButton } from "./ui/SignOutButton";

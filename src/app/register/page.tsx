import { AuthVariants } from "../_prototype/auth/AuthVariants";

// PROTOTYPE (ui-redesign): variants of the register screen via ?variant=A|B|C.
// Reads searchParams so the page is rendered per request (variant in URL).
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await searchParams;
  return <AuthVariants mode="register" />;
}

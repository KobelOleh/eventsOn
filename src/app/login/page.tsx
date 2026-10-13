import { AuthVariants } from "../_prototype/auth/AuthVariants";

// PROTOTYPE (ui-redesign): variants of the login screen via ?variant=A|B|C.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ conflict?: string }>;
}) {
  const { conflict } = await searchParams;
  return <AuthVariants mode="login" conflict={conflict} />;
}

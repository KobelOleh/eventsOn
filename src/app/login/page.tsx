import { LoginForm } from "@/features/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ conflict?: string }>;
}) {
  const { conflict } = await searchParams;
  return <LoginForm conflict={conflict} />;
}

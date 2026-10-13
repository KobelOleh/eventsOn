import { getSessionUser } from "@/features/auth";
import { HomeVariants } from "./_prototype/home/HomeVariants";

// PROTOTYPE (ui-redesign): layout variants of the home screen via
// ?variant=A|B|C. Data (session user) is still fetched here as before.
export default async function HomePage() {
  const user = await getSessionUser();
  return <HomeVariants email={user?.email} />;
}

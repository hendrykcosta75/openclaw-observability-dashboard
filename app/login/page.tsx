import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}

import { Suspense } from "react";
import { AuthForm, AuthFormSkeleton } from "../auth-form";

export default function LoginPage() {
  return <Suspense fallback={<AuthFormSkeleton />}><AuthForm mode="login" /></Suspense>;
}

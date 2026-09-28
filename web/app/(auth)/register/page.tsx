import { Suspense } from "react";
import { AuthForm, AuthFormSkeleton } from "../auth-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}

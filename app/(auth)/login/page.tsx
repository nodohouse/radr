import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/AuthPageShell";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to RADR.",
};

export default function LoginPage() {
  return (
    <AuthPageShell title="Welcome back." subtitle="Sign in to RADR.">
      <Suspense
        fallback={
          <p className="rx-auth-waiting">
            <span className="rx-tri">△</span> Loading…
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}

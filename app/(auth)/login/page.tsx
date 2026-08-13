import { Suspense } from "react";
import { AuthPageShell } from "@/components/AuthPageShell";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageShell title="Log in" subtitle="Welcome back to RADR.">
      <Suspense fallback={<p className="text-sm text-[var(--ink-muted)]">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}

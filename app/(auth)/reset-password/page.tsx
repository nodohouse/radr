import { Suspense } from "react";
import { AuthPageShell } from "@/components/AuthPageShell";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell title="Choose a new password" subtitle="Use at least 10 characters.">
      <Suspense fallback={<p className="text-sm text-[var(--ink-muted)]">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}

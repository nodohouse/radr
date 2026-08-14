import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/AuthPageShell";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your RADR account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Choose a new password."
      subtitle="Use at least 10 characters."
    >
      <Suspense
        fallback={
          <p className="rx-auth-waiting">
            <span className="rx-tri">△</span> Loading…
          </p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}

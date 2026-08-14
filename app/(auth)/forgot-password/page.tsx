import type { Metadata } from "next";
import { AuthPageShell } from "@/components/AuthPageShell";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset access",
  description: "Reset your RADR password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell title="Reset access." subtitle="We’ll send a reset link to your work email.">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}

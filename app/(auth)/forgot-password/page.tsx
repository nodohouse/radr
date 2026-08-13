import { AuthPageShell } from "@/components/AuthPageShell";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Reset password"
      subtitle="We will send a secure reset link to your email."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}

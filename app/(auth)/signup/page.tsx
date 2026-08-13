import { AuthPageShell } from "@/components/AuthPageShell";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthPageShell
      title="Create your RADR account"
      subtitle="Give RADR something to check."
    >
      <SignupForm />
    </AuthPageShell>
  );
}

import type { Metadata } from "next";
import { AuthPageShell } from "@/components/AuthPageShell";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Request access",
  description: "Create your RADR account.",
};

export default function SignupPage() {
  return (
    <AuthPageShell
      title="Create access."
      subtitle="Give RADR something to check."
    >
      <SignupForm />
    </AuthPageShell>
  );
}

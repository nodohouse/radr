import { RadrLogo } from "@/components/marketing/RadrLogo";

export function AuthPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <RadrLogo size="lg" as="p" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-[var(--ink-muted)]">{subtitle}</p>
      </div>
      <div className="prep-card p-5 sm:p-6">{children}</div>
    </main>
  );
}

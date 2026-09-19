import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/** Legacy signal detail → finding detail when IDs align; else findings queue. */
export default async function SignalDetailRedirect({ params }: Props) {
  const { id } = await params;
  if (id.startsWith("fnd_")) {
    redirect(`/app/findings/${id}`);
  }
  redirect("/app/findings");
}

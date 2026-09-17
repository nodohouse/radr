import { redirect } from "next/navigation";

export default function LabIndexPage() {
  redirect("/app/lab/control-center?seed=service");
}

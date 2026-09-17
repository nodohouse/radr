import { redirect } from "next/navigation";

export default function LabIndex() {
  redirect("/app/lab/control-center?seed=service");
}

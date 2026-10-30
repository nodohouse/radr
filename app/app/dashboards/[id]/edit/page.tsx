"use client";

import { useParams } from "next/navigation";
import { DashboardBuilder } from "@/components/product/dashboards/DashboardBuilder";

export default function DashboardEditPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  return <DashboardBuilder key={id} dashboardId={id} />;
}

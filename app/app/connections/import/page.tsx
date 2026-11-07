import { DataIntake } from "@/components/product/ingestion/DataIntake";
export const metadata = {
  title: "RADR",
  robots: { index: false, follow: false },
};
export default function DataImportPage() {
  return <DataIntake />;
}

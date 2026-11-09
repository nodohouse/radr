import type { Metadata } from "next";
import ControlCenterEntry from "./ControlCenterEntry";
export const metadata: Metadata = { title: "RADR" };
export default function Page() { return <ControlCenterEntry />; }

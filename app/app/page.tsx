import type { Metadata } from "next";
import ControlCenterEntry from "./ControlCenterEntry";
export const metadata: Metadata = { title: "RADR · Control Center" };
export default function Page() { return <ControlCenterEntry />; }

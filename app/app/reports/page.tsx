"use client";

/**
 * Reports — VISUAL FOLLOW-UP.
 * Body remains VisionReports (pre-Daylight). Canonical ProductShell + context apply via app layout.
 * Do not redesign in the one-product pass; wrap only.
 */

import { VisionReports } from "@/components/product/vision/VisionReports";

export default function ReportsPage() {
  return (
    <div data-page="reports" data-visual="follow-up">
      <VisionReports />
    </div>
  );
}

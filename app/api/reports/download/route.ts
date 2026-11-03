import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { REPORT_COOKIE, verifyReportGrant } from "@/lib/marketing/reportGate";
import { HOSPITALITY_REPORT } from "@/lib/marketing/report";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
  };
  if (!verifyReportGrant(request.cookies.get(REPORT_COOKIE)?.value))
    return Response.json(
      {
        error: "Please submit the report request form to unlock your download.",
      },
      { status: 403, headers },
    );
  try {
    const bytes = await readFile(
      path.join(process.cwd(), "private/reports", HOSPITALITY_REPORT.filename),
    );
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${HOSPITALITY_REPORT.filename}"`,
        "Content-Length": String(bytes.length),
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "The report is temporarily unavailable. Please try your download again.",
      },
      { status: 503, headers },
    );
  }
}

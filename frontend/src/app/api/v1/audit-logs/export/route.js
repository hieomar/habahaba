import { NextResponse } from "next/server";

/**
 * POST /api/v1/audit-logs/export
 * Exports audit logs as an Excel file.
 * Query params: { type, action, from, to }
 */
export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) {
    const url = new URL("/audit-logs/export", backendUrl);
    const search = new URL(request.url).search;
    if (search) url.search = search;
    const upstream = await fetch(url.toString(), { method: "POST" });
    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="audit-logs.xls"`,
      },
    });
  }
  return NextResponse.json(
    { success: false, error: "Export requires a connected backend.", code: "NOT_IMPLEMENTED" },
    { status: 501 }
  );
}

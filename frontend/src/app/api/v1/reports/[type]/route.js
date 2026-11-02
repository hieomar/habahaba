import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/reports/:type
 *
 * Supported types:
 *   farmer-statistics | ipc-performance | national | warehouse-statistics |
 *   system-health | traceability | audit | user | notification
 *
 * Query params (all optional): { from, to, ipc, district, commodity }
 * Response: { success, data: {...}, generatedAt: ISO8601 }
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/reports/${params.type}`, {
    stubData: null,
    stubMeta: { generatedAt: new Date().toISOString() },
  });
}

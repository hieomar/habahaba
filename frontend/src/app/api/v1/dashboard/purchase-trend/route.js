import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/dashboard/purchase-trend?period=7D|1M|3M|6M|1Y
 * Proxied to: GET {BACKEND_API_URL}/dashboard/purchase-trend
 */
export async function GET(request) {
  return proxyOrStub(request, "/dashboard/purchase-trend", {
    stubData: [],
  });
}

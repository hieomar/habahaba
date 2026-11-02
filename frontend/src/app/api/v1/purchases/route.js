import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET  /api/v1/purchases  — List purchases
 * POST /api/v1/purchases  — Create a purchase record
 *
 * GET query params: { page, limit, status, commodity, ipc, search }
 * GET response: {
 *   success, data: Purchase[], total, page, limit,
 *   stats: { totalPurchases, totalWeight, totalValue, pendingPayment }
 * }
 */
export async function GET(request) {
  return proxyOrStub(request, "/purchases", {
    stubMeta: { stats: { totalPurchases: 0, totalWeight: 0, totalValue: 0, pendingPayment: 0 } },
  });
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/purchases");
  return notImplemented("Creating purchase records");
}

import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/dashboard/revenue
 * Returns monthly purchasing revenue grouped by year.
 * Proxied to: GET {BACKEND_API_URL}/dashboard/revenue
 */
export async function GET(request) {
  return proxyOrStub(request, "/dashboard/revenue", {
    stubData: {
      "2024": [
        { month: "Jan", value: 0 }, { month: "Feb", value: 0 },
        { month: "Mar", value: 0 }, { month: "Apr", value: 0 },
        { month: "May", value: 0 }, { month: "Jun", value: 0 },
        { month: "Jul", value: 0 }, { month: "Aug", value: 0 },
        { month: "Sep", value: 0 }, { month: "Oct", value: 0 },
        { month: "Nov", value: 0 }, { month: "Dec", value: 0 },
      ],
    },
  });
}

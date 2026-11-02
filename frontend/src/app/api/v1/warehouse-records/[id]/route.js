import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/warehouse-records/:id
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/warehouse-records/${params.id}`, { stubData: null });
}

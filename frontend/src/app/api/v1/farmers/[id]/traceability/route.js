import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/farmers/:id/traceability
 * Returns traceability chain records for a specific farmer.
 * Response: { success, data: TraceabilityRecord[] }
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/farmers/${params.id}/traceability`);
}

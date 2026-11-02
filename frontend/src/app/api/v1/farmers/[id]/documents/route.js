import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/farmers/:id/documents
 * Returns documents associated with a specific farmer.
 * Response: { success, data: Document[] }
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/farmers/${params.id}/documents`);
}

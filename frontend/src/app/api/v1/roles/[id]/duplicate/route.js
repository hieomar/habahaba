import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/roles/:id/duplicate
 * Creates a copy of the role with name "<Original> (Copy)".
 * Response: { success, data: Role }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/roles/${params.id}/duplicate`);
  return notImplemented("Duplicating roles");
}

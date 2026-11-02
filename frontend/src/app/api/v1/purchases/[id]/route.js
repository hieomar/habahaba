import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET /api/v1/purchases/:id  — Get purchase detail
 * PUT /api/v1/purchases/:id  — Update purchase record
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/purchases/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/purchases/${params.id}`);
  return notImplemented("Updating purchase records");
}

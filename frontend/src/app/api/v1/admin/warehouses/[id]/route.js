import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET    /api/v1/admin/warehouses/:id
 * PUT    /api/v1/admin/warehouses/:id
 * DELETE /api/v1/admin/warehouses/:id
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/admin/warehouses/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/admin/warehouses/${params.id}`);
  return notImplemented("Updating warehouse locations");
}

export async function DELETE(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/admin/warehouses/${params.id}`);
  return notImplemented("Deleting warehouse locations");
}

import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET    /api/v1/farmers/:id
 * PUT    /api/v1/farmers/:id
 * DELETE /api/v1/farmers/:id
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/farmers/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/farmers/${params.id}`);
  return notImplemented("Updating farmer profiles");
}

export async function DELETE(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/farmers/${params.id}`);
  return notImplemented("Deleting farmer records");
}

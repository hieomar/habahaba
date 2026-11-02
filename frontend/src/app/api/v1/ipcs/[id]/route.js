import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET    /api/v1/ipcs/:id
 * PUT    /api/v1/ipcs/:id
 * DELETE /api/v1/ipcs/:id
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/ipcs/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/ipcs/${params.id}`);
  return notImplemented("Updating IPC records");
}

export async function DELETE(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/ipcs/${params.id}`);
  return notImplemented("Deleting IPC records");
}

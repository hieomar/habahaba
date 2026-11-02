import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET    /api/v1/farmer-groups/:id
 * PUT    /api/v1/farmer-groups/:id
 * DELETE /api/v1/farmer-groups/:id
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/farmer-groups/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/farmer-groups/${params.id}`);
  return notImplemented("Updating farmer groups");
}

export async function DELETE(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/farmer-groups/${params.id}`);
  return notImplemented("Deleting farmer groups");
}

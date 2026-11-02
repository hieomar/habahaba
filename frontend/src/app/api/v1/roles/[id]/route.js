import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET    /api/v1/roles/:id  — Get role by id
 * PUT    /api/v1/roles/:id  — Update role (permissions, description, etc.)
 * DELETE /api/v1/roles/:id  — Delete custom role (system roles cannot be deleted)
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/roles/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/roles/${params.id}`);
  return notImplemented("Updating roles");
}

export async function DELETE(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/roles/${params.id}`);
  return notImplemented("Deleting roles");
}

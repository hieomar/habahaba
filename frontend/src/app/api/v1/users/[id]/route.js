import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET    /api/v1/users/:id  — Get user by id
 * PUT    /api/v1/users/:id  — Update user
 * DELETE /api/v1/users/:id  — Delete user
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/users/${params.id}`, { stubData: null });
}

export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/users/${params.id}`);
  return notImplemented("Updating users");
}

export async function DELETE(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/users/${params.id}`);
  return notImplemented("Deleting users");
}

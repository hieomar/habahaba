import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * PUT /api/v1/notifications/:id/read
 * Marks a single notification as read.
 * Response: { success }
 */
export async function PUT(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/notifications/${params.id}/read`);
  return notImplemented("Marking notification read");
}

import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * PUT /api/v1/notifications/read-all
 * Marks all notifications as read for the current user.
 * Response: { success }
 */
export async function PUT(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/notifications/read-all");
  return notImplemented("Marking all notifications read");
}

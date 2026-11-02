import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/notifications
 * Response: { success, data: Notification[], unreadCount: number }
 */
export async function GET(request) {
  return proxyOrStub(request, "/notifications", { stubMeta: { unreadCount: 0 } });
}

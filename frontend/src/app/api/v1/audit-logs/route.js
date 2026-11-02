import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/audit-logs
 * Query params: { type, action, from, to, page, limit }
 * Response: { success, data: AuditLog[], total, page, limit }
 *
 * AuditLog: { id, timestamp, userId, userName, action, module, description, ipAddress, severity }
 */
export async function GET(request) {
  return proxyOrStub(request, "/audit-logs");
}

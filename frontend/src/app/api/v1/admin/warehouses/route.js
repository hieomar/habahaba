import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET  /api/v1/admin/warehouses  — List physical warehouse locations
 * POST /api/v1/admin/warehouses  — Register a new warehouse
 *
 * GET response: { success, data: Warehouse[] }
 *
 * Warehouse shape:
 *   { id, code, name, location, capacity, manager, status, createdAt }
 *
 * Note: This endpoint manages physical warehouse buildings/locations.
 * For GRN-based stock records use /api/v1/warehouse-records instead.
 */
export async function GET(request) {
  return proxyOrStub(request, "/admin/warehouses");
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/admin/warehouses");
  return notImplemented("Creating warehouse locations");
}

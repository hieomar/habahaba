import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET  /api/v1/ipcs  — List IPCs
 * POST /api/v1/ipcs  — Create an IPC
 *
 * GET query params: { search, status }
 * GET response: { success, data: IPC[] }
 */
export async function GET(request) {
  return proxyOrStub(request, "/ipcs");
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/ipcs");
  return notImplemented("Creating IPCs");
}

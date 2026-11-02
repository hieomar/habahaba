import { NextResponse } from "next/server";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/jwt";
import { findSeededUser } from "@/lib/auth/seededUsers";

// Map backend role strings → dashboard RBAC role IDs
const ROLE_ID_MAP = {
  admin:               "role-sysadmin",
  headoffice_manager:  "role-head-office",
  ipc_manager:         "role-ipc-manager",
  warehouse_officer:   "role-warehouse-officer",
};

function toRoleId(backendRole) {
  return ROLE_ID_MAP[backendRole] ?? "role-sysadmin";
}

/**
 * POST /api/v1/auth/login
 *
 * Request body: { email: string, password: string }
 *
 * Response 200: { success: true, user: { id, name, email, role, roleId, assignedIPC } }
 *               Sets httpOnly cookie "nasfam_session" containing a signed JWT.
 *
 * Response 401: { success: false, error: "Invalid credentials" }
 * Response 503: { success: false, error: "Backend not configured" }
 *
 * ── Backend integration ─────────────────────────────────────────────────────
 * Set BACKEND_API_URL to have requests proxied to your real backend:
 *   POST ${BACKEND_API_URL}/auth/login  →  { user, token? }
 *
 * If no backend is configured, set the following environment variables for
 * a single development administrator account:
 *   GTMS_DEV_EMAIL      (e.g. admin@nasfam.org)
 *   GTMS_DEV_PASSWORD   (plain text — dev only, never use in production)
 * ───────────────────────────────────────────────────────────────────────────
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { email, password } = body ?? {};
  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  // ── Option 1: Proxy to real backend ──────────────────────────
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) {
    try {
      const upstream = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        return NextResponse.json(
          { success: false, error: data.message || data.error || "Authentication failed." },
          { status: upstream.status }
        );
      }
      // Backend wraps in { success, data: { user, accessToken } }
      const user = data.data?.user ?? data.user;
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid response from backend." },
          { status: 502 }
        );
      }
      // Backend returned user — issue our own session cookie.
      const roleId = toRoleId(user.role);
      const sessionUser = {
        id: user.userId ?? user.id,
        email: user.email,
        name: user.name ?? user.email,
        role: user.role,
        roleId,
        assignedIPC: user.ipcId ?? null,
        // Store backend token for server-side proxy forwarding
        backendToken: data.data?.accessToken ?? data.accessToken ?? null,
      };
      const token = await signToken(sessionUser);
      const res = NextResponse.json({ success: true, user: sessionUser });
      res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
      return res;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Could not reach backend service." },
        { status: 502 }
      );
    }
  }

  // ── Option 2: Dev credentials via environment variables ───────
  const devEmail = process.env.GTMS_DEV_EMAIL;
  const devPassword = process.env.GTMS_DEV_PASSWORD;
  if (devEmail && devPassword) {
    if (
      email.trim().toLowerCase() === devEmail.trim().toLowerCase() &&
      password === devPassword
    ) {
      const user = {
        id: "dev-usr-001",
        name: "Development Admin",
        email: devEmail,
        role: "System Administrator",
        roleId: "role-sysadmin",
        assignedIPC: null,
      };
      const token = await signToken(user);
      const res = NextResponse.json({ success: true, user });
      res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
      return res;
    }
    return NextResponse.json(
      { success: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  // ── Option 3: Seeded demo users (works without backend) ───
  const seededUser = findSeededUser(email, password);
  if (seededUser) {
    const token = await signToken(seededUser);
    const res = NextResponse.json({ success: true, user: seededUser });
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res;
  }

  return NextResponse.json(
    {
      success: false,
      error: "Invalid email or password.",
      code: "BACKEND_NOT_CONFIGURED",
      hint: "Use one of the seeded demo accounts or configure a backend.",
    },
    { status: 401 }
  );
}

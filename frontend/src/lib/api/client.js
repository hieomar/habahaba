/**
 * NASFAM GTMS — Central API Client
 *
 * Connects frontend UI to the Express.js / Prisma / MySQL backend API at http://localhost:5000/api/v1
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const { body, params, headers, ...rest } = options;

  const fullUrl = params
    ? `${url}?${new URLSearchParams(params)}`
    : url;

  // Retrieve stored JWT access token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("gtms_access_token") : null;

  const reqHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(fullUrl, {
    headers: reqHeaders,
    credentials: "include",
    ...rest,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("gtms_access_token");
      localStorage.removeItem("gtms_user");
    }
    throw new ApiError(
      data.message || data.error || `Request failed with status ${res.status}`,
      res.status,
      data.code,
      data
    );
  }

  return data;
}

const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export { api, ApiError };

import { mockRequest } from "./mock";

const TOKEN_KEY = "prearrival_token";
const LOCALE_KEY = "prearrival_locale";

export class ApiError extends Error {
  constructor(status, code) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function apiRoot() {
  return String(process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
    /\/$/,
    ""
  );
}

export function isMockMode() {
  if (apiRoot()) return false;
  return process.env.NODE_ENV !== "production";
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function readLocale() {
  if (typeof window === "undefined") return "es";
  const saved = sessionStorage.getItem(LOCALE_KEY);
  return saved === "en" ? "en" : "es";
}

export function storeLocale(locale) {
  sessionStorage.setItem(LOCALE_KEY, locale === "en" ? "en" : "es");
}

function apiUrl(path) {
  const root = apiRoot();
  if (!root) return "";
  if (root.endsWith("/api") && path.startsWith("/api/")) {
    return root + path.slice(4);
  }
  return root + path;
}

async function request(path, { method = "GET", body, token, locale } = {}) {
  if (isMockMode()) {
    try {
      return await mockRequest(path, { method, body, token, locale });
    } catch (error) {
      throw new ApiError(error.status || 0, error.code || error.message || "request_failed");
    }
  }

  const urlBase = apiUrl(path);
  if (!urlBase) {
    throw new ApiError(503, "service_unavailable");
  }

  const url = new URL(urlBase);
  if (locale) url.searchParams.set("locale", locale);

  const headers = {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
  };
  if (token) headers["x-prearrival-token"] = token;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "request_failed");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.message || data.error || "request_failed");
  }
  return data;
}

export function lookupReservation(guestName, reservationCode) {
  return request("/api/public/prearrival/lookup", {
    method: "POST",
    body: {
      guest_name: guestName,
      reservation_code: reservationCode,
    },
  });
}

export function fetchOptions(token, locale) {
  return request("/api/public/prearrival/options", {
    token,
    locale,
  });
}

export function saveDraft(token, payload) {
  return request("/api/public/prearrival/draft", {
    method: "PUT",
    token,
    body: payload,
  });
}

export function submitPreferences(token, payload) {
  return request("/api/public/prearrival/submit", {
    method: "POST",
    token,
    body: payload,
  });
}

export function fetchSubmission(token) {
  return request("/api/public/prearrival/submission", { token });
}

export function sendEmailCopy(token, email) {
  return request("/api/public/prearrival/email-copy", {
    method: "POST",
    token,
    body: { email },
  });
}

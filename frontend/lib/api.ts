const DEFAULT_API_URL = "http://localhost:8000/api/v1";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/+$/, "");

export const API_ORIGIN = API_BASE_URL.replace(/\/api(?:\/.*)?$/i, "");

const AUTH_STORAGE_KEYS = [
  "user_name",
  "user_role",
  "user_email",
  "profile_image",
  "cover_image",
];

function getCookie(name: string): string {
  if (typeof document === "undefined") {
    return "";
  }

  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split("=")[1] ?? "") : "";
}

function clearStoredAuthentication(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

async function ensureCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const response = await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to initialize CSRF protection (${response.status}).`);
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers ?? {});

  if (method !== "GET" && method !== "HEAD") {
    await ensureCsrfCookie();

    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }
  }

  headers.set("Accept", headers.get("Accept") ?? "application/json");
  headers.delete("Authorization");

  const response = await fetch(input, {
    ...init,
    credentials: "include",
    cache: init?.cache ?? "no-store",
    headers,
  });

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname.replace(/\/+$/, "") !== "/login"
  ) {
    clearStoredAuthentication();
    window.location.replace("/login");
  }

  return response;
}

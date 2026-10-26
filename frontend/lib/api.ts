const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/+$/, "");

export const API_ORIGIN = API_BASE_URL.replace(/\/api(?:\/.*)?$/i, "");

const AUTH_STORAGE_KEYS = [
  "auth_token",
  "user_name",
  "user_role",
  "user_email",
  "profile_image",
  "cover_image",
];

function clearStoredAuthentication(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

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

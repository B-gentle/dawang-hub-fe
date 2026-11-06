import Cookies from "js-cookie";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
export const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME!;

export const getAuthToken = () => {
  return Cookies.get(TOKEN_COOKIE_NAME) || null;
};

export async function fetcher<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "An unexpected error occurred" }));

    // Intercept 401 Unauthorized (Expired / Invalid Token)
    if (res.status === 401) {
      Cookies.remove(TOKEN_COOKIE_NAME);

      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin")
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname,
        )}`;
      }

      throw new Error("Session expired or unauthorized. Please log in again.");
    }

    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || `Request failed with status ${res.status}`,
    );
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

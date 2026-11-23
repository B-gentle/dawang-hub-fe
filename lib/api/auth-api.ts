import Cookies from "js-cookie";
import { fetcher, TOKEN_COOKIE_NAME } from "./fetcher";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  isActive?: boolean;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
}

function getCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com")
    .split(":")[0]
    .toLowerCase()
    .trim();
  const hostname = window.location.hostname.toLowerCase();

  if (hostname === rootDomain || hostname.endsWith(`.${rootDomain}`)) {
    return `.${rootDomain}`;
  }
  return undefined;
}

function setAuthCookie(token?: string) {
  if (!token) return;
  const domain = getCookieDomain();
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(domain ? { domain } : {}),
  });
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetcher<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    setAuthCookie(response.accessToken);
    return response;
  },

  register: async (data: RegisterInput) => {
    const response = await fetcher<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    setAuthCookie(response.accessToken);
    return response;
  },

  forgotPassword: (email: string) =>
    fetcher<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { token: string; password: string }) =>
    fetcher<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => fetcher<UserProfile>("/auth/me"),

  logout: () => {
    const domain = getCookieDomain();
    Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
    if (domain) {
      Cookies.remove(TOKEN_COOKIE_NAME, { path: "/", domain });
    }
  },
};

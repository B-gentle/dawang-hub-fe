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

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetcher<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.accessToken) {
      Cookies.set(TOKEN_COOKIE_NAME, response.accessToken, {
        expires: 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  },

  register: async (data: RegisterInput) => {
    const response = await fetcher<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      Cookies.set(TOKEN_COOKIE_NAME, response.accessToken, {
        expires: 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

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
    Cookies.remove(TOKEN_COOKIE_NAME);
  },
};

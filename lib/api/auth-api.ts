import Cookies from "js-cookie";
import { fetcher, TOKEN_COOKIE_NAME } from "./fetcher";

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetcher<{
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isActive: boolean;
      };
      accessToken: string;
    }>("/auth/login", {
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

  logout: () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
  },
};

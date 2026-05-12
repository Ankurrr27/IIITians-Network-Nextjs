// src/lib/apiClient.ts
// Axios instance for CLIENT components.
// Reads token from localStorage, auto-redirects on 401.
// Server components should query the DB directly instead.

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  withCredentials: false,
});

api.interceptors.request.use(
  (req) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      const hasAuth =
        Boolean(req.headers?.Authorization) ||
        Boolean(req.headers?.authorization);
      if (token && !hasAuth) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
    return req;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (localStorage.getItem("adminToken")) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

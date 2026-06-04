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
      const adminToken = localStorage.getItem("adminToken");
      const discussToken = localStorage.getItem("discussToken");
      
      const hasAuth =
        Boolean(req.headers?.Authorization) ||
        Boolean(req.headers?.authorization);
        
      if (!hasAuth) {
        // If we are on an admin page or requesting an admin API route, use adminToken only
        const isAdminPage = window.location.pathname.startsWith("/admin") || window.location.pathname.includes("/admin");
        const isAdminRoute = req.url?.includes("/admin/") || req.url?.includes("/admin");
        
        const token = (isAdminPage || isAdminRoute) ? adminToken : (discussToken || adminToken);
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        }
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
      const authHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization || "";
      const adminToken = localStorage.getItem("adminToken");
      const discussToken = localStorage.getItem("discussToken");
      
      if (adminToken && authHeader.includes(adminToken)) {
        localStorage.removeItem("adminToken");
        // Only redirect to admin secure page if currently accessing an admin route
        if (window.location.pathname.startsWith("/admin") || window.location.pathname.includes("/admin")) {
          window.location.href = "/admin";
        }
      }
      if (discussToken && authHeader.includes(discussToken)) {
        localStorage.removeItem("discussToken");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

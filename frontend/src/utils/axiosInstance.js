import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://192.168.1.6:3006/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hoh_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/verifyOtp") &&
      !originalRequest.url?.includes("/auth/sendVerificationOtp")
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post("/auth/refresh");
        const newToken = refreshRes.data?.accessToken || refreshRes.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem("hoh_token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem("hoh_token");
        localStorage.removeItem("hoh_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

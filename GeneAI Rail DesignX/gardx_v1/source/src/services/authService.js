import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("railway_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("railway_token");
      localStorage.removeItem("railway_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      // Mock login for development
      if (
        credentials.email === "admin@railway.com" &&
        credentials.password === "admin123"
      ) {
        return {
          user: {
            id: "1",
            email: "admin@railway.com",
            name: "Railway Admin",
            role: "admin",
          },
          token: "mock-jwt-token-" + Date.now(),
        };
      } else if (
        credentials.email === "engineer@railway.com" &&
        credentials.password === "engineer123"
      ) {
        return {
          user: {
            id: "2",
            email: "engineer@railway.com",
            name: "Railway Engineer",
            role: "editor",
          },
          token: "mock-jwt-token-" + Date.now(),
        };
      }

      throw new Error("Invalid credentials");
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      // Mock registration for development
      return {
        user: {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          role: userData.role || "viewer",
        },
        message: "Registration successful",
      };
    }
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async refreshToken() {
    try {
      const response = await apiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await apiClient.put("/auth/password", passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

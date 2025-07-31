import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@services/authService";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || "guest");
  const hasPermission = computed(() => (requiredRole) => {
    const roles = ["guest", "viewer", "editor", "admin"];
    const userRoleIndex = roles.indexOf(userRole.value);
    const requiredRoleIndex = roles.indexOf(requiredRole);
    return userRoleIndex >= requiredRoleIndex;
  });

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login(credentials);

      user.value = response.user;
      token.value = response.token;

      // Store in localStorage
      localStorage.setItem("railway_token", response.token);
      localStorage.setItem("railway_user", JSON.stringify(response.user));

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem("railway_token");
      localStorage.removeItem("railway_user");
    }
  };

  const register = async (userData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.register(userData);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const initializeAuth = () => {
    const storedToken = localStorage.getItem("railway_token");
    const storedUser = localStorage.getItem("railway_user");

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    hasPermission,
    login,
    logout,
    register,
    initializeAuth,
    clearError,
  };
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "../services/axios.js";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);
  const token = ref(localStorage.getItem("token"));
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  const login = async (credentials) => {
    const data = await axios.post("/auth/login", credentials);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  };

  const register = async (userData) => {
    const data = await axios.post("/auth/register", userData);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const checkAuth = async () => {
    if (!token.value) {
      isLoading.value = false;
      return false;
    }
    isLoading.value = true;
    try {
      const userData = await axios.get("/auth/me");
      user.value = userData;
      localStorage.setItem("user", JSON.stringify(userData));
      isLoading.value = false;
      return true;
    } catch {
      logout();
      isLoading.value = false;
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };
});

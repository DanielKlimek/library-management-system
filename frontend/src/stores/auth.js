import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "../services/axios.js";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token"));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  const login = async (credentials) => {
    const data = await axios.post("/auth/login", credentials);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("token", data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await axios.post("/auth/register", userData);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("token", data.token);
    return data;
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
  };

  const checkAuth = async () => {
    if (!token.value) return false;
    try {
      user.value = await axios.get("/auth/me");
      return true;
    } catch {
      logout();
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };
});

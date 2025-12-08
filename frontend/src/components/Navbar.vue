<template>
  <nav class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <router-link to="/books" class="text-2xl font-bold text-purple-600">
          📚 Knižnica
        </router-link>

        <div class="flex gap-4 items-center">
          <router-link
            v-if="!isAdmin"
            to="/books"
            class="text-gray-700 hover:text-purple-600 transition"
          >
            Knihy
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/admin/books"
            class="text-gray-700 hover:text-purple-600 transition"
          >
            Admin
          </router-link>

          <div v-if="user" class="flex gap-3 items-center">
            <span class="text-gray-600">{{ user.name }}</span>
            <button
              @click="logout"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Odhlásiť
            </button>
          </div>

          <router-link
            v-else
            to="/login"
            class="px-4 py-2 btn-primary text-white rounded-lg"
          >
            Prihlásiť
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();

const { user, isAdmin } = authStore;

const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

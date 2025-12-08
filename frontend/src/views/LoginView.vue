<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        Prihlásenie
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="form.email"
            @blur="validateEmail"
            type="email"
            placeholder="Email"
            class="w-full px-4 py-3 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <input
            v-model="form.password"
            @blur="validatePassword"
            type="password"
            placeholder="Heslo"
            class="w-full px-4 py-3 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">
            {{ errors.password }}
          </p>
        </div>

        <p v-if="errors.submit" class="text-red-500 text-sm error-shake">
          {{ errors.submit }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 btn-primary text-white rounded-lg font-semibold"
        >
          {{ loading ? "Prihlasovanie..." : "Prihlásiť sa" }}
        </button>
      </form>

      <p class="text-center mt-4 text-gray-600">
        Nemáte účet?
        <router-link to="/register" class="text-purple-600 hover:underline">
          Zaregistrujte sa
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
  submit: "",
});

const loading = ref(false);

const validateEmail = () => {
  if (!form.email) {
    errors.email = "Email je povinný";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Neplatný email";
  } else {
    errors.email = "";
  }
};

const validatePassword = () => {
  if (!form.password) {
    errors.password = "Heslo je povinné";
  } else if (form.password.length < 6) {
    errors.password = "Heslo musí mať aspoň 6 znakov";
  } else {
    errors.password = "";
  }
};

const handleLogin = async () => {
  validateEmail();
  validatePassword();

  if (errors.email || errors.password) return;

  loading.value = true;
  errors.submit = "";

  try {
    const data = await authStore.login(form);
    if (data.user.role === "admin") {
      router.push("/admin/books");
    } else {
      router.push("/books");
    }
  } catch (err) {
    errors.submit = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

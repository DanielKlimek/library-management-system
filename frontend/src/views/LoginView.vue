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

      <div class="divider-text my-6">alebo</div>

      <p class="text-center text-gray-600">
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
import { userValidators, hasErrors } from "../validators";

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
  errors.email = userValidators.email(form.email);
};

const validatePassword = () => {
  errors.password = userValidators.password(form.password);
};

const handleLogin = async () => {
  validateEmail();
  validatePassword();

  if (hasErrors(errors)) return;

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

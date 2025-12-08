<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        Registrácia
      </h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <input
            v-model="form.name"
            @blur="validateName"
            type="text"
            placeholder="Meno"
            class="w-full px-4 py-3 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">
            {{ errors.name }}
          </p>
        </div>

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

        <div>
          <input
            v-model="form.confirmPassword"
            @blur="validateConfirmPassword"
            type="password"
            placeholder="Potvrďte heslo"
            class="w-full px-4 py-3 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.confirmPassword }"
          />
          <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">
            {{ errors.confirmPassword }}
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
          {{ loading ? "Registrovanie..." : "Zaregistrovať sa" }}
        </button>
      </form>

      <p class="text-center mt-4 text-gray-600">
        Máte účet?
        <router-link to="/login" class="text-purple-600 hover:underline">
          Prihláste sa
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
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  submit: "",
});

const loading = ref(false);

const validateName = () => {
  if (!form.name) {
    errors.name = "Meno je povinné";
  } else if (form.name.length < 2) {
    errors.name = "Meno musí mať aspoň 2 znaky";
  } else {
    errors.name = "";
  }
};

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
  // Re-validate confirm password if it was already filled
  if (form.confirmPassword) {
    validateConfirmPassword();
  }
};

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = "Potvrdenie hesla je povinné";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Heslá sa nezhodujú";
  } else {
    errors.confirmPassword = "";
  }
};

const handleRegister = async () => {
  validateName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (errors.name || errors.email || errors.password || errors.confirmPassword) return;

  loading.value = true;
  errors.submit = "";

  try {
    const data = await authStore.register(form);
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

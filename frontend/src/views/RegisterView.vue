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

      <div class="divider-text my-6">alebo</div>

      <p class="text-center text-gray-600">
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
import { userValidators, hasErrors } from "../validators";

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
  errors.name = userValidators.name(form.name);
};

const validateEmail = () => {
  errors.email = userValidators.email(form.email);
};

const validatePassword = () => {
  errors.password = userValidators.password(form.password);
  if (form.confirmPassword) {
    validateConfirmPassword();
  }
};

const validateConfirmPassword = () => {
  errors.confirmPassword = userValidators.confirmPassword(form.password, form.confirmPassword);
};

const handleRegister = async () => {
  validateName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (hasErrors(errors)) return;

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

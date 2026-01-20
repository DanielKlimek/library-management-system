<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800">Moje požičané knihy</h1>
        <p class="text-gray-600 mt-2">Prehľad vašich aktuálnych a minulých požičaní</p>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Filtrovať požičania</h2>
        <div class="grid md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Stav
            </label>
            <select
              v-model="filters.status"
              @change="applyFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            >
              <option value="">Všetky</option>
              <option value="active">Aktívne</option>
              <option value="overdue">Po termíne</option>
              <option value="returned">Vrátené</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Len po termíne
            </label>
            <input
              v-model="filters.overdue"
              @change="applyFilters"
              type="checkbox"
              class="w-5 h-5 mt-2 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Od dátumu
            </label>
            <input
              v-model="filters.fromDate"
              @change="applyFilters"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Do dátumu
            </label>
            <input
              v-model="filters.toDate"
              @change="applyFilters"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div class="md:col-span-4 flex justify-end">
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Vymazať filtre
            </button>
          </div>
        </div>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else class="space-y-4">
        <LoanCard
          v-for="loan in filteredLoans"
          :key="loan._id"
          :loan="loan"
          :show-user="false"
          @click="$router.push(`/loans/${loan._id}`)"
        />
      </div>

      <p
        v-if="!loading && filteredLoans.length === 0 && loans.length > 0"
        class="text-center text-gray-500 mt-8"
      >
        Žiadne požičania nevyhovujú filtrom
      </p>

      <p
        v-if="!loading && loans.length === 0"
        class="text-center text-gray-500 mt-8"
      >
        Zatiaľ nemáte žiadne požičané knihy
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from "vue";
import { useLoansStore } from "../stores/loans.js";
import { useAuthStore } from "../stores/auth.js";
import Navbar from "../components/Navbar.vue";
import LoanCard from "../components/LoanCard.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const loansStore = useLoansStore();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const loans = computed(() => loansStore.loans);
const loading = computed(() => loansStore.loading);

const filters = reactive({
  status: "",
  overdue: false,
  fromDate: "",
  toDate: "",
});

const filteredLoans = computed(() => {
  let result = loans.value;

  if (filters.status) {
    result = result.filter((loan) => loan.status === filters.status);
  }

  if (filters.overdue) {
    result = result.filter(
      (loan) => loan.status === "overdue" && new Date(loan.dueDate) < new Date()
    );
  }

  if (filters.fromDate) {
    result = result.filter(
      (loan) => new Date(loan.loanDate) >= new Date(filters.fromDate)
    );
  }

  if (filters.toDate) {
    result = result.filter(
      (loan) => new Date(loan.loanDate) <= new Date(filters.toDate)
    );
  }

  return result;
});

const loadLoans = async () => {
  if (!user.value) return;

  try {
    const userId = user.value.id || user.value._id;
    await loansStore.fetchUserLoans(userId);
  } catch (err) {
    console.error(err);
  }
};

const applyFilters = () => {
};

const resetFilters = () => {
  filters.status = "";
  filters.overdue = false;
  filters.fromDate = "";
  filters.toDate = "";
};

onMounted(loadLoans);
</script>

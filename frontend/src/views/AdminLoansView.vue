<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800">Správa požičaní</h1>
        <p class="text-gray-600 mt-2">
          Prehľad a správa všetkých požičaní v systéme
        </p>
      </div>

      <div v-if="stats" class="grid md:grid-cols-5 gap-6 mb-8">
        <StatsCard
          label="Celkom požičaní"
          :value="stats.totalLoans"
          icon="📚"
          bgClass="bg-purple-100"
          textClass="text-purple-600"
        />
        <StatsCard
          label="Aktívne"
          :value="stats.activeLoans"
          icon="✓"
          bgClass="bg-green-100"
          textClass="text-green-600"
        />
        <StatsCard
          label="Po termíne"
          :value="stats.overdueLoans"
          icon="⚠"
          bgClass="bg-red-100"
          textClass="text-red-600"
        />
        <StatsCard
          label="Vrátené"
          :value="stats.returnedLoans"
          icon="📦"
          bgClass="bg-gray-100"
          textClass="text-gray-600"
        />
        <StatsCard
          label="Pokuty celkom"
          :value="`${stats.totalFines}€`"
          icon="💰"
          bgClass="bg-yellow-100"
          textClass="text-yellow-600"
        />
      </div>

      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">
          Filtrovať požičania
        </h2>
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
          v-for="loan in loans"
          :key="loan._id"
          :loan="loan"
          @click="$router.push(`/loans/${loan._id}`)"
        />
      </div>

      <p
        v-if="!loading && loans.length === 0"
        class="text-center text-gray-500 mt-8"
      >
        Žiadne požičania nevyhovujú filtrom
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from "vue";
import { useLoansStore } from "../stores/loans.js";
import Navbar from "../components/Navbar.vue";
import LoanCard from "../components/LoanCard.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import StatsCard from "../components/StatsCard.vue";

const loansStore = useLoansStore();

const loans = computed(() => loansStore.loans);
const stats = computed(() => loansStore.stats);
const loading = computed(() => loansStore.loading);

const filters = reactive({
  status: "",
  overdue: false,
  fromDate: "",
  toDate: "",
});

const loadLoans = async () => {
  try {
    const params = {};

    if (filters.status) params.status = filters.status;
    if (filters.overdue) params.overdue = "true";
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;

    await loansStore.fetchLoans(params);
  } catch (err) {
    console.error(err);
  }
};

const loadStats = async () => {
  try {
    await loansStore.fetchLoanStats();
  } catch (err) {
    console.error(err);
  }
};

const applyFilters = () => {
  loadLoans();
};

const resetFilters = () => {
  filters.status = "";
  filters.overdue = false;
  filters.fromDate = "";
  filters.toDate = "";
  loadLoans();
};

onMounted(() => {
  loadLoans();
  loadStats();
});
</script>

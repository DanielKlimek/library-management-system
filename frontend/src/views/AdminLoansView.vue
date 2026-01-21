<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold gradient-text">Správa požičaní</h1>
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

      <div
        v-if="pendingExtensionRequests.length > 0"
        class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
      >
        <h2 class="text-xl font-semibold mb-4 text-yellow-800 flex items-center gap-2">
          🔔 Čakajúce žiadosti o predĺženie ({{ pendingExtensionRequests.length }})
        </h2>
        <div class="space-y-3">
          <div
            v-for="loan in pendingExtensionRequests"
            :key="loan._id"
            class="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm"
          >
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ loan.book?.title }}</p>
              <p class="text-sm text-gray-600">
                {{ loan.user?.name }} ({{ loan.user?.email }})
              </p>
              <p class="text-sm text-yellow-700 mt-1">
                Žiada o predĺženie o {{ loan.extensionRequest.requestedDays }} dní
              </p>
              <p v-if="loan.extensionRequest.message" class="text-sm text-gray-500 mt-1 italic">
                "{{ loan.extensionRequest.message }}"
              </p>
            </div>
            <div class="flex gap-2 ml-4">
              <button
                @click="handleApproveExtension(loan._id)"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                ✓ Schváliť
              </button>
              <button
                @click="handleRejectExtension(loan._id)"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                ✗ Zamietnuť
              </button>
              <button
                @click="$router.push(`/loans/${loan._id}`)"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Detail
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-xl shadow-md p-6 mb-8">
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
        <div
          v-for="loan in loans"
          :key="loan._id"
          class="bg-white rounded-xl card-shadow p-5"
        >
          <div class="flex gap-4">
            <img
              v-if="loan.book?.coverImage"
              :src="`http://localhost:5000${loan.book.coverImage}`"
              :alt="loan.book.title"
              class="w-20 h-28 object-cover rounded-lg cursor-pointer hover-scale"
              @click="$router.push(`/loans/${loan._id}`)"
            />
            <div
              v-else
              class="w-20 h-28 bg-linear-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center cursor-pointer hover-scale"
              @click="$router.push(`/loans/${loan._id}`)"
            >
              <span class="text-3xl">📖</span>
            </div>

            <div class="flex-1">
              <h3
                class="text-lg font-bold text-gray-800 mb-1 cursor-pointer hover:text-purple-600"
                @click="$router.push(`/loans/${loan._id}`)"
              >
                {{ loan.book?.title }}
              </h3>
              <p class="text-sm text-gray-600 mb-1">{{ loan.book?.author }}</p>
              <p class="text-sm text-gray-500 mb-2">
                👤 {{ loan.user?.name }} ({{ loan.user?.email }})
              </p>

              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                  📅 Požičané: {{ formatDate(loan.loanDate) }}
                </span>
                <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                  ⏰ Vrátiť do: {{ formatDate(loan.dueDate) }}
                </span>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(loan.status)"
                >
                  <span v-if="loan.status === 'active'" class="status-dot bg-green-500 mr-1"></span>
                  <span v-else-if="loan.status === 'overdue'" class="status-dot bg-red-500 mr-1"></span>
                  {{ getStatusText(loan.status) }}
                </span>

                <span v-if="loan.fine > 0" class="text-red-600 font-semibold text-sm pulse-badge">
                  💰 Pokuta: {{ loan.fine }}€
                </span>

                <span
                  v-if="loan.extensionRequest?.status === 'pending'"
                  class="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium"
                >
                  🕐 Žiadosť o predĺženie ({{ loan.extensionRequest.requestedDays }} dní)
                </span>
              </div>

              <div v-if="loan.status !== 'returned'" class="mt-3 flex gap-2">
                <button
                  @click="handleReturn(loan._id)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  ✓ Vrátiť
                </button>
                <button
                  @click="openExtendModal(loan)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  🔄 Predĺžiť
                </button>
                <button
                  @click="$router.push(`/loans/${loan._id}`)"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="!loading && loans.length === 0"
        class="text-center text-gray-500 mt-8"
      >
        Žiadne požičania nevyhovujú filtrom
      </p>
    </div>

    <Modal
      :show="showExtendModal"
      title="Predĺžiť požičanie"
      @close="showExtendModal = false"
    >
      <form @submit.prevent="handleExtend">
        <div class="mb-4">
          <p class="text-gray-700 mb-4">
            Predĺžiť požičanie knihy <strong>{{ selectedLoan?.book?.title }}</strong>
            pre {{ selectedLoan?.user?.name }}
          </p>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Počet dní *
          </label>
          <input
            v-model.number="extendDays"
            type="number"
            min="1"
            max="365"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p class="text-sm text-gray-500 mt-1">
            Minimálne 1 deň, maximálne 365 dní
          </p>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="showExtendModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Predĺžiť
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useLoansStore } from "../stores/loans.js";
import Navbar from "../components/Navbar.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import StatsCard from "../components/StatsCard.vue";
import Modal from "../components/Modal.vue";

const loansStore = useLoansStore();

const loans = computed(() => loansStore.loans);
const stats = computed(() => loansStore.stats);
const loading = computed(() => loansStore.loading);

const showExtendModal = ref(false);
const selectedLoan = ref(null);
const extendDays = ref(7);

const pendingExtensionRequests = computed(() => {
  return loans.value.filter(
    (loan) => loan.extensionRequest?.status === "pending"
  );
});

const filters = reactive({
  status: "",
  overdue: false,
  fromDate: "",
  toDate: "",
});

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("sk-SK");
};

const getStatusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "returned":
      return "bg-gray-100 text-gray-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "active":
      return "✓ Aktívne";
    case "returned":
      return "✓ Vrátené";
    case "overdue":
      return "⚠ Po termíne";
    default:
      return status;
  }
};

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

let debounceTimeout;
const applyFilters = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    loadLoans();
  }, 300);
};

const resetFilters = () => {
  filters.status = "";
  filters.overdue = false;
  filters.fromDate = "";
  filters.toDate = "";
  loadLoans();
};

const handleReturn = async (loanId) => {
  if (!confirm("Naozaj chcete označiť túto knihu ako vrátenú?")) return;

  try {
    await loansStore.returnLoan(loanId);
    loadStats();
    alert("Kniha úspešne vrátená");
  } catch (err) {
    alert("Chyba pri vrátení knihy: " + (err.message || "Neznáma chyba"));
  }
};

const openExtendModal = (loan) => {
  selectedLoan.value = loan;
  extendDays.value = 7;
  showExtendModal.value = true;
};

const handleExtend = async () => {
  if (!selectedLoan.value) return;

  if (extendDays.value < 1 || extendDays.value > 365) {
    alert("Počet dní musí byť medzi 1 a 365");
    return;
  }

  try {
    await loansStore.extendLoan(selectedLoan.value._id, extendDays.value);
    showExtendModal.value = false;
    alert("Požičanie úspešne predĺžené");
  } catch (err) {
    alert("Chyba pri predlžovaní: " + (err.message || "Neznáma chyba"));
  }
};

const handleApproveExtension = async (loanId) => {
  try {
    await loansStore.approveExtension(loanId);
    alert("Žiadosť o predĺženie bola schválená");
  } catch (err) {
    alert("Chyba pri schvaľovaní: " + (err.message || "Neznáma chyba"));
  }
};

const handleRejectExtension = async (loanId) => {
  try {
    await loansStore.rejectExtension(loanId);
    alert("Žiadosť o predĺženie bola zamietnutá");
  } catch (err) {
    alert("Chyba pri zamietaní: " + (err.message || "Neznáma chyba"));
  }
};

onMounted(() => {
  loadLoans();
  loadStats();
});
</script>

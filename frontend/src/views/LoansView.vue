<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold gradient-text">Moje požičané knihy</h1>
        <p class="text-gray-600 mt-2">Prehľad vašich aktuálnych a minulých požičaní</p>
      </div>

      <div class="glass-card rounded-xl shadow-md p-6 mb-8">
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
        <div
          v-for="loan in filteredLoans"
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
              <p class="text-sm text-gray-600 mb-2">{{ loan.book?.author }}</p>

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
                  🕐 Čaká sa na schválenie predĺženia ({{ loan.extensionRequest.requestedDays }} dní)
                </span>
                <span
                  v-else-if="loan.extensionRequest?.status === 'approved'"
                  class="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium"
                >
                  ✓ Predĺženie schválené
                </span>
                <span
                  v-else-if="loan.extensionRequest?.status === 'rejected'"
                  class="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium"
                >
                  ✗ Predĺženie zamietnuté
                </span>
              </div>

              <div v-if="loan.status !== 'returned'" class="mt-3 flex gap-2">
                <button
                  @click="handleReturn(loan)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  ✓ Vrátiť knihu
                </button>
                <button
                  v-if="!loan.extensionRequest || loan.extensionRequest.status !== 'pending'"
                  @click="openExtendModal(loan)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  🔄 Požiadať o predĺženie
                </button>
              </div>
            </div>
          </div>
        </div>
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

    <Modal
      :show="showExtendModal"
      title="Požiadať o predĺženie"
      @close="showExtendModal = false"
    >
      <form @submit.prevent="handleRequestExtension">
        <div class="mb-4">
          <p class="text-gray-700 mb-4">
            Požiadať o predĺženie pre knihu <strong>{{ selectedLoan?.book?.title }}</strong>
          </p>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Počet dní *
          </label>
          <input
            v-model.number="extendForm.days"
            type="number"
            min="1"
            max="30"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p class="text-sm text-gray-500 mt-1">
            Minimálne 1 deň, maximálne 30 dní
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Správa pre admina (voliteľné)
          </label>
          <textarea
            v-model="extendForm.message"
            rows="3"
            maxlength="500"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Dôvod žiadosti o predĺženie..."
          ></textarea>
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
            Odoslať žiadosť
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useLoansStore } from "../stores/loans.js";
import { useAuthStore } from "../stores/auth.js";
import Navbar from "../components/Navbar.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import Modal from "../components/Modal.vue";

const loansStore = useLoansStore();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const loans = computed(() => loansStore.loans);
const loading = computed(() => loansStore.loading);

const showExtendModal = ref(false);
const selectedLoan = ref(null);

const extendForm = reactive({
  days: 7,
  message: "",
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

const handleReturn = async (loan) => {
  if (!confirm(`Naozaj chcete vrátiť knihu "${loan.book?.title}"?`)) return;

  try {
    await loansStore.userReturnLoan(loan._id);
    alert("Kniha úspešne vrátená");
  } catch (err) {
    alert("Chyba pri vrátení knihy: " + (err.message || "Neznáma chyba"));
  }
};

const openExtendModal = (loan) => {
  selectedLoan.value = loan;
  extendForm.days = 7;
  extendForm.message = "";
  showExtendModal.value = true;
};

const handleRequestExtension = async () => {
  if (!selectedLoan.value) return;

  if (extendForm.days < 1 || extendForm.days > 30) {
    alert("Počet dní musí byť medzi 1 a 30");
    return;
  }

  try {
    await loansStore.requestExtension(
      selectedLoan.value._id,
      extendForm.days,
      extendForm.message
    );
    showExtendModal.value = false;
    alert("Žiadosť o predĺženie bola odoslaná");
  } catch (err) {
    alert("Chyba pri odosielaní žiadosti: " + (err.message || "Neznáma chyba"));
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

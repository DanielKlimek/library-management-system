<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <button
        @click="$router.back()"
        class="mb-6 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium transition flex items-center gap-2"
      >
        ← Späť
      </button>

      <LoadingSpinner v-if="loading" />

      <div v-else-if="loan" class="bg-white rounded-xl shadow-lg p-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <img
              v-if="loan.book?.coverImage"
              :src="`http://localhost:5000${loan.book.coverImage}`"
              :alt="loan.book.title"
              class="w-full rounded-xl shadow-md"
            />
            <div
              v-else
              class="w-full aspect-[2/3] bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center"
            >
              <span class="text-8xl">📖</span>
            </div>
          </div>

          <div class="md:col-span-2">
            <div class="mb-6">
              <h1 class="text-4xl font-bold mb-2 text-gray-800">
                {{ loan.book?.title }}
              </h1>
              <p class="text-xl text-gray-600 mb-4">{{ loan.book?.author }}</p>

              <span
                class="inline-block px-4 py-2 rounded-full text-sm font-medium"
                :class="statusClass"
              >
                {{ statusText }}
              </span>
            </div>

            <div class="space-y-4 mb-6">
              <div class="flex items-center gap-3 text-gray-700">
                <span class="text-xl">👤</span>
                <div>
                  <p class="font-semibold">{{ loan.user?.name }}</p>
                  <p class="text-sm text-gray-600">{{ loan.user?.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 text-gray-700">
                <span class="text-xl">📅</span>
                <div>
                  <p class="font-semibold">Dátum požičania</p>
                  <p class="text-sm text-gray-600">{{ formatDate(loan.loanDate) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 text-gray-700">
                <span class="text-xl">⏰</span>
                <div>
                  <p class="font-semibold">Dátum vrátenia</p>
                  <p class="text-sm text-gray-600">{{ formatDate(loan.dueDate) }}</p>
                  <p v-if="daysRemaining !== null" class="text-sm" :class="daysRemainingClass">
                    {{ daysRemainingText }}
                  </p>
                </div>
              </div>

              <div v-if="loan.returnDate" class="flex items-center gap-3 text-gray-700">
                <span class="text-xl">✓</span>
                <div>
                  <p class="font-semibold">Skutočný dátum vrátenia</p>
                  <p class="text-sm text-gray-600">{{ formatDate(loan.returnDate) }}</p>
                </div>
              </div>

              <div v-if="loan.fine > 0" class="flex items-center gap-3 text-red-600">
                <span class="text-xl">💰</span>
                <div>
                  <p class="font-semibold">Pokuta</p>
                  <p class="text-sm">{{ loan.fine }}€</p>
                </div>
              </div>

              <div v-if="loan.notes" class="flex items-center gap-3 text-gray-700">
                <span class="text-xl">📝</span>
                <div>
                  <p class="font-semibold">Poznámky</p>
                  <p class="text-sm text-gray-600">{{ loan.notes }}</p>
                </div>
              </div>
            </div>

            <div v-if="isAdmin && loan.status !== 'returned'" class="flex gap-3">
              <button
                @click="showExtendModal = true"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                🔄 Predĺžiť
              </button>
              <button
                @click="handleReturn"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                ✓ Vrátiť knihu
              </button>
            </div>

            <div v-if="isAdmin" class="mt-4">
              <button
                @click="showDeleteConfirm = true"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                🗑 Vymazať požičanie
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal :show="showExtendModal" title="Predĺžiť požičanie" @close="showExtendModal = false">
      <form @submit.prevent="handleExtend">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Počet dní
          </label>
          <input
            v-model.number="extendDays"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
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

    <Modal
      :show="showDeleteConfirm"
      title="Potvrdiť vymazanie"
      @close="showDeleteConfirm = false"
    >
      <p class="mb-6 text-gray-700">
        Naozaj chcete vymazať toto požičanie?
      </p>
      <div class="flex gap-3 justify-end">
        <button
          @click="showDeleteConfirm = false"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Zrušiť
        </button>
        <button
          @click="handleDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Vymazať
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLoansStore } from "../stores/loans.js";
import { useAuthStore } from "../stores/auth.js";
import Navbar from "../components/Navbar.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import Modal from "../components/Modal.vue";

const route = useRoute();
const router = useRouter();
const loansStore = useLoansStore();
const authStore = useAuthStore();

const loan = computed(() => loansStore.currentLoan);
const loading = computed(() => loansStore.loading);
const isAdmin = computed(() => authStore.isAdmin);

const showExtendModal = ref(false);
const showDeleteConfirm = ref(false);
const extendDays = ref(7);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("sk-SK");
};

const statusClass = computed(() => {
  if (!loan.value) return "";
  switch (loan.value.status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "returned":
      return "bg-gray-100 text-gray-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
});

const statusText = computed(() => {
  if (!loan.value) return "";
  switch (loan.value.status) {
    case "active":
      return "✓ Aktívne požičanie";
    case "returned":
      return "✓ Vrátené";
    case "overdue":
      return "⚠ Po termíne vrátenia";
    default:
      return loan.value.status;
  }
});

const daysRemaining = computed(() => {
  if (!loan.value || loan.value.status === "returned") return null;
  const today = new Date();
  const due = new Date(loan.value.dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
});

const daysRemainingText = computed(() => {
  if (daysRemaining.value === null) return "";
  if (daysRemaining.value > 0) {
    return `Zostáva ${daysRemaining.value} ${daysRemaining.value === 1 ? "deň" : "dni"}`;
  } else if (daysRemaining.value === 0) {
    return "Posledný deň!";
  } else {
    return `Meškanie ${Math.abs(daysRemaining.value)} ${Math.abs(daysRemaining.value) === 1 ? "deň" : "dni"}`;
  }
});

const daysRemainingClass = computed(() => {
  if (daysRemaining.value === null) return "";
  if (daysRemaining.value > 7) return "text-green-600";
  if (daysRemaining.value > 0) return "text-orange-600";
  return "text-red-600 font-semibold";
});

const handleReturn = async () => {
  try {
    await loansStore.returnLoan(route.params.id);
    alert("Kniha úspešne vrátená");
  } catch (err) {
    alert("Chyba pri vrátení knihy");
  }
};

const handleExtend = async () => {
  try {
    await loansStore.extendLoan(route.params.id, extendDays.value);
    showExtendModal.value = false;
    alert("Požičanie úspešne predĺžené");
  } catch (err) {
    alert("Chyba pri predlžovaní požičania");
  }
};

const handleDelete = async () => {
  try {
    await loansStore.deleteLoan(route.params.id);
    router.push("/loans");
  } catch (err) {
    alert("Chyba pri mazaní požičania");
  }
};

onMounted(() => {
  loansStore.fetchLoan(route.params.id);
});
</script>

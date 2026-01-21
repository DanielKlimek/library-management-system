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
              <div v-if="isAdmin" class="flex items-center gap-3 text-gray-700">
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
                  <p class="text-sm text-gray-600">
                    {{ formatDate(loan.loanDate) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3 text-gray-700">
                <span class="text-xl">⏰</span>
                <div>
                  <p class="font-semibold">Dátum vrátenia</p>
                  <p class="text-sm text-gray-600">
                    {{ formatDate(loan.dueDate) }}
                  </p>
                  <p
                    v-if="daysRemaining !== null"
                    class="text-sm"
                    :class="daysRemainingClass"
                  >
                    {{ daysRemainingText }}
                  </p>
                </div>
              </div>

              <div
                v-if="loan.returnDate"
                class="flex items-center gap-3 text-gray-700"
              >
                <span class="text-xl">✓</span>
                <div>
                  <p class="font-semibold">Skutočný dátum vrátenia</p>
                  <p class="text-sm text-gray-600">
                    {{ formatDate(loan.returnDate) }}
                  </p>
                </div>
              </div>

              <div
                v-if="loan.fine > 0"
                class="flex items-center gap-3 text-red-600"
              >
                <span class="text-xl">💰</span>
                <div>
                  <p class="font-semibold">Pokuta</p>
                  <p class="text-sm">{{ loan.fine }}€</p>
                </div>
              </div>

              <div
                v-if="loan.notes"
                class="flex items-center gap-3 text-gray-700"
              >
                <span class="text-xl">📝</span>
                <div>
                  <p class="font-semibold">Poznámky</p>
                  <p class="text-sm text-gray-600">{{ loan.notes }}</p>
                </div>
              </div>

              <div
                v-if="loan.extensionRequest?.status"
                class="flex items-center gap-3"
                :class="{
                  'text-yellow-600': loan.extensionRequest.status === 'pending',
                  'text-green-600': loan.extensionRequest.status === 'approved',
                  'text-red-600': loan.extensionRequest.status === 'rejected',
                }"
              >
                <span class="text-xl">🔄</span>
                <div>
                  <p class="font-semibold">Žiadosť o predĺženie</p>
                  <p class="text-sm">
                    {{ loan.extensionRequest.requestedDays }} dní -
                    <span v-if="loan.extensionRequest.status === 'pending'">Čaká na schválenie</span>
                    <span v-else-if="loan.extensionRequest.status === 'approved'">Schválené</span>
                    <span v-else-if="loan.extensionRequest.status === 'rejected'">Zamietnuté</span>
                  </p>
                  <p v-if="loan.extensionRequest.message" class="text-sm text-gray-600 mt-1">
                    Správa: {{ loan.extensionRequest.message }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="isAdmin && loan.status !== 'returned'" class="space-y-4">
              <div
                v-if="loan.extensionRequest?.status === 'pending'"
                class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p class="font-semibold text-yellow-800 mb-2">
                  Žiadosť o predĺženie ({{ loan.extensionRequest.requestedDays }} dní)
                </p>
                <p v-if="loan.extensionRequest.message" class="text-sm text-yellow-700 mb-3">
                  {{ loan.extensionRequest.message }}
                </p>
                <div class="flex gap-2">
                  <button
                    @click="handleApproveExtension"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Schváliť
                  </button>
                  <button
                    @click="handleRejectExtension"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    ✗ Zamietnuť
                  </button>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="showExtendModal = true"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🔄 Predĺžiť priamo
                </button>
              </div>
            </div>

            <div v-if="isAdmin" class="mt-4">
              <button
                @click="showDeleteConfirm = true"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                🗑 Vymazať požičanie
              </button>
            </div>

            <div v-if="!isAdmin && isOwner" class="space-y-4">
              <div v-if="loan.status !== 'returned'" class="flex gap-3">
                <button
                  @click="handleUserReturn"
                  class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  ✓ Vrátiť knihu
                </button>
                <button
                  v-if="!loan.extensionRequest || loan.extensionRequest.status !== 'pending'"
                  @click="showUserExtendModal = true"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🔄 Požiadať o predĺženie
                </button>
              </div>
              <div v-if="loan.status === 'returned'">
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
    </div>

    <Modal
      :show="showExtendModal"
      title="Predĺžiť požičanie"
      @close="showExtendModal = false"
    >
      <form @submit.prevent="handleExtend">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Počet dní *
          </label>
          <input
            v-model.number="extendDays"
            @blur="validateExtendDays"
            type="number"
            min="1"
            max="365"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :class="{
              'border-red-500': extendErrors.days,
              'border-gray-300': !extendErrors.days,
            }"
          />
          <p v-if="extendErrors.days" class="text-red-500 text-sm mt-1">
            {{ extendErrors.days }}
          </p>
          <p v-else class="text-sm text-gray-500 mt-1">
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

    <Modal
      :show="showUserExtendModal"
      title="Požiadať o predĺženie"
      @close="showUserExtendModal = false"
    >
      <form @submit.prevent="handleRequestExtension">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Počet dní *
          </label>
          <input
            v-model.number="userExtendForm.days"
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
            v-model="userExtendForm.message"
            rows="3"
            maxlength="500"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Dôvod žiadosti o predĺženie..."
          ></textarea>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="showUserExtendModal = false"
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

    <Modal
      :show="showDeleteConfirm"
      title="Potvrdiť vymazanie"
      @close="showDeleteConfirm = false"
    >
      <p class="mb-6 text-gray-700">Naozaj chcete vymazať toto požičanie?</p>
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
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLoansStore } from "../stores/loans.js";
import { useAuthStore } from "../stores/auth.js";
import { loanValidators } from "../validators";
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
const user = computed(() => authStore.user);

const isOwner = computed(() => {
  if (!loan.value || !user.value) return false;
  const loanUserId = loan.value.user?._id || loan.value.user;
  const currentUserId = user.value.id || user.value._id;
  return loanUserId === currentUserId;
});

const showExtendModal = ref(false);
const showUserExtendModal = ref(false);
const showDeleteConfirm = ref(false);
const extendDays = ref(7);

const extendErrors = reactive({
  days: "",
});

const userExtendForm = reactive({
  days: 7,
  message: "",
});

const validateExtendDays = () => {
  extendErrors.days = loanValidators.extendDays(extendDays.value);
};

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

const handleExtend = async () => {
  validateExtendDays();
  if (extendErrors.days) return;

  try {
    await loansStore.extendLoan(route.params.id, extendDays.value);
    showExtendModal.value = false;
    extendDays.value = 7;
    extendErrors.days = "";
    alert("Požičanie úspešne predĺžené");
  } catch (err) {
    alert(
      "Chyba pri predlžovaní požičania: " + (err.message || "Neznáma chyba"),
    );
  }
};

const handleApproveExtension = async () => {
  try {
    await loansStore.approveExtension(route.params.id);
    alert("Žiadosť o predĺženie bola schválená");
  } catch (err) {
    alert("Chyba pri schvaľovaní: " + (err.message || "Neznáma chyba"));
  }
};

const handleRejectExtension = async () => {
  try {
    await loansStore.rejectExtension(route.params.id);
    alert("Žiadosť o predĺženie bola zamietnutá");
  } catch (err) {
    alert("Chyba pri zamietaní: " + (err.message || "Neznáma chyba"));
  }
};

const handleDelete = async () => {
  try {
    if (isAdmin.value) {
      await loansStore.deleteLoan(route.params.id);
      router.push("/admin/loans");
    } else {
      await loansStore.userDeleteLoan(route.params.id);
      router.push("/loans");
    }
  } catch (err) {
    alert("Chyba pri mazaní požičania: " + (err.message || "Neznáma chyba"));
  }
};

const handleUserReturn = async () => {
  if (!confirm("Naozaj chcete vrátiť túto knihu?")) return;

  try {
    await loansStore.userReturnLoan(route.params.id);
    alert("Kniha úspešne vrátená");
  } catch (err) {
    alert("Chyba pri vrátení knihy: " + (err.message || "Neznáma chyba"));
  }
};

const handleRequestExtension = async () => {
  if (userExtendForm.days < 1 || userExtendForm.days > 30) {
    alert("Počet dní musí byť medzi 1 a 30");
    return;
  }

  try {
    await loansStore.requestExtension(
      route.params.id,
      userExtendForm.days,
      userExtendForm.message
    );
    showUserExtendModal.value = false;
    userExtendForm.days = 7;
    userExtendForm.message = "";
    alert("Žiadosť o predĺženie bola odoslaná");
  } catch (err) {
    alert("Chyba pri odosielaní žiadosti: " + (err.message || "Neznáma chyba"));
  }
};

onMounted(() => {
  loansStore.fetchLoan(route.params.id);
});
</script>

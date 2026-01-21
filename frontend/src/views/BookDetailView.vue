<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <LoadingSpinner v-if="loading" />

      <div v-else-if="book" class="fade-in">
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <img
              v-if="book.coverImage"
              :src="`http://localhost:5000${book.coverImage}`"
              :alt="book.title"
              class="w-full rounded-xl shadow-lg"
            />
            <div
              v-else
              class="w-full h-96 bg-linear-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center"
            >
              <span class="text-9xl">📖</span>
            </div>
          </div>

          <div>
            <h1 class="text-4xl font-bold mb-4">{{ book.title }}</h1>
            <p class="text-2xl text-gray-600 mb-4">{{ book.author }}</p>

            <div class="flex items-center gap-2 mb-6">
              <div class="star-rating text-3xl">
                {{ "★".repeat(Math.round(book.ratingAvg))
                }}{{ "☆".repeat(5 - Math.round(book.ratingAvg)) }}
              </div>
              <span class="text-gray-500"
                >({{ book.ratingCount }} hodnotení)</span
              >
            </div>

            <div class="space-y-2 mb-6">
              <p><strong>ISBN:</strong> {{ book.isbn }}</p>
              <p><strong>Rok vydania:</strong> {{ book.year }}</p>
              <p>
                <strong>Dostupných kusov:</strong> {{ book.availableCopies }} /
                {{ book.totalCopies }}
              </p>
            </div>

            <p v-if="book.description" class="text-gray-700 leading-relaxed mb-6">
              {{ book.description }}
            </p>

            <div v-if="!isAdmin && user" class="mt-6">
              <button
                v-if="book.availableCopies > 0 && !hasActiveLoan"
                @click="showLoanModal = true"
                class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-lg"
              >
                📚 Požičať knihu
              </button>
              <div
                v-else-if="hasActiveLoan"
                class="w-full px-6 py-3 bg-gray-200 text-gray-600 rounded-lg text-center font-medium"
              >
                ✓ Už máte požičanú
              </div>
              <div
                v-else
                class="w-full px-6 py-3 bg-red-100 text-red-600 rounded-lg text-center font-medium"
              >
                ⚠ Momentálne nedostupné
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl card-shadow p-6">
          <h2 class="text-2xl font-bold mb-6">Recenzie</h2>

          <div v-if="user" class="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-3">Pridať hodnotenie</h3>
            <form @submit.prevent="handleSubmitReview" class="space-y-3">
              <div>
                <label class="block mb-2">Hodnotenie:</label>
                <div class="flex gap-2">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="reviewForm.rating = n"
                    class="text-3xl"
                    :class="
                      n <= reviewForm.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    "
                  >
                    ★
                  </button>
                </div>
                <p v-if="reviewErrors.rating" class="text-red-500 text-sm mt-1">
                  {{ reviewErrors.rating }}
                </p>
              </div>

              <div>
                <textarea
                  v-model="reviewForm.comment"
                  @blur="validateReviewComment"
                  placeholder="Váš komentár (voliteľné)"
                  class="w-full px-4 py-2 border rounded-lg input-focus"
                  rows="3"
                  :class="{ 'border-red-500': reviewErrors.comment }"
                ></textarea>
                <p
                  v-if="reviewErrors.comment"
                  class="text-red-500 text-sm mt-1"
                >
                  {{ reviewErrors.comment }}
                </p>
              </div>

              <button
                type="submit"
                class="px-6 py-2 btn-primary text-white rounded-lg"
              >
                Pridať recenziu
              </button>
            </form>
          </div>

          <div class="space-y-4">
            <div
              v-for="review in reviews"
              :key="review._id"
              class="border-b pb-4"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-semibold">{{ review.user.name }}</p>
                  <div class="star-rating text-sm">
                    {{ "★".repeat(review.rating)
                    }}{{ "☆".repeat(5 - review.rating) }}
                  </div>
                </div>
                <button
                  v-if="user && user.id === review.user._id"
                  @click="handleDeleteReview(review._id)"
                  class="text-red-500 hover:text-red-700"
                >
                  Vymazať
                </button>
              </div>
              <p class="text-gray-700">{{ review.comment }}</p>
            </div>
          </div>

          <p v-if="reviews.length === 0" class="text-gray-500 text-center py-8">
            Zatiaľ žiadne recenzie
          </p>
        </div>
      </div>
    </div>

    <Modal :show="showLoanModal" title="Požičať knihu" @close="showLoanModal = false">
      <form @submit.prevent="handleLoanBook">
        <div class="mb-4">
          <p class="text-gray-700 mb-4">
            Chcete si požičať knihu <strong>{{ book?.title }}</strong>?
          </p>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Dátum vrátenia *
          </label>
          <input
            v-model="loanForm.dueDate"
            @blur="validateLoanDueDate"
            type="date"
            :min="minDueDate"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :class="{ 'border-red-500': loanErrors.dueDate, 'border-gray-300': !loanErrors.dueDate }"
          />
          <p v-if="loanErrors.dueDate" class="text-red-500 text-sm mt-1">
            {{ loanErrors.dueDate }}
          </p>
          <p v-else class="text-sm text-gray-500 mt-1">
            Minimálne dnes, odporúčame 14-30 dní
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Poznámky (voliteľné)
          </label>
          <textarea
            v-model="loanForm.notes"
            @blur="validateLoanNotes"
            rows="3"
            maxlength="500"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :class="{ 'border-red-500': loanErrors.notes, 'border-gray-300': !loanErrors.notes }"
            placeholder="Voliteľné poznámky..."
          ></textarea>
          <p v-if="loanErrors.notes" class="text-red-500 text-sm mt-1">
            {{ loanErrors.notes }}
          </p>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="showLoanModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Požičať
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useBooksStore } from "../stores/books.js";
import { useReviewsStore } from "../stores/reviews.js";
import { useLoansStore } from "../stores/loans.js";
import { useAuthStore } from "../stores/auth.js";
import Navbar from "../components/Navbar.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import Modal from "../components/Modal.vue";

const route = useRoute();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

const booksStore = useBooksStore();
const reviewsStore = useReviewsStore();
const loansStore = useLoansStore();

const book = computed(() => booksStore.currentBook);
const reviews = computed(() => reviewsStore.reviews);
const loading = computed(() => booksStore.loading || reviewsStore.loading);

const showLoanModal = ref(false);
const hasActiveLoan = ref(false);

const reviewForm = reactive({
  rating: 0,
  comment: "",
});

const reviewErrors = reactive({
  rating: "",
  comment: "",
});

const loanForm = reactive({
  dueDate: "",
  notes: "",
});

const loanErrors = reactive({
  dueDate: "",
  notes: "",
});

const minDueDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const validateLoanDueDate = () => {
  if (!loanForm.dueDate) {
    loanErrors.dueDate = "Dátum vrátenia je povinný";
  } else if (new Date(loanForm.dueDate) < new Date(minDueDate.value)) {
    loanErrors.dueDate = "Dátum vrátenia nemôže byť v minulosti";
  } else {
    loanErrors.dueDate = "";
  }
};

const validateLoanNotes = () => {
  if (loanForm.notes && loanForm.notes.length > 500) {
    loanErrors.notes = "Poznámky môžu mať max 500 znakov";
  } else {
    loanErrors.notes = "";
  }
};

const validateReviewComment = () => {
  if (reviewForm.comment.length > 500) {
    reviewErrors.comment = "Komentár môže mať max 500 znakov";
  } else {
    reviewErrors.comment = "";
  }
};

const checkActiveLoan = async () => {
  if (!user.value) return;
  try {
    const userId = user.value.id || user.value._id;
    const userLoans = await loansStore.fetchUserLoans(userId);
    hasActiveLoan.value = userLoans.some(
      (loan) =>
        loan.book._id === route.params.id &&
        (loan.status === "active" || loan.status === "overdue")
    );
  } catch (err) {
    console.error(err);
  }
};

const loadData = async () => {
  try {
    await Promise.all([
      booksStore.fetchBook(route.params.id),
      reviewsStore.fetchReviewsByBook(route.params.id),
    ]);
    await checkActiveLoan();
  } catch (err) {
    console.error(err);
  }
};

const handleLoanBook = async () => {
  if (!user.value) return;

  validateLoanDueDate();
  validateLoanNotes();

  if (loanErrors.dueDate || loanErrors.notes) return;

  try {
    const userId = user.value.id || user.value._id;
    await loansStore.createLoan({
      user: userId,
      book: route.params.id,
      dueDate: loanForm.dueDate,
      notes: loanForm.notes || undefined,
    });

    showLoanModal.value = false;
    loanForm.dueDate = "";
    loanForm.notes = "";
    loanErrors.dueDate = "";
    loanErrors.notes = "";

    await loadData();
    alert("Kniha úspešne požičaná!");
  } catch (err) {
    alert("Chyba pri požičaní knihy: " + (err.message || "Neznáma chyba"));
  }
};

const handleSubmitReview = async () => {
  reviewErrors.rating = "";
  reviewErrors.comment = "";

  if (reviewForm.rating === 0) {
    reviewErrors.rating = "Zvoľte hodnotenie";
    return;
  }

  validateReviewComment();
  if (reviewErrors.comment) return;

  try {
    await reviewsStore.createReview({
      bookId: route.params.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    reviewForm.rating = 0;
    reviewForm.comment = "";
    await loadData();
  } catch (err) {
    alert(err.message);
  }
};

const handleDeleteReview = async (id) => {
  if (!confirm("Naozaj chcete vymazať recenziu?")) return;

  try {
    await reviewsStore.deleteReview(id);
  } catch (err) {
    alert(err.message);
  }
};

onMounted(loadData);
</script>

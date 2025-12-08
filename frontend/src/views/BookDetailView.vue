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

            <p v-if="book.description" class="text-gray-700 leading-relaxed">
              {{ book.description }}
            </p>
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
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useBooksStore } from "../stores/books.js";
import { useReviewsStore } from "../stores/reviews.js";
import { useAuthStore } from "../stores/auth.js";
import Navbar from "../components/Navbar.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const route = useRoute();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const booksStore = useBooksStore();
const reviewsStore = useReviewsStore();

const book = computed(() => booksStore.currentBook);
const reviews = computed(() => reviewsStore.reviews);
const loading = computed(() => booksStore.loading || reviewsStore.loading);

const reviewForm = reactive({
  rating: 0,
  comment: "",
});

const reviewErrors = reactive({
  rating: "",
  comment: "",
});

const validateReviewComment = () => {
  if (reviewForm.comment.length > 500) {
    reviewErrors.comment = "Komentár môže mať max 500 znakov";
  } else {
    reviewErrors.comment = "";
  }
};

const loadData = async () => {
  try {
    await Promise.all([
      booksStore.fetchBook(route.params.id),
      reviewsStore.fetchReviewsByBook(route.params.id),
    ]);
  } catch (err) {
    console.error(err);
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

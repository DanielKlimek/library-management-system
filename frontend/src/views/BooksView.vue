<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8 gradient-text">Naša knižnica</h1>

      <div class="glass-card rounded-xl shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Filtrovať knihy</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Vyhľadávanie
            </label>
            <input
              v-model="filters.search"
              @input="applyFilters"
              type="text"
              placeholder="Názov alebo autor..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rok vydania od
            </label>
            <input
              v-model="filters.yearFrom"
              @input="applyFilters"
              type="number"
              placeholder="napr. 2000"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rok vydania do
            </label>
            <input
              v-model="filters.yearTo"
              @input="applyFilters"
              type="number"
              placeholder="napr. 2024"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Min. hodnotenie
            </label>
            <div class="flex gap-1">
              <button
                v-for="n in 5"
                :key="n"
                @click="setMinRating(n)"
                type="button"
                class="text-2xl transition hover:scale-110"
                :class="n <= filters.minRating ? 'text-yellow-400' : 'text-gray-300'"
              >
                ★
              </button>
              <button
                v-if="filters.minRating > 0"
                @click="setMinRating(0)"
                class="ml-2 text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Zrušiť
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dostupnosť
            </label>
            <select
              v-model="filters.availability"
              @change="applyFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            >
              <option value="">Všetky knihy</option>
              <option value="available">Len dostupné</option>
              <option value="unavailable">Nedostupné</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Vymazať filtre
            </button>
          </div>
        </div>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else class="book-grid">
        <BookCard
          v-for="book in books"
          :key="book._id"
          :book="book"
          @click="$router.push(`/books/${book._id}`)"
        />
      </div>

      <p
        v-if="!loading && books.length === 0"
        class="text-center text-gray-500 mt-8"
      >
        Žiadne knihy nevyhovujú filtrom
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from "vue";
import { useBooksStore } from "../stores/books.js";
import Navbar from "../components/Navbar.vue";
import BookCard from "../components/BookCard.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const booksStore = useBooksStore();

const books = computed(() => booksStore.books);
const loading = computed(() => booksStore.loading);

const filters = reactive({
  search: "",
  yearFrom: "",
  yearTo: "",
  minRating: 0,
  availability: "",
});

const loadBooks = async () => {
  try {
    const params = {};

    if (filters.search) params.search = filters.search;
    if (filters.yearFrom) params.yearFrom = filters.yearFrom;
    if (filters.yearTo) params.yearTo = filters.yearTo;
    if (filters.minRating > 0) params.minRating = filters.minRating;
    if (filters.availability) params.availability = filters.availability;

    await booksStore.fetchBooks(params);
  } catch (err) {
    console.error(err);
  }
};

let debounceTimeout;
const applyFilters = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    loadBooks();
  }, 300);
};


const setMinRating = (rating) => {
  filters.minRating = rating;
  applyFilters();
};

const resetFilters = () => {
  filters.search = "";
  filters.yearFrom = "";
  filters.yearTo = "";
  filters.minRating = 0;
  filters.availability = "";
  loadBooks();
};

onMounted(loadBooks);
</script>

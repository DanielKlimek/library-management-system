<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold gradient-text">Správa kníh</h1>
        <button
          @click="openCreateModal"
          class="px-6 py-3 btn-primary btn-ripple text-white rounded-lg"
        >
          + Pridať knihu
        </button>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else class="bg-white rounded-xl card-shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">Obrázok</th>
              <th class="px-6 py-3 text-left">Názov</th>
              <th class="px-6 py-3 text-left">Autor</th>
              <th class="px-6 py-3 text-left">ISBN</th>
              <th class="px-6 py-3 text-left">Rok</th>
              <th class="px-6 py-3 text-left">Dostupné</th>
              <th class="px-6 py-3 text-left">Akcie</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="book in books"
              :key="book._id"
              class="border-t hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <img
                  v-if="book.coverImage"
                  :src="`http://localhost:5000${book.coverImage}`"
                  class="w-16 h-20 object-cover rounded"
                />
                <div
                  v-else
                  class="w-16 h-20 bg-purple-200 rounded flex items-center justify-center"
                >
                  📖
                </div>
              </td>
              <td class="px-6 py-4 font-semibold">{{ book.title }}</td>
              <td class="px-6 py-4">{{ book.author }}</td>
              <td class="px-6 py-4">{{ book.isbn }}</td>
              <td class="px-6 py-4">{{ book.year }}</td>
              <td class="px-6 py-4">
                {{ book.availableCopies }} / {{ book.totalCopies }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(book)"
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 hover-scale"
                  >
                    Upraviť
                  </button>
                  <button
                    @click="handleDelete(book._id)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 hover-scale"
                  >
                    Vymazať
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      :show="showModal"
      :title="editingBook ? 'Upraviť knihu' : 'Pridať knihu'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <input
            v-model="form.title"
            @blur="validateTitle"
            type="text"
            placeholder="Názov knihy"
            class="w-full px-4 py-2 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.title }"
          />
          <p v-if="errors.title" class="text-red-500 text-sm mt-1">
            {{ errors.title }}
          </p>
        </div>

        <div>
          <input
            v-model="form.author"
            @blur="validateAuthor"
            type="text"
            placeholder="Autor"
            class="w-full px-4 py-2 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.author }"
          />
          <p v-if="errors.author" class="text-red-500 text-sm mt-1">
            {{ errors.author }}
          </p>
        </div>

        <div>
          <input
            v-model="form.isbn"
            @blur="validateISBN"
            type="text"
            placeholder="ISBN (10 alebo 13 číslic)"
            class="w-full px-4 py-2 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.isbn }"
          />
          <p v-if="errors.isbn" class="text-red-500 text-sm mt-1">
            {{ errors.isbn }}
          </p>
        </div>

        <div>
          <input
            v-model="form.year"
            @blur="validateYear"
            type="number"
            placeholder="Rok vydania"
            class="w-full px-4 py-2 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.year }"
          />
          <p v-if="errors.year" class="text-red-500 text-sm mt-1">
            {{ errors.year }}
          </p>
        </div>

        <div>
          <textarea
            v-model="form.description"
            @blur="validateDescription"
            placeholder="Popis knihy"
            class="w-full px-4 py-2 border rounded-lg input-focus"
            rows="3"
            :class="{ 'border-red-500': errors.description }"
          ></textarea>
          <p v-if="errors.description" class="text-red-500 text-sm mt-1">
            {{ errors.description }}
          </p>
        </div>

        <div>
          <input
            v-model="form.totalCopies"
            @blur="validateTotalCopies"
            type="number"
            placeholder="Počet kusov"
            class="w-full px-4 py-2 border rounded-lg input-focus"
            :class="{ 'border-red-500': errors.totalCopies }"
          />
          <p v-if="errors.totalCopies" class="text-red-500 text-sm mt-1">
            {{ errors.totalCopies }}
          </p>
        </div>

        <div>
          <label class="block mb-2 font-semibold">Obrázok obálky</label>
          <input
            @change="handleFileChange"
            type="file"
            accept="image/*"
            class="w-full px-4 py-2 border rounded-lg"
          />
          <p v-if="errors.file" class="text-red-500 text-sm mt-1">
            {{ errors.file }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 py-2 btn-primary text-white rounded-lg"
          >
            {{
              submitting ? "Ukladanie..." : editingBook ? "Uložiť" : "Pridať"
            }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Zrušiť
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useBooksStore } from "../stores/books.js";
import { bookValidators, hasErrors } from "../validators";
import Navbar from "../components/Navbar.vue";
import Modal from "../components/Modal.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const booksStore = useBooksStore();

const books = computed(() => booksStore.books);
const loading = computed(() => booksStore.loading);
const showModal = ref(false);
const editingBook = ref(null);
const submitting = ref(false);

const form = reactive({
  title: "",
  author: "",
  isbn: "",
  year: "",
  description: "",
  totalCopies: "",
  coverImage: null,
});

const errors = reactive({
  title: "",
  author: "",
  isbn: "",
  year: "",
  description: "",
  totalCopies: "",
  file: "",
});

const validateTitle = () => {
  errors.title = bookValidators.title(form.title);
};

const validateAuthor = () => {
  errors.author = bookValidators.author(form.author);
};

const validateISBN = () => {
  errors.isbn = bookValidators.isbn(form.isbn);
};

const validateYear = () => {
  errors.year = bookValidators.year(form.year);
};

const validateDescription = () => {
  errors.description = bookValidators.description(form.description);
};

const validateTotalCopies = () => {
  errors.totalCopies = bookValidators.totalCopies(form.totalCopies);
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    errors.file = bookValidators.coverImage(file);
    form.coverImage = errors.file ? null : file;
  }
};

const loadBooks = async () => {
  try {
    await booksStore.fetchBooks();
  } catch (err) {
    alert(err.message);
  }
};

const openCreateModal = () => {
  editingBook.value = null;
  Object.keys(form).forEach((key) => (form[key] = ""));
  form.coverImage = null;
  Object.keys(errors).forEach((key) => (errors[key] = ""));
  showModal.value = true;
};

const openEditModal = (book) => {
  editingBook.value = book;
  form.title = book.title;
  form.author = book.author;
  form.isbn = book.isbn;
  form.year = book.year;
  form.description = book.description || "";
  form.totalCopies = book.totalCopies;
  form.coverImage = null;
  Object.keys(errors).forEach((key) => (errors[key] = ""));
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingBook.value = null;
};

const handleSubmit = async () => {
  validateTitle();
  validateAuthor();
  validateISBN();
  validateYear();
  validateDescription();
  validateTotalCopies();

  if (hasErrors(errors)) return;

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("isbn", form.isbn);
    formData.append("year", form.year);
    formData.append("description", form.description);
    formData.append("totalCopies", form.totalCopies);

    if (form.coverImage) {
      formData.append("coverImage", form.coverImage);
    }

    if (editingBook.value) {
      await booksStore.updateBook(editingBook.value._id, formData);
    } else {
      await booksStore.createBook(formData);
    }

    closeModal();
    await loadBooks();
  } catch (err) {
    alert(err.message);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Naozaj chcete vymazať túto knihu?")) return;

  try {
    await booksStore.deleteBook(id);
  } catch (err) {
    alert(err.message);
  }
};

onMounted(loadBooks);
</script>

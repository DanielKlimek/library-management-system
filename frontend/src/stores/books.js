import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "../services/axios.js";

export const useBooksStore = defineStore("books", () => {
  const books = ref([]);
  const currentBook = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchBooks = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      books.value = await axios.get(`/books${queryString ? `?${queryString}` : ""}`);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchBook = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      currentBook.value = await axios.get(`/books/${id}`);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBook = async (formData) => {
    loading.value = true;
    error.value = null;
    try {
      const newBook = await axios.post("/books", formData);
      books.value.push(newBook);
      return newBook;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBook = async (id, formData) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedBook = await axios.put(`/books/${id}`, formData);
      const index = books.value.findIndex((b) => b._id === id);
      if (index !== -1) {
        books.value[index] = updatedBook;
      }
      return updatedBook;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBook = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`/books/${id}`);
      books.value = books.value.filter((b) => b._id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    books,
    currentBook,
    loading,
    error,
    fetchBooks,
    fetchBook,
    createBook,
    updateBook,
    deleteBook,
  };
});

import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "../services/axios.js";

export const useReviewsStore = defineStore("reviews", () => {
  const reviews = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchReviewsByBook = async (bookId) => {
    loading.value = true;
    error.value = null;
    try {
      reviews.value = await axios.get(`/reviews/book/${bookId}`);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createReview = async (reviewData) => {
    loading.value = true;
    error.value = null;
    try {
      const newReview = await axios.post("/reviews", reviewData);
      reviews.value.push(newReview);
      return newReview;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateReview = async (id, reviewData) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedReview = await axios.put(`/reviews/${id}`, reviewData);
      const index = reviews.value.findIndex((r) => r._id === id);
      if (index !== -1) {
        reviews.value[index] = updatedReview;
      }
      return updatedReview;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteReview = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`/reviews/${id}`);
      reviews.value = reviews.value.filter((r) => r._id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    reviews,
    loading,
    error,
    fetchReviewsByBook,
    createReview,
    updateReview,
    deleteReview,
  };
});

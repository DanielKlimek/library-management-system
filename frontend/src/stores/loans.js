import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "../services/axios.js";

export const useLoansStore = defineStore("loans", () => {
  const loans = ref([]);
  const currentLoan = ref(null);
  const stats = ref(null);
  const loading = ref(false);

  const fetchLoans = async (params = {}) => {
    loading.value = true;
    try {
      const query = new URLSearchParams(params).toString();
      const data = await axios.get(`/loans${query ? `?${query}` : ""}`);
      loans.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const fetchLoan = async (id) => {
    loading.value = true;
    try {
      const data = await axios.get(`/loans/${id}`);
      currentLoan.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserLoans = async (userId) => {
    loading.value = true;
    try {
      const data = await axios.get(`/loans/user/${userId}`);
      loans.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const fetchBookLoans = async (bookId) => {
    loading.value = true;
    try {
      const data = await axios.get(`/loans/book/${bookId}`);
      loans.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const fetchLoanStats = async () => {
    loading.value = true;
    try {
      const data = await axios.get("/loans/stats");
      stats.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const createLoan = async (loanData) => {
    const data = await axios.post("/loans", loanData);
    loans.value.unshift(data);
    return data;
  };

  const updateLoan = async (id, updates) => {
    const data = await axios.put(`/loans/${id}`, updates);
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    return data;
  };

  const returnLoan = async (id) => {
    const data = await axios.post(`/loans/${id}/return`);
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    return data;
  };

  const extendLoan = async (id, days) => {
    const data = await axios.post(`/loans/${id}/extend`, { days });
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    if (currentLoan.value && currentLoan.value._id === id) {
      currentLoan.value = data;
    }
    return data;
  };

  const userReturnLoan = async (id) => {
    const data = await axios.post(`/loans/${id}/user-return`);
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    if (currentLoan.value && currentLoan.value._id === id) {
      currentLoan.value = data;
    }
    return data;
  };

  const requestExtension = async (id, days, message) => {
    const data = await axios.post(`/loans/${id}/request-extension`, { days, message });
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    if (currentLoan.value && currentLoan.value._id === id) {
      currentLoan.value = data;
    }
    return data;
  };

  const approveExtension = async (id) => {
    const data = await axios.post(`/loans/${id}/approve-extension`);
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    if (currentLoan.value && currentLoan.value._id === id) {
      currentLoan.value = data;
    }
    return data;
  };

  const rejectExtension = async (id) => {
    const data = await axios.post(`/loans/${id}/reject-extension`);
    const index = loans.value.findIndex((l) => l._id === id);
    if (index !== -1) {
      loans.value[index] = data;
    }
    if (currentLoan.value && currentLoan.value._id === id) {
      currentLoan.value = data;
    }
    return data;
  };

  const deleteLoan = async (id) => {
    await axios.delete(`/loans/${id}`);
    loans.value = loans.value.filter((l) => l._id !== id);
  };

  const userDeleteLoan = async (id) => {
    await axios.delete(`/loans/${id}/user-delete`);
    loans.value = loans.value.filter((l) => l._id !== id);
  };

  return {
    loans,
    currentLoan,
    stats,
    loading,
    fetchLoans,
    fetchLoan,
    fetchUserLoans,
    fetchBookLoans,
    fetchLoanStats,
    createLoan,
    updateLoan,
    returnLoan,
    extendLoan,
    userReturnLoan,
    requestExtension,
    approveExtension,
    rejectExtension,
    deleteLoan,
    userDeleteLoan,
  };
});

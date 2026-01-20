import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import BooksView from "../views/BooksView.vue";
import BookDetailView from "../views/BookDetailView.vue";
import AdminBooksView from "../views/AdminBooksView.vue";
import LoansView from "../views/LoansView.vue";
import LoanDetailView from "../views/LoanDetailView.vue";
import AdminLoansView from "../views/AdminLoansView.vue";

import { useAuthStore } from "../stores/auth.js";

const routes = [
  { path: "/", redirect: "/books" },
  { path: "/login", component: LoginView },
  { path: "/register", component: RegisterView },
  { path: "/books", component: BooksView, meta: { requiresAuth: true } },
  {
    path: "/books/:id",
    component: BookDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/books",
    component: AdminBooksView,
    meta: { requiresAdmin: true },
  },
  { path: "/loans", component: LoansView, meta: { requiresAuth: true } },
  {
    path: "/loans/:id",
    component: LoanDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/loans",
    component: AdminLoansView,
    meta: { requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.checkAuth();
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next("/");
  } else if (to.meta.requiresAuth && !authStore.token) {
    next("/login");
  } else {
    next();
  }
});

export default router;

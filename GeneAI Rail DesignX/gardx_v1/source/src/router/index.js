import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@stores/authStore";

// Pages
import HomePage from "@components/pages/HomePage.vue";
import LoginPage from "@components/pages/LoginPage.vue";
import EditorPage from "@components/pages/EditorPage.vue";
import NotFound from "@components/pages/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/editor/:module?",
    name: "Editor",
    component: EditorPage,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.name === "Login" && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;

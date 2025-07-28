import Login from "@/components/Authentication/Login.vue";
import Contact from "@/components/Home/Contact.vue";
import HomePage from "@/components/Home/HomePage.vue";
import NoAccess from "@/components/Layout/NoAccess.vue";
import NotFound from "@/components/Layout/NotFound.vue";
import ProductDetail from "@/components/Product/ProductDetail.vue";
import ProductList from "@/components/Product/ProductList.vue";
import { createRouter, createWebHistory } from "vue-router";

function isAdmin() {
  const isAdminUser = true;
  if (isAdminUser) {
    return true;
  }
  return { name: "noaccess" };
}

function isAuthenticated() {
  const isAuthenticatedUser = true;
  if (isAuthenticatedUser) {
    return true;
  }
  return false;
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomePage, name: "home" },
    { path: "/contact-us", component: Contact, name: "contact" },
    { path: "/contact", redirect: { name: "contact" } },
    {
      path: "/product-list",
      component: ProductList,
      name: "productList",
      beforeEnter: [isAdmin, isAuthenticated],
    },
    { path: "/login", component: Login, name: "login" },
    {
      path: "/product/:productId/:categoryId?",
      component: ProductDetail,
      name: "productDetails",
      prop: true,
    },
    { path: "/product", component: ProductDetail },
    { path: "/no-access", component: NoAccess, name: "noaccess" },
    { path: "/:catchAll(.*)", component: NotFound, name: "NotFound" },
  ],
  linkActiveClass: "active btn btn-primary",
});

router.beforeEach((to, from) => {
  console.log("Global Before Each");
  console.log("To: ", to);
  console.log("From: ", from);
  //check if user is authenticated
  //if not redirect to login page

  const isAuthenticated = true;

  if (to.name === "home") {
    return true;
  }

  if (!isAuthenticated && to.name !== "login") {
    return { name: "login" };
  }
  return true;
});

export default router;

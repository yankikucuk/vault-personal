import { createRouter, createWebHistory } from "vue-router";
import Main from "../views/MainView.vue";
import AboutView from "../views/AboutView.vue";

const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import CoursesView from "../views/CoursesView.vue";
import MyCoursesView from "../views/MyCoursesView.vue";
import AuthView from "../views/AuthView.vue";

declare module "vue-router" {
  interface RouteMeta {
    hideHeader?: boolean;
    requiresAuth?: boolean;
  }
}

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/courses",
  },
  {
    path: "/login",
    name: "login",
    component: AuthView,
    meta: { hideHeader: true },
  },
  {
    path: "/courses",
    name: "courses",
    component: CoursesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/my-courses",
    name: "my-courses",
    component: MyCoursesView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authenticated = isAuthenticated();

  if (to.meta.requiresAuth && !authenticated) {
    return { name: "login" };
  }

  if (to.name === "login" && authenticated) {
    return { name: "courses" };
  }
});

export default router;

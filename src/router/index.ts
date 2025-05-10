import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/authStore";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout.vue";

// Pages
const Dashboard = () => import("../pages/Dashboard.vue");
const Calendar = () => import("../pages/Calendar.vue");
const Fitness = () => import("../pages/Fitness.vue");
const Expenses = () => import("../pages/Expenses.vue");
const Chat = () => import("../pages/Chat.vue");
const notes = () => import("../pages/notes.vue");
const goals = () => import("../pages/goals.vue");
const Trading = () => import("../pages/Trading.vue");
const Login = () => import("../pages/Login.vue");
const Stats = () => import("../pages/stats.vue");
const Home = () => import("../pages/home.vue");
// const Register = () => import('../pages/Register.vue');

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        name: "home",
        path: "/",
        component: Home,
      },
      {
        path: "/dashboard",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "/calendar",
        name: "calendar",
        component: Calendar,
      },
      {
        path: "/fitness",
        name: "fitness",
        component: Fitness,
      },
      {
        path: "/expenses",
        name: "expenses",
        component: Expenses,
      },
      {
        path: "/chat",
        name: "chat",
        component: Chat,
      },
      {
        path: "goals",
        name: "goals",
        component: goals,
      },
      {
        path: "/notes",
        name: "notes",
        component: notes,
      },
      {
        path: "/trading",
        name: "trading",
        component: Trading,
      },
      {
        path: "/stats",
        name: "stats",
        component: Stats,
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { guest: true },
  },
  // {
  //   path: '/register',
  //   name: 'register',
  //   component: Register,
  //   meta: { guest: true },
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestRoute = to.matched.some((record) => record.meta.guest);

  if (requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (isGuestRoute && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;

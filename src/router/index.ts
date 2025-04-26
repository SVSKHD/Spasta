import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/authStore';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout.vue';

// Pages
const Dashboard = () => import('../pages/Dashboard.vue');
const Calendar = () => import('../pages/Calendar.vue');
const Fitness = () => import('../pages/Fitness.vue');
const Expenses = () => import('../pages/Expenses.vue');
const Chat = () => import('../pages/Chat.vue');
const Trading = () => import('../pages/Trading.vue');
const Login = () => import('../pages/Login.vue');
const Register = () => import('../pages/Register.vue');

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
      },
      {
        path: '/calendar',
        name: 'calendar',
        component: Calendar,
      },
      {
        path: '/fitness',
        name: 'fitness',
        component: Fitness,
      },
      {
        path: '/expenses',
        name: 'expenses',
        component: Expenses,
      },
      {
        path: '/chat',
        name: 'chat',
        component: Chat,
      },
      {
        path: '/trading',
        name: 'trading',
        component: Trading,
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { guest: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isGuestRoute = to.matched.some(record => record.meta.guest);

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (isGuestRoute && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
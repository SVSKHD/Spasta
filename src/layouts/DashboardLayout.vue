<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/authStore";
import { useDark, useToggle, useStorage } from "@vueuse/core";
import { LogOut, Menu, ChevronLeft, Sun, Moon } from "lucide-vue-next";
import SpastaGreetings from "../components/spastaGreetings.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isSidebarCollapsed = ref(false);
// const isMobileMenuOpen = ref(false);
const isDark = useDark();
const toggleDark = useToggle(isDark);
const currentTime = ref(new Date());
const timeInterval = ref<number | null>(null);
const userThemePreference = useStorage("theme-preference", "auto");

const currentUser = computed(() => authStore.user);
// const currentRouteName = computed(() => route.name);
const userName = computed(() => {
  if (!currentUser.value?.email) return "";
  return currentUser.value.email.split("@")[0];
});

const formattedTime = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(currentTime.value);
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// const toggleMobileMenu = () => {
//   isMobileMenuOpen.value = !isMobileMenuOpen.value;
// };

// const closeMobileMenu = () => {
//   isMobileMenuOpen.value = false;
// };

const handleLogout = async () => {
  await authStore.signOut();
  router.push("/login");
};

const checkAndUpdateTheme = () => {
  if (userThemePreference.value !== "auto") return;

  const hour = currentTime.value.getHours();
  if (hour >= 18 || hour < 6) {
    if (!isDark.value) {
      isDark.value = true;
    }
  } else {
    if (isDark.value) {
      isDark.value = false;
    }
  }
};

const handleThemeChange = () => {
  if (userThemePreference.value === "auto") {
    userThemePreference.value = isDark.value ? "dark" : "light";
  } else {
    toggleDark();
    userThemePreference.value = isDark.value ? "dark" : "light";
  }
};

const toggleAutoTheme = () => {
  userThemePreference.value = "auto";
  checkAndUpdateTheme();
};

watch(userThemePreference, (newValue) => {
  if (newValue === "auto") {
    checkAndUpdateTheme();
  } else {
    isDark.value = newValue === "dark";
  }
});

onMounted(() => {
  // Update time every second
  timeInterval.value = window.setInterval(() => {
    currentTime.value = new Date();
    checkAndUpdateTheme();
  }, 1000);

  // Initial theme check
  checkAndUpdateTheme();
});

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value);
  }
});

const navigation = [
  { name: "Dashboard", path: "/", icon: "📋" },
  { name: "Calendar", path: "/calendar", icon: "🗓️" },
  { name: "Fitness", path: "/fitness", icon: "🏋️" },
  { name: "Expenses", path: "/expenses", icon: "💸" },
  { name: "Trading", path: "/trading", icon: "📈" },
  { name: "Notes", path: "/notes", icon: "📝" },
  { name: "Chat", path: "/chat", icon: "💬" },
];
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen flex flex-col">
    <!-- Top Navigation Bar -->
    <header class="bg-card shadow-sm z-10 border-b border-border">
      <div class="px-6">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Sidebar Toggle -->
            <button
              @click="toggleSidebar"
              type="button"
              class="p-2 rounded-md text-text/60 hover:text-text hover:bg-bg focus:outline-none"
            >
              <Menu v-if="isSidebarCollapsed" class="w-5 h-5" />
              <ChevronLeft v-else class="w-5 h-5" />
            </button>

            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center ml-4">
              <span class="text-xl font-bold text-primary-500"
                >spasta.online</span
              >
            </div>
          </div>

          <!-- Right side controls -->
          <div class="flex items-center space-x-4">
            <!-- Current Time -->
            <div class="text-text font-mono">
              {{ formattedTime }}
            </div>

            <!-- Theme Controls -->
            <div class="flex items-center space-x-2">
              <button
                @click="handleThemeChange"
                class="p-2 rounded-md text-text/60 hover:text-text hover:bg-bg focus:outline-none"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <Sun v-if="isDark" class="w-5 h-5" />
                <Moon v-else class="w-5 h-5" />
              </button>
              <button
                @click="toggleAutoTheme"
                class="text-xs px-2 py-1 rounded-md"
                :class="
                  userThemePreference === 'auto'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-text/60 hover:text-text hover:bg-bg'
                "
              >
                Auto
              </button>
            </div>

            <!-- User Menu -->
            <div class="relative">
              <div class="flex items-center space-x-3">
                <div
                  class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700"
                >
                  {{ currentUser?.email?.charAt(0).toUpperCase() || "U" }}
                </div>
                <button
                  @click="handleLogout"
                  class="flex items-center space-x-2 px-3 py-2 text-sm text-text/60 hover:text-text hover:bg-bg rounded-md"
                >
                  <LogOut class="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div
        class="bg-card border-r border-border transition-all duration-300"
        :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
      >
        <nav class="mt-5 px-2 space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.path"
            :class="[
              route.path === item.path
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-100'
                : 'text-text/60 hover:bg-bg hover:text-text',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
            ]"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span
              v-if="!isSidebarCollapsed"
              class="ml-3 transition-opacity duration-300"
            >
              {{ item.name }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- Main Content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none bg-bg">
        <div class="h-full">
          <div class="h-full p-6">
            <SpastaGreetings :user-name="userName" class="mb-6" />
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-100;
}
</style>

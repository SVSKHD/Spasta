<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { useDark, useToggle } from '@vueuse/core';
import { LogOut, Menu, ChevronLeft, Sun, Moon } from 'lucide-vue-next';
import SpastaGreetings from '../components/spastaGreetings.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isSidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const isDark = useDark();
const toggleDark = useToggle(isDark);

const currentUser = computed(() => authStore.user);
const currentRouteName = computed(() => route.name);
const userName = computed(() => {
  if (!currentUser.value?.email) return '';
  return currentUser.value.email.split('@')[0];
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = async () => {
  await authStore.signOut();
  router.push('/login');
};

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📋' },
  { name: 'Calendar', path: '/calendar', icon: '🗓️' },
  { name: 'Fitness', path: '/fitness', icon: '🏋️' },
  { name: 'Expenses', path: '/expenses', icon: '💸' },
  { name: 'Trading', path: '/trading', icon: '📈' },
  { name: 'Chat', path: '/chat', icon: '💬' },
];
</script>

<template>
  <div :class="{ 'dark': isDark }" class="min-h-screen flex flex-col">
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
              <span class="text-xl font-bold text-primary-500">spasta.io</span>
            </div>
          </div>
          
          <!-- Right side controls -->
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button 
              @click="toggleDark()"
              class="p-2 rounded-md text-text/60 hover:text-text hover:bg-bg focus:outline-none"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <Sun v-if="isDark" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
            </button>

            <!-- User Menu -->
            <div class="relative">
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
                  {{ currentUser?.email?.charAt(0).toUpperCase() || 'U' }}
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
              route.path === item.path ? 'bg-primary-50 text-primary-700' : 'text-text/60 hover:bg-bg hover:text-text',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
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
  @apply bg-primary-50 text-primary-700;
}
</style>
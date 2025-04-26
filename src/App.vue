<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './store/authStore';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  // Initialize auth state listener
  authStore.initAuthListener();
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
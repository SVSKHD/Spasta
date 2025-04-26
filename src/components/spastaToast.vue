<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useToastStore } from '../store/toastStore';

const toastStore = useToastStore();
const isVisible = ref(false);
const timeout = ref<number | null>(null);
const TOAST_DURATION = 3000; // Default duration in milliseconds

const showToast = () => {
  isVisible.value = true;
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
  timeout.value = window.setTimeout(() => {
    isVisible.value = false;
    toastStore.clearMessage();
  }, TOAST_DURATION);
};

watch(() => toastStore.message, (newMessage) => {
  if (newMessage) {
    showToast();
  }
});

onMounted(() => {
  if (toastStore.message) {
    showToast();
  }
});

onUnmounted(() => {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
});
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible && toastStore.message"
      class="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <div 
        class="rounded-lg shadow-lg p-4 flex items-center space-x-4"
        :class="{
          'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-100': toastStore.type === 'success',
          'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-100': toastStore.type === 'error',
          'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-100': toastStore.type === 'warning',
          'bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-100': toastStore.type === 'info'
        }"
      >
        <span class="text-xl">
          {{ toastStore.type === 'success' ? '✅' : 
             toastStore.type === 'error' ? '❌' : 
             toastStore.type === 'warning' ? '⚠️' : 'ℹ️' }}
        </span>
        <div class="flex-1">{{ toastStore.message }}</div>
        <button
          @click="isVisible = false"
          class="ml-4 text-current opacity-50 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>
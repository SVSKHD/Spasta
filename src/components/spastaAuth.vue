<script setup lang="ts">
import { ref } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { Mail, AlertCircle, LogIn } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "emailAuth", email: string): void;
  (e: "googleAuth"): void;
}>();

const isLoading = ref(false);
const email = ref("demo@spasta.online"); // Pre-filled demo email

const handleEmailAuth = async () => {
  if (!email.value) return;
  isLoading.value = true;
  try {
    await emit("emailAuth", email.value);
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleAuth = async () => {
  isLoading.value = true;
  try {
    await emit("googleAuth");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div
      class="fixed inset-0 bg-black/30 dark:bg-black/50"
      aria-hidden="true"
    />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl"
      >
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            spasta.online
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your all-in-one productivity suite
          </p>
        </div>

        <DialogTitle
          class="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100"
        >
          Sign in to your account
        </DialogTitle>

        <div
          v-if="props.errorMessage"
          class="mb-4 p-3 bg-error-100 dark:bg-error-700 text-error-700 dark:text-error-200 rounded-md flex items-center"
        >
          <AlertCircle class="w-5 h-5 mr-2" />
          {{ props.errorMessage }}
        </div>

        <form @submit.prevent="handleEmailAuth" class="space-y-4 mb-4">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Email</label
            >
            <div class="mt-1 relative">
              <Mail
                class="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="input pl-10 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder="your@email.com"
                :disabled="isLoading"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Use demo@spasta.io to try out the app
            </p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full flex items-center justify-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:text-gray-100"
            :disabled="isLoading"
          >
            <LogIn v-if="!isLoading" class="w-5 h-5 mr-2" />
            <span>{{
              isLoading ? "Signing in..." : "Continue with Email"
            }}</span>
          </button>
        </form>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div
              class="w-full border-t border-gray-300 dark:border-gray-600"
            ></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span
              class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              >Or</span
            >
          </div>
        </div>

        <div class="mt-4">
          <button
            type="button"
            @click="handleGoogleAuth"
            class="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              class="w-5 h-5 mr-2"
            />
            {{ isLoading ? "Signing in..." : "Continue with Google" }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

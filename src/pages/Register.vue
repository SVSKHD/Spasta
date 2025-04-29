<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import SpastaAuth from "../components/spastaAuth.vue";

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);
const errorMessage = ref("");
const isOpen = ref(true);

const handleRegister = async (email: string) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await authStore.signInWithEmail(email);
    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to register";
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await authStore.signInWithGoogle();
    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to login with Google";
  } finally {
    isLoading.value = false;
  }
};

const handleClose = () => {
  isOpen.value = false;
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Create an account
        </h2>
      </div>

      <SpastaAuth
        :is-open="isOpen"
        :error-message="errorMessage"
        @close="handleClose"
        @email-auth="handleRegister"
        @google-auth="handleGoogleLogin"
      />

      <div class="text-center">
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

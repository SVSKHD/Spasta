<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import SpastaAuth from "../components/spastaAuth.vue";

const router = useRouter();
const authStore = useAuthStore();
const showAuthDialog = ref(true);
const errorMessage = ref("");

const handleEmailAuth = async (email: string) => {
  try {
    await authStore.signInWithEmail(email);
    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to login";
  }
};

const handleGoogleAuth = async () => {
  try {
    await authStore.signInWithGoogle();
    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to login with Google";
  }
};

const closeDialog = () => {
  showAuthDialog.value = false;
  router.push("/");
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <SpastaAuth
      :is-open="showAuthDialog"
      :error-message="errorMessage"
      @close="closeDialog"
      @emailAuth="handleEmailAuth"
      @googleAuth="handleGoogleAuth"
    />
  </div>
</template>

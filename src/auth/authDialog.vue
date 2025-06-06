<template>
  <spasta-dialog v-model="isOpen" size="large">
    <form @submit.prevent="handleSignIn">
      <spasta-button
        color="teal"
        icon="fab fa-google"
        type="submit"
        label="Google Sign In"
        :fullWidth="true"
        class="mt-4"
        @click="handleGmailSignIn"
      />
    </form>
  </spasta-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import { useAuthStore } from "../store/authStore";

// Props
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "signIn", email: string): void;
}>();

// Reactive state
const email = ref("");
const emailError = ref(false);

// v-model logic
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Email validation
const isEmailValid = computed(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.value);
});

// Watcher for error toggle
watch(email, (val) => {
  emailError.value = !isEmailValid.value && val.length > 0;
});

// Handle sign-in
function handleSignIn() {
  if (isEmailValid.value) {
    emit("signIn", email.value);
    isOpen.value = false;
  }
}

const isLoading = ref(false);
const handleGmailSignIn = async () => {
  isLoading.value = true;
  try {
    const authStore = useAuthStore();
    await authStore.signInWithGoogle();
    isOpen.value = false; // Close the dialog on successful sign-in
  } catch (error) {
    console.error("Google Sign-In failed", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

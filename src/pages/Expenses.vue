<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useExpenseStore } from "../store/expenseStore";
import { useAuthStore } from "../store/authStore";
import SpastaExpenses from "../components/spastaExpenses.vue";

const expenseStore = useExpenseStore();
const authStore = useAuthStore();
const isLoading = ref(true);

const expenses = computed(() => expenseStore.expenses);

onMounted(async () => {
  if (!authStore.user?.id) {
    isLoading.value = false;
    return;
  }

  try {
    await expenseStore.fetchExpenses();
  } catch (error) {
    console.error("Error fetching expenses:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
      ></div>
    </div>

    <div v-else-if="!authStore.user?.id" class="text-center text-gray-600">
      Please log in to view your expenses.
    </div>

    <div v-else>
      <SpastaExpenses :expenses="expenses" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFitnessStore } from '../store/fitnessStore';
import { useAuthStore } from '../store/authStore';
import SpastaFitness from '../components/spastaFitness.vue';

const fitnessStore = useFitnessStore();
const authStore = useAuthStore();
const isLoading = ref(false);
const error = ref('');

const workouts = computed(() => fitnessStore.workouts);

onMounted(async () => {
  if (!authStore.user) {
    error.value = 'Please log in to view your workouts';
    return;
  }

  try {
    isLoading.value = true;
    await fitnessStore.fetchWorkouts();
    error.value = '';
  } catch (err) {
    console.error('Error fetching workouts:', err);
    error.value = 'Failed to load workouts. Please try again.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text mb-6">Fitness Tracker</h1>
    
    <div v-if="error" class="text-center text-error-600 dark:text-error-400 p-4">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <div v-else>
      <SpastaFitness :workouts="workouts" />
    </div>
  </div>
</template>
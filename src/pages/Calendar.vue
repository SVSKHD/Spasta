<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useTaskStore } from "../store/taskStore";
import SpastaCalendar from "../components/spastaCalendar.vue";

const taskStore = useTaskStore();
const isLoading = ref(true);

const tasks = computed(() => taskStore.tasks);

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Calendar View</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
      ></div>
    </div>

    <div v-else>
      <SpastaCalendar :tasks="tasks" />
    </div>
  </div>
</template>

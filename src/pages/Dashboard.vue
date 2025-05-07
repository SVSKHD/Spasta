<template>
  <div>
    <h1 class="text-2xl font-bold text-text mb-6">Task Dashboard</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
      ></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Categories List - Horizontal Scrolling -->
      <div class="flex justify-end mb-4">
  <button
    @click="toggleSummary"
    class="text-sm text-primary-600 hover:underline flex items-center gap-2"
    :disabled="isSummaryLoading"
  >
    <span>{{ showSummary ? "Hide Summary ▲" : "Show Summary ▼" }}</span>
    <svg
      v-if="isSummaryLoading"
      class="w-4 h-4 animate-spin text-primary-600"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  </button>
</div>

      <Transition name="fade">
        <div v-if="showSummary">
          <!-- Categories List -->
          <div
            class="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary-200 scrollbar-track-transparent"
          >
            <div class="flex space-x-4 min-w-max">
              <SpastaCategoryList
                :categories="categories"
                :selected-category-id="selectedCategoryId"
                @selectCategory="handleSelectCategory"
                class="w-full"
              />
            </div>
          </div>

          <!-- Stats Cards -->
          <div
            v-if="selectedCategory"
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <!-- Overall Progress -->
            <div class="card bg-primary-500/10 dark:bg-primary-500/20">
              <div class="flex items-center justify-between mb-2">
                <h3
                  class="text-sm font-medium text-primary-700 dark:text-primary-300"
                >
                  Overall Progress
                </h3>
                <span
                  class="text-xl font-bold text-primary-700 dark:text-primary-300"
                  >{{ taskStats.progress }}%</span
                >
              </div>
              <div
                class="w-full bg-primary-200 dark:bg-primary-700/50 rounded-full h-2"
              >
                <div
                  class="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${taskStats.progress}%` }"
                ></div>
              </div>
            </div>

            <!-- Time Tracking -->
            <div class="card bg-success-500/10 dark:bg-success-500/20">
              <h3
                class="text-sm font-medium text-success-700 dark:text-success-300 mb-2"
              >
                Time Spent
              </h3>
              <div class="text-xl font-bold text-success-700 dark:text-success-300">
                {{ taskStats.totalHours }}h
                <span
                  class="text-sm font-normal text-success-600 dark:text-success-300"
                >
                  / {{ taskStats.estimatedHours }}h est.
                </span>
              </div>
            </div>

            <!-- Priority Distribution -->
            <div class="card bg-warning-500/10 dark:bg-warning-500/20">
              <h3
                class="text-sm font-medium text-warning-700 dark:text-warning-300 mb-2"
              >
                Priority Tasks
              </h3>
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-warning-700 dark:text-warning-300"
                    >High</span
                  >
                  <span
                    class="font-bold text-warning-700 dark:text-warning-300"
                    >{{ taskStats.byPriority.high }}</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-warning-700 dark:text-warning-300"
                    >Medium</span
                  >
                  <span
                    class="font-bold text-warning-700 dark:text-warning-300"
                    >{{ taskStats.byPriority.medium }}</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-warning-700 dark:text-warning-300"
                    >Low</span
                  >
                  <span
                    class="font-bold text-warning-700 dark:text-warning-300"
                    >{{ taskStats.byPriority.low }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Flow Distribution -->
            <div class="card bg-info-500/10 dark:bg-info-500/20">
              <h3
                class="text-sm font-medium text-warning-700 dark:text-warning-300 mb-2"
              >
                Task Distribution
              </h3>
              <div class="space-y-1">
                <div
                  v-for="flow in selectedCategory.flows"
                  :key="flow.id"
                  class="flex justify-between items-center"
                >
                  <span class="text-sm text-warning-700 dark:text-warning-300">{{
                    flow.name
                  }}</span>
                  <span
                    class="font-bold text-warning-700 dark:text-warning-300"
                    >{{ taskStats.byFlow[flow.id] || 0 }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <div
        class="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary-200 scrollbar-track-transparent"
      ></div>

      <!-- Task Statistics -->

      <!-- Task Board -->
      <div class="w-full">
        <SpastaTaskBoard
          v-if="selectedCategory"
          @refresh="refreshTasks"
          :category="selectedCategory"
          :tasks="filteredTasks"
        />
        <div v-else class="card text-center">
          <p class="text-text/60">
            Select or create a category to manage tasks
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import { useCategoryStore, type Category } from "../store/categoryStore";
import {useSubTaskStore} from "../store/subTaskStore"
import { useTaskStore, type Task } from "../store/taskStore";
import SpastaCategoryList from "../components/spastaCategoryList.vue";
import SpastaTaskBoard from "../components/spastaTaskBoard.vue";

const router = useRouter();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const subTaskStore = useSubTaskStore();
const taskStore = useTaskStore();

const isLoading = ref(true);
const showSummary = ref(true); 
const isSummaryLoading = ref(false);

const selectedCategoryId = ref<string>("");

const categories = computed<Category[]>(() =>
  categoryStore.categories.sort((a, b) => a.name.localeCompare(b.name)),
);

const selectedCategory = computed<Category | undefined>(() => {
  return categories.value.find((cat) => cat.id === selectedCategoryId.value);
});

const allTasks = computed<Task[]>(() => {
  return taskStore.tasks.map((t) => {
    if ((t as any).data) {
      const { data, id, userId, createdAt, updatedAt } = t as any;
      return { id, userId, createdAt, updatedAt, ...(data as object) } as Task;
    }
    return t;
  });
});

const filteredTasks = computed<Task[]>(() => {
  if (!selectedCategoryId.value) return [];
  return allTasks.value.filter(
    (t) => t.categoryId === selectedCategoryId.value,
  );
});

const taskStats = computed(() => {
  const stats = {
    total: filteredTasks.value.length,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0,
    },
    byFlow: {} as Record<string, number>,
    totalHours: 0,
    estimatedHours: 0,
    progress: 0,
  };

  filteredTasks.value.forEach((task) => {
    stats.byPriority[task.priority]++;

    if (!stats.byFlow[task.flowId]) {
      stats.byFlow[task.flowId] = 0;
    }
    stats.byFlow[task.flowId]++;

    stats.totalHours += (task.timeEntries || []).reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );
    stats.estimatedHours += task.estimatedHours || 0;

    stats.progress += task.progress || 0;
  });

  stats.progress = stats.total ? Math.round(stats.progress / stats.total) : 0;

  return stats;
});

function handleSelectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId;
}

function toggleSummary() {
  isSummaryLoading.value = true;
  setTimeout(() => {
    showSummary.value = !showSummary.value;
    isSummaryLoading.value = false;
  }, 500); // simulate loading
}

async function refreshTasks() {
  await subTaskStore.fetchSubTasks();
  await taskStore.fetchTasks();
}

defineExpose({ refreshTasks });

onMounted(async () => {
  if (!authStore.user) {
    return router.push("/login");
  }
  try {
    await categoryStore.fetchCategories();
    await refreshTasks();
    if (categories.value.length) {
      selectedCategoryId.value = categories.value[0].id;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(var(--color-primary-200));
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--color-primary-300));
}
</style>

<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">🎯 Goals Tracker</h1>

    <div class="flex gap-4 mb-4">
      <input
        v-model="newCategory"
        type="text"
        placeholder="Add category"
        class="input flex-1"
      />
      <button
        class="btn transition-transform duration-200 active:scale-95 disabled:opacity-50"
        :disabled="isCategoryLoading"
        @click="createGoalCategory"
      >
        <span v-if="!isCategoryLoading">+ Category</span>
        <svg
          v-else
          class="w-5 h-5 animate-spin text-white"
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

    <div class="flex overflow-x-auto gap-4 mb-6 pb-2 border-b">
      <div
        v-for="category in goalCategories"
        :key="category"
        class="px-4 py-2 bg-gray-100 rounded cursor-pointer whitespace-nowrap"
        :class="{ 'bg-blue-500 text-white': selectedCategory === category }"
        @click="selectCategory(category)"
      >
        {{ category }}
      </div>
    </div>

    <div class="flex justify-end mb-4">
      <button
        class="btn transition-transform duration-200 active:scale-95"
        :disabled="!selectedCategory"
        @click="openDialog(selectedCategory)"
      >
        + Add Goal
      </button>
    </div>

    <div v-if="selectedCategory" class="mt-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Goals in {{ selectedCategory }}</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="(goalItem, i) in goalsMap[selectedCategory]"
          :key="i"
          class="p-4 rounded shadow bg-white border-l-4 flex items-start gap-2"
          :class="{
            'border-red-500': goalItem.priority === 'high',
            'border-yellow-500': goalItem.priority === 'medium',
            'border-green-500': goalItem.priority === 'low',
          }"
        >
          <input type="checkbox" v-model="goalItem.completed" class="mt-1" />
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3
                class="font-bold"
                :class="{ 'line-through text-gray-500': goalItem.completed }"
              >
                {{ goalItem.title }}
              </h3>
              <span
                class="text-xs px-2 py-1 rounded-full text-white"
                :class="{
                  'bg-red-500': goalItem.priority === 'high',
                  'bg-yellow-500': goalItem.priority === 'medium',
                  'bg-green-500': goalItem.priority === 'low',
                }"
              >
                {{ goalItem.priority }}
              </span>
            </div>
            <p
              class="text-sm mt-1 text-gray-600"
              :class="{ 'line-through text-gray-400': goalItem.completed }"
            >
              {{ goalItem.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <transition name="fade-dialog">
  <div
    v-if="showDialog"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-xl scale-in">
      <h2 class="text-xl font-bold mb-4">Add Goal to {{ selectedCategory }}</h2>
      <input
        v-model="goalTitle"
        placeholder="Goal title"
        class="input mb-3 w-full"
      />
      <textarea
        v-model="goalDescription"
        placeholder="Goal description"
        class="input mb-3 w-full"
        rows="2"
      ></textarea>
      <select v-model="goalPriority" class="input mb-4 w-full">
        <option disabled value="">Select priority</option>
        <option value="high">🔥 High</option>
        <option value="medium">🌟 Medium</option>
        <option value="low">✅ Low</option>
      </select>
      <div class="flex justify-end gap-2">
        <button class="btn bg-gray-200 text-gray-700" @click="closeDialog">
          Cancel
        </button>
        <button
          class="btn transition-transform duration-200 active:scale-95 disabled:opacity-50"
          :disabled="isGoalAdding"
          @click="addGoal"
        >
          <span v-if="!isGoalAdding">Add Goal</span>
          <svg
            v-else
            class="w-5 h-5 animate-spin text-white"
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
    </div>
  </div>
</transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {useGoalCategoryStore} from "../store/goalStore"


const store = useGoalCategoryStore();

const newCategory = ref("");
const selectedCategory = ref("");
const goalTitle = ref("");
const goalDescription = ref("");
const goalPriority = ref<"high" | "medium" | "low" | "">("");

const showDialog = ref(false);
const isCategoryLoading = ref(false);
const isGoalAdding = ref(false);

const goalsMap = ref<Record<string, { title: string; description: string; priority: 'high' | 'medium' | 'low' }[]>>({});

const goalCategories = computed(() => store.categories.map((c) => c.name));

// Load categories and goals on mount
onMounted(async () => {
  await store.fetchCategories();
  await store.fetchGoals();

  // Group goals by category name
  const grouped: Record<string, { title: string; description: string; priority: "high" | "medium" | "low" }[]> = {};
  for (const category of store.categories) {
    grouped[category.name] = store.goals
      .filter((goal) => goal.categoryId === category.id)
      .map((goal) => ({
        title: goal.title,
        description: goal.description || "",
        priority: goal.priority || "medium",
      }));
  }
  goalsMap.value = grouped;
});

// ─── CATEGORY ──────────────────────────────────────
const createGoalCategory = async () => {
  if (!newCategory.value.trim()) return;
  isCategoryLoading.value = true;
  try {
    await store.addCategory(newCategory.value.trim());
    newCategory.value = "";
    await store.fetchCategories(); // refresh
  } finally {
    isCategoryLoading.value = false;
  }
};

// ─── GOALS ─────────────────────────────────────────
const openDialog = (category: string) => {
  selectedCategory.value = category;
  showDialog.value = true;
};

const selectCategory = (category: string) => {
  selectedCategory.value = category;
};

const closeDialog = () => {
  showDialog.value = false;
  goalTitle.value = "";
  goalDescription.value = "";
  goalPriority.value = "";
};

const addGoal = async () => {
  if (!selectedCategory.value || !goalTitle.value || !goalPriority.value) return;

  isGoalAdding.value = true;
  try {
    const category = store.categories.find((c) => c.name === selectedCategory.value);
    if (!category) return;

    await store.addGoal({
      title: goalTitle.value,
      description: goalDescription.value,
      categoryId: category.id,
      priority: goalPriority.value,
      checklist: [],
    });

    closeDialog();
    await store.fetchGoals();

    // Remap goals after adding
    const updatedGoals = store.goals.filter((g) => g.categoryId === category.id);
    goalsMap.value[selectedCategory.value] = updatedGoals.map((goal) => ({
      title: goal.title,
      description: goal.description || "",
      priority: goal.priority || "medium",
    }));
  } finally {
    isGoalAdding.value = false;
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border border-gray-300 rounded w-full;
}
.btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
}
</style>
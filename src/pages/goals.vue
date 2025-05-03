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
        class="flex items-center gap-2"
      >
        <div
          class="px-4 py-2 bg-gray-100 rounded cursor-pointer whitespace-nowrap"
          :class="{ 'bg-blue-500 text-white': selectedCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </div>
        <button
          @click="deleteCategory(category)"
          class="flex items-center justify-center w-6 h-6 rounded-full text-white bg-red-500 hover:bg-red-600 transition duration-200"
        >
          <svg v-if="deletingCategory === category" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span v-else class="text-xs">×</span>
        </button>
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

    <transition name="fade">
      <div v-if="selectedCategory" class="mt-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Goals in {{ selectedCategory }}</h2>
        <transition-group name="goal-list" tag="div" class="grid md:grid-cols-2 gap-6">
          <div
            v-for="goalItem in goalsMap[selectedCategory]"
            :key="goalItem.title"
            class="p-4 rounded shadow bg-white border-l-4 flex items-start gap-2"
            :class="{
              'border-red-500': goalItem.priority === 'high',
              'border-yellow-500': goalItem.priority === 'medium',
              'border-green-500': goalItem.priority === 'low',
            }"
          >
            <label class="switch mt-1">
              <input
                type="checkbox"
                v-model="goalItem.completed"
                @change="toggleGoalCompletion(goalItem.title)"
              />
              <span class="slider"></span>
            </label>
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
            <button
              @click="deleteGoal(goalItem.title)"
              class="flex items-center justify-center w-6 h-6 rounded-full text-white bg-red-400 hover:bg-red-500 transition duration-200 ml-2"
            >
              <svg v-if="deletingGoal === goalItem.title" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span v-else class="text-xs">×</span>
            </button>
            <button
              @click="startEditingGoal(goalItem)"
              class="flex items-center justify-center w-6 h-6 rounded-full text-white bg-yellow-400 hover:bg-yellow-500 transition duration-200 ml-2"
            >
              ✏️
            </button>
          </div>
        </transition-group>
      </div>
    </transition>

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

<transition name="fade-dialog">
  <div
    v-if="editingGoalTitle"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-xl scale-in">
      <h2 class="text-xl font-bold mb-4">Edit Goal</h2>
      <input v-model="editTitle" placeholder="Goal title" class="input mb-3 w-full" />
      <textarea v-model="editDescription" placeholder="Goal description" class="input mb-3 w-full" rows="2"></textarea>
      <select v-model="editPriority" class="input mb-4 w-full">
        <option disabled value="">Select priority</option>
        <option value="high">🔥 High</option>
        <option value="medium">🌟 Medium</option>
        <option value="low">✅ Low</option>
      </select>
      <div class="flex justify-end gap-2">
        <button class="btn bg-gray-200 text-gray-700" @click="cancelEdit">Cancel</button>
        <button
          class="btn transition-transform duration-200 active:scale-95 disabled:opacity-50"
          :disabled="isGoalUpdating"
          @click="submitEdit"
        >
          <span v-if="!isGoalUpdating">Update Goal</span>
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

const deletingCategory = ref<string | null>(null);
const deletingGoal = ref<string | null>(null);

const goalsMap = ref<Record<string, {
  completed: any; title: string; description: string; priority: 'high' | 'medium' | 'low' 
}[]>>({});

const goalCategories = computed(() => store.categories.map((c) => c.name));

// New reactive refs for editing
const editingGoalTitle = ref<string | null>(null);
const editTitle = ref("");
const editDescription = ref("");
const editPriority = ref<"high" | "medium" | "low" | "">("");
const isGoalUpdating = ref(false);

// Load categories and goals on mount
onMounted(async () => {
  await store.fetchCategories();
  await store.fetchGoals();

  // Group goals by category name
  const grouped: Record<string, { completed: boolean; title: string; description: string; priority: "high" | "medium" | "low" }[]> = {};
  for (const category of store.categories) {
    grouped[category.name] = store.goals
      .filter((goal) => goal.categoryId === category.id)
      .map((goal) => ({
        completed: goal.completed ?? false,
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

const deleteCategory = async (categoryName: string) => {
  const category = store.categories.find(c => c.name === categoryName);
  if (!category) return;
  deletingCategory.value = categoryName;
  try {
    await store.deleteCategory(category.id);
    await store.fetchCategories();
    await store.fetchGoals();
    const updated: Record<string, typeof goalsMap.value[string]> = {};
    for (const c of store.categories) {
      updated[c.name] = store.goals.filter(g => g.categoryId === c.id).map(g => ({
        completed: g.completed ?? false,
        title: g.title,
        description: g.description || "",
        priority: g.priority || "medium",
      }));
    }
    goalsMap.value = updated;
    if (selectedCategory.value === categoryName) selectedCategory.value = "";
  } finally {
    deletingCategory.value = null;
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

    // Immediately update goalsMap to show new goal
    const newGoal = {
      completed: false,
      title: goalTitle.value,
      description: goalDescription.value,
      priority: goalPriority.value,
    };
    if (!goalsMap.value[selectedCategory.value]) {
      goalsMap.value[selectedCategory.value] = [];
    }
    goalsMap.value[selectedCategory.value].push(newGoal);

    closeDialog();
    await store.fetchGoals();

    // Remap goals after adding
    const updatedGoals = store.goals.filter((g) => g.categoryId === category.id);
    goalsMap.value[selectedCategory.value] = updatedGoals.map((goal) => ({
      completed: goal.completed ?? false,
      title: goal.title,
      description: goal.description || "",
      priority: goal.priority || "medium",
    }));
  } finally {
    isGoalAdding.value = false;
  }
};

const deleteGoal = async (goalTitleToDelete: string) => {
  const category = store.categories.find(c => c.name === selectedCategory.value);
  if (!category) return;
  const goal = store.goals.find(g => g.categoryId === category.id && g.title === goalTitleToDelete);
  if (!goal) return;
  deletingGoal.value = goalTitleToDelete;
  try {
    await store.deleteGoal(goal.id);
    await store.fetchGoals();
    goalsMap.value[selectedCategory.value] = store.goals.filter(g => g.categoryId === category.id).map(g => ({
      completed: g.completed ?? false,
      title: g.title,
      description: g.description || "",
      priority: g.priority || "medium",
    }));
  } finally {
    deletingGoal.value = null;
  }
};

const toggleGoalCompletion = async (goalTitle: string) => {
  const category = store.categories.find(c => c.name === selectedCategory.value);
  if (!category) return;
  // Find the goal in the store (source of truth)
  const goal = store.goals.find(g => g.categoryId === category.id && g.title === goalTitle);
  if (!goal) return;

  const newCompletedStatus = !goal.completed;
  goal.completed = newCompletedStatus;
  await store.updateGoalCompleted(goal.id, newCompletedStatus);
};

// New functions for editing goals
const startEditingGoal = (goal: any) => {
  editingGoalTitle.value = goal.title;
  editTitle.value = goal.title;
  editDescription.value = goal.description;
  editPriority.value = goal.priority;
};

const cancelEdit = () => {
  editingGoalTitle.value = null;
};

const submitEdit = async () => {
  if (!selectedCategory.value || !editingGoalTitle.value) return;
  const category = store.categories.find(c => c.name === selectedCategory.value);
  if (!category) return;
  const goal = store.goals.find(g => g.categoryId === category.id && g.title === editingGoalTitle.value);
  if (!goal) return;

  isGoalUpdating.value = true;
  try {
    await store.updateGoal(goal.id, {
      title: editTitle.value,
      description: editDescription.value,
      priority: editPriority.value || undefined,
    });

    await store.fetchGoals();
    const updatedGoals = store.goals.filter((g) => g.categoryId === category.id);
    goalsMap.value[selectedCategory.value] = updatedGoals.map((goal) => ({
      completed: goal.completed ?? false,
      title: goal.title,
      description: goal.description || "",
      priority: goal.priority || "medium",
    }));
    editingGoalTitle.value = null;
  } finally {
    isGoalUpdating.value = false;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.goal-list-enter-active,
.goal-list-leave-active {
  transition: all 0.3s ease;
}
.goal-list-enter-from,
.goal-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
.switch input:checked + .slider {
  background-color: #4ade80;
}
.switch input:checked + .slider:before {
  transform: translateX(14px);
}
</style>
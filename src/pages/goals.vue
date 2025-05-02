<template>
  <div class="container max-w-3xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">🎯 Goals Tracker</h1>

    <!-- Grid Inputs -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <input
        v-model="newCategory"
        type="text"
        placeholder="Add category"
        class="input col-span-2"
      />
      <button class="btn w-full" @click="createGoalCategory">+ Category</button>
    </div>

    <!-- Category Sections -->
    <div v-for="category in goalCategories" :key="category" class="mb-8">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-semibold text-blue-700">{{ category }}</h2>
        <button class="text-sm text-blue-500 hover:underline" @click="openDialog(category)">
          + Add Goal
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
  <div
    v-for="(goalItem, i) in goalsMap[category]"
    :key="i"
    class="p-4 rounded shadow bg-white border-l-4 flex items-start gap-2"
    :class="{
      'border-red-500': goalItem.priority === 'high',
      'border-yellow-500': goalItem.priority === 'medium',
      'border-green-500': goalItem.priority === 'low',
    }"
  >
    <input
      type="checkbox"
      v-model="goalItem.completed"
      class="mt-1"
    />

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
    <div
      v-if="showDialog"
      class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
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
          <button class="btn" @click="addGoal">Add Goal</button>
        </div>
      </div>
    </div>
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
  await store.addCategory(newCategory.value.trim());
  newCategory.value = "";
  await store.fetchCategories(); // refresh
};

// ─── GOALS ─────────────────────────────────────────
const openDialog = (category: string) => {
  selectedCategory.value = category;
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  goalTitle.value = "";
  goalDescription.value = "";
  goalPriority.value = "";
};

const addGoal = async () => {
  if (!selectedCategory.value || !goalTitle.value || !goalPriority.value) return;

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
};
</script>

<style scoped>
.input {
  @apply p-2 border border-gray-300 rounded;
}
.btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
}
</style>
<template>
 
  <SpastaCategoryPanel
    :tabs="categories"
    @select-category="handleCategorySelect"
  />
  <div class="row">
    <div v-for="(item, index) in flow" :key="index" class="col-3 q-pa-md">
    <q-card class="task-rack">
      <q-card class="task-card">
        <q-card-section class="text-white">
          <div class="text-h6">{{ item.name }}-{{ item.id }}</div>
          <div class="text-subtitle2">{{ item }}</div>
        </q-card-section>
      </q-card>
      </q-card> 
    </div>
  </div>
  {{ filteredTasks.length }} tasks in this category
</template>

<script setup lang="ts">
import SpastaCategoryPanel from "./categoryPanel.vue";
import { ref, onMounted, computed } from "vue";
import { useTaskStore, type Task } from "../../store/taskStore";
import { useCategoryStore, type Category } from "../../store/categoryStore";
import { useAuthStore } from "../../store/authStore";
import { useSubTaskStore } from "../../store/subTaskStore";
import { useRouter } from "vue-router";

const router = useRouter();
const taskStore = useTaskStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const subTaskStore = useSubTaskStore();
const selectedCategoryId = ref<string | null>(null);
import type { CategoryFlow } from "../../store/categoryStore";
const flow = ref<CategoryFlow[]>([]);
const tasks = ref([]);

const isLoading = ref(true);

const categories = computed<Category[]>(() =>
  categoryStore.categories.sort((a, b) => a.name.localeCompare(b.name))
);

async function refreshTasks() {
  await subTaskStore.fetchSubTasks();
  await taskStore.fetchTasks();
}

const handleCategorySelect = (category: Category) => {
  selectedCategoryId.value = category?.id;
  flow.value = category?.flows || [];
};

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
    (t) => t.categoryId === selectedCategoryId.value
  );
});

onMounted(async () => {
  if (!authStore.user) {
    console.warn("User not authenticated, redirecting to login.");
  }
  try {
    await categoryStore.fetchCategories();
    await refreshTasks();
    if (categories.value.length) {
      selectedCategoryId.value = categories.value[0]?.id;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>

</style>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths,
  subMonths,
  isToday,
  addDays,
  addWeeks,
  addMonths as addMonthsToDate,
  addYears
} from 'date-fns';
import { useTaskStore, type Task} from '../store/taskStore';
import { useCategoryStore, type Category, type StorageItem } from '../store/categoryStore';
import { useToastStore } from '../store/toastStore';
import SpastaTaskQuickView from './spastaTaskQuickView.vue';

const props = defineProps<{
  tasks: StorageItem<Task>[];
}>();

const taskStore = useTaskStore();
const categoryStore = useCategoryStore();
const toastStore = useToastStore();
const currentMonth = ref(new Date());
const draggedTask = ref<StorageItem<Task> | null>(null);
const activeDropDate = ref<Date | null>(null);
const selectedTask = ref<StorageItem<Task> | null>(null);
const showQuickView = ref(false);

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value);
  const monthEnd = endOfMonth(currentMonth.value);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  return eachDayOfInterval({ start: startDate, end: endDate });
});

const selectedCategory = computed(() => {
  if (!selectedTask.value) return null;
  const category = categoryStore.categories.find(c => c.id === selectedTask.value?.data.categoryId);
  return category ? { data: category } as StorageItem<Category> : null;
});

// Rest of the code remains the same...
</script>

<template>
  <!-- Template remains unchanged -->
</template>

<style scoped>
/* Styles remain unchanged */
</style>
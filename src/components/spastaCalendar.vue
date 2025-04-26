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
  addYears,
  isWithinInterval
} from 'date-fns';
import { useTaskStore, type Task } from '../store/taskStore';
import { useCategoryStore, type Category } from '../store/categoryStore';
import { useToastStore } from '../store/toastStore';
import SpastaTaskQuickView from './spastaTaskQuickView.vue';

const props = defineProps<{
  tasks: Task[];
}>();

const taskStore = useTaskStore();
const categoryStore = useCategoryStore();
const toastStore = useToastStore();
const currentMonth = ref(new Date());
const draggedTask = ref<Task | null>(null);
const activeDropDate = ref<Date | null>(null);
const selectedTask = ref<Task | null>(null);
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
  return categoryStore.categories.find(c => c.id === selectedTask.value?.categoryId);
});

const getRecurringTaskOccurrences = (task: Task, startDate: Date, endDate: Date) => {
  if (!task.isRecurring || !task.recurringPeriod || !task.dueDate) return [];
  
  const occurrences: Date[] = [];
  let currentDate = new Date(task.dueDate);
  
  while (currentDate <= endDate) {
    if (currentDate >= startDate && currentDate <= endDate) {
      occurrences.push(new Date(currentDate));
    }
    
    switch (task.recurringPeriod) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        currentDate = addMonthsToDate(currentDate, 1);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, 1);
        break;
    }
  }
  
  return occurrences;
};

const tasksForDay = (date: Date) => {
  const regularTasks = props.tasks.filter(task => {
    if (!task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), date);
  });
  
  const recurringTasks = props.tasks.filter(task => {
    if (!task.isRecurring || !task.dueDate) return false;
    
    const monthStart = startOfMonth(currentMonth.value);
    const monthEnd = endOfMonth(currentMonth.value);
    const occurrences = getRecurringTaskOccurrences(task, monthStart, monthEnd);
    
    return occurrences.some(occurrence => isSameDay(occurrence, date));
  });
  
  return [...regularTasks, ...recurringTasks];
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-error-500';
    case 'medium':
      return 'bg-warning-500';
    case 'low':
      return 'bg-success-500';
    default:
      return 'bg-gray-500';
  }
};

const previousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1);
};

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1);
};

const goToToday = () => {
  currentMonth.value = new Date();
};

const onDragStart = (event: DragEvent, task: Task) => {
  if (!event.target) return;
  draggedTask.value = task;
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);
    
    const dragImage = document.createElement('div');
    dragImage.className = 'fixed pointer-events-none bg-card p-2 rounded shadow-lg opacity-90 transform rotate-2';
    dragImage.textContent = task.title;
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    requestAnimationFrame(() => document.body.removeChild(dragImage));
  }
};

const onDragEnd = () => {
  draggedTask.value = null;
  activeDropDate.value = null;
};

const onDragOver = (event: DragEvent, date: Date) => {
  event.preventDefault();
  if (!draggedTask.value) return;
  
  activeDropDate.value = date;
  event.dataTransfer!.dropEffect = 'move';
};

const onDragLeave = () => {
  activeDropDate.value = null;
};

const onDrop = async (event: DragEvent, date: Date) => {
  event.preventDefault();
  activeDropDate.value = null;
  
  if (!draggedTask.value) return;
  
  try {
    await taskStore.updateTask(draggedTask.value.id, { dueDate: date });
    toastStore.showToast('Task due date updated ✨', 'success');
  } catch (error) {
    console.error('Error updating task date:', error);
    toastStore.showToast('Failed to update task date', 'error');
  }
  
  draggedTask.value = null;
};

const handleTaskClick = (task: Task) => {
  selectedTask.value = task;
  showQuickView.value = true;
};

const handleTaskUpdate = async (updates: Partial<Task>) => {
  if (!selectedTask.value) return;
  
  try {
    await taskStore.updateTask(selectedTask.value.id, updates);
    toastStore.showToast('Task updated successfully ✨', 'success');
  } catch (error) {
    console.error('Error updating task:', error);
    toastStore.showToast('Failed to update task', 'error');
  }
};

const handleTaskDelete = async (taskId: string) => {
  try {
    await taskStore.deleteTask(taskId);
    showQuickView.value = false;
    toastStore.showToast('Task deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting task:', error);
    toastStore.showToast('Failed to delete task', 'error');
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 animate-slide-in">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">
        {{ format(currentMonth, 'MMMM yyyy') }}
      </h2>
      <div class="flex space-x-2">
        <button 
          @click="previousMonth"
          class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200"
        >
          &larr;
        </button>
        <button 
          @click="goToToday"
          class="px-3 py-1 rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm font-medium"
        >
          Today
        </button>
        <button 
          @click="nextMonth"
          class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200"
        >
          &rarr;
        </button>
      </div>
    </div>
    
    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1">
      <!-- Day of Week Headers -->
      <div 
        v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
        :key="day"
        class="text-center font-medium text-gray-500 py-2"
      >
        {{ day }}
      </div>
      
      <!-- Calendar Cells -->
      <div 
        v-for="(day, dayIndex) in calendarDays" 
        :key="dayIndex"
        class="relative border border-gray-200 rounded-md p-1 min-h-[100px] transition-all duration-150"
        :class="{
          'bg-gray-50': !isSameMonth(day, currentMonth),
          'bg-primary-50': isToday(day),
          'ring-2 ring-primary-500 bg-primary-50/20': activeDropDate && isSameDay(activeDropDate, day)
        }"
        @dragover="onDragOver($event, day)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, day)"
      >
        <div class="text-right text-sm mb-1" :class="isSameMonth(day, currentMonth) ? 'text-gray-900' : 'text-gray-400'">
          {{ format(day, 'd') }}
        </div>
        
        <TransitionGroup 
          name="task-list"
          tag="div" 
          class="space-y-1 overflow-y-auto max-h-[80px]"
        >
          <div 
            v-for="(task, taskIndex) in tasksForDay(day)"
            :key="`${dayIndex}-${taskIndex}`"
            class="text-xs p-2 rounded bg-white border-l-2 truncate group hover:scale-105 hover:shadow-md transition-all duration-150 cursor-pointer"
            :class="`border-l-${getPriorityClass(task.priority)}`"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
            @click="handleTaskClick(task)"
            @dblclick="handleTaskClick(task)"
          >
            {{ task.title }}
            <span v-if="task.isRecurring" class="ml-1 opacity-75">🔄</span>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Task Quick View Dialog -->
    <SpastaTaskQuickView
      v-if="showQuickView && selectedTask && selectedCategory"
      :is-open="showQuickView"
      :task="selectedTask"
      :category="selectedCategory"
      @close="showQuickView = false"
      @update="handleTaskUpdate"
      @delete="handleTaskDelete"
    />
  </div>
</template>

<style scoped>
.task-list-move {
  transition: transform 0.15s ease-out;
}

.task-list-enter-active {
  transition: all 0.15s ease-out;
}

.task-list-leave-active {
  transition: all 0.15s ease-in;
  position: absolute;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
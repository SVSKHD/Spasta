<script setup lang="ts">
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import { type Task } from '../store/taskStore';
import { type Category } from '../store/categoryStore';
import SpastaTaskDialog from './spastaTaskDialog.vue';

const props = defineProps<{
  task: Task;
  category: Category;
}>();

const emit = defineEmits<{
  (e: 'delete', taskId: string): void;
  (e: 'update', updates: Partial<Task>): void;
}>();

const showDialog = ref(false);

const priorityClasses = computed(() => {
  switch (props.task.priority) {
    case 'high':
      return 'bg-error-100 dark:bg-error-50 text-error-700 dark:text-error-700';
    case 'medium':
      return 'bg-warning-100 dark:bg-warning-50 text-warning-700 dark:text-warning-700';
    case 'low':
      return 'bg-success-100 dark:bg-success-50 text-success-700 dark:text-success-700';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
});

const priorityIcon = computed(() => {
  switch (props.task.priority) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    default:
      return '⚪';
  }
});

const dueDateFormatted = computed(() => {
  if (!props.task.dueDate) return '';
  return format(props.task.dueDate, 'MMM dd, yyyy');
});

const flowName = computed(() => {
  const flow = props.category.flows.find(f => f.id === props.task.flowId);
  return flow ? flow.name : '';
});

const totalHours = computed(() => {
  return (props.task.timeEntries || []).reduce((sum, entry) => sum + entry.hours, 0);
});

const handleSave = (updates: Partial<Task>) => {
  emit('update', updates);
  showDialog.value = false;
};

const deleteTask = () => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete', props.task.id);
  }
};
</script>

<template>
  <div 
    class="bg-card rounded-lg shadow-sm p-3 transition-all duration-150 hover:shadow-md hover:-translate-y-1 cursor-grab animate-fade-in"
    :class="{ 'cursor-grabbing': $attrs.draggable === 'true' }"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span 
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="priorityClasses"
          >
            {{ priorityIcon }} {{ props.task.priority.toUpperCase() }}
          </span>
        </div>
        <h4 class="font-medium text-text">{{ task.title }}</h4>
        <p v-if="task.description" class="text-sm text-text/60 mt-1">
          {{ task.description }}
        </p>
      </div>
      
      <div class="flex space-x-1">
        <button 
          @click.stop="showDialog = true"
          class="text-text/60 hover:text-primary-500 transition-colors duration-150"
        >
          ✎
        </button>
        <button 
          @click.stop="deleteTask"
          class="text-text/60 hover:text-error-500 transition-colors duration-150"
        >
          ✕
        </button>
      </div>
    </div>
    
    <!-- Task Details -->
    <div class="mt-3 space-y-2">
      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div 
          class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
          :style="{ width: `${task.progress}%` }"
        ></div>
      </div>
      
      <div class="flex items-center justify-between text-xs">
        <span class="text-text/60">Progress: {{ task.progress }}%</span>
        <span class="text-text/60">
          {{ totalHours }}h spent
          <span v-if="task.estimatedHours">/ {{ task.estimatedHours }}h est.</span>
        </span>
      </div>
      
      <div class="flex flex-wrap gap-2 text-xs">
        <span v-if="task.dueDate" class="text-text/60">
          {{ dueDateFormatted }}
        </span>
        
        <span v-if="task.isRecurring" class="text-primary-600 dark:text-primary-400">
          🔄 {{ task.recurringPeriod }}
        </span>
      </div>
    </div>
    
    <!-- Task Dialog -->
    <SpastaTaskDialog
      v-if="showDialog"
      :is-open="showDialog"
      :category="category"
      :task="task"
      @close="showDialog = false"
      @save="handleSave"
    />
  </div>
</template>
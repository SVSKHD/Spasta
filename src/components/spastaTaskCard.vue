<script setup lang="ts">
import { ref, computed } from "vue";
import { format } from "date-fns";
import { type Task } from "../store/taskStore";
import { type SubTask } from "../store/subTaskStore";
import { type Category } from "../store/categoryStore";
import SpastaTaskDialog from "./spastaTaskDialog.vue";
import SpastaSubtaskDialog from "./spastaSubDialog.vue";

const props = defineProps<{
  task: Task;
  category: Category;
}>();

const emit = defineEmits<{
  (e: "delete", taskId: string): void;
  (e: "update", updates: Partial<Task>): void;
  (e: "update-SubTask", SubTask: SubTask, parentTaskId: string): void;
  (
    e: "create-SubTask",
    newSubtask: Omit<SubTask, "id" | "createdAt" | "updatedAt">,
    parentTaskId: string,
  ): void;
}>();

const showTaskDialog = ref(false);
const showSubtaskDialog = ref(false);
const showSubtasksAccordion = ref(false); // ✅ Accordion toggle
const showQuickView = ref(false);

const showPopCard = ref(false);

// Track expanded state of subtasks in Quick View
const expandedSubtasks = ref<Record<string, boolean>>({});

const editingSubtask = ref<SubTask | null>(null);
const isSubtaskSaving = ref(false);

const priorityClasses = computed(() => {
  switch (props.task.priority) {
    case "high":
      return "bg-error-100 dark:bg-error-50 text-error-700 dark:text-error-700";
    case "medium":
      return "bg-warning-100 dark:bg-warning-50 text-warning-700 dark:text-warning-700";
    case "low":
      return "bg-success-100 dark:bg-success-50 text-success-700 dark:text-success-700";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  }
});

const priorityIcon = computed(() => {
  switch (props.task.priority) {
    case "high":
      return "🔴";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    default:
      return "⚪";
  }
});

const dueDateFormatted = computed(() => {
  if (!props.task.dueDate) return "";
  return format(props.task.dueDate, "MMM dd, yyyy");
});

const totalHours = computed(() => {
  return (props.task.timeEntries || []).reduce(
    (sum, entry) => sum + entry.hours,
    0,
  );
});

const createSubTask = () => {
  editingSubtask.value = null;
  showSubtaskDialog.value = true;
};

const editSubTask = (SubTask: SubTask) => {
  editingSubtask.value = SubTask;
  showSubtaskDialog.value = true;
};

const deleteTask = () => {
  if (confirm("Are you sure you want to delete this task?")) {
    emit("delete", props.task.id);
  }
};

const handleTaskSave = (updates: Partial<Task>) => {
  emit("update", updates);
  showTaskDialog.value = false;
};

const handleSubtaskSave = async (
  SubTask: Omit<SubTask, "id" | "createdAt" | "updatedAt">
) => {
  isSubtaskSaving.value = true;
  try {
    if (editingSubtask.value) {
      emit("update-SubTask", { ...editingSubtask.value, ...SubTask }, props.task.id);
    } else {
      emit("create-SubTask", SubTask, props.task.id);
    }
    showSubtaskDialog.value = false;
  } finally {
    isSubtaskSaving.value = false;
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
        <div class="relative inline-block">
          <h4
            class="font-medium text-text cursor-pointer hover:underline transition inline"
            @click="showPopCard = !showPopCard"
          >
            {{ task.title }}
          </h4>
          <button
            class="ml-2 text-xs text-gray-400 hover:text-primary-500"
            @click.stop="showPopCard = !showPopCard"
            title="Quick View"
          >
            🪟
          </button>

          <transition name="fade">
            <div
              v-if="showPopCard"
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              @click.self="showPopCard = false"
            >
              <div
                class="w-full max-w-md bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 backdrop-blur-md"
              >
                <div class="flex justify-between items-center mb-3">
                  <h2 class="text-lg font-bold text-text">{{ task.title }}</h2>
                  <button
                    @click="showPopCard = false"
                    class="text-gray-500 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <p class="text-sm text-text/80 mb-2">{{ task.description }}</p>
                <div class="space-y-1 text-xs text-text/70">
                  <p><strong>Progress:</strong> {{ task.progress }}%</p>
                  <p><strong>Due:</strong> {{ dueDateFormatted }}</p>
                  <p><strong>Hours:</strong> {{ totalHours }} / {{ task.estimatedHours || '∞' }}</p>
                </div>
                <div v-if="task.subTasks?.length" class="mt-4">
                  <p class="font-semibold mb-1 text-xs">Subtasks</p>
                  <ul class="list-disc pl-4 text-xs">
                    <li v-for="sub in task.subTasks" :key="sub.id">
                      {{ sub.title }} ({{ sub.completed ? '✅' : '⏳' }})
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <p v-if="task.description" class="text-sm text-text/60 mt-1">
          {{ task.description }}
        </p>
      </div>

      <div class="inline-flex rounded-md shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
        <!-- Subtask -->
        <div class="relative group">
          <button
            @click.stop="createSubTask"
            class="w-8 h-8 flex items-center justify-center text-sm bg-success-100 dark:bg-success-700 text-success-800 dark:text-success-200 hover:bg-success-200 dark:hover:bg-success-600 transition"
          >
            ➕
          </button>
          <span class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Create Subtask
          </span>
        </div>

        <!-- Edit -->
        <div class="relative group">
          <button
            @click.stop="showTaskDialog = true"
            class="w-8 h-8 flex items-center justify-center text-sm bg-primary-100 dark:bg-primary-700 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-600 transition"
          >
            ✎
          </button>
          <span class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Edit Task
          </span>
        </div>

        <!-- Delete -->
        <div class="relative group">
          <button
            @click.stop="deleteTask"
            class="w-8 h-8 flex items-center justify-center text-sm bg-error-100 dark:bg-error-700 text-error-800 dark:text-error-200 hover:bg-error-200 dark:hover:bg-error-600 transition"
          >
            ✕
          </button>
          <span class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Delete Task
          </span>
        </div>
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
          <span v-if="task.estimatedHours"
            >/ {{ task.estimatedHours }}h est.</span
          >
        </span>
      </div>

      <div class="flex flex-wrap gap-2 text-xs">
        <span v-if="task.dueDate" class="text-text/60">
          {{ dueDateFormatted }}
        </span>

        <span
          v-if="task.isRecurring"
          class="text-primary-600 dark:text-primary-400"
        >
          🔄 {{ task.recurringPeriod }}
        </span>
      </div>
    </div>

    <!-- Subtasks Accordion -->
    <div v-if="task.subTasks?.length" class="mt-4">
      <div
        class="flex items-center justify-between cursor-pointer text-xs font-medium text-text/70 py-2 hover:text-primary-500"
        @click="showSubtasksAccordion = !showSubtasksAccordion"
      >
        <span>Subtasks ({{ task.subTasks.length }})</span>
        <span
          class="transition-transform"
          :class="{ 'rotate-90': showSubtasksAccordion }"
          >▶️</span
        >
      </div>

      <div v-if="showSubtasksAccordion" class="mt-2 space-y-2 pl-2">
        <ul class="space-y-1">
          <li
            v-for="SubTask in task.subTasks"
            :key="SubTask.id"
            class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>{{ SubTask.title }}</span>
            <button @click.stop="editSubTask(SubTask)">✎</button>
            <span class="text-gray-400">{{
              SubTask.completed ? "✅" : "⏳"
            }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Task Edit Dialog -->
    <SpastaTaskDialog
      v-if="showTaskDialog"
      :is-open="showTaskDialog"
      :category="category"
      :task="task"
      @close="showTaskDialog = false"
      @save="handleTaskSave"
    />

    <!-- Subtask Create/Edit Dialog -->
    <SpastaSubtaskDialog
      v-if="showSubtaskDialog"
      :is-open="showSubtaskDialog"
      :parent-task="task"
      :subtask="editingSubtask || undefined"
      :is-loading="isSubtaskSaving"
      @close="showSubtaskDialog = false"
      @save="handleSubtaskSave"
    />

    <!-- Quick View Panel -->
    <transition name="slide">
      <div
        v-show="showQuickView"
        class="fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out"
        :class="{ 'translate-x-0': showQuickView, 'translate-x-full': !showQuickView }"
        @mousedown.stop
      >
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="text-xl font-bold text-text">Task Quick View</h3>
          <button @click="showQuickView = false" class="text-text/60 hover:text-red-500">✕</button>
        </div>
        <div class="space-y-4 text-sm">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Title</p>
            <p class="text-base text-text">{{ task.title }}</p>
          </div>
          <div v-if="task.description">
            <p class="text-xs font-semibold text-gray-500 uppercase">Description</p>
            <p class="text-sm text-text/80">{{ task.description }}</p>
          </div>
          <div v-if="task.dueDate">
            <p class="text-xs font-semibold text-gray-500 uppercase">Due Date</p>
            <p class="text-sm text-text">{{ dueDateFormatted }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Priority</p>
            <p class="text-sm text-text">{{ task.priority }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Progress</p>
            <p class="text-sm text-text">{{ task.progress }}%</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Hours Spent</p>
            <p class="text-sm text-text">{{ totalHours }}</p>
          </div>
          <div v-if="task.estimatedHours">
            <p class="text-xs font-semibold text-gray-500 uppercase">Estimated Hours</p>
            <p class="text-sm text-text">{{ task.estimatedHours }}</p>
          </div>
          <div v-if="task.isRecurring">
            <p class="text-xs font-semibold text-gray-500 uppercase">Recurring</p>
            <p class="text-sm text-text">🔄 {{ task.recurringPeriod }}</p>
          </div>

          <!-- Subtasks Section -->
          <div v-if="task.subTasks?.length">
            <h4 class="text-sm font-bold text-text">Subtasks</h4>
            <hr class="border-t border-gray-300 dark:border-gray-700 mb-2" />
            <div
              v-for="subtask in task.subTasks"
              :key="subtask.id"
              class="border border-gray-200 dark:border-gray-700 rounded mb-3"
            >
              <button
                class="w-full flex justify-between items-center px-4 py-2 text-left bg-gray-100 dark:bg-gray-800 text-sm font-medium text-text hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                @click="expandedSubtasks[subtask.id] = !expandedSubtasks[subtask.id]"
                @mousedown.stop
              >
                <span>{{ subtask.title }}</span>
                <span class="text-xs text-gray-400">
                  {{ subtask.completed ? '✅' : '⏳' }}
                </span>
              </button>
              <transition name="accordion">
                <div v-show="expandedSubtasks[subtask.id]" class="px-4 py-2 text-sm text-text/80 border-t border-gray-200 dark:border-gray-700">
                  <p v-if="subtask.description" class="mb-1">
                    <strong>Description:</strong> {{ subtask.description }}
                  </p>
                  <p>
                    <strong>Progress:</strong> {{ subtask.progress || 0 }}%
                  </p>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
.accordion-enter-active, .accordion-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
.accordion-enter-from, .accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-enter-to, .accordion-leave-from {
  max-height: 200px;
  opacity: 1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
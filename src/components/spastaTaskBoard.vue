<script setup lang="ts">
import { ref, computed } from "vue";
import { useTaskStore, type Task } from "../store/taskStore";
import { useSubTaskStore } from "../store/subTaskStore";
import { type Category } from "../store/categoryStore";
import { useToastStore } from "../store/toastStore";
import { useAuthStore } from "../store/authStore";
import { triggerConfetti } from "../utils/confetti";
import { soundManager } from "../utils/sounds";
import SpastaTaskCard from "./spastaTaskCard.vue";
import SpastaTaskDialog from "./spastaTaskDialog.vue";

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const props = defineProps<{
  category: Category;
  tasks: Task[];
}>();

const taskStore = useTaskStore();
const subTaskStore = useSubTaskStore();
const toastStore = useToastStore();
const authStore = useAuthStore();
const showDialog = ref(false);
const activeDropzone = ref<string | null>(null);
const draggedTask = ref<Task | null>(null);
const draggedElement = ref<HTMLElement | null>(null);

const handleCreateSubtask = async (data: any) => {
  console.log(data);
  try {
    if (!authStore.user?.id) {
      toastStore.showToast("You must be logged in to create tasks.", "error");
      return;
    }
    await subTaskStore.addSubTask({
      taskId: data.parentTaskId,
      title: data.title,
      description: data.description,
      completed: false,
      actualHours: 0,
      timeEntries: [],
    });
    showDialog.value = false;
    toastStore.showToast("Sub Task created successfully! 🎯", "success");
    triggerConfetti();
    emit('refresh');
  } catch (error) {
    console.error("Error adding task:", error);
    toastStore.showToast("Failed to create task", "error");
  }
};

// Group tasks by flow
const tasksByFlow = computed(() => {
  const result: Record<string, Task[]> = {};

  // Initialize empty arrays for each flow
  props.category.flows.forEach((flow) => {
    result[flow.id] = [];
  });

  // Distribute tasks to their respective flows
  props.tasks.forEach((task) => {
    if (result[task.flowId]) {
      result[task.flowId].push(task);
    } else {
      // If task's flowId doesn't exist, move it to the first flow
      if (props.category.flows.length > 0) {
        result[props.category.flows[0].id].push({
          ...task,
          flowId: props.category.flows[0].id,
        });
      }
    }
  });

  return result;
});

// Compute task counts per flow
const flowTaskCounts = computed(() => {
  const counts: Record<string, number> = {};
  props.category.flows.forEach((flow) => {
    counts[flow.id] = tasksByFlow.value[flow.id]?.length || 0;
  });
  return counts;
});

const handleAddTask = async (
  task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">,
) => {
  try {
    if (!authStore.user?.id) {
      toastStore.showToast("You must be logged in to create tasks.", "error");
      return;
    }

    await taskStore.addTask({
      ...task,
      categoryId: props.category.id,
    });
    showDialog.value = false;
    toastStore.showToast("Task created successfully! 🎯", "success");
    triggerConfetti();
    emit('refresh');
  } catch (error) {
    console.error("Error adding task:", error);
    toastStore.showToast("Failed to create task", "error");
  }
};

const handleDeleteTask = async (taskId: string) => {
  try {
    if (!authStore.user?.id) {
      toastStore.showToast("You must be logged in to delete tasks.", "error");
      return;
    }

    await taskStore.deleteTask(taskId);
    toastStore.showToast("Task deleted successfully", "success");
  } catch (error) {
    console.error("Error deleting task:", error);
    toastStore.showToast("Failed to delete task", "error");
  }
};

const handleEditTask = async (task: Task, updates: Partial<Task>) => {
  try {
    if (!authStore.user?.id) {
      toastStore.showToast("You must be logged in to edit tasks.", "error");
      return;
    }

    await taskStore.updateTask(task.id, updates);
    toastStore.showToast("Task updated successfully ✨", "success");
  } catch (error) {
    console.error("Error updating task:", error);
    toastStore.showToast("Failed to update task", "error");
  }
};

const onDragStart = (event: DragEvent, task: Task) => {
  if (!event.target) return;
  draggedTask.value = task;
  draggedElement.value = event.target as HTMLElement;

  draggedElement.value.classList.add("dragging");

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);

    // Use the actual task card as drag image
    const rect = draggedElement.value.getBoundingClientRect();
    event.dataTransfer.setDragImage(
      draggedElement.value,
      rect.width / 2,
      rect.height / 2,
    );
  }

  // Play drag sound
  soundManager.play("drag");

  // Add dragging class to body to style drop zones
  document.body.classList.add("is-dragging");
};

const onDragEnd = () => {
  if (draggedElement.value) {
    draggedElement.value.classList.remove("dragging");
  }
  draggedElement.value = null;
  draggedTask.value = null;
  activeDropzone.value = null;

  // Remove dragging class from body
  document.body.classList.remove("is-dragging");
};

const onDragOver = (event: DragEvent, flowId: string) => {
  event.preventDefault();
  if (!draggedTask.value || draggedTask.value.flowId === flowId) {
    activeDropzone.value = null;
    return;
  }
  activeDropzone.value = flowId;
  event.dataTransfer!.dropEffect = "move";
};

const onDragLeave = (event: DragEvent) => {
  // Only clear active dropzone if we're leaving the column (not a child element)
  if ((event.target as HTMLElement).classList.contains("flow-column")) {
    activeDropzone.value = null;
  }
};

const onDrop = async (event: DragEvent, flowId: string) => {
  event.preventDefault();
  activeDropzone.value = null;

  if (!authStore.user?.id) {
    toastStore.showToast("You must be logged in to move tasks.", "error");
    return;
  }

  if (!draggedTask.value || draggedTask.value.flowId === flowId) return;

  try {
    const isCompletedFlow =
      props.category.flows.findIndex((f) => f.id === flowId) ===
      props.category.flows.length - 1;

    await taskStore.updateTaskFlow(draggedTask.value.id, flowId);

    // Play drop sound
    soundManager.play("drop");

    if (isCompletedFlow) {
      triggerConfetti();
      soundManager.play("complete");
      toastStore.showToast("Task completed! 🎉", "success");
    } else {
      toastStore.showToast("Task moved successfully ✨", "success");
    }
  } catch (error) {
    console.error("Error moving task:", error);
    toastStore.showToast("Failed to move task", "error");
  }

  draggedTask.value = null;
};
</script>

<template>
  <div class="card animate-slide-in">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-3">
        <span
          class="inline-block w-4 h-4 rounded-full"
          :style="{ backgroundColor: category.color }"
        ></span>
        <h2 class="text-xl font-bold text-text">{{ category.name }}</h2>
      </div>
      <button
        @click="showDialog = true"
        class="btn-primary text-sm py-1 px-2 rounded-md"
      >
        + Add Task
      </button>
    </div>

    <!-- Flow Status Bar -->
    <div class="flex items-center space-x-4 mb-6 px-4">
      <div
        v-for="flow in category.flows"
        :key="flow.id"
        class="flex items-center space-x-2"
      >
        <span class="w-2 h-2 rounded-full bg-primary-500"></span>
        <span class="text-sm text-text/70">{{ flow.name }}</span>
        <span class="text-sm font-medium text-text">{{
          flowTaskCounts[flow.id]
        }}</span>
      </div>
    </div>

  <!-- Task Board -->
<div class="scrollable-row overflow-x-auto">
  <div
    class="flex space-x-4 h-[calc(100vh-250px)] overflow-y-auto pb-4"
  >
    <div
      v-for="flow in category.flows"
      :key="flow.id"
      class="flow-column bg-bg rounded-md p-3 flex-none w-80 overflow-y-auto"
      @dragover="onDragOver($event, flow.id)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, flow.id)"
      :class="{
        'dropzone-active': activeDropzone === flow.id,
        'is-drop-target': draggedTask && draggedTask.flowId !== flow.id,
      }"
    >
      <h3 class="font-medium text-text mb-3">{{ flow.name }}</h3>

      <TransitionGroup
        name="task-list"
        tag="div"
        class="space-y-3"
      >
        <SpastaTaskCard
          v-for="task in tasksByFlow[flow.id]"
          :key="task.id"
          :task="task"
          :category="category"
          draggable="true"
          @create-sub-task="handleCreateSubtask"
          @dragstart="onDragStart($event, task)"
          @dragend="onDragEnd"
          @delete="handleDeleteTask(task.id)"
          @update="handleEditTask(task, $event)"
          class="transform transition-transform duration-150 ease-out cursor-move"
        />

        <div
          v-if="!tasksByFlow[flow.id]?.length"
          :key="'empty-' + flow.id"
          class="empty-column text-center text-text/40 p-4 border-2 border-dashed border-border/50 rounded-md"
        >
          <p>Drop tasks here</p>
        </div>
      </TransitionGroup>
    </div>
  </div>
</div>


    <!-- Task Dialog -->
    <SpastaTaskDialog
      v-if="showDialog"
      :is-open="showDialog"
      :category="category"
      @close="showDialog = false"
      @save="handleAddTask"
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
  transform: translateY(10px);
}

/* Enhanced drop zone styling */
.flow-column {
  transition: all 0.2s ease-out;
  border: 2px solid transparent;
}

.is-drop-target {
  @apply bg-bg/80;
}

.is-drop-target:hover {
  @apply bg-primary-50/20;
  border-color: theme("colors.primary.300");
}

.dropzone-active {
  @apply bg-primary-50/30 ring-2 ring-primary-500;
  border-color: theme("colors.primary.500");
  transform: scale(1.02);
}

/* Empty column highlight */
.empty-column {
  transition: all 0.2s ease-out;
}

.empty-column.dropzone-active {
  @apply bg-primary-50/30;
  border-color: theme("colors.primary.500");
  transform: scale(1.05);
}

/* Global styles for drag state */
:global(.is-dragging) .is-drop-target {
  @apply bg-bg/90;
  border: 2px dashed theme("colors.primary.300");
}

:global(.is-dragging) .is-drop-target:hover {
  @apply bg-primary-50/20;
  border-color: theme("colors.primary.400");
}
</style>

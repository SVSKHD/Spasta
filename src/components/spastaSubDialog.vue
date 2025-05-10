<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { type Task } from "../store/taskStore"; // Assume Subtask type exists
import { type SubTask } from "../store/subTaskStore";
import { Plus as PlusIcon, Minus as MinusIcon } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  parentTask: Task;
  subtask?: SubTask;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", subtask: Omit<SubTask, "id" | "createdAt" | "updatedAt">): void;
}>();

const newSubtask = ref<Omit<SubTask, "id" | "createdAt" | "updatedAt">>({
  title: props.subtask?.title ?? "",
  description: props.subtask?.description ?? "",
  completed: props.subtask?.completed ?? false,
  progress: props.subtask?.progress ?? 0,
  estimatedHours: props.subtask?.estimatedHours ?? 0,
  actualHours: props.subtask?.actualHours ?? 0,
  startDate: props.subtask?.startDate ?? new Date(),
  dueDate: props.subtask?.dueDate ?? new Date(new Date().setHours(17, 0, 0, 0)),
  userId: props.subtask?.userId ?? "",
  parentTaskId: props.parentTask.id,
  taskId: props.subtask?.taskId ?? props.parentTask.id, // fallback to parentTask.id
  timeEntries: props.subtask?.timeEntries ?? [],
});

watch(
  () => props.subtask,
  (updatedSubtask) => {
    newSubtask.value = {
      title: updatedSubtask?.title ?? "",
      description: updatedSubtask?.description ?? "",
      completed: updatedSubtask?.completed ?? false,
      progress: updatedSubtask?.progress ?? 0,
      estimatedHours: updatedSubtask?.estimatedHours ?? 0,
      actualHours: updatedSubtask?.actualHours ?? 0,
      startDate: updatedSubtask?.startDate ?? new Date(),
      dueDate:
        updatedSubtask?.dueDate ?? new Date(new Date().setHours(17, 0, 0, 0)),
      userId: updatedSubtask?.userId ?? "",
      parentTaskId: props.parentTask.id,
      taskId: updatedSubtask?.taskId ?? props.parentTask.id,
      timeEntries: updatedSubtask?.timeEntries ?? [],
    };
  },
  { immediate: true },
);

const showTimeEntry = ref(false);
const newTimeEntry = ref({
  hours: 1,
  description: "Work done on subtask",
});

const isSubmitting = ref(false);

const totalHours = computed(() => {
  return (newSubtask.value.timeEntries || []).reduce(
    (sum, entry) => sum + entry.hours,
    0,
  );
});

const addTimeEntry = () => {
  if (!newSubtask.value.timeEntries) {
    newSubtask.value.timeEntries = [];
  }

  newSubtask.value.timeEntries.push({
    date: new Date(),
    hours: newTimeEntry.value.hours,
    description: newTimeEntry.value.description,
  });

  newSubtask.value.actualHours =
    Number(newSubtask.value.actualHours || 0) +
    Number(newTimeEntry.value.hours);

  newTimeEntry.value = {
    hours: 1,
    description: "Work done on subtask",
  };
  showTimeEntry.value = false;
};

const handleSubmit = () => {
  isSubmitting.value = true;
  try {
    emit("save", newSubtask.value);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div
      class="fixed inset-0 bg-black/30 dark:bg-black/50"
      aria-hidden="true"
    />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl"
      >
        <DialogTitle
          class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100"
        >
          {{ subtask ? "Edit Subtask" : "New Subtask" }}
        </DialogTitle>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                v-model="newSubtask.title"
                type="text"
                class="input dark:bg-gray-700 dark:text-gray-100"
                required
                placeholder="Enter subtask title"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                v-model="newSubtask.description"
                class="input h-20 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Describe the subtask..."
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date
              </label>
              <input
                v-model="newSubtask.startDate"
                type="date"
                class="input dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Due Date
              </label>
              <input
                v-model="newSubtask.dueDate"
                type="date"
                class="input dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Progress (%)
              </label>
              <input
                v-model.number="newSubtask.progress"
                type="number"
                min="0"
                max="100"
                class="input dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Estimated Hours
              </label>
              <input
                v-model.number="newSubtask.estimatedHours"
                type="number"
                min="0"
                step="0.5"
                class="input dark:bg-gray-700 dark:text-gray-100"
                required
                placeholder="Enter estimated hours"
              />
            </div>
          </div>

          <!-- Time Tracking Section -->
          <div class="border-t pt-4 dark:border-gray-600">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Time Tracking
              </h3>
              <button
                type="button"
                @click="showTimeEntry = true"
                class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <PlusIcon class="w-4 h-4 inline mr-1" />
                Add Time
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-sm">
                <span class="text-gray-500 dark:text-gray-400"
                  >Total Hours:</span
                >
                <span class="ml-2 font-medium text-gray-900 dark:text-gray-100">
                  {{ totalHours }}
                </span>
              </div>
              <div class="text-sm">
                <span class="text-gray-500 dark:text-gray-400">Estimated:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-gray-100">
                  {{ newSubtask.estimatedHours || "-" }}
                </span>
              </div>
            </div>

            <!-- Add Time Entry Form -->
            <div
              v-if="showTimeEntry"
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4"
            >
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Hours
                  </label>
                  <input
                    v-model.number="newTimeEntry.hours"
                    type="number"
                    min="0.25"
                    step="0.25"
                    class="input dark:bg-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <input
                    v-model="newTimeEntry.description"
                    type="text"
                    class="input dark:bg-gray-600 dark:text-gray-100"
                    placeholder="What was done?"
                  />
                </div>
              </div>

              <div class="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  @click="showTimeEntry = false"
                  class="btn btn-secondary text-sm py-1 dark:bg-gray-600 dark:text-gray-100"
                >
                  <MinusIcon class="w-4 h-4 inline mr-1" />
                  Cancel
                </button>
                <button
                  type="button"
                  @click="addTimeEntry"
                  class="btn btn-primary text-sm py-1 dark:bg-primary-600 dark:hover:bg-primary-700"
                  :disabled="!newTimeEntry.hours"
                >
                  <PlusIcon class="w-4 h-4 inline mr-1" />
                  Add Entry
                </button>
              </div>
            </div>

            <!-- List of Time Entries -->
            <div class="space-y-2">
              <div
                v-for="(entry, index) in newSubtask.timeEntries"
                :key="index"
                class="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <div>
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {{ entry.hours }}h
                  </span>
                  <span
                    v-if="entry.description"
                    class="ml-2 text-gray-600 dark:text-gray-400"
                  >
                    - {{ entry.description }}
                  </span>
                </div>
                <div class="text-gray-500 dark:text-gray-400">
                  {{ new Date(entry.date).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="emit('close')"
              class="btn btn-secondary dark:bg-gray-600 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">
                {{ subtask ? "Save Changes" : "Create Subtask" }}
              </span>
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
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>

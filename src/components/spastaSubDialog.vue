<script setup lang="ts">
import { ref, computed } from "vue";
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

// Default subtask values
// const defaultSubtask = {
//   title: "",
//   description: "",
//   progress: 0,
//   estimatedHours: 0,
//   actualHours: 0 as number, // Ensure actualHours is explicitly a number
//   startDate: new Date(),
//   dueDate: new Date(new Date().setHours(17, 0, 0, 0)),
//   parentTaskId: props.parentTask.id,
//   taskId: props.parentTask.id, // Ensure taskId is explicitly set to a valid string
//   timeEntries: [] as Array<{ date: Date; hours: number; description: string }>, // Ensure timeEntries is an array of objects
// };

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

const showTimeEntry = ref(false);
const newTimeEntry = ref({
  hours: 1,
  description: "Work done on subtask",
});

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
  emit("save", newSubtask.value);
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <DialogTitle class="text-xl font-semibold mb-4">
          {{ subtask ? "Edit Subtask" : "New Subtask" }}
        </DialogTitle>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Title</label
              >
              {{ subtask }}
              <input
                v-model="newSubtask.title"
                type="text"
                class="input"
                required
                placeholder="Enter subtask title"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Description</label
              >
              <textarea
                v-model="newSubtask.description"
                class="input h-20"
                placeholder="Describe the subtask..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Start Date</label
              >
              <input v-model="newSubtask.startDate" type="date" class="input" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Due Date</label
              >
              <input v-model="newSubtask.dueDate" type="date" class="input" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Progress (%)</label
              >
              <input
                v-model.number="newSubtask.progress"
                type="number"
                min="0"
                max="100"
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Estimated Hours</label
              >
              <input
                v-model.number="newSubtask.estimatedHours"
                type="number"
                min="0"
                step="0.5"
                class="input"
                required
                placeholder="Enter estimated hours"
              />
            </div>
          </div>

          <!-- Time Tracking Section -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-medium">Time Tracking</h3>
              <button
                type="button"
                @click="showTimeEntry = true"
                class="text-sm text-primary-600 hover:text-primary-800"
              >
                <PlusIcon class="w-4 h-4 inline mr-1" />
                Add Time
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-sm">
                <span class="text-gray-500">Total Hours:</span>
                <span class="ml-2 font-medium">{{ totalHours }}</span>
              </div>
              <div class="text-sm">
                <span class="text-gray-500">Estimated:</span>
                <span class="ml-2 font-medium">{{
                  newSubtask.estimatedHours || "-"
                }}</span>
              </div>
            </div>

            <!-- Add Time Entry Form -->
            <div v-if="showTimeEntry" class="bg-gray-50 p-4 rounded-md mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Hours</label
                  >
                  <input
                    v-model.number="newTimeEntry.hours"
                    type="number"
                    min="0.25"
                    step="0.25"
                    class="input"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Description</label
                  >
                  <input
                    v-model="newTimeEntry.description"
                    type="text"
                    class="input"
                    placeholder="What was done?"
                  />
                </div>
              </div>

              <div class="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  @click="showTimeEntry = false"
                  class="btn btn-secondary text-sm py-1"
                >
                  <MinusIcon class="w-4 h-4 inline mr-1" />
                  Cancel
                </button>
                <button
                  type="button"
                  @click="addTimeEntry"
                  class="btn btn-primary text-sm py-1"
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
                class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
              >
                <div>
                  <span class="font-medium">{{ entry.hours }}h</span>
                  <span v-if="entry.description" class="ml-2 text-gray-600">
                    - {{ entry.description }}
                  </span>
                </div>
                <div class="text-gray-500">
                  {{ new Date(entry.date).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="emit('close')"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ subtask ? "Save Changes" : "Create Subtask" }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>

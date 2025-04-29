<script setup lang="ts">
import { ref, computed } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { type Task } from "../store/taskStore";
import { type Category } from "../store/categoryStore";
import { Plus as PlusIcon, Minus as MinusIcon } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  category: Category;
  task?: Task;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "save",
    task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">,
  ): void;
}>();

// Set default values for new tasks
const defaultTask = {
  title: "",
  description: "",
  flowId: props.category.flows[0]?.id || "",
  dueDate: new Date(new Date().setHours(17, 0, 0, 0)), // Set to 5 PM today
  priority: "medium" as const,
  tags: [],
  progress: 0,
  estimatedHours: 0,
  actualHours: 0,
  startDate: new Date(),
  categoryId: props.category.id,
  isRecurring: false,
  recurringPeriod: "weekly" as const,
  timeEntries: [],
};

const newTask = ref<Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">>({
  ...defaultTask,
  ...props.task,
});

const showTimeEntry = ref(false);
const newTimeEntry = ref({
  hours: 1,
  description: "Work completed on task",
});

const totalHours = computed(() => {
  return (newTask.value.timeEntries || []).reduce(
    (sum, entry) => sum + entry.hours,
    0,
  );
});

const addTimeEntry = () => {
  if (!newTask.value.timeEntries) {
    newTask.value.timeEntries = [];
  }

  newTask.value.timeEntries.push({
    date: new Date(),
    hours: newTimeEntry.value.hours,
    description: newTimeEntry.value.description,
  });

  newTask.value.actualHours =
    (newTask.value.actualHours || 0) + newTimeEntry.value.hours;

  // Reset form with default values
  newTimeEntry.value = {
    hours: 1,
    description: "Work completed on task",
  };
  showTimeEntry.value = false;
};

const handleSubmit = () => {
  emit("save", newTask.value);
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <DialogTitle class="text-xl font-semibold mb-4">
          {{ task ? "Edit Task" : "New Task" }}
        </DialogTitle>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700"
                >Title</label
              >
              <input
                v-model="newTask.title"
                type="text"
                class="input"
                required
                placeholder="Enter task title"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700"
                >Description</label
              >
              <textarea
                v-model="newTask.description"
                class="input h-20"
                placeholder="Describe the task..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Status</label
              >
              <select v-model="newTask.flowId" class="input">
                <option
                  v-for="flow in category.flows"
                  :key="flow.id"
                  :value="flow.id"
                >
                  {{ flow.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Priority</label
              >
              <select v-model="newTask.priority" class="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Start Date</label
              >
              <input v-model="newTask.startDate" type="date" class="input" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Due Date</label
              >
              <input v-model="newTask.dueDate" type="date" class="input" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Progress (%)</label
              >
              <input
                v-model.number="newTask.progress"
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
                v-model.number="newTask.estimatedHours"
                type="number"
                min="0"
                step="0.5"
                class="input"
                required
                placeholder="Enter estimated time in hours"
              />
            </div>

            <div class="md:col-span-2">
              <div class="flex items-center space-x-2">
                <input
                  v-model="newTask.isRecurring"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <label class="text-sm font-medium text-gray-700"
                  >Recurring Task</label
                >
              </div>

              <div v-if="newTask.isRecurring" class="mt-2">
                <select v-model="newTask.recurringPeriod" class="input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Time Tracking -->
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
                  newTask.estimatedHours || "-"
                }}</span>
              </div>
            </div>

            <!-- Time Entry Form -->
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
                    placeholder="What did you work on?"
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

            <!-- Time Entries List -->
            <div class="space-y-2">
              <div
                v-for="(entry, index) in newTask.timeEntries"
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
              {{ task ? "Save Changes" : "Create Task" }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>

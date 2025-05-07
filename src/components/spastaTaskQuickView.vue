<script setup lang="ts">
import { ref, computed } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { format } from "date-fns";
import { type Task } from "../store/taskStore";
import { type Category } from "../store/categoryStore";
import { type StorageItem } from "../lib/storage";

const props = defineProps<{
  isOpen: boolean;
  task: StorageItem<Task>;
  category: StorageItem<Category>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", updates: Partial<Task>): void;
  (e: "delete", taskId: string): void;
}>();

const isEditing = ref(false);
const editedTask = ref({ ...props.task?.data });

const priorityClasses = computed(() => {
  switch (props.task?.data?.priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
});

const flowName = computed(() => {
  const flow = props.category?.data?.flows?.find(
    (f: { id: string }) => f.id === props.task?.data?.flowId,
  );
  return flow ? flow.name : "";
});

const formattedDate = computed(() => {
  if (!props.task?.data?.dueDate) return "";
  return format(props.task.data.dueDate, "PPP");
});

const handleSave = () => {
  emit("update", editedTask.value);
  isEditing.value = false;
};

const handleDelete = () => {
  if (confirm("Are you sure you want to delete this task?")) {
    emit("delete", props.task.id);
    emit("close");
  }
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-md rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 shadow-xl"
      >
        <div v-if="!isEditing">
          <!-- View Mode -->
          <div class="flex justify-between items-start mb-4">
            <DialogTitle class="text-xl font-semibold text-text dark:text-gray-100">
              {{ task?.data?.title }}
            </DialogTitle>
            <div class="flex space-x-2">
              <button
                @click="isEditing = true"
                class="text-text/60 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
              >
                ✎
              </button>
              <button
                @click="handleDelete"
                class="text-text/60 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <div class="text-sm text-text/60 dark:text-gray-400 mb-1">Description</div>
              <p class="text-text dark:text-gray-100">
                {{ task?.data?.description || "No description" }}
              </p>
            </div>

            <div class="flex items-center space-x-4">
              <div>
                <div class="text-sm text-text/60 dark:text-gray-400 mb-1">Status</div>
                <span class="text-text dark:text-gray-100">{{ flowName }}</span>
              </div>

              <div>
                <div class="text-sm text-text/60 dark:text-gray-400 mb-1">Priority</div>
                <span
                  :class="[priorityClasses, 'px-2 py-0.5 rounded-full text-sm']"
                >
                  {{ task?.data?.priority }}
                </span>
              </div>
            </div>

            <div v-if="task?.data?.dueDate">
              <div class="text-sm text-text/60 dark:text-gray-400 mb-1">Due Date</div>
              <span class="text-text dark:text-gray-100">{{ formattedDate }}</span>
            </div>

            <div class="text-sm text-text/60 dark:text-gray-400">
              Created {{ format(task?.createdAt, "PPp") }}
              <br />
              Last updated {{ format(task?.updatedAt, "PPp") }}
            </div>
          </div>
        </div>

        <div v-else>
          <!-- Edit Mode -->
          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text/60 dark:text-gray-400"
                >Title</label
              >
              <input
                v-model="editedTask.title"
                type="text"
                class="input dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text/60 dark:text-gray-400"
                >Description</label
              >
              <textarea
                v-model="editedTask.description"
                class="input h-24 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-text/60 dark:text-gray-400"
                  >Status</label
                >
                <select
                  v-model="editedTask.flowId"
                  class="input dark:bg-gray-700 dark:text-gray-100"
                >
                  <option
                    v-for="flow in category?.data?.flows"
                    :key="flow.id"
                    :value="flow.id"
                  >
                    {{ flow.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-text/60 dark:text-gray-400"
                  >Priority</label
                >
                <select
                  v-model="editedTask.priority"
                  class="input dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-text/60 dark:text-gray-400"
                >Due Date</label
              >
              <input
                v-model="editedTask.dueDate"
                type="date"
                class="input dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="isEditing = false"
                class="btn btn-secondary dark:bg-gray-600 dark:text-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

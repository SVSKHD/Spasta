<script setup lang="ts">
import { ref, watch } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { type Category } from "../store/categoryStore";

const props = defineProps<{
  isOpen: boolean;
  category?: Category | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "save",
    category: Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">,
  ): void;
}>();

const newCategory = ref({
  name: "",
  description: "",
  color: "#38B2AC",
  flows: [
    { id: "1", name: "To Do", order: 0 },
    { id: "2", name: "In Progress", order: 1 },
    { id: "3", name: "Completed", order: 2 },
  ],
});

const draggedFlow = ref<number | null>(null);

watch(
  () => props.category,
  (category) => {
    if (category) {
      newCategory.value = {
        name: category.name,
        description: category.description || "",
        color: category.color,
        flows: [...category.flows].sort((a, b) => a.order - b.order),
      };
    } else {
      // Reset to default values
      newCategory.value = {
        name: "",
        description: "",
        color: "#38B2AC",
        flows: [
          { id: "1", name: "To Do", order: 0 },
          { id: "2", name: "In Progress", order: 1 },
          { id: "3", name: "Completed", order: 2 },
        ],
      };
    }
  },
  { immediate: true },
);

const addNewFlow = () => {
  const maxOrder = Math.max(...newCategory.value.flows.map((f) => f.order), -1);
  newCategory.value.flows.push({
    id: `new-${Date.now()}`,
    name: "",
    order: maxOrder + 1,
  });
};

const removeFlow = (index: number) => {
  if (newCategory.value.flows.length <= 1) return;
  newCategory.value.flows.splice(index, 1);
  // Reorder remaining flows
  newCategory.value.flows.forEach((flow, idx) => {
    flow.order = idx;
  });
};

const moveFlow = (fromIndex: number, toIndex: number) => {
  const flow = newCategory.value.flows.splice(fromIndex, 1)[0];
  newCategory.value.flows.splice(toIndex, 0, flow);
  // Update order values
  newCategory.value.flows.forEach((flow, idx) => {
    flow.order = idx;
  });
};

const handleDragStart = (index: number) => {
  draggedFlow.value = index;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDrop = (index: number) => {
  if (draggedFlow.value !== null && draggedFlow.value !== index) {
    moveFlow(draggedFlow.value, index);
  }
  draggedFlow.value = null;
};

const handleSubmit = () => {
  emit("save", newCategory.value);
};
</script>

<template>
  <Dialog :open="isOpen" @close="emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
        <DialogTitle class="text-xl font-semibold mb-4">
          {{ category ? "Edit Category" : "New Category" }}
        </DialogTitle>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text/60">Name</label>
            <input
              v-model="newCategory.name"
              type="text"
              class="input"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text/60"
              >Description</label
            >
            <input
              v-model="newCategory.description"
              type="text"
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text/60">Color</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="newCategory.color"
                type="color"
                class="h-8 w-8 p-0 border-0"
              />
              <input
                v-model="newCategory.color"
                type="text"
                class="input flex-grow"
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-text/60">
                Flows (drag to reorder)
              </label>
              <button
                type="button"
                @click="addNewFlow"
                class="text-sm text-primary-600 hover:text-primary-800"
              >
                + Add Flow
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(flow, index) in newCategory.flows"
                :key="flow.id"
                class="flex items-center space-x-2 bg-bg p-2 rounded-md cursor-move"
                draggable="true"
                @dragstart="handleDragStart(index)"
                @dragover="handleDragOver"
                @drop="handleDrop(index)"
                :class="{ 'opacity-50': draggedFlow === index }"
              >
                <span class="text-text/40">☰</span>
                <input
                  v-model="flow.name"
                  type="text"
                  class="input flex-grow"
                  placeholder="Flow name"
                  required
                />
                <button
                  type="button"
                  @click="removeFlow(index)"
                  class="text-error-500 hover:text-error-700"
                  :disabled="newCategory.flows.length <= 1"
                >
                  ✕
                </button>
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
              {{ category ? "Save Changes" : "Create Category" }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>

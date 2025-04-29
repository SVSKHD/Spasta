<script setup lang="ts">
import { ref } from "vue";
import { useCategoryStore, type Category } from "../store/categoryStore";
import { useTaskStore } from "../store/taskStore";
import { useToastStore } from "../store/toastStore";
import { triggerConfetti } from "../utils/confetti";
import SpastaCategoryDialog from "./spastaCategoryDialog.vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";

const props = defineProps<{
  categories: Category[];
  selectedCategoryId: string;
}>();

const emit = defineEmits<{
  (e: "selectCategory", categoryId: string): void;
}>();

const categoryStore = useCategoryStore();
const taskStore = useTaskStore();
const toastStore = useToastStore();
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const editingCategory = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

const handleAddCategory = async (
  category: Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">,
) => {
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, category);
      toastStore.showToast("Category updated successfully! 🎉", "success");
    } else {
      const addedCategory = await categoryStore.addCategory(category);
      emit("selectCategory", addedCategory.id);
      toastStore.showToast("Category created successfully! 🎉", "success");
      triggerConfetti();
    }
    showDialog.value = false;
    editingCategory.value = null;
  } catch (error) {
    console.error("Error saving category:", error);
    toastStore.showToast("Failed to save category", "error");
  }
};

const handleEditCategory = (category: Category) => {
  editingCategory.value = category;
  showDialog.value = true;
};

const confirmDeleteCategory = (category: Category) => {
  categoryToDelete.value = category;
  showDeleteDialog.value = true;
};

const handleDeleteCategory = async () => {
  if (!categoryToDelete.value) {
    console.error("No category selected for deletion");
    toastStore.showToast(
      "Failed to delete category: No category selected",
      "error",
    );
    showDeleteDialog.value = false;
    return;
  }

  try {
    const categoryId = categoryToDelete.value.id;
    await taskStore.deleteTasksByCategory(categoryId);
    await categoryStore.deleteCategory(categoryId);

    if (
      props.selectedCategoryId === categoryId &&
      props.categories.length > 0
    ) {
      const remainingCategories = props.categories.filter(
        (c) => c.id !== categoryId,
      );
      if (remainingCategories.length > 0) {
        emit("selectCategory", remainingCategories[0].id);
      }
    }

    toastStore.showToast(
      "Category and related tasks deleted successfully",
      "success",
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    toastStore.showToast("Failed to delete category", "error");
  } finally {
    showDeleteDialog.value = false;
    categoryToDelete.value = null;
  }
};

const selectCategory = (categoryId: string) => {
  emit("selectCategory", categoryId);
};
</script>

<template>
  <div class="card">
    <!-- Header with fixed Add button -->
    <div class="flex justify-between items-center mb-4 px-4">
      <h2 class="text-xl font-bold text-text">Categories</h2>
      <button
        @click="
          () => {
            editingCategory = null;
            showDialog = true;
          }
        "
        class="btn-primary text-sm py-1 px-2 rounded-md shrink-0"
      >
        + Add
      </button>
    </div>

    <!-- Scrollable Categories List -->
    <div class="scrollable-row">
      <div
        v-for="category in categories"
        :key="category.id"
        class="group flex items-center shrink-0 px-3 py-2 rounded-md text-left transition-colors duration-150"
        :class="
          category.id === selectedCategoryId
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-100'
            : 'hover:bg-bg'
        "
      >
        <button @click="selectCategory(category.id)" class="flex items-center">
          <span
            class="inline-block w-3 h-3 rounded-full mr-2"
            :style="{ backgroundColor: category.color }"
          ></span>
          <span class="font-medium whitespace-nowrap text-text">{{
            category.name
          }}</span>
        </button>

        <div
          class="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            @click.stop="handleEditCategory(category)"
            class="text-text/60 hover:text-primary-500"
          >
            ✎
          </button>
          <button
            @click.stop="confirmDeleteCategory(category)"
            class="text-text/60 hover:text-error-500"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        v-if="categories.length === 0"
        class="text-center text-text/60 py-4 px-4"
      >
        <p>No categories found</p>
        <button
          @click="showDialog = true"
          class="mt-2 text-primary-600 hover:text-primary-800 text-sm"
        >
          Create your first category
        </button>
      </div>
    </div>

    <!-- Category Dialog -->
    <SpastaCategoryDialog
      :is-open="showDialog"
      :category="editingCategory"
      @close="
        () => {
          showDialog = false;
          editingCategory = null;
        }
      "
      @save="handleAddCategory"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :open="showDeleteDialog"
      @close="showDeleteDialog = false"
      class="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
          <DialogTitle class="text-xl font-semibold text-error-600 mb-4">
            Delete Category
          </DialogTitle>

          <p class="text-text mb-4">
            Are you sure you want to delete
            <strong>{{ categoryToDelete?.name }}</strong
            >? This will also delete all tasks in this category. This action
            cannot be undone.
          </p>

          <div class="flex justify-end space-x-3">
            <button @click="showDeleteDialog = false" class="btn btn-secondary">
              Cancel
            </button>
            <button
              @click="handleDeleteCategory"
              class="btn bg-error-600 hover:bg-error-700 text-white"
            >
              Delete
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>
```

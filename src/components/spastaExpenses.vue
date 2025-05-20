<template>
  <div class="space-y-6 animate-slide-in">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Expense Tracker
      </h1>
      <button @click="toggleAddForm" class="btn btn-primary">
        {{ showAddForm ? "Cancel" : "+ Add Expense" }}
      </button>
    </div>

    <!-- Add Expense Form -->
    <div
      v-if="showAddForm"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-slide-up"
    >
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        New Expense
      </h3>

      <form @submit.prevent="handleAddExpense" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Amount</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 dark:text-gray-400">$</span>
              </div>
              <input
                v-model.number="newExpense.amount"
                type="number"
                min="0.01"
                step="0.01"
                class="input pl-7 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Category</label
            >
            <input
              v-model="newExpense.category"
              type="text"
              class="input dark:bg-gray-700 dark:text-gray-100"
              required
              placeholder="e.g., Groceries, Utilities, Rent"
              list="categories-list"
            />
            <datalist id="categories-list">
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              ></option>
            </datalist>
          </div>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Description</label
          >
          <input
            v-model="newExpense.description"
            type="text"
            class="input dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Date</label
            >
            <input
              v-model="newExpense.date"
              type="date"
              class="input dark:bg-gray-700 dark:text-gray-100"
              :max="new Date().toISOString().split('T')[0]"
            />
          </div>

          <div class="flex items-center">
            <input
              id="recurring"
              v-model="newExpense.isRecurring"
              type="checkbox"
              class="h-4 w-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
            />
            <label
              for="recurring"
              class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Recurring expense
            </label>
          </div>
        </div>

        <div v-if="newExpense.isRecurring">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Recurring Period</label
          >
          <select
            v-model="newExpense.recurringPeriod"
            class="input dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="btn btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
            :disabled="isSubmitting || newExpense.amount <= 0"
          >
            {{ isSubmitting ? "Saving..." : "Save Expense" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Expenses Summary -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          Expenses Summary
        </h3>
        <div>
          <select
            v-model="filterCategory"
            class="input px-3 py-1 text-sm dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Categories</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ formatCurrency(totalExpenses) }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{
            filterCategory === "all"
              ? "Total expenses"
              : `Total ${filterCategory} expenses`
          }}
        </div>
      </div>

      <transition-group
        name="expense-fade"
        tag="div"
        class="space-y-4"
      >
        <div
          v-for="expense in sortedExpenses"
          :key="expense.id"
          class="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span
              class="inline-block px-2 py-1 text-xs rounded-full"
              :class="getCategoryClass(expense.category)"
            >
              {{ expense.category }}
            </span>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ expense.description }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatExpenseDate(expense.date) }}
                <span v-if="expense.isRecurring" class="ml-2">
                  ({{ expense.recurringPeriod }})
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ formatCurrency(expense.amount) }}
            </div>
            <button
              @click="openDeleteDialog(expense.id)"
              class="text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-400"
            >
              ✕
            </button>
          </div>
        </div>
      </transition-group>

      <div
        v-if="sortedExpenses.length === 0"
        class="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <p class="text-gray-500 dark:text-gray-400 mb-3">No expenses found</p>
        <button @click="toggleAddForm" class="btn btn-primary">
          Add your first expense
        </button>
      </div>
    </div>

    <transition name="fade-dialog">
      <div
        v-if="showDeleteDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Delete Expense
          </h3>
          <p class="mb-6 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this expense?
          </p>
          <div class="flex justify-end gap-2">
            <button
              @click="closeDeleteDialog"
              class="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteExpense"
              class="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { format } from "date-fns";
import { useExpenseStore, type Expense } from "../store/expenseStore";
import { formatCurrency } from "../utils/currency";

const props = defineProps<{
  expenses: Expense[];
}>();

const expenseStore = useExpenseStore();
const showAddForm = ref(false);
const isSubmitting = ref(false);
const filterCategory = ref("all");
const showDeleteDialog = ref(false);
const expenseToDelete = ref<string | null>(null);

const newExpense = ref<Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">>({
  amount: 0,
  category: "",
  description: "",
  date: new Date(),
  isRecurring: false,
});

// Track the last expense count to detect when a new one is added
const lastExpenseCount = ref(props.expenses.length);

watch(
  () => props.expenses.length,
  (newLen, oldLen) => {
    if (isSubmitting.value && newLen > lastExpenseCount.value) {
      // New expense appeared, close form and reset
      isSubmitting.value = false;
      showAddForm.value = false;
      newExpense.value = {
        amount: 0,
        category: "",
        description: "",
        date: new Date(),
        isRecurring: false,
      };
    }
    lastExpenseCount.value = newLen;
  }
);

const categories = computed(() => {
  const uniqueCategories = new Set(props.expenses.map((e) => e.category));
  return Array.from(uniqueCategories).sort();
});

const filteredExpenses = computed(() => {
  if (filterCategory.value === "all") {
    return props.expenses;
  }
  return props.expenses.filter((e) => e.category === filterCategory.value);
});

const sortedExpenses = computed(() => {
  return [...filteredExpenses.value].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
});

const totalExpenses = computed(() => {
  return filteredExpenses.value.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
});

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
  if (!showAddForm.value) {
    // Reset form
    newExpense.value = {
      amount: 0,
      category: "",
      description: "",
      date: new Date(),
      isRecurring: false,
    };
  }
};

const handleAddExpense = async () => {
  if (newExpense.value.amount <= 0 || !newExpense.value.category) return;
  isSubmitting.value = true;
  try {
    await expenseStore.addExpense(newExpense.value);
    // Do not close form here; wait for watcher to close it when prop updates
  } catch (error) {
    console.error("Error adding expense:", error);
    isSubmitting.value = false;
  }
};

const openDeleteDialog = (expenseId: string) => {
  expenseToDelete.value = expenseId;
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  expenseToDelete.value = null;
};

const confirmDeleteExpense = async () => {
  if (expenseToDelete.value) {
    try {
      await expenseStore.deleteExpense(expenseToDelete.value);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  }
  closeDeleteDialog();
};

const formatExpenseDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return isNaN(d.getTime()) ? "Invalid date" : format(d, "MMM d, yyyy");
};

const getCategoryClass = (category: string) => {
  // Simple hash function to consistently map categories to colors
  const hash = category
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    "bg-primary-100 text-primary-800",
    "bg-secondary-100 text-secondary-800",
    "bg-accent-100 text-accent-800",
    "bg-success-100 text-success-800",
    "bg-warning-100 text-warning-800",
    "bg-error-100 text-error-800",
  ];
  return colors[hash % colors.length];
};
</script>

<style scoped>
.expense-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.expense-fade-enter-active {
  transition: opacity 0.4s cubic-bezier(.55,0,.1,1), transform 0.4s cubic-bezier(.55,0,.1,1);
}
.expense-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.expense-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.expense-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.expense-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-dialog-enter-active, .fade-dialog-leave-active {
  transition: opacity 0.2s;
}
.fade-dialog-enter-from, .fade-dialog-leave-to {
  opacity: 0;
}
.fade-dialog-enter-to, .fade-dialog-leave-from {
  opacity: 1;
}
</style>


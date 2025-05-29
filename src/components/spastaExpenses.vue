<template>
  <div class="space-y-6 animate-slide-in">
    <!-- Header with Add Expense Button -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
        Expense Tracker
      </h2>
      <button
        @click="toggleAddForm"
        class="btn btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
      >
        {{ showAddForm ? "Close Form" : "Add Expense" }}
      </button>
    </div>

    <!-- Grid Layout for Form and Expense Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Add Expense Form -->
      <transition name="fade">
        <div
          v-if="showAddForm"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {{ editingExpenseId ? "Edit Expense" : "New Expense" }}
          </h3>

          <form @submit.prevent="handleAddExpense" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Account</label
                >
                <select
                  v-model="newExpense.account"
                  class="input dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option
                    v-for="account in accounts"
                    :value="account.value"
                    :key="account.value"
                  >
                    {{ account.name }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Amount</label
                >
                <input
                  v-model.number="newExpense.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  class="input dark:bg-gray-700 dark:text-gray-100"
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
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Description</label
              >
              <textarea
                v-model="newExpense.description"
                class="input dark:bg-gray-700 dark:text-gray-100 resize-y"
                rows="3"
              ></textarea>
            </div>

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

            <div class="pt-2">
              <button
                type="submit"
                class="btn btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
                :disabled="isSubmitting || newExpense.amount <= 0"
              >
                {{ isSubmitting
                  ? "Saving..."
                  : editingExpenseId
                  ? "Update Expense"
                  : "Save Expense" }}
              </button>
            </div>
          </form>
        </div>
      </transition>

      <!-- Expenses Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
            Expenses Summary
          </h3>
          <div class="flex gap-4">
            <!-- Account Filter -->
            <select
              v-model="filterAccount"
              class="input px-3 py-1 text-sm dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">All Accounts</option>
              <option
                v-for="account in accounts"
                :key="account.value"
                :value="account.value"
              >
                {{ account.name }}
              </option>
            </select>

            <!-- Category Filter -->
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
              filterCategory === "all" && filterAccount === "all"
                ? "Total expenses"
                : filterCategory !== "all" && filterAccount === "all"
                ? `Total ${filterCategory} expenses`
                : filterCategory === "all" && filterAccount !== "all"
                ? `Total expenses for ${filterAccount}`
                : `Total ${filterCategory} expenses for ${filterAccount}`
            }}
          </div>
        </div>

        <transition-group
          name="expense-fade"
          tag="div"
          class="space-y-4"
        >
          <div
            v-for="expense in filteredExpenses"
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
              <button
                @click="startEditExpense(expense)"
                class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                title="Edit"
              >
                ✎
              </button>
            </div>
          </div>
        </transition-group>

        <div
          v-if="filteredExpenses.length === 0"
          class="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <p class="text-gray-500 dark:text-gray-400 mb-3">No expenses found</p>
          <button @click="toggleAddForm" class="btn btn-primary">
            Add your first expense
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
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
              :disabled="isDeleting"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteExpense"
              class="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="loader mr-2"></span>
              {{ isDeleting ? "Deleting..." : "Delete" }}
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
const filterAccount = ref("all");
const showDeleteDialog = ref(false);
const expenseToDelete = ref<string | null>(null);
const editingExpenseId = ref<string | null>(null);
const isDeleting = ref(false);

const newExpense = ref<Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">>({
  amount: 0,
  account: "",
  category: "",
  description: "",
  date: new Date(),
  isRecurring: false,
});

// Track the last expense count to detect when a new one is added
const lastExpenseCount = ref(props.expenses.length);

const accounts = ref([
{
  name: "Please select an account",
  value: "Please select an account",
},  
{
  name: "Cash",
  value: "Cash",
}, {
  name: "Kundana-Business(Kotak)",
  value: "Kundana-Business(Kotak)",
}, {
  name: "Kundana-Business(ICICI)",
  value: "Kundana-Business(ICICI)",
}, {
  name: "Personal-Account(HDFC)",
  value: "Personal-Account(HDFC)",
}, {
  name: "Personal-Account(ICICI)",
  value: "Personal-Account(ICICI)",
}, {
  name: "Personal-Account(AXIS)",
  value: "Personal-Account(AXIS)",
}, {
  name: "Mom Personal(ICIC)",
  value: "Mom Personal(ICIC)",
}
, {
  name: "Credit Card(ICICI)",
  value: "Credit Card(ICICI)",
}, {
  name: "Credit Card(AXIS)",
  value: "Credit Card(AXIS)",
}, 
{
  name: "Credit Card(HDFC)",
  value: "Credit Card(HDFC)",
},
]);

watch(
  () => props.expenses.length,
  (newLen) => {
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
  let result = props.expenses;

  // Filter by account
  if (filterAccount.value !== "all") {
    result = result.filter((e) => e.account === filterAccount.value);
  }

  // Filter by category
  if (filterCategory.value !== "all") {
    result = result.filter((e) => e.category === filterCategory.value);
  }

  return result;
});

const totalExpenses = computed(() => {
  return filteredExpenses.value.reduce(
    (sum, expense) => sum + expense.amount,
    0
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

const startEditExpense = (expense: Expense) => {
  editingExpenseId.value = expense.id;
  showAddForm.value = true;
  newExpense.value = {
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    date: expense.date instanceof Date
      ? expense.date.toISOString().split("T")[0]
      : typeof expense.date === "string"
        ? expense.date
        : new Date(expense.date.seconds * 1000).toISOString().split("T")[0],
    isRecurring: expense.isRecurring,
    recurringPeriod: expense.recurringPeriod,
  };
};

const handleAddExpense = async () => {
  if (newExpense.value.amount <= 0 || !newExpense.value.category) return;
  isSubmitting.value = true;
  try {
    if (editingExpenseId.value) {
      await expenseStore.updateExpense(editingExpenseId.value, {
        ...newExpense.value,
        date: new Date(newExpense.value.date),
      });
    } else {
      await expenseStore.addExpense({
        ...newExpense.value,
        date: new Date(newExpense.value.date),
      });
    }
    // Wait for watcher to close form
  } catch (error) {
    console.error("Error saving expense:", error);
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
    isDeleting.value = true; // Start loader
    try {
      await expenseStore.deleteExpense(expenseToDelete.value);
      // Remove the expense locally
      props.expenses = props.expenses.filter((e) => e.id !== expenseToDelete.value);
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      isDeleting.value = false; // Stop loader
      closeDeleteDialog();
    }
  }
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

const wordCount = ref(0);

const updateWordCount = () => {
  wordCount.value = newExpense.value.description
    ? newExpense.value.description.split(/\s+/).filter((word) => word.length > 0).length
    : 0;
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
  transition: opacity 0.2s ease-in-out;
}
.fade-dialog-enter-from, .fade-dialog-leave-to {
  opacity: 0;
}
.fade-dialog-enter-to, .fade-dialog-leave-from {
  opacity: 1;
}
</style>


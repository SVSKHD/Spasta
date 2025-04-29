<script setup lang="ts">
import { ref, computed } from "vue";
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

const newExpense = ref<
  Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">
>({
  amount: 0,
  category: "",
  description: "",
  date: new Date(),
  isRecurring: false,
});

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
    toggleAddForm();
  } catch (error) {
    console.error("Error adding expense:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteExpense = async (expenseId: string) => {
  if (confirm("Are you sure you want to delete this expense?")) {
    try {
      await expenseStore.deleteExpense(expenseId);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  }
};

const formatExpenseDate = (date: Date) => {
  return format(date, "MMM d, yyyy");
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

<template>
  <div class="space-y-6 animate-slide-in">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-900">Expense Tracker</h2>
      <button @click="toggleAddForm" class="btn btn-primary">
        {{ showAddForm ? "Cancel" : "+ Add Expense" }}
      </button>
    </div>

    <!-- Add Expense Form -->
    <div
      v-if="showAddForm"
      class="bg-white rounded-lg shadow-md p-6 animate-slide-up"
    >
      <h3 class="text-lg font-medium mb-4">New Expense</h3>

      <form @submit.prevent="handleAddExpense" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Amount</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500">$</span>
              </div>
              <input
                v-model.number="newExpense.amount"
                type="number"
                min="0.01"
                step="0.01"
                class="input pl-7"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Category</label
            >
            <input
              v-model="newExpense.category"
              type="text"
              class="input"
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
          <label class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <input
            v-model="newExpense.description"
            type="text"
            class="input"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input
              v-model="newExpense.date"
              type="date"
              class="input"
              :max="new Date().toISOString().split('T')[0]"
            />
          </div>

          <div class="flex items-center">
            <input
              id="recurring"
              v-model="newExpense.isRecurring"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="recurring" class="ml-2 block text-sm text-gray-700">
              Recurring expense
            </label>
          </div>
        </div>

        <div v-if="newExpense.isRecurring">
          <label class="block text-sm font-medium text-gray-700"
            >Recurring Period</label
          >
          <select v-model="newExpense.recurringPeriod" class="input">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || newExpense.amount <= 0"
          >
            {{ isSubmitting ? "Saving..." : "Save Expense" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Expenses Summary -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Expenses Summary</h3>
        <div>
          <select v-model="filterCategory" class="input px-3 py-1 text-sm">
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
        <div class="text-3xl font-bold text-gray-900">
          {{ formatCurrency(totalExpenses) }}
        </div>
        <div class="text-sm text-gray-500">
          {{
            filterCategory === "all"
              ? "Total expenses"
              : `Total ${filterCategory} expenses`
          }}
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="expense in sortedExpenses"
          :key="expense.id"
          class="flex justify-between items-center p-3 border-b hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span
              class="inline-block px-2 py-1 text-xs rounded-full"
              :class="getCategoryClass(expense.category)"
            >
              {{ expense.category }}
            </span>
            <div>
              <div class="font-medium">{{ expense.description }}</div>
              <div class="text-xs text-gray-500">
                {{ formatExpenseDate(expense.date) }}
                <span v-if="expense.isRecurring" class="ml-2">
                  ({{ expense.recurringPeriod }})
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="text-lg font-semibold">
              {{ formatCurrency(expense.amount) }}
            </div>
            <button
              @click="handleDeleteExpense(expense.id)"
              class="text-gray-400 hover:text-error-500"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div v-if="sortedExpenses.length === 0" class="text-center py-8">
        <p class="text-gray-500 mb-3">No expenses found</p>
        <button @click="toggleAddForm" class="btn btn-primary">
          Add your first expense
        </button>
      </div>
    </div>
  </div>
</template>

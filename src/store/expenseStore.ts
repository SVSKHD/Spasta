import { defineStore } from "pinia";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { useAuthStore } from "./authStore";

export interface Expense {
  id: string;
  amount: number;
  account: string; // ✅ NEW FIELD
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringPeriod?: "daily" | "weekly" | "monthly" | "yearly";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
}

export const useExpenseStore = defineStore("expense", {
  state: (): ExpenseState => ({
    expenses: [],
    isLoading: false,
  }),

  actions: {
    async fetchExpenses() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        this.expenses = [];
        return;
      }

      this.isLoading = true;
      try {
        const expensesRef = collection(db, "expenses");
        const q = query(expensesRef, where("userId", "==", authStore.user.id));
        const querySnapshot = await getDocs(q);

        const expenses: Expense[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();

          const toDate = (val: any): Date =>
            val?.seconds && val?.nanoseconds
              ? new Timestamp(val.seconds, val.nanoseconds).toDate()
              : new Date(val);

          expenses.push({
            id: docSnap.id,
            amount: data.amount,
            account: data.account || "", // fallback if old records
            category: data.category,
            description: data.description,
            date: toDate(data.date),
            isRecurring: data.isRecurring,
            recurringPeriod: data.recurringPeriod,
            userId: data.userId,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          });
        });

        this.expenses = expenses;
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addExpense(
      expense: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      if (!expense.account || !expense.category)
        throw new Error("Account and category are required");

      try {
        const now = new Date();
        const expenseWithMeta = {
          ...expense,
          userId: authStore.user.id,
          createdAt: now,
          updatedAt: now,
        };

        const docRef = await addDoc(collection(db, "expenses"), expenseWithMeta);
        const newExpense: Expense = { id: docRef.id, ...expenseWithMeta };

        this.expenses.push(newExpense);
        return newExpense;
      } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
      }
    },

    async updateExpense(
      expenseId: string,
      updates: Partial<
        Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">
      >
    ) {
      if (updates.account === "" || updates.category === "")
        throw new Error("Account and category are required");

      try {
        const expenseRef = doc(db, "expenses", expenseId);
        const existingDoc = await getDoc(expenseRef);

        if (!existingDoc.exists()) {
          throw new Error("Expense not found");
        }

        const updatedData = {
          ...updates,
          updatedAt: new Date(),
        };

        await updateDoc(expenseRef, updatedData);

        const index = this.expenses.findIndex((e) => e.id === expenseId);
        if (index !== -1) {
          this.expenses[index] = {
            ...this.expenses[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
      }
    },

    async deleteExpense(expenseId: string) {
      try {
        await deleteDoc(doc(db, "expenses", expenseId));
        this.expenses = this.expenses.filter((e) => e.id !== expenseId);
      } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
      }
    },

    // 🔍 FILTERING METHODS

    getExpensesByAccount(account: string): Expense[] {
      return this.expenses.filter((e) => e.account === account);
    },

    getExpensesByCategory(category: string): Expense[] {
      return this.expenses.filter((e) => e.category === category);
    },

    getExpensesByAccountAndCategory(account: string, category: string): Expense[] {
      return this.expenses.filter(
        (e) => e.account === account && e.category === category
      );
    },
  },
});

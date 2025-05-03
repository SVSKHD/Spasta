import { defineStore } from "pinia";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { useAuthStore } from "./authStore";

// Types
export interface Goal {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
  completed?: boolean;
  checklist: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GoalCategoryState {
  goals: Goal[];
  categories: Category[];
  isLoading: boolean;
}

export const useGoalCategoryStore = defineStore("goalCategory", {
  state: (): GoalCategoryState => ({
    goals: [],
    categories: [],
    isLoading: false,
  }),

  getters: {
    goalsByCategory: (state) => {
      const grouped: Record<string, Goal[]> = {};
      state.goals.forEach((goal) => {
        if (!grouped[goal.categoryId]) grouped[goal.categoryId] = [];
        grouped[goal.categoryId].push(goal);
      });
      return grouped;
    },
    categoryNames: (state) => state.categories.map((cat) => cat.name),
  },

  actions: {
    // ─── GOALS ───────────────────────────────────────
    async fetchGoals() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;
      this.isLoading = true;

      try {
        const goalsRef = collection(db, "goals");
        const q = query(goalsRef, where("userId", "==", authStore.user.id));
        const snapshot = await getDocs(q);

        this.goals = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description || "",
            categoryId: data.categoryId,
            priority: data.priority || "medium",
            createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
            completed: typeof data.completed === "boolean" ? data.completed : false,
            checklist: data.checklist || [],
          } as Goal;
        });
      } catch (e) {
        console.error("Error fetching goals:", e);
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    async addGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const goalData = {
          ...goal,
          userId: authStore.user.id,
          completed: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "goals"), goalData);

        this.goals.push({
          id: docRef.id,
          ...goal,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (e) {
        console.error("Error adding goal:", e);
        throw e;
      }
    },

    async updateGoal(goalId: string, updates: Partial<Goal>) {
      try {
        const goalRef = doc(db, "goals", goalId);
        await updateDoc(goalRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        const index = this.goals.findIndex((g) => g.id === goalId);
        if (index !== -1) {
          this.goals[index] = {
            ...this.goals[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      } catch (e) {
        console.error("Error updating goal:", e);
        throw e;
      }
    },

    async deleteGoal(goalId: string) {
      try {
        await deleteDoc(doc(db, "goals", goalId));
        this.goals = this.goals.filter((g) => g.id !== goalId);
        await this.fetchGoals();
      } catch (e) {
        console.error("Error deleting goal:", e);
        throw e;
      }
    },

    async updateGoalCompleted(goalId: string, completed: boolean) {
      try {
        const goalRef = doc(db, "goals", goalId);
        await updateDoc(goalRef, {
          completed,
          updatedAt: serverTimestamp(),
        });

        const index = this.goals.findIndex((g) => g.id === goalId);
        if (index !== -1) {
          this.goals[index].completed = completed;
          this.goals[index].updatedAt = new Date();
        }
      } catch (e) {
        console.error("Error updating goal completion status:", e);
        throw e;
      }
    },

    // ─── CATEGORIES ─────────────────────────────────
    async fetchCategories() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      try {
        const q = query(
          collection(db, "goalCategories"),
          where("userId", "==", authStore.user.id)
        );
        const snapshot = await getDocs(q);

        this.categories = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            userId: data.userId,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
          } as Category;
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },

    async addCategory(name: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      const newCategory = {
        name,
        userId: authStore.user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(collection(db, "goalCategories"), newCategory);
        this.categories.push({
          id: docRef.id,
          name,
          userId: authStore.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Error adding category:", error);
        throw error;
      }
    },

    async updateCategory(id: string, name: string) {
      try {
        const categoryRef = doc(db, "goalCategories", id);
        await updateDoc(categoryRef, {
          name,
          updatedAt: serverTimestamp(),
        });

        const index = this.categories.findIndex((cat) => cat.id === id);
        if (index !== -1) {
          this.categories[index].name = name;
          this.categories[index].updatedAt = new Date();
        }
      } catch (error) {
        console.error("Error updating category:", error);
        throw error;
      }
    },

    async deleteCategory(id: string) {
      try {
        // Delete related goals from Firestore
        const relatedGoals = this.goals.filter((g) => g.categoryId === id);
        for (const goal of relatedGoals) {
          await deleteDoc(doc(db, "goals", goal.id));
        }
        await deleteDoc(doc(db, "goalCategories", id));
        this.categories = this.categories.filter((cat) => cat.id !== id);
        this.goals = this.goals.filter((g) => g.categoryId !== id);
        await this.fetchCategories();
        await this.fetchGoals();
      } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    },
  },
});
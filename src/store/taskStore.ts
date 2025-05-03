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
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { useAuthStore } from "./authStore";
import { useSubTaskStore, type SubTask } from "../store/subTaskStore"; // ✅
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  flowId: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  tags?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: Date;
  completedDate?: Date;
  isRecurring?: boolean;
  recurringPeriod?: "daily" | "weekly" | "monthly" | "yearly";
  timeEntries?: {
    date: Date;
    hours: number;
    description?: string;
  }[];
  subTasks?: SubTask[]; // ✅ ADD THIS
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
}

export const useTaskStore = defineStore("task", {
  state: (): TaskState => ({
    tasks: [],
    isLoading: false,
  }),

  getters: {
    priorityTasks: (state) => {
      return state.tasks
        .filter((task) => task.priority === "high")
        .sort((a, b) => {
          if (!a.dueDate || !b.dueDate) return 0;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
    },

    tasksByPriority: (state) => {
      const grouped = {
        high: [] as Task[],
        medium: [] as Task[],
        low: [] as Task[],
      };

      state.tasks.forEach((task) => {
        grouped[task.priority].push(task);
      });

      return grouped;
    },

    totalProgress: (state) => {
      if (state.tasks.length === 0) return 0;
      const total = state.tasks.reduce((sum, task) => sum + task.progress, 0);
      return Math.round(total / state.tasks.length);
    },

    totalHoursSpent: (state) => {
      return state.tasks.reduce((sum, task) => {
        const timeEntries = task.timeEntries || [];
        return (
          sum + timeEntries.reduce((total, entry) => total + entry.hours, 0)
        );
      }, 0);
    },
  },

  actions: {
    async fetchTasks() {
      const authStore = useAuthStore();
      const subTaskStore = useSubTaskStore();

      if (!authStore.user?.id) return;

      this.isLoading = true;
      try {
        const tasksRef = collection(db, "tasks");
        const q = query(tasksRef, where("userId", "==", authStore.user.id));
        const querySnapshot = await getDocs(q);

        const loadedTasks: Task[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            title: data.title,
            description: data.description || "",
            categoryId: data.categoryId,
            flowId: data.flowId,
            dueDate: data.dueDate
              ? (data.dueDate as Timestamp).toDate()
              : undefined,
            startDate: data.startDate
              ? (data.startDate as Timestamp).toDate()
              : undefined,
            completedDate: data.completedDate
              ? (data.completedDate as Timestamp).toDate()
              : undefined,
            priority: data.priority || "medium",
            tags: data.tags || [],
            userId: data.userId,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
            progress: data.progress || 0,
            estimatedHours: data.estimatedHours || 0,
            actualHours: data.actualHours || 0,
            isRecurring: data.isRecurring || false,
            recurringPeriod: data.recurringPeriod || undefined,
            timeEntries: (data.timeEntries || []).map((entry: any) => ({
              ...entry,
              date: (entry.date as Timestamp).toDate(),
            })),
            subTasks: [], // subTasks we attach later
          } as Task;
        });

        this.tasks = loadedTasks;

        await subTaskStore.fetchSubTasks();

        this.tasks = this.tasks.map((task) => ({
          ...task,
          subTasks: subTaskStore.subTasksByTask(task.id),
        }));
      } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addTask(
      task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">,
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const taskData = {
          ...task,
          userId: authStore.user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
          startDate: task.startDate ? Timestamp.fromDate(task.startDate) : null,
          progress: task.progress || 0,
          timeEntries: [],
        };

        const docRef = await addDoc(collection(db, "tasks"), taskData);
        const newTask: Task = {
          id: docRef.id,
          ...task,
          userId: authStore.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          progress: task.progress || 0,
          timeEntries: [],
        };

        this.tasks.push(newTask);
        return newTask;
      } catch (error) {
        console.error("Error adding task:", error);
        throw error;
      }
    },

    async updateTask(
      taskId: string,
      updates: Partial<Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">>,
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const taskRef = doc(db, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
          throw new Error("Task not found");
        }

        // Verify ownership
        if (taskDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to update this task");
        }

        // Prepare the update data
        const updateData: Record<string, any> = {
          ...updates,
          updatedAt: serverTimestamp(),
        };

        // Handle date fields
        if ("dueDate" in updates) {
          updateData.dueDate = updates.dueDate
            ? Timestamp.fromDate(updates.dueDate)
            : null;
        }
        if ("startDate" in updates) {
          updateData.startDate = updates.startDate
            ? Timestamp.fromDate(updates.startDate)
            : null;
        }
        if ("completedDate" in updates) {
          updateData.completedDate = updates.completedDate
            ? Timestamp.fromDate(updates.completedDate)
            : null;
        }

        await updateDoc(taskRef, updateData);

        // Update local state
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = {
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
    },

    async updateTaskFlow(taskId: string, flowId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const taskRef = doc(db, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
          throw new Error("Task not found");
        }

        // Verify ownership
        if (taskDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to update this task");
        }

        const updates: Record<string, any> = {
          flowId,
          updatedAt: serverTimestamp(),
        };

        // If moving to the last flow, mark as completed
        const category = this.tasks.find((t) => t.id === taskId)?.categoryId;
        if (category) {
          const categoryDoc = await getDoc(doc(db, "categories", category));
          const flows = categoryDoc.data()?.flows || [];
          if (flows[flows.length - 1]?.id === flowId) {
            updates.completedDate = serverTimestamp();
            updates.progress = 100;
          }
        }

        await updateDoc(taskRef, updates);

        // Update local state
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = {
            ...this.tasks[index],
            flowId,
            updatedAt: new Date(),
            completedDate: updates.completedDate ? new Date() : undefined,
            progress: updates.progress || this.tasks[index].progress,
          };
        }
      } catch (error) {
        console.error("Error updating task flow:", error);
        throw error;
      }
    },

    async deleteTask(taskId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const taskRef = doc(db, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
          throw new Error("Task not found");
        }

        // Verify ownership
        if (taskDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to delete this task");
        }

        await deleteDoc(taskRef);
        this.tasks = this.tasks.filter((t) => t.id !== taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
      }
    },

    async deleteTasksByCategory(categoryId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const tasksToDelete = this.tasks.filter(
          (t) => t.categoryId === categoryId && t.userId === authStore.user?.id,
        );

        const batch = writeBatch(db);
        tasksToDelete.forEach((task) => {
          const taskRef = doc(db, "tasks", task.id);
          batch.delete(taskRef);
        });

        await batch.commit();
        this.tasks = this.tasks.filter((t) => t.categoryId !== categoryId);
      } catch (error) {
        console.error("Error deleting tasks by category:", error);
        throw error;
      }
    },
  },
});

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

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  timeEntries: any[];
  actualHours: number;
  startDate?: Date;
  dueDate?: Date;
  progress?: any;
  estimatedHours?: number;
  parentTaskId?: any;
}

interface SubTaskState {
  subTasks: SubTask[];
  isLoading: boolean;
}

export const useSubTaskStore = defineStore("subTask", {
  state: (): SubTaskState => ({
    subTasks: [],
    isLoading: false,
  }),

  getters: {
    subTasksByTask: (state) => (taskId: string) => {
      return state.subTasks.filter((subTask) => subTask.taskId === taskId);
    },

    completedSubTasks: (state) => {
      return state.subTasks.filter((subTask) => subTask.completed);
    },

    totalCompletedPercentageByTask: (state) => (taskId: string) => {
      const taskSubTasks = state.subTasks.filter((st) => st.taskId === taskId);
      if (taskSubTasks.length === 0) return 0;
      const completedCount = taskSubTasks.filter((st) => st.completed).length;
      return Math.round((completedCount / taskSubTasks.length) * 100);
    },
  },

  actions: {
    async fetchSubTasks() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      this.isLoading = true;
      try {
        const subTasksRef = collection(db, "subTasks");
        const q = query(subTasksRef, where("userId", "==", authStore.user.id));
        const querySnapshot = await getDocs(q);

        this.subTasks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
          } as SubTask;
        });
      } catch (error) {
        console.error("Error fetching subtasks:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addSubTask(
      subTask: Omit<SubTask, "id" | "userId" | "createdAt" | "updatedAt">,
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const subTaskData = {
          ...subTask,
          userId: authStore.user.id,
          completed: subTask.completed || false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "subTasks"), subTaskData);

        const newSubTask: SubTask = {
          id: docRef.id,
          ...subTask,
          userId: authStore.user.id,
          completed: subTask.completed || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.subTasks.push(newSubTask);
        return newSubTask;
      } catch (error) {
        console.error("Error adding subtask:", error);
        throw error;
      }
    },

    async updateSubTask(
      subTaskId: string,
      updates: Partial<
        Omit<SubTask, "id" | "userId" | "createdAt" | "updatedAt">
      >,
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const subTaskRef = doc(db, "subTasks", subTaskId);
        const subTaskDoc = await getDoc(subTaskRef);

        if (!subTaskDoc.exists()) {
          throw new Error("Subtask not found");
        }

        if (subTaskDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to update this subtask");
        }

        const updateData: Record<string, any> = {
          ...updates,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(subTaskRef, updateData);

        const index = this.subTasks.findIndex((st) => st.id === subTaskId);
        if (index !== -1) {
          this.subTasks[index] = {
            ...this.subTasks[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      } catch (error) {
        console.error("Error updating subtask:", error);
        throw error;
      }
    },

    async deleteSubTask(subTaskId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const subTaskRef = doc(db, "subTasks", subTaskId);
        const subTaskDoc = await getDoc(subTaskRef);

        if (!subTaskDoc.exists()) {
          throw new Error("Subtask not found");
        }

        if (subTaskDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to delete this subtask");
        }

        await deleteDoc(subTaskRef);
        this.subTasks = this.subTasks.filter((st) => st.id !== subTaskId);
      } catch (error) {
        console.error("Error deleting subtask:", error);
        throw error;
      }
    },

    async deleteSubTasksByTask(taskId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      const userId = authStore.user.id; // ✅ save once after null check

      try {
        const subTasksToDelete = this.subTasks.filter(
          (st) => st.taskId === taskId && st.userId === userId,
        );

        const batch = writeBatch(db);
        subTasksToDelete.forEach((subTask) => {
          const subTaskRef = doc(db, "subTasks", subTask.id);
          batch.delete(subTaskRef);
        });

        await batch.commit();
        this.subTasks = this.subTasks.filter((st) => st.taskId !== taskId);
      } catch (error) {
        console.error("Error deleting subtasks by task:", error);
        throw error;
      }
    },
  },
});

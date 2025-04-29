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
} from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { useAuthStore } from "./authStore";

export interface NoteTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
  keywords?: string[];
  remarks?: string;
  tasks?: NoteTask[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
}

export const useNoteStore = defineStore("note", {
  state: (): NoteState => ({
    notes: [],
    isLoading: false,
  }),

  getters: {
    // Get notes by categoryId
    notesByCategory: (state) => (categoryId: string) => {
      return state.notes.filter((note) => note.categoryId === categoryId);
    },
    totalNotes: (state) => state.notes.length,
  },

  actions: {
    // Fetch ALL notes for user
    async fetchNotes() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      this.isLoading = true;
      try {
        const notesRef = collection(db, "notes");
        const q = query(notesRef, where("userId", "==", authStore.user.id));
        const querySnapshot = await getDocs(q);

        this.notes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
            tasks: data.tasks || [],
          } as Note;
        });
      } catch (error) {
        console.error("Error fetching notes:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch notes by categoryId
    async fetchNotesByCategory(categoryId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;

      this.isLoading = true;
      try {
        const notesRef = collection(db, "notes");
        const q = query(
          notesRef,
          where("userId", "==", authStore.user.id),
          where("categoryId", "==", categoryId),
        );
        const querySnapshot = await getDocs(q);

        this.notes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
            tasks: data.tasks || [],
          } as Note;
        });
      } catch (error) {
        console.error("Error fetching notes by category:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Add new note
    async addNote(
      note: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">,
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const noteData = {
          ...note,
          userId: authStore.user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "notes"), noteData);
        const newNote: Note = {
          id: docRef.id,
          ...note,
          userId: authStore.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.notes.push(newNote);
        return newNote;
      } catch (error) {
        console.error("Error adding note:", error);
        throw error;
      }
    },

    // Update existing note
    async updateNote(
      noteId: string,
      updates: Partial<Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">>,
    ) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const noteRef = doc(db, "notes", noteId);
        const noteDoc = await getDoc(noteRef);

        if (!noteDoc.exists()) {
          throw new Error("Note not found");
        }

        if (noteDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to update this note");
        }

        const updateData: Record<string, any> = {
          ...updates,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(noteRef, updateData);

        const index = this.notes.findIndex((n) => n.id === noteId);
        if (index !== -1) {
          this.notes[index] = {
            ...this.notes[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      } catch (error) {
        console.error("Error updating note:", error);
        throw error;
      }
    },

    // Delete note
    async deleteNote(noteId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error("User not authenticated");

      try {
        const noteRef = doc(db, "notes", noteId);
        const noteDoc = await getDoc(noteRef);

        if (!noteDoc.exists()) {
          throw new Error("Note not found");
        }

        if (noteDoc.data().userId !== authStore.user.id) {
          throw new Error("Unauthorized to delete this note");
        }

        await deleteDoc(noteRef);
        this.notes = this.notes.filter((n) => n.id !== noteId);
      } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
      }
    },
  },
});

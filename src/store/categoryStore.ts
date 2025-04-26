import { defineStore } from 'pinia';
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuthStore } from './authStore';

export interface CategoryFlow {
  id: string;
  name: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  flows: CategoryFlow[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    isLoading: false,
  }),
  
  actions: {
    async fetchCategories() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) return;
      
      this.isLoading = true;
      try {
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, where('userId', '==', authStore.user.id));
        const querySnapshot = await getDocs(q);
        
        this.categories = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
          } as Category;
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async addCategory(category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error('User not authenticated');
      
      try {
        const categoryData = {
          ...category,
          userId: authStore.user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        const newCategory: Category = {
          id: docRef.id,
          ...category,
          userId: authStore.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.categories.push(newCategory);
        return newCategory;
      } catch (error) {
        console.error('Error adding category:', error);
        throw error;
      }
    },
    
    async updateCategory(categoryId: string, updates: Partial<Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error('User not authenticated');

      try {
        const categoryRef = doc(db, 'categories', categoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }

        // Verify ownership
        if (categoryDoc.data().userId !== authStore.user.id) {
          throw new Error('Unauthorized to update this category');
        }
        
        const updatedData = {
          ...updates,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(categoryRef, updatedData);
        
        const index = this.categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
          this.categories[index] = {
            ...this.categories[index],
            ...updates,
            updatedAt: new Date()
          };
        }
      } catch (error) {
        console.error('Error updating category:', error);
        throw error;
      }
    },
    
    async deleteCategory(categoryId: string) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error('User not authenticated');

      try {
        const categoryRef = doc(db, 'categories', categoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }

        // Verify ownership
        if (categoryDoc.data().userId !== authStore.user.id) {
          throw new Error('Unauthorized to delete this category');
        }

        await deleteDoc(categoryRef);
        this.categories = this.categories.filter(c => c.id !== categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    }
  }
});
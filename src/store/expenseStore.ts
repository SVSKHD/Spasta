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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuthStore } from './authStore';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
}

export const useExpenseStore = defineStore('expense', {
  state: (): ExpenseState => ({
    expenses: [],
    isLoading: false,
  }),
  
  actions: {
    async fetchExpenses() {
      const authStore = useAuthStore();
      if (!authStore.user?.uid) {
        this.expenses = [];
        return;
      }
      
      this.isLoading = true;
      try {
        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, where('userId', '==', authStore.user.uid));
        const querySnapshot = await getDocs(q);
        
        const expenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'date'> & {
            createdAt: Timestamp,
            updatedAt: Timestamp,
            date: Timestamp
          };
          
          expenses.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            date: data.date.toDate()
          });
        });
        
        this.expenses = expenses;
      } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async addExpense(expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      const authStore = useAuthStore();
      if (!authStore.user?.uid) throw new Error('User not authenticated');
      
      try {
        const now = new Date();
        const expenseWithUser = {
          ...expense,
          userId: authStore.user.uid,
          createdAt: now,
          updatedAt: now
        };
        
        const docRef = await addDoc(collection(db, 'expenses'), expenseWithUser);
        const newExpense: Expense = {
          id: docRef.id,
          ...expenseWithUser
        };
        
        this.expenses.push(newExpense);
        return newExpense;
      } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
    },
    
    async updateExpense(expenseId: string, updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
      try {
        const expenseRef = doc(db, 'expenses', expenseId);
        const expenseDoc = await getDoc(expenseRef);
        
        if (!expenseDoc.exists()) {
          throw new Error('Expense not found');
        }
        
        const updatedData = {
          ...updates,
          updatedAt: new Date()
        };
        
        await updateDoc(expenseRef, updatedData);
        
        const index = this.expenses.findIndex(e => e.id === expenseId);
        if (index !== -1) {
          this.expenses[index] = {
            ...this.expenses[index],
            ...updates,
            updatedAt: new Date()
          };
        }
      } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
      }
    },
    
    async deleteExpense(expenseId: string) {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        this.expenses = this.expenses.filter(e => e.id !== expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }
    }
  }
});
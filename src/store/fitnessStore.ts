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

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // in minutes
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  type: string;
  duration: number; // in minutes
  exercises: Exercise[];
  notes?: string;
  userId: any;
  createdAt: Date;
  updatedAt: Date;
}

interface FitnessState {
  workouts: Workout[];
  isLoading: boolean;
}

export const useFitnessStore = defineStore('fitness', {
  state: (): FitnessState => ({
    workouts: [],
    isLoading: false,
  }),
  
  actions: {
    async fetchWorkouts() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        this.workouts = [];
        return;
      }
      
      this.isLoading = true;
      try {
        const workoutsRef = collection(db, 'workouts');
        const q = query(workoutsRef, where('userId', '==', authStore.user.uid));
        const querySnapshot = await getDocs(q);
        
        const workouts: Workout[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'date'> & {
            createdAt: Timestamp,
            updatedAt: Timestamp,
            date: Timestamp
          };
          
          workouts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            date: data.date.toDate()
          });
        });
        
        this.workouts = workouts;
      } catch (error) {
        console.error('Error fetching workouts:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async addWorkout(workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) throw new Error('User not authenticated');
      
      try {
        const now = new Date();
        const workoutWithUser = {
          ...workout,
          userId: authStore.user.id,
          createdAt: now,
          updatedAt: now
        };
        
        const docRef = await addDoc(collection(db, 'workouts'), workoutWithUser);
        const newWorkout: Workout = {
          id: docRef.id,
          ...workoutWithUser
        };
        
        this.workouts.push(newWorkout);
        return newWorkout;
      } catch (error) {
        console.error('Error adding workout:', error);
        throw error;
      }
    },
    
    async updateWorkout(workoutId: string, updates: Partial<Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
      try {
        const workoutRef = doc(db, 'workouts', workoutId);
        const workoutDoc = await getDoc(workoutRef);
        
        if (!workoutDoc.exists()) {
          throw new Error('Workout not found');
        }
        
        const updatedData = {
          ...updates,
          updatedAt: new Date()
        };
        
        await updateDoc(workoutRef, updatedData);
        
        const index = this.workouts.findIndex(w => w.id === workoutId);
        if (index !== -1) {
          this.workouts[index] = {
            ...this.workouts[index],
            ...updates,
            updatedAt: new Date()
          };
        }
      } catch (error) {
        console.error('Error updating workout:', error);
        throw error;
      }
    },
    
    async deleteWorkout(workoutId: string) {
      try {
        await deleteDoc(doc(db, 'workouts', workoutId));
        this.workouts = this.workouts.filter(w => w.id !== workoutId);
      } catch (error) {
        console.error('Error deleting workout:', error);
        throw error;
      }
    }
  }
});
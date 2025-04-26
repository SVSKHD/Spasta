import { defineStore } from 'pinia';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuthStore } from './authStore';

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  exit: number;
  quantity: number;
  profit: number;
  reason: string;
  strategy: string;
  mistakes?: string;
  lessons?: string;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TradingState {
  trades: Trade[];
  isLoading: boolean;
}

export const useTradingStore = defineStore('trading', {
  state: (): TradingState => ({
    trades: [],
    isLoading: false,
  }),

  getters: {
    totalProfit: (state) => {
      return state.trades.reduce((sum, trade) => sum + trade.profit, 0);
    },

    profitBySymbol: (state) => {
      const profits: Record<string, number> = {};
      state.trades.forEach(trade => {
        profits[trade.symbol] = (profits[trade.symbol] || 0) + trade.profit;
      });
      return profits;
    },

    winRate: (state) => {
      if (state.trades.length === 0) return 0;
      const winningTrades = state.trades.filter(trade => trade.profit > 0).length;
      return (winningTrades / state.trades.length) * 100;
    }
  },

  actions: {
    async fetchTrades() {
      const authStore = useAuthStore();
      if (!authStore.user) return;

      this.isLoading = true;
      try {
        const tradesRef = collection(db, 'trades');
        const q = query(
          tradesRef, 
          where('userId', '==', authStore.user.id),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);

        this.trades = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date ? (data.date as Timestamp).toDate() : new Date(),
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date()
          } as Trade;
        });
      } catch (error) {
        console.error('Error fetching trades:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addTrade(trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
      const authStore = useAuthStore();
      if (!authStore.user) throw new Error('User not authenticated');

      try {
        const tradeData = {
          ...trade,
          userId: authStore.user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'trades'), tradeData);
        const newTrade: Trade = {
          id: docRef.id,
          ...trade,
          userId: authStore.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.trades.unshift(newTrade);
        return newTrade;
      } catch (error) {
        console.error('Error adding trade:', error);
        throw error;
      }
    },

    async updateTrade(tradeId: string, updates: Partial<Trade>) {
      try {
        const tradeRef = doc(db, 'trades', tradeId);
        await updateDoc(tradeRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });

        const index = this.trades.findIndex(t => t.id === tradeId);
        if (index !== -1) {
          this.trades[index] = {
            ...this.trades[index],
            ...updates,
            updatedAt: new Date()
          };
        }
      } catch (error) {
        console.error('Error updating trade:', error);
        throw error;
      }
    },

    async deleteTrade(tradeId: string) {
      try {
        await deleteDoc(doc(db, 'trades', tradeId));
        this.trades = this.trades.filter(t => t.id !== tradeId);
      } catch (error) {
        console.error('Error deleting trade:', error);
        throw error;
      }
    }
  }
});
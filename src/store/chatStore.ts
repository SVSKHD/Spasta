import { defineStore } from 'pinia';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';

export interface Message {
  id: string;
  content: string;
  userId: string;
  userEmail: string;
  createdAt: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [],
    isLoading: false,
  }),
  
  actions: {
    async fetchMessages() {
      this.isLoading = true;
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));
        const querySnapshot = await getDocs(q);
        
        this.messages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate()
          } as Message;
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
      try {
        const messageData = {
          ...message,
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'messages'), messageData);
        const newMessage: Message = {
          id: docRef.id,
          ...message,
          createdAt: new Date()
        };
        
        this.messages.push(newMessage);
        return newMessage;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    }
  }
});
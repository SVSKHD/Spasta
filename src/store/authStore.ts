import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: true
  }),
  
  actions: {
    initAuthListener() {
      // For demo purposes, auto-login with test account
      if (!this.isAuthenticated) {
        this.signInWithEmail('demo@spasta.io')
          .catch(error => {
            console.error('Auto-login failed:', error);
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    
    async signInWithEmail(email: string) {
      const toast = useToast();
      try {
        // Demo account simulation
        this.user = {
          id: 'demo-user-id',
          email: email,
          displayName: 'Demo User'
        };
        this.isAuthenticated = true;
        
        toast.success('Welcome to spasta.io! 🎉');
        return this.user;
      } catch (error: any) {
        console.error('Error signing in with email:', error);
        toast.error(error.message || 'Failed to sign in');
        throw error;
      }
    },
    
    async signInWithGoogle() {
      return this.signInWithEmail('demo@spasta.io');
    },
    
    async signOut() {
      const toast = useToast();
      try {
        this.user = null;
        this.isAuthenticated = false;
        toast.success('Successfully signed out! 👋');
      } catch (error: any) {
        console.error('Error signing out:', error);
        toast.error(error.message || 'Failed to sign out');
        throw error;
      }
    }
  }
});
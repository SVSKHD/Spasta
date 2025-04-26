import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    message: null,
    type: 'info'
  }),
  
  actions: {
    showToast(message: string, type: ToastType = 'info') {
      const toast = useToast();
      this.message = message;
      this.type = type;
      
      const options = {
        timeout: 3000,
        icon: type === 'success' ? '✅' :
              type === 'error' ? '❌' :
              type === 'warning' ? '⚠️' : 'ℹ️'
      };
      
      toast[type](message, options);
    },
    
    clearMessage() {
      this.message = null;
    }
  }
});
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useChatStore, type Message } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

const chatStore = useChatStore();
const authStore = useAuthStore();
const newMessage = ref('');
const chatContainer = ref<HTMLElement | null>(null);
const showEmojiPicker = ref(false);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const formatMessageTime = (date: Date) => {
  return format(date, 'HH:mm');
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  try {
    await chatStore.sendMessage({
      content: newMessage.value,
      userId: authStore.user?.id || '',
      userEmail: authStore.user?.email || '',
    });
    newMessage.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const addEmoji = (emoji: string) => {
  newMessage.value += emoji;
  showEmojiPicker.value = false;
};

onMounted(async () => {
  await chatStore.fetchMessages();
  scrollToBottom();
});
</script>

<template>
  <div class="h-[calc(100vh-12rem)] flex flex-col bg-card rounded-lg shadow-md animate-slide-in">
    <!-- Chat Header -->
    <div class="p-4 border-b border-border">
      <h2 class="text-xl font-bold text-text">Team Chat</h2>
    </div>
    
    <!-- Messages Container -->
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <div
        v-for="message in chatStore.messages"
        :key="message.id"
        class="flex items-start space-x-2"
        :class="message.userId === authStore.user?.id ? 'justify-end' : 'justify-start'"
      >
        <!-- Avatar -->
        <div 
          v-if="message.userId !== authStore.user?.id"
          class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 flex-shrink-0"
        >
          {{ message.userEmail.charAt(0).toUpperCase() }}
        </div>
        
        <!-- Message Bubble -->
        <div 
          class="max-w-[70%] rounded-lg p-3 break-words"
          :class="message.userId === authStore.user?.id ? 
            'bg-primary-500 text-white' : 
            'bg-bg text-text'"
        >
          <div v-if="message.userId !== authStore.user?.id" class="text-xs text-text/60 mb-1">
            {{ message.userEmail.split('@')[0] }}
          </div>
          <div>{{ message.content }}</div>
          <div class="text-xs opacity-70 text-right mt-1">
            {{ formatMessageTime(message.createdAt) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input Area -->
    <div class="p-4 border-t border-border">
      <form @submit.prevent="sendMessage" class="flex items-end space-x-2">
        <div class="relative flex-1">
          <textarea
            v-model="newMessage"
            rows="1"
            class="input pr-10 resize-none"
            placeholder="Type your message..."
            @keydown.enter.prevent="sendMessage"
          ></textarea>
          <button
            type="button"
            class="absolute right-2 bottom-2 text-xl opacity-70 hover:opacity-100"
            @click="showEmojiPicker = !showEmojiPicker"
          >
            😊
          </button>
          
          <!-- Emoji Picker -->
          <div 
            v-if="showEmojiPicker"
            class="absolute bottom-full right-0 mb-2 bg-card rounded-lg shadow-lg p-2"
          >
            <div class="grid grid-cols-8 gap-1">
              <button
                v-for="emoji in ['😊', '👍', '❤️', '😂', '🎉', '🔥', '✨', '💪', '👏', '🙌', '🤔', '😅', '🚀', '💡', '👋', '🎯']"
                :key="emoji"
                @click="addEmoji(emoji)"
                class="text-xl hover:bg-bg p-1 rounded"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
        <button 
          type="submit" 
          class="btn btn-primary"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>
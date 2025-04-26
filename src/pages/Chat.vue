<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useChatStore } from '../store/chatStore';
import SpastaChat from '../components/spastaChat.vue';

const chatStore = useChatStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    await chatStore.fetchMessages();
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text mb-6">Team Chat</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <div v-else>
      <SpastaChat />
    </div>
  </div>
</template>
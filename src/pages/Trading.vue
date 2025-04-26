<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTradingStore } from '../store/tradingStore';
import SpastaTrading from '../components/spastaTrading.vue';

const tradingStore = useTradingStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    await tradingStore.fetchTrades();
  } catch (error) {
    console.error('Error fetching trades:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Trading Journal</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <div v-else>
      <SpastaTrading />
    </div>
  </div>
</template>
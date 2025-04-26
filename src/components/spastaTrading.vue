<script setup lang="ts">
import { ref, computed } from 'vue';
import { format, isValid } from 'date-fns';
import { useTradingStore, type Trade } from '../store/tradingStore';
import { useToastStore } from '../store/toastStore';

const tradingStore = useTradingStore();
const toastStore = useToastStore();
const showAddForm = ref(false);
const isSubmitting = ref(false);

const newTrade = ref<Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
  symbol: '',
  type: 'buy',
  entry: 0,
  exit: 0,
  quantity: 0,
  profit: 0,
  reason: '',
  strategy: '',
  mistakes: '',
  lessons: '',
  date: new Date()
});

const calculateProfit = () => {
  const { type, entry, exit, quantity } = newTrade.value;
  if (type === 'buy') {
    newTrade.value.profit = (exit - entry) * quantity;
  } else {
    newTrade.value.profit = (entry - exit) * quantity;
  }
};

// const profitBySymbol = computed(() => tradingStore.profitBySymbol);
const totalProfit = computed(() => tradingStore.totalProfit);
const winRate = computed(() => tradingStore.winRate);

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
  if (!showAddForm.value) {
    newTrade.value = {
      symbol: '',
      type: 'buy',
      entry: 0,
      exit: 0,
      quantity: 0,
      profit: 0,
      reason: '',
      strategy: '',
      mistakes: '',
      lessons: '',
      date: new Date()
    };
  }
};

const handleAddTrade = async () => {
  if (!newTrade.value.symbol) return;

  isSubmitting.value = true;
  try {
    await tradingStore.addTrade(newTrade.value);
    toggleAddForm();
    toastStore.showToast('Trade added successfully! 📈', 'success');
  } catch (error) {
    console.error('Error adding trade:', error);
    toastStore.showToast('Failed to add trade', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteTrade = async (tradeId: string) => {
  if (confirm('Are you sure you want to delete this trade?')) {
    try {
      await tradingStore.deleteTrade(tradeId);
      toastStore.showToast('Trade deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting trade:', error);
      toastStore.showToast('Failed to delete trade', 'error');
    }
  }
};

const formatTradeDate = (date: Date | null) => {
  if (!date || !isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM d, yyyy HH:mm');
};
</script>

<template>
  <div class="space-y-6 animate-slide-in">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-900">Trading Journal</h2>
      <button 
        @click="toggleAddForm"
        class="btn btn-primary"
      >
        {{ showAddForm ? 'Cancel' : '+ Add Trade' }}
      </button>
    </div>

    <!-- Add Trade Form -->
    <div v-if="showAddForm" class="bg-white rounded-lg shadow-md p-6 animate-slide-up">
      <h3 class="text-lg font-medium mb-4">New Trade Entry</h3>

      <form @submit.prevent="handleAddTrade" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Symbol</label>
            <input 
              v-model="newTrade.symbol" 
              type="text" 
              class="input uppercase" 
              required 
              placeholder="AAPL"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <select v-model="newTrade.type" class="input" @change="calculateProfit">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Quantity</label>
            <input 
              v-model.number="newTrade.quantity" 
              type="number" 
              min="0.00001" 
              step="0.00001" 
              class="input" 
              required 
              @input="calculateProfit"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Entry Price</label>
            <input 
              v-model.number="newTrade.entry" 
              type="number" 
              min="0.00001" 
              step="0.00001" 
              class="input" 
              required 
              @input="calculateProfit"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Exit Price</label>
            <input 
              v-model.number="newTrade.exit" 
              type="number" 
              min="0.00001" 
              step="0.00001" 
              class="input" 
              required 
              @input="calculateProfit"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Date & Time</label>
            <input 
              v-model="newTrade.date" 
              type="datetime-local" 
              class="input" 
              required 
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Strategy</label>
          <input v-model="newTrade.strategy" type="text" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Reason for Entry</label>
          <textarea v-model="newTrade.reason" class="input h-20" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mistakes Made</label>
          <textarea v-model="newTrade.mistakes" class="input h-20" placeholder="What could have been done better?" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Lessons Learned</label>
          <textarea v-model="newTrade.lessons" class="input h-20" placeholder="What did you learn from this trade?" />
        </div>

        <div class="pt-2">
          <div class="mb-4 text-lg">
            Profit/Loss: 
            <span :class="newTrade.profit >= 0 ? 'text-success-600' : 'text-error-600'">
              {{ newTrade.profit >= 0 ? '+' : '' }}{{ newTrade.profit.toFixed(2) }}
            </span>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Trade' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Trading Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Total P/L</h3>
        <div :class="totalProfit >= 0 ? 'text-success-600' : 'text-error-600'" class="text-2xl font-bold">
          {{ totalProfit >= 0 ? '+' : '' }}{{ totalProfit.toFixed(2) }}
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Win Rate</h3>
        <div class="text-2xl font-bold text-primary-600">
          {{ winRate.toFixed(1) }}%
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Total Trades</h3>
        <div class="text-2xl font-bold text-gray-900">
          {{ tradingStore.trades.length }}
        </div>
      </div>
    </div>

    <!-- Trade History -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium text-gray-900">Trade History</h3>
      </div>
      <div class="border-t border-gray-200">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="trade in tradingStore.trades" :key="trade.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span class="text-lg font-medium text-gray-900">{{ trade.symbol }}</span>
                    <span :class="trade.type === 'buy' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'" class="px-2 py-1 text-xs rounded-full">
                      {{ trade.type.toUpperCase() }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span :class="trade.profit >= 0 ? 'text-success-600' : 'text-error-600'" class="text-lg font-medium">
                      {{ trade.profit >= 0 ? '+' : '' }}{{ trade.profit.toFixed(2) }}
                    </span>
                    <button 
                      @click="handleDeleteTrade(trade.id)"
                      class="text-gray-400 hover:text-error-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div class="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span class="font-medium">Entry:</span> {{ trade.entry }}
                  </div>
                  <div>
                    <span class="font-medium">Exit:</span> {{ trade.exit }}
                  </div>
                  <div>
                    <span class="font-medium">Quantity:</span> {{ trade.quantity }}
                  </div>
                  <div>
                    <span class="font-medium">Date:</span> {{ formatTradeDate(trade.date) }}
                  </div>
                </div>

                <div class="mt-2">
                  <p class="text-sm text-gray-600"><span class="font-medium">Strategy:</span> {{ trade.strategy }}</p>
                  <p class="text-sm text-gray-600"><span class="font-medium">Reason:</span> {{ trade.reason }}</p>
                  <p v-if="trade.mistakes" class="text-sm text-gray-600"><span class="font-medium">Mistakes:</span> {{ trade.mistakes }}</p>
                  <p v-if="trade.lessons" class="text-sm text-gray-600"><span class="font-medium">Lessons:</span> {{ trade.lessons }}</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
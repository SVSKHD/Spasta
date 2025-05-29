<template>
  <div class="w-full max-w-3xl mx-auto">
    <div class="flex space-x-4 border-b mb-4">
      <button
        v-for="tab in tabNames"
        :key="tab"
        @click="currentTab = tab"
        :class="[
          'py-2 px-4 text-sm font-medium',
          currentTab === tab
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-600'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="tabComponents[currentTab]">
      <component :is="tabComponents[currentTab]" />
    </div>
    <div v-else class="text-center text-gray-500 mt-6">
      No component loaded yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue'

// Props: mapping of tab name to component
const props = defineProps<{
  tabComponents: Record<string, any>
}>()

// Extract tab names dynamically
const tabNames = computed(() => Object.keys(props.tabComponents))

// Default to first tab
const currentTab = ref<string>(tabNames.value[0] || '')
</script>

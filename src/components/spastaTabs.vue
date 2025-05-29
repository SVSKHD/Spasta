<template>
  <div :class="sizeClass">
    <div
      class="flex space-x-4 mb-4"
      :class="tabStyle === 'rounded' ? 'border-none' : 'border-b'"
    >
      <button
        v-for="tab in props.tabs"
        :key="tab.name"
        @click="currentTab = tab.name"
        :class="[
          'py-2 px-4 text-sm font-medium transition-all duration-300',
          tabStyle === 'rounded'
            ? currentTab === tab.name
              ? 'rounded-full bg-blue-500 text-white'
              : 'rounded-full bg-gray-200 text-gray-600 hover:bg-blue-100'
            : tabStyle === 'filled'
            ? currentTab === tab.name
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-blue-100'
            : tabStyle === 'outlined'
            ? currentTab === tab.name
              ? 'border border-blue-500 text-blue-600'
              : 'border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
            : currentTab === tab.name
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-600 hover:text-blue-600'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <div v-if="currentTabComponent">
      <component :is="currentTabComponent" />
    </div>
    <div v-else class="text-center text-gray-500 mt-6">
      No component loaded yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue'

// Props: array of tabs with name and component, size, and style
const props = defineProps<{
  tabs: { name: string; component: any }[],
  size?: 'full' | 'container', 
  style?: 'default' | 'rounded' | 'filled' | 'outlined' 
}>()

// Default to the first tab
const currentTab = ref<string>(props.tabs[0]?.name || '')

// Get the current tab's component
const currentTabComponent = computed(() => {
  return props.tabs.find(tab => tab.name === currentTab.value)?.component || null
})

// Determine the size class based on the size prop
const sizeClass = computed(() => {
  return props.size === 'full' ? 'w-full' : 'w-full max-w-3xl mx-auto'
})

// Determine the tab style based on the style prop
const tabStyle = computed(() => {
  return props.style || 'default'
})
</script>

<style scoped>
/* Add hover and transition effects for tabs */
button {
  transition: all 0.3s ease-in-out;
}
</style>
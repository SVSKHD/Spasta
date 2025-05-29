<template>
  <div class="spasta-input">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>

    <!-- Input -->
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="onInput"
      :placeholder="placeholder"
      :class="[
        'input w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100',
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      ]"
    />

    <!-- Helper Text -->
    <p v-if="helperText && !error" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {{ helperText }}
    </p>

    <!-- Error Text -->
    <p v-if="error" class="text-xs text-red-500 mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// Props for the input component
const props = defineProps<{
  id?: string // Optional ID for the input
  type: 'text' | 'number' // Input type (text or number)
  modelValue: string | number // The value of the input
  placeholder?: string // Optional placeholder text
  label?: string // Optional label for the input
  helperText?: string // Optional helper text below the input
  error?: string // Optional error message
}>()

// Emit the updated value
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// Handle input event
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<style scoped>
.input {
  border: 1px solid #d1d5db;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #3b82f6;
  outline: none;
}
</style>
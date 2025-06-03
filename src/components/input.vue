<template>
  <div class="spasta-input">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Input Field -->
      <q-input
        :id="id"
        :type="isPasswordVisible ? 'text' : type"
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        :class="[
          'input w-full px-4 py-2 border rounded-md',
          outlined ? 'border-gray-300 dark:border-gray-600' : 'border-none',
          error ? 'border-red-500' : 'dark:bg-gray-700 dark:text-gray-100'
        ]"
      />

      <!-- Show/Hide Password Icon -->
      <q-icon
        v-if="type === 'password'"
        :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
        @click="togglePasswordVisibility"
      />
    </div>

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
import { ref, defineProps, defineEmits } from 'vue'

// Props for the input component
const props = defineProps<{
  id?: string // Optional ID for the input
  type: 'text' | 'password' | 'email' | 'number' // Input type
  modelValue: string | number // The value of the input
  placeholder?: string // Optional placeholder text
  label?: string // Optional label for the input
  helperText?: string // Optional helper text below the input
  error?: string // Optional error message
  outlined?: boolean // Whether the input is outlined
}>()

// Emit the updated value
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// Local state for password visibility
const isPasswordVisible = ref(false)

// Toggle password visibility
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

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
<template>
  <spasta-dialog
    v-model="isOpen"
    size="large"
  >
    <h6>Authentication</h6>
    <spasta-input
    outlined="true"
    />
  </spasta-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

// Define props
const props = defineProps<{
  modelValue: boolean // Controls the visibility of the dialog
}>()

// Emit updates for v-model
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Local state for dialog visibility
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})
</script>
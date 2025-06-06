<template>
  <q-dialog v-model="isOpen">
    <q-card :class="['rounded-card', sizeClass]">
      <!-- Header Section -->
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <!-- Content Section -->
      <q-card-section>
        <slot />
      </q-card-section>

      <!-- Actions Section -->
      <q-card-actions align="right">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, watch } from "vue";

// Props for the dialog component
const props = defineProps<{
  modelValue: boolean; // Controls the visibility of the dialog
  title?: string; // Title of the dialog
  size?: "small" | "medium" | "large"; // Size of the dialog
}>();

// Emit the update for modelValue
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

// Local state for dialog visibility
const isOpen = ref(props.modelValue);

// Watch for changes in the modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  },
);

// Emit changes to the parent when the dialog is closed
watch(
  () => isOpen.value,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
);

// Compute the size class based on the size prop
const sizeClass = computed(() => {
  switch (props.size) {
    case "small":
      return "q-dialog-sm";
    case "medium":
      return "q-dialog-md";
    case "large":
      return "q-dialog-lg";
    default:
      return "q-dialog-md"; // Default to medium size
  }
});
</script>

<style scoped>
/* Size classes for the dialog */
.q-dialog-sm {
  max-width: 300px;
}
.q-dialog-md {
  max-width: 500px;
}
.q-dialog-lg {
  max-width: 800px;
}

/* Add rounded corners to the card */
.rounded-card {
  border-radius: 15px;
  overflow: hidden;
}
</style>

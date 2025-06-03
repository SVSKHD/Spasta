<template>
  <div class="q-py-md">
    <q-input
      :dense="dense"
      :width="width"
      :label="label"
      :filled="filled"
      class="spasta-input"
      :placeholder="placeholder"
      :outlined="outlined"
    />
  </div>
</template>
<script setup lang="ts">
interface InputProps {
  label?: string;
  filled?: boolean;
  dense?: boolean; // Optional prop for dense input
  placeholder?: string;
  outlined?: boolean;
  width?: string; // Optional width prop
  modelValue?: string; // For v-model support
}

const props = defineProps<InputProps>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void; // Emit event for v-model
}>();
</script>

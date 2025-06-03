<template>
  <q-btn
    :label="label"
    :icon="icon"
    :color="color"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    flat
    ripple
    @click="$emit('click')"
    :class="fullWidth ? 'full-width' : ''"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  label: string;
  icon?: string;
  color?: string;
  size?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean; // Optional prop for full width button
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

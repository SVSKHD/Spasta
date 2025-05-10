<template>
  <div
    class="resizable-card border rounded-lg shadow-md p-4 mb-4 resize overflow-auto max-w-full min-w-[200px] min-h-[150px]"
    style="resize: both"
  >
    <h2 class="text-xl font-semibold mb-2">{{ props.title }}</h2>
    <p>{{ props.content }}</p>
    <component :is="props.component" v-if="props.component" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, type Component } from "vue";

const props = defineProps<{
  title?: string;
  content?: string;
  minWidth?: string;
  component?: Component;
}>();
</script>

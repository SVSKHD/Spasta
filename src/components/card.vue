<template>
  <q-card
    :class="['my-card', { 'draggable-card': draggable }]"
    :style="priorityStyle"
    dark
    bordered
    :draggable="draggable"
    @dragstart="onDragStart"
  >
    <!-- Title Section -->
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
      <div class="text-subtitle2">{{ description }}</div>
    </q-card-section>

    <q-separator dark inset />

    <!-- Content Section -->
    <q-card-section>
      <slot />
    </q-card-section>

    <!-- Actions Section -->
    <q-card-actions align="right" v-if="actions && actions.length">
      <q-btn
        v-for="(action, index) in actions"
        :key="index"
        :label="action.label"
        :icon="action.icon"
        @click="action.onClick"
        flat
        dense
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

// Props for the card component
const props = defineProps<{
  title: string; // Title of the card
  description: string; // Subtitle or description of the card
  actions?: { label: string; icon?: string; onClick: () => void }[]; // Actions for the card
  draggable?: boolean; // Whether the card is draggable
  priority?: "low" | "medium" | "high"; // Priority of the card
}>();

// Emits for drag events
const emit = defineEmits<{
  (e: "dragstart", event: DragEvent): void;
}>();

// Handle drag start event
const onDragStart = (event: DragEvent) => {
  emit("dragstart", event);
};

// Compute the background color based on priority
const priorityStyle = computed(() => {
  switch (props.priority) {
    case "low":
      return { backgroundColor: "#d4edda" }; // Light green for low priority
    case "medium":
      return { backgroundColor: "#fff3cd" }; // Light yellow for medium priority
    case "high":
      return { backgroundColor: "#f8d7da" }; // Light red for high priority
    default:
      return {}; // Default style
  }
});
</script>

<style scoped>
.my-card {
  transition: box-shadow 0.2s ease-in-out;
}
.my-card:hover {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}
.draggable-card {
  cursor: grab;
}
.draggable-card:active {
  cursor: grabbing;
}
</style>

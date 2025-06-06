<template>
  <q-card
    class="task-card q-pa-sm rounded-borders"
    flat
    bordered
    :class="priorityClass(task.priority)"
  >
    <q-card-section class="q-pa-sm">
      <!-- Header: Priority + Actions -->
      <div class="row justify-between items-center q-mb-xs">
        <q-badge
          :color="badgeColor(task.priority)"
          text-color="black"
          rounded
          :label="task.priority.toUpperCase()"
        />
        <div class="row items-center q-gutter-xs">
          <q-btn icon="edit" size="sm" flat dense color="blue-3" />
          <q-btn icon="close" size="sm" flat dense color="red-3" />
        </div>
      </div>

      <!-- Title -->
      <div class="text-white text-weight-bold q-mb-xs">
        {{ task.title }}
        <q-icon name="mdi-note-outline" class="q-ml-xs" />
      </div>

      <!-- Description -->
      <div class="text-caption text-grey-6 q-mb-xs">
        {{ task.description || "No description" }}
      </div>

      <!-- Progress and Time -->
      <div class="row items-center justify-between text-caption q-my-xs">
        <q-linear-progress
          :value="task.progress / 100"
          size="6px"
          color="blue"
          rounded
          class="col"
        />
        <div class="q-ml-sm">{{ task.progress }}%</div>
        <div>{{ task.actualHours || 0 }}h spent</div>
      </div>

      <!-- Date -->
      <div class="text-caption text-grey-7">
        {{ formatDate(task.dueDate) }}
      </div>
    </q-card-section>

    <!-- Accordion Add Button -->
    <q-expansion-item
      dense
      expand-separator
      icon="add"
      label="Add Details"
      header-class="text-indigo-5 text-caption"
      class="bg-grey-10"
    >
      <q-card-section>
        <q-input label="Subtask name" dense filled />
        <q-btn label="Add Subtask" icon="add" color="green" class="q-mt-sm" dense />
      </q-card-section>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function badgeColor(priority: string) {
  switch (priority) {
    case "low":
      return "green-2";
    case "medium":
      return "yellow-2";
    case "high":
      return "red-2";
    default:
      return "grey-4";
  }
}

function priorityClass(priority: string) {
  switch (priority) {
    case "low":
      return "border-left-low";
    case "medium":
      return "border-left-medium";
    case "high":
      return "border-left-high";
    default:
      return "";
  }
}

</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  border-radius: 20px;
  background-color: #183b4e;
}

.border-left-low {
  border-left: 5px solid #4caf50;
}
.border-left-medium {
  border-left: 5px solid #ffeb3b;
}
.border-left-high {
  border-left: 5px solid #f44336;
}

</style>

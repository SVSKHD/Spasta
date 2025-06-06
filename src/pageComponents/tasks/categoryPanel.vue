<template>
  <div class="q-pa-md">
    <q-toolbar class="tabs-color text-white shadow-2 rounded-borders">
      <q-btn flat class="category-create-button" label="create category" />
      <q-separator inset />
      <q-btn flat class="q-ps-md category-create-button" label="create task" />
      <q-space />
      <q-tabs v-model="tab" shrink stretch>
        <q-tab
          v-for="tabItem in props.tabs"
          :key="tabItem.id"
          :name="tabItem.name"
          :label="tabItem.name"
          @click="handleTabClick(tabItem)"
        />
      </q-tabs>
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import { type Category } from "../../store/categoryStore"

// Props
const props = defineProps<{ tabs: Category[] }>()

// Emits
const emit = defineEmits<{ (e: 'select-category', category: Category): void }>()

const tab = ref('')

function handleTabClick(category: Category) {
  emit('select-category', category)
}
</script>

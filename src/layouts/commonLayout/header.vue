<template>
  <q-header elevated class="header">
    <q-toolbar>
      <!-- Emit an event when the menu button is clicked -->
      <q-btn dense flat round icon="menu" @click="onMenuClick" />

      <q-toolbar-title>
        Spasta.online
      </q-toolbar-title>
      <q-btn dense flat round icon="people" @click="onAuthClick" />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

// Define the emits
const emit = defineEmits<{
  (e: 'menu-click'): void
  (e: 'auth-click'): void
}>()

// Emit the 'menu-click' event when the button is clicked
const onMenuClick = () => {
  emit('menu-click')
}
const onAuthClick = () =>{
    emit('auth-click')
}
</script>
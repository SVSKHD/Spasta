<template>
  <Spasta-tabs
    :tabs="tabs"
    size="full"
    style="outlined"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import income from './income.vue';

const tabs = ref([
  {
    name: 'Income',
    component: income
  }
])
</script>

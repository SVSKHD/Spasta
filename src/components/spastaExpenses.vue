<template>
  <Spasta-tabs
    :tabs="tabs"
    size="full"
  />
</template>
<script setup lang="ts">
import { ref, defineComponent } from 'vue'

const tabs = ref([
  {
    name: 'Investments',
    component: defineComponent({
      template: `<div>Hello test</div>`
    })
  }
])
</script>

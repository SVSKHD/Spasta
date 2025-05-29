<template>
    <Spasta-tabs
        :tabs="tabs"
        size="full"
        style="rounded"
    />
    </template>
<script setup lang="ts">
import { ref, defineComponent } from 'vue'  

const tabs = ref([
    {
        name: 'Trading',
        component: defineComponent({
            template: `<div class="w-full h-full flex flex-col">
                <h1>Hello Trading</h1>
            </div>`
        })
    },
    {
        name: 'Investments',
        component: defineComponent({
            template: `<div class="w-full h-full flex flex-col">
                <spasta-investments />
            </div>`
        })
    }
])
</script>
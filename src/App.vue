<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "./store/authStore";

document.title = "Spasta.online - Personal Dashboard";

const authStore = useAuthStore();

onMounted(()=>{
  authStore.initAuthListener();
})
</script>



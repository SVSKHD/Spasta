<template>
  <q-layout view="hHh lpR fFf">

    <Header @menu-click="toggleLeftDrawer" @auth-click="toggleAuthDialog" />

    <q-drawer 
    show-if-above 
    v-model="leftDrawerOpen" 
    side="left" 
    bordered
    width="300"
    mini="!leftDrawerOpen || "
    class="drawer"
    >
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <authDialog
        v-model="authDialogOpen"
        title="Authentication"
        size="medium" 
       />
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from './header.vue'
import authDialog from '../../auth/authDialog.vue'

    const leftDrawerOpen = ref(false)
    const authDialogOpen = ref(false)
const toggleLeftDrawer = () => { 
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const toggleAuthDialog = () => {
  authDialogOpen.value = !authDialogOpen.value
} 
</script>
<template>
  <q-header elevated class="header">
    <q-toolbar>
      <!-- Emit an event when the menu button is clicked -->
      <q-btn dense flat round icon="menu" @click="onMenuClick" />

      <q-toolbar-title> Spasta.online </q-toolbar-title>
      <div class="q-pa-md">{{ dateDisplay }}</div>
        <q-separator dark vertical />
      
            <q-item v-if="authStore.isAuthenticated" clickable v-ripple>
  <q-avatar color="primary" text-color="white">
  <img v-if="user?.photoURL" :src="user.photoURL" class="q-avatar__img" />
  <span v-else class="q-avatar__text">          
  {{ user?.email?.charAt(0).toUpperCase() || "U" }}
  </span>
  </q-avatar>
        <q-item-section>
          <q-item-label class="q-pl-md" lines="1">{{ user?.displayName }}</q-item-label>

        </q-item-section>
        <q-item-section side>
          <q-btn flat round color="red" icon="logout" @click="logout" />
          </q-item-section> 
      </q-item>
      <q-btn dense v-else flat round icon="eva-person" class="q-pa-md" @click="onAuthClick" />
      
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import {useAuthStore} from "../../store/authStore"
import { defineEmits,ref, computed } from "vue";


// stores
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const logout = () =>{
  authStore.signOut();
}

// Define the emits
const emit = defineEmits<{
  (e: "menu-click"): void;
  (e: "auth-click"): void;
}>();

// Emit the 'menu-click' event when the button is clicked
const onMenuClick = () => {
  emit("menu-click");
};
const onAuthClick = () => {
  emit("auth-click");
};
const dateDisplay = ref(new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
</script>

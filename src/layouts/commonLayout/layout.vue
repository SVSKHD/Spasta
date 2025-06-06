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
      <div class="q-pa-xs" style="max-width: 350px">
        <q-list>
          <q-item v-for="item in menu">
           <q-item-section side top>
              <q-icon :name="item.icon" color="yellow" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
              <q-item-label caption>{{ item.description }}</q-item-label>
              <q-separator spaced />
            </q-item-section>
            <q-item-section side top>
              <q-icon :name="item.icon" color="yellow" />
            </q-item-section>
          </q-item>

    

        

        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <authDialog v-model="authDialogOpen" title="Sign In" size="medium" />
      <div class="q-pa-md">
      <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Header from "./header.vue";
import authDialog from "../../auth/authDialog.vue";

const leftDrawerOpen = ref(false);
const authDialogOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
const toggleAuthDialog = () => {
  authDialogOpen.value = !authDialogOpen.value;
};

const menu = ref([
  {
    label: "Tasks",
    to: "/",
    icon: "eva-checkmark-square-outline",
    description: "Your task board",
  },
  { label: "About", to: "/about" },
  { label: "Contact", icon: "contact_mail", to: "/contact" },
]);

const time = ref(new Date().toLocaleTimeString());

let interval: number;

onMounted(() => {
  interval = setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
  console.log("Mounted: Time interval started", time.value);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

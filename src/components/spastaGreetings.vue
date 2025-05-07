<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";

defineProps<{
  userName?: string;
}>();

const showRestDialog = ref(false);
const showInactivityDialog = ref(false);
const lastActivityTime = ref(Date.now());
const inactivityTimeout = 5 * 60 * 1000; // 5 minutes

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Time to rest";
});

const checkTime = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 21) {
    showRestDialog.value = true;
  }
};

const checkInactivity = () => {
  const now = Date.now();
  if (now - lastActivityTime.value > inactivityTimeout) {
    showInactivityDialog.value = true;
  }
};

const resetActivityTimer = () => {
  lastActivityTime.value = Date.now();
  showInactivityDialog.value = false;
};

onMounted(() => {
  // Check time every minute
  setInterval(checkTime, 60000);

  // Check inactivity every minute
  setInterval(checkInactivity, 60000);

  // Add activity listeners
  document.addEventListener("mousemove", resetActivityTimer);
  document.addEventListener("keydown", resetActivityTimer);
  document.addEventListener("click", resetActivityTimer);

  // Initial time check
  checkTime();
});
</script>

<template>
  <div>
    <!-- Greeting Message -->
    <div class="text-lg font-medium text-text mb-6 animate-fade-in">
      {{ greeting }}{{ userName ? `, ${userName}` : "" }}!
      <span class="text-sm text-text/60">
        {{
          new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        }}
      </span>
    </div>

    <!-- Rest Time Dialog -->
    <Dialog
      :open="showRestDialog"
      @close="showRestDialog = false"
      class="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          class="w-full max-w-sm rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 shadow-xl"
        >
          <DialogTitle class="text-xl font-semibold text-text dark:text-gray-100 mb-4">
            Time to Rest 😴
          </DialogTitle>

          <p class="text-text/80 dark:text-gray-300 mb-4">
            It's getting late! Consider taking a break and getting some rest. A
            good night's sleep will help you be more productive tomorrow.
          </p>

          <div class="flex justify-end">
            <button @click="showRestDialog = false" class="btn btn-primary">
              Got it
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    <!-- Inactivity Dialog -->
    <Dialog
      :open="showInactivityDialog"
      @close="resetActivityTimer"
      class="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          class="w-full max-w-sm rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 shadow-xl"
        >
          <DialogTitle class="text-xl font-semibold text-text dark:text-gray-100 mb-4">
            Still there? 👋
          </DialogTitle>

          <p class="text-text/80 dark:text-gray-300 mb-4">
            We noticed you've been inactive for a while. Need a break or just
            deep in thought?
          </p>

          <div class="flex justify-end">
            <button @click="resetActivityTimer" class="btn btn-primary">
              I'm here
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">Spasta Redirect Parameters</h1>
    <div v-if="params && Object.keys(params).length" class="space-y-4">
      <div
        v-for="(value, key) in params"
        :key="key"
        class="relative bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
      >
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 break-words">
            <span class="font-bold">{{ key }}:</span>
            <span class="block bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 break-words">
              {{ value }}
            </span>
          </p>
        </div>
        <!-- Copy Button -->
        <button
          @click="copyToClipboard(value)"
          class="btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mt-4 w-full"
        >
          Copy
        </button>
      </div>
    </div>
    <div v-else>
      <p class="text-gray-500 dark:text-gray-400 text-center">No parameters found in the URL.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const params = ref({});

const getQueryParams = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of urlParams.entries()) {
    result[key] = value;
  }
  return result;
};

const copyToClipboard = (value) => {
  navigator.clipboard.writeText(value).then(() => {
    alert("Copied to clipboard!");
  });
};

onMounted(() => {
  params.value = getQueryParams();
});
</script>

<style scoped>
.container {
  max-width: 600px;
}
.btn {
  transition: transform 0.2s ease;
}
.btn:active {
  transform: scale(0.95);
}
</style>
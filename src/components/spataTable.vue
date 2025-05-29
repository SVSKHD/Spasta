<template>
  <div class="p-4">
    <!-- Search Bar -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="input w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
      />
    </div>

    <!-- Data Table -->
    <div class="overflow-x-auto">
      <table class="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700">
            <th
              v-for="column in columns"
              :key="column"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-left"
            >
              {{ column }}
            </th>
            <th class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Add transition-group for row animations -->
          <transition-group name="fade" tag="tbody">
            <tr
              v-for="row in paginatedRows"
              :key="row.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td
                v-for="column in columns"
                :key="column"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600"
              >
                {{ row[column] }}
              </td>
              <!-- Actions Column -->
              <td class="px-4 py-2 border border-gray-300 dark:border-gray-600">
                <button
                  @click="onEdit(row)"
                  class="btn px-2 py-1 bg-blue-500 text-white rounded-md flex items-center space-x-2"
                >
                  <span class="material-icons">edit</span>
                  <span>Edit</span>
                </button>
                <button
                  @click="onDelete(row)"
                  class="btn px-2 py-1 bg-red-500 text-white rounded-md flex items-center space-x-2 mt-2"
                >
                  <span class="material-icons">delete</span>
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          </transition-group>
          <tr v-if="paginatedRows.length === 0">
            <td
              :colspan="columns.length + 1"
              class="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              No data found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="btn px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-md"
      >
        Previous
      </button>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="btn px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-md"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props for dynamic rows and columns
const props = defineProps<{
  rows: Record<string, any>[]
  columns: string[]
  rowsPerPage?: number
}>()

// Search query
const searchQuery = ref('')

// Pagination state
const currentPage = ref(1)
const rowsPerPage = ref(props.rowsPerPage || 10)

// Filtered rows based on search query
const filteredRows = computed(() => {
  if (!searchQuery.value) return props.rows
  return props.rows.filter(row =>
    props.columns.some(column =>
      String(row[column]).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )
})

// Paginated rows
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredRows.value.slice(start, end)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredRows.value.length / rowsPerPage.value)
})

// Pagination methods
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Edit and Delete handlers
const onEdit = (row) => {
  // Handle edit action
  console.log('Edit:', row)
}

const onDelete = (row) => {
  // Handle delete action
  console.log('Delete:', row)
}
</script>

<style scoped>
.input {
  border: 1px solid #d1d5db;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #3b82f6;
  outline: none;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
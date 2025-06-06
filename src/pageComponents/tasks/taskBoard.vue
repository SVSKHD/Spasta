<template>
  <SpastaCategoryPanel
    :tabs="categories"
    @select-category="handleCategorySelect"
  />

  <div class="row q-col-gutter-md q-mt-md">
    <div
      v-for="column in flow"
      :key="column.id"
      class="col-4"
      @dragover.prevent
      @dragenter="hoveredColumnId = column.id"
      @dragleave="hoveredColumnId = null"
      @drop="handleDrop($event, column.id)"
    >
      <q-card flat bordered class="q-pa-sm task-rack text-white">
            <q-card class="task-card text-white">
      <q-card-section class="task-card text-white">
        <div class="text-h6">{{ column.name }}</div>
        <div class="text-subtitle2">by John Doe</div>
      </q-card-section>
    </q-card>

        <transition-group name="fade-slide" tag="div" class="q-mt-sm">
          <div
            v-for="task in tasksByFlow(column.id)"
            :key="task.id"
            class="q-mb-sm"
            draggable="true"
            @dragstart="handleDragStart(task)"
            :class="{ 'dragging': draggedTask?.id === task.id }"
          >
          <spasta-taskcard
            :task="task"/>
            <!-- <q-card class="task-card  text-white" flat bordered>
              <q-card-section>
                <div class="row justify-between items-center">
                  <div class="text-subtitle1">{{ task.title }}</div>
                  <q-badge
                    color="yellow"
                    text-color="black"
                    class="q-ml-sm"
                    v-if="task.priority"
                    :label="task.priority"
                  />
                </div>
                <div class="text-caption">Due: {{ formatDate(task.dueDate) }}</div>
              </q-card-section>
            </q-card> -->
          </div>
        </transition-group>

        <div
          v-if="tasksByFlow(column.id).length === 0"
          class="text-grey-5 text-caption text-center q-my-sm"
        >
          No tasks in this flow
        </div>

        <!-- Priority Hover Count -->
        <q-tooltip anchor="bottom middle" self="top middle" v-if="tasksByFlow(column.id).length">
          <div v-for="p in ['low', 'medium', 'high']" :key="p">
            {{ p.toUpperCase() }}: {{ countPriority(column.id, p) }}
          </div>
        </q-tooltip>
      </q-card>
    </div>
  </div>

  <div class="q-mt-md text-white">
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import SpastaCategoryPanel from "./categoryPanel.vue";
import { useTaskStore, type Task } from "../../store/taskStore";
import { useCategoryStore, type Category, type CategoryFlow } from "../../store/categoryStore";
import { useAuthStore } from "../../store/authStore";
import { useSubTaskStore } from "../../store/subTaskStore";

const router = useRouter();
const taskStore = useTaskStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const subTaskStore = useSubTaskStore();

const selectedCategoryId = ref<string | null>(null);
const flow = ref<CategoryFlow[]>([]);
const draggedTask = ref<Task | null>(null);
const isLoading = ref(true);

const categories = computed<Category[]>(() =>
  categoryStore.categories.sort((a, b) => a.name.localeCompare(b.name))
);

async function refreshTasks() {
  await subTaskStore.fetchSubTasks();
  await taskStore.fetchTasks();
}

const allTasks = computed<Task[]>(() => {
  return taskStore.tasks.map((t) => {
    if ((t as any).data) {
      const { data, id, userId, createdAt, updatedAt } = t as any;
      return { id, userId, createdAt, updatedAt, ...(data as object) } as Task;
    }
    return t;
  });
});

const filteredTasks = computed<Task[]>(() => {
  if (!selectedCategoryId.value) return [];
  return allTasks.value.filter((t) => t.categoryId === selectedCategoryId.value);
});

const tasksByFlow = (flowId: string) => {
  return filteredTasks.value.filter((t) => t.flowId === flowId);
};

function handleCategorySelect(category: Category) {
  selectedCategoryId.value = category.id;
  flow.value = category.flows || [];
}

function handleDragStart(task: Task) {
  draggedTask.value = task;
}

function handleDrop(event: DragEvent, newFlowId: string) {
  if (!draggedTask.value) return;
  draggedTask.value.flowId = newFlowId;
  taskStore.updateTask(draggedTask.value.id, { flowId: newFlowId });
  draggedTask.value = null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

const hoveredColumnId = ref<string | null>(null);

function countPriority(flowId: string, priority: string) {
  return tasksByFlow(flowId).filter((t) => t.priority === priority).length;
}


onMounted(async () => {
  if (!authStore.user) {
    console.warn("User not authenticated.");
  }
  try {
    await categoryStore.fetchCategories();
    await refreshTasks();
    if (categories.value.length) {
      selectedCategoryId.value = categories.value[0].id;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>


<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.task-rack {
  min-height: 300px;
  transition: border 0.3s ease;
  border: 2px solid transparent;
}
.task-rack{
  background-color: var(--theme-primary);
  height: calc(100vh - 18rem); /* Adjust height to account for header or other elements */
  color: var(--theme-text);
  border-radius: 5px;
}
.task-card {
  background-color: var(--theme-secondary);
  color: var(--theme-text);
  border-radius: 5px; 
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: move;
  border-radius: 20px!important;
}

.task-card.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

</style>

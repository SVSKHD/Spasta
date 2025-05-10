<script setup lang="ts">
import { ref, computed } from "vue";
import { format } from "date-fns";
import { useFitnessStore, type Workout } from "../store/fitnessStore";

const props = defineProps<{
  workouts: Workout[];
}>();

const fitnessStore = useFitnessStore();
const showAddForm = ref(false);
const isSubmitting = ref(false);

const newWorkout = ref<
  Omit<Workout, "id" | "userId" | "createdAt" | "updatedAt">
>({
  name: "",
  date: new Date(),
  type: "strength",
  duration: 60,
  exercises: [],
  notes: "",
});

const workoutsByMonth = computed(() => {
  const grouped: Record<string, Workout[]> = {};

  props.workouts.forEach((workout) => {
    const month = format(workout.date, "MMMM yyyy");
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(workout);
  });

  // Sort workouts within each month by date (newest first)
  Object.keys(grouped).forEach((month) => {
    grouped[month].sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  return grouped;
});

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
  if (!showAddForm.value) {
    // Reset form
    newWorkout.value = {
      name: "",
      date: new Date(),
      type: "strength",
      duration: 60,
      exercises: [],
      notes: "",
    };
  } else {
    // Add one default exercise
    addNewExercise();
  }
};

const addNewExercise = () => {
  newWorkout.value.exercises.push({
    name: "",
    sets: 3,
    reps: 10,
  });
};

const removeExercise = (index: number) => {
  newWorkout.value.exercises.splice(index, 1);
};

const handleAddWorkout = async () => {
  if (!newWorkout.value.name) return;

  isSubmitting.value = true;
  try {
    await fitnessStore.addWorkout(newWorkout.value);
    toggleAddForm();
  } catch (error) {
    console.error("Error adding workout:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteWorkout = async (workoutId: string) => {
  if (confirm("Are you sure you want to delete this workout?")) {
    try {
      await fitnessStore.deleteWorkout(workoutId);
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  }
};

const formatWorkoutDate = (date: Date) => {
  return format(date, "EEEE, MMMM d, yyyy");
};
</script>

<template>
  <div class="space-y-6 animate-slide-in">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
        Workout Tracker
      </h2>
      <button @click="toggleAddForm" class="btn btn-primary">
        {{ showAddForm ? "Cancel" : "+ Add Workout" }}
      </button>
    </div>

    <!-- Add Workout Form -->
    <div
      v-if="showAddForm"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-slide-up"
    >
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        New Workout
      </h3>

      <form @submit.prevent="handleAddWorkout" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Workout Name</label
            >
            <input
              v-model="newWorkout.name"
              type="text"
              class="input dark:bg-gray-700 dark:text-gray-100"
              required
              placeholder="Leg Day"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Date</label
            >
            <input
              v-model="newWorkout.date"
              type="date"
              class="input dark:bg-gray-700 dark:text-gray-100"
              :max="new Date().toISOString().split('T')[0]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Workout Type</label
            >
            <select
              v-model="newWorkout.type"
              class="input dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="hiit">HIIT</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Duration (minutes)</label
            >
            <input
              v-model.number="newWorkout.duration"
              type="number"
              min="1"
              class="input dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Exercises</label
            >
            <button
              type="button"
              @click="addNewExercise"
              class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              + Add Exercise
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(exercise, index) in newWorkout.exercises"
              :key="index"
              class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
            >
              <div class="flex justify-between mb-2">
                <h4 class="font-medium text-gray-900 dark:text-gray-100">
                  Exercise {{ index + 1 }}
                </h4>
                <button
                  type="button"
                  @click="removeExercise(index)"
                  class="text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-400"
                >
                  ✕
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="md:col-span-2">
                  <input
                    v-model="exercise.name"
                    type="text"
                    class="input dark:bg-gray-600 dark:text-gray-100"
                    placeholder="Exercise name"
                    required
                  />
                </div>
                <div>
                  <input
                    v-model.number="exercise.sets"
                    type="number"
                    min="1"
                    class="input dark:bg-gray-600 dark:text-gray-100"
                    placeholder="Sets"
                    required
                  />
                </div>
                <div>
                  <input
                    v-model.number="exercise.reps"
                    type="number"
                    min="1"
                    class="input dark:bg-gray-600 dark:text-gray-100"
                    placeholder="Reps"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Notes</label
          >
          <textarea
            v-model="newWorkout.notes"
            class="input h-24 dark:bg-gray-700 dark:text-gray-100"
            placeholder="How did the workout feel?"
          ></textarea>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="btn btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
            :disabled="isSubmitting || newWorkout.exercises.length === 0"
          >
            {{ isSubmitting ? "Saving..." : "Save Workout" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Workout History -->
    <div class="space-y-8">
      <div
        v-for="(workouts, month) in workoutsByMonth"
        :key="month"
        class="space-y-4"
      >
        <h3
          class="text-lg font-medium border-b pb-2 text-gray-900 dark:text-gray-100"
        >
          {{ month }}
        </h3>

        <div class="space-y-4">
          <div
            v-for="workout in workouts"
            :key="workout.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div>
                <h4
                  class="text-lg font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ workout.name }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatWorkoutDate(workout.date) }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  class="inline-block px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-700 dark:text-primary-200"
                >
                  {{ workout.type }}
                </span>
                <span
                  class="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {{ workout.duration }} min
                </span>
                <button
                  @click="handleDeleteWorkout(workout.id)"
                  class="text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-400"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
            >
              <h5
                class="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
              >
                Exercises
              </h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="(exercise, i) in workout.exercises"
                  :key="i"
                  class="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm"
                >
                  <div class="font-medium text-gray-900 dark:text-gray-100">
                    {{ exercise.name }}
                  </div>
                  <div class="text-gray-500 dark:text-gray-400">
                    {{ exercise.sets }} sets &times; {{ exercise.reps }} reps
                    <span v-if="exercise.weight">
                      @ {{ exercise.weight }}kg</span
                    >
                    <span v-if="exercise.duration">
                      for {{ exercise.duration }}min</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="workout.notes"
              class="mt-3 text-sm text-gray-600 dark:text-gray-400 italic"
            >
              "{{ workout.notes }}"
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="Object.keys(workoutsByMonth).length === 0"
        class="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <p class="text-gray-500 dark:text-gray-400 mb-3">
          No workout history found
        </p>
        <button @click="toggleAddForm" class="btn btn-primary">
          Record your first workout
        </button>
      </div>
    </div>
  </div>
</template>

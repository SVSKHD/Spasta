import type { App } from 'vue'
import TaskCard from './TaskCard.vue'

export default function AppRegistry(app: App): void {
  app.component('spasta-task-card', TaskCard)
}
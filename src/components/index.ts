import type { App } from "vue"

// Import all .vue files directly in the components folder (not subfolders)
const modules = import.meta.glob('./*.vue', { eager: true })

// Utility to convert './spastaCalendar.vue' => 'SpastaCalendar'
function fileNameToComponentName(path: string): string {
  const file = path.split('/').pop()!.replace('.vue', '')
  return file.charAt(0).toUpperCase() + file.slice(1)
}

export const spastaComponents = (app: App) => {
  for (const path in modules) {
    const mod: any = modules[path]
    const component = mod.default

    // Get name from `defineOptions` or fallback to filename
    const name = component?.name || fileNameToComponentName(path)

    // Only register components that start with "Spasta"
    if (name.startsWith("Spasta")) {
      app.component(name, component)
    }
  }
}

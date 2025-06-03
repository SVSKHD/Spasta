import type { App } from 'vue'

export default async function AppRegistry(app: App): Promise<void> {
  // Dynamically import all `.vue` files in the current directory
  const components = import.meta.glob('./*.vue')

  for (const [path, component] of Object.entries(components)) {
    // Extract the file name without extension
    const name = path.match(/\.\/(.*)\.vue$/)?.[1]
    if (name) {
      // Dynamically resolve the component
      const resolvedComponent = await component()
      // Register the component with the "spasta-" prefix
      app.component(`spasta-${name.toLowerCase()}`, resolvedComponent.default)
    }
  }
}
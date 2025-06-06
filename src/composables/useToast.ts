// src/composables/useToast.ts
import { useQuasar } from 'quasar'

export function useToast() {
  const $q = useQuasar()

  const toast = (
    message: string,
    type: 'positive' | 'negative' | 'warning' | 'info' = 'info',
    caption?: string
  ) => {
    $q.notify({
      message,
      caption,
      type,
      position: 'top-right',
      timeout: 2500,
      actions: [{ icon: 'close', color: 'white' }]
    })
  }

  return { toast }
}

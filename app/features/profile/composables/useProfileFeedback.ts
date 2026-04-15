import { ref } from 'vue'
import type { Feedback, FeedbackType } from '../types'

/**
 * useProfileFeedback
 * Provides a reactive flash message with auto-clear for form feedback.
 */
export function useProfileFeedback (durationMs = 3500) {
  const feedback = ref<Feedback | null>(null)

  function flash (message: string, type: FeedbackType = 'success') {
    feedback.value = { message, type }
    setTimeout(() => { feedback.value = null }, durationMs)
  }

  return { feedback, flash }
}
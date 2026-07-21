const STORAGE_KEY_PREFIX = 'summarizationModel'

export function getSummarizationModelStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}:${userId}`
}

export function getSummarizationModel(userId?: string | null): string {
  if (!userId) {
    return ''
  }

  try {
    return localStorage.getItem(getSummarizationModelStorageKey(userId)) ?? ''
  } catch (error) {
    console.error('Failed to read summarization model preference:', error)
    return ''
  }
}

export function setSummarizationModel(userId: string, modelId: string): void {
  if (!modelId.trim()) {
    throw new Error('Model ID is required')
  }

  localStorage.setItem(getSummarizationModelStorageKey(userId), modelId)
}

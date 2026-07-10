import { llmRoutes } from './routes'

export interface SavedPrompt {
  id: string
  name: string
  promptType: string
  promptTemplate: string
  createdAt?: string
  updatedAt?: string
}

async function listSavedPrompts(promptType: string, headers: Record<string, string>) {
  const response = await fetch(`${llmRoutes.savedPrompts}?type=${encodeURIComponent(promptType)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch saved prompts')
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data as SavedPrompt[]
  }

  if (Array.isArray(data?.savedPrompts)) {
    return data.savedPrompts as SavedPrompt[]
  }

  return []
}

async function createSavedPrompt(
  input: { name: string; promptType: string; promptTemplate: string },
  headers: Record<string, string>,
) {
  const response = await fetch(llmRoutes.savedPrompts, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to save prompt')
  }

  const data = await response.json()
  return data as SavedPrompt
}

export default {
  listSavedPrompts,
  createSavedPrompt,
}

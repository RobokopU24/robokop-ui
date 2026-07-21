import API from '../API/routes'
import { authApi } from '../API/baseUrlProxy'

export interface AdminPrompt {
  type: string
  prompt: string
}

interface GetAdminPromptsResponse {
  prompts: AdminPrompt[]
}

interface GetAdminPromptByTypeResponse {
  type: string
  prompt: string
}

export const getAdminPrompts = async (type?: string): Promise<AdminPrompt[]> => {
  const res = await authApi.get<GetAdminPromptsResponse | GetAdminPromptByTypeResponse>(
    API.adminRoutes.prompts,
    {
      params: type ? { type } : undefined,
    },
  )

  if ('prompts' in res.data) {
    return res.data.prompts
  }

  return [res.data]
}

export const updateAdminPrompt = async (
  type: string,
  promptTemplate: string,
): Promise<AdminPrompt> => {
  const res = await authApi.put<AdminPrompt>(
    `${API.adminRoutes.prompts}/${encodeURIComponent(type)}`,
    {
      promptTemplate,
    },
  )

  return res.data
}

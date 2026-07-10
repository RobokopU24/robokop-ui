import API from '../API/routes'
import { authApi } from '../API/baseUrlProxy'

export interface LlmModel {
  id: number
  name: string
  modelId: string
  isActive: boolean
  isDefault: boolean
}

export interface CreateLlmModelPayload {
  name: string
  modelId: string
  isDefault?: boolean
}

export interface UpdateLlmModelPayload {
  name?: string
  modelId?: string
  isActive?: boolean
  isDefault?: boolean
}

export function getDefaultModelId(models: LlmModel[]): string {
  return models.find((model) => model.isDefault)?.modelId ?? models[0]?.modelId ?? ''
}

export const getLlmModels = async (): Promise<LlmModel[]> => {
  const res = await authApi.get(API.llmModelRoutes.base)
  return res.data
}

export const getActiveLlmModels = async (): Promise<LlmModel[]> => {
  const res = await authApi.get(API.llmModelRoutes.active)
  return res.data
}

export const createLlmModel = async (payload: CreateLlmModelPayload): Promise<LlmModel> => {
  const res = await authApi.post(API.llmModelRoutes.base, payload)
  return res.data
}

export const updateLlmModel = async (
  id: number,
  payload: UpdateLlmModelPayload,
): Promise<LlmModel> => {
  const res = await authApi.put(`${API.llmModelRoutes.base}/${id}`, payload)
  return res.data
}

export const deactivateLlmModels = async (modelIds: number[]): Promise<void> => {
  await authApi.delete(API.llmModelRoutes.base, { data: { modelIds } })
}

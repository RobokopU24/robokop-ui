import axios from 'axios'
import { releasesRoutes } from '../../API/routes'
import { authApi } from '../../API/baseUrlProxy'

export type GitHubRelease = {
  id: number
  tagName: string
  nodeId?: string
  name?: string
  body?: string
  draft?: boolean
  prerelease?: boolean
  immutable?: boolean
  targetCommitish?: string
  htmlUrl?: string
  url?: string
  assetsUrl?: string
  uploadUrl?: string
  tarballUrl?: string
  zipballUrl?: string
  author?: object
  assets?: object[]
  mentionsCount?: number
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export const getReleaseNotes = async (): Promise<GitHubRelease[]> => {
  const res = await axios.get(releasesRoutes.base)
  return res.data
}

export type CreateReleasePayload = {
  title: string
  tag: string
  content: string
}

export type UpdateReleasePayload = CreateReleasePayload

export const createRelease = async (payload: CreateReleasePayload): Promise<GitHubRelease> => {
  const res = await authApi.post(releasesRoutes.base, payload)
  return res.data
}

export const updateRelease = async (
  id: number,
  payload: UpdateReleasePayload,
): Promise<GitHubRelease> => {
  const res = await authApi.put(`${releasesRoutes.base}/${id}`, payload)
  return res.data
}

export const deleteRelease = async (id: number): Promise<void> => {
  await authApi.delete(`${releasesRoutes.base}/${id}`)
}

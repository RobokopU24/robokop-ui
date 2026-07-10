import React, { useCallback } from 'react'
import AISummaryModal from '../../../components/AISummaryModal'
import { llmRoutes } from '../../../API/routes'

interface SummarizeKGNodesWithAIModalProps {
  isOpen: boolean
  onModalClose: () => void
  minimalJson: unknown
  isLoggedIn: boolean
  canSummarize: boolean
}

function SummarizeKGNodesWithAIModal({
  isOpen,
  onModalClose,
  minimalJson,
  isLoggedIn,
  canSummarize,
}: SummarizeKGNodesWithAIModalProps) {
  const canRun = isLoggedIn && canSummarize
  const blockedMessage = !isLoggedIn
    ? 'Please log in to use the summarization feature.'
    : 'This is a premium feature. Please upgrade your account to access AI-powered summarization.'

  const buildAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }, [])

  const buildRequestBody = useCallback(
    ({
      promptTemplate,
      savedPromptId,
      modelId,
    }: {
      promptTemplate?: string
      savedPromptId?: string
      modelId?: string
    }) => ({
      minimalJson,
      promptTemplate,
      savedPromptId,
      modelId,
    }),
    [minimalJson],
  )

  return (
    <AISummaryModal
      isOpen={isOpen}
      onClose={onModalClose}
      title='Summarize Results with AI'
      promptType='kg-nodes-summary'
      promptLabel='KG Nodes Summary Prompt Template'
      promptPlaceholder='Write your KG nodes summarization prompt template'
      placeholderHint='{{minimalJson}}'
      streamUrl={llmRoutes.summarizeKGNodes}
      canSummarize={canRun}
      blockedMessage={blockedMessage}
      requestDependencyKey={JSON.stringify(minimalJson)}
      buildAuthHeaders={buildAuthHeaders}
      buildRequestBody={buildRequestBody}
    />
  )
}

export default SummarizeKGNodesWithAIModal

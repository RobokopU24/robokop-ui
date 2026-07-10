import React, { useCallback } from 'react'
import { llmRoutes } from '../../../API/routes'
import { useBYOK } from '../../../context/BYOKContext'
import AISummaryModal from '../../../components/AISummaryModal'

function SummaryModal({
  isOpen,
  onModalClose,
  links,
  ids,
}: {
  isOpen: boolean
  onModalClose: () => void
  links: string[]
  ids: string[]
}) {
  const { isActive, sessionToken } = useBYOK()

  const buildAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {}

    if (isActive && sessionToken) {
      headers['X-BYOK-Session'] = sessionToken
    }

    if (!isActive && token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }, [isActive, sessionToken])

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
      urls: links,
      ids,
      promptTemplate,
      savedPromptId,
      modelId,
    }),
    [ids, links],
  )

  return (
    <AISummaryModal
      isOpen={isOpen}
      onClose={onModalClose}
      title='Summary of Publications'
      promptType='article-summary'
      promptLabel='Article Summary Prompt Template'
      promptPlaceholder='Write your article summarization prompt template'
      placeholderHint='{{abstractsWithLinkByIDs}}'
      streamUrl={llmRoutes.summarizeLinks}
      requestDependencyKey={`${ids.join('|')}::${links.join('|')}`}
      buildAuthHeaders={buildAuthHeaders}
      buildRequestBody={buildRequestBody}
    />
  )
}

export default SummaryModal

import React, { useCallback, useContext, useMemo } from 'react'
import useAnswerStore from '../useAnswerStore'
import { llmRoutes } from '../../../API/routes'
import { graphQueryContext } from './graphQueryContext'
import BiolinkContext from '../../../context/biolink'
import { BiolinkContextType } from '../../queryBuilder/textEditor/types'
import { useBYOK } from '../../../context/BYOKContext'
import AISummaryModal from '../../../components/AISummaryModal'

interface SummarizeTableWithAIModalProps {
  isOpen: boolean
  onModalClose: () => void
  answerStore: ReturnType<typeof useAnswerStore>
}

function SummarizeTableWithAIModal({
  isOpen,
  onModalClose,
  answerStore,
}: SummarizeTableWithAIModalProps) {
  const tableData = useMemo(() => {
    if (!answerStore.message.results || !answerStore.tableHeaders.length) {
      return { headers: [], rows: [] }
    }

    const headers = answerStore.tableHeaders.map((header) => ({
      id: header.id,
      label: header.Header,
      color: header.color,
      width: header.width,
    }))

    const rows = answerStore.message.results.map((result, index) => {
      const row: any = { _rowId: index }

      answerStore.tableHeaders.forEach((header) => {
        let cellValue

        if (typeof header.accessor === 'function') {
          cellValue = header.accessor(result)
        } else if (typeof header.accessor === 'string') {
          cellValue = result[header.accessor]
        } else {
          cellValue = ''
        }

        const displayValue = header.Cell ? header.Cell({ value: cellValue }) : cellValue

        row[header.id] = displayValue
      })

      return row
    })

    const maxRowsLimit = 150
    if (rows.length > maxRowsLimit) {
      const sorted = [...rows].sort((a, b) => b.score - a.score)
      const highCutoff = Math.ceil(sorted.length * 0.2)
      const lowCutoff = Math.floor(sorted.length * 0.8)
      const high = sorted.slice(0, highCutoff)
      const mid = sorted.slice(highCutoff, lowCutoff)
      const low = sorted.slice(lowCutoff)
      const sample = (arr: any[], n: number) =>
        arr.length <= n
          ? arr
          : arr.filter((_, i) => i % Math.ceil(arr.length / n) === 0).slice(0, n)
      const highSampled = sample(high, Math.ceil(maxRowsLimit * 0.25))
      const midSampled = sample(mid, Math.floor(maxRowsLimit * 0.5))
      const lowSampled = sample(low, maxRowsLimit - highSampled.length - midSampled.length)
      const limitedRows = [...highSampled, ...midSampled, ...lowSampled]
      return { headers, rows: limitedRows, truncated: true }
    }
    return { headers, rows, truncated: false }
  }, [answerStore.message.results, answerStore.tableHeaders])

  const transformTableDataToMarkdown = (tableMarkdownData: { headers: any[]; rows: any[] }) => {
    const { headers, rows } = tableMarkdownData
    let markdown = ''
    markdown += '| ' + headers.map((header) => header.label).join(' | ') + ' |\n'
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
    rows.forEach((row) => {
      markdown += '| ' + headers.map((header) => row[header.id]).join(' | ') + ' |\n'
    })
    return markdown
  }

  const tableDataMarkdown = transformTableDataToMarkdown(tableData)
  const { predicates } = useContext(BiolinkContext) as BiolinkContextType
  const queryGraph = graphQueryContext(answerStore.message.query_graph, predicates)
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
      tableData: tableDataMarkdown,
      queryGraph,
      truncated: tableData.truncated,
      promptTemplate,
      savedPromptId,
      modelId,
    }),
    [queryGraph, tableData.truncated, tableDataMarkdown],
  )

  return (
    <AISummaryModal
      isOpen={isOpen}
      onClose={onModalClose}
      title='Summarize with AI'
      promptType='table-summary'
      promptLabel='Table Summary Prompt Template'
      promptPlaceholder='Write your table summarization prompt template'
      placeholderHint='{{queryGraph}}, {{tableData}}, {{truncationNote}}'
      streamUrl={llmRoutes.summarizeTable}
      requestDependencyKey={`${tableData.rows.length}:${tableData.truncated}:${queryGraph}`}
      buildAuthHeaders={buildAuthHeaders}
      buildRequestBody={buildRequestBody}
    />
  )
}

export default SummarizeTableWithAIModal

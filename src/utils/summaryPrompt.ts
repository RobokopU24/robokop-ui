const tablePlaceholderAliases: Record<string, string> = {
  TABLE_QUERY_GRAPH_PLACEHOLDER: 'queryGraph',
  TABLE_DATA_PLACEHOLDER: 'tableData',
  TABLE_TRUNCATION_NOTE_PLACEHOLDER: 'truncationNote',
}

export function buildSummaryPromptInput(
  promptType: string,
  template: string,
  savedPrompt?: { id: string; promptTemplate: string },
): { promptTemplate?: string; savedPromptId?: string } {
  // Some stored templates use constant names instead of the server's template variables.
  const normalizedTemplate =
    promptType === 'table-summary'
      ? template.replace(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name: string) =>
          Object.hasOwn(tablePlaceholderAliases, name)
            ? `{{${tablePlaceholderAliases[name]}}}`
            : placeholder,
        )
      : template

  // A legacy saved template must be sent inline so the server uses the corrected version.
  if (savedPrompt && savedPrompt.promptTemplate === normalizedTemplate) {
    return { savedPromptId: savedPrompt.id }
  }

  return { promptTemplate: normalizedTemplate }
}

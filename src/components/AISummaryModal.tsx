import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import { useQuery } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { llmRoutes } from '../API/routes'
import savedPromptsApi, { SavedPrompt } from '../API/savedPrompts'
import { getActiveLlmModels, getDefaultModelId } from '../functions/llmModelFunctions'

interface AISummaryModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  promptType: string
  promptLabel: string
  promptPlaceholder: string
  placeholderHint: string
  streamUrl: string
  canSummarize?: boolean
  blockedMessage?: string
  requestDependencyKey?: string
  buildAuthHeaders: () => Record<string, string>
  buildRequestBody: (input: {
    promptTemplate?: string
    savedPromptId?: string
    modelId?: string
  }) => unknown
}

function AISummaryModal({
  isOpen,
  onClose,
  title,
  promptType,
  promptLabel,
  promptPlaceholder,
  placeholderHint,
  streamUrl,
  canSummarize = true,
  blockedMessage,
  requestDependencyKey,
  buildAuthHeaders,
  buildRequestBody,
}: AISummaryModalProps) {
  const [streamedText, setStreamedText] = useState('')
  const [promptTemplate, setPromptTemplate] = useState('')
  const [defaultPromptTemplate, setDefaultPromptTemplate] = useState('')
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [selectedSavedPromptId, setSelectedSavedPromptId] = useState('')
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false)
  const [isLoadingPromptTemplate, setIsLoadingPromptTemplate] = useState(false)
  const [isLoadingSavedPrompts, setIsLoadingSavedPrompts] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isPersistingPrompt, setIsPersistingPrompt] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState('')
  const [requestError, setRequestError] = useState<string | null>(null)
  const summaryAbortControllerRef = useRef<AbortController | null>(null)
  const promptAbortControllerRef = useRef<AbortController | null>(null)
  const autoRunKeyRef = useRef<string | null>(null)
  const defaultPromptTemplateRef = useRef('')
  const streamSummaryRef = useRef<
    (templateOverride: string, defaultTemplateForComparison?: string) => Promise<void>
  >(async () => {})

  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['activeLlmModels'],
    queryFn: getActiveLlmModels,
    enabled: isOpen && canSummarize,
  })

  useEffect(() => {
    if (!models.length) {
      return
    }

    if (selectedModelId && models.some((model) => model.modelId === selectedModelId)) {
      return
    }

    setSelectedModelId(getDefaultModelId(models))
  }, [models, selectedModelId])

  const fetchPromptTemplate = useCallback(async () => {
    if (promptAbortControllerRef.current) {
      promptAbortControllerRef.current.abort()
    }

    promptAbortControllerRef.current = new AbortController()
    setIsLoadingPromptTemplate(true)
    setRequestError(null)

    try {
      const response = await fetch(`${llmRoutes.prompts}?type=${promptType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        signal: promptAbortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch summary prompt template')
      }

      const data = await response.json()
      const fetchedPromptTemplate =
        typeof data === 'string'
          ? data
          : data.promptTemplate || data.template || data.prompt || data.value || ''

      defaultPromptTemplateRef.current = fetchedPromptTemplate
      setDefaultPromptTemplate(fetchedPromptTemplate)
      setPromptTemplate(fetchedPromptTemplate)
      setSelectedSavedPromptId('')
      return fetchedPromptTemplate
    } finally {
      setIsLoadingPromptTemplate(false)
    }
  }, [buildAuthHeaders, promptType])

  const fetchSavedPrompts = useCallback(async () => {
    const headers = buildAuthHeaders()
    if (!headers.Authorization) {
      setSavedPrompts([])
      setSelectedSavedPromptId('')
      return [] as SavedPrompt[]
    }

    setIsLoadingSavedPrompts(true)

    try {
      const prompts = await savedPromptsApi.listSavedPrompts(promptType, headers)
      setSavedPrompts(prompts)
      return prompts
    } catch (error) {
      console.error('[saved-prompts] failed to fetch', error)
      setSavedPrompts([])
      setSelectedSavedPromptId('')
      return [] as SavedPrompt[]
    } finally {
      setIsLoadingSavedPrompts(false)
    }
  }, [buildAuthHeaders, promptType])

  const persistPromptTemplate = useCallback(
    async (template: string) => {
      const trimmedTemplate = template.trim()
      if (!trimmedTemplate) {
        return undefined
      }

      const headers = buildAuthHeaders()
      if (!headers.Authorization) {
        return undefined
      }

      const existingPrompt = savedPrompts.find(
        (savedPrompt) =>
          savedPrompt.promptType === promptType &&
          savedPrompt.promptTemplate.trim() === trimmedTemplate,
      )

      if (existingPrompt) {
        return existingPrompt.id
      }

      setIsPersistingPrompt(true)

      try {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16)
        const savedPrompt = await savedPromptsApi.createSavedPrompt(
          {
            name: `${title} ${timestamp}`,
            promptType,
            promptTemplate: template,
          },
          headers,
        )

        setSavedPrompts((previous) => [...previous, savedPrompt])
        setSelectedSavedPromptId(savedPrompt.id)
        return savedPrompt.id
      } catch (error) {
        console.error('[saved-prompts] failed to save', error)
        return undefined
      } finally {
        setIsPersistingPrompt(false)
      }
    },
    [buildAuthHeaders, promptType, savedPrompts, title],
  )

  const streamSummary = useCallback(
    async (templateOverride: string, defaultTemplateForComparison?: string) => {
      if (summaryAbortControllerRef.current) {
        summaryAbortControllerRef.current.abort()
      }

      summaryAbortControllerRef.current = new AbortController()
      setStreamedText('')
      setRequestError(null)
      setIsSummarizing(true)

      try {
        const selectedSavedPrompt = savedPrompts.find(
          (savedPrompt) => savedPrompt.id === selectedSavedPromptId,
        )
        const selectedTemplateMatchesCurrent =
          !!selectedSavedPrompt && selectedSavedPrompt.promptTemplate === templateOverride

        let savedPromptId: string | undefined =
          selectedTemplateMatchesCurrent && selectedSavedPromptId
            ? selectedSavedPromptId
            : undefined

        let promptToSend: string | undefined = templateOverride

        if (savedPromptId) {
          promptToSend = undefined
        } else {
          const trimmedTemplate = templateOverride.trim()
          const baselineDefaultTemplate = (
            defaultTemplateForComparison ??
            defaultPromptTemplateRef.current ??
            defaultPromptTemplate
          ).trim()
          const isDefaultTemplate = trimmedTemplate === baselineDefaultTemplate
          if (!isDefaultTemplate) {
            const persistedPromptId = await persistPromptTemplate(templateOverride)
            if (persistedPromptId) {
              savedPromptId = persistedPromptId
            }
          }
        }

        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(),
          },
          body: JSON.stringify(
            buildRequestBody({
              promptTemplate: promptToSend,
              savedPromptId,
              modelId: selectedModelId || undefined,
            }),
          ),
          signal: summaryAbortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to generate summary')
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }

            const chunk = decoder.decode(value)
            setStreamedText((prev) => prev + chunk)
          }
        } finally {
          reader.releaseLock()
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        setRequestError('Failed to summarize. Please try again.')
      } finally {
        setIsSummarizing(false)
      }
    },
    [
      buildAuthHeaders,
      buildRequestBody,
      defaultPromptTemplate,
      persistPromptTemplate,
      savedPrompts,
      selectedModelId,
      selectedSavedPromptId,
      streamUrl,
    ],
  )

  useEffect(() => {
    streamSummaryRef.current = streamSummary
  }, [streamSummary])

  useEffect(() => {
    if (!isOpen) {
      autoRunKeyRef.current = null

      if (summaryAbortControllerRef.current) {
        summaryAbortControllerRef.current.abort()
        summaryAbortControllerRef.current = null
      }

      if (promptAbortControllerRef.current) {
        promptAbortControllerRef.current.abort()
        promptAbortControllerRef.current = null
      }

      return
    }

    if (!canSummarize) {
      return
    }

    const autoRunKey = requestDependencyKey || '__default__'
    if (autoRunKeyRef.current === autoRunKey) {
      return
    }
    autoRunKeyRef.current = autoRunKey

    let isUnmounted = false

    const loadPromptAndSummarize = async () => {
      try {
        const [currentPromptTemplate] = await Promise.all([
          fetchPromptTemplate(),
          fetchSavedPrompts(),
        ])

        if (!isUnmounted) {
          await streamSummaryRef.current(currentPromptTemplate, currentPromptTemplate)
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        if (!isUnmounted) {
          setRequestError('Failed to load prompt template. Please try again.')
        }
      }
    }

    loadPromptAndSummarize()

    return () => {
      isUnmounted = true
    }
  }, [canSummarize, fetchPromptTemplate, fetchSavedPrompts, isOpen, requestDependencyKey])

  useEffect(() => {
    return () => {
      if (summaryAbortControllerRef.current) {
        summaryAbortControllerRef.current.abort()
      }

      if (promptAbortControllerRef.current) {
        promptAbortControllerRef.current.abort()
      }
    }
  }, [])

  const canSavePrompts = Boolean(buildAuthHeaders().Authorization)
  const summaryIsLoading = isSummarizing || isLoadingPromptTemplate

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, md: 2 },
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 1160 },
          height: { xs: '94vh', md: '86vh' },
          maxHeight: 960,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha('#ffffff', 0.6),
          boxShadow: '0 28px 90px rgba(15, 23, 42, 0.28)',
          background:
            'linear-gradient(165deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.95) 55%, rgba(255,255,255,0.95) 100%)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -240,
            left: -120,
            width: 420,
            height: 420,
            background:
              'radial-gradient(circle, rgba(122,90,251,0.2) 0%, rgba(122,90,251,0.03) 66%, rgba(122,90,251,0) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: 420 },
            p: { xs: 2, md: 3.2 },
            borderRight: { xs: 'none', md: '1px solid' },
            borderBottom: { xs: '1px solid', md: 'none' },
            borderColor: '#e2e8f0',
            flexShrink: 0,
            overflowY: 'auto',
            minHeight: 0,
            background:
              'linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,0.86) 45%, rgba(244,247,250,0.88) 100%)',
            zIndex: 1,
          }}
        >
          <Stack direction='row' spacing={1.5} alignItems='flex-start' sx={{ mb: 2.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.4 }}>
                Tune the prompt and model to get stronger, reusable summaries.
              </Typography>
            </Box>
          </Stack>
          {!canSummarize ? (
            <Alert severity='warning' sx={{ borderRadius: 2.5, alignItems: 'center' }}>
              <Typography variant='body2' sx={{ mb: 0 }}>
                {blockedMessage || 'You do not have access to this summary.'}
              </Typography>
            </Alert>
          ) : (
            <>
              <Paper
                variant='outlined'
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  backgroundColor: alpha('#ffffff', 0.72),
                  borderColor: '#e2e8f0',
                }}
              >
                <Typography variant='overline' color='text.secondary' sx={{ letterSpacing: 1 }}>
                  Controls
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 1 }}>
                  <FormControl size='small' fullWidth>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mb: 0.7, fontWeight: 600 }}
                    >
                      Language model
                    </Typography>
                    <Select
                      value={selectedModelId}
                      displayEmpty
                      disabled={isLoadingModels || isSummarizing}
                      onChange={(event) => setSelectedModelId(event.target.value)}
                    >
                      <MenuItem value=''>Default model (server)</MenuItem>
                      {models.map((model) => (
                        <MenuItem key={model.id} value={model.modelId}>
                          {model.name} ({model.modelId})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size='small' fullWidth>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mb: 0.7, fontWeight: 600 }}
                    >
                      Saved prompt
                    </Typography>
                    <Select
                      value={selectedSavedPromptId}
                      displayEmpty
                      disabled={isLoadingSavedPrompts || isSummarizing || savedPrompts.length === 0}
                      onChange={(event) => {
                        const nextSavedPromptId = event.target.value
                        setSelectedSavedPromptId(nextSavedPromptId)

                        const selectedSavedPrompt = savedPrompts.find(
                          (savedPrompt) => savedPrompt.id === nextSavedPromptId,
                        )

                        if (selectedSavedPrompt) {
                          setPromptTemplate(selectedSavedPrompt.promptTemplate)
                        } else {
                          setPromptTemplate(defaultPromptTemplate)
                        }
                      }}
                    >
                      <MenuItem value=''>Default prompt template</MenuItem>
                      {savedPrompts.map((savedPrompt) => (
                        <MenuItem key={savedPrompt.id} value={savedPrompt.id}>
                          {savedPrompt.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction='row' spacing={1}>
                    <Button
                      size='small'
                      variant='outlined'
                      fullWidth
                      startIcon={<EditNoteRoundedIcon fontSize='small' />}
                      onClick={() => setIsPromptEditorOpen((prev) => !prev)}
                      sx={{ borderColor: alpha('#627dff', 0.35), color: '#4b63d4' }}
                    >
                      {isPromptEditorOpen ? 'Hide Editor' : 'Edit Prompt'}
                    </Button>
                    <Button
                      size='small'
                      variant='contained'
                      fullWidth
                      startIcon={<ReplayRoundedIcon fontSize='small' />}
                      disabled={summaryIsLoading || isPersistingPrompt}
                      onClick={() => streamSummary(promptTemplate)}
                      sx={{
                        background:
                          'linear-gradient(89deg, rgba(98,125,255,1) 0%, rgba(122,90,251,1) 100%)',
                        '&:disabled': {
                          background: '#e5e7eb',
                          color: '#6b7280',
                        },
                      }}
                    >
                      {isPersistingPrompt ? 'Saving...' : 'Regenerate'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {isPromptEditorOpen && (
                <Paper
                  variant='outlined'
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2.5,
                    borderColor: '#e2e8f0',
                    backgroundColor: alpha('#ffffff', 0.78),
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={8}
                    maxRows={18}
                    label={promptLabel}
                    value={promptTemplate}
                    onChange={(event) => {
                      setPromptTemplate(event.target.value)
                      setSelectedSavedPromptId('')
                    }}
                    placeholder={promptPlaceholder}
                    sx={{ '& .MuiInputBase-inputMultiline': { overflowY: 'auto' } }}
                  />
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Keep placeholders for best results: {placeholderHint}
                  </Typography>
                  {!canSavePrompts && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 1, display: 'block' }}
                    >
                      Log in to save custom prompts for reuse.
                    </Typography>
                  )}
                </Paper>
              )}
            </>
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 3.2 },
            overflowY: 'auto',
            minHeight: 0,
            zIndex: 1,
            position: 'relative',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent='space-between'
            spacing={1}
            sx={{ mb: 1.2 }}
          >
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 800 }}>
                Summary
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Streaming output updates as the model reasons over your selected context.
              </Typography>
            </Box>
            <Stack direction='row' spacing={0.5} alignItems='center'>
              <Chip
                size='small'
                color={summaryIsLoading ? 'warning' : 'success'}
                variant='outlined'
                label={summaryIsLoading ? 'Generating...' : 'Ready'}
                sx={{ fontWeight: 700 }}
              />
              <IconButton size='small' onClick={onClose} sx={{ color: 'text.secondary' }}>
                <CloseRoundedIcon fontSize='small' />
              </IconButton>
            </Stack>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {!canSummarize ? (
            <Alert severity='warning' sx={{ borderRadius: 2.5, alignItems: 'center' }}>
              <Typography sx={{ mb: 0 }}>
                {blockedMessage || 'You do not have access to this summary.'}
              </Typography>
            </Alert>
          ) : (
            <Paper
              variant='outlined'
              sx={{
                p: { xs: 1.6, md: 2.2 },
                borderRadius: 2.8,
                minHeight: 300,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.78) 100%)',
                borderColor: '#e2e8f0',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              {requestError && (
                <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>
                  {requestError}
                </Alert>
              )}
              {streamedText ? (
                <Box
                  sx={{
                    lineHeight: 1.7,
                    fontSize: 15,
                    color: 'text.primary',
                    '& h2': {
                      marginTop: '0.7em',
                      marginBottom: '0.3em',
                      fontSize: '1.12rem',
                      fontWeight: 800,
                    },
                    '& h3': {
                      marginTop: '0.65em',
                      marginBottom: '0.3em',
                      fontSize: '1.02rem',
                      fontWeight: 700,
                    },
                    '& p': {
                      marginTop: '0.48em',
                      marginBottom: '0.48em',
                    },
                    '& ul, & ol': {
                      marginTop: '0.45em',
                      marginBottom: '0.45em',
                      paddingLeft: '1.35em',
                    },
                    '& li': {
                      marginBottom: '0.2em',
                    },
                    '& code': {
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '0.9em',
                      backgroundColor: alpha('#0f172a', 0.06),
                      borderRadius: 0.8,
                      padding: '0.08em 0.35em',
                    },
                  }}
                >
                  <Markdown>{streamedText}</Markdown>
                </Box>
              ) : summaryIsLoading ? (
                <Stack spacing={1}>
                  {Array(12)
                    .fill(null)
                    .map((_, index) => (
                      <Skeleton
                        key={index}
                        variant='rounded'
                        width={index % 3 === 0 ? '92%' : index % 4 === 0 ? '84%' : '100%'}
                        height={20}
                      />
                    ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    minHeight: 250,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: alpha('#627dff', 0.4),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(180deg, rgba(248,250,252,0.7) 0%, rgba(241,245,249,0.4) 100%)',
                  }}
                >
                  <Typography color='text.secondary'>
                    Generate a summary to view AI output here.
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Modal>
  )
}

export default AISummaryModal

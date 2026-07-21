import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useAlert } from '../../components/AlertProvider'
import {
  AdminPrompt,
  getAdminPrompts,
  updateAdminPrompt,
} from '../../functions/adminPromptFunctions'

const preferredPromptOrder = ['article-summary', 'kg-nodes-summary', 'table-summary']

function toLabel(type: string) {
  return type
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getSaveErrorMessage(error: unknown): string {
  if (!isAxiosError(error) || !error.response?.data) {
    return 'Failed to save prompt template.'
  }

  const data = error.response.data as {
    message?: string
    availableTypes?: string[]
  }

  if (Array.isArray(data.availableTypes) && data.availableTypes.length > 0) {
    return `Invalid prompt type. Available: ${data.availableTypes.join(', ')}`
  }

  if (typeof data.message === 'string') {
    return data.message
  }

  return 'Failed to save prompt template.'
}

function toPromptMap(prompts: AdminPrompt[]): Record<string, string> {
  return prompts.reduce<Record<string, string>>((acc, prompt) => {
    acc[prompt.type] = prompt.prompt
    return acc
  }, {})
}

function sortPromptTypes(types: string[]) {
  return [...types].sort((left, right) => {
    const leftIndex = preferredPromptOrder.indexOf(left)
    const rightIndex = preferredPromptOrder.indexOf(right)

    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}

function AdminPromptTemplates() {
  const queryClient = useQueryClient()
  const { displayAlert } = useAlert()
  const [promptMap, setPromptMap] = React.useState<Record<string, string>>({})
  const [selectedType, setSelectedType] = React.useState('')

  const {
    data: prompts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminPrompts'],
    queryFn: () => getAdminPrompts(),
  })

  React.useEffect(() => {
    if (prompts) {
      setPromptMap(toPromptMap(prompts))
    }
  }, [prompts])

  const saveMutation = useMutation({
    mutationFn: ({ type, promptTemplate }: { type: string; promptTemplate: string }) =>
      updateAdminPrompt(type, promptTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPrompts'] })
      queryClient.invalidateQueries({ queryKey: ['llmPrompts'] })
      displayAlert('success', 'Prompt template saved successfully')
    },
    onError: (error) => {
      displayAlert('error', getSaveErrorMessage(error))
    },
  })

  const promptTypes = React.useMemo(() => {
    const loadedTypes = prompts?.map((prompt) => prompt.type) ?? []
    return sortPromptTypes(Array.from(new Set([...preferredPromptOrder, ...loadedTypes])))
  }, [prompts])

  React.useEffect(() => {
    if (promptTypes.length === 0) {
      setSelectedType('')
      return
    }

    if (!promptTypes.includes(selectedType)) {
      setSelectedType(promptTypes[0])
    }
  }, [promptTypes, selectedType])

  const serverPromptMap = React.useMemo(() => toPromptMap(prompts ?? []), [prompts])

  const handleTemplateChange = (type: string, nextTemplate: string) => {
    setPromptMap((prev) => ({ ...prev, [type]: nextTemplate }))
  }

  const handleSave = (type: string) => {
    saveMutation.mutate({ type, promptTemplate: promptMap[type] ?? '' })
  }

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' py={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Typography color='error' sx={{ py: 2 }}>
        Failed to load prompt templates.
      </Typography>
    )
  }

  const currentType = selectedType || promptTypes[0]
  const localTemplate = promptMap[currentType] ?? ''
  const serverTemplate = serverPromptMap[currentType] ?? ''
  const hasChanges = localTemplate !== serverTemplate
  const isSavingCurrentType = saveMutation.isPending && saveMutation.variables?.type === currentType

  return (
    <Box>
      <Box mb={2}>
        <Typography variant='h6'>Prompt Templates</Typography>
        <Typography variant='body2' color='text.secondary'>
          Edit the default prompt templates used by AI summaries.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Paper
          variant='outlined'
          sx={{
            width: { xs: '100%', md: 260 },
            flexShrink: 0,
            maxHeight: { md: 560 },
            overflowY: { md: 'auto' },
          }}
        >
          <Tabs
            value={currentType}
            onChange={(_event, value: string) => setSelectedType(value)}
            orientation='vertical'
            variant='scrollable'
            sx={{ '& .MuiTab-root': { alignItems: 'flex-start', textTransform: 'none', px: 2 } }}
          >
            {promptTypes.map((type) => (
              <Tab key={type} value={type} label={toLabel(type)} />
            ))}
          </Tabs>
        </Paper>

        <Paper variant='outlined' sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1.5}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              {toLabel(currentType)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Type: {currentType}
            </Typography>
            <TextField
              multiline
              minRows={16}
              maxRows={28}
              fullWidth
              value={localTemplate}
              onChange={(event) => handleTemplateChange(currentType, event.target.value)}
            />
            <Box display='flex' justifyContent='flex-end'>
              <Button
                variant='contained'
                onClick={() => handleSave(currentType)}
                disabled={!hasChanges || isSavingCurrentType}
              >
                Save
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export default AdminPromptTemplates

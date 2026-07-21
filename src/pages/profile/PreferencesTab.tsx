import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useBYOK } from '../../context/BYOKContext'
import { useAlert } from '../../components/AlertProvider'
import { getActiveLlmModels, getDefaultModelId } from '../../functions/llmModelFunctions'
import { getSummarizationModel, setSummarizationModel } from '../../utils/summarizationPreferences'

const PreferencesTab: React.FC = () => {
  const { user } = useAuth()
  const { isActive: isByokActive } = useBYOK()
  const { displayAlert } = useAlert()
  const [selectedModel, setSelectedModel] = useState(() => getSummarizationModel(user?.id))

  const {
    data: models,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['activeLlmModels'],
    queryFn: getActiveLlmModels,
  })

  useEffect(() => {
    if (!models?.length || !user?.id) {
      return
    }

    const stored = getSummarizationModel(user.id)
    const isStoredValid = models.some((model) => model.modelId === stored)

    if (!isStoredValid) {
      const fallback = getDefaultModelId(models)
      if (fallback) {
        setSelectedModel(fallback)
        setSummarizationModel(user.id, fallback)
      }
    }
  }, [models, user?.id])

  const handleModelChange = (modelId: string) => {
    if (!user?.id) {
      return
    }

    setSelectedModel(modelId)

    try {
      setSummarizationModel(user.id, modelId)
      displayAlert('success', 'Summarization model preference saved')
    } catch (error) {
      console.error(error)
      displayAlert('error', 'Failed to save preference')
    }
  }

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' py={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        AI Summarization
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3, maxWidth: 640 }}>
        Choose which model ROBOKOP uses when generating AI summaries for graphs, tables, and
        publications. This applies when you use ROBOKOP&apos;s hosted LLM — not when Bring Your Own
        Key (BYOK) is active.
      </Typography>

      {isByokActive && (
        <Alert severity='info' sx={{ mb: 3, maxWidth: 640 }}>
          BYOK is currently active. Summaries use the model configured in your BYOK settings, not
          this preference.
        </Alert>
      )}

      {isError && (
        <Alert severity='error' sx={{ mb: 3, maxWidth: 640 }}>
          Failed to load available models. Please try again later.
        </Alert>
      )}

      {!isError && models?.length === 0 && (
        <Alert severity='warning' sx={{ mb: 3, maxWidth: 640 }}>
          No AI models are currently available. Contact an administrator to configure models.
        </Alert>
      )}

      <FormControl component='fieldset' disabled={isByokActive || !models?.length}>
        <RadioGroup
          value={selectedModel}
          onChange={(_, value) => handleModelChange(value)}
          sx={{ gap: 1 }}
        >
          {models?.map((model) => (
            <Box
              key={model.id}
              sx={{
                border: 1,
                borderColor: selectedModel === model.modelId ? 'primary.main' : 'divider',
                borderRadius: 1,
                px: 2,
                py: 1,
                bgcolor: selectedModel === model.modelId ? 'action.selected' : 'transparent',
              }}
            >
              <FormControlLabel
                value={model.modelId}
                control={<Radio size='small' />}
                label={
                  <Box>
                    <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                      <Typography variant='body1' fontWeight={500}>
                        {model.name}
                      </Typography>
                      {model.isDefault && (
                        <Chip label='Default' size='small' color='default' variant='outlined' />
                      )}
                      {model.modelId === selectedModel && (
                        <Chip label='Selected' size='small' color='primary' variant='outlined' />
                      )}
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {model.modelId}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
              />
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

export default PreferencesTab

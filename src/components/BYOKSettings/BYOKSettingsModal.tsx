import React, { useState, useEffect } from 'react'
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useBYOK } from '../../context/BYOKContext'
import { BYOKConfig, BYOKProvider } from '../../utils/byokProviders'

interface BYOKSettingsModalProps {
  open: boolean
  onClose: () => void
}

const PROVIDER_LABELS: Record<BYOKProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  'openai-compatible': 'OpenAI-Compatible',
  azure: 'Azure AI Foundry',
}

const statusColor = {
  disconnected: 'default' as const,
  connecting: 'warning' as const,
  connected: 'success' as const,
}

const statusLabel = {
  disconnected: 'Disconnected',
  connecting: 'Connecting…',
  connected: 'Connected',
}

function activeModelLabel(config: BYOKConfig): string {
  return config.provider === 'azure' ? (config.azureDeployment ?? '') : config.model
}

export default function BYOKSettingsModal({ open, onClose }: BYOKSettingsModalProps) {
  const { isActive, config, wsStatus, activate, deactivate } = useBYOK()

  const [provider, setProvider] = useState<BYOKProvider>(config?.provider ?? 'openai')
  const [apiKey, setApiKey] = useState(config?.apiKey ?? '')
  const [model, setModel] = useState(config?.model ?? '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl ?? '')
  const [azureEndpoint, setAzureEndpoint] = useState(config?.azureEndpoint ?? '')
  const [azureDeployment, setAzureDeployment] = useState(config?.azureDeployment ?? '')

  useEffect(() => {
    if (config) {
      setProvider(config.provider)
      setApiKey(config.apiKey)
      setModel(config.model)
      setBaseUrl(config.baseUrl ?? '')
      setAzureEndpoint(config.azureEndpoint ?? '')
      setAzureDeployment(config.azureDeployment ?? '')
    }
  }, [config])

  const handleActivate = () => {
    const cfg: BYOKConfig = {
      provider,
      apiKey,
      model,
      ...(provider === 'openai-compatible' ? { baseUrl } : {}),
      ...(provider === 'azure' ? { azureEndpoint, azureDeployment } : {}),
    }
    activate(cfg)
  }

  const isFormValid = () => {
    if (!apiKey.trim()) return false
    if (provider !== 'azure' && !model.trim()) return false
    if (provider === 'openai-compatible' && !baseUrl.trim()) return false
    if (provider === 'azure' && (!azureEndpoint.trim() || !azureDeployment.trim())) return false
    return true
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 4,
          borderRadius: 1,
          width: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
          <CloseIcon />
        </IconButton>

        <Typography variant='h6' mb={1}>
          Bring Your Own Key (BYOK)
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={2}>
          Your API key is stored only in this browser tab and is never sent to the server.
        </Typography>

        {isActive && config && (
          <Stack direction='row' alignItems='center' spacing={1} mb={2}>
            <Chip
              label={statusLabel[wsStatus]}
              color={statusColor[wsStatus]}
              size='small'
              icon={wsStatus === 'connecting' ? <CircularProgress size={12} /> : undefined}
            />
            <Typography variant='body2' color='text.secondary'>
              Using {PROVIDER_LABELS[config.provider]} · {activeModelLabel(config)}
            </Typography>
          </Stack>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <TextField
            select
            label='Provider'
            value={provider}
            onChange={(e) => setProvider(e.target.value as BYOKProvider)}
            size='small'
            fullWidth
          >
            {(Object.keys(PROVIDER_LABELS) as BYOKProvider[]).map((p) => (
              <MenuItem key={p} value={p}>
                {PROVIDER_LABELS[p]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label='API Key'
            type='password'
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            size='small'
            fullWidth
            autoComplete='off'
          />

          {provider !== 'azure' && (
            <TextField
              label='Model'
              value={model}
              onChange={(e) => setModel(e.target.value)}
              size='small'
              fullWidth
              helperText={
                provider === 'openai'
                  ? 'e.g. gpt-4o, gpt-4.1'
                  : provider === 'anthropic'
                    ? 'e.g. claude-opus-4-7, claude-sonnet-4-6'
                    : 'Model name from your provider'
              }
            />
          )}

          {provider === 'openai-compatible' && (
            <TextField
              label='Base URL'
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              size='small'
              fullWidth
              placeholder='https://api.example.com'
              helperText='Base URL without trailing slash (e.g. Groq, Together, local Ollama)'
            />
          )}

          {provider === 'azure' && (
            <>
              <TextField
                label='Azure Endpoint'
                value={azureEndpoint}
                onChange={(e) => setAzureEndpoint(e.target.value)}
                size='small'
                fullWidth
                placeholder='https://myresource.services.ai.azure.com/api/projects/myproject'
                helperText='Paste the endpoint URL from the Azure AI Foundry portal (the /responses suffix is stripped automatically)'
              />
              <TextField
                label='Deployment Name'
                value={azureDeployment}
                onChange={(e) => setAzureDeployment(e.target.value)}
                size='small'
                fullWidth
                helperText='The deployment name in Azure AI Foundry'
              />
            </>
          )}
        </Stack>

        <Stack direction='row' spacing={1} mt={3} justifyContent='flex-end'>
          {isActive && (
            <Button variant='outlined' color='error' onClick={deactivate}>
              Deactivate
            </Button>
          )}
          <Button variant='contained' onClick={handleActivate} disabled={!isFormValid()}>
            {isActive ? 'Update & Reconnect' : 'Activate'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
}

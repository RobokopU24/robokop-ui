export type BYOKProvider = 'openai' | 'anthropic' | 'openai-compatible' | 'azure'

export interface BYOKConfig {
  provider: BYOKProvider
  apiKey: string
  model: string
  baseUrl?: string
  azureEndpoint?: string
  azureDeployment?: string
}

async function parseSSEStream(
  response: Response,
  onChunk: (chunk: string) => void,
  extractText: (parsed: unknown) => string | null,
): Promise<void> {
  if (!response.body) throw new Error('No response body')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const text = extractText(parsed)
          if (text) onChunk(text)
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function streamOpenAI(
  config: BYOKConfig,
  prompt: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const baseUrl = (config.baseUrl ?? 'https://api.openai.com').replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error ${response.status}: ${err}`)
  }

  await parseSSEStream(response, onChunk, (parsed) => {
    const p = parsed as { choices?: { delta?: { content?: string } }[] }
    return p?.choices?.[0]?.delta?.content ?? null
  })
}

async function streamAnthropic(
  config: BYOKConfig,
  prompt: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic error ${response.status}: ${err}`)
  }

  await parseSSEStream(response, onChunk, (parsed) => {
    const p = parsed as { type?: string; delta?: { type?: string; text?: string } }
    if (p?.type === 'content_block_delta' && p?.delta?.type === 'text_delta') {
      return p.delta.text ?? null
    }
    return null
  })
}

async function streamAzure(
  config: BYOKConfig,
  prompt: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const deployment = config.azureDeployment ?? ''

  // Strip trailing slash and any API-specific suffix the user may have copied from the portal
  // (e.g. the portal shows .../openai/v1/responses as the default endpoint URL)
  const endpoint = (config.azureEndpoint ?? '')
    .replace(/\/$/, '')
    .replace(/\/(responses|chat\/completions|completions)\/?$/, '')

  // Azure AI Foundry project endpoints (/api/projects/...) use the OpenAI-compatible
  // /chat/completions path directly with model in the body; no api-version query param.
  // Classic Azure OpenAI endpoints (*.openai.azure.com) use the deployment path + api-version.
  const isAIFoundry = endpoint.includes('/api/projects/')
  const url = isAIFoundry
    ? `${endpoint}/chat/completions`
    : `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`

  const body = isAIFoundry
    ? { model: deployment, messages: [{ role: 'user', content: prompt }], stream: true }
    : { messages: [{ role: 'user', content: prompt }], stream: true }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Azure error ${response.status}: ${err}`)
  }

  await parseSSEStream(response, onChunk, (parsed) => {
    const p = parsed as { choices?: { delta?: { content?: string } }[] }
    return p?.choices?.[0]?.delta?.content ?? null
  })
}

export async function streamWithProvider(
  config: BYOKConfig,
  prompt: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  switch (config.provider) {
    case 'openai':
      return streamOpenAI(config, prompt, onChunk)
    case 'openai-compatible':
      return streamOpenAI(config, prompt, onChunk)
    case 'anthropic':
      return streamAnthropic(config, prompt, onChunk)
    case 'azure':
      return streamAzure(config, prompt, onChunk)
  }
}

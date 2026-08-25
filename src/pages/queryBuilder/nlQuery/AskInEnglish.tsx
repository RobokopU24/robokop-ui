import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import posthog from 'posthog-js'
import { useAlert } from '../../../components/AlertProvider'
import { useQueryBuilderContext } from '../../../context/queryBuilder'
import { fillQueryFromEnglish } from './fillFromEnglish'
import { FillResult, GroundedNode } from './types'
import { NodeOption } from '../textEditor/types'

function nodeLabel(node: NodeOption): string {
  if (node.ids?.[0]) return `${node.name} (${node.ids[0]})`
  return node.name
}

export default function AskInEnglish() {
  const queryBuilder = useQueryBuilderContext()
  const { displayAlert } = useAlert()
  const [question, setQuestion] = useState('')
  const [isFilling, setIsFilling] = useState(false)
  const [result, setResult] = useState<FillResult | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement
    node: GroundedNode
  } | null>(null)

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = {}
    const token = localStorage.getItem('authToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }, [])

  const pinnedNodes = result?.grounded.filter((node) => node.mention) ?? []

  async function handleFill() {
    const trimmed = question.trim()
    if (!trimmed || isFilling) return

    setIsFilling(true)
    try {
      const filled = await fillQueryFromEnglish({
        question: trimmed,
        authHeaders,
        displayAlert,
      })
      queryBuilder.dispatch({
        type: 'saveGraph',
        payload: { message: { query_graph: filled.queryGraph } },
      })
      setResult(filled)
      posthog.capture('question_builder_nl_fill', {
        source: filled.source,
        unresolved: filled.grounded.filter((node) => node.unresolved).length,
        ambiguous: filled.grounded.filter((node) => node.ambiguous).length,
      })

      const unresolved = filled.grounded.filter((node) => node.unresolved)
      if (unresolved.length) {
        displayAlert(
          'warning',
          `Could not resolve: ${unresolved.map((node) => node.mention).join(', ')}. Search that node box to pick a match.`,
        )
      } else if (filled.grounded.some((node) => node.ambiguous)) {
        displayAlert(
          'info',
          'Filled the graph. Some names had multiple matches — click a chip to pick another.',
        )
      } else {
        displayAlert(
          'success',
          'Filled the question from your description. Review the nodes before searching.',
        )
      }
    } catch (error) {
      console.error('[nl-to-query] fill failed', error)
      displayAlert('error', 'Could not fill the question. Try a more specific description.')
    } finally {
      setIsFilling(false)
    }
  }

  function applyAlternative(node: GroundedNode, alternative: NodeOption) {
    queryBuilder.dispatch({
      type: 'editNode',
      payload: { id: node.key, node: alternative },
    })
    setResult((current) => {
      if (!current) return current
      return {
        ...current,
        grounded: current.grounded.map((item) => {
          if (item.key !== node.key) return item
          const previous = item.node
          const alternatives = [
            previous,
            ...item.alternatives.filter((option) => option.ids?.[0] !== alternative.ids?.[0]),
          ].slice(0, 4)
          return {
            ...item,
            node: alternative,
            alternatives,
            ambiguous: false,
            unresolved: false,
          }
        }),
      }
    })
    setMenuAnchor(null)
  }

  return (
    <Paper elevation={0} className='ask-in-english'>
      <Stack spacing={1.25}>
        <Typography variant='subtitle2' color='text.secondary'>
          Describe your question in plain English
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            size='small'
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. Chemicals that treat Huntington's Disease"
            disabled={isFilling}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleFill()
              }
            }}
            helperText='Looks up names with the same name resolver as the node boxes below.'
          />
          <Button
            variant='contained'
            disableElevation
            onClick={handleFill}
            disabled={isFilling || !question.trim()}
            startIcon={
              isFilling ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <AutoAwesomeOutlinedIcon />
              )
            }
            sx={{ whiteSpace: 'nowrap', minWidth: 96, height: 40, mt: '1px' }}
          >
            Fill
          </Button>
        </Box>
        {pinnedNodes.length > 0 && (
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {pinnedNodes.map((node) => (
              <Chip
                key={node.key}
                size='small'
                color={node.unresolved ? 'warning' : node.ambiguous ? 'info' : 'default'}
                variant={node.unresolved || node.ambiguous ? 'filled' : 'outlined'}
                label={nodeLabel(node.node)}
                onClick={
                  node.alternatives.length
                    ? (event) => setMenuAnchor({ element: event.currentTarget, node })
                    : undefined
                }
              />
            ))}
          </Stack>
        )}
        {result && (
          <Typography variant='caption' color='text.secondary'>
            {result.source === 'pathway'
              ? 'Filled the ROBOKOP outcome-pathway chain (drug or chemical → gene → process → phenotype → disease).'
              : result.source === 'llm'
                ? 'Interpreted on the server with Azure, then grounded with the name resolver.'
                : 'Used a basic fill. Log in so the server can interpret the question with Azure and look up nodes.'}
          </Typography>
        )}
      </Stack>
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuAnchor?.node.alternatives.map((option) => (
          <MenuItem
            key={option.ids?.[0] || option.name}
            onClick={() => applyAlternative(menuAnchor.node, option)}
          >
            {nodeLabel(option)}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  )
}

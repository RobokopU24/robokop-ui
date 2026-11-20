import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material'

import { useChemicalSmiles } from '../hooks/useChemicalSmiles'
import type { SmilesSource } from '../utils/chemicalStructure'

const PREVIEW_WIDTH = 240
const PREVIEW_HEIGHT = 200

let smilesDrawerPromise: Promise<typeof import('smiles-drawer').default> | null = null
function loadSmilesDrawer() {
  if (!smilesDrawerPromise) {
    smilesDrawerPromise = import('smiles-drawer').then((mod) => mod.default)
  }
  return smilesDrawerPromise
}

type RenderState = 'rendering' | 'done' | 'error'

function SmilesStructure({ smiles }: { smiles: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [renderState, setRenderState] = useState<RenderState>('rendering')

  useEffect(() => {
    let cancelled = false
    setRenderState('rendering')

    loadSmilesDrawer()
      .then((SmilesDrawer) => {
        if (cancelled || !svgRef.current) return
        const svg = svgRef.current
        const drawer = new SmilesDrawer.SvgDrawer({
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          padding: 8,
          compactDrawing: false,
        })
        SmilesDrawer.parse(
          smiles,
          (tree) => {
            if (cancelled) return
            try {
              while (svg.firstChild) svg.removeChild(svg.firstChild)
              drawer.draw(tree, svg, 'light')
              setRenderState('done')
            } catch (e) {
              console.error('Failed to draw SMILES', e)
              setRenderState('error')
            }
          },
          (err) => {
            console.error('Failed to parse SMILES', err)
            if (!cancelled) setRenderState('error')
          },
        )
      })
      .catch((e) => {
        console.error('Failed to load smiles-drawer', e)
        if (!cancelled) setRenderState('error')
      })

    return () => {
      cancelled = true
    }
  }, [smiles])

  return (
    <Box sx={{ position: 'relative', width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}>
      <svg
        ref={svgRef}
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        style={{ display: renderState === 'error' ? 'none' : 'block' }}
        role='img'
        aria-label={`Chemical structure: ${smiles}`}
      />
      {renderState === 'rendering' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      {renderState === 'error' && <PreviewMessage>Unable to draw this structure</PreviewMessage>}
    </Box>
  )
}

function PreviewMessage({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: PREVIEW_WIDTH,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Typography variant='body2' color='text.secondary'>
        {children}
      </Typography>
    </Box>
  )
}

export function ChemicalStructureLoading() {
  return (
    <Box sx={{ width: PREVIEW_WIDTH }}>
      <Skeleton variant='rounded' width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} />
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
        Loading structure…
      </Typography>
    </Box>
  )
}

interface ChemicalStructureDrawingProps {
  smiles: string
  source?: SmilesSource
  showSmiles?: boolean
}

export function ChemicalStructureDrawing({
  smiles,
  source,
  showSmiles = true,
}: ChemicalStructureDrawingProps) {
  return (
    <>
      <SmilesStructure smiles={smiles} />
      {showSmiles && (
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            display: 'block',
            mt: 0.5,
            width: PREVIEW_WIDTH,
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxHeight: '3.6em',
            overflow: 'hidden',
          }}
          title={smiles}
        >
          {smiles}
        </Typography>
      )}
      {source && (
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
          Source: {source}
        </Typography>
      )}
    </>
  )
}

interface ChemicalStructurePreviewProps {
  curie: string
  name?: string
}

export default function ChemicalStructurePreview({ curie, name }: ChemicalStructurePreviewProps) {
  const { result, isLoading, isError } = useChemicalSmiles(curie)

  let body: ReactNode
  if (isLoading) {
    body = <ChemicalStructureLoading />
  } else if (isError) {
    body = <PreviewMessage>Couldn&apos;t load structure</PreviewMessage>
  } else if (!result) {
    body = <PreviewMessage>No structure available</PreviewMessage>
  } else {
    body = <ChemicalStructureDrawing smiles={result.smiles} source={result.source} />
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography
        variant='subtitle2'
        noWrap
        sx={{ width: PREVIEW_WIDTH, fontSize: '0.8125rem' }}
        title={name}
      >
        {name || curie}
      </Typography>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
        {curie}
      </Typography>
      {body}
    </Box>
  )
}

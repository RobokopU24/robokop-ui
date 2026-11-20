import React, { useLayoutEffect, useRef } from 'react'
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const ARROW_WIDTH = 20
const ARROW_HEIGHT = 15
const ANCHOR_GAP = 28
const VIEWPORT_PADDING = 16

interface PopoverProps {
  children: React.ReactNode
  open: boolean
  onClose: () => void
  anchorPosition: { top: number; left: number }
  anchorElement?: Element | null
  above?: boolean
}

const Popover: React.FC<PopoverProps> = ({
  children,
  open,
  onClose,
  anchorPosition,
  anchorElement,
  above,
}) => {
  const theme = useTheme()
  const arrowRef = useRef<SVGSVGElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (nextOpen) => {
      if (!nextOpen) onClose()
    },
    placement: above ? 'top' : 'bottom',
    strategy: 'fixed',
    middleware: [
      offset(ANCHOR_GAP),
      flip({ padding: VIEWPORT_PADDING }),
      shift({ padding: VIEWPORT_PADDING }),
      arrow({ element: arrowRef, padding: 12 }),
    ],
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, update, { animationFrame: !!anchorElement }),
  })

  const { top, left } = anchorPosition
  useLayoutEffect(() => {
    const point = (x: number, y: number) => ({
      x,
      y,
      left: x,
      top: y,
      right: x,
      bottom: y,
      width: 0,
      height: 0,
    })
    if (anchorElement) {
      refs.setPositionReference({
        contextElement: anchorElement,
        getBoundingClientRect: () => {
          const rect = anchorElement.getBoundingClientRect()
          return point(rect.left + rect.width / 2, rect.top + rect.height / 2)
        },
      })
    } else {
      refs.setPositionReference({ getBoundingClientRect: () => point(left, top) })
    }
  }, [refs, top, left, anchorElement])

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  if (!open) return null

  return (
    <FloatingPortal>
      <FloatingOverlay lockScroll style={{ zIndex: theme.zIndex.modal }}>
        <FloatingFocusManager context={context} initialFocus={refs.floating}>
          <Paper
            ref={refs.setFloating}
            tabIndex={-1}
            style={floatingStyles}
            sx={{
              boxShadow: 'none',
              filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))',
              outline: 'none',
            }}
            {...getFloatingProps()}
          >
            {children}
            <FloatingArrow
              ref={arrowRef}
              context={context}
              width={ARROW_WIDTH}
              height={ARROW_HEIGHT}
              fill={theme.palette.background.paper}
            />
          </Paper>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  )
}

export default Popover

// Keep page breaks outside rendered text lines, including inline bold text and list markers.
export function getSummaryPageBreaks(
  height: number,
  pageHeight: number,
  lines: { top: number; bottom: number }[],
): number[] {
  const breaks = [0]
  while (breaks[breaks.length - 1] < height) {
    const start = breaks[breaks.length - 1]
    let end = Math.min(start + pageHeight, height)
    if (end < height) {
      let previousEnd: number
      do {
        previousEnd = end
        for (const line of lines) {
          if (line.top < end && line.bottom > end) end = Math.min(end, line.top)
        }
      } while (end !== previousEnd)
    }
    // A block taller than a page must still make progress.
    breaks.push(end > start ? end : Math.min(start + pageHeight, height))
  }
  return breaks
}

export async function createSummaryPdf(element: HTMLElement, title: string): Promise<Blob> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  await document.fonts.ready

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  pdf.setProperties({ title })
  const margin = 36
  const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2
  const contentHeight = pdf.internal.pageSize.getHeight() - margin * 2
  const bounds = element.getBoundingClientRect()
  const pointsPerPixel = contentWidth / bounds.width
  const lines: { top: number; bottom: number }[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent?.trim()) continue
    range.selectNodeContents(walker.currentNode)
    for (const rect of range.getClientRects()) {
      lines.push({ top: rect.top - bounds.top - 2, bottom: rect.bottom - bounds.top + 2 })
    }
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  })
  const scale = canvas.width / bounds.width
  const breaks = getSummaryPageBreaks(
    canvas.height,
    Math.floor((contentHeight / pointsPerPixel) * scale),
    lines.map(({ top, bottom }) => ({
      top: Math.max(0, Math.floor(top * scale)),
      bottom: Math.ceil(bottom * scale),
    })),
  )
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = canvas.width
  for (let index = 1; index < breaks.length; index++) {
    const start = breaks[index - 1]
    const pageHeight = breaks[index] - start
    pageCanvas.height = pageHeight
    const context = pageCanvas.getContext('2d')
    if (!context) throw new Error('Unable to render PDF page')
    context.drawImage(canvas, 0, start, canvas.width, pageHeight, 0, 0, canvas.width, pageHeight)
    if (index > 1) pdf.addPage()
    pdf.addImage(
      pageCanvas,
      'PNG',
      margin,
      margin,
      contentWidth,
      (pageHeight / scale) * pointsPerPixel,
    )
  }
  return pdf.output('blob')
}

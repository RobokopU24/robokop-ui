import React, { useMemo, useState, useRef, useEffect } from 'react';
import { sankey, sankeyCenter, sankeyLinkHorizontal, SankeyNodeMinimal } from 'd3-sankey';
import { scaleSymlog } from 'd3-scale';

const MARGIN_Y = 25;
const MARGIN_X = 5;

type Data = {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
};

type SankeyProps = {
  width?: number; // optional: chart will resize to parent
  height?: number; // can be auto-calculated
  data: Data;
  showValues?: boolean;
  labelInsideMinHeight?: number;
  logScaleBase?: number;
  minHeight?: number;
  maxHeight?: number;
};

type Hovered =
  | { type: 'node'; x: number; y: number; id: string; value: number }
  | { type: 'link'; x: number; y: number; source: string; target: string; value: number }
  | null;

const Tooltip = ({
  x,
  y,
  containerWidth,
  containerHeight,
  children,
}: {
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  children: React.ReactNode;
}) => {
  const OFFSET = 12;
  const tooltipWidth = 180;
  const tooltipHeight = 60;

  // Flip horizontally if near right edge
  const flipX = x + tooltipWidth + OFFSET > containerWidth;
  // Flip vertically if near bottom
  const flipY = y + tooltipHeight + OFFSET > containerHeight;

  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        left: flipX ? x - tooltipWidth - OFFSET : x + OFFSET,
        top: flipY ? y - tooltipHeight - OFFSET : y + OFFSET,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '6px 8px',
        borderRadius: 6,
        fontSize: 12,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        zIndex: 10,
        maxWidth: '100%',
      }}
    >
      {children}
    </div>
  );
};

// --- 🔹 Logarithmic Transformation Helper ---
const transformDataLogarithmically = (data: Data, base = 10) => {
  if (!data.links.length) return data;

  const values = data.links.map((l) => l.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const scale = scaleSymlog().domain([minValue, maxValue]).range([1, 100]);

  return {
    ...data,
    links: data.links.map((l) => ({
      ...l,
      rawValue: l.value,
      value: scale(l.value),
    })),
  };
};

export const Sankey = ({
  width,
  height,
  data,
  showValues = false,
  labelInsideMinHeight = Infinity,
  logScaleBase = 10,
  minHeight = 300,
  maxHeight = 900,
}: SankeyProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width || 800);

  // 🔹 Responsive width based on parent
  useEffect(() => {
    if (!width && containerRef.current) {
      const observer = new ResizeObserver(([entry]) => {
        setContainerWidth(entry.contentRect.width);
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [width]);

  // 🔹 Transform data before feeding into Sankey layout
  const transformedData = useMemo(
    () => transformDataLogarithmically(data, logScaleBase),
    [data, logScaleBase]
  );

  // 🔹 Compute dynamic height based on number of nodes
  const nodeCount = data.nodes.length;
  const dynamicHeight = height ? height : Math.min(maxHeight, Math.max(minHeight, nodeCount * 80));

  const sankeyGenerator = useMemo(
    () =>
      sankey<SankeyNodeMinimal<any>, any>()
        .nodeWidth(26)
        .nodePadding(29)
        .extent([
          [MARGIN_X, MARGIN_Y],
          [containerWidth - MARGIN_X, dynamicHeight - MARGIN_Y],
        ])
        .nodeId((node: any) => node.id)
        .nodeAlign(sankeyCenter),
    [containerWidth, dynamicHeight]
  );

  const { nodes, links } = useMemo(() => {
    const layout = sankeyGenerator(transformedData as any);

    const originalTotals = data.nodes.reduce(
      (acc, node) => {
        const inSum = data.links
          .filter((l) => l.target === node.id)
          .reduce((sum, l) => sum + l.value, 0);
        const outSum = data.links
          .filter((l) => l.source === node.id)
          .reduce((sum, l) => sum + l.value, 0);
        acc[node.id] = Math.max(inSum, outSum);
        return acc;
      },
      {} as Record<string, number>
    );

    layout.nodes.forEach((n: any) => {
      n.rawValue = originalTotals[n.id] ?? n.value;
    });

    return layout;
  }, [sankeyGenerator, transformedData, data]);

  const [hovered, setHovered] = useState<Hovered>(null);

  const labelFor = (n: any) => (showValues ? `${n.id} (${n.rawValue ?? n.value ?? 0})` : n.id);

  const svgRelativeCoords = (e: React.MouseEvent<Element, MouseEvent>) => {
    const svg = (e.currentTarget as Element).ownerSVGElement as SVGSVGElement;
    const bounds = svg.getBoundingClientRect();
    return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
  };

  const allNodes = nodes.map((node: any) => {
    const nodeHeight = node.y1! - node.y0!;
    const cy = node.y0! + nodeHeight / 2;
    const putInside = nodeHeight >= labelInsideMinHeight;
    const placeOnRight = node.x0! < containerWidth / 2;
    const outsideX = placeOnRight ? node.x1! + 6 : node.x0! - 6;
    const outsideAnchor = placeOnRight ? 'start' : 'end';
    const insideX = node.x0! + 4;

    return (
      <g key={node.index}>
        <rect
          height={nodeHeight}
          width={sankeyGenerator.nodeWidth()}
          x={node.x0}
          y={node.y0}
          stroke="black"
          fill="#a53253"
          fillOpacity={0.8}
          rx={1}
          onMouseMove={(e) => {
            const { x, y } = svgRelativeCoords(e);
            setHovered({
              type: 'node',
              x,
              y,
              id: node.id,
              value: node.rawValue ?? node.value ?? 0,
            });
          }}
          onMouseLeave={() => setHovered(null)}
        />
        <text
          x={putInside ? insideX : outsideX}
          y={cy}
          dominantBaseline="middle"
          textAnchor={putInside ? 'start' : outsideAnchor}
          fill={putInside ? 'white' : '#1f2937'}
          fontSize={12}
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          pointerEvents="none"
        >
          {labelFor(node)}
        </text>
      </g>
    );
  });

  const allLinks = links.map((link: any, i: number) => {
    const linkGenerator = sankeyLinkHorizontal<any, any>();
    const path = linkGenerator(link);
    return (
      <path
        key={i}
        d={path!}
        stroke="#a53253"
        fill="none"
        strokeOpacity={0.15}
        strokeWidth={Math.max(1, link.width)}
        style={{ pointerEvents: 'stroke' }}
        onMouseMove={(e) => {
          const { x, y } = svgRelativeCoords(e);
          setHovered({
            type: 'link',
            x,
            y,
            source: (link.source as any).id,
            target: (link.target as any).id,
            value: link.rawValue ?? link.value,
          });
        }}
        onMouseLeave={() => setHovered(null)}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: dynamicHeight,
      }}
    >
      <svg width={containerWidth} height={dynamicHeight}>
        {allLinks}
        {allNodes}
      </svg>

      {hovered && (
        <Tooltip
          x={hovered.x}
          y={hovered.y}
          containerWidth={containerWidth}
          containerHeight={dynamicHeight}
        >
          {hovered.type === 'node' ? (
            <>
              <div style={{ fontWeight: 600 }}>{hovered.id}</div>
              <div>count: {hovered.value.toLocaleString()}</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600 }}>
                {hovered.source} → {hovered.target}
              </div>
              <div>count: {hovered.value.toLocaleString()}</div>
            </>
          )}
        </Tooltip>
      )}
    </div>
  );
};

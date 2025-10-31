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
  width?: number;
  height?: number;
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

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

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

  const flipX = x + tooltipWidth + OFFSET > containerWidth;
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

// Helper function to desaturate a color
const desaturateColor = (color: string): string => {
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const [, hue, , lightness] = match;
    return `hsl(${hue}, 15%, ${lightness}%)`;
  }
  return '#999999';
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
  const [hovered, setHovered] = useState<Hovered>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!width && containerRef.current) {
      const observer = new ResizeObserver(([entry]) => {
        setContainerWidth(entry.contentRect.width);
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [width]);

  const transformedData = useMemo(
    () => transformDataLogarithmically(data, logScaleBase),
    [data, logScaleBase]
  );

  const nodeCount = data.nodes.length;
  const dynamicHeight = height ? height : Math.min(maxHeight, Math.max(minHeight, nodeCount * 80));

  const sankeyGenerator = useMemo(() => {
    const padding = Math.max(10, Math.min(25, 200 / (data.nodes.length || 1)));

    return sankey<SankeyNodeMinimal<any, any>, any>()
      .nodeWidth(26)
      .nodePadding(padding)
      .extent([
        [MARGIN_X, MARGIN_Y],
        [containerWidth - MARGIN_X, dynamicHeight - MARGIN_Y],
      ])
      .nodeId((node: any) => node.id)
      .nodeAlign(sankeyCenter);
  }, [containerWidth, dynamicHeight, data.nodes.length]);

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
      n.color = stringToColor(n.id);
    });

    layout.links.forEach((l: any, i: number) => {
      const sourceNode = layout.nodes.find((n: any) => n.id === (l.source.id ?? l.source));
      const targetNode = layout.nodes.find((n: any) => n.id === (l.target.id ?? l.target));

      l.sourceColor = (sourceNode as { color: string } | undefined)?.color || '#a53253';
      l.targetColor = (targetNode as { color: string } | undefined)?.color || '#a53253';
      l.id = `link-${i}`;
    });

    return layout;
  }, [sankeyGenerator, transformedData, data]);

  // Determine which links are connected to the selected node
  const connectedLinks = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    
    links.forEach((link: any) => {
      const sourceId = (link.source as any).id;
      const targetId = (link.target as any).id;
      if (sourceId === selectedNodeId || targetId === selectedNodeId) {
        connected.add(link.id);
      }
    });
    
    return connected;
  }, [selectedNodeId, links]);

  // Determine which nodes are connected to the selected node
  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    connected.add(selectedNodeId); // Include the selected node itself
    
    links.forEach((link: any) => {
      const sourceId = (link.source as any).id;
      const targetId = (link.target as any).id;
      if (sourceId === selectedNodeId) {
        connected.add(targetId);
      } else if (targetId === selectedNodeId) {
        connected.add(sourceId);
      }
    });
    
    return connected;
  }, [selectedNodeId, links]);

  const labelFor = (n: any) =>
    showValues ? `${n.id} (${n.rawValue?.toLocaleString?.() ?? n.value ?? 0})` : n.id;

  const svgRelativeCoords = (e: React.MouseEvent<Element, MouseEvent>) => {
    const svg = (e.currentTarget as any).ownerSVGElement as SVGSVGElement;
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

    // Determine if this node should be highlighted or desaturated
    const isSelected = selectedNodeId === node.id;
    const isHighlighted = !selectedNodeId || connectedNodes.has(node.id);
    const nodeColor = isHighlighted ? node.color : desaturateColor(node.color);
    const nodeOpacity = isHighlighted ? 0.85 : 0.3;
    const textOpacity = isHighlighted ? 1 : 0.4;
    const strokeWidth = isSelected ? 2 : 1;

    return (
      <g key={node.index}>
        <rect
          height={nodeHeight}
          width={sankeyGenerator.nodeWidth()}
          x={node.x0}
          y={node.y0}
          stroke={isSelected ? '#000' : 'black'}
          strokeWidth={strokeWidth}
          fill={nodeColor}
          fillOpacity={nodeOpacity}
          rx={1}
          style={{ 
            transition: 'fill 0.2s ease, fill-opacity 0.2s ease, stroke-width 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => {
            // Toggle selection: if clicking the same node, deselect; otherwise select the new node
            setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
          }}
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
          onMouseLeave={() => {
            setHovered(null);
          }}
        />
        <text
          x={putInside ? insideX : outsideX}
          y={cy}
          dominantBaseline="middle"
          textAnchor={putInside ? 'start' : outsideAnchor}
          fill={putInside ? 'white' : '#1f2937'}
          opacity={textOpacity}
          fontSize={12}
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          pointerEvents="none"
          style={{ transition: 'opacity 0.2s ease' }}
        >
          {labelFor(node)}
        </text>
      </g>
    );
  });

  const allLinks = links.map((link: any, i: number) => {
    const linkGenerator = sankeyLinkHorizontal<any, any>();
    const path = linkGenerator(link);

    // Determine if this link should be highlighted or desaturated
    const isHighlighted = !selectedNodeId || connectedLinks.has(link.id);
    const strokeOpacity = isHighlighted ? 0.4 : 0.1;
    
    // Create gradient IDs for both normal and desaturated versions
    const gradientId = `grad-${link.id}`;
    const desaturatedGradientId = `grad-desat-${link.id}`;
    const activeGradientId = isHighlighted ? gradientId : desaturatedGradientId;

    return (
      <g key={i}>
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={link.source.x1}
            x2={link.target.x0}
            y1={(link.source.y0 + link.source.y1) / 2}
            y2={(link.target.y0 + link.target.y1) / 2}
          >
            <stop offset="0%" stopColor={link.sourceColor} />
            <stop offset="100%" stopColor={link.targetColor} />
          </linearGradient>
          <linearGradient
            id={desaturatedGradientId}
            gradientUnits="userSpaceOnUse"
            x1={link.source.x1}
            x2={link.target.x0}
            y1={(link.source.y0 + link.source.y1) / 2}
            y2={(link.target.y0 + link.target.y1) / 2}
          >
            <stop offset="0%" stopColor={desaturateColor(link.sourceColor)} />
            <stop offset="100%" stopColor={desaturateColor(link.targetColor)} />
          </linearGradient>
        </defs>
        <path
          d={path!}
          stroke={`url(#${activeGradientId})`}
          fill="none"
          strokeOpacity={strokeOpacity}
          strokeWidth={Math.max(1, link.width)}
          style={{ 
            pointerEvents: 'stroke',
            transition: 'stroke-opacity 0.2s ease'
          }}
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
          onMouseLeave={() => {
            setHovered(null);
          }}
        />
      </g>
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
      <svg 
        width={containerWidth} 
        height={dynamicHeight}
        onClick={(e) => {
          // Clear selection if clicking on empty space
          if (e.target === e.currentTarget) {
            setSelectedNodeId(null);
          }
        }}
      >
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
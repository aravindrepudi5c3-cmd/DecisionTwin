import React, { useState, useMemo } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Layers, Database, Globe, Box, Code } from 'lucide-react'
import type { DeveloperComponent, DeveloperDependency } from '../../types/developer'

interface DependencyGraphViewProps {
  components: DeveloperComponent[]
  dependencies: DeveloperDependency[]
  onSelectComponent?: (comp: DeveloperComponent) => void
  highlightedComponentId?: string
}

interface NodePosition {
  id: string
  component: DeveloperComponent
  x: number
  y: number
  width: number
  height: number
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  components,
  dependencies,
  onSelectComponent,
  highlightedComponentId,
}) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(highlightedComponentId || null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Layout node positions in an aesthetic grid/layered formation
  const nodePositions = useMemo(() => {
    const positions = new Map<string, NodePosition>()
    const count = components.length
    if (count === 0) return positions

    // Group by layer/type
    const databases = components.filter((c) => c.type === 'database')
    const services = components.filter((c) => c.type === 'service' || c.type === 'backend' || c.type === 'module')
    const apis = components.filter((c) => c.type === 'API')
    const others = components.filter(
      (c) => !databases.includes(c) && !services.includes(c) && !apis.includes(c)
    )

    const layers = [
      databases,
      services.slice(0, Math.ceil(services.length / 2)),
      apis,
      services.slice(Math.ceil(services.length / 2)),
      others,
    ].filter((l) => l.length > 0)

    const layerSpacingY = 160
    const nodeSpacingX = 220
    const startY = 80

    layers.forEach((layer, layerIdx) => {
      const totalWidth = (layer.length - 1) * nodeSpacingX
      const startX = 400 - totalWidth / 2

      layer.forEach((comp, idx) => {
        positions.set(comp.id, {
          id: comp.id,
          component: comp,
          x: startX + idx * nodeSpacingX,
          y: startY + layerIdx * layerSpacingY,
          width: 170,
          height: 70,
        })
      })
    })

    return positions
  }, [components])

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'g') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const activeFocusId = selectedNodeId || hoveredNodeId || highlightedComponentId

  // Connected node IDs
  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>()
    const ids = new Set<string>([activeFocusId])
    dependencies.forEach((d) => {
      if (d.source_component_id === activeFocusId) ids.add(d.target_component_id)
      if (d.target_component_id === activeFocusId) ids.add(d.source_component_id)
    })
    return ids
  }, [activeFocusId, dependencies])

  const getNodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'database':
        return <Database size={14} className="text-emerald-400" />
      case 'api':
        return <Globe size={14} className="text-cyan-400" />
      case 'service':
        return <Layers size={14} className="text-purple-400" />
      case 'frontend':
        return <Code size={14} className="text-sky-400" />
      default:
        return <Box size={14} className="text-amber-400" />
    }
  }

  if (components.length === 0) {
    return (
      <div className="dt-dev-card text-center py-16">
        <Layers size={36} className="mx-auto text-slate-600 mb-3" />
        <h4 className="text-base font-bold text-white mb-1">No Components in Graph</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Add components to this project or load the demo architecture to visualize service dependencies.
        </p>
      </div>
    )
  }

  return (
    <div className="dt-dev-card p-0 overflow-hidden relative border border-slate-800 bg-[#070b14] h-[540px] flex flex-col select-none">
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-mono"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
        <div className="text-[11px] font-mono text-slate-400 px-2 border-l border-slate-800">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Database</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Service</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span>API</span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <pattern id="dt-graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.05)" />
          </pattern>
          <marker
            id="dt-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker
            id="dt-arrow-muted"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#dt-graph-grid)" />

        <g transform={`translate(${pan.x + 80}, ${pan.y + 40}) scale(${zoom})`}>
          {/* Render Edge Lines */}
          {dependencies.map((dep) => {
            const src = nodePositions.get(dep.source_component_id)
            const tgt = nodePositions.get(dep.target_component_id)
            if (!src || !tgt) return null

            const isHighlighted =
              activeFocusId &&
              (dep.source_component_id === activeFocusId || dep.target_component_id === activeFocusId)

            const x1 = src.x + src.width / 2
            const y1 = src.y + src.height / 2
            const x2 = tgt.x + tgt.width / 2
            const y2 = tgt.y + tgt.height / 2

            // Control point for smooth curve
            const midY = (y1 + y2) / 2
            const pathData = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`

            return (
              <g key={dep.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#38bdf8' : 'rgba(100, 116, 139, 0.35)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={dep.dependency_type === 'database_access' ? '4 4' : undefined}
                  markerEnd={isHighlighted ? 'url(#dt-arrow)' : 'url(#dt-arrow-muted)'}
                  className="transition-all duration-300"
                />
                {/* Edge Label */}
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 4}
                  fill={isHighlighted ? '#7dd3fc' : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="bg-slate-900"
                >
                  {dep.dependency_type}
                </text>
              </g>
            )
          })}

          {/* Render Nodes */}
          {Array.from(nodePositions.values()).map((node) => {
            const isSelected = selectedNodeId === node.id || highlightedComponentId === node.id
            const isConnected = connectedNodeIds.has(node.id)
            const isDimmed = activeFocusId && !isConnected

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  setSelectedNodeId(node.id)
                  if (onSelectComponent) onSelectComponent(node.component)
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-all duration-200"
                opacity={isDimmed ? 0.3 : 1}
              >
                {/* Glow filter if selected */}
                {isSelected && (
                  <rect
                    x="-4"
                    y="-4"
                    width={node.width + 8}
                    height={node.height + 8}
                    rx="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    className="animate-pulse"
                  />
                )}

                {/* Node Box */}
                <rect
                  width={node.width}
                  height={node.height}
                  rx="10"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={isSelected ? '#38bdf8' : isConnected && activeFocusId ? '#a855f7' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth="1.5"
                />

                {/* Node Type Top Stripe */}
                <rect
                  x="0"
                  y="0"
                  width={node.width}
                  height="4"
                  rx="2"
                  fill={
                    node.component.type === 'database'
                      ? '#10b981'
                      : node.component.type === 'API'
                      ? '#06b6d4'
                      : '#8b5cf6'
                  }
                />

                {/* Node Icon & Name */}
                <foreignObject x="10" y="10" width={node.width - 20} height={node.height - 20}>
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5">
                      {getNodeIcon(node.component.type)}
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 truncate">
                        {node.component.type}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate" title={node.component.name}>
                      {node.component.name}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">
                      {node.component.file_path || 'source code'}
                    </div>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Selected Node Details Drawer */}
      {selectedNodeId && (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sky-400 font-semibold">SELECTED:</span>
            <span className="text-white font-semibold">
              {components.find((c) => c.id === selectedNodeId)?.name}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {components.find((c) => c.id === selectedNodeId)?.file_path || 'No path specified'}
            </span>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-white font-mono text-[11px]"
            onClick={() => setSelectedNodeId(null)}
          >
            [Close Panel]
          </button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  Database,
  Home,
  Maximize2,
  Minus,
  Network,
  PanelLeftClose,
  PanelRightClose,
  PlayCircle,
  Presentation,
  Plus,
  Search,
  Settings,
  Snowflake,
  Sparkles,
} from 'lucide-react'

import {
  connectedModelIds,
  models,
  relationships,
} from './schemaData.js'
import {
  EDGE_ROUTES,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  NODE_LAYOUT,
  roundedOrthogonalPath,
} from './schemaLayout.js'
import { calculateFitScale, clampZoomMultiplier } from './presentationFit.js'

const TYPE_THEME = {
  parent: { tile: '#ded5ff', icon: '#6e5ac8' },
  related: { tile: '#bcebc8', icon: '#248a4c' },
  event: { tile: '#c9eff8', icon: '#178ba7' },
}

const MODEL_ICONS = {
  deployed_code: Box,
  database: Database,
  flare: Sparkles,
}

const navItems = [
  [Home, 'Home'],
  [Sparkles, 'Agents'],
  [PlayCircle, 'Activation'],
]

const studioItems = ['Audiences', 'Journeys', 'Profiles', 'Priority lists', 'Traits', 'Schema', 'Governance', 'Templates']

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <img
          src={`${import.meta.env.BASE_URL}assets/Hightouch-logo_black.png`}
          alt="Hightouch"
          className="brand-logo"
        />
        <PanelRightClose className="ui-icon panel-icon" aria-hidden="true" />
      </div>

      <button className="workspace-picker" type="button">
        <span>Meridian Retail Group</span>
        <ChevronsUpDown className="ui-icon" aria-hidden="true" />
      </button>

      <nav className="primary-nav" aria-label="Primary">
        {navItems.map(([Icon, label]) => (
          <button className="nav-row" type="button" key={label}>
            <Icon className="ui-icon" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}

        <div className="studio-heading">
          <Network className="ui-icon" aria-hidden="true" />
          <span>Customer Studio</span>
        </div>
        <div className="studio-list">
          {studioItems.map((item) => (
            <button className={`studio-row ${item === 'Schema' ? 'is-active' : ''}`} type="button" key={item}>
              {item}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-row" type="button">
          <Settings className="ui-icon" aria-hidden="true" />
          <span>Settings</span>
        </button>
        <button className="nav-row" type="button">
          <CircleHelp className="ui-icon" aria-hidden="true" />
          <span>Docs + Support</span>
        </button>
      </div>
    </aside>
  )
}

function SchemaToolbar({ createOpen, setCreateOpen, createRef, presentationMode, onTogglePresentation }) {
  return (
    <header className="schema-toolbar">
      <div className="toolbar-left">
        <h1>Schema</h1>
        <button className="source-picker" type="button">
          <Snowflake className="ui-icon source-icon" aria-hidden="true" />
          <span>Customer Data Platform</span>
          <ChevronsUpDown className="ui-icon" aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-actions">
        <button
          className="presentation-button"
          type="button"
          aria-pressed={presentationMode}
          onClick={onTogglePresentation}
          data-testid="presentation-toggle"
        >
          <Presentation className="ui-icon" aria-hidden="true" />
          <span>{presentationMode ? 'Exit present' : 'Present'}</span>
        </button>
        <div className="create-wrap" ref={createRef}>
          <button
            className="create-button"
            type="button"
            aria-expanded={createOpen}
            onClick={() => setCreateOpen((open) => !open)}
          >
            <span>Create</span>
            <ChevronDown className="ui-icon" aria-hidden="true" />
          </button>
          {createOpen ? (
            <div className="create-menu" data-testid="create-menu">
              {[
                [Box, 'Parent model'],
                [Database, 'Related model'],
                [Sparkles, 'Event'],
              ].map(([Icon, label]) => (
                <button type="button" key={label}>
                  <Icon className="ui-icon" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function ModelCard({ model, selectedModelId, relatedIds, onSelect, compact = false }) {
  const theme = TYPE_THEME[model.type]
  const ModelIcon = MODEL_ICONS[model.icon]
  const hasSelection = Boolean(selectedModelId)
  const isSelected = selectedModelId === model.id
  const isRelated = relatedIds.includes(model.id)
  const dimmed = hasSelection && !isSelected && !isRelated

  return (
    <button
      type="button"
      className={`model-card ${compact ? 'is-compact' : ''} ${isSelected ? 'is-selected' : ''} ${isRelated ? 'is-related' : ''} ${dimmed ? 'is-dimmed' : ''}`}
      style={compact ? undefined : { left: NODE_LAYOUT[model.id].x, top: NODE_LAYOUT[model.id].y }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(model.id)
      }}
      data-testid={`${compact ? 'library' : 'schema'}-node-${model.id}`}
    >
      <span className="model-icon" style={{ background: theme.tile, color: theme.icon }}>
        <ModelIcon className="ui-icon" aria-hidden="true" />
      </span>
      <span className="model-copy">
        <span className="model-eyebrow">{model.eyebrow}</span>
        <span className="model-name">{model.name}</span>
      </span>
    </button>
  )
}

function MiniMap() {
  return (
    <div className="minimap" aria-label="Schema minimap">
      {models.map((model) => (
        <span
          key={model.id}
          className={`minimap-node is-${model.type}`}
          style={{ left: NODE_LAYOUT[model.id].x * 0.145 + 8, top: NODE_LAYOUT[model.id].y * 0.145 + 7 }}
        />
      ))}
      <span className="minimap-viewport" />
    </div>
  )
}

function SchemaCanvas({
  selectedModelId,
  setSelectedModelId,
  zoomMultiplier,
  setZoomMultiplier,
  presentationMode,
}) {
  const canvasRef = useRef(null)
  const [fitScale, setFitScale] = useState(1)
  const relatedIds = useMemo(
    () => (selectedModelId ? connectedModelIds(selectedModelId) : []),
    [selectedModelId],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    function updateFitScale() {
      const bounds = canvas.getBoundingClientRect()
      setFitScale(calculateFitScale(
        bounds.width,
        bounds.height,
        GRAPH_WIDTH,
        GRAPH_HEIGHT,
        presentationMode ? 20 : 28,
      ))
    }

    updateFitScale()
    const observer = new ResizeObserver(updateFitScale)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [presentationMode])

  const renderedScale = Number((fitScale * zoomMultiplier).toFixed(3))

  return (
    <section className="schema-canvas" ref={canvasRef} onClick={() => setSelectedModelId(null)}>
      <div
        className="canvas-stage"
        style={{
          width: GRAPH_WIDTH,
          height: GRAPH_HEIGHT,
          marginLeft: -GRAPH_WIDTH / 2,
          transform: `scale(${renderedScale})`,
        }}
      >
        <svg className="relationship-layer" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} aria-hidden="true">
          {relationships.map((relationship) => {
            const route = EDGE_ROUTES[relationship.id]
            const start = route.points[0]
            const end = route.points.at(-1)
            const isActive = !selectedModelId || relationship.source === selectedModelId || relationship.target === selectedModelId
            return (
              <g
                key={relationship.id}
                className={isActive ? 'relationship is-active' : 'relationship is-muted'}
                data-testid={`relationship-${relationship.id}`}
              >
                <path d={roundedOrthogonalPath(route.points, 12)} />
                <circle cx={start.x} cy={start.y} r="2.4" />
                <circle cx={end.x} cy={end.y} r="2.4" />
              </g>
            )
          })}
        </svg>

        <div className="relationship-label-layer" aria-hidden="true">
          {relationships.map((relationship) => {
            const route = EDGE_ROUTES[relationship.id]
            const isActive = !selectedModelId || relationship.source === selectedModelId || relationship.target === selectedModelId
            return (
              <span
                className={`relationship-label ${isActive ? '' : 'is-muted'}`}
                key={relationship.id}
                style={{ left: route.label.x, top: route.label.y }}
                title={relationship.note}
                data-testid={`relationship-label-${relationship.id}`}
              >
                {relationship.label}
              </span>
            )
          })}
        </div>

        {models.map((model) => (
          <ModelCard
            model={model}
            key={model.id}
            selectedModelId={selectedModelId}
            relatedIds={relatedIds}
            onSelect={(modelId) => setSelectedModelId((current) => (current === modelId ? null : modelId))}
          />
        ))}
      </div>

      <MiniMap />
      <div className="zoom-controls" aria-label="Canvas zoom controls">
        <button aria-label="Zoom in" type="button" onClick={(event) => { event.stopPropagation(); setZoomMultiplier((value) => clampZoomMultiplier(value + 0.08)) }} data-testid="zoom-in">
          <Plus className="ui-icon" aria-hidden="true" />
        </button>
        <button aria-label="Zoom out" type="button" onClick={(event) => { event.stopPropagation(); setZoomMultiplier((value) => clampZoomMultiplier(value - 0.08)) }} data-testid="zoom-out">
          <Minus className="ui-icon" aria-hidden="true" />
        </button>
        <button aria-label="Fit schema to screen" type="button" onClick={(event) => { event.stopPropagation(); setZoomMultiplier(1) }} data-testid="zoom-reset">
          <Maximize2 className="ui-icon" aria-hidden="true" />
        </button>
      </div>
      <span className="zoom-value">Fit {Math.round(renderedScale * 100)}%</span>
    </section>
  )
}

function ModelLibrary({ search, setSearch, selectedModelId, setSelectedModelId }) {
  const relatedIds = useMemo(
    () => (selectedModelId ? connectedModelIds(selectedModelId) : []),
    [selectedModelId],
  )
  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return models
    return models.filter((model) => [model.name, model.eyebrow, ...model.searchableTerms].join(' ').toLowerCase().includes(query))
  }, [search])

  return (
    <aside className="model-library">
      <div className="library-search-wrap">
        <Search className="ui-icon" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search all models..."
          aria-label="Search all models"
          data-testid="model-search"
        />
        <PanelLeftClose className="ui-icon library-panel-icon" aria-hidden="true" />
      </div>
      <div className="library-list">
        {filteredModels.length ? filteredModels.map((model) => (
          <ModelCard
            compact
            key={model.id}
            model={model}
            selectedModelId={selectedModelId}
            relatedIds={relatedIds}
            onSelect={(modelId) => setSelectedModelId((current) => (current === modelId ? null : modelId))}
          />
        )) : <div className="empty-models">No models found</div>}
      </div>
    </aside>
  )
}

export function App() {
  const [selectedModelId, setSelectedModelId] = useState(null)
  const [search, setSearch] = useState('')
  const [zoomMultiplier, setZoomMultiplier] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const createRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(event) {
      if (createRef.current && !createRef.current.contains(event.target)) setCreateOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setCreateOpen(false)
        setPresentationMode(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <main className={`schema-screen ${presentationMode ? 'is-presenting' : ''}`} data-testid="schema-screen">
      <Sidebar />
      <section className="workspace">
        <SchemaToolbar
          createOpen={createOpen}
          setCreateOpen={setCreateOpen}
          createRef={createRef}
          presentationMode={presentationMode}
          onTogglePresentation={() => {
            setPresentationMode((current) => !current)
            setZoomMultiplier(1)
          }}
        />
        <SchemaCanvas
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          zoomMultiplier={zoomMultiplier}
          setZoomMultiplier={setZoomMultiplier}
          presentationMode={presentationMode}
        />
      </section>
      <ModelLibrary
        search={search}
        setSearch={setSearch}
        selectedModelId={selectedModelId}
        setSelectedModelId={setSelectedModelId}
      />
    </main>
  )
}

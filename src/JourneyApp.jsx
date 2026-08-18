import {
  Check,
  Clock3,
  GitBranch,
  GripVertical,
  Pause,
  Pencil,
  Send,
  Split,
  UsersRound,
  X,
} from 'lucide-react'

import { JOURNEY_FRAME } from './journeyLayout.js'

const TILE_GROUPS = [
  { label: 'Activation', items: [[Send, 'Send to destination', 'activation']] },
  { label: 'Waits', items: [[Clock3, 'Time delay', 'wait'], [Pause, 'Hold until', 'wait']] },
  { label: 'Flow control', items: [[UsersRound, 'Segment', 'flow'], [Split, 'A/B Split', 'flow']] },
]

function TileIcon({ kind, icon: Icon }) {
  return <span className={`journey-icon is-${kind}`}><Icon aria-hidden="true" /></span>
}

function JourneyCard({ className = '', kind, icon, eyebrow, title, children }) {
  return (
    <article className={`journey-card ${className}`}>
      <header className="journey-card-header">
        <TileIcon kind={kind} icon={icon} />
        <div>
          <span className="journey-card-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <Pencil className="card-edit-icon" aria-hidden="true" />
      </header>
      <div className="journey-card-body">{children}</div>
    </article>
  )
}

function DestinationCard({ className, destination, action, mode, personalization }) {
  return (
    <JourneyCard className={className} kind="activation" icon={Send} eyebrow="Send to destination" title={destination}>
      <p className="action-copy">{action}</p>
      <div className="card-meta"><span>Sync mode</span><strong>{mode}</strong></div>
      {personalization ? <div className="personalization">{personalization}</div> : null}
    </JourneyCard>
  )
}

function BranchLabel({ className, tone = 'neutral', children }) {
  return <span className={`branch-label ${className} is-${tone}`}>{children}</span>
}

function Endpoint({ className, children, muted = false }) {
  return <div className={`journey-endpoint ${className} ${muted ? 'is-muted' : ''}`}><Check aria-hidden="true" />{children}</div>
}

function JourneyCanvas() {
  return (
    <section className="journey-canvas" aria-label="Journey workflow canvas">
      <div className="journey-stage">
        <svg className="journey-connectors" viewBox="0 0 1300 960" aria-hidden="true">
          <path d="M650 139 V155" />
          <path d="M650 233 V250 Q650 262 638 262 H365 Q350 262 350 277" />
          <path d="M650 233 V250 Q650 262 662 262 H950 Q965 262 965 277" />
          <path d="M350 397 V414 Q350 427 363 427 H637 Q650 427 650 440" />
          <path d="M965 397 V414 Q965 427 952 427 H663 Q650 427 650 440" />
          <path d="M650 512 V550" />
          <path d="M650 628 V650 Q650 663 637 663 H295 Q280 663 280 678" />
          <path d="M650 628 V650 Q650 663 663 663 H965 Q980 663 980 678" />
          <path d="M280 805 V841" />
          <path d="M980 775 V792 Q980 805 967 805 H805 Q790 805 790 820" />
          <path d="M980 775 V792 Q980 805 993 805 H1135 Q1150 805 1150 820" />
          <path d="M790 922 V938" />
          <path d="M1150 922 V938" />
        </svg>

        <JourneyCard className="start-card" kind="start" icon={GitBranch} eyebrow="Start" title="Enters audience">
          <strong className="audience-name">Women’s Tops — Viewed, Not Purchased</strong>
          <div className="audience-summary">
            <span>Viewed Women’s Tops within 7 days</span><span>No Women’s Tops purchase within 30 days</span>
            <span>Email eligible</span><span>Not in a conflicting campaign</span>
          </div>
          <div className="reentry-row"><span>Re-entry</span><strong>After 30 days</strong></div>
        </JourneyCard>

        <JourneyCard className="loyalty-segment" kind="flow" icon={UsersRound} eyebrow="Segment" title="Active Loyalty VIP?">
          <p>Evaluate loyalty tier from the warehouse profile</p>
        </JourneyCard>
        <BranchLabel className="vip-label" tone="positive">VIP</BranchLabel>
        <BranchLabel className="standard-label">Standard</BranchLabel>

        <DestinationCard
          className="vip-destination"
          destination="Braze"
          action="Trigger VIP Women’s Tops message"
          mode="Trigger · Insert"
          personalization="category_name · loyalty_tier · points_balance"
        />
        <DestinationCard
          className="standard-destination"
          destination="Braze"
          action="Trigger Women’s Tops browse reminder"
          mode="Trigger · Insert"
          personalization="category_name · last_viewed_product"
        />

        <JourneyCard className="delay-card" kind="wait" icon={Clock3} eyebrow="Time delay" title="2 days">
          <p>Continue after the delay</p>
        </JourneyCard>

        <JourneyCard className="engagement-segment" kind="flow" icon={UsersRound} eyebrow="Segment" title="Opened or clicked Braze message?">
          <p>Evaluate message engagement</p>
        </JourneyCard>
        <BranchLabel className="engaged-label" tone="positive">Engaged</BranchLabel>
        <BranchLabel className="not-engaged-label">Not engaged</BranchLabel>

        <DestinationCard
          className="engaged-destination"
          destination="Braze"
          action="Send personalized Women’s Tops recommendations"
          mode="Trigger · Insert"
        />
        <Endpoint className="engaged-endpoint">Journey complete</Endpoint>

        <JourneyCard className="ab-card" kind="flow" icon={Split} eyebrow="A/B Split" title="Random split">
          <div className="split-groups"><span>Group A <b>50%</b></span><span>Group B <b>50%</b></span></div>
        </JourneyCard>
        <BranchLabel className="group-a-label">Group A · 50%</BranchLabel>
        <BranchLabel className="group-b-label">Group B · 50%</BranchLabel>

        <DestinationCard
          className="meta-destination"
          destination="Meta Custom Audiences"
          action="Add to Women’s Tops retargeting audience"
          mode="Cohort · Upsert"
        />
        <DestinationCard
          className="google-destination"
          destination="Google Ads Customer Match"
          action="Add to Women’s Tops retargeting audience"
          mode="Cohort · Upsert"
        />
        <Endpoint className="meta-endpoint" muted>Continues until exit criteria</Endpoint>
        <Endpoint className="google-endpoint" muted>Continues until exit criteria</Endpoint>
      </div>
    </section>
  )
}

function JourneySidebar() {
  return (
    <aside className="journey-sidebar">
      <section className="sidebar-panel tiles-panel">
        <h2>Tiles</h2>
        {TILE_GROUPS.map((group) => (
          <div className="tile-group" key={group.label}>
            <h3>{group.label}</h3>
            {group.items.map(([Icon, label, kind]) => (
              <div className="tile-row" key={label}>
                <TileIcon kind={kind} icon={Icon} />
                <span>{label}</span>
                <GripVertical aria-hidden="true" />
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="sidebar-panel settings-panel">
        <div className="panel-heading"><h2>Settings</h2><button type="button"><Pencil aria-hidden="true" />Edit</button></div>
        <div className="settings-description"><h3>Description</h3><p>Recover high-intent Women’s Tops browsers across owned and paid channels</p></div>
        <div className="settings-grid">
          <div><h3>Schedule</h3><strong>Every 1 hour</strong></div>
          <div><h3>Exit criteria</h3><strong>3 filters</strong></div>
          <div><h3>Re-entry</h3><strong>After 30 days</strong></div>
        </div>
      </section>
    </aside>
  )
}

export function JourneyApp() {
  return (
    <main
      className="journey-screen"
      data-testid="journey-screen"
      style={{ width: JOURNEY_FRAME.width, height: JOURNEY_FRAME.height }}
    >
      <header className="journey-toolbar">
        <div className="journey-title-wrap">
          <h1>Women’s Tops — Viewed, Not Purchased</h1>
          <Pencil aria-hidden="true" />
          <span className="draft-pill">Draft</span>
        </div>
        <div className="journey-toolbar-actions">
          <span>Exit edit mode</span>
          <button className="save-button" type="button">Save changes</button>
          <button className="discard-button" type="button"><X aria-hidden="true" />Discard changes</button>
        </div>
      </header>
      <div
        className="journey-body"
        style={{
          height: JOURNEY_FRAME.height - JOURNEY_FRAME.toolbarHeight,
          gridTemplateColumns: `minmax(0, 1fr) ${JOURNEY_FRAME.sidebarWidth}px`,
        }}
      >
        <JourneyCanvas />
        <JourneySidebar />
      </div>
    </main>
  )
}

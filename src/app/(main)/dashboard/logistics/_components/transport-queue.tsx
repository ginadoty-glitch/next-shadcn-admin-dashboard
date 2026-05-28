"use client";

/**
 * TransportQueue — High-density transport order manifest with temporal pressure.
 *
 * Each row is a compact operational manifest strip.
 * Target: ~55-70px per row, 8+ orders per viewport.
 *
 * Row structure:
 *   Row 1: [CI ID] · [● status] [STATUS TEXT]      [▲/→] [temporal ETA]
 *   Row 2: [Origin → Dest] · [Cargo]          [■BLK] [▲RTE] [⊘CI]
 *   Row 3: [Priority coordination note — 1 line] (priority orders only)
 *   [1px progress strip]
 *
 * Temporal ETA — colored by time pressure relative to productionTime:
 *   Red    = overdue (past ETA, status still active)
 *   Amber  = critical window (<20 min to delivery/deadline)
 *   Muted  = on-time or scheduled far out
 *   Green  = completed/settled
 *   Dash   = no parseable ETA (blocked, TBD, permit-pending)
 */

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DerivedOrderState } from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type { Shipment } from "./shipment-data";

// ─── Semantic status maps ──────────────────────────────────────────────────────

/**
 * Status dot color.
 * Green  = active movement
 * Amber  = timing risk / attention
 * Red    = blocked / hard stop
 * Slate  = not yet started
 */
const statusDot: Record<Shipment["status"], string> = {
  Scheduled: "bg-muted-foreground/35",
  "En Route": "bg-[#47AE90]",
  Dispatched: "bg-[#47AE90]",
  Completed: "bg-[#47AE90]/60",
  "Held — Delayed": "bg-[#f2b90e]",
  "On Hold": "bg-[#d3410c]",
  "Awaiting Clearance": "bg-[#d3410c]",
};

/** Progress strip — 1px bar at bottom of each manifest row. */
const progressBar: Record<Shipment["status"], string> = {
  Scheduled: "bg-muted-foreground/20",
  "En Route": "bg-[#47AE90]/50",
  Dispatched: "bg-[#47AE90]/40",
  Completed: "bg-[#47AE90]/60",
  "Held — Delayed": "bg-[#f2b90e]/35",
  "On Hold": "bg-[#d3410c]/35",
  "Awaiting Clearance": "bg-[#d3410c]/35",
};

// ─── Temporal pressure ────────────────────────────────────────────────────────

export type TemporalRisk = "overdue" | "critical" | "watch" | "on-time" | "settled";

type TemporalState = {
  risk: TemporalRisk;
  display: string;
};

/**
 * Parse a production time string into minutes since midnight.
 * Handles: "07:30 AM", "07:45", "14:00", "02:50 PM"
 * Returns null for non-parseable values (Pending, TBD, Tonight, etc.)
 */
export function parseProductionMinutes(timeStr: string): number | null {
  const ampm = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = Number.parseInt(ampm[1], 10);
    const m = Number.parseInt(ampm[2], 10);
    if (ampm[3].toUpperCase() === "AM" && h === 12) h = 0;
    if (ampm[3].toUpperCase() === "PM" && h !== 12) h += 12;
    return h * 60 + m;
  }
  const h24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return Number.parseInt(h24[1], 10) * 60 + Number.parseInt(h24[2], 10);
  return null;
}

/**
 * Derive temporal pressure state for a transport order row.
 *
 * productionMinutes: current shoot-day time in minutes since midnight.
 * Uses etaMeta as a fallback if the primary eta string is not parseable
 * (e.g. eta="Departing", etaMeta="02:50 PM").
 */
export function computeTemporalState(
  shipment: Pick<Shipment, "eta" | "etaMeta" | "status">,
  productionMinutes: number,
): TemporalState {
  const { eta, etaMeta, status } = shipment;

  if (status === "Completed") {
    return { risk: "settled", display: "✓" };
  }

  // Hard-stop states with no scheduled ETA — surface as blocked.
  if (
    (status === "On Hold" || status === "Awaiting Clearance") &&
    !parseProductionMinutes(eta) &&
    !parseProductionMinutes(etaMeta)
  ) {
    return { risk: "overdue", display: "—" };
  }

  // Try primary eta then etaMeta as fallback.
  const etaMin = parseProductionMinutes(eta) ?? parseProductionMinutes(etaMeta);

  if (etaMin === null) {
    // Non-parseable ETA — show as dim watch state.
    const dimmed = eta.toLowerCase().replace("am", "").replace("pm", "").trim();
    return { risk: "watch", display: dimmed.length > 8 ? "TBD" : dimmed };
  }

  const delta = etaMin - productionMinutes;

  if (delta < -90) {
    // Very overdue — show minutes late
    const late = Math.abs(Math.floor(delta));
    return { risk: "overdue", display: `+${late}m` };
  }
  if (delta < 0) {
    return { risk: "overdue", display: "overdue" };
  }
  if (delta < 20) {
    // Critical window — minutes to deadline
    return { risk: "critical", display: `${Math.floor(delta)}m` };
  }
  if (delta < 60) {
    // Watch — approaching
    return { risk: "watch", display: `${Math.floor(delta)}m` };
  }
  // On-time — strip AM/PM for compactness, keep 24h if already 24h format
  const displayTime = eta.replace(/\s*(AM|PM)$/i, "");
  return { risk: "on-time", display: displayTime };
}

// ─── Propagation indicators ───────────────────────────────────────────────────

/**
 * Up to 2 highest-severity propagation indicators for inline display.
 * Prioritized: blocking > route/conflict > signature > revision.
 */
function rowIndicators(derived: DerivedOrderState): { label: string; cls: string }[] {
  const tags: { label: string; cls: string }[] = [];
  if (
    derived.isBlocked ||
    derived.isPermitPending ||
    derived.hasDestinationRestriction ||
    derived.isDriverUnavailable
  ) {
    tags.push({ label: "■ BLK", cls: "text-[#d3410c]" });
  }
  if (derived.hasRouteCompromise || derived.hasMovementConflict) {
    tags.push({ label: "▲ RTE", cls: "text-[#f2b90e]" });
  }
  if (derived.hasUnresolvedSignature) {
    tags.push({ label: "⊘ CI", cls: "text-[#f2b90e]" });
  }
  if (derived.hasRevisionImpact) {
    tags.push({ label: "↻ REV", cls: "text-[#4a7fa5]/80" });
  }
  return tags.slice(0, 2);
}

// ─── Location shortener ────────────────────────────────────────────────────────

function shortLoc(display: string): string {
  const idx = display.indexOf(" — ");
  return idx > 0 ? display.slice(0, idx).trim() : display;
}

// ─── Manifest row ─────────────────────────────────────────────────────────────

type ManifestRowProps = {
  active?: boolean;
  derived: DerivedOrderState;
  onSelectShipment: (id: string) => void;
  shipment: Shipment;
  temporal: TemporalState;
};

function ManifestRow({ shipment, derived, active, temporal, onSelectShipment }: ManifestRowProps) {
  const isBlocker =
    derived.isBlocked || derived.isPermitPending || derived.hasDestinationRestriction || derived.isDriverUnavailable;
  const isAttention = !isBlocker && (derived.hasRouteCompromise || derived.hasMovementConflict);
  // Overdue active orders get a red left accent even without a hard propagation block.
  const isOverdue = temporal.risk === "overdue" && shipment.status !== "Completed";

  const indicators = rowIndicators(derived);
  const origin = shortLoc(shipment.origin.display);
  const dest = shortLoc(shipment.destination.display);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={(e) => {
        e.currentTarget.blur();
        onSelectShipment(shipment.id);
      }}
      className={cn(
        "relative w-full rounded border px-2.5 py-1.5 text-left transition-colors",
        "hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#bfd4ef]/20",
        active ? "border-[#bfd4ef]/30 bg-[#bfd4ef]/[0.04]" : "border-border/50 bg-transparent",
      )}
    >
      {/* Left accent strip — semantic priority */}
      {!active && isBlocker && <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#d3410c]/55" />}
      {!active && !isBlocker && isOverdue && (
        <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#d3410c]/40" />
      )}
      {!active && !isBlocker && !isOverdue && isAttention && (
        <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#f2b90e]/40" />
      )}

      {/* ── Row 1: ID · status  →  urgency + temporal ETA ── */}
      <div className="flex items-center gap-1.5">
        <span className="shrink-0 font-mono text-[10px] tracking-wider text-[#bfd4ef]/70">{shipment.id}</span>
        <span className="text-[9px] text-muted-foreground/25">·</span>
        <div className={cn("size-1.5 shrink-0 rounded-full", statusDot[shipment.status])} />
        <span className="min-w-0 truncate text-[9px] uppercase tracking-widest text-muted-foreground/55">
          {shipment.status}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
          {shipment.urgency === "priority" && <span className="font-mono text-[9px] text-[#f2b90e]">▲</span>}
          {shipment.urgency === "watch" && <span className="font-mono text-[9px] text-[#94a3b8]">→</span>}
          {/* Temporal ETA — color encodes time pressure */}
          <span
            className={cn(
              "font-mono text-[10px] tabular-nums",
              temporal.risk === "overdue" && "text-[#d3410c]",
              temporal.risk === "critical" && "text-[#f2b90e]",
              temporal.risk === "watch" && "text-foreground/65",
              temporal.risk === "on-time" && "text-muted-foreground/60",
              temporal.risk === "settled" && "text-[#47AE90]/60",
            )}
          >
            {temporal.display}
          </span>
        </div>
      </div>

      {/* ── Row 2: Route · Cargo  →  propagation tags ── */}
      <div className="mt-0.5 flex items-center">
        <div className="flex min-w-0 shrink items-center gap-1 text-[9px]">
          <span className="max-w-[72px] truncate text-muted-foreground/60">{origin}</span>
          <span className="shrink-0 text-muted-foreground/25">→</span>
          <span className="max-w-[80px] truncate font-medium text-[#dbd5c5]/80">{dest}</span>
        </div>
        <span className="mx-1.5 shrink-0 text-[9px] text-muted-foreground/20">·</span>
        <div className="min-w-0 flex-1 truncate text-[9px] text-muted-foreground/55">{shipment.cargo}</div>
        {indicators.length > 0 && (
          <div className="ml-1.5 flex shrink-0 items-center gap-1.5">
            {indicators.map(({ label, cls }) => (
              <span key={label} className={cn("font-mono text-[8px] uppercase tracking-tight", cls)}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 3: Priority coordination note ── */}
      {shipment.urgency === "priority" && (
        <div className="mt-0.5 truncate text-[9px] leading-none text-[#f2b90e]/55">{shipment.operationalNote}</div>
      )}

      {/* ── Progress strip ── */}
      <div className="mt-1.5 h-px overflow-hidden rounded-full bg-border/30">
        <div
          className={cn("h-full rounded-full", progressBar[shipment.status])}
          style={{ width: `${shipment.progress}%` }}
        />
      </div>
    </button>
  );
}

// ─── Queue shell ──────────────────────────────────────────────────────────────

type TransportQueueProps = {
  derivedStates: Map<string, DerivedOrderState>;
  onSelectShipment: (id: string) => void;
  productionTime: string;
  selectedShipmentId: string | null;
  shipments: Shipment[];
};

const EMPTY_DERIVED: DerivedOrderState = {
  isBlocked: false,
  isPermitPending: false,
  hasRouteCompromise: false,
  hasDestinationRestriction: false,
  hasOvernightHold: false,
  hasMovementConflict: false,
  hasRevisionImpact: false,
  isDriverUnavailable: false,
  isFrenchHoursActive: false,
  hasUnresolvedSignature: false,
  highestTier: null,
  linkedConditions: [],
};

export function TransportQueue({
  shipments,
  derivedStates,
  selectedShipmentId,
  onSelectShipment,
  productionTime,
}: TransportQueueProps) {
  const productionMinutes = parseProductionMinutes(productionTime) ?? 0;

  const blockedCount = shipments.filter((s) => {
    const d = derivedStates.get(s.id);
    return d && (d.isBlocked || d.isPermitPending || d.hasDestinationRestriction);
  }).length;

  return (
    <Card className="h-full rounded-none ring-0">
      <CardHeader className="px-3 py-2">
        <CardTitle className="font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Transport Orders
          {blockedCount > 0 && (
            <span className="ml-2 rounded bg-[#d3410c]/10 px-1.5 py-0.5 font-mono text-[8px] normal-case tracking-normal text-[#d3410c]">
              {blockedCount} blocked
            </span>
          )}
        </CardTitle>
        <CardAction>
          {/* Production clock — anchors all temporal ETA calculations */}
          <span className="mr-1.5 font-mono text-[8px] tracking-wider text-muted-foreground/30">
            D12 · {productionTime}
          </span>
          <Button size="icon-sm" variant="ghost" className="size-6">
            <SlidersHorizontal className="size-3" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1.5 overflow-hidden px-0">
        {/* Filter tabs */}
        <Tabs defaultValue="all">
          <TabsList className="h-7 w-full border-b px-3" variant="line">
            <TabsTrigger className="h-7 px-2 text-[10px]" value="all">
              All ({shipments.length})
            </TabsTrigger>
            <TabsTrigger className="h-7 px-2 text-[10px]" value="active">
              Active
            </TabsTrigger>
            <TabsTrigger className="h-7 px-2 text-[10px]" value="held">
              Held
            </TabsTrigger>
            {blockedCount > 0 && (
              <TabsTrigger className="h-7 px-2 text-[10px]" value="blocked">
                <span className="text-[#d3410c]">■</span>
                <span className="ml-1">{blockedCount}</span>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="px-3">
          <InputGroup className="h-6">
            <InputGroupInput
              className="h-6 text-[10px]"
              aria-label="Search transport orders"
              placeholder="Search orders..."
            />
            <InputGroupAddon>
              <Search className="size-3" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Manifest list */}
        <ScrollArea className="h-0 flex-1">
          <div className="flex flex-col gap-0.5 px-2.5 pb-3">
            {shipments.map((shipment) => (
              <ManifestRow
                key={shipment.id}
                active={shipment.id === selectedShipmentId}
                derived={derivedStates.get(shipment.id) ?? EMPTY_DERIVED}
                shipment={shipment}
                temporal={computeTemporalState(shipment, productionMinutes)}
                onSelectShipment={onSelectShipment}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

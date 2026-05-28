"use client";

/**
 * DispatchQueue — High-density transport order manifest.
 *
 * Each row is a compact operational manifest strip, not a card.
 * Target: ~55-70px per row so coordinators can scan 8+ orders per viewport.
 *
 * Row structure:
 *   Row 1: [CI ID] · [● status dot] [STATUS]          [▲/→] [ETA]
 *   Row 2: [Origin → Dest] · [Cargo]           [■BLK] [▲RTE] [⊘CI]
 *   Row 3: [Priority note — 1 line, truncated] (priority orders only)
 *   [1px progress strip at bottom]
 *
 * Propagation indicators are inline in Row 2 (max 2, right-aligned).
 * Flags are suppressed — all current orders are domestic Canadian.
 * Urgency note shown only for priority orders (single truncated line).
 */

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DerivedOrderState } from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type { Shipment } from "../../logistics/_components/shipment-data";

// ─── Visual maps ────────────────────────────────────────────────────────────────

/** Semantic status dot — replaces the complex conic-gradient progress ring. */
const statusDot: Record<Shipment["status"], string> = {
  Scheduled: "bg-muted-foreground/40",
  "En Route": "bg-[#47AE90]",
  Dispatched: "bg-[#f2b90e]",
  Completed: "bg-[#47AE90]/60",
  "Held — Delayed": "bg-[#d3410c]",
  "On Hold": "bg-[#933614]",
  "Awaiting Clearance": "bg-[#933614]",
};

/** Progress strip color — thin 1px bar at the bottom of each row. */
const progressBar: Record<Shipment["status"], string> = {
  Scheduled: "bg-muted-foreground/20",
  "En Route": "bg-[#47AE90]/50",
  Dispatched: "bg-[#f2b90e]/40",
  Completed: "bg-[#47AE90]/60",
  "Held — Delayed": "bg-[#d3410c]/40",
  "On Hold": "bg-[#933614]/40",
  "Awaiting Clearance": "bg-[#933614]/40",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extract short location name by stripping the venue qualifier after em-dash.
 * "Stage 4 — Bridge Studios" → "Stage 4"
 * "Cloverdale Market — Set" → "Cloverdale Market"
 */
function shortLoc(display: string): string {
  const idx = display.indexOf(" — ");
  return idx > 0 ? display.slice(0, idx).trim() : display;
}

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
    tags.push({ label: "⊘ CI", cls: "text-[#933614]" });
  }
  if (derived.hasRevisionImpact) {
    tags.push({ label: "↻ REV", cls: "text-[#4a7fa5]/80" });
  }

  return tags.slice(0, 2);
}

// ─── Manifest row ────────────────────────────────────────────────────────────────

type DispatchQueueRowProps = {
  active?: boolean;
  derived: DerivedOrderState;
  onSelectShipment: (id: string) => void;
  shipment: Shipment;
};

function DispatchQueueRow({ shipment, derived, active, onSelectShipment }: DispatchQueueRowProps) {
  const isBlocker =
    derived.isBlocked || derived.isPermitPending || derived.hasDestinationRestriction || derived.isDriverUnavailable;
  const isAttention = !isBlocker && (derived.hasRouteCompromise || derived.hasMovementConflict);

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
      {/* Left blocking accent strip */}
      {!active && isBlocker && <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#d3410c]/55" />}
      {!active && isAttention && <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#f2b90e]/40" />}

      {/* ── Row 1: ID · status · text  →  urgency glyph + ETA ── */}
      <div className="flex items-center gap-1.5">
        <span className="shrink-0 font-mono text-[#bfd4ef]/70 text-[10px] tracking-wider">{shipment.id}</span>
        <span className="text-[9px] text-muted-foreground/25">·</span>
        <div className={cn("size-1.5 shrink-0 rounded-full", statusDot[shipment.status])} />
        <span className="min-w-0 truncate text-[9px] text-muted-foreground/55 uppercase tracking-widest">
          {shipment.status}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
          {shipment.urgency === "priority" && <span className="font-mono text-[#f2b90e] text-[9px]">▲</span>}
          {shipment.urgency === "watch" && <span className="font-mono text-[#94a3b8] text-[9px]">→</span>}
          <span className="font-mono text-[10px] text-foreground/80 tabular-nums">{shipment.eta}</span>
        </div>
      </div>

      {/* ── Row 2: Route · Cargo  →  propagation tags ── */}
      <div className="mt-0.5 flex items-center">
        {/* Origin → Dest */}
        <div className="flex min-w-0 shrink items-center gap-1 text-[9px]">
          <span className="max-w-[72px] truncate text-muted-foreground/60">{origin}</span>
          <span className="shrink-0 text-muted-foreground/25">→</span>
          <span className="max-w-[80px] truncate font-medium text-[#dbd5c5]/80">{dest}</span>
        </div>
        <span className="mx-1.5 shrink-0 text-[9px] text-muted-foreground/20">·</span>
        {/* Cargo — flex-1, truncated */}
        <div className="min-w-0 flex-1 truncate text-[9px] text-muted-foreground/55">{shipment.cargo}</div>
        {/* Propagation indicators — inline, max 2 */}
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

      {/* ── Row 3: Priority coordination note — 1 line, truncated ── */}
      {shipment.urgency === "priority" && (
        <div className="mt-0.5 truncate text-[#f2b90e]/55 text-[9px] leading-none">{shipment.operationalNote}</div>
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

// ─── Queue shell ─────────────────────────────────────────────────────────────────

type DispatchQueueProps = {
  derivedStates: Map<string, DerivedOrderState>;
  onSelectShipment: (id: string) => void;
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

export function DispatchQueue({ shipments, derivedStates, selectedShipmentId, onSelectShipment }: DispatchQueueProps) {
  const blockedCount = shipments.filter((s) => {
    const d = derivedStates.get(s.id);
    return d && (d.isBlocked || d.isPermitPending || d.hasDestinationRestriction);
  }).length;

  return (
    <Card className="h-full rounded-none ring-0">
      <CardHeader className="px-3 py-2">
        <CardTitle className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
          Transport Orders
          {blockedCount > 0 && (
            <span className="ml-2 rounded bg-[#d3410c]/10 px-1.5 py-0.5 font-mono text-[#d3410c] text-[8px] normal-case tracking-normal">
              {blockedCount} blocked
            </span>
          )}
        </CardTitle>
        <CardAction>
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
              <DispatchQueueRow
                key={shipment.id}
                active={shipment.id === selectedShipmentId}
                derived={derivedStates.get(shipment.id) ?? EMPTY_DERIVED}
                shipment={shipment}
                onSelectShipment={onSelectShipment}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

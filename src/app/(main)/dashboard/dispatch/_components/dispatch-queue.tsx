"use client";

/**
 * DispatchQueue — Propagation-aware transport order queue.
 *
 * Replaces ShipmentList in the Dispatch context.
 * ShipmentList is preserved unchanged for the Logistics page.
 *
 * Each card surfaces propagation state computed by the propagation engine:
 * - Blocked (red border + indicator)
 * - Permit pending (amber indicator)
 * - Route compromised (amber indicator)
 * - Destination restricted (red indicator)
 * - Overnight hold (dim indicator)
 * - Revision impact (cool-blue indicator)
 * - Unresolved signature (warm indicator)
 *
 * Visual doctrine:
 * - Propagation indicators are additive overlays on the existing card rhythm.
 * - They do not replace the card — they surface conditions above the note line.
 * - Operational scanning speed is preserved: most cards have no indicators.
 * - Blocked cards get a left border accent, not a full card redesign.
 */

import { Plane, Search, Ship, SlidersHorizontal, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DerivedOrderState } from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type { Shipment } from "../../logistics/_components/shipment-data";

// ─── Visual maps ───────────────────────────────────────────────────────────────

const modeIcons = {
  air: Plane,
  land: Truck,
  sea: Ship,
} as const;

const progressRingClasses: Record<Shipment["status"], string> = {
  Scheduled: "text-muted-foreground",
  "En Route": "text-[#f2b90e]",
  Dispatched: "text-[#f2b90e]",
  Completed: "text-[#45d30c]",
  "Held — Delayed": "text-[#d3410c]",
  "On Hold": "text-[#933614]",
  "Awaiting Clearance": "text-[#933614]",
};

// ─── Propagation indicator strip ─────────────────────────────────────────────────

/**
 * A compact horizontal strip of operational impact indicators.
 * Only renders if at least one propagation condition is active for this order.
 * Indicators are brief production-language tags — not full descriptions.
 */
function PropagationIndicatorStrip({ derived }: { derived: DerivedOrderState }) {
  const indicators: { label: string; className: string }[] = [];

  if (derived.isBlocked || derived.isPermitPending) {
    indicators.push({
      label: derived.isPermitPending ? "Permit pending" : "Blocked",
      className: "text-[#d3410c]",
    });
  }
  if (derived.hasDestinationRestriction) {
    indicators.push({ label: "Dest. restricted", className: "text-[#d3410c]" });
  }
  if (derived.hasRouteCompromise) {
    indicators.push({ label: "Route compromised", className: "text-[#f2b90e]" });
  }
  if (derived.hasMovementConflict) {
    indicators.push({ label: "Movement conflict", className: "text-[#f2b90e]" });
  }
  if (derived.hasOvernightHold) {
    indicators.push({ label: "Overnight hold", className: "text-muted-foreground" });
  }
  if (derived.hasRevisionImpact) {
    indicators.push({ label: "Revision impact", className: "text-[#bfd4ef]" });
  }
  if (derived.hasUnresolvedSignature) {
    indicators.push({ label: "⊘ Unsigned CI", className: "text-[#933614]" });
  }
  if (derived.isDriverUnavailable) {
    indicators.push({ label: "Driver unavail.", className: "text-[#d3410c]" });
  }

  if (indicators.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-border/50 border-t pt-2">
      {indicators.map(({ label, className }) => (
        <span key={label} className={cn("font-mono text-[9px] uppercase tracking-[0.1em]", className)}>
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Queue card ────────────────────────────────────────────────────────────────

type DispatchQueueCardProps = {
  active?: boolean;
  derived: DerivedOrderState;
  onSelectShipment: (id: string) => void;
  shipment: Shipment;
};

function DispatchQueueCard({ shipment, derived, active, onSelectShipment }: DispatchQueueCardProps) {
  const angle = (shipment.progress / 100) * 360;
  const Icon = modeIcons[shipment.mode];

  // Left accent border communicates blocking state immediately on scan
  const hasBlockingState =
    derived.isBlocked || derived.isPermitPending || derived.hasDestinationRestriction || derived.isDriverUnavailable;

  const hasAttentionState = derived.hasRouteCompromise || derived.hasMovementConflict;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={(event) => {
        event.currentTarget.blur();
        onSelectShipment(shipment.id);
      }}
      className={cn(
        "relative flex w-full flex-col gap-3 rounded border p-3 text-left transition-colors",
        "hover:bg-[#f2b90e]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b90e]/30",
        // Active selection
        active ? "border-[#f2b90e]/50 bg-[#f2b90e]/[0.04]" : "border-border",
        // Propagation border overrides — left accent only
        !active && hasBlockingState && "border-l-[#d3410c]/60",
        !active && !hasBlockingState && hasAttentionState && "border-l-[#f2b90e]/40",
      )}
    >
      {/* Blocking left accent strip */}
      {!active && hasBlockingState && <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#d3410c]/50" />}
      {!active && !hasBlockingState && hasAttentionState && (
        <div className="absolute inset-y-0 left-0 w-[2px] rounded-l bg-[#f2b90e]/40" />
      )}

      {/* Row 1: CI Number + Status ring */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] text-muted-foreground tracking-wider">{shipment.id}</div>
        <div className="flex items-center gap-1.5">
          <div
            style={{ "--angle": `${angle}deg` } as React.CSSProperties}
            className={cn(
              "grid size-3 place-items-center rounded-full bg-[conic-gradient(currentColor_0deg_var(--angle),transparent_var(--angle)_360deg)] p-[0.5px]",
              progressRingClasses[shipment.status],
            )}
          >
            <div className="grid size-2 place-items-center rounded-full bg-card">
              <div className="size-1 rounded-full bg-current" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{shipment.status}</div>
        </div>
      </div>

      {/* Row 2: Origin → Destination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn(`flag:${shipment.origin.countryCode.toUpperCase()}`, "rounded-xs text-xl outline")} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate font-medium text-xs leading-none">{shipment.origin.display}</div>
            <div className="text-[10px] text-muted-foreground leading-none">{shipment.origin.country}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-right">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate font-medium text-xs leading-none">{shipment.destination.display}</div>
            <div className="text-[10px] text-muted-foreground leading-none">{shipment.destination.country}</div>
          </div>
          <div className={cn(`flag:${shipment.destination.countryCode.toUpperCase()}`, "rounded-xs text-xl outline")} />
        </div>
      </div>

      {/* Row 3: Progress dashed line */}
      <div className="flex items-center gap-0.5">
        <span
          className="h-px min-w-0 border-foreground border-t border-dashed"
          style={{ flexGrow: shipment.progress, flexBasis: 0 }}
        />
        <Icon className={cn("size-3.5", shipment.mode === "air" && "rotate-45")} />
        <span
          className="h-px min-w-0 border-border border-t border-dashed"
          style={{ flexGrow: 100 - shipment.progress, flexBasis: 0 }}
        />
      </div>

      {/* Row 4: Cargo + Call Time */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <div className="mb-1 text-[10px] text-muted-foreground uppercase leading-none tracking-widest">
            Brokered Items
          </div>
          <div className="truncate font-medium text-xs">{shipment.cargo}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="mb-1 text-[10px] text-muted-foreground uppercase leading-none tracking-widest">Call Time</div>
          <div className="font-mono text-xs tabular-nums">
            {shipment.eta}
            {shipment.etaMeta && (
              <span className="ml-1 font-normal font-sans text-[10px] text-muted-foreground">{shipment.etaMeta}</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Urgency / coordination note */}
      <div
        className={cn(
          "border-border border-t pt-2 text-[10px] leading-snug",
          shipment.urgency === "priority" && "text-[#f2b90e]",
          shipment.urgency === "watch" && "text-[#dbd5c5]",
          shipment.urgency === "normal" && "text-muted-foreground",
        )}
      >
        {shipment.urgency === "priority" && <span className="mr-1">▲</span>}
        {shipment.urgency === "watch" && <span className="mr-1">→</span>}
        {shipment.operationalNote}
      </div>

      {/* Row 6: Propagation indicators (conditional) */}
      <PropagationIndicatorStrip derived={derived} />
    </button>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────────

type DispatchQueueProps = {
  derivedStates: Map<string, DerivedOrderState>;
  onSelectShipment: (id: string) => void;
  selectedShipmentId: string | null;
  shipments: Shipment[];
};

export function DispatchQueue({ shipments, derivedStates, selectedShipmentId, onSelectShipment }: DispatchQueueProps) {
  const blockedCount = shipments.filter((s) => {
    const d = derivedStates.get(s.id);
    return d && (d.isBlocked || d.isPermitPending || d.hasDestinationRestriction);
  }).length;

  return (
    <Card className="h-full rounded-none ring-0">
      <CardHeader>
        <CardTitle className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.15em]">
          Transport Orders
          {blockedCount > 0 && (
            <span className="ml-2 rounded bg-[#d3410c]/10 px-1.5 py-0.5 font-mono text-[#d3410c] text-[9px] normal-case tracking-normal">
              {blockedCount} blocked
            </span>
          )}
        </CardTitle>
        <CardAction>
          <Button size="icon-sm" variant="ghost">
            <SlidersHorizontal />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden px-0">
        <Tabs defaultValue="all">
          <TabsList className="w-full border-b px-4" variant="line">
            <TabsTrigger className="text-xs" value="all">
              All ({shipments.length})
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="en-route">
              En Route
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="held">
              Held
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="blocked">
              Blocked
              {blockedCount > 0 && <span className="ml-1 font-mono text-[#d3410c] text-[9px]">{blockedCount}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="px-4">
          <InputGroup className="h-8">
            <InputGroupInput
              className="h-8"
              aria-label="Search transport orders"
              placeholder="Search transport orders..."
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="flex flex-col gap-2 px-4">
            {shipments.map((shipment) => (
              <DispatchQueueCard
                key={shipment.id}
                active={shipment.id === selectedShipmentId}
                derived={
                  derivedStates.get(shipment.id) ?? {
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
                  }
                }
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

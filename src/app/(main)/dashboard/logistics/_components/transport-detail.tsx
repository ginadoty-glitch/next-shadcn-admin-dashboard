"use client";

import { AlertTriangleIcon, Phone, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DerivedOrderState } from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type { ConditionTier, DriverAssignment, OperationalCondition } from "./operational-data";
import type { AttachedDocument, ProductionLogEntry, RouteWaypoint, Shipment } from "./shipment-data";
import { ShipmentRouteMap } from "./shipment-route-map";

// ─── Visual maps ───────────────────────────────────────────────────────────────

/**
 * Status badge classes — canonical semantic color mapping.
 * Green  = active movement / confirmed delivery
 * Amber  = timing risk / attention required
 * Red    = blocked / hard failure
 * Slate  = inactive / pending start
 */
const statusBadgeClasses: Record<Shipment["status"], string> = {
  Scheduled: "border-muted bg-muted/50 text-muted-foreground",
  "En Route": "border-[#47AE90]/30 bg-[#47AE90]/10 text-[#47AE90]",
  Dispatched: "border-[#47AE90]/30 bg-[#47AE90]/10 text-[#47AE90]",
  Completed: "border-[#47AE90]/30 bg-[#47AE90]/10 text-[#47AE90]/80",
  "Held — Delayed": "border-[#f2b90e]/30 bg-[#f2b90e]/10 text-[#f2b90e]",
  "On Hold": "border-[#d3410c]/30 bg-[#d3410c]/10 text-[#d3410c]",
  "Awaiting Clearance": "border-[#d3410c]/30 bg-[#d3410c]/10 text-[#d3410c]",
};

const driverStatusDot: Record<DriverAssignment["status"], string> = {
  active: "bg-[#47AE90]",
  staged: "bg-[#f2b90e]",
  standby: "bg-[#4a7fa5]",
  "off-duty": "bg-border",
};

const driverStatusLabel: Record<DriverAssignment["status"], string> = {
  active: "Active",
  staged: "Staged",
  standby: "Standby",
  "off-duty": "Off Duty",
};

const conditionTierMeta: Record<
  ConditionTier,
  { indicator: string; textClass: string; borderClass: string; bgClass: string }
> = {
  legal: {
    indicator: "■ LEGAL",
    textClass: "text-[#d3410c]",
    borderClass: "border-[#d3410c]/50",
    bgClass: "bg-[#d3410c]/[0.07]",
  },
  blocker: {
    indicator: "■ BLOCKED",
    textClass: "text-[#d3410c]",
    borderClass: "border-[#d3410c]/40",
    bgClass: "bg-[#d3410c]/[0.05]",
  },
  attention: {
    indicator: "▲ ATTENTION",
    textClass: "text-[#f2b90e]",
    borderClass: "border-[#f2b90e]/30",
    bgClass: "bg-[#f2b90e]/[0.05]",
  },
  informational: {
    indicator: "→ INFO",
    textClass: "text-[#bfd4ef]",
    borderClass: "border-[#bfd4ef]/20",
    bgClass: "bg-[#bfd4ef]/[0.04]",
  },
};

const waypointDotStyles: Record<RouteWaypoint["state"], string> = {
  completed: "bg-[#47AE90]",
  active: "bg-[#f2b90e]",
  pending: "bg-border",
  restricted: "bg-[#d3410c]",
};

const waypointNoteStyles: Record<RouteWaypoint["state"], string> = {
  completed: "text-muted-foreground",
  active: "text-[#dbd5c5]",
  pending: "text-muted-foreground",
  restricted: "text-[#d3410c]",
};

const logTypeStyles: Record<ProductionLogEntry["type"], string> = {
  dispatch: "text-[#bfd4ef]",
  update: "text-muted-foreground",
  alert: "text-[#f2b90e]",
  confirmation: "text-[#47AE90]",
};

const docTypeBadgeStyles: Record<AttachedDocument["type"], string> = {
  "call-sheet": "border-[#bfd4ef]/30 bg-[#bfd4ef]/[0.08] text-[#bfd4ef]",
  "movement-order": "border-[#bfd4ef]/30 bg-[#bfd4ef]/[0.08] text-[#bfd4ef]",
  permit: "border-[#f2b90e]/30 bg-[#f2b90e]/[0.07] text-[#f2b90e]",
  ci: "border-border bg-muted/50 text-muted-foreground",
  revision: "border-[#47AE90]/30 bg-[#47AE90]/[0.07] text-[#47AE90]",
};

const docTypeLabels: Record<AttachedDocument["type"], string> = {
  "call-sheet": "Call Sheet",
  "movement-order": "MO",
  permit: "Permit",
  ci: "CI Form",
  revision: "Manifest",
};

// ─── Propagation banners ────────────────────────────────────────────────────────

/**
 * Surfaces cascading propagation impacts for the selected transport order.
 * Shown before the driver card — highest-priority operational context first.
 *
 * Constitutional: auto-flag, human-clear.
 * These banners appear automatically from computed propagation state.
 * They clear only when the underlying condition is cleared by a coordinator.
 */
function PropagationBanners({ derived }: { derived: DerivedOrderState }) {
  const banners: { key: string; tier: ConditionTier; label: string; note: string }[] = [];

  if (derived.isBlocked && !derived.isPermitPending) {
    banners.push({
      key: "blocked",
      tier: "blocker",
      label: "Movement Blocked",
      note: "A hard-block condition is active. This order cannot proceed until the condition is cleared by a coordinator.",
    });
  }

  if (derived.isPermitPending) {
    banners.push({
      key: "permit",
      tier: "blocker",
      label: "Permit Pending",
      note: "Location or transit permit decision outstanding. Dispatch on hold until clearance received.",
    });
  }

  if (derived.hasDestinationRestriction) {
    banners.push({
      key: "dest-restricted",
      tier: "blocker",
      label: "Destination Access Restricted",
      note: "Set or location access is restricted. Vehicle may not proceed to destination until clearance is confirmed.",
    });
  }

  if (derived.hasRouteCompromise) {
    banners.push({
      key: "route",
      tier: "attention",
      label: "Route Compromised",
      note: "Weight restriction or road closure affects the scheduled route. Reroute may be required — confirm with coordinator.",
    });
  }

  if (derived.hasMovementConflict) {
    banners.push({
      key: "conflict",
      tier: "attention",
      label: "Movement Conflict",
      note: "Competing movement at staging or gate. Driver on hold — Locations resolving.",
    });
  }

  if (derived.isDriverUnavailable) {
    banners.push({
      key: "driver",
      tier: "blocker",
      label: "Driver Unavailable",
      note: "Assigned driver is off-duty or restricted. This order requires reassignment before dispatch.",
    });
  }

  if (derived.isFrenchHoursActive) {
    banners.push({
      key: "french",
      tier: "attention",
      label: "French Hours Active",
      note: "French Hours in effect. Turnaround and overtime calculations apply from 18:00.",
    });
  }

  if (derived.hasRevisionImpact) {
    banners.push({
      key: "revision",
      tier: "informational",
      label: "Callsheet Revision Impact",
      note:
        derived.revisionImpactNote ??
        "This order is affected by the latest callsheet revision. Review updated call times.",
    });
  }

  if (derived.hasOvernightHold) {
    banners.push({
      key: "overnight",
      tier: "informational",
      label: "Overnight Hold",
      note: "Order is on overnight hold. Driver on standby — retry window 07:00.",
    });
  }

  if (derived.hasUnresolvedSignature) {
    banners.push({
      key: "signature",
      tier: "attention",
      label: "CI Signature Outstanding",
      note: "One or more CI documents on this order are unsigned. Movement requires signed CIs before clearance.",
    });
  }

  if (banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[9px] text-muted-foreground/70 uppercase tracking-[0.15em]">Propagation Impacts</div>
      {banners.map(({ key, tier, label, note }) => {
        const meta = conditionTierMeta[tier];
        const leftBorder =
          tier === "legal" || tier === "blocker"
            ? "border-[#d3410c]/60"
            : tier === "attention"
              ? "border-[#f2b90e]/50"
              : "border-[#bfd4ef]/30";
        const subtleBg = tier === "legal" || tier === "blocker" ? "bg-[#d3410c]/[0.04]" : "";
        return (
          <div key={key} className={cn("border-l-2 py-1.5 pl-2.5", leftBorder, subtleBg)}>
            <div className="flex items-baseline gap-2">
              <span className={cn("font-mono text-[9px] uppercase tracking-[0.1em]", meta.textClass)}>
                {meta.indicator}
              </span>
              <span className="font-medium text-[#dbd5c5] text-[10px]">{label}</span>
            </div>
            <div className="mt-0.5 text-[9px] text-muted-foreground/70 leading-snug">{note}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div className="grid h-full place-items-center text-[11px] text-muted-foreground uppercase tracking-widest">
      Select a transport order to view dispatch detail.
    </div>
  );
}

/**
 * Flat driver section — no container box.
 * Label + status float above a compact row.
 * Divider rhythm is provided by the parent section wrapper.
 */
function DriverSection({ assignment }: { assignment: DriverAssignment }) {
  const dot = driverStatusDot[assignment.status];
  const label = driverStatusLabel[assignment.status];
  const initials = assignment.driverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-1.5">
      {/* Section eyebrow + status */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-muted-foreground uppercase tracking-[0.15em]">Driver Assignment</span>
        <div className="flex items-center gap-1.5">
          <div className={cn("size-1.5 rounded-full", dot)} />
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
      </div>
      {/* Identity row */}
      <div className="flex items-center gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-muted font-mono text-[9px] tracking-wider">
          {initials}
        </div>
        <span className="min-w-0 truncate font-medium text-xs">{assignment.driverName}</span>
        <span className="shrink-0 font-mono text-[9px] text-muted-foreground tracking-wider">{assignment.vehicle}</span>
        <span className="shrink-0 text-[9px] text-muted-foreground/55 capitalize">{assignment.vehicleType}</span>
      </div>
      {/* Contact row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Phone className="size-3 shrink-0 text-muted-foreground" />
          <span className="font-mono text-[#dbd5c5] text-[9px] tabular-nums">{assignment.phone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">{assignment.radioChannel}</span>
        </div>
      </div>
    </div>
  );
}

function LinkedConditions({ conditions }: { conditions: OperationalCondition[] }) {
  if (conditions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-0.5 text-[8px] text-muted-foreground uppercase tracking-[0.15em]">Linked Conditions</div>
      {conditions.map((c) => {
        const meta = conditionTierMeta[c.tier];
        const leftBorder =
          c.tier === "legal" || c.tier === "blocker"
            ? "border-[#d3410c]/60"
            : c.tier === "attention"
              ? "border-[#f2b90e]/50"
              : "border-[#bfd4ef]/30";
        const subtleBg = c.tier === "legal" || c.tier === "blocker" ? "bg-[#d3410c]/[0.03]" : "";
        return (
          <div key={c.id} className={cn("border-l-2 py-1 pl-2.5", leftBorder, subtleBg)}>
            <div className="flex items-baseline gap-2">
              <span className={cn("font-mono text-[8px] uppercase tracking-[0.1em]", meta.textClass)}>
                {meta.indicator}
              </span>
              <span className="ml-auto font-mono text-[8px] text-muted-foreground tabular-nums">{c.timestamp}</span>
            </div>
            <div className="font-medium text-[#dbd5c5] text-[9px] leading-snug">{c.title}</div>
            <div className="text-[9px] text-muted-foreground/65 leading-snug">{c.description}</div>
          </div>
        );
      })}
    </div>
  );
}

function RouteTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex flex-col">
      {shipment.route.map((wp, i) => (
        <div key={wp.location} className="flex gap-2.5 border-border/40 border-b py-2 first:pt-0 last:border-0">
          <div className="flex shrink-0 flex-col items-center pt-0.5">
            <div className={cn("size-1.5 shrink-0 rounded-full", waypointDotStyles[wp.state])} />
            {i < shipment.route.length - 1 && <div className="mt-1 min-h-3 w-px flex-1 bg-border/60" />}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium text-xs leading-none">{wp.location}</span>
              <span className="shrink-0 font-mono text-[9px] text-muted-foreground tabular-nums">{wp.time}</span>
            </div>
            <span className={cn("text-[10px] leading-snug", waypointNoteStyles[wp.state])}>{wp.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LogTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {shipment.productionLog.map((entry) => (
        <div key={`${entry.time}:${entry.from}`} className="flex gap-2.5 py-2 first:pt-0">
          <span className="w-9 shrink-0 pt-px font-mono text-[9px] text-muted-foreground tabular-nums">
            {entry.time}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className={cn("text-[9px] uppercase leading-none tracking-widest", logTypeStyles[entry.type])}>
              {entry.from}
            </span>
            <span className="text-[#dbd5c5] text-[11px] leading-snug">{entry.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {shipment.documents.map((doc) => (
        <div key={doc.ref} className="flex items-start gap-3 py-3 first:pt-0">
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-sm px-1.5 text-[9px] uppercase tracking-wider",
              docTypeBadgeStyles[doc.type],
            )}
          >
            {docTypeLabels[doc.type]}
          </Badge>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-medium text-xs leading-none">{doc.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">{doc.ref}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{doc.issued}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────────

type DispatchDetailProps = {
  shipment: Shipment | null;
  assignment: DriverAssignment | null;
  derived: DerivedOrderState | null;
  linkedConditions: OperationalCondition[];
};

export function TransportDetail({ shipment, assignment, derived, linkedConditions }: DispatchDetailProps) {
  if (!shipment) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="h-[272px] shrink-0">
          <ShipmentRouteMap shipment={null} />
        </div>
        <EmptyDetail />
      </div>
    );
  }

  // Compute whether any propagation condition is active — drives conditional section rendering.
  const hasPropagation =
    derived &&
    (derived.isBlocked ||
      derived.isPermitPending ||
      derived.hasDestinationRestriction ||
      derived.hasRouteCompromise ||
      derived.hasMovementConflict ||
      derived.isDriverUnavailable ||
      derived.isFrenchHoursActive ||
      derived.hasRevisionImpact ||
      derived.hasOvernightHold ||
      derived.hasUnresolvedSignature);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Map strip — embedded, no explicit background */}
      <div className="h-[272px] shrink-0 border-b">
        <ShipmentRouteMap shipment={shipment} />
      </div>

      {/* Order header */}
      <div className="shrink-0 border-b px-3 py-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] tabular-nums tracking-wider">{shipment.id}</span>
              <Badge variant="outline" className={cn("gap-1.5 text-[10px]", statusBadgeClasses[shipment.status])}>
                <span className="size-1.5 rounded-full bg-current" />
                {shipment.status}
              </Badge>
              {derived?.highestTier === "blocker" || derived?.highestTier === "legal" ? (
                <span className="rounded bg-[#d3410c]/10 px-1.5 py-0.5 font-mono text-[#d3410c] text-[9px] uppercase tracking-wider">
                  ■ blocked
                </span>
              ) : derived?.highestTier === "attention" ? (
                <span className="rounded bg-[#f2b90e]/10 px-1.5 py-0.5 font-mono text-[#f2b90e] text-[9px] uppercase tracking-wider">
                  ▲ attention
                </span>
              ) : null}
            </div>
            <div className="truncate font-medium text-[#dbd5c5] text-xs">{shipment.cargo}</div>
            <div className="text-[10px] text-muted-foreground">{shipment.customer.name}</div>
          </div>
          <div className="shrink-0 text-right">
            <div
              className={cn(
                "text-[10px] uppercase tracking-widest",
                shipment.urgency === "priority" && "text-[#f2b90e]",
                shipment.urgency === "watch" && "text-[#dbd5c5]",
                shipment.urgency === "normal" && "text-muted-foreground",
              )}
            >
              {shipment.urgency === "priority" && "▲ Priority"}
              {shipment.urgency === "watch" && "→ Watch"}
              {shipment.urgency === "normal" && "Normal"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
              {shipment.eta}
              {shipment.etaMeta && <span className="ml-1 font-sans text-[9px]">{shipment.etaMeta}</span>}
            </div>
          </div>
        </div>
      </div>

      {/*
       * Scrollable detail — sections separated by divider lines, not containers.
       * No outer padding on the scroll body; sections carry their own px-3 py-2.5.
       * divide-y creates hairline separators between sections without boxes.
       */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col divide-y divide-border/30">
          {/* § Propagation impacts — conditional section */}
          {hasPropagation && derived && (
            <div className="px-3 py-2.5">
              <PropagationBanners derived={derived} />
            </div>
          )}

          {/* § Driver assignment */}
          <div className="px-3 py-2.5">
            {assignment ? (
              <DriverSection assignment={assignment} />
            ) : (
              <span className="text-[9px] text-muted-foreground">No driver assignment on record.</span>
            )}
          </div>

          {/* § Coordination note + linked conditions — grouped: same operational context */}
          <div className="flex flex-col gap-2.5 px-3 py-2.5">
            <div
              className={cn(
                "border-l-2 py-1 pl-2.5",
                shipment.urgency === "priority" && "border-[#f2b90e]/60",
                shipment.urgency === "watch" && "border-[#4a7fa5]/50",
                shipment.urgency === "normal" && "border-border",
              )}
            >
              <div
                className={cn(
                  "mb-0.5 text-[8px] uppercase tracking-widest",
                  shipment.urgency === "priority" && "text-[#f2b90e]",
                  shipment.urgency === "watch" && "text-[#94a3b8]",
                  shipment.urgency === "normal" && "text-muted-foreground/60",
                )}
              >
                {shipment.urgency === "priority" && "▲ "}
                {shipment.urgency === "watch" && "→ "}
                Coordination Note
              </div>
              <p className="text-[#dbd5c5] text-[11px] leading-relaxed">{shipment.operationalNote}</p>
            </div>
            <LinkedConditions conditions={linkedConditions} />
          </div>

          {/* § Handling — left-edge marker, no container */}
          <div className="px-3 py-2.5">
            <div className="border-[#f2b90e]/40 border-l-2 py-1 pl-2.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <AlertTriangleIcon className="size-3 shrink-0 text-[#f2b90e]/70" />
                <span className="text-[#dbd5c5]/60 text-[8px] uppercase tracking-widest">
                  {shipment.handling.label}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{shipment.handling.note}</p>
              {shipment.handling.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {shipment.handling.tags.map(({ icon: TagIcon, label }) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="rounded-sm border-border/50 bg-muted/30 text-[9px] text-muted-foreground uppercase tracking-wider"
                    >
                      <TagIcon data-icon="inline-start" />
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* § Tabbed route / log / documents */}
          <div className="px-3">
            <Tabs defaultValue="route" className="w-full">
              <TabsList
                className="h-7 w-full justify-start gap-0 border-b px-0 pb-0 **:data-[slot=tabs-trigger]:text-[10px]"
                variant="line"
              >
                <TabsTrigger className="h-7 flex-none px-3" value="route">
                  Route
                </TabsTrigger>
                <TabsTrigger className="h-7 flex-none px-3" value="log">
                  Log
                </TabsTrigger>
                <TabsTrigger className="h-7 flex-none px-3" value="documents">
                  Documents
                </TabsTrigger>
              </TabsList>
              <TabsContent className="pt-2" value="route">
                <RouteTab shipment={shipment} />
              </TabsContent>
              <TabsContent className="pt-2" value="log">
                <LogTab shipment={shipment} />
              </TabsContent>
              <TabsContent className="pt-2" value="documents">
                <DocumentsTab shipment={shipment} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

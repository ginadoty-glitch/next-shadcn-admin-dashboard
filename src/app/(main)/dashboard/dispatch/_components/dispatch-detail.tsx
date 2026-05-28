"use client";

import { AlertTriangleIcon, Phone, Radio } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DerivedOrderState } from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type {
  AttachedDocument,
  ProductionLogEntry,
  RouteWaypoint,
  Shipment,
} from "../../logistics/_components/shipment-data";
import { ShipmentRouteMap } from "../../logistics/_components/shipment-route-map";
import type { ConditionTier, DriverAssignment, OperationalCondition } from "./dispatch-data";

// ─── Visual maps ───────────────────────────────────────────────────────────────

const statusBadgeClasses: Record<Shipment["status"], string> = {
  Scheduled: "border-muted bg-muted/50 text-muted-foreground",
  "En Route": "border-[#f2b90e]/30 bg-[#f2b90e]/10 text-[#f2b90e]",
  Dispatched: "border-[#f2b90e]/30 bg-[#f2b90e]/10 text-[#f2b90e]",
  Completed: "border-[#45d30c]/30 bg-[#45d30c]/10 text-[#45d30c]",
  "Held — Delayed": "border-[#d3410c]/30 bg-[#d3410c]/10 text-[#d3410c]",
  "On Hold": "border-[#933614]/30 bg-[#933614]/10 text-[#933614]",
  "Awaiting Clearance": "border-[#933614]/30 bg-[#933614]/10 text-[#933614]",
};

const driverStatusDot: Record<DriverAssignment["status"], string> = {
  active: "bg-[#45d30c]",
  staged: "bg-[#f2b90e]",
  standby: "bg-muted-foreground",
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
  completed: "bg-[#45d30c]",
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
  update: "text-[#dbd5c5]",
  alert: "text-[#f2b90e]",
  confirmation: "text-[#45d30c]",
};

const docTypeBadgeStyles: Record<AttachedDocument["type"], string> = {
  "call-sheet": "border-[#f2b90e]/30 bg-[#f2b90e]/[0.08] text-[#f2b90e]",
  "movement-order": "border-[#bfd4ef]/30 bg-[#bfd4ef]/[0.08] text-[#bfd4ef]",
  permit: "border-[#933614]/30 bg-[#933614]/[0.08] text-[#dbd5c5]",
  ci: "border-border bg-muted/50 text-muted-foreground",
  revision: "border-[#45d30c]/30 bg-[#45d30c]/[0.08] text-[#45d30c]",
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
      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Propagation Impacts</div>
      {banners.map(({ key, tier, label, note }) => {
        const meta = conditionTierMeta[tier];
        return (
          <div key={key} className={cn("rounded border px-2.5 py-2", meta.borderClass, meta.bgClass)}>
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className={cn("text-[9px] uppercase tracking-[0.1em]", meta.textClass)}>{meta.indicator}</span>
            </div>
            <div className="font-medium text-[#dbd5c5] text-[10px] leading-snug">{label}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">{note}</div>
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

function DriverCard({ assignment }: { assignment: DriverAssignment }) {
  const dot = driverStatusDot[assignment.status];
  const label = driverStatusLabel[assignment.status];

  return (
    <div className="flex flex-col gap-3 rounded border border-border bg-muted/20 px-3 py-3">
      <div className="flex items-center justify-between">
        <div className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Driver Assignment</div>
        <div className="flex items-center gap-1.5">
          <div className={cn("size-1.5 rounded-full", dot)} />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="size-8 shrink-0 after:rounded-none">
          <AvatarFallback className="rounded-none bg-muted font-mono text-[11px] tracking-wider">
            {assignment.driverName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="truncate font-medium text-sm leading-none">{assignment.driverName}</div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider">{assignment.vehicle}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[9px] text-muted-foreground uppercase capitalize tracking-wider">
            {assignment.vehicleType}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-border border-t pt-2.5">
        <div className="flex items-center gap-1.5">
          <Phone className="size-3 shrink-0 text-muted-foreground" />
          <span className="font-mono text-[#dbd5c5] text-[10px] tabular-nums">{assignment.phone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{assignment.radioChannel}</span>
        </div>
      </div>
    </div>
  );
}

function LinkedConditions({ conditions }: { conditions: OperationalCondition[] }) {
  if (conditions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Linked Conditions</div>
      {conditions.map((c) => {
        const meta = conditionTierMeta[c.tier];
        return (
          <div key={c.id} className={cn("rounded border px-2.5 py-2", meta.borderClass, meta.bgClass)}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className={cn("text-[9px] uppercase tracking-[0.1em]", meta.textClass)}>{meta.indicator}</span>
              <span className="text-[9px] text-muted-foreground tabular-nums">{c.timestamp}</span>
            </div>
            <div className="font-medium text-[#dbd5c5] text-[10px] leading-snug">{c.title}</div>
            <div className="mt-1 text-[10px] text-muted-foreground leading-relaxed">{c.description}</div>
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
        <div key={wp.location} className="flex gap-3 border-border/50 border-b py-3 first:pt-0 last:border-0">
          <div className="flex shrink-0 flex-col items-center pt-1">
            <div className={cn("size-2 shrink-0 rounded-full", waypointDotStyles[wp.state])} />
            {i < shipment.route.length - 1 && <div className="mt-1.5 min-h-4 w-px flex-1 bg-border" />}
          </div>
          <div className="flex min-w-0 flex-col gap-1 pb-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-medium text-xs">{wp.location}</span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">{wp.time}</span>
            </div>
            <span className={cn("text-[11px]", waypointNoteStyles[wp.state])}>{wp.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LogTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {shipment.productionLog.map((entry) => (
        <div key={`${entry.time}:${entry.from}`} className="flex gap-3 py-3 first:pt-0">
          <span className="w-10 shrink-0 pt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
            {entry.time}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className={cn("text-[10px] uppercase leading-none tracking-widest", logTypeStyles[entry.type])}>
              {entry.from}
            </span>
            <span className="text-[#dbd5c5] text-xs leading-relaxed">{entry.message}</span>
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

export function DispatchDetail({ shipment, assignment, derived, linkedConditions }: DispatchDetailProps) {
  if (!shipment) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="h-[200px] shrink-0">
          <ShipmentRouteMap shipment={null} />
        </div>
        <EmptyDetail />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Compact map strip */}
      <div className="h-[200px] shrink-0 border-b">
        <ShipmentRouteMap shipment={shipment} />
      </div>

      {/* Order header */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tabular-nums tracking-wider">{shipment.id}</span>
              <Badge variant="outline" className={cn("gap-1.5 text-[10px]", statusBadgeClasses[shipment.status])}>
                <span className="size-1.5 rounded-full bg-current" />
                {shipment.status}
              </Badge>
              {/* Propagation tier badge — surfaces highest escalation tier in the header */}
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

      {/* Scrollable detail */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          {/* Propagation banners — cascading operational impacts */}
          {derived && <PropagationBanners derived={derived} />}

          {/* Driver assignment */}
          {assignment ? (
            <DriverCard assignment={assignment} />
          ) : (
            <div className="rounded border border-border border-dashed px-3 py-2.5 text-[10px] text-muted-foreground">
              No driver assignment on record.
            </div>
          )}

          {/* Coordination note */}
          <div
            className={cn(
              "rounded border px-3 py-2.5",
              shipment.urgency === "priority" && "border-[#f2b90e]/30 bg-[#f2b90e]/[0.05]",
              shipment.urgency === "watch" && "border-[#933614]/30 bg-[#933614]/[0.04]",
              shipment.urgency === "normal" && "border-border bg-muted/20",
            )}
          >
            <div
              className={cn(
                "mb-1 text-[9px] uppercase tracking-widest",
                shipment.urgency === "priority" && "text-[#f2b90e]",
                shipment.urgency === "watch" && "text-[#dbd5c5]",
                shipment.urgency === "normal" && "text-muted-foreground",
              )}
            >
              {shipment.urgency === "priority" && "▲ "}
              {shipment.urgency === "watch" && "→ "}
              Coordination Note
            </div>
            <p className="text-[#dbd5c5] text-[11px] leading-relaxed">{shipment.operationalNote}</p>
          </div>

          {/* Linked operational conditions */}
          <LinkedConditions conditions={linkedConditions} />

          <Separator />

          {/* Handling */}
          <Alert className="rounded border-[#933614]/40 bg-[#933614]/[0.06] text-[#dbd5c5]">
            <AlertTriangleIcon className="text-[#f2b90e]" />
            <AlertTitle className="text-[#f2b90e] text-[10px] uppercase tracking-widest">
              {shipment.handling.label}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="text-[#dbd5c5] text-[11px] leading-relaxed">{shipment.handling.note}</div>
              <Separator className="bg-[#933614]/30" />
              <div className="flex flex-wrap gap-1.5">
                {shipment.handling.tags.map(({ icon: TagIcon, label }) => (
                  <Badge
                    className="rounded-sm border-[#933614]/40 bg-[#933614]/[0.08] text-[#dbd5c5] text-[9px] uppercase tracking-wider"
                    key={label}
                    variant="outline"
                  >
                    <TagIcon data-icon="inline-start" />
                    {label}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>

          {/* Tabs */}
          <Tabs defaultValue="route" className="w-full">
            <TabsList
              className="w-full justify-start gap-2 border-b px-0 pb-0 **:data-[slot=tabs-trigger]:text-xs"
              variant="line"
            >
              <TabsTrigger className="flex-none" value="route">
                Route
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="log">
                Dispatch Log
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="documents">
                Documents
              </TabsTrigger>
            </TabsList>
            <TabsContent className="pt-3" value="route">
              <RouteTab shipment={shipment} />
            </TabsContent>
            <TabsContent className="pt-3" value="log">
              <LogTab shipment={shipment} />
            </TabsContent>
            <TabsContent className="pt-3" value="documents">
              <DocumentsTab shipment={shipment} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

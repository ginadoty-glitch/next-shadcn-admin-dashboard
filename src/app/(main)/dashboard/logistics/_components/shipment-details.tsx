import { AlertTriangleIcon, Copy, Plane, Ship, Star, Truck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { AttachedDocument, ProductionLogEntry, RouteWaypoint, Shipment } from "./shipment-data";
import { ShipmentRouteMap } from "./shipment-route-map";

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

const statusBadgeClasses: Record<Shipment["status"], string> = {
  Scheduled: "border-muted bg-muted/50 text-muted-foreground",
  "En Route": "border-[#f2b90e]/30 bg-[#f2b90e]/10 text-[#f2b90e]",
  Dispatched: "border-[#f2b90e]/30 bg-[#f2b90e]/10 text-[#f2b90e]",
  Completed: "border-[#45d30c]/30 bg-[#45d30c]/10 text-[#45d30c]",
  "Held — Delayed": "border-[#d3410c]/30 bg-[#d3410c]/10 text-[#d3410c]",
  "On Hold": "border-[#933614]/30 bg-[#933614]/10 text-[#933614]",
  "Awaiting Clearance": "border-[#933614]/30 bg-[#933614]/10 text-[#933614]",
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

type ShipmentDetailsProps = {
  shipment: Shipment | null;
};

function getContactLabel(mode: Shipment["mode"]) {
  if (mode === "land") {
    return "Contact Driver";
  }

  if (mode === "air") {
    return "Contact Coordinator";
  }

  return "Contact Logistics";
}

function getTransportNumberLabel(mode: Shipment["mode"]) {
  if (mode === "land") {
    return "Vehicle plate";
  }

  if (mode === "air") {
    return "Flight ref.";
  }

  return "Vessel ref.";
}

function EmptyShipmentOverview() {
  return (
    <div className="grid min-h-48 place-items-center rounded border border-dashed text-[11px] text-muted-foreground uppercase tracking-widest">
      Select a transport order to view brief.
    </div>
  );
}

function RouteTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex flex-col">
      {shipment.route.map((wp, i) => (
        <div key={wp.location} className="flex gap-3 border-border/50 border-b py-3 first:pt-0 last:border-0">
          <div className="flex flex-shrink-0 flex-col items-center pt-1">
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

function ManifestTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="flex flex-col">
      <div className="mb-0 flex gap-4 border-border border-b pb-2">
        <span className="flex-1 text-[10px] text-muted-foreground uppercase tracking-widest">Description</span>
        <span className="w-14 shrink-0 text-right text-[10px] text-muted-foreground uppercase tracking-widest">
          Qty
        </span>
        <span className="hidden w-28 shrink-0 text-right text-[10px] text-muted-foreground uppercase tracking-widest sm:block">
          Dept
        </span>
      </div>
      {shipment.manifest.map((item) => (
        <div key={item.description} className="flex gap-4 border-border/50 border-b py-2.5 last:border-0">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-medium text-xs leading-none">{item.description}</span>
            {item.note && <span className="text-[10px] text-muted-foreground">{item.note}</span>}
          </div>
          <span className="w-14 shrink-0 text-right font-mono text-muted-foreground text-xs tabular-nums">
            {item.qty}
          </span>
          <span className="hidden w-28 shrink-0 text-right text-[10px] text-muted-foreground sm:block">
            {item.dept}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProductionLogTab({ shipment }: { shipment: Shipment }) {
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

function ShipmentOverview({ shipment }: { shipment: Shipment }) {
  const ContactIcon = modeIcons[shipment.mode];
  const contactLabel = getContactLabel(shipment.mode);
  const transportNumberLabel = getTransportNumberLabel(shipment.mode);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-base tabular-nums tracking-wider sm:text-lg">{shipment.id}</h1>
          <Button variant="ghost" size="icon-sm" aria-label="Copy shipment ID">
            <Copy />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Badge variant="outline" className={cn("gap-1.5", statusBadgeClasses[shipment.status])}>
            <span className={cn("size-1.5 rounded-full bg-current", progressRingClasses[shipment.status])} />
            {shipment.status}
          </Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">{shipment.progress}% complete</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">
            Call Time: {shipment.eta} {shipment.etaMeta}
          </span>
        </div>
      </div>

      <Separator />

      <div
        className={cn(
          "rounded border px-3 py-2.5",
          shipment.urgency === "priority" && "border-[#f2b90e]/30 bg-[#f2b90e]/[0.06]",
          shipment.urgency === "watch" && "border-[#933614]/30 bg-[#933614]/[0.05]",
          shipment.urgency === "normal" && "border-border bg-muted/20",
        )}
      >
        <div
          className={cn(
            "mb-1.5 text-[10px] uppercase tracking-widest",
            shipment.urgency === "priority" && "text-[#f2b90e]",
            shipment.urgency === "watch" && "text-[#dbd5c5]",
            shipment.urgency === "normal" && "text-muted-foreground",
          )}
        >
          {shipment.urgency === "priority" && "▲ "}
          {shipment.urgency === "watch" && "→ "}
          Coordination Note
        </div>
        <p className="text-[#dbd5c5] text-xs leading-relaxed">{shipment.operationalNote}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-8 after:rounded-none">
            <AvatarFallback className="rounded-none bg-muted font-mono text-[11px] tracking-wider">
              {shipment.customer.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <div className="font-medium text-sm leading-none">{shipment.customer.name}</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs tabular-nums leading-none tracking-tight">{shipment.customer.id}</span>{" "}
              <Copy className="size-3" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">
            <Star />
            {shipment.customer.tier}
          </Badge>
          <div className="text-muted-foreground text-xs leading-none">{shipment.customer.tierLabel}</div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-medium">Brokered Items</h2>

          <Button variant="outline" size="sm">
            <ContactIcon data-icon="inline-start" />
            {contactLabel}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-[1.35fr_1fr_1.1fr_1.15fr_1fr]">
          <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
            <div className="text-[10px] text-muted-foreground uppercase leading-none tracking-widest md:invisible">
              Item
            </div>
            <div className="whitespace-nowrap font-medium text-sm leading-none">{shipment.cargo}</div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] text-muted-foreground uppercase leading-none tracking-widest">Total load</div>
            <div className="font-mono text-sm tabular-nums leading-none">{shipment.weight}</div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] text-muted-foreground uppercase leading-none tracking-widest">Vehicle</div>
            <div className="text-sm capitalize leading-none">
              {shipment.mode} · {shipment.routeType}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] text-muted-foreground uppercase leading-none tracking-widest">
              {transportNumberLabel}
            </div>
            <div className="font-mono text-sm leading-none tracking-wide">{shipment.transportNumber}</div>
          </div>

          <div className="flex flex-col gap-1.5 md:text-right">
            <div className="text-[10px] text-muted-foreground uppercase leading-none tracking-widest">
              Logistics Status
            </div>
            <div className="font-mono text-sm tabular-nums leading-none">{shipment.progress}% complete</div>
          </div>
        </div>
      </div>

      <Separator />

      <Alert className="rounded border-[#933614]/40 bg-[#933614]/[0.06] text-[#dbd5c5] dark:border-[#933614]/50 dark:bg-[#933614]/[0.08] dark:text-[#dbd5c5]">
        <AlertTriangleIcon className="text-[#f2b90e]" />
        <AlertTitle className="text-[#f2b90e] text-[11px] uppercase tracking-widest">
          {shipment.handling.label}
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <div className="text-[#dbd5c5] text-xs leading-relaxed">{shipment.handling.note}</div>

          <Separator className="bg-[#933614]/30" />

          <div className="flex flex-wrap gap-1.5">
            {shipment.handling.tags.map(({ icon: TagIcon, label }) => (
              <Badge
                className="rounded-sm border-[#933614]/40 bg-[#933614]/[0.08] text-[#dbd5c5] text-[10px] uppercase tracking-wider"
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
    </div>
  );
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  if (!shipment) {
    return (
      <div className="grid h-full min-h-0 grid-rows-[360px_1fr] overflow-hidden lg:grid-rows-[460px_1fr]">
        <div className="min-h-0 overflow-hidden">
          <ShipmentRouteMap shipment={null} />
        </div>
        <div className="min-h-0 overflow-hidden p-4">
          <EmptyShipmentOverview />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[360px_1fr] overflow-hidden lg:grid-rows-[460px_1fr]">
      <div className="min-h-0 overflow-hidden">
        <ShipmentRouteMap shipment={shipment} />
      </div>
      <div className="min-h-0 overflow-hidden">
        <div className="h-full min-h-0 py-0">
          <Tabs defaultValue="overview" className="h-full gap-0">
            <TabsList
              className="w-full justify-start gap-2 border-b px-4 **:data-[slot=tabs-trigger]:text-xs sm:gap-4 sm:**:data-[slot=tabs-trigger]:text-sm"
              variant="line"
            >
              <TabsTrigger className="flex-none" value="overview">
                Brief
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="route">
                Route
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="cargo">
                Manifest
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="documents">
                Documents
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="activity">
                Production Log
              </TabsTrigger>
            </TabsList>
            <TabsContent className="min-h-0 overflow-auto p-4" value="overview">
              <ShipmentOverview shipment={shipment} />
            </TabsContent>
            <TabsContent className="min-h-0 overflow-auto p-4" value="route">
              <RouteTab shipment={shipment} />
            </TabsContent>
            <TabsContent className="min-h-0 overflow-auto p-4" value="cargo">
              <ManifestTab shipment={shipment} />
            </TabsContent>
            <TabsContent className="min-h-0 overflow-auto p-4" value="documents">
              <DocumentsTab shipment={shipment} />
            </TabsContent>
            <TabsContent className="min-h-0 overflow-auto p-4" value="activity">
              <ProductionLogTab shipment={shipment} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

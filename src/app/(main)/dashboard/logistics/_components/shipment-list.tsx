import { Plane, Search, Ship, SlidersHorizontal, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { Shipment } from "./shipment-data";

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

function getProgressRingClass(status: Shipment["status"]) {
  return cn(
    "grid size-3 place-items-center rounded-full p-[0.5px] bg-[conic-gradient(currentColor_0deg_var(--angle),transparent_var(--angle)_360deg)]",
    progressRingClasses[status],
  );
}

type ShipmentCardProps = {
  active?: boolean;
  onSelectShipment: (shipmentId: Shipment["id"]) => void;
  shipment: Shipment;
};

type ShipmentListProps = {
  onSelectShipment: (shipmentId: Shipment["id"]) => void;
  selectedShipmentId: Shipment["id"] | null;
  shipments: Shipment[];
};

function ShipmentCard({ shipment, active, onSelectShipment }: ShipmentCardProps) {
  const angle = (shipment.progress / 100) * 360;
  const Icon = modeIcons[shipment.mode];

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={(event) => {
        event.currentTarget.blur();
        onSelectShipment(shipment.id);
      }}
      className={cn(
        "flex w-full flex-col gap-3 rounded border p-3 text-left transition-colors",
        "hover:bg-[#f2b90e]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b90e]/30",
        active ? "border-[#f2b90e]/50 bg-[#f2b90e]/[0.04]" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-wider text-muted-foreground">{shipment.id}</div>

        <div className="flex items-center gap-1.5">
          <div
            style={{ "--angle": `${angle}deg` } as React.CSSProperties}
            className={getProgressRingClass(shipment.status)}
          >
            <div className="grid size-2 place-items-center rounded-full bg-card">
              <div className="size-1 rounded-full bg-current" />
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{shipment.status}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn(`flag:${shipment.origin.countryCode.toUpperCase()}`, "rounded-xs text-xl outline")} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate text-xs font-medium leading-none">{shipment.origin.display}</div>
            <div className="text-[10px] text-muted-foreground leading-none">{shipment.origin.country}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-right">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate text-xs font-medium leading-none">{shipment.destination.display}</div>
            <div className="text-[10px] text-muted-foreground leading-none">{shipment.destination.country}</div>
          </div>
          <div className={cn(`flag:${shipment.destination.countryCode.toUpperCase()}`, "rounded-xs text-xl outline")} />
        </div>
      </div>

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

      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none mb-1">
            Brokered Items
          </div>
          <div className="truncate text-xs font-medium">{shipment.cargo}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none mb-1">Call Time</div>
          <div className="font-mono text-xs tabular-nums">
            {shipment.eta}
            {shipment.etaMeta && (
              <span className="ml-1 font-sans font-normal text-muted-foreground text-[10px]">{shipment.etaMeta}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ShipmentList({ shipments, selectedShipmentId, onSelectShipment }: ShipmentListProps) {
  return (
    <Card className="h-full rounded-none ring-0">
      <CardHeader>
        <CardTitle className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Transport Orders
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
              All (156)
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="en-route">
              En Route (32)
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="completed">
              Completed (98)
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="held">
              Held (9)
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
              <ShipmentCard
                active={shipment.id === selectedShipmentId}
                key={shipment.id}
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

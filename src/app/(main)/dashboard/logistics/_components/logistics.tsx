"use client";

/**
 * Logistics — Canonical operational movement surface for SyncOffset.
 *
 * Logistics IS dispatch. This surface handles:
 *   transport coordination · movement tracking · routing · escalation
 *   operational propagation · live delivery state · customs/delay
 *   timing risk · driver assignment · callsheet revision impact
 *
 * Three-column operational shell:
 *   LEFT  — Compact transport manifest (propagation-aware queue)
 *   CENTER — Transport order detail with propagation banners + map strip
 *   RIGHT  — Operational intelligence rail (conditions, revision, rush)
 *
 * Propagation engine computes cascading impact across all orders on every
 * render. Future: invalidated by Supabase realtime events on conditions,
 * revisions, and assignments.
 */

import * as React from "react";

import { computeGlobalPropagation } from "@/lib/operations/propagation";

import { activeCallsheetRevision, driverAssignments, operationalConditions, PRODUCTION_TIME } from "./operational-data";
import { OperationalIntelligence } from "./operational-intelligence";
import type { Shipment } from "./shipment-data";
import { shipments } from "./shipment-data";
import { TransportDetail } from "./transport-detail";
import { parseProductionMinutes, TransportQueue } from "./transport-queue";

// ─── Manifest sort ─────────────────────────────────────────────────────────────
//
// Primary: urgency tier (priority → watch → normal → completed)
// Secondary within tier: temporal pressure (overdue → critical → on-time)
//
// Completed orders always sink to the bottom of the manifest regardless of
// urgency so coordinators can focus on active movement pressure.

const urgencyOrder = { priority: 0, watch: 1, normal: 2 } as const;
const productionMinutes = parseProductionMinutes(PRODUCTION_TIME) ?? 0;

/**
 * Returns a sort key based on temporal pressure for an order.
 * Lower = surfaces higher in the queue.
 */
function temporalSortKey(s: Shipment): number {
  if (s.status === "Completed") return 90;
  // Hard-blocked orders with no ETA surface near top of their urgency tier.
  if (s.status === "On Hold" || s.status === "Awaiting Clearance") return 5;

  const etaMin = parseProductionMinutes(s.eta) ?? parseProductionMinutes(s.etaMeta);
  if (etaMin === null) return 20;

  const delta = etaMin - productionMinutes;
  if (delta < 0) return 0; // overdue
  if (delta < 20) return 10; // critical window
  if (delta < 60) return 30; // approaching
  return 50; // on schedule
}

const sortedShipments = [...shipments].sort((a, b) => {
  // Completed orders sink regardless of urgency tag.
  const aCompleted = a.status === "Completed" ? 1 : 0;
  const bCompleted = b.status === "Completed" ? 1 : 0;
  if (aCompleted !== bCompleted) return aCompleted - bCompleted;

  const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  if (urgencyDiff !== 0) return urgencyDiff;

  return temporalSortKey(a) - temporalSortKey(b);
});

export function Logistics() {
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(sortedShipments[0]?.id ?? null);

  // Compute propagation state for ALL orders in a single pass.
  const derivedStates = React.useMemo(
    () => computeGlobalPropagation(sortedShipments, operationalConditions, activeCallsheetRevision, driverAssignments),
    // Static mock data — deps array is stable.
    // Future: [conditions, revision, assignments] from Supabase realtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const selectedShipment = shipments.find((s) => s.id === selectedOrderId) ?? null;
  const selectedAssignment = driverAssignments.find((da) => da.linkedOrderId === selectedOrderId) ?? null;
  const selectedDerived = selectedOrderId ? (derivedStates.get(selectedOrderId) ?? null) : null;
  const linkedConditions = selectedDerived?.linkedConditions ?? [];

  return (
    <div
      data-content-padding="false"
      className="grid h-[calc(100dvh-var(--dashboard-header-height))] overflow-hidden lg:grid-cols-[288px_minmax(0,1fr)_240px] lg:divide-x"
    >
      {/* LEFT — Compact transport manifest */}
      <div className="h-full overflow-hidden">
        <TransportQueue
          shipments={sortedShipments}
          derivedStates={derivedStates}
          selectedShipmentId={selectedOrderId}
          onSelectShipment={setSelectedOrderId}
          productionTime={PRODUCTION_TIME}
        />
      </div>

      {/* CENTER — Order detail with propagation banners and embedded map.
           pt-[104px] aligns the map's top edge with the queue manifest list start,
           which sits below the queue's CardHeader (~40px) + TabsList h-7 (~29px) +
           gap + Search h-6 (~24px) + gap ≈ 105px. The padding reduces TransportDetail's
           h-full content area by the same amount — the flex-1 ScrollArea absorbs it. */}
      <div className="hidden h-full overflow-hidden lg:block lg:pt-[104px]">
        <TransportDetail
          shipment={selectedShipment}
          assignment={selectedAssignment}
          derived={selectedDerived}
          linkedConditions={linkedConditions}
        />
      </div>

      {/* RIGHT — Operational intelligence: conditions, revision, rush queue */}
      <div className="hidden h-full overflow-hidden lg:block">
        <OperationalIntelligence
          selectedOrderId={selectedOrderId}
          shipments={shipments}
          conditions={operationalConditions}
          revision={activeCallsheetRevision}
          derivedStates={derivedStates}
        />
      </div>
    </div>
  );
}

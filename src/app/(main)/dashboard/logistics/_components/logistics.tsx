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

import { activeCallsheetRevision, driverAssignments, operationalConditions } from "./operational-data";
import { OperationalIntelligence } from "./operational-intelligence";
import { shipments } from "./shipment-data";
import { TransportDetail } from "./transport-detail";
import { TransportQueue } from "./transport-queue";

// Priority orders surface to the top of the manifest.
const urgencyOrder = { priority: 0, watch: 1, normal: 2 } as const;
const sortedShipments = [...shipments].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

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
        />
      </div>

      {/* CENTER — Order detail with propagation banners and embedded map */}
      <div className="hidden h-full overflow-hidden lg:block">
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

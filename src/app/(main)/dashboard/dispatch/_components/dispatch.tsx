"use client";

import * as React from "react";

import { computeGlobalPropagation } from "@/lib/operations/propagation";

import { shipments } from "../../logistics/_components/shipment-data";
import { activeCallsheetRevision, driverAssignments, operationalConditions } from "./dispatch-data";
import { DispatchDetail } from "./dispatch-detail";
import { DispatchQueue } from "./dispatch-queue";
import { OperationalIntelligence } from "./operational-intelligence";

// Urgency sort — priority orders surface to top of the queue.
const urgencyOrder = { priority: 0, watch: 1, normal: 2 } as const;

const sortedShipments = [...shipments].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

export function Dispatch() {
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(sortedShipments[0]?.id ?? null);

  // ── Propagation engine ──────────────────────────────────────────────────────
  // Compute derived propagation state for ALL orders in a single pass.
  // This runs on every render. Future: memoized via Zustand selector +
  // invalidated only when Supabase realtime fires on conditions/revisions.
  const derivedStates = React.useMemo(
    () => computeGlobalPropagation(sortedShipments, operationalConditions, activeCallsheetRevision, driverAssignments),
    // Static mock data — deps array is stable. Future: [conditions, revision, assignments].
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Selected order resolution ───────────────────────────────────────────────
  const selectedShipment = shipments.find((s) => s.id === selectedOrderId) ?? null;

  const selectedAssignment = driverAssignments.find((da) => da.linkedOrderId === selectedOrderId) ?? null;

  const selectedDerived = selectedOrderId ? (derivedStates.get(selectedOrderId) ?? null) : null;

  // Linked conditions come from the propagation engine's derived state
  // (already filtered and sorted by tier severity).
  const linkedConditions = selectedDerived?.linkedConditions ?? [];

  return (
    <div
      data-content-padding="false"
      className="grid h-[calc(100dvh-var(--dashboard-header-height))] overflow-hidden lg:grid-cols-[288px_minmax(0,1fr)_240px] lg:divide-x"
    >
      {/* LEFT — Propagation-aware transport order queue */}
      <div className="h-full overflow-hidden">
        <DispatchQueue
          shipments={sortedShipments}
          derivedStates={derivedStates}
          selectedShipmentId={selectedOrderId}
          onSelectShipment={setSelectedOrderId}
        />
      </div>

      {/* CENTER — Selected order detail with propagation banners */}
      <div className="hidden h-full overflow-hidden lg:block">
        <DispatchDetail
          shipment={selectedShipment}
          assignment={selectedAssignment}
          derived={selectedDerived}
          linkedConditions={linkedConditions}
        />
      </div>

      {/* RIGHT — Operational intelligence with blast radius + revision propagation */}
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

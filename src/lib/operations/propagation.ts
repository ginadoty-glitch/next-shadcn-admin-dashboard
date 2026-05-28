/**
 * SyncOffset Operational Propagation Engine
 *
 * This is the application-layer intelligence bridge between operational objects.
 * It computes derived propagation state without mutating any source objects.
 *
 * Constitutional guarantees:
 * - No source objects are mutated. All output is derived, not stored.
 * - No UI state is mixed into propagation state.
 * - The engine reads from existing object relationships (affectedOrderIds, etc.)
 *   and produces typed derived state that UI layers consume as props.
 * - Auto-flag: the engine surfaces operational consequences automatically.
 * - Human-clear: clearing/acknowledging is NOT handled here. That belongs
 *   to the action layer (future Supabase + RLS-gated mutations).
 *
 * Future realtime path:
 * - This engine will be re-run whenever Supabase realtime emits a change
 *   to operational_conditions, driver_assignments, or callsheet_revisions.
 * - computeGlobalPropagation() will run inside a Zustand selector or
 *   React Query derived state — not in a useEffect.
 *
 * Architecture:
 *   Source objects (Shipment, OperationalCondition, DriverAssignment, CallsheetRevision)
 *     ↓
 *   computeGlobalPropagation() — single pass, builds Map<orderId, DerivedOrderState>
 *     ↓
 *   DerivedOrderState — passed as props to DispatchQueue, DispatchDetail, OpIntelligence
 */

import type {
  CallsheetRevision,
  ConditionTier,
  DriverAssignment,
  OperationalCondition,
} from "../../app/(main)/dashboard/logistics/_components/operational-data";
import type { Shipment } from "../../app/(main)/dashboard/logistics/_components/shipment-data";

// ─── Propagation output types ───────────────────────────────────────────────────

/**
 * Derived state for a single transport order.
 *
 * This is COMPUTED from the relationship graph, not stored anywhere.
 * Every render derives this fresh from the current object state.
 *
 * Future Supabase: this will be replaced by a realtime-derived selector
 * that subscribes to operational_conditions and driver_assignment channels.
 */
export type DerivedOrderState = {
  // ── Blocking ────────────────────────────────────────────────────────────────
  /** True if any linked condition is tier=blocker or tier=legal. */
  isBlocked: boolean;
  /** True if a permit-suspension condition is linked to this order. */
  isPermitPending: boolean;

  // ── Route ───────────────────────────────────────────────────────────────────
  /** True if a route-compromised condition is linked. */
  hasRouteCompromise: boolean;
  /** True if a set-access-restricted condition affects the destination. */
  hasDestinationRestriction: boolean;

  // ── Timing / hold ───────────────────────────────────────────────────────────
  /** True if an overnight-hold condition is linked. */
  hasOvernightHold: boolean;
  /** True if a movement-conflict condition is linked. */
  hasMovementConflict: boolean;

  // ── Revision ────────────────────────────────────────────────────────────────
  /** True if the callsheet-revised condition lists this order as affected. */
  hasRevisionImpact: boolean;
  /** Human-readable summary of what the revision changed for this order. */
  revisionImpactNote?: string;

  // ── Driver ──────────────────────────────────────────────────────────────────
  /** True if this order's assigned driver is off-duty or restricted. */
  isDriverUnavailable: boolean;
  /** True if french-hours are active and affect driver scheduling. */
  isFrenchHoursActive: boolean;

  // ── Documents ───────────────────────────────────────────────────────────────
  /**
   * True if this order has an unsigned CI document.
   * Future: detected from OwnedDocument.isSignatureRequired && !isSigned.
   */
  hasUnresolvedSignature: boolean;

  // ── Aggregate ───────────────────────────────────────────────────────────────
  /** The most severe escalation tier among all linked active conditions. null if none. */
  highestTier: ConditionTier | null;
  /** All active conditions directly linked to this order, sorted by severity. */
  linkedConditions: OperationalCondition[];
};

/**
 * Derived state for a driver assignment.
 * Computed from the driver's status, French Hours conditions, and linked orders.
 */
export type DerivedDriverState = {
  /** Driver is off-duty or restricted — orders are exposed. */
  isUnavailable: boolean;
  /** French Hours condition is active and affects this driver's shift. */
  isFrenchHoursRestricted: boolean;
  /**
   * A second active order is competing for this driver's availability.
   * Future: detected from linkedTransportOrderIds.length > 1 with overlapping ETAs.
   */
  hasConflictingAssignment: boolean;
};

/**
 * Derived state for a single operational condition.
 * Computed from how many and which orders it affects.
 */
export type DerivedConditionState = {
  /** Number of active, non-completed orders affected by this condition. */
  activeOrderBlastRadius: number;
  /** IDs of those affected orders. */
  affectedActiveOrderIds: string[];
};

// ─── Tier ordering ──────────────────────────────────────────────────────────────

const tierSeverity: Record<ConditionTier, number> = {
  legal: 0,
  blocker: 1,
  attention: 2,
  informational: 3,
};

function compareTierSeverity(a: ConditionTier, b: ConditionTier): number {
  return tierSeverity[a] - tierSeverity[b];
}

function mostSevereTier(tiers: ConditionTier[]): ConditionTier | null {
  if (tiers.length === 0) return null;
  return [...tiers].sort(compareTierSeverity)[0];
}

// ─── Signature detection ─────────────────────────────────────────────────────────

/**
 * Detects unsigned CI documents on a shipment.
 * Future: this check will be `doc.isSignatureRequired && !doc.isSigned`
 * using the canonical OwnedDocument type.
 */
function detectUnresolvedSignature(shipment: Shipment): boolean {
  return shipment.documents.some(
    (d) =>
      d.type === "ci" &&
      (d.name.toLowerCase().includes("unsigned") ||
        d.name.toLowerCase().includes("awaiting") ||
        d.name.toLowerCase().includes("pending approval")),
  );
}

// ─── Per-order propagation ───────────────────────────────────────────────────────

/**
 * Compute the full derived propagation state for a single transport order.
 *
 * This is a pure function — no mutations, no side effects.
 * Called once per order per render cycle (or per realtime event, future).
 */
export function computeOrderPropagation(
  order: Shipment,
  conditions: OperationalCondition[],
  revision: CallsheetRevision,
  assignment: DriverAssignment | undefined,
): DerivedOrderState {
  // All active conditions that reference this order by ID
  const linked = conditions.filter((c) => c.isActive && c.affectedOrderIds.includes(order.id));

  const linkedSorted = [...linked].sort((a, b) => compareTierSeverity(a.tier, b.tier));

  // ── Blocking ──────────────────────────────────────────────────────────────
  const isBlocked = linked.some((c) => c.tier === "blocker" || c.tier === "legal");

  const isPermitPending = linked.some((c) => c.type === "permit-suspension");

  // ── Route ─────────────────────────────────────────────────────────────────
  const hasRouteCompromise = linked.some((c) => c.type === "route-compromised");
  const hasDestinationRestriction = linked.some((c) => c.type === "set-access-restricted");

  // ── Timing / hold ─────────────────────────────────────────────────────────
  const hasOvernightHold = linked.some((c) => c.type === "overnight-hold");
  const hasMovementConflict = linked.some((c) => c.type === "movement-conflict");

  // ── Revision ──────────────────────────────────────────────────────────────
  const revisionCondition = linked.find((c) => c.type === "callsheet-revised");
  const hasRevisionImpact = !!revisionCondition;

  // Derive a concise revision note from the callsheet changes
  let revisionImpactNote: string | undefined;
  if (hasRevisionImpact && revision.changes.length > 0) {
    // Surface the first change that looks like a timing change
    const timingChange = revision.changes.find(
      (ch) =>
        ch.toLowerCase().includes("call") || ch.toLowerCase().includes("pushed") || ch.toLowerCase().includes("french"),
    );
    revisionImpactNote = timingChange ?? revision.changes[0];
  }

  // ── Driver ────────────────────────────────────────────────────────────────
  const isDriverUnavailable = !!assignment && assignment.status === "off-duty";

  const isFrenchHoursActive =
    linked.some((c) => c.type === "french-hours") ||
    // French hours can also propagate from the revision's documented changes
    revision.changes.some((ch) => ch.toLowerCase().includes("french"));

  // ── Documents ─────────────────────────────────────────────────────────────
  const hasUnresolvedSignature = detectUnresolvedSignature(order);

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const highestTier = mostSevereTier(linked.map((c) => c.tier));

  return {
    isBlocked,
    isPermitPending,
    hasRouteCompromise,
    hasDestinationRestriction,
    hasOvernightHold,
    hasMovementConflict,
    hasRevisionImpact,
    revisionImpactNote,
    isDriverUnavailable,
    isFrenchHoursActive,
    hasUnresolvedSignature,
    highestTier,
    linkedConditions: linkedSorted,
  };
}

// ─── Global propagation pass ─────────────────────────────────────────────────────

/**
 * Compute derived propagation state for ALL transport orders in a single pass.
 *
 * Returns a Map<orderId, DerivedOrderState> for O(1) lookup in render.
 *
 * Future realtime: this function will be called inside a Zustand selector
 * that is invalidated whenever the Supabase realtime channel fires.
 */
export function computeGlobalPropagation(
  orders: Shipment[],
  conditions: OperationalCondition[],
  revision: CallsheetRevision,
  assignments: DriverAssignment[],
): Map<string, DerivedOrderState> {
  const result = new Map<string, DerivedOrderState>();

  for (const order of orders) {
    const assignment = assignments.find((da) => da.linkedOrderId === order.id);
    result.set(order.id, computeOrderPropagation(order, conditions, revision, assignment));
  }

  return result;
}

// ─── Driver propagation ──────────────────────────────────────────────────────────

/**
 * Compute derived state for a driver assignment.
 * Future: will account for shift window overlaps and overtime thresholds.
 */
export function computeDriverPropagation(
  assignment: DriverAssignment,
  conditions: OperationalCondition[],
): DerivedDriverState {
  const isUnavailable = assignment.status === "off-duty";

  // French Hours is active if a french-hours condition affects any of this driver's orders
  const isFrenchHoursRestricted = conditions.some(
    (c) => c.isActive && c.type === "french-hours" && c.affectedOrderIds.includes(assignment.linkedOrderId),
  );

  // Future: detect overlapping ETAs across linkedTransportOrderIds
  const hasConflictingAssignment = false;

  return {
    isUnavailable,
    isFrenchHoursRestricted,
    hasConflictingAssignment,
  };
}

// ─── Condition propagation ────────────────────────────────────────────────────────

/**
 * Compute the blast radius of a condition — how many active orders it affects.
 * Used in the right rail to show operational impact scope.
 */
export function computeConditionPropagation(
  condition: OperationalCondition,
  orders: Shipment[],
): DerivedConditionState {
  const activeOrders = orders.filter((o) => o.status !== "Completed" && condition.affectedOrderIds.includes(o.id));

  return {
    activeOrderBlastRadius: activeOrders.length,
    affectedActiveOrderIds: activeOrders.map((o) => o.id),
  };
}

// ─── Revision propagation ─────────────────────────────────────────────────────────

/**
 * Compute which active orders are affected by the current callsheet revision.
 * Used to surface revision warnings in the dispatch queue and detail.
 *
 * Future: will be driven by CallsheetRevision.linkedTransportOrderIds
 * once canonical objects are fully persisted.
 */
export function computeRevisionImpact(
  revision: CallsheetRevision,
  _orders: Shipment[],
  conditions: OperationalCondition[],
): { affectedOrderIds: string[]; frenchHoursActive: boolean } {
  // The revision-linked condition tells us which orders are affected
  const revisionCondition = conditions.find((c) => c.isActive && c.type === "callsheet-revised");

  const affectedOrderIds = revisionCondition?.affectedOrderIds ?? [];

  const frenchHoursActive = revision.changes.some((ch) => ch.toLowerCase().includes("french"));

  return { affectedOrderIds, frenchHoursActive };
}

// ─── Escalation tier → UI vocabulary ─────────────────────────────────────────────

/**
 * Maps ConditionTier to the dispatch UI's visual language.
 * Single source of truth — not duplicated across components.
 */
export const TIER_META = {
  legal: {
    indicator: "■ LEGAL",
    textClass: "text-[#d3410c]",
    borderClass: "border-[#d3410c]/50",
    bgClass: "bg-[#d3410c]/[0.07]",
    ringClass: "ring-[#d3410c]/25",
  },
  blocker: {
    indicator: "■ BLOCKED",
    textClass: "text-[#d3410c]",
    borderClass: "border-[#d3410c]/40",
    bgClass: "bg-[#d3410c]/[0.05]",
    ringClass: "ring-[#d3410c]/25",
  },
  attention: {
    indicator: "▲ ATTN",
    textClass: "text-[#f2b90e]",
    borderClass: "border-[#f2b90e]/30",
    bgClass: "bg-[#f2b90e]/[0.05]",
    ringClass: "ring-[#f2b90e]/25",
  },
  informational: {
    indicator: "→ INFO",
    textClass: "text-[#bfd4ef]",
    borderClass: "border-[#bfd4ef]/20",
    bgClass: "bg-[#bfd4ef]/[0.04]",
    ringClass: "ring-[#bfd4ef]/15",
  },
} as const satisfies Record<
  ConditionTier,
  {
    indicator: string;
    textClass: string;
    borderClass: string;
    bgClass: string;
    ringClass: string;
  }
>;

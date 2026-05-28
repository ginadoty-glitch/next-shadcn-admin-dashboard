/**
 * SyncOffset Operational Object Layer — OperationalCondition
 *
 * An OperationalCondition represents a production state that affects
 * movement, scheduling, or operational safety on a shoot day.
 *
 * Constitutional doctrine: auto-flag, human-clear.
 * - Conditions are raised automatically by the Rules Engine
 *   (or manually by coordinators).
 * - Only a human with appropriate authority can acknowledge or clear them.
 * - Cleared conditions remain in the audit record.
 * - Nothing disappears silently.
 *
 * Conditions propagate impacts to linked operational objects.
 * A single condition may block multiple transport orders,
 * affect multiple departments, and trigger notification cascades.
 *
 * Future Supabase table: operational_conditions
 * Append-only child table: condition_log
 */

import type { AcknowledgmentState, EscalationTier, ObjectId, PropagationImpact, Timestamp } from "./shared";

// ─── Enums ──────────────────────────────────────────────────────────────────────

/**
 * The production events and states that can become OperationalConditions.
 *
 * This is the recognized vocabulary of production operational conditions.
 * Extending this list requires a constitutional amendment — not ad hoc additions.
 */
export type ConditionType =
  | "french-hours" // No formal meal break — continuous shooting
  | "martini" // Final shot of the day — imminent wrap
  | "company-move" // Full production relocating between setups
  | "lockup-active" // Location locked — no vehicle access during take
  | "permit-suspension" // Location/city permit blocked or expired
  | "route-compromised" // Road restriction, closure, or bridge limitation
  | "set-access-restricted" // Physical set or location blocked to non-essential personnel
  | "weather-hold" // Adverse weather affecting transport or production
  | "movement-conflict" // Two movements competing for same gate/resource
  | "overnight-hold" // Transport held overnight — driver on standby
  | "rush-escalation" // Urgent delivery — priority queue raised
  | "equipment-failure" // Vehicle or equipment breakdown affecting transport
  | "actsafe-memo" // Safety memo issued — affects production conduct
  | "callsheet-revised" // New callsheet revision impacts active transport orders
  | "force-majeure"; // Extraordinary event — production halt, legal standing

/**
 * How long a condition persists once raised.
 *
 * - temporary:       expires automatically (e.g. lockup clears after take)
 * - persistent:      remains until explicitly cleared
 * - until-cleared:   must be human-cleared; does not auto-expire
 * - until-event:     clears when a specific production event occurs (e.g. wrap)
 */
export type ConditionPersistence = "temporary" | "persistent" | "until-cleared" | "until-event";

/**
 * How a condition blocks or affects operational movement.
 *
 * - hard-block:  movement cannot proceed. Dispatch is frozen.
 * - soft-block:  movement is strongly discouraged. Coordinator override required.
 * - advisory:    movement is permitted with awareness. No approval required.
 * - none:        condition is informational only. No blocking effect.
 */
export type BlockingBehavior = "hard-block" | "soft-block" | "advisory" | "none";

// ─── Sub-types ──────────────────────────────────────────────────────────────────

/**
 * A single entry in an OperationalCondition's audit log.
 *
 * Append-only. Records every state change from creation to archival.
 * Future Supabase: condition_log table with INSERT-only RLS.
 */
export type ConditionLogEntry = {
  readonly id: ObjectId;
  readonly timestamp: Timestamp;
  readonly type:
    | "created"
    | "acknowledged"
    | "propagated"
    | "impact-cleared"
    | "cleared"
    | "overridden"
    | "note-added"
    | "tier-escalated"
    | "archived";
  readonly actor: string; // coordinator ID, driver ID, or "system:rules-engine"
  readonly note?: string;
  readonly isAppendOnly: true;
};

// ─── Canonical object ───────────────────────────────────────────────────────────

/**
 * OperationalCondition — canonical entity for production state management.
 *
 * A condition is the Rules Engine's primary output.
 * When production state changes (callsheet revised, road blocked, permit suspended),
 * the system creates a condition, propagates its impacts, and surfaces it to coordinators.
 *
 * Coordinator clears the condition → system removes propagation impacts.
 * All of this is logged. Nothing disappears silently.
 */
export type OperationalCondition = {
  // ── Immutable identity ──────────────────────────────────────────────────────
  readonly id: ObjectId;
  readonly productionId: ObjectId;
  readonly createdAt: Timestamp;

  /**
   * Who or what raised this condition.
   * - "system:rules-engine" = automatically detected
   * - coordinator ID = manually created by a human
   */
  readonly createdBy: string;

  // ── Classification ──────────────────────────────────────────────────────────
  readonly type: ConditionType;
  readonly tier: EscalationTier;
  readonly persistence: ConditionPersistence;
  readonly blocking: BlockingBehavior;

  // ── Content ─────────────────────────────────────────────────────────────────
  readonly title: string;
  readonly description: string;

  /** Human-readable operational time: e.g. "10:30", "02:30". For display in dispatch. */
  readonly operationalTimestamp: string;

  // ── Active state (mutable — changes as condition lifecycle progresses) ───────
  isActive: boolean;
  acknowledgment: AcknowledgmentState;

  // ── Propagation ─────────────────────────────────────────────────────────────
  /** IDs of transport orders affected by this condition. */
  readonly affectedOrderIds: ReadonlyArray<ObjectId>;

  /**
   * Propagation impacts generated by the Rules Engine.
   * Each impact describes how this condition affects a specific linked entity.
   */
  readonly propagationImpacts: ReadonlyArray<PropagationImpact>;

  // ── Override + expiry ────────────────────────────────────────────────────────
  /**
   * Whether LP/UPM authority is required to close this condition.
   * True for: force-majeure, actsafe-memo, legal-standing conditions.
   */
  readonly requiresLpOverrideToClose: boolean;

  /**
   * For temporary conditions: when this condition auto-expires.
   * Null/undefined for persistent conditions.
   */
  readonly autoExpiresAt?: Timestamp;

  // ── Audit log (append-only) ──────────────────────────────────────────────────
  readonly conditionLog: ReadonlyArray<ConditionLogEntry>;
};

/**
 * SyncOffset Operational Object Layer — DriverAssignment
 *
 * A DriverAssignment represents the pairing of a driver identity with
 * one or more TransportOrders within a shift window.
 *
 * One driver may serve multiple orders across a shoot day.
 * The primaryOrderId identifies which order is active at any given moment.
 *
 * French Hours compatibility is tracked explicitly because it affects
 * turnaround calculations, overtime exposure, and union compliance.
 *
 * Future Supabase table: driver_assignments
 * Future: linked to crew table via driverId FK
 */

import type { EscalationHistoryEntry, ObjectId, Timestamp, UrgencyTier } from "./shared";

// ─── Enums ──────────────────────────────────────────────────────────────────────

export type DriverStatus =
  | "available" // On shift, no active assignment
  | "active" // Currently operating an assigned transport order
  | "staged" // At origin, loaded, awaiting departure
  | "standby" // On hold pending authorization or clearance
  | "off-duty" // Shift complete or pre-shift
  | "restricted"; // Operational restriction prevents assignment

export type VehicleType =
  | "sedan"
  | "van"
  | "cube-van"
  | "3-ton"
  | "5-ton"
  | "10-ton"
  | "low-loader"
  | "trailer"
  | "picture-vehicle"
  | "specialized";

// ─── Sub-types ──────────────────────────────────────────────────────────────────

/**
 * French Hours compatibility — tracked for union and scheduling compliance.
 *
 * When French Hours are active (no formal meal break, continuous shooting),
 * turnaround calculations and overtime thresholds shift significantly.
 * This object provides the data the Rules Engine needs to propagate
 * French Hours impacts to driver scheduling.
 */
export type FrenchHoursCompatibility = {
  readonly isAware: boolean; // Driver has been briefed
  readonly turnaroundHours: number; // Minimum rest period (hours)
  readonly overtimeThresholdMins: number; // Minutes before OT kicks in
  readonly unionLocal?: string; // e.g. "IATSE Local 891"
};

/**
 * An operational restriction on a driver assignment.
 *
 * Restrictions may be route-specific (weight limits, road clearance),
 * credential-specific (escort required, permit required),
 * or authority-specific (coordinator approval required).
 *
 * Restrictions block dispatch until resolved.
 */
export type OperationalRestriction = {
  readonly id: ObjectId;
  readonly type:
    | "weight-limit"
    | "road-clearance"
    | "permit-required"
    | "escort-required"
    | "coordinator-approval"
    | "french-hours-restricted"
    | "medical-hold";
  readonly description: string;
  readonly isActive: boolean;
  readonly appliedAt: Timestamp;
  readonly clearedAt?: Timestamp;
  readonly clearedBy?: string;
};

/**
 * The temporal window of a driver's shift.
 * Used to calculate overtime, turnaround, and French Hours exposure.
 */
export type ShiftWindow = {
  readonly callTime: Timestamp; // Start of shift
  readonly estimatedWrapTime: Timestamp; // Expected end of shift
  readonly isOvernightShift: boolean;
  readonly isExtendedShift: boolean; // 12+ hours
  readonly isFrenchHoursApplicable: boolean;
};

// ─── Canonical object ───────────────────────────────────────────────────────────

/**
 * DriverAssignment — canonical operational entity.
 *
 * A driver assignment is created when a driver is paired with a shift
 * and one or more transport orders on a given shoot day.
 *
 * The assignment owns its operational restrictions and escalation history.
 * Linked transport orders are referenced by ID — not embedded.
 */
export type DriverAssignment = {
  // ── Immutable identity ──────────────────────────────────────────────────────
  readonly id: ObjectId; // e.g. "DA-2501"
  readonly productionId: ObjectId;
  readonly createdAt: Timestamp;
  readonly createdBy: string;

  // ── Driver identity ─────────────────────────────────────────────────────────
  readonly driverName: string;
  readonly driverId?: ObjectId; // Future FK: crew / users table
  readonly phone: string;
  readonly radioChannel: string; // e.g. "Ch. 3 — Transport"
  readonly radioCallSign?: string; // e.g. "Unit 7", "Transport 3"

  // ── Vehicle ─────────────────────────────────────────────────────────────────
  readonly vehicle: string; // Plate or fleet ID: "YKW 4821"
  readonly vehicleType: VehicleType;
  readonly vehicleDescription?: string;

  // ── Availability + scheduling ───────────────────────────────────────────────
  status: DriverStatus;
  shift: ShiftWindow;
  frenchHoursCompatibility: FrenchHoursCompatibility;

  // ── Operational restrictions (mutable — can be added or cleared) ────────────
  restrictions: ReadonlyArray<OperationalRestriction>;

  // ── Order linkage (one driver, multiple orders per shift) ───────────────────
  linkedTransportOrderIds: ReadonlyArray<ObjectId>;
  primaryOrderId?: ObjectId; // The active order at the current moment

  // ── Urgency inheritance ─────────────────────────────────────────────────────
  // Derived from the highest-urgency linked order.
  // Future: computed by Rules Engine, not stored as authored field.
  derivedUrgency?: UrgencyTier;

  // ── Operational notes ───────────────────────────────────────────────────────
  operationalNote?: string;

  // ── Escalation history (append-only) ────────────────────────────────────────
  readonly escalationHistory: ReadonlyArray<EscalationHistoryEntry>;
};

/**
 * SyncOffset Operational Object Layer — TransportOrder
 *
 * A TransportOrder is the primary movement entity in SyncOffset.
 * It represents a single physical transport of goods, crew, equipment,
 * or documentation between two operational locations.
 *
 * Identity contract:
 * - id is permanent from creation. It never changes.
 * - Identity fields (id, productionId, createdAt, departmentId) are readonly.
 * - Operational state fields (status, urgency, progress, eta) are mutable.
 * - routeEvents, documents, escalationHistory are append-only.
 *
 * Future Supabase table: transport_orders
 * Append-only child tables: route_events, transport_order_documents
 */

import type {
  EscalationHistoryEntry,
  ObjectId,
  OperationalLocation,
  OwnedDocument,
  RefCode,
  RouteEvent,
  Timestamp,
  UrgencyTier,
} from "./shared";

// ─── Enums ──────────────────────────────────────────────────────────────────────

/**
 * Lifecycle status of a TransportOrder.
 *
 * State machine:
 *   draft → staged → scheduled → dispatched → en-route → completed
 *                             ↓                  ↓
 *                           held          awaiting-clearance
 *                             ↓                  ↓
 *                     (back to scheduled / cancelled / archived)
 *
 * Completed and archived are terminal states.
 * Cancelled preserves the record (nothing disappears silently).
 */
export type TransportOrderStatus =
  | "draft" // Created, not yet staged
  | "staged" // Vehicle loaded, awaiting departure authorization
  | "scheduled" // Departure time confirmed, authorization granted
  | "dispatched" // Vehicle has departed origin
  | "en-route" // Active movement confirmed, progress tracked
  | "held" // Movement suspended — operational hold
  | "awaiting-clearance" // Blocked — external authorization required
  | "completed" // Delivered and received at destination
  | "cancelled" // Order voided — record preserved
  | "archived"; // Historical record — production wrapped

export type TransportMode = "road" | "air" | "sea" | "hand-carry";

// ─── Sub-types ──────────────────────────────────────────────────────────────────

export type HandlingTag = {
  readonly label: string;
  readonly code: string; // e.g. "NO_STACK", "SIGNATURE_REQUIRED", "TEMP_CONTROLLED"
};

/**
 * Handling instructions for cargo in transit.
 * These are operational requirements, not UI labels.
 */
export type HandlingContract = {
  readonly label: string; // Short summary: "Camera optics — fragile"
  readonly notes: string; // Full instructions for driver/receiver
  readonly tags: ReadonlyArray<HandlingTag>;
  readonly requiresSignature: boolean;
  readonly isTemperatureSensitive: boolean;
  readonly isFragile: boolean;
  readonly isHazmat: boolean;
};

/**
 * A single line item in the transport manifest.
 * Manifests are owned by the TransportOrder.
 * Return-required items are tracked for wrap accountability.
 */
export type ManifestEntry = {
  readonly id: ObjectId;
  readonly description: string;
  readonly quantity: string;
  readonly departmentOwner: string;
  readonly handlingNote?: string;
  readonly isReturnRequired: boolean;
  readonly returnedAt?: Timestamp;
  readonly returnConfirmedBy?: string;
};

// ─── Canonical object ───────────────────────────────────────────────────────────

/**
 * TransportOrder — the canonical operational entity for production movement.
 *
 * Relationships are held as reference IDs, not embedded objects.
 * This allows future Supabase FK joins without schema migration.
 *
 * Field categories:
 * - readonly        → immutable after object creation
 * - mutable (no modifier) → operational state, updated during live operations
 * - ReadonlyArray   → append-only collections (no destructive mutations)
 */
export type TransportOrder = {
  // ── Immutable identity ──────────────────────────────────────────────────────
  readonly id: ObjectId; // e.g. "CI-01-2501" — permanent
  readonly productionId: ObjectId; // FK: productions table
  readonly ref: RefCode; // Human-readable operational ref — same as id for CIs
  readonly createdAt: Timestamp;
  readonly createdBy: string; // coordinator user reference

  // ── Department ownership ────────────────────────────────────────────────────
  readonly departmentId: ObjectId;
  readonly departmentName: string; // e.g. "Camera Dept", "Set Dec"

  // ── Movement ────────────────────────────────────────────────────────────────
  readonly origin: OperationalLocation;
  readonly destination: OperationalLocation;
  readonly transportMode: TransportMode;
  readonly vehiclePlate?: string; // plate or fleet ID
  readonly cargo: string; // human-readable cargo description
  readonly weight?: string; // e.g. "850 kg"

  // ── Manifest + handling ─────────────────────────────────────────────────────
  readonly manifest: ReadonlyArray<ManifestEntry>;
  readonly handling: HandlingContract;

  // ── Operational state (mutable during live operations) ─────────────────────
  status: TransportOrderStatus;
  urgency: UrgencyTier;
  operationalNote: string;
  progress: number; // 0–100

  // ── Timing ──────────────────────────────────────────────────────────────────
  scheduledEta: string; // Human-readable crew call time: "06:00 AM"
  revisedEta?: string; // Set when timing changes operationally
  etaContext?: string; // e.g. "Crew Call", "Revised window", "Locked window"
  actualArrivalAt?: Timestamp; // Set on completion

  // ── Shoot context ───────────────────────────────────────────────────────────
  shootDay: string; // e.g. "Day 12"
  sceneRef?: string; // Optional scene linkage: "Scene 14A"

  // ── Relationships (by reference ID — future Supabase FK joins) ─────────────
  driverAssignmentId?: ObjectId;
  linkedConditionIds: ReadonlyArray<ObjectId>;
  linkedCallsheetRevisionRef?: RefCode; // e.g. "CS-D12-R2"

  // ── Documents (owned by this order) ─────────────────────────────────────────
  // Constitutional: operational objects own their documentation.
  readonly documents: ReadonlyArray<OwnedDocument>;

  // ── Route events (append-only audit log) ────────────────────────────────────
  // Constitutional: route history is immutable. No events are deleted.
  // Future Supabase: stored in separate route_events table, INSERT-only RLS.
  readonly routeEvents: ReadonlyArray<RouteEvent>;

  // ── Escalation history (append-only) ────────────────────────────────────────
  // Constitutional: escalation history is permanent audit truth.
  // Future Supabase: escalation_history table, no UPDATE/DELETE.
  readonly escalationHistory: ReadonlyArray<EscalationHistoryEntry>;
};

/**
 * SyncOffset Operational Object Layer — Shared Contracts
 *
 * These are the constitutional primitives that every operational object
 * in SyncOffset is built from. They encode the platform's founding law:
 *
 *   - Identity is permanent. IDs do not change.
 *   - Documents belong to the object that generated them.
 *   - Events are append-only. History is never destroyed.
 *   - Acknowledgment is human. The system flags; humans clear.
 *   - Relationships are by reference ID. Embedding is for display only.
 *
 * Do NOT import component, UI, or data-layer types here.
 * Do NOT add presentation-layer fields (colors, icons, labels for UI).
 * These types map directly to future Supabase table schemas.
 */

// ─── Primitive aliases ──────────────────────────────────────────────────────────

/**
 * ISO 8601 timestamp string.
 * Future Supabase column type: TIMESTAMPTZ
 */
export type Timestamp = string;

/**
 * Production-scoped UUID or system-generated unique identifier.
 * Future Supabase column type: UUID (uuid_generate_v4())
 */
export type ObjectId = string;

/**
 * Human-readable operational reference code.
 * Examples: "CI-01-2501", "CS-D12-R2", "MO-2501-D12"
 * These are stable, unique within a production, and crew-facing.
 */
export type RefCode = string;

// ─── Escalation + urgency ───────────────────────────────────────────────────────

/**
 * Escalation tiers — the severity vocabulary of the SyncOffset Rules Engine.
 *
 * Severity order: legal > blocker > attention > informational
 *
 * - legal:         compliance risk, legal exposure, or Actsafe implication.
 *                  Requires LP/UPM override to clear.
 * - blocker:       operational halt. Movement or action cannot proceed.
 *                  Requires coordinator acknowledgment to clear.
 * - attention:     operational risk or friction. Action recommended.
 *                  Can be self-acknowledged by relevant coordinator.
 * - informational: status update. No action required. Clears on event.
 */
export type EscalationTier = "legal" | "blocker" | "attention" | "informational";

/**
 * Queue urgency tiers — controls display priority and coordinator scanning order.
 *
 * Urgency is separate from escalation:
 * - Urgency determines queue position and visual weight in the UI.
 * - Escalation determines propagation behavior and approval requirements.
 *
 * A "normal" transport order can still have a "blocker" escalation condition.
 */
export type UrgencyTier = "priority" | "watch" | "normal";

// ─── Geography ──────────────────────────────────────────────────────────────────

export type GeoCoordinate = {
  readonly longitude: number;
  readonly latitude: number;
};

/**
 * An operational location — a physical place in the production world.
 * Future Supabase table: locations
 */
export type OperationalLocation = {
  readonly id: ObjectId;
  readonly displayName: string; // e.g. "Stage 4 — Bridge Studios"
  readonly region: string; // e.g. "Burnaby", "Surrey", "N. Vancouver"
  readonly coordinates?: GeoCoordinate;
  /** Future FK: references the locations table */
  readonly locationRef?: string;
};

// ─── Documents ──────────────────────────────────────────────────────────────────

/**
 * Operational document types.
 *
 * Constitutional principle: operational objects own their documentation.
 * A Movement Order belongs to the Transport Order that generated it.
 * A Callsheet belongs to the Callsheet Revision that issued it.
 * Documents do not float free of their parent objects.
 */
export type DocumentType =
  | "call-sheet"
  | "movement-order"
  | "permit"
  | "ci-form"
  | "manifest"
  | "revision-manifest"
  | "receipt"
  | "signature-record"
  | "damage-report"
  | "actsafe-memo"
  | "prep-memo"
  | "gate-pass"
  | "vendor-invoice"
  | "return-receipt";

/**
 * An operational document owned by its parent object.
 *
 * Constitutional guarantees:
 * - isSigned + isSignatureRequired → document becomes immutable.
 * - isImmutable documents cannot be edited or deleted.
 * - Nothing disappears silently: cancelled documents are flagged, not erased.
 *
 * Future Supabase:
 * - Metadata row in owned_documents table (with parent FK)
 * - File stored in Supabase Storage bucket (dept-scoped, RLS-protected)
 */
export type OwnedDocument = {
  readonly id: ObjectId;
  readonly ref: RefCode; // e.g. "MO-2501-D12"
  readonly type: DocumentType;
  readonly name: string;
  readonly issuedAt: Timestamp;
  readonly issuedBy: string; // coordinator name or system identifier

  // Signature contract
  readonly isSignatureRequired: boolean;
  readonly isSigned: boolean;
  readonly signedAt?: Timestamp;
  readonly signedBy?: string;

  /**
   * Constitutional: once signed and required, this document is immutable.
   * No UPDATE operations are permitted on immutable documents.
   * Future: enforced via Supabase RLS + trigger.
   */
  readonly isImmutable: boolean;

  // Future storage bucket reference
  readonly storageRef?: string; // e.g. "productions/{id}/documents/{ref}.pdf"
  readonly storageUrl?: string; // presigned URL — ephemeral, not persisted
};

// ─── Route events ───────────────────────────────────────────────────────────────

/**
 * Route event types — the operational vocabulary of physical movement.
 *
 * Every event in a transport order's life is recorded here.
 * These events are the audit truth of production movement.
 */
export type RouteEventType =
  | "staged"
  | "departed"
  | "en-route"
  | "waypoint-reached"
  | "waypoint-restricted"
  | "rerouted"
  | "held"
  | "arrived"
  | "completed"
  | "cancelled"
  | "escalated"
  | "condition-linked"
  | "condition-cleared"
  | "override-applied"
  | "note-added"
  | "signature-recorded"
  | "document-attached";

/**
 * A route event — append-only operational record.
 *
 * Constitutional guarantee: route events are never modified or deleted.
 * They are the immutable audit history of a transport order's movement.
 *
 * Future Supabase:
 * - Stored in route_events table
 * - RLS: INSERT allowed for active drivers/coordinators; no UPDATE/DELETE
 * - Indexed on (transport_order_id, timestamp)
 */
export type RouteEvent = {
  readonly id: ObjectId;
  readonly type: RouteEventType;
  readonly timestamp: Timestamp;
  readonly location: string;
  readonly note: string;
  readonly createdBy: string; // driver ID, coordinator ID, or "system"
  readonly transportOrderId: ObjectId; // FK to parent TransportOrder

  /**
   * Constitutional marker: no UPDATE policy exists for route events.
   * This field is a type-level enforcement of append-only behavior.
   */
  readonly isAppendOnly: true;
};

// ─── Escalation history ─────────────────────────────────────────────────────────

/**
 * A single entry in an object's escalation history.
 *
 * Append-only audit record. Never modified after creation.
 * Auto-flag, human-clear: system creates the entry; humans acknowledge.
 *
 * Future Supabase: escalation_history table, no UPDATE/DELETE RLS.
 */
export type EscalationHistoryEntry = {
  readonly id: ObjectId;
  readonly tier: EscalationTier;
  readonly timestamp: Timestamp;

  readonly triggeredBy: string; // condition ID, rule name, or coordinator
  readonly description: string;

  readonly wasAcknowledged: boolean;
  readonly acknowledgedBy?: string;
  readonly acknowledgedAt?: Timestamp;

  readonly wasCleared: boolean;
  readonly clearedBy?: string;
  readonly clearedAt?: Timestamp;

  readonly isAppendOnly: true;
};

// ─── Acknowledgment ─────────────────────────────────────────────────────────────

/**
 * Acknowledgment state for conditions, revisions, and escalations.
 *
 * Constitutional doctrine: auto-flag, human-clear.
 * The system raises flags automatically based on rules.
 * Only a human with appropriate authority can acknowledge or clear.
 *
 * Override authority is defined by role:
 * - "production-coordinator" — standard acknowledgment
 * - "upm"                   — elevated conditions
 * - "lp"                    — legal / force-majeure conditions
 */
export type AcknowledgmentState = {
  readonly isAcknowledged: boolean;
  readonly acknowledgedBy?: string;
  readonly acknowledgedAt?: Timestamp;
  readonly acknowledgmentNote?: string;

  readonly isOverrideable: boolean;
  readonly overrideRequires?: "production-coordinator" | "upm" | "lp";
};

// ─── Propagation ────────────────────────────────────────────────────────────────

/**
 * A propagation impact — describes how one condition affects another object.
 *
 * When a condition is raised (e.g. "Set Access Restricted"),
 * the Rules Engine generates PropagationImpacts describing
 * which transport orders are blocked, which routes are compromised, etc.
 *
 * Impacts are cleared when the parent condition is cleared.
 * Future: powers the Rules Engine cascade behavior in realtime.
 */
export type PropagationImpact = {
  readonly id: ObjectId;
  readonly sourceConditionId: ObjectId;

  readonly targetObjectType: "TransportOrder" | "DriverAssignment" | "CallsheetRevision" | "Schedule" | "Permit";
  readonly targetObjectId: ObjectId;

  readonly impactType:
    | "blocked"
    | "rerouted"
    | "delayed"
    | "priority-elevated"
    | "signature-required"
    | "notified"
    | "frozen";

  readonly appliedAt: Timestamp;
  readonly clearedAt?: Timestamp;
  readonly clearedBy?: string;
};

/**
 * SyncOffset Operational Object Layer — CallsheetRevision
 *
 * A CallsheetRevision is an immutable production scheduling document.
 * Once issued, it cannot be edited. A new revision creates a new object.
 *
 * Constitutional guarantees:
 * - isImmutableAfterIssue is always true once status transitions to "issued".
 * - Superseded revisions are preserved — nothing disappears silently.
 * - All department acknowledgments are logged and auditable.
 * - Linked transport orders and conditions are referenced, not embedded.
 *
 * Real-world behavior:
 * - A Day 12 callsheet may have R1, R2, R3.
 * - Each revision is a discrete, immutable record.
 * - R2 supersedes R1, but R1's record remains accessible.
 * - Transport orders impacted by a revision are tracked explicitly.
 *
 * Future Supabase table: callsheet_revisions
 * Append-only child table: revision_log, dept_acknowledgments
 */

import type { ObjectId, RefCode, Timestamp } from "./shared";

// ─── Enums ──────────────────────────────────────────────────────────────────────

export type CallsheetRevisionStatus =
  | "draft" // Being prepared — not yet issued
  | "issued" // Distributed to departments — now immutable
  | "acknowledged" // All required departments have acknowledged
  | "superseded" // A newer revision has been issued
  | "archived"; // Production wrapped — historical record

/**
 * The category of change captured in a ScheduleChange entry.
 * These are the types of revision the callsheet system recognizes.
 */
export type ScheduleChangeType =
  | "call-time" // Crew call time pushed or pulled
  | "location" // Shooting location changed
  | "scene-order" // Scene shooting order revised
  | "department-call" // Specific department call time changed
  | "unit-move" // Splinter or 2nd unit movement change
  | "general"; // Catch-all for non-categorized revisions

// ─── Sub-types ──────────────────────────────────────────────────────────────────

/**
 * A discrete schedule change within a revision.
 *
 * Each change records what it replaces and what it becomes.
 * This enables the Rules Engine to identify which transport orders
 * are affected by a specific change — e.g. "call time pushed 1 hour"
 * propagates directly to all transport orders for that department.
 */
export type ScheduleChange = {
  readonly id: ObjectId;
  readonly type: ScheduleChangeType;
  readonly description: string;
  readonly previousValue?: string; // e.g. "06:00 AM"
  readonly newValue?: string; // e.g. "07:00 AM"
  readonly affectedDepartments: ReadonlyArray<string>;
};

/**
 * An individual department's acknowledgment of a callsheet revision.
 *
 * Constitutional: acknowledgments are append-only records.
 * Once a department acknowledges, that record is permanent.
 * Withdrawal of acknowledgment is not permitted — a new revision is required.
 *
 * Future Supabase: dept_acknowledgments table,
 * INSERT allowed for department HOD or coordinator; no UPDATE/DELETE.
 */
export type DeptAcknowledgmentRecord = {
  readonly departmentId: ObjectId;
  readonly departmentName: string;
  readonly isAcknowledged: boolean;
  readonly acknowledgedBy?: string; // HOD name or coordinator
  readonly acknowledgedAt?: Timestamp;
  readonly isRequiredToAcknowledge: boolean; // Some depts are mandatory
};

/**
 * A single entry in a revision's immutable audit log.
 * Records every lifecycle event from issuance to archival.
 */
export type RevisionLogEntry = {
  readonly id: ObjectId;
  readonly timestamp: Timestamp;
  readonly type:
    | "issued"
    | "dept-acknowledged"
    | "all-acknowledged"
    | "superseded"
    | "archived"
    | "linked-to-condition"
    | "linked-to-transport-order"
    | "note-added";
  readonly actor: string;
  readonly note?: string;
  readonly isAppendOnly: true;
};

// ─── Canonical object ───────────────────────────────────────────────────────────

/**
 * CallsheetRevision — canonical production scheduling document.
 *
 * Immutability after issuance is a constitutional guarantee.
 * The system does not allow edits to issued revisions.
 * Coordinators who need to make corrections must issue a new revision.
 *
 * This creates a clean, auditable history of how the schedule evolved
 * across a shoot day — essential for production accountability,
 * union compliance, and post-production reporting.
 */
export type CallsheetRevision = {
  // ── Immutable identity ──────────────────────────────────────────────────────
  readonly id: ObjectId;
  readonly productionId: ObjectId;

  /** Human-readable reference code: e.g. "CS-D12-R2" */
  readonly ref: RefCode;

  /** The shoot day this revision applies to: e.g. "Day 12" */
  readonly day: string;

  /** 1-based revision number. R1 = 1, R2 = 2, R3 = 3. */
  readonly revisionNumber: number;

  readonly issuedAt: Timestamp;
  readonly issuedBy: string; // coordinator name or department

  // ── Status ──────────────────────────────────────────────────────────────────
  status: CallsheetRevisionStatus;

  // ── Constitutional immutability marker ──────────────────────────────────────
  /**
   * Always true once status transitions to "issued".
   * The system enforces this at the service layer.
   * Future Supabase: enforced via trigger + RLS — no UPDATE on issued rows.
   */
  readonly isImmutableAfterIssue: boolean;

  /** If superseded, this points to the ref code of the superseding revision. */
  readonly supersededBy?: RefCode;

  // ── Content (defined at draft time, frozen at issuance) ─────────────────────
  readonly scheduleChanges: ReadonlyArray<ScheduleChange>;
  readonly affectedDepartments: ReadonlyArray<string>;
  readonly shootDay: string; // redundant with `day` for clarity in linked object contexts

  // ── Acknowledgment tracking ──────────────────────────────────────────────────
  readonly departmentAcknowledgments: ReadonlyArray<DeptAcknowledgmentRecord>;

  // ── Relationships (by reference ID) ─────────────────────────────────────────
  /**
   * Conditions raised as a result of this revision.
   * e.g. "Call times pushed → creates 'callsheet-revised' condition
   *       that propagates to transport orders for affected departments."
   */
  readonly linkedConditionIds: ReadonlyArray<ObjectId>;

  /**
   * Transport orders that should be reviewed in light of this revision.
   * e.g. revised call times may require updated pickup windows.
   */
  readonly linkedTransportOrderIds: ReadonlyArray<ObjectId>;

  // ── Audit log (append-only) ──────────────────────────────────────────────────
  readonly revisionLog: ReadonlyArray<RevisionLogEntry>;
};

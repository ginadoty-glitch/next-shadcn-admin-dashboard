/**
 * SyncOffset Operational Object Layer
 *
 * This is the canonical type contract for SyncOffset's operational objects.
 * All UI components, service layers, Supabase schemas, and API handlers
 * must derive from or conform to these types.
 *
 * Constitutional hierarchy:
 *   shared.ts           — primitives, escalation tiers, document contracts, events
 *   transport-order.ts  — primary movement entity
 *   driver-assignment.ts — driver + vehicle + shift pairing
 *   operational-condition.ts — production state + Rules Engine output
 *   callsheet-revision.ts — immutable scheduling documents
 *
 * Import from this barrel when consuming operational types.
 * Import directly from individual files only when needed for precision.
 */

export type * from "./callsheet-revision";
export type * from "./driver-assignment";
export type * from "./operational-condition";
export type * from "./shared";
export type * from "./transport-order";

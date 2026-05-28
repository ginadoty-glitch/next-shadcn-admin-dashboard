"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  computeConditionPropagation,
  computeRevisionImpact,
  type DerivedOrderState,
} from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type { Shipment } from "../../logistics/_components/shipment-data";
import type { CallsheetRevision, ConditionTier, OperationalCondition } from "./dispatch-data";

// ─── Visual maps ───────────────────────────────────────────────────────────────

const tierMeta: Record<ConditionTier, { indicator: string; textClass: string; borderClass: string; bgClass: string }> =
  {
    legal: {
      indicator: "■ LEGAL",
      textClass: "text-[#d3410c]",
      borderClass: "border-[#d3410c]/50",
      bgClass: "bg-[#d3410c]/[0.07]",
    },
    blocker: {
      indicator: "■ BLOCKED",
      textClass: "text-[#d3410c]",
      borderClass: "border-[#d3410c]/40",
      bgClass: "bg-[#d3410c]/[0.05]",
    },
    attention: {
      indicator: "▲ ATTN",
      textClass: "text-[#f2b90e]",
      borderClass: "border-[#f2b90e]/30",
      bgClass: "bg-[#f2b90e]/[0.05]",
    },
    informational: {
      indicator: "→ INFO",
      textClass: "text-[#bfd4ef]",
      borderClass: "border-[#bfd4ef]/20",
      bgClass: "bg-[#bfd4ef]/[0.04]",
    },
  };

// Determines tier sort order — blockers appear before attention, etc.
const tierOrder: Record<ConditionTier, number> = {
  legal: 0,
  blocker: 1,
  attention: 2,
  informational: 3,
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ label, count, countClass }: { label: string; count?: number; countClass?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">{label}</span>
      {count !== undefined && (
        <span className={cn("font-mono text-[9px]", countClass ?? "text-muted-foreground")}>{count}</span>
      )}
    </div>
  );
}

function ConditionRow({
  condition,
  isLinked,
  blastRadius,
}: {
  condition: OperationalCondition;
  isLinked: boolean;
  blastRadius: number;
}) {
  const meta = tierMeta[condition.tier];

  return (
    <div
      className={cn(
        "rounded border px-2 py-1.5 transition-colors",
        meta.borderClass,
        meta.bgClass,
        isLinked && "ring-1",
        isLinked && condition.tier === "blocker" && "ring-[#d3410c]/25",
        isLinked && condition.tier === "attention" && "ring-[#f2b90e]/25",
        isLinked && condition.tier === "informational" && "ring-[#bfd4ef]/15",
      )}
    >
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-[9px] uppercase tracking-[0.1em]", meta.textClass)}>{meta.indicator}</span>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground tabular-nums">{condition.timestamp}</span>
      </div>
      <div className="mt-0.5 font-medium text-[#dbd5c5] text-[10px] leading-snug">{condition.title}</div>
      {/* Blast radius — how many active orders this condition affects */}
      <div className="mt-1 flex items-center justify-between">
        <div className="text-[9px] text-muted-foreground/70 leading-snug">{condition.affectedOrderIds.join(" · ")}</div>
        {blastRadius > 0 && (
          <span
            className={cn(
              "ml-2 shrink-0 rounded px-1 py-0.5 font-mono text-[8px]",
              condition.tier === "blocker" || condition.tier === "legal"
                ? "bg-[#d3410c]/10 text-[#d3410c]"
                : condition.tier === "attention"
                  ? "bg-[#f2b90e]/10 text-[#f2b90e]"
                  : "bg-[#bfd4ef]/10 text-[#bfd4ef]",
            )}
          >
            {blastRadius} order{blastRadius !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────────

type OperationalIntelligenceProps = {
  selectedOrderId: string | null;
  shipments: Shipment[];
  conditions: OperationalCondition[];
  revision: CallsheetRevision;
  derivedStates: Map<string, DerivedOrderState>;
};

// ─── Main export ────────────────────────────────────────────────────────────────

export function OperationalIntelligence({
  selectedOrderId,
  shipments,
  conditions,
  revision,
  derivedStates,
}: OperationalIntelligenceProps) {
  // Active conditions sorted by tier severity
  const sortedConditions = [...conditions]
    .filter((c) => c.isActive)
    .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

  // Priority orders that are not completed
  const rushQueue = shipments.filter((s) => s.urgency === "priority" && s.status !== "Completed").slice(0, 6);

  // Orders with unresolved signatures — sourced from propagation engine
  const pendingSignatures = shipments.filter((s) => {
    const d = derivedStates.get(s.id);
    return d?.hasUnresolvedSignature;
  });

  const blockerCount = sortedConditions.filter((c) => c.tier === "legal" || c.tier === "blocker").length;

  // Revision propagation: which orders are impacted, is French Hours active
  const revisionImpact = computeRevisionImpact(revision, shipments, conditions);
  const revisionAffectedCount = revisionImpact.affectedOrderIds.length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Rail header */}
      <div className="shrink-0 border-b px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Intelligence</span>
          {blockerCount > 0 && (
            <span className="rounded bg-[#d3410c]/10 px-1.5 py-0.5 font-mono text-[#d3410c] text-[9px]">
              {blockerCount} blocked
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col divide-y divide-border/40">
          {/* ── Active Conditions ──────────────────────────────── */}
          <div className="px-3 py-3">
            <SectionLabel
              label="Active Conditions"
              count={sortedConditions.length}
              countClass={blockerCount > 0 ? "text-[#d3410c]" : "text-muted-foreground"}
            />
            <div className="flex flex-col gap-1.5">
              {sortedConditions.map((c) => {
                const { activeOrderBlastRadius } = computeConditionPropagation(c, shipments);
                return (
                  <ConditionRow
                    key={c.id}
                    condition={c}
                    isLinked={c.affectedOrderIds.includes(selectedOrderId ?? "")}
                    blastRadius={activeOrderBlastRadius}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Active Callsheet ───────────────────────────────── */}
          <div className="px-3 py-3">
            <SectionLabel
              label="Active Callsheet"
              count={revisionAffectedCount > 0 ? revisionAffectedCount : undefined}
              countClass="text-[#bfd4ef]"
            />
            <div className="flex flex-col gap-1.5 rounded border border-[#bfd4ef]/20 bg-[#bfd4ef]/[0.04] px-2.5 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[#bfd4ef] text-[10px] tracking-wider">{revision.ref}</span>
                <span className="text-[9px] text-muted-foreground">
                  {revision.issued.split(",")[1]?.trim() ?? revision.issued}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#dbd5c5] text-[10px]">
                  {revision.day} — Rev {revision.revision}
                </span>
                {revisionImpact.frenchHoursActive && (
                  <span className="rounded bg-[#f2b90e]/10 px-1 py-0.5 font-mono text-[#f2b90e] text-[8px] uppercase tracking-wider">
                    French Hours
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {revision.changes.map((change) => (
                  <div key={change} className="flex gap-1.5">
                    <span className="mt-0.5 shrink-0 text-[#bfd4ef] text-[9px]">·</span>
                    <span className="text-[9px] text-muted-foreground leading-snug">{change}</span>
                  </div>
                ))}
              </div>
              {revisionAffectedCount > 0 && (
                <div className="mt-1 border-[#bfd4ef]/15 border-t pt-1.5 text-[9px] text-muted-foreground/60">
                  {revisionAffectedCount} order{revisionAffectedCount !== 1 ? "s" : ""} affected by this revision
                </div>
              )}
              <div className="text-[9px] text-muted-foreground/60">{revision.issuedBy}</div>
            </div>
          </div>

          {/* ── Rush Queue ─────────────────────────────────────── */}
          <div className="px-3 py-3">
            <SectionLabel label="Rush Queue" count={rushQueue.length} countClass="text-[#f2b90e]" />
            <div className="flex flex-col gap-1.5">
              {rushQueue.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "rounded border px-2 py-1.5 transition-colors",
                    s.id === selectedOrderId
                      ? "border-[#f2b90e]/35 bg-[#f2b90e]/[0.06]"
                      : "border-border/50 bg-muted/10",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-1.5">
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-wider",
                        s.id === selectedOrderId ? "text-[#f2b90e]" : "text-[#dbd5c5]",
                      )}
                    >
                      {s.id}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground tabular-nums">{s.eta}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{s.cargo}</div>
                  <div className="mt-0.5 text-[9px] text-muted-foreground/60">{s.customer.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pending Signatures ─────────────────────────────── */}
          {pendingSignatures.length > 0 && (
            <div className="px-3 py-3">
              <SectionLabel label="Pending Signatures" count={pendingSignatures.length} countClass="text-[#933614]" />
              <div className="flex flex-col gap-1.5">
                {pendingSignatures.map((s) => {
                  const unsignedDoc = s.documents.find(
                    (d) =>
                      d.type === "ci" &&
                      (d.name.toLowerCase().includes("unsigned") ||
                        d.name.toLowerCase().includes("awaiting") ||
                        d.name.toLowerCase().includes("pending approval")),
                  );

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "border-[#d3410c]/40 border-l-2 py-1.5 pl-2.5 transition-colors",
                        s.id === selectedOrderId && "bg-[#d3410c]/[0.04]",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span className="font-mono text-[#dbd5c5] text-[10px] tracking-wider">{s.id}</span>
                        <span className="font-mono text-[#d3410c] text-[9px]">⊘ unsigned</span>
                      </div>
                      <div className="mt-0.5 text-[9px] text-muted-foreground/60">{s.customer.name}</div>
                      {unsignedDoc && (
                        <div className="mt-0.5 truncate text-[9px] text-muted-foreground/60">{unsignedDoc.name}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

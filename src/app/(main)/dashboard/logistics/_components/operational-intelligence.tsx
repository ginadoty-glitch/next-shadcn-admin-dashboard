"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  computeConditionPropagation,
  computeRevisionImpact,
  type DerivedOrderState,
} from "@/lib/operations/propagation";
import { cn } from "@/lib/utils";

import type { CallsheetRevision, ConditionTier, OperationalCondition } from "./operational-data";
import type { Shipment } from "./shipment-data";

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
    <div className="mb-1.5 flex items-center justify-between">
      <span className="text-[8px] text-muted-foreground uppercase tracking-[0.15em]">{label}</span>
      {count !== undefined && (
        <span className={cn("font-mono text-[8px]", countClass ?? "text-muted-foreground")}>{count}</span>
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
        "rounded border px-2 py-1 transition-colors",
        meta.borderClass,
        meta.bgClass,
        isLinked && "ring-1",
        isLinked && condition.tier === "blocker" && "ring-[#d3410c]/25",
        isLinked && condition.tier === "attention" && "ring-[#f2b90e]/25",
        isLinked && condition.tier === "informational" && "ring-[#bfd4ef]/15",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("text-[8px] uppercase tracking-[0.1em]", meta.textClass)}>{meta.indicator}</span>
        {blastRadius > 0 && (
          <span
            className={cn(
              "rounded px-1 py-px font-mono text-[8px]",
              condition.tier === "blocker" || condition.tier === "legal"
                ? "bg-[#d3410c]/10 text-[#d3410c]"
                : condition.tier === "attention"
                  ? "bg-[#f2b90e]/10 text-[#f2b90e]"
                  : "bg-[#bfd4ef]/10 text-[#bfd4ef]",
            )}
          >
            {blastRadius}×
          </span>
        )}
        <span className="ml-auto font-mono text-[8px] text-muted-foreground tabular-nums">{condition.timestamp}</span>
      </div>
      <div className="font-medium text-[#dbd5c5] text-[9px] leading-snug">{condition.title}</div>
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
      <div className="shrink-0 border-b px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Intelligence</span>
          {blockerCount > 0 && (
            <span className="rounded bg-[#d3410c]/10 px-1.5 py-0.5 font-mono text-[#d3410c] text-[8px]">
              {blockerCount} blocked
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col divide-y divide-border/40">
          {/* ── Active Conditions ──────────────────────────────── */}
          <div className="px-3 py-2">
            <SectionLabel
              label="Active Conditions"
              count={sortedConditions.length}
              countClass={blockerCount > 0 ? "text-[#d3410c]" : "text-muted-foreground"}
            />
            <div className="flex flex-col gap-1">
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
          <div className="px-3 py-2">
            <SectionLabel
              label="Active Callsheet"
              count={revisionAffectedCount > 0 ? revisionAffectedCount : undefined}
              countClass="text-[#bfd4ef]"
            />
            <div className="flex flex-col gap-1 rounded border border-[#bfd4ef]/20 bg-[#bfd4ef]/[0.04] px-2 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[#bfd4ef] text-[9px] tracking-wider">{revision.ref}</span>
                <div className="flex items-center gap-1.5">
                  {revisionImpact.frenchHoursActive && (
                    <span className="rounded bg-[#f2b90e]/10 px-1 py-px font-mono text-[#f2b90e] text-[7px] uppercase tracking-wider">
                      French Hours
                    </span>
                  )}
                  <span className="text-[8px] text-muted-foreground">
                    {revision.issued.split(",")[1]?.trim() ?? revision.issued}
                  </span>
                </div>
              </div>
              <div className="text-[#dbd5c5] text-[9px]">
                {revision.day} — Rev {revision.revision}
              </div>
              <div className="flex flex-col gap-0.5">
                {revision.changes.map((change) => (
                  <div key={change} className="flex gap-1">
                    <span className="mt-px shrink-0 text-[#bfd4ef] text-[8px]">·</span>
                    <span className="text-[9px] text-muted-foreground/80 leading-snug">{change}</span>
                  </div>
                ))}
              </div>
              {revisionAffectedCount > 0 && (
                <div className="border-[#bfd4ef]/15 border-t pt-1 text-[8px] text-muted-foreground/55">
                  {revisionAffectedCount} order{revisionAffectedCount !== 1 ? "s" : ""} affected
                </div>
              )}
            </div>
          </div>

          {/* ── Rush Queue ─────────────────────────────────────── */}
          <div className="px-3 py-2">
            <SectionLabel label="Rush Queue" count={rushQueue.length} countClass="text-[#f2b90e]" />
            <div className="flex flex-col gap-0.5">
              {rushQueue.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "rounded border px-2 py-1 transition-colors",
                    s.id === selectedOrderId
                      ? "border-[#f2b90e]/30 bg-[#f2b90e]/[0.05]"
                      : "border-border/50 bg-muted/10",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-1.5">
                    <span
                      className={cn(
                        "font-mono text-[9px] tracking-wider",
                        s.id === selectedOrderId ? "text-[#f2b90e]" : "text-[#dbd5c5]",
                      )}
                    >
                      {s.id}
                    </span>
                    <span className="font-mono text-[8px] text-muted-foreground tabular-nums">{s.eta}</span>
                  </div>
                  <div className="truncate text-[9px] text-muted-foreground/70">{s.cargo}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pending Signatures ─────────────────────────────── */}
          {pendingSignatures.length > 0 && (
            <div className="px-3 py-2">
              <SectionLabel label="Pending Signatures" count={pendingSignatures.length} countClass="text-[#933614]" />
              <div className="flex flex-col gap-0.5">
                {pendingSignatures.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "border-[#d3410c]/40 border-l-2 py-1 pl-2 transition-colors",
                      s.id === selectedOrderId && "bg-[#d3410c]/[0.04]",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-1.5">
                      <span className="font-mono text-[#dbd5c5] text-[9px] tracking-wider">{s.id}</span>
                      <span className="font-mono text-[#d3410c] text-[8px]">⊘ unsigned</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground/60">{s.customer.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

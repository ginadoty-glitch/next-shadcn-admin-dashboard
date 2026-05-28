// Logistics operational data layer.
// Transport Orders are owned by shipment-data.ts.
// This module augments them with driver assignments, operational conditions,
// and callsheet revision state — the intelligence layer of the surface.

/**
 * Simulated production clock — Day 12, 07:23.
 *
 * Context: crew call was 06:30 (revised from 06:00 per R2 callsheet).
 * Camera block 1 setup underway. First shot scheduled 07:30.
 * A-Camera package (CI-01) and catering rig (CI-21) are in the critical window.
 *
 * Future: replace with a live `useProductionClock()` hook driven by Supabase
 * realtime or a production-schedule service.
 */
export const PRODUCTION_TIME = "07:23";

export type DriverStatus = "active" | "staged" | "standby" | "off-duty";

export type VehicleType = "3-ton" | "5-ton" | "10-ton" | "cube-van" | "van" | "sedan" | "low-loader" | "trailer";

export type DriverAssignment = {
  id: string;
  driverName: string;
  vehicle: string;
  vehicleType: VehicleType;
  phone: string;
  radioChannel: string;
  status: DriverStatus;
  linkedOrderId: string;
};

export type ConditionTier = "legal" | "blocker" | "attention" | "informational";

export type ConditionType =
  | "french-hours"
  | "permit-suspension"
  | "route-compromised"
  | "set-access-restricted"
  | "weather-hold"
  | "callsheet-revised"
  | "overnight-hold"
  | "rush-escalation"
  | "movement-conflict"
  | "actsafe-memo";

export type OperationalCondition = {
  id: string;
  type: ConditionType;
  tier: ConditionTier;
  title: string;
  description: string;
  affectedOrderIds: string[];
  timestamp: string;
  isActive: boolean;
};

export type CallsheetRevision = {
  ref: string;
  day: string;
  revision: string;
  issued: string;
  issuedBy: string;
  changes: string[];
  affectedDepts: string[];
};

// Driver assignments for all non-completed transport orders — Day 12.
// Linked to Transport Orders by linkedOrderId.
export const driverAssignments: DriverAssignment[] = [
  {
    id: "DA-2501",
    driverName: "Richie Stamos",
    vehicle: "YKW 4821",
    vehicleType: "cube-van",
    phone: "604-555-0182",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-01-2501",
  },
  {
    id: "DA-2502",
    driverName: "Pedro Alves",
    vehicle: "ZLP 9043",
    vehicleType: "cube-van",
    phone: "604-555-0219",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-02-2502",
  },
  {
    id: "DA-2504",
    driverName: "Marcus Webb",
    vehicle: "TQN 2485",
    vehicleType: "van",
    phone: "604-555-0337",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-04-2504",
  },
  {
    id: "DA-2505",
    driverName: "Lee Harrington",
    vehicle: "VHJ 6194",
    vehicleType: "3-ton",
    phone: "604-555-0408",
    radioChannel: "Ch. 3 — Transport",
    status: "staged",
    linkedOrderId: "CI-05-2505",
  },
  {
    id: "DA-2506",
    driverName: "Dennis Park",
    vehicle: "XBK 3827",
    vehicleType: "10-ton",
    phone: "604-555-0244",
    radioChannel: "Ch. 3 — Transport",
    status: "staged",
    linkedOrderId: "CI-06-2506",
  },
  {
    id: "DA-2507",
    driverName: "Alejandro Vega",
    vehicle: "Unit #7 — SPFX Van",
    vehicleType: "van",
    phone: "604-555-0571",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-07-2507",
  },
  {
    id: "DA-2508",
    driverName: "Nolan Kwon",
    vehicle: "PNW 5513",
    vehicleType: "cube-van",
    phone: "604-555-0619",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-08-2508",
  },
  {
    id: "DA-2509",
    driverName: "Tony Braun",
    vehicle: "BASE-10T-03",
    vehicleType: "10-ton",
    phone: "604-555-0724",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-09-2509",
  },
  {
    id: "DA-2511",
    driverName: "Shane Murillo",
    vehicle: "GTR 1492",
    vehicleType: "cube-van",
    phone: "604-555-0883",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-11-2511",
  },
  {
    id: "DA-2512",
    driverName: "Jasper Yuen",
    vehicle: "STV 6207",
    vehicleType: "5-ton",
    phone: "604-555-0946",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-12-2512",
  },
  {
    id: "DA-2513",
    driverName: "Bryce Holden",
    vehicle: "IT PROD-01",
    vehicleType: "van",
    phone: "604-555-0162",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-13-2513",
  },
  {
    id: "DA-2514",
    driverName: "Darren Lima",
    vehicle: "LKF 9851",
    vehicleType: "5-ton",
    phone: "604-555-0285",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-14-2514",
  },
  {
    id: "DA-2515",
    driverName: "Colt Meyers",
    vehicle: "ADV 2250",
    vehicleType: "sedan",
    phone: "604-555-0317",
    radioChannel: "Ch. 3 — Transport",
    status: "staged",
    linkedOrderId: "CI-15-2515",
  },
  {
    id: "DA-2516",
    driverName: "Frank Duarte",
    vehicle: "PV-1967STNG",
    vehicleType: "trailer",
    phone: "604-555-0452",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-16-2516",
  },
  {
    id: "DA-2517",
    driverName: "Dale Winfield",
    vehicle: "ZMV 4108",
    vehicleType: "5-ton",
    phone: "604-555-0538",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-17-2517",
  },
  {
    id: "DA-2519",
    driverName: "Chris Bauer",
    vehicle: "GEN-500KW-02",
    vehicleType: "low-loader",
    phone: "604-555-0691",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-19-2519",
  },
  {
    id: "DA-2520",
    driverName: "Convoy — Multi-driver",
    vehicle: "HW-UNIT-04",
    vehicleType: "trailer",
    phone: "604-555-0774",
    radioChannel: "Ch. 3 — Transport",
    status: "staged",
    linkedOrderId: "CI-20-2520",
  },
  {
    id: "DA-2521",
    driverName: "Rick Sato",
    vehicle: "CFT-RIG-01",
    vehicleType: "cube-van",
    phone: "604-555-0829",
    radioChannel: "Ch. 3 — Transport",
    status: "active",
    linkedOrderId: "CI-21-2521",
  },
  {
    id: "DA-2522",
    driverName: "Bobby Mak",
    vehicle: "GRP 6639",
    vehicleType: "3-ton",
    phone: "604-555-0943",
    radioChannel: "Ch. 3 — Transport",
    status: "standby",
    linkedOrderId: "CI-22-2522",
  },
  {
    id: "DA-2523",
    driverName: "Earl Sorensen",
    vehicle: "LCN 4411",
    vehicleType: "van",
    phone: "604-555-0156",
    radioChannel: "Ch. 3 — Transport",
    status: "staged",
    linkedOrderId: "CI-23-2523",
  },
];

// Active operational conditions — Day 12.
// Sorted at display time by tier severity (blocker > attention > informational).
export const operationalConditions: OperationalCondition[] = [
  {
    id: "OC-001",
    type: "set-access-restricted",
    tier: "blocker",
    title: "Set Access Restricted — PNE Grounds",
    description:
      "Fire Marshal permit outstanding. SPFX wetdown rig blocked from entering PNE Grounds. Clearance ETA unknown — Locations confirming with City Fire Marshal.",
    affectedOrderIds: ["CI-07-2507"],
    timestamp: "10:30",
    isActive: true,
  },
  {
    id: "OC-002",
    type: "permit-suspension",
    tier: "blocker",
    title: "Permit Pending — Langley Water Access",
    description:
      "City of Langley water access permit decision delayed beyond 14:00. Wetdown dispatch on hold until clearance received.",
    affectedOrderIds: ["CI-23-2523"],
    timestamp: "14:30",
    isActive: true,
  },
  {
    id: "OC-003",
    type: "route-compromised",
    tier: "attention",
    title: "Route Compromised — Hwy 99 Bridge",
    description:
      "Weight restriction on Hwy 99 blocks CI-19 low-loader transit. Rerouting confirmed via Trans-Canada N. Extended ETA — Squamish crew on overnight standby.",
    affectedOrderIds: ["CI-19-2519"],
    timestamp: "18:30",
    isActive: true,
  },
  {
    id: "OC-004",
    type: "weather-hold",
    tier: "attention",
    title: "Weather Hold — Hwy 1 E Fog Advisory",
    description:
      "Fog advisory Hwy 1 eastbound. CI-12 safety equipment rerouted via Hwy 7 Mission corridor. Stunts Coordinator advised — safety gear needed by 11:00.",
    affectedOrderIds: ["CI-12-2512"],
    timestamp: "07:30",
    isActive: true,
  },
  {
    id: "OC-005",
    type: "movement-conflict",
    tier: "attention",
    title: "Movement Conflict — Steveston Gate",
    description:
      "Dolly and 100ft track staging conflicts with picture vehicle turnaround at Steveston. CI-22 on hold — Locations resolving. Driver holding at Stage 4.",
    affectedOrderIds: ["CI-22-2522"],
    timestamp: "07:30",
    isActive: true,
  },
  {
    id: "OC-006",
    type: "overnight-hold",
    tier: "informational",
    title: "Overnight Hold — CI-04, CI-14",
    description:
      "Hero Costume Rail and Hero Set Dressing on overnight hold. Unsigned CIs outstanding on both. Retry 07:00 — drivers on standby.",
    affectedOrderIds: ["CI-04-2504", "CI-14-2514"],
    timestamp: "18:15",
    isActive: true,
  },
  {
    id: "OC-007",
    type: "callsheet-revised",
    tier: "informational",
    title: "Revised Call Sheet — Day 12 R2",
    description:
      "Call Sheet Day 12 R2 issued 02:30. French Hours in effect from 18:00. Updated sides distributed to all HODs via CI-15 delivery run.",
    affectedOrderIds: ["CI-01-2501", "CI-05-2505", "CI-06-2506", "CI-15-2515", "CI-20-2520"],
    timestamp: "02:30",
    isActive: true,
  },
];

export const activeCallsheetRevision: CallsheetRevision = {
  ref: "CS-D12-R2",
  day: "Day 12",
  revision: "R2",
  issued: "May 27, 02:30",
  issuedBy: "1st AD — Production Office",
  changes: [
    "Crew call pushed 30 min — 06:30 revised",
    "Scenes 14A/14B — Cloverdale location confirmed",
    "SPFX wetdown added — pending Fire Marshal clearance",
    "French Hours in effect from 18:00",
  ],
  affectedDepts: ["All Departments"],
};

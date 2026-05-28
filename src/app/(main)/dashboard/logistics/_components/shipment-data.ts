import {
  AlertTriangleIcon,
  ArrowUp,
  Ban,
  CheckCircle2,
  Droplets,
  Forklift,
  type LucideIcon,
  Package,
  PackageCheck,
  PenLine,
  ShieldCheck,
  Star,
  Thermometer,
  Truck,
} from "lucide-react";

export type ShipmentStatus =
  | "Scheduled"
  | "En Route"
  | "Dispatched"
  | "Completed"
  | "Held — Delayed"
  | "On Hold"
  | "Awaiting Clearance";

export type TransportMode = "land" | "air" | "sea";
export type RouteType = "road" | "flight" | "ship";
export type CustomerTier = "Priority" | "Standard" | "Non-priority";
export type Urgency = "priority" | "watch" | "normal";

export type GeoCoordinate = [longitude: number, latitude: number];

export type ShipmentLocation = {
  coordinates: GeoCoordinate;
  display: string;
  country: string;
  countryCode: string;
};

export type ShipmentCustomer = {
  name: string;
  initials: string;
  id: string;
  tier: CustomerTier;
  tierLabel: string;
};

export type HandlingTag = {
  label: string;
  icon: LucideIcon;
};

export type ShipmentHandling = {
  label: string;
  note: string;
  tags: HandlingTag[];
};

export type RouteWaypoint = {
  location: string;
  time: string;
  note: string;
  state: "completed" | "active" | "pending" | "restricted";
};

export type ManifestItem = {
  description: string;
  qty: string;
  dept: string;
  note?: string;
};

export type ProductionLogEntry = {
  time: string;
  from: string;
  message: string;
  type: "dispatch" | "update" | "alert" | "confirmation";
};

export type AttachedDocument = {
  name: string;
  ref: string;
  type: "call-sheet" | "movement-order" | "permit" | "ci" | "revision";
  issued: string;
};

export type Shipment = {
  id: string;
  customer: ShipmentCustomer;
  origin: ShipmentLocation;
  destination: ShipmentLocation;
  cargo: string;
  handling: ShipmentHandling;
  weight: string;
  eta: string;
  etaMeta: string;
  status: ShipmentStatus;
  progress: number;
  mode: TransportMode;
  routeType: RouteType;
  transportNumber: string;
  operationalNote: string;
  urgency: Urgency;
  route: RouteWaypoint[];
  manifest: ManifestItem[];
  productionLog: ProductionLogEntry[];
  documents: AttachedDocument[];
};

// Production locations — Greater Vancouver area
const bridgeStudios: ShipmentLocation = {
  display: "Stage 4 — Bridge Studios",
  country: "Burnaby",
  countryCode: "CA",
  coordinates: [-122.976, 49.2463],
};
const surreyUnit: ShipmentLocation = {
  display: "Unit Base — 192nd Ave",
  country: "Surrey",
  countryCode: "CA",
  coordinates: [-122.8073, 49.1193],
};
const tilbury: ShipmentLocation = {
  display: "Art Dept Warehouse — Tilbury",
  country: "Delta",
  countryCode: "CA",
  coordinates: [-123.0583, 49.1461],
};
const productionOffice: ShipmentLocation = {
  display: "Production Office — Burrard Place",
  country: "Vancouver",
  countryCode: "CA",
  coordinates: [-123.1207, 49.2827],
};
const cloverdaleSet: ShipmentLocation = {
  display: "Cloverdale Market — Set",
  country: "Surrey",
  countryCode: "CA",
  coordinates: [-122.7397, 49.1093],
};
const fortLangley: ShipmentLocation = {
  display: "Fort Langley — Location",
  country: "Langley",
  countryCode: "CA",
  coordinates: [-122.5779, 49.1668],
};
const steveston: ShipmentLocation = {
  display: "Steveston Cannery Row",
  country: "Richmond",
  countryCode: "CA",
  coordinates: [-123.1854, 49.1267],
};
const northShore: ShipmentLocation = {
  display: "North Shore — Unit Base",
  country: "N. Vancouver",
  countryCode: "CA",
  coordinates: [-123.0735, 49.3198],
};
const coquitlam: ShipmentLocation = {
  display: "Coquitlam Staging Yard",
  country: "Coquitlam",
  countryCode: "CA",
  coordinates: [-122.803, 49.2842],
};
const pneGrounds: ShipmentLocation = {
  display: "PNE Grounds — E. Hastings",
  country: "Vancouver",
  countryCode: "CA",
  coordinates: [-123.0463, 49.2804],
};
const squamish: ShipmentLocation = {
  display: "Brackendale — Squamish",
  country: "Squamish",
  countryCode: "CA",
  coordinates: [-123.1556, 49.7016],
};
const langleyStudios: ShipmentLocation = {
  display: "Langley Studios — 88th Ave",
  country: "Langley",
  countryCode: "CA",
  coordinates: [-122.6636, 49.1042],
};

const departmentAccounts = {
  cameraA: {
    name: "Camera Dept",
    initials: "CA",
    id: "CI-DEPT-0001",
    tier: "Priority",
    tierLabel: "Primary unit — active this shoot day",
  },
  props: {
    name: "Props",
    initials: "PR",
    id: "CI-DEPT-0002",
    tier: "Standard",
    tierLabel: "Supporting unit — scheduled this week",
  },
  setDec: {
    name: "Set Dec",
    initials: "SD",
    id: "CI-DEPT-0003",
    tier: "Priority",
    tierLabel: "Primary unit — active this shoot day",
  },
  wardrobe: {
    name: "Wardrobe",
    initials: "WD",
    id: "CI-DEPT-0004",
    tier: "Standard",
    tierLabel: "Supporting unit — scheduled this week",
  },
  artDept: {
    name: "Art Dept",
    initials: "AT",
    id: "CI-DEPT-0005",
    tier: "Priority",
    tierLabel: "Primary unit — active this shoot day",
  },
  transport: {
    name: "Transport Dept",
    initials: "TR",
    id: "CI-DEPT-0006",
    tier: "Standard",
    tierLabel: "Supporting unit — scheduled this week",
  },
  gripElectric: {
    name: "Grip + Electric",
    initials: "GE",
    id: "CI-DEPT-0007",
    tier: "Standard",
    tierLabel: "Supporting unit — scheduled this week",
  },
  locations: {
    name: "Locations",
    initials: "LC",
    id: "CI-DEPT-0008",
    tier: "Standard",
    tierLabel: "Supporting unit — scheduled this week",
  },
  production: {
    name: "Production Office",
    initials: "PO",
    id: "CI-DEPT-0009",
    tier: "Priority",
    tierLabel: "Primary unit — active this shoot day",
  },
  spfx: {
    name: "SPFX",
    initials: "SX",
    id: "CI-DEPT-0010",
    tier: "Priority",
    tierLabel: "Primary unit — active this shoot day",
  },
  stunts: {
    name: "Stunts",
    initials: "SU",
    id: "CI-DEPT-0011",
    tier: "Standard",
    tierLabel: "Supporting unit — scheduled this week",
  },
  adDept: {
    name: "AD Dept",
    initials: "1A",
    id: "CI-DEPT-0012",
    tier: "Non-priority",
    tierLabel: "2nd unit / standing by",
  },
} satisfies Record<string, ShipmentCustomer>;

export const shipments: Shipment[] = [
  {
    id: "CI-01-2501",
    customer: departmentAccounts.cameraA,
    origin: bridgeStudios,
    destination: surreyUnit,
    cargo: "A-Camera Package",
    handling: {
      label: "Camera optics — fragile",
      note: "Keep lens cases padded and upright. Do not stack freight on optics cases.",
      tags: [
        { label: "Do not stack", icon: Ban },
        { label: "Keep upright", icon: ArrowUp },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "850 kg",
    eta: "06:00 AM",
    etaMeta: "Crew Call",
    status: "En Route",
    progress: 65,
    mode: "land",
    routeType: "road",
    transportNumber: "YKW 4821",
    operationalNote: "Active unit movement · Driver checked in 05:40 — ETA crew call confirmed",
    urgency: "priority",
    route: [
      {
        location: "Stage 4 — Bridge Studios",
        time: "05:20",
        note: "Vehicle loaded and departed on schedule",
        state: "completed",
      },
      {
        location: "Lougheed Hwy E — Burnaby",
        time: "05:32",
        note: "No delays — merging onto Trans-Canada E",
        state: "completed",
      },
      {
        location: "176th Ave S interchange",
        time: "05:50",
        note: "En route to unit base — ETA holding",
        state: "active",
      },
      {
        location: "Unit Base — 192nd Ave, Surrey",
        time: "06:00 (Crew Call)",
        note: "Staged arrival — check in with Grip captain",
        state: "pending",
      },
    ],
    manifest: [
      { description: "ARRI ALEXA 35 Body", qty: "1", dept: "Camera Dept", note: "Case 1A — padded and sealed" },
      { description: "Camera Magazines 256GB", qty: "4", dept: "Camera Dept", note: "Case 1B — labeled by mag number" },
      { description: "Follow Focus Unit + Rods", qty: "1 set", dept: "Camera Dept", note: "Case 2A" },
      { description: 'SmallHD 7" Monitor', qty: "2", dept: "Camera Dept", note: "Transit bag — bubble wrapped" },
      { description: "Battery Kit + Charger", qty: "1", dept: "Camera Dept", note: "Case 3A — charged" },
    ],
    productionLog: [
      {
        time: "05:10",
        from: "Transport Dispatch",
        message: "CI-01-2501 staged. Driver check-in confirmed. YKW 4821.",
        type: "dispatch",
      },
      {
        time: "05:20",
        from: "Driver · YKW 4821",
        message: "Departed Stage 4. En route via Trans-Canada E.",
        type: "update",
      },
      {
        time: "05:35",
        from: "Driver · YKW 4821",
        message: "Trans-Canada clear. No delays. ETA 06:00 confirmed.",
        type: "update",
      },
    ],
    documents: [
      { name: "Movement Order — Day 12", ref: "MO-2501-D12", type: "movement-order", issued: "May 27, 04:00" },
      { name: "Revised Call Sheet — Day 12 R2", ref: "CS-D12-R2", type: "call-sheet", issued: "May 27, 02:30" },
      { name: "CI Form — Signed", ref: "CI-01-2501", type: "ci", issued: "May 26, 18:15" },
    ],
  },
  {
    id: "CI-02-2502",
    customer: departmentAccounts.props,
    origin: tilbury,
    destination: cloverdaleSet,
    cargo: "Hero Props — Scene 14A",
    handling: {
      label: "Hero props — sealed",
      note: "Props sealed — do not unwrap until onset. Return empties to Props after scene.",
      tags: [
        { label: "Do not open seal", icon: ShieldCheck },
        { label: "Return after use", icon: Package },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "320 kg",
    eta: "14:00",
    etaMeta: "Revised window",
    status: "Held — Delayed",
    progress: 42,
    mode: "land",
    routeType: "road",
    transportNumber: "ZLP 9043",
    operationalNote: "Awaiting Props dept release · Revised pickup window 14:00–16:00 — hero props unsigned",
    urgency: "watch",
    route: [
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "14:00 est.",
        note: "Departure on hold — awaiting Props dept release",
        state: "restricted",
      },
      {
        location: "Deltaport Way → Hwy 91 E",
        time: "14:20 est.",
        note: "Route confirmed — no road restrictions",
        state: "pending",
      },
      {
        location: "Cloverdale Market — Set",
        time: "15:00 est.",
        note: "Delivery window 15:00–16:00 — Scene 14A call",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Hero Pistol (rubber — non-firing)",
        qty: "1",
        dept: "Props",
        note: "Do not unwrap until onset — sealed evidence bag",
      },
      { description: "Period Wallet + Contents", qty: "1 set", dept: "Props", note: "Evidence bag #14A-01" },
      { description: "Bar Glass (hero dressing)", qty: "4", dept: "Props", note: "Padded box — wrapped individually" },
      { description: "Newspaper (period-correct print)", qty: "6", dept: "Props", note: "Flat box — do not bend" },
    ],
    productionLog: [
      {
        time: "10:30",
        from: "Transport Dispatch",
        message: "CI-02-2502 staged. Awaiting Props dept release.",
        type: "dispatch",
      },
      {
        time: "12:15",
        from: "Props Dept",
        message: "Release delayed. Hero props for Scene 14A not signed off. ETA 14:00.",
        type: "alert",
      },
      {
        time: "13:45",
        from: "Props Dept",
        message: "Revised pickup window issued — 14:00–16:00. Confirming with driver.",
        type: "update",
      },
    ],
    documents: [
      { name: "CI Form — Awaiting Props Signature", ref: "CI-02-2502", type: "ci", issued: "May 27, 10:00" },
      { name: "Movement Order — Pending Release", ref: "MO-2502-D12", type: "movement-order", issued: "May 27, 10:30" },
      { name: "Props Manifest — Scene 14A", ref: "PM-14A-2502", type: "revision", issued: "May 26, 22:00" },
    ],
  },
  {
    id: "CI-03-2503",
    customer: departmentAccounts.setDec,
    origin: tilbury,
    destination: fortLangley,
    cargo: "Period Furniture (Dining Room)",
    handling: {
      label: "Antique set dressing — fragile",
      note: "Blanket-wrap all pieces. No stacking on upholstered surfaces.",
      tags: [
        { label: "Do not stack", icon: Ban },
        { label: "Two-person lift", icon: Truck },
        { label: "Blanket wrap", icon: Package },
      ],
    },
    weight: "2,400 kg",
    eta: "09:15 AM",
    etaMeta: "Delivered Yest.",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "RMB 7612",
    operationalNote: "Transport wrapped · Returns signed off by Set Dec — all pieces logged to Tilbury",
    urgency: "normal",
    route: [
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "08:00",
        note: "Loaded and departed on schedule",
        state: "completed",
      },
      {
        location: "Hwy 91 E → Hwy 1 E — Abbotsford",
        time: "08:22",
        note: "Clear run eastbound — no delays",
        state: "completed",
      },
      {
        location: "Fort Langley — Location Gate",
        time: "09:04",
        note: "Received by Set Dec — all pieces accounted for",
        state: "completed",
      },
      {
        location: "Return to Tilbury",
        time: "17:30",
        note: "Wrap load complete — returned same day",
        state: "completed",
      },
    ],
    manifest: [
      { description: "Victorian Dining Table", qty: "1", dept: "Set Dec", note: "Blanket-wrapped — 2-person lift" },
      { description: "Dining Chairs (period)", qty: "6", dept: "Set Dec", note: "Stacked in pairs — secured" },
      { description: "Sideboard (hero)", qty: "1", dept: "Set Dec", note: "Blanket-wrapped — fragile legs" },
      { description: "Candlesticks (dressing)", qty: "8", dept: "Set Dec", note: "Padded box — individually wrapped" },
    ],
    productionLog: [
      {
        time: "08:00",
        from: "Transport Dispatch",
        message: "CI-03-2503 departed Tilbury on schedule.",
        type: "dispatch",
      },
      {
        time: "09:05",
        from: "Driver · RMB 7612",
        message: "Arrived Fort Langley. Received by Set Dec. All pieces accounted for.",
        type: "confirmation",
      },
      {
        time: "17:35",
        from: "Transport Dispatch",
        message: "Return load complete. Transport wrapped. Signed off.",
        type: "confirmation",
      },
    ],
    documents: [
      {
        name: "Movement Order — Day 11 (Completed)",
        ref: "MO-2503-D11",
        type: "movement-order",
        issued: "May 26, 18:00",
      },
      { name: "Set Dec Delivery Receipt — Signed", ref: "SDR-2503", type: "ci", issued: "May 27, 09:10" },
      { name: "Return Manifest — Signed", ref: "RM-2503", type: "revision", issued: "May 27, 17:40" },
    ],
  },
  {
    id: "CI-04-2504",
    customer: departmentAccounts.production,
    origin: productionOffice,
    destination: bridgeStudios,
    cargo: "Hero Costume Rail — Day 12",
    handling: {
      label: "Wardrobe — priority delivery",
      note: "Rail must arrive before BG call. Do not mix with background costume bags.",
      tags: [
        { label: "Priority delivery", icon: Star },
        { label: "Keep dry", icon: Droplets },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "280 kg",
    eta: "Holding",
    etaMeta: "Awaiting AD",
    status: "On Hold",
    progress: 28,
    mode: "land",
    routeType: "road",
    transportNumber: "TQN 2485",
    operationalNote: "Overnight hold · Awaiting signed CI from Wardrobe dept head — driver on standby 07:00",
    urgency: "watch",
    route: [
      {
        location: "Production Office — Burrard Place",
        time: "TBD",
        note: "Departure pending CI signature — Wardrobe unreachable",
        state: "restricted",
      },
      {
        location: "Burrard St → Trans-Canada E",
        time: "TBD",
        note: "Route clear — awaiting authorization",
        state: "pending",
      },
      {
        location: "Stage 4 — Bridge Studios",
        time: "TBD",
        note: "Wardrobe dept on standby for receiving",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Hero Suit (Day 12 — lead)",
        qty: "1 complete",
        dept: "Wardrobe",
        note: "Suit bag #D12-01 — signed continuity tag",
      },
      { description: "Hero Shirt + Tie (changes)", qty: "3", dept: "Wardrobe", note: "Suit bags #D12-02 through -04" },
      { description: "Hero Shoes (principal)", qty: "2 pairs", dept: "Wardrobe", note: "Shoe boxes — labeled by size" },
      {
        description: "Accessories Kit (Day 12)",
        qty: "1",
        dept: "Wardrobe",
        note: "Tagged kit bag — continuity tagged",
      },
    ],
    productionLog: [
      {
        time: "16:30",
        from: "Transport Dispatch",
        message: "CI-04-2504 staged. Awaiting Wardrobe dept head CI signature.",
        type: "dispatch",
      },
      {
        time: "18:15",
        from: "Production Office",
        message: "Overnight hold confirmed. Wardrobe dept unreachable — retry 07:00.",
        type: "alert",
      },
      {
        time: "07:02",
        from: "Production Office",
        message: "Retry initiated. CI signature still outstanding. Driver on standby.",
        type: "alert",
      },
    ],
    documents: [
      { name: "CI Form — Unsigned (Pending)", ref: "CI-04-2504", type: "ci", issued: "May 26, 16:00" },
      { name: "Movement Order — Draft", ref: "MO-2504-D12-DFT", type: "movement-order", issued: "May 26, 16:30" },
      { name: "Costume Manifest — Day 12", ref: "WD-MAN-D12", type: "revision", issued: "May 26, 20:00" },
    ],
  },
  {
    id: "CI-05-2505",
    customer: departmentAccounts.gripElectric,
    origin: bridgeStudios,
    destination: steveston,
    cargo: "3-Ton Lighting Package",
    handling: {
      label: "Heavy electrical load",
      note: "Forklift only for 3-ton. Confirm staging area with Locations before unload.",
      tags: [
        { label: "Forklift only", icon: Forklift },
        { label: "Confirm staging", icon: CheckCircle2 },
        { label: "Secure load", icon: ShieldCheck },
      ],
    },
    weight: "3,200 kg",
    eta: "09:30 AM",
    etaMeta: "Friday",
    status: "Scheduled",
    progress: 12,
    mode: "land",
    routeType: "road",
    transportNumber: "VHJ 6194",
    operationalNote: "Lockup active at Steveston · Staging area confirmed Gate 3 — coordinate arrival with Locations",
    urgency: "normal",
    route: [
      {
        location: "Stage 4 — Bridge Studios",
        time: "09:30",
        note: "3-Ton loading confirmed — departure on schedule",
        state: "pending",
      },
      {
        location: "Lougheed → Knight St Bridge → SW Marine Dr",
        time: "10:10",
        note: "Route confirmed — no road restrictions",
        state: "pending",
      },
      {
        location: "Steveston Cannery Row — Gate 3",
        time: "10:45",
        note: "Lockup active — coordinate arrival with Locations before unload",
        state: "pending",
      },
    ],
    manifest: [
      { description: "2.5K HMI Heads", qty: "3", dept: "Grip + Electric", note: "Padded flight cases" },
      { description: "Condor + Ballast", qty: "1", dept: "Grip + Electric", note: "Secured — do not tip" },
      { description: "Distro Box 400A", qty: "2", dept: "Grip + Electric", note: "Cable box — secured" },
      { description: "Cable Bundles (100ft)", qty: "6", dept: "Grip + Electric", note: "On truck bed — strapped" },
    ],
    productionLog: [
      {
        time: "07:00",
        from: "Transport Dispatch",
        message: "CI-05-2505 logged. 3-Ton loading confirmed for 09:30 departure.",
        type: "dispatch",
      },
      {
        time: "08:45",
        from: "Grip Dept",
        message: "3-Ton loaded. Condor secured. Cable bundles strapped.",
        type: "update",
      },
      {
        time: "09:00",
        from: "Locations",
        message: "Lockup active at Steveston — staging area confirmed Gate 3.",
        type: "confirmation",
      },
    ],
    documents: [
      {
        name: "Movement Order — Steveston Pre-light",
        ref: "MO-2505-D12",
        type: "movement-order",
        issued: "May 27, 06:00",
      },
      { name: "Call Sheet — Day 12 R2", ref: "CS-D12-R2", type: "call-sheet", issued: "May 27, 02:30" },
      { name: "Lockup Permit — Steveston Cannery", ref: "LOCK-2505", type: "permit", issued: "May 26, 14:00" },
    ],
  },
  {
    id: "CI-06-2506",
    customer: departmentAccounts.artDept,
    origin: langleyStudios,
    destination: surreyUnit,
    cargo: "Construction Materials — Set 4",
    handling: {
      label: "Heavy bulk load",
      note: "Lumber and hardware on flatbed. Secure per BCMV transport regs.",
      tags: [
        { label: "Forklift only", icon: Forklift },
        { label: "Secure load", icon: ShieldCheck },
        { label: "Do not tip", icon: Ban },
      ],
    },
    weight: "8,400 kg",
    eta: "17:00",
    etaMeta: "Locked window",
    status: "Scheduled",
    progress: 18,
    mode: "land",
    routeType: "road",
    transportNumber: "XBK 3827",
    operationalNote: "Priority movement · Locked dispatch window 15:40–17:00 — Set 4 build crew on standby",
    urgency: "priority",
    route: [
      {
        location: "Langley Studios — 88th Ave",
        time: "15:40",
        note: "Priority dispatch — window 15:40 hard",
        state: "pending",
      },
      {
        location: "88th Ave → 200th St → Trans-Canada W",
        time: "16:05",
        note: "Route confirmed — no restrictions",
        state: "pending",
      },
      {
        location: "Unit Base — 192nd Ave, Surrey",
        time: "17:00",
        note: "Set Dec and Art Dept crew on standby for unload",
        state: "pending",
      },
    ],
    manifest: [
      { description: "Dimensional Lumber (2×6×12)", qty: "120 pcs", dept: "Art Dept", note: "Flatbed — strapped" },
      { description: 'Plywood Sheets (¾")', qty: "40 sheets", dept: "Art Dept", note: "Stacked flat — secured" },
      { description: "Hardware Kit (framing)", qty: "1", dept: "Art Dept", note: "Marked bin" },
      { description: "Paint — Base Coat", qty: "24 gal", dept: "Art Dept", note: "Sealed — upright" },
    ],
    productionLog: [
      {
        time: "14:00",
        from: "Transport Dispatch",
        message: "CI-06-2506 logged. Priority movement — 15:40 hard departure window.",
        type: "dispatch",
      },
      {
        time: "15:00",
        from: "Art Dept",
        message: "Construction materials loaded. Load secured — forklift cleared.",
        type: "update",
      },
      {
        time: "15:35",
        from: "Transport Dispatch",
        message: "Departure window confirmed. All crew briefed. Driver standing by.",
        type: "confirmation",
      },
    ],
    documents: [
      { name: "Movement Order — Set 4 Build Day", ref: "MO-2506-D12", type: "movement-order", issued: "May 27, 08:00" },
      { name: "Art Dept Materials Manifest", ref: "ART-MAN-2506", type: "revision", issued: "May 27, 07:30" },
      { name: "Call Sheet — Day 12 R2", ref: "CS-D12-R2", type: "call-sheet", issued: "May 27, 02:30" },
    ],
  },
  {
    id: "CI-07-2507",
    customer: departmentAccounts.spfx,
    origin: northShore,
    destination: pneGrounds,
    cargo: "SPFX Wetdown Rig",
    handling: {
      label: "SPFX equipment — coordinate arrival",
      note: "Confirm water supply and drain access at unit base before delivery.",
      tags: [
        { label: "Coordinate arrival", icon: AlertTriangleIcon },
        { label: "Confirm water access", icon: Droplets },
        { label: "Restricted area", icon: ShieldCheck },
      ],
    },
    weight: "1,100 kg",
    eta: "Pending",
    etaMeta: "Clearance",
    status: "Awaiting Clearance",
    progress: 33,
    mode: "land",
    routeType: "road",
    transportNumber: "Unit #7 — SPFX Van",
    operationalNote: "Set access restricted · Fire Marshal permit outstanding — departure blocked pending PNE sign-off",
    urgency: "watch",
    route: [
      {
        location: "North Shore — Unit Base",
        time: "TBD",
        note: "Departure blocked — set access restricted at PNE",
        state: "restricted",
      },
      {
        location: "Lions Gate Bridge → Georgia St → E Hastings",
        time: "TBD",
        note: "Route clear — awaiting clearance authorization",
        state: "pending",
      },
      {
        location: "PNE Grounds — E. Hastings",
        time: "TBD",
        note: "Fire Marshal inspection required before SPFX staging",
        state: "restricted",
      },
    ],
    manifest: [
      { description: "Pump Unit (12,000 GPH)", qty: "1", dept: "SPFX", note: "Secured on truck — confirmed" },
      { description: "Supply Hose (100ft)", qty: "4", dept: "SPFX", note: "Rolled — truck bed" },
      { description: "Distribution Manifold", qty: "1", dept: "SPFX", note: "Padded — fragile fittings" },
      { description: "Control Box + Cable", qty: "1", dept: "SPFX", note: "Hardcase — sealed" },
    ],
    productionLog: [
      {
        time: "09:00",
        from: "Transport Dispatch",
        message: "CI-07-2507 staged. SPFX rig loaded — awaiting set clearance.",
        type: "dispatch",
      },
      {
        time: "10:30",
        from: "SPFX Coordinator",
        message: "Fire Marshal inspection required at PNE before staging. Permit outstanding.",
        type: "alert",
      },
      {
        time: "11:15",
        from: "Locations",
        message: "Set access restricted. Confirming with City Fire Marshal — clearance ETA unknown.",
        type: "alert",
      },
    ],
    documents: [
      {
        name: "SPFX Staging Permit — PNE (Pending)",
        ref: "SPFX-PERM-2507",
        type: "permit",
        issued: "Pending — Not Issued",
      },
      { name: "CI Form — Signed", ref: "CI-07-2507", type: "ci", issued: "May 27, 08:00" },
      { name: "Fire Marshal Checklist", ref: "FM-PNE-2507", type: "permit", issued: "Pending — Not Issued" },
    ],
  },
  {
    id: "CI-08-2508",
    customer: departmentAccounts.wardrobe,
    origin: tilbury,
    destination: coquitlam,
    cargo: "BG Costume Bags — 200 pcs",
    handling: {
      label: "Background wardrobe — sorted by set",
      note: "Bags sorted by set number. Do not mix sets. Call Wardrobe 30 min before arrival.",
      tags: [
        { label: "Keep dry", icon: Droplets },
        { label: "Call before arrival", icon: Truck },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "520 kg",
    eta: "14:15",
    etaMeta: "Today",
    status: "Dispatched",
    progress: 88,
    mode: "land",
    routeType: "road",
    transportNumber: "PNW 5513",
    operationalNote: "Equipment handoff pending · Receiver confirmed at Coquitlam Gate 3 — final mile",
    urgency: "normal",
    route: [
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "13:00",
        note: "200 costume bags loaded — sorted by set number",
        state: "completed",
      },
      {
        location: "Hwy 91 E → Hwy 1 E → Mary Hill Bypass",
        time: "13:30",
        note: "No delays — clear run through Port Mann",
        state: "completed",
      },
      {
        location: "Coquitlam Staging Yard — Gate 3",
        time: "14:15",
        note: "Receiver confirmed — handoff in progress",
        state: "active",
      },
    ],
    manifest: [
      {
        description: "BG Costume Sets — Set 14A",
        qty: "80 bags",
        dept: "Wardrobe",
        note: "Tagged by BG number — sorted",
      },
      { description: "BG Costume Sets — Set 14B", qty: "60 bags", dept: "Wardrobe", note: "Tagged — sorted" },
      { description: "BG Costume Sets — Scene 14C", qty: "60 bags", dept: "Wardrobe", note: "Tagged — sorted" },
      { description: "Wardrobe Tags + Pins Kit", qty: "1", dept: "Wardrobe", note: "Kit bag — separate from costumes" },
    ],
    productionLog: [
      {
        time: "13:00",
        from: "Transport Dispatch",
        message: "CI-08-2508 departed Tilbury. 200 BG bags — sorted by set.",
        type: "dispatch",
      },
      {
        time: "13:30",
        from: "Driver · PNW 5513",
        message: "Port Mann bridge clear. No delays. ETA 14:15 confirmed.",
        type: "update",
      },
      {
        time: "14:10",
        from: "Coquitlam Receiver",
        message: "Receiver at Gate 3. Ready for handoff.",
        type: "confirmation",
      },
    ],
    documents: [
      { name: "Movement Order — BG Wardrobe", ref: "MO-2508-D12", type: "movement-order", issued: "May 27, 11:00" },
      { name: "BG Costume Manifest (200 pcs)", ref: "WD-BG-2508", type: "revision", issued: "May 27, 10:30" },
      { name: "CI Form — Signed", ref: "CI-08-2508", type: "ci", issued: "May 27, 11:30" },
    ],
  },
  {
    id: "CI-09-2509",
    customer: departmentAccounts.transport,
    origin: fortLangley,
    destination: surreyUnit,
    cargo: "Base Camp — 10-Ton",
    handling: {
      label: "Base camp staging — heavy vehicle",
      note: "Confirm unit base layout with Transport Coordinator before parking.",
      tags: [
        { label: "Confirm staging", icon: CheckCircle2 },
        { label: "Heavy vehicle", icon: Forklift },
        { label: "Coordinator approval", icon: PenLine },
      ],
    },
    weight: "4,800 kg",
    eta: "17:50",
    etaMeta: "Revised",
    status: "En Route",
    progress: 54,
    mode: "land",
    routeType: "road",
    transportNumber: "BASE-10T-03",
    operationalNote: "Late dept response delayed dispatch 45 min · Revised ETA 17:50 issued to 2nd AD",
    urgency: "watch",
    route: [
      {
        location: "Fort Langley — Location Gate",
        time: "16:45",
        note: "45-min delay — late Stunts dept response",
        state: "completed",
      },
      {
        location: "Glover Rd → 200th St → Trans-Canada W",
        time: "17:10",
        note: "En route — revised ETA issued to 2nd AD",
        state: "active",
      },
      {
        location: "Unit Base — 192nd Ave, Surrey",
        time: "17:50 (Revised)",
        note: "Base camp crew on standby for arrival",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "10-Ton Base Camp Truck",
        qty: "1 vehicle",
        dept: "Transport Dept",
        note: "Low-loader — coordinated arrival required",
      },
      { description: "Camp Chair + Table Setup", qty: "1 set", dept: "Transport Dept", note: "Packed in truck bed" },
      { description: "Generator (basecamp — small)", qty: "1", dept: "Transport Dept", note: "Secured — do not tip" },
    ],
    productionLog: [
      {
        time: "15:45",
        from: "Transport Dispatch",
        message: "CI-09-2509 delayed — Stunts dept response 45 min late. Revised ETA issued.",
        type: "alert",
      },
      {
        time: "16:15",
        from: "2nd AD",
        message: "Revised ETA 17:50 acknowledged. Base camp crew aware.",
        type: "confirmation",
      },
      {
        time: "17:10",
        from: "Driver · BASE-10T-03",
        message: "En route — Trans-Canada W clear. ETA 17:50 on schedule.",
        type: "update",
      },
    ],
    documents: [
      { name: "Movement Order — Base Camp Move", ref: "MO-2509-D12", type: "movement-order", issued: "May 27, 14:00" },
      {
        name: "Revised Movement Order — Late Dispatch",
        ref: "MO-2509-REV",
        type: "movement-order",
        issued: "May 27, 16:00",
      },
      { name: "CI Form — Signed", ref: "CI-09-2509", type: "ci", issued: "May 27, 14:30" },
    ],
  },
  {
    id: "CI-10-2510",
    customer: departmentAccounts.cameraA,
    origin: bridgeStudios,
    destination: squamish,
    cargo: "Lens Kit — Primes + Zooms",
    handling: {
      label: "Precision optics — temperature sensitive",
      note: "Primes and zooms in hard cases. Keep temp-controlled. Do not leave in direct sun.",
      tags: [
        { label: "Temperature sensitive", icon: Thermometer },
        { label: "Do not stack", icon: Ban },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "240 kg",
    eta: "07:30 AM",
    etaMeta: "Delivered Yest.",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "CLZ 8860",
    operationalNote: "Transport wrapped · All optics accounted for — signed off by A-Cam Op at Squamish",
    urgency: "normal",
    route: [
      {
        location: "Stage 4 — Bridge Studios",
        time: "06:00",
        note: "Lens kit loaded — hard cases padded",
        state: "completed",
      },
      {
        location: "Trans-Canada N → Sea to Sky Hwy 99 N",
        time: "06:25",
        note: "Clear run — no road advisory",
        state: "completed",
      },
      {
        location: "Brackendale — Squamish",
        time: "07:32",
        note: "Received by A-Cam Op — all cases intact and verified",
        state: "completed",
      },
    ],
    manifest: [
      {
        description: "Master Prime Set (18–100mm)",
        qty: "1 set",
        dept: "Camera Dept",
        note: "Lens case — padded, sealed",
      },
      { description: "Zoom Lenses (24–290mm)", qty: "3", dept: "Camera Dept", note: "Individual cases — labeled" },
      { description: "Lens Filters (ND kit)", qty: "1", dept: "Camera Dept", note: "Filter wallet — in case 3" },
      { description: "Diopter Set + Adapters", qty: "1", dept: "Camera Dept", note: "Hard case — inner padded" },
    ],
    productionLog: [
      {
        time: "06:00",
        from: "Transport Dispatch",
        message: "CI-10-2510 departed Bridge Studios. Squamish lens run.",
        type: "dispatch",
      },
      {
        time: "07:32",
        from: "Driver · CLZ 8860",
        message: "Arrived Squamish. Lens kit received by A-Cam Op. All cases intact.",
        type: "confirmation",
      },
      {
        time: "07:45",
        from: "A-Camera Op",
        message: "All optics accounted for and checked. CI-10-2510 complete.",
        type: "confirmation",
      },
    ],
    documents: [
      {
        name: "Movement Order — Squamish Lens Run",
        ref: "MO-2510-D12",
        type: "movement-order",
        issued: "May 27, 04:00",
      },
      { name: "CI Form — Signed + Received", ref: "CI-10-2510", type: "ci", issued: "May 27, 07:45" },
      { name: "Lens Kit Inventory — A-Cam", ref: "LK-2510", type: "revision", issued: "May 27, 05:50" },
    ],
  },
  {
    id: "CI-11-2511",
    customer: departmentAccounts.locations,
    origin: steveston,
    destination: cloverdaleSet,
    cargo: "Greenery + Foliage — Scene 24",
    handling: {
      label: "Live plants — perishable",
      note: "Ventilate and water if hold exceeds 4 hours. Coordinate with Greens.",
      tags: [
        { label: "Perishable", icon: Thermometer },
        { label: "Ventilated hold", icon: PackageCheck },
        { label: "Inspect on arrival", icon: CheckCircle2 },
      ],
    },
    weight: "1,650 kg",
    eta: "13:00",
    etaMeta: "Today",
    status: "En Route",
    progress: 71,
    mode: "land",
    routeType: "road",
    transportNumber: "GTR 1492",
    operationalNote: "Equipment handoff pending · Set Dec awaiting delivery at Cloverdale gate — Scene 24 setup",
    urgency: "normal",
    route: [
      {
        location: "Steveston Cannery Row",
        time: "11:30",
        note: "Greenery loaded — ventilated hold confirmed",
        state: "completed",
      },
      {
        location: "No. 1 Rd → Knight St → Hwy 1 E",
        time: "12:00",
        note: "Clear run eastbound — no delays",
        state: "completed",
      },
      {
        location: "Cloverdale Market — Set Gate",
        time: "13:00",
        note: "Set Dec awaiting at gate — handoff pending",
        state: "active",
      },
    ],
    manifest: [
      {
        description: "Tropical Foliage Mix",
        qty: "120 stems",
        dept: "Locations",
        note: "Ventilated truck — water tray",
      },
      { description: "Ferns (large)", qty: "24 pots", dept: "Locations", note: "Stacked in rows — secured" },
      { description: "Potted Trees (hero)", qty: "3", dept: "Locations", note: "Staked and tied — fragile" },
      { description: "Spanish Moss (50lb bags)", qty: "6", dept: "Locations", note: "Bagged — keep dry" },
    ],
    productionLog: [
      {
        time: "11:30",
        from: "Transport Dispatch",
        message: "CI-11-2511 departed Steveston. Greens — Cloverdale delivery.",
        type: "dispatch",
      },
      {
        time: "12:00",
        from: "Driver · GTR 1492",
        message: "Clear run via Knight St. ETA 13:00 confirmed.",
        type: "update",
      },
      {
        time: "12:50",
        from: "Set Dec",
        message: "Set Dec at Cloverdale gate — awaiting delivery. Plants needed for Scene 24 setup.",
        type: "update",
      },
    ],
    documents: [
      { name: "Movement Order — Greens Delivery", ref: "MO-2511-D12", type: "movement-order", issued: "May 27, 10:00" },
      { name: "CI Form — Signed", ref: "CI-11-2511", type: "ci", issued: "May 27, 11:00" },
      { name: "Greenery Manifest — Scene 24", ref: "GRN-MAN-2511", type: "revision", issued: "May 27, 10:30" },
    ],
  },
  {
    id: "CI-12-2512",
    customer: departmentAccounts.stunts,
    origin: coquitlam,
    destination: fortLangley,
    cargo: "Stunt Mats + Safety Gear",
    handling: {
      label: "Safety equipment — confirm crew at destination",
      note: "Heavy mats — confirm rigging crew at destination before unload.",
      tags: [
        { label: "Forklift only", icon: Forklift },
        { label: "Confirm crew", icon: CheckCircle2 },
        { label: "Inspect on arrival", icon: ShieldCheck },
      ],
    },
    weight: "1,380 kg",
    eta: "11:40 AM",
    etaMeta: "Delayed — rerouting",
    status: "Held — Delayed",
    progress: 39,
    mode: "land",
    routeType: "road",
    transportNumber: "STV 6207",
    operationalNote: "Weather-sensitive transport · Road advisory Hwy 1 eastbound — rerouting via Hwy 7 Mission",
    urgency: "watch",
    route: [
      {
        location: "Coquitlam Staging Yard",
        time: "TBD",
        note: "Departure held — weather advisory Hwy 1 eastbound fog",
        state: "restricted",
      },
      {
        location: "Hwy 7 E — Mission corridor (reroute)",
        time: "TBD",
        note: "Rerouting confirmed — extended ETA in effect",
        state: "pending",
      },
      {
        location: "Fort Langley — Location Gate",
        time: "TBD + est. delay",
        note: "Stunts Coordinator advised — rigging crew on standby",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "High-fall Crash Mats (4×8ft)",
        qty: "6",
        dept: "Stunts",
        note: "Rolled and tied — forklift only",
      },
      { description: "Foam Ratchet Pads", qty: "12", dept: "Stunts", note: "Stacked — secured" },
      { description: "Safety Rigging Kit", qty: "1", dept: "Stunts", note: "Hard case — inspect on receipt" },
      {
        description: "First Aid Kit (stunt grade)",
        qty: "2",
        dept: "Stunts",
        note: "Accessible — do not bury under load",
      },
    ],
    productionLog: [
      {
        time: "07:30",
        from: "Transport Dispatch",
        message: "CI-12-2512 staged. Weather advisory Hwy 1 eastbound — reviewing reroute.",
        type: "alert",
      },
      {
        time: "08:15",
        from: "Transport Dispatch",
        message: "Reroute confirmed via Hwy 7 Mission corridor. Extended ETA — Stunts notified.",
        type: "update",
      },
      {
        time: "09:00",
        from: "Stunts Coordinator",
        message: "Reroute acknowledged. Safety gear needed by 11:00 latest.",
        type: "alert",
      },
    ],
    documents: [
      {
        name: "Movement Order — Stunts Safety Equipment",
        ref: "MO-2512-D12",
        type: "movement-order",
        issued: "May 27, 06:00",
      },
      { name: "Revised Movement Order — Reroute", ref: "MO-2512-REV", type: "movement-order", issued: "May 27, 08:00" },
      { name: "CI Form — Signed", ref: "CI-12-2512", type: "ci", issued: "May 27, 07:00" },
    ],
  },
  {
    id: "CI-13-2513",
    customer: departmentAccounts.production,
    origin: productionOffice,
    destination: bridgeStudios,
    cargo: "Playback Server + Monitor Rig",
    handling: {
      label: "Sensitive electronics — climate controlled",
      note: "Climate-controlled transport required. No cargo stacking on server cases.",
      tags: [
        { label: "Temperature sensitive", icon: Thermometer },
        { label: "Do not stack", icon: Ban },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "420 kg",
    eta: "07:45 AM",
    etaMeta: "Monday",
    status: "Scheduled",
    progress: 9,
    mode: "land",
    routeType: "road",
    transportNumber: "IT PROD-01",
    operationalNote: "Awaiting coordinator approval · 2nd unit must confirm playback schedule before dispatch",
    urgency: "watch",
    route: [
      {
        location: "Production Office — Burrard Place",
        time: "07:00",
        note: "Staged — awaiting 2nd unit coordinator approval",
        state: "restricted",
      },
      {
        location: "Burrard St → Trans-Canada E",
        time: "07:15",
        note: "Route clear — departure on hold pending confirmation",
        state: "pending",
      },
      {
        location: "Stage 4 — Bridge Studios",
        time: "07:45",
        note: "IT crew on standby for server rack setup",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Playback Server (Disguise GX2)",
        qty: "1",
        dept: "Production Office",
        note: "Rack mount — climate controlled",
      },
      {
        description: 'Reference Monitor (24")',
        qty: "2",
        dept: "Production Office",
        note: "Flight cases — do not stack",
      },
      { description: "KVM Switch + Cabling", qty: "1", dept: "Production Office", note: "Cable bag — labeled" },
      { description: "UPS Battery Backup", qty: "2", dept: "Production Office", note: "Heavy — forklift on arrival" },
    ],
    productionLog: [
      {
        time: "06:00",
        from: "Transport Dispatch",
        message: "CI-13-2513 staged. Playback server — awaiting 2nd unit coordinator approval.",
        type: "dispatch",
      },
      {
        time: "06:45",
        from: "2nd Unit Coordinator",
        message: "Approval pending — confirming playback schedule with DOP.",
        type: "alert",
      },
      {
        time: "07:00",
        from: "Transport Dispatch",
        message: "Driver on standby. Departure on hold pending confirmation.",
        type: "update",
      },
    ],
    documents: [
      { name: "CI Form — Pending Approval", ref: "CI-13-2513", type: "ci", issued: "May 27, 06:00" },
      { name: "Movement Order — Draft", ref: "MO-2513-DFT", type: "movement-order", issued: "May 27, 06:00" },
      { name: "Playback System Manifest", ref: "PB-MAN-2513", type: "revision", issued: "May 26, 23:00" },
    ],
  },
  {
    id: "CI-14-2514",
    customer: departmentAccounts.setDec,
    origin: tilbury,
    destination: fortLangley,
    cargo: "Hero Dressing — Living Room 2",
    handling: {
      label: "Hero set dressing — sign-off required",
      note: "Do not move until Set Dec signs off. Return to Tilbury after location wrap.",
      tags: [
        { label: "Sign-off required", icon: PenLine },
        { label: "Return after wrap", icon: Package },
        { label: "Handle with care", icon: ShieldCheck },
      ],
    },
    weight: "1,900 kg",
    eta: "Awaiting",
    etaMeta: "Set Dec ack",
    status: "On Hold",
    progress: 25,
    mode: "land",
    routeType: "road",
    transportNumber: "LKF 9851",
    operationalNote: "Awaiting departmental release · Location still wrapping Scene 22 — no confirmed ETA",
    urgency: "watch",
    route: [
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "TBD",
        note: "Departure on hold — location still wrapping Scene 22",
        state: "restricted",
      },
      {
        location: "Hwy 91 E → Hwy 1 E",
        time: "TBD",
        note: "Route clear — confirmed no restrictions",
        state: "pending",
      },
      {
        location: "Fort Langley — Location Gate",
        time: "TBD",
        note: "Set Dec on standby — no confirmed ETA",
        state: "pending",
      },
    ],
    manifest: [
      { description: "Chesterfield Sofa (hero)", qty: "1", dept: "Set Dec", note: "Blanket-wrapped — two-person lift" },
      { description: "Period Side Tables", qty: "2", dept: "Set Dec", note: "Padded — fragile legs" },
      { description: "Lamp Bases + Shades", qty: "3", dept: "Set Dec", note: "Packed — bubble wrapped" },
      { description: "Carpet (period)", qty: "1 rolled", dept: "Set Dec", note: "Rolled — do not fold" },
    ],
    productionLog: [
      {
        time: "14:00",
        from: "Transport Dispatch",
        message: "CI-14-2514 staged. Hero dressing for Living Room 2.",
        type: "dispatch",
      },
      {
        time: "15:30",
        from: "Set Dec",
        message: "Fort Langley location still wrapping Scene 22. Release delayed — advise driver.",
        type: "alert",
      },
      {
        time: "16:00",
        from: "Transport Dispatch",
        message: "Driver on overnight standby. New pickup window TBD — Set Dec to confirm.",
        type: "alert",
      },
    ],
    documents: [
      { name: "CI Form — Signed", ref: "CI-14-2514", type: "ci", issued: "May 27, 13:00" },
      { name: "Movement Order — On Hold", ref: "MO-2514-D12", type: "movement-order", issued: "May 27, 13:30" },
      { name: "Set Dec Manifest — Living Room 2", ref: "SD-MAN-2514", type: "revision", issued: "May 27, 12:00" },
    ],
  },
  {
    id: "CI-15-2515",
    customer: departmentAccounts.adDept,
    origin: productionOffice,
    destination: surreyUnit,
    cargo: "Script Sides + Continuity Boards",
    handling: {
      label: "Time-sensitive production documents",
      note: "Sides must reach all HoDs before noon. Call 1st AD on delivery.",
      tags: [
        { label: "Time sensitive", icon: AlertTriangleIcon },
        { label: "Call on delivery", icon: Truck },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "45 kg",
    eta: "12:45",
    etaMeta: "Before afternoon call",
    status: "Scheduled",
    progress: 16,
    mode: "land",
    routeType: "road",
    transportNumber: "ADV 2250",
    operationalNote:
      "Revised call sheet issued · Updated sides in this order — deliver to 1st AD trailer before afternoon call",
    urgency: "priority",
    route: [
      {
        location: "Production Office — Burrard Place",
        time: "11:30",
        note: "Updated sides and revised call sheet packaged",
        state: "pending",
      },
      {
        location: "Burrard St → Granville → Knight St → Hwy 1 E",
        time: "12:00",
        note: "Route confirmed — no restrictions",
        state: "pending",
      },
      {
        location: "Unit Base — 192nd Ave, Surrey",
        time: "12:45",
        note: "Deliver to 1st AD trailer — before afternoon call",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Revised Shooting Script (pp. 1–98)",
        qty: "45 copies",
        dept: "AD Dept",
        note: "Flat-packed — do not bend",
      },
      {
        description: "Revised Call Sheet — Day 12 R2",
        qty: "45 copies",
        dept: "AD Dept",
        note: "Collated — rubber banded by dept",
      },
      { description: "Continuity Board — Day 12", qty: "1", dept: "AD Dept", note: "Rolled tube — fragile corners" },
      {
        description: "WD Sides — Day 12",
        qty: "15 copies",
        dept: "Wardrobe",
        note: "Sealed envelope — deliver to WD truck",
      },
    ],
    productionLog: [
      {
        time: "09:00",
        from: "Transport Dispatch",
        message: "CI-15-2515 logged. Revised call sheet and sides — deadline delivery.",
        type: "dispatch",
      },
      {
        time: "10:30",
        from: "AD Dept",
        message: "Revised call sheet confirmed — Day 12 R2. Updated sides included for all HODs.",
        type: "update",
      },
      {
        time: "11:00",
        from: "Transport Dispatch",
        message: "Driver confirmed for 11:30 departure. Noon delivery target — all HODs notified.",
        type: "confirmation",
      },
    ],
    documents: [
      { name: "Revised Call Sheet — Day 12 R2", ref: "CS-D12-R2", type: "call-sheet", issued: "May 27, 02:30" },
      {
        name: "Movement Order — Script Sides Run",
        ref: "MO-2515-D12",
        type: "movement-order",
        issued: "May 27, 09:00",
      },
      { name: "CI Form — Signed", ref: "CI-15-2515", type: "ci", issued: "May 27, 09:30" },
    ],
  },
  {
    id: "CI-16-2516",
    customer: departmentAccounts.transport,
    origin: langleyStudios,
    destination: fortLangley,
    cargo: "Picture Vehicle — Escorted (1967 Mustang)",
    handling: {
      label: "Picture vehicle — escort only",
      note: "Do not load freight on picture vehicle. Return to Langley after scene wrap.",
      tags: [
        { label: "Escort required", icon: Star },
        { label: "No freight", icon: Ban },
        { label: "Return after use", icon: Package },
      ],
    },
    weight: "1,850 kg",
    eta: "16:10",
    etaMeta: "Today",
    status: "Dispatched",
    progress: 84,
    mode: "land",
    routeType: "road",
    transportNumber: "PV-1967STNG",
    operationalNote: "Priority movement · Picture vehicle escort active — route confirmed with Locations",
    urgency: "priority",
    route: [
      {
        location: "Langley Studios — 88th Ave",
        time: "15:30",
        note: "Picture vehicle loaded onto transport — escort confirmed",
        state: "completed",
      },
      {
        location: "200th St → Glover Rd → Fort Langley",
        time: "15:50",
        note: "Escort route confirmed with Locations — clear run",
        state: "active",
      },
      {
        location: "Fort Langley — Location Gate",
        time: "16:10",
        note: "Locations confirm arrival — vehicle to hero position",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "1967 Ford Mustang (hero — picture vehicle)",
        qty: "1",
        dept: "Transport Dept",
        note: "On transport trailer — escort required",
      },
      { description: "Vehicle Hero Dressing Kit", qty: "1", dept: "Props", note: "In vehicle — do not remove" },
      {
        description: "Spare Keys + Vehicle Log",
        qty: "1 set",
        dept: "Transport Dept",
        note: "Secure — sign out required",
      },
    ],
    productionLog: [
      {
        time: "15:30",
        from: "Transport Dispatch",
        message: "CI-16-2516 departed Langley. Picture vehicle escort active.",
        type: "dispatch",
      },
      {
        time: "15:50",
        from: "Driver · PV-1967STNG",
        message: "Picture vehicle secured on transport. Escort confirmed with Locations.",
        type: "update",
      },
      {
        time: "16:05",
        from: "Locations",
        message: "Route confirmed clear — Fort Langley gate open. Directing to hero position.",
        type: "confirmation",
      },
    ],
    documents: [
      {
        name: "Movement Order — Picture Vehicle Escort",
        ref: "MO-2516-D12",
        type: "movement-order",
        issued: "May 27, 14:00",
      },
      { name: "CI Form — Signed", ref: "CI-16-2516", type: "ci", issued: "May 27, 14:30" },
      { name: "Locations Gate Pass — Fort Langley", ref: "GATE-2516", type: "permit", issued: "May 27, 12:00" },
    ],
  },
  {
    id: "CI-17-2517",
    customer: departmentAccounts.artDept,
    origin: tilbury,
    destination: pneGrounds,
    cargo: "Greens Package — Jungle Set",
    handling: {
      label: "Live materials — same-day delivery",
      note: "Deliver same day. Keep shaded and misted until onset.",
      tags: [
        { label: "Perishable", icon: Thermometer },
        { label: "Keep shaded", icon: Droplets },
        { label: "Inspect on arrival", icon: CheckCircle2 },
      ],
    },
    weight: "3,100 kg",
    eta: "10:30",
    etaMeta: "Today",
    status: "En Route",
    progress: 62,
    mode: "land",
    routeType: "road",
    transportNumber: "ZMV 4108",
    operationalNote: "Movement conflict resolved · Original staging area cleared by Locations — on schedule",
    urgency: "normal",
    route: [
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "09:00",
        note: "Greens package loaded — same-day delivery window active",
        state: "completed",
      },
      {
        location: "Hwy 91 → Knight St Bridge → E Hastings",
        time: "09:35",
        note: "Movement conflict resolved — original route restored",
        state: "active",
      },
      {
        location: "PNE Grounds — E. Hastings Gate",
        time: "10:30",
        note: "Greens crew on standby — confirm shaded staging area",
        state: "pending",
      },
    ],
    manifest: [
      { description: "Banana Palms (15ft)", qty: "8", dept: "Art Dept", note: "Loaded standing — ventilated" },
      {
        description: "Jungle Ferns + Ground Cover",
        qty: "40 sq ft",
        dept: "Art Dept",
        note: "Flat-packed — keep moist",
      },
      { description: "Bamboo Stalks (hero)", qty: "20", dept: "Art Dept", note: "Bundled — length 12ft" },
      { description: "Soil + Peat Bags", qty: "10", dept: "Art Dept", note: "40lb bags — stacked" },
    ],
    productionLog: [
      {
        time: "09:00",
        from: "Transport Dispatch",
        message: "CI-17-2517 departed Tilbury. Greens package — PNE.",
        type: "dispatch",
      },
      {
        time: "09:20",
        from: "Driver · ZMV 4108",
        message: "Movement conflict at Knight St resolved. Original route restored.",
        type: "update",
      },
      {
        time: "09:35",
        from: "Art Dept",
        message: "PNE staging area cleared by Locations. On schedule.",
        type: "confirmation",
      },
    ],
    documents: [
      {
        name: "Movement Order — Greens (Jungle Set)",
        ref: "MO-2517-D12",
        type: "movement-order",
        issued: "May 27, 08:00",
      },
      { name: "CI Form — Signed", ref: "CI-17-2517", type: "ci", issued: "May 27, 08:30" },
      { name: "Art Dept Greens Manifest", ref: "AD-GRN-2517", type: "revision", issued: "May 27, 07:45" },
    ],
  },
  {
    id: "CI-18-2518",
    customer: departmentAccounts.wardrobe,
    origin: bridgeStudios,
    destination: tilbury,
    cargo: "Wrap Costumes — Day 11 Return",
    handling: {
      label: "Wrap return — continuity check required",
      note: "All items must be checked against continuity sheets before intake.",
      tags: [
        { label: "Count on arrival", icon: CheckCircle2 },
        { label: "Continuity check", icon: PenLine },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "680 kg",
    eta: "12:10",
    etaMeta: "Delivered Today",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "RTN 7034",
    operationalNote: "Transport wrapped · Continuity check complete — all Day 11 items received and logged",
    urgency: "normal",
    route: [
      {
        location: "Stage 4 — Bridge Studios",
        time: "11:00",
        note: "Day 11 wrap costumes loaded — sorted by department",
        state: "completed",
      },
      {
        location: "Burnaby → Queensborough Bridge → Tilbury",
        time: "11:30",
        note: "Return route confirmed — no delays",
        state: "completed",
      },
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "12:10",
        note: "Continuity check complete — all items received and logged",
        state: "completed",
      },
    ],
    manifest: [
      {
        description: "Principal Costumes (Day 11)",
        qty: "12 complete",
        dept: "Wardrobe",
        note: "Suit bags — tagged with continuity",
      },
      { description: "BG Wrap Costumes", qty: "60 bags", dept: "Wardrobe", note: "Tagged bags — sorted by set" },
      {
        description: "Accessories Return Kit",
        qty: "1",
        dept: "Wardrobe",
        note: "Tagged bag — continuity check required",
      },
    ],
    productionLog: [
      {
        time: "11:00",
        from: "Transport Dispatch",
        message: "CI-18-2518 departed Bridge Studios. Day 11 wrap return.",
        type: "dispatch",
      },
      {
        time: "12:10",
        from: "Driver · RTN 7034",
        message: "Arrived Tilbury. All Day 11 items delivered for intake check.",
        type: "update",
      },
      {
        time: "12:35",
        from: "Wardrobe",
        message: "Continuity check complete. All items accounted for. CI-18-2518 wrapped.",
        type: "confirmation",
      },
    ],
    documents: [
      {
        name: "Movement Order — Day 11 Wrap Return",
        ref: "MO-2518-D11",
        type: "movement-order",
        issued: "May 27, 10:00",
      },
      { name: "Continuity Wrap Sheet — Day 11 Signed", ref: "WD-CONT-D11", type: "ci", issued: "May 27, 12:35" },
      { name: "CI Form — Signed", ref: "CI-18-2518", type: "ci", issued: "May 27, 10:30" },
    ],
  },
  {
    id: "CI-19-2519",
    customer: departmentAccounts.gripElectric,
    origin: northShore,
    destination: squamish,
    cargo: "Generator 500kW + Distros",
    handling: {
      label: "Heavy load — road clearance required",
      note: "500kW on low-loader. Confirm road access and power draw clearance before dispatch.",
      tags: [
        { label: "Heavy load", icon: Forklift },
        { label: "Road clearance", icon: ShieldCheck },
        { label: "Coordinator approval", icon: PenLine },
      ],
    },
    weight: "9,200 kg",
    eta: "Tonight",
    etaMeta: "ETA TBD",
    status: "Held — Delayed",
    progress: 47,
    mode: "land",
    routeType: "road",
    transportNumber: "GEN-500KW-02",
    operationalNote: "Route compromised · Hwy 99 bridge weight restriction — low-loader rerouting via Trans-Canada N",
    urgency: "watch",
    route: [
      {
        location: "North Shore — Unit Base",
        time: "TBD",
        note: "Departure held — Hwy 99 bridge weight restriction flagged",
        state: "restricted",
      },
      {
        location: "Trans-Canada W → Hwy 1 N → Sea to Sky reroute",
        time: "TBD",
        note: "Low-loader reroute confirmed — extended ETA in effect",
        state: "pending",
      },
      {
        location: "Brackendale — Squamish",
        time: "Tonight (TBD)",
        note: "Grip crew at location on standby — overnight if required",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "500kW Generator (Aggreko)",
        qty: "1",
        dept: "Grip + Electric",
        note: "Low-loader — road clearance required",
      },
      {
        description: "Distro Boxes (400A)",
        qty: "4",
        dept: "Grip + Electric",
        note: "Palletized — forklift on arrival",
      },
      { description: "Cable Feeder (250ft)", qty: "3 runs", dept: "Grip + Electric", note: "Truck bed — strapped" },
      { description: "Ground Plates + Hardware", qty: "1 set", dept: "Grip + Electric", note: "Marked bin" },
    ],
    productionLog: [
      {
        time: "17:00",
        from: "Transport Dispatch",
        message: "CI-19-2519 staged. Generator run to Squamish — bridge restriction flagged.",
        type: "alert",
      },
      {
        time: "18:30",
        from: "Transport Dispatch",
        message: "Hwy 99 bridge restriction confirmed for low-loaders. Rerouting via Trans-Canada N.",
        type: "alert",
      },
      {
        time: "19:00",
        from: "Grip Dept",
        message: "Extended ETA acknowledged. Grip crew at Squamish on standby — overnight if needed.",
        type: "update",
      },
    ],
    documents: [
      { name: "CI Form — Signed", ref: "CI-19-2519", type: "ci", issued: "May 27, 16:00" },
      { name: "Movement Order — Generator Run", ref: "MO-2519-D12", type: "movement-order", issued: "May 27, 15:00" },
      {
        name: "Revised Movement Order — Low-loader Reroute",
        ref: "MO-2519-REV",
        type: "movement-order",
        issued: "May 27, 18:30",
      },
    ],
  },
  {
    id: "CI-20-2520",
    customer: departmentAccounts.transport,
    origin: surreyUnit,
    destination: coquitlam,
    cargo: "Honey Wagon + Trailer Park",
    handling: {
      label: "Base camp move — confirm layout before arrival",
      note: "Honey wagon and 5 talent trailers. Confirm trailer park layout before arrival.",
      tags: [
        { label: "Confirm layout", icon: CheckCircle2 },
        { label: "Heavy vehicle", icon: Forklift },
        { label: "Coordinator approval", icon: PenLine },
      ],
    },
    weight: "5,600 kg",
    eta: "06:00 AM",
    etaMeta: "Thursday",
    status: "Scheduled",
    progress: 14,
    mode: "land",
    routeType: "road",
    transportNumber: "HW-UNIT-04",
    operationalNote: "Pending return from Fort Langley · Honey wagon staged at Surrey — Thursday 06:00 convoy",
    urgency: "normal",
    route: [
      {
        location: "Unit Base — 192nd Ave, Surrey",
        time: "06:00 Thu",
        note: "Honey wagon and 5 trailers staged for departure",
        state: "pending",
      },
      {
        location: "Trans-Canada E → Hwy 1 → Mary Hill Bypass",
        time: "06:30",
        note: "Route confirmed — no restrictions",
        state: "pending",
      },
      {
        location: "Coquitlam Staging Yard",
        time: "07:15",
        note: "Confirm trailer park layout with Transport Coordinator before arrival",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Honey Wagon (5-unit)",
        qty: "1",
        dept: "Transport Dept",
        note: "Towed — confirm turning radius at destination",
      },
      { description: "Talent Trailers (40ft)", qty: "5", dept: "Transport Dept", note: "Convoy — staggered arrival" },
      { description: "Crew Parking Sign Kit", qty: "1", dept: "Transport Dept", note: "In cab — deploy on arrival" },
    ],
    productionLog: [
      {
        time: "18:00 Wed",
        from: "Transport Dispatch",
        message: "CI-20-2520 logged. Honey wagon convoy — Thursday 06:00 departure.",
        type: "dispatch",
      },
      {
        time: "22:00 Wed",
        from: "Transport Dispatch",
        message: "All trailers staged and connected. Drivers briefed.",
        type: "update",
      },
      {
        time: "05:30 Thu",
        from: "Transport Dispatch",
        message: "Convoy confirmed ready. Transport Coordinator briefed on layout.",
        type: "confirmation",
      },
    ],
    documents: [
      { name: "Movement Order — Base Camp Move", ref: "MO-2520-D12", type: "movement-order", issued: "May 26, 18:00" },
      { name: "CI Form — Signed", ref: "CI-20-2520", type: "ci", issued: "May 26, 17:30" },
      { name: "Call Sheet — Day 12 R2", ref: "CS-D12-R2", type: "call-sheet", issued: "May 27, 02:30" },
    ],
  },
  {
    id: "CI-21-2521",
    customer: departmentAccounts.production,
    origin: pneGrounds,
    destination: bridgeStudios,
    cargo: "Craft + Catering Rig",
    handling: {
      label: "Perishable food stock — 2-hour window",
      note: "Deliver within 2-hour window. Call Craft Services 15 min out.",
      tags: [
        { label: "Perishable", icon: Thermometer },
        { label: "Time sensitive", icon: AlertTriangleIcon },
        { label: "Call before arrival", icon: Truck },
      ],
    },
    weight: "1,200 kg",
    eta: "07:45 AM",
    etaMeta: "08:00 hard deadline",
    status: "En Route",
    progress: 58,
    mode: "land",
    routeType: "road",
    transportNumber: "CFT-RIG-01",
    operationalNote: "Active unit movement · Catering deadline 08:00 hard — driver radio confirmed ETA 07:45",
    urgency: "priority",
    route: [
      {
        location: "PNE Grounds — E. Hastings",
        time: "07:10",
        note: "Craft and catering rig loaded — departure on schedule",
        state: "completed",
      },
      {
        location: "E Hastings → Willingdon Ave → Lougheed",
        time: "07:28",
        note: "En route — driver radio confirmed",
        state: "active",
      },
      {
        location: "Stage 4 — Bridge Studios",
        time: "07:45",
        note: "08:00 catering deadline hard — crew call confirmed",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Catering Truck + Rig",
        qty: "1",
        dept: "Production Office",
        note: "Self-driven — confirm parking pad",
      },
      {
        description: "Cold Storage Box (perishable)",
        qty: "4",
        dept: "Production Office",
        note: "Iced — perishable deadline 08:00",
      },
      { description: "Hot Box Units", qty: "3", dept: "Production Office", note: "08:00 hard deadline — crew call" },
    ],
    productionLog: [
      {
        time: "07:10",
        from: "Transport Dispatch",
        message: "CI-21-2521 departed PNE. Catering rig — 08:00 hard deadline.",
        type: "dispatch",
      },
      {
        time: "07:28",
        from: "Driver · CFT-RIG-01",
        message: "En route via Lougheed. No delays — ETA 07:45.",
        type: "update",
      },
      {
        time: "07:40",
        from: "Craft Services",
        message: "On approach — parking pad confirmed at Stage 4.",
        type: "confirmation",
      },
    ],
    documents: [
      { name: "Movement Order — Catering Run", ref: "MO-2521-D12", type: "movement-order", issued: "May 27, 06:00" },
      { name: "CI Form — Signed", ref: "CI-21-2521", type: "ci", issued: "May 27, 06:30" },
      { name: "Catering Order — Day 12", ref: "CATER-D12", type: "revision", issued: "May 26, 20:00" },
    ],
  },
  {
    id: "CI-22-2522",
    customer: departmentAccounts.cameraA,
    origin: bridgeStudios,
    destination: steveston,
    cargo: "Dolly + Track Package — 100ft",
    handling: {
      label: "Grip equipment — confirm staging crew",
      note: "100ft track sections — clear staging area required. Confirm Grip crew for unload.",
      tags: [
        { label: "Secure load", icon: ShieldCheck },
        { label: "Confirm crew", icon: CheckCircle2 },
        { label: "Forklift only", icon: Forklift },
      ],
    },
    weight: "2,300 kg",
    eta: "Pending",
    etaMeta: "Confirmation",
    status: "Awaiting Clearance",
    progress: 29,
    mode: "land",
    routeType: "road",
    transportNumber: "GRP 6639",
    operationalNote: "Movement conflict · Dolly staging conflicts with picture vehicle turnaround at Steveston gate",
    urgency: "watch",
    route: [
      {
        location: "Stage 4 — Bridge Studios",
        time: "TBD",
        note: "Departure held — movement conflict at Steveston gate",
        state: "restricted",
      },
      {
        location: "Lougheed → Knight St → SW Marine Dr",
        time: "TBD",
        note: "Route clear — awaiting gate clearance",
        state: "pending",
      },
      {
        location: "Steveston Cannery Row",
        time: "TBD",
        note: "Dolly staging conflicts with picture vehicle turnaround — resolve before arrival",
        state: "restricted",
      },
    ],
    manifest: [
      { description: "Doorway Dolly (Fisher 10)", qty: "1", dept: "Camera Dept", note: "Padded — 2-person carry" },
      { description: "Track Sections (4ft)", qty: "25", dept: "Camera Dept", note: "100ft total — bundled by 5" },
      { description: "Track Pins + Hardware", qty: "1", dept: "Camera Dept", note: "Marked bin" },
      { description: "Leveling Boards (set of 8)", qty: "1", dept: "Camera Dept", note: "Padded flat" },
    ],
    productionLog: [
      {
        time: "07:00",
        from: "Transport Dispatch",
        message: "CI-22-2522 staged. Dolly + 100ft track — Steveston.",
        type: "dispatch",
      },
      {
        time: "07:30",
        from: "Locations",
        message: "Movement conflict at Steveston gate — picture vehicle turnaround blocking dolly staging.",
        type: "alert",
      },
      {
        time: "08:00",
        from: "Transport Dispatch",
        message: "Clearance pending — Locations resolving conflict. Driver on hold at Stage 4.",
        type: "alert",
      },
    ],
    documents: [
      { name: "CI Form — Signed", ref: "CI-22-2522", type: "ci", issued: "May 27, 06:30" },
      {
        name: "Movement Order — On Hold (Conflict)",
        ref: "MO-2522-D12",
        type: "movement-order",
        issued: "May 27, 06:00",
      },
      { name: "Steveston Gate Schedule — Day 12", ref: "GATE-STEVE-D12", type: "permit", issued: "May 27, 05:00" },
    ],
  },
  {
    id: "CI-23-2523",
    customer: departmentAccounts.locations,
    origin: coquitlam,
    destination: fortLangley,
    cargo: "Wetdown Equipment + Hoses",
    handling: {
      label: "Wetdown — coordinate water supply",
      note: "Coordinate with Locations for water supply and drain access before arrival.",
      tags: [
        { label: "Coordinate arrival", icon: AlertTriangleIcon },
        { label: "Confirm water access", icon: Droplets },
        { label: "Restricted area", icon: ShieldCheck },
      ],
    },
    weight: "820 kg",
    eta: "Departing",
    etaMeta: "02:50 PM",
    status: "Scheduled",
    progress: 19,
    mode: "land",
    routeType: "road",
    transportNumber: "LCN 4411",
    operationalNote: "Permit dependency · Water access permit pending City of Langley approval — dispatch on hold",
    urgency: "normal",
    route: [
      {
        location: "Coquitlam Staging Yard",
        time: "14:50",
        note: "Wetdown rig staged — permit dependency outstanding",
        state: "pending",
      },
      {
        location: "Hwy 1 E → 200th St → Glover Rd",
        time: "15:20",
        note: "Route confirmed — no restrictions",
        state: "pending",
      },
      {
        location: "Fort Langley — Location Gate",
        time: "15:50",
        note: "Water access permit required before unload — City of Langley",
        state: "pending",
      },
    ],
    manifest: [
      {
        description: "Pump Unit (portable, 5000 GPH)",
        qty: "1",
        dept: "Locations",
        note: "Truck bed — confirm water supply",
      },
      { description: "Garden Hose + Fittings", qty: "8 runs", dept: "Locations", note: "50ft each — bundled" },
      { description: "Distribution Manifold", qty: "1", dept: "Locations", note: "Padded — fragile fittings" },
      { description: "Water Meter + Permit Docs", qty: "1", dept: "Locations", note: "Cab — deliver to Locations Mgr" },
    ],
    productionLog: [
      {
        time: "11:00",
        from: "Transport Dispatch",
        message: "CI-23-2523 logged. Wetdown run — permit dependency outstanding.",
        type: "dispatch",
      },
      {
        time: "13:00",
        from: "Locations",
        message: "City of Langley water access permit application submitted — decision by 14:00.",
        type: "update",
      },
      {
        time: "14:30",
        from: "Locations",
        message: "Permit decision delayed. Following up with City Hall. Dispatch on hold.",
        type: "alert",
      },
    ],
    documents: [
      { name: "CI Form — Signed", ref: "CI-23-2523", type: "ci", issued: "May 27, 10:00" },
      {
        name: "Movement Order — Wetdown Equipment",
        ref: "MO-2523-D12",
        type: "movement-order",
        issued: "May 27, 10:30",
      },
      {
        name: "Water Access Permit — Pending",
        ref: "WAP-LANGLEY-2523",
        type: "permit",
        issued: "Pending — City of Langley",
      },
    ],
  },
  {
    id: "CI-24-2524",
    customer: departmentAccounts.setDec,
    origin: tilbury,
    destination: surreyUnit,
    cargo: "Breakaway Props — Scene 30B",
    handling: {
      label: "Breakaway pieces — fragile",
      note: "Do not stack. Return unbroken spares to Props after scene wrap.",
      tags: [
        { label: "Do not stack", icon: Ban },
        { label: "Handle with care", icon: Package },
        { label: "Return after use", icon: PackageCheck },
      ],
    },
    weight: "180 kg",
    eta: "16:10",
    etaMeta: "Delivered Today",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "BRK 7083",
    operationalNote: "Transport wrapped · Breakaway spares returned and sorted by scene — Set Dec signed off",
    urgency: "normal",
    route: [
      {
        location: "Art Dept Warehouse — Tilbury",
        time: "15:00",
        note: "Breakaway pieces packed — padded and sorted by scene",
        state: "completed",
      },
      {
        location: "Deltaport Way → Hwy 91 N → Trans-Canada E",
        time: "15:25",
        note: "Clear run — no delays",
        state: "completed",
      },
      {
        location: "Unit Base — 192nd Ave, Surrey",
        time: "16:10",
        note: "Received by Set Dec — unbroken spares signed off and returned",
        state: "completed",
      },
    ],
    manifest: [
      {
        description: "Breakaway Bottle (hero — Scene 30B)",
        qty: "3",
        dept: "Set Dec",
        note: "Padded box — do not stack",
      },
      { description: "Breakaway Chair (pre-cut)", qty: "1", dept: "Set Dec", note: "Padded and tied" },
      {
        description: "Spare (unbroken) Breakaway Set",
        qty: "1 set",
        dept: "Set Dec",
        note: "Return after scene — signed out",
      },
    ],
    productionLog: [
      {
        time: "15:00",
        from: "Transport Dispatch",
        message: "CI-24-2524 departed Tilbury. Breakaway props — Scene 30B.",
        type: "dispatch",
      },
      {
        time: "16:10",
        from: "Driver · BRK 7083",
        message: "Arrived Surrey unit base. Received by Set Dec.",
        type: "update",
      },
      {
        time: "16:25",
        from: "Set Dec",
        message: "Breakaway count confirmed. Unbroken spares returned. CI-24-2524 complete.",
        type: "confirmation",
      },
    ],
    documents: [
      { name: "Movement Order — Completed", ref: "MO-2524-D12", type: "movement-order", issued: "May 27, 14:00" },
      { name: "CI Form — Signed + Completed", ref: "CI-24-2524", type: "ci", issued: "May 27, 16:25" },
      { name: "Breakaway Props Receipt — Signed", ref: "BP-REC-2524", type: "revision", issued: "May 27, 16:30" },
    ],
  },
];

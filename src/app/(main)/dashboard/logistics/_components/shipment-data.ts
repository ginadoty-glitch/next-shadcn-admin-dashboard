import {
  AlertTriangleIcon,
  ArrowUp,
  Ban,
  BriefcaseBusiness,
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
  ThermometerSun,
  Truck,
  Weight,
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
    eta: "11:20 AM",
    etaMeta: "Tomorrow",
    status: "Held — Delayed",
    progress: 42,
    mode: "land",
    routeType: "road",
    transportNumber: "ZLP 9043",
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
    eta: "03:40 PM",
    etaMeta: "Departing Today",
    status: "Scheduled",
    progress: 18,
    mode: "land",
    routeType: "road",
    transportNumber: "XBK 3827",
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
    eta: "02:15 PM",
    etaMeta: "Today",
    status: "Dispatched",
    progress: 88,
    mode: "land",
    routeType: "road",
    transportNumber: "PNW 5513",
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
    eta: "05:50 PM",
    etaMeta: "Wednesday",
    status: "En Route",
    progress: 54,
    mode: "land",
    routeType: "road",
    transportNumber: "BASE-10T-03",
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
    eta: "08:30 AM",
    etaMeta: "Delivered Yest.",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "CLZ 8860",
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
    eta: "01:05 PM",
    etaMeta: "Today",
    status: "En Route",
    progress: 71,
    mode: "land",
    routeType: "road",
    transportNumber: "GTR 1492",
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
    eta: "09:40 AM",
    etaMeta: "Friday",
    status: "Held — Delayed",
    progress: 39,
    mode: "land",
    routeType: "road",
    transportNumber: "STV 6207",
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
    eta: "07:15 AM",
    etaMeta: "Monday",
    status: "Scheduled",
    progress: 9,
    mode: "land",
    routeType: "road",
    transportNumber: "IT PROD-01",
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
    eta: "03:30 PM",
    etaMeta: "Today",
    status: "Scheduled",
    progress: 16,
    mode: "land",
    routeType: "road",
    transportNumber: "ADV 2250",
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
    eta: "04:10 PM",
    etaMeta: "Today",
    status: "Dispatched",
    progress: 84,
    mode: "land",
    routeType: "road",
    transportNumber: "PV-1967STNG",
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
    eta: "Next Week",
    etaMeta: "Tuesday",
    status: "En Route",
    progress: 62,
    mode: "land",
    routeType: "road",
    transportNumber: "ZMV 4108",
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
    eta: "11:40 AM",
    etaMeta: "Delivered Today",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "RTN 7034",
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
    eta: "10:50 PM",
    etaMeta: "Tonight",
    status: "Held — Delayed",
    progress: 47,
    mode: "land",
    routeType: "road",
    transportNumber: "GEN-500KW-02",
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
    eta: "08:20 AM",
    etaMeta: "Tomorrow",
    status: "En Route",
    progress: 58,
    mode: "land",
    routeType: "road",
    transportNumber: "CFT-RIG-01",
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
    eta: "06:20 PM",
    etaMeta: "Delivered Today",
    status: "Completed",
    progress: 100,
    mode: "land",
    routeType: "road",
    transportNumber: "BRK 7083",
  },
];

export const shipmentDetails = [
  { icon: Package, label: "Brokered Items", value: "A-Camera Package" },
  { icon: Weight, label: "Total Load", value: "850 kg" },
  { icon: BriefcaseBusiness, label: "Transport Type", value: "Box Truck" },
  { icon: Truck, label: "CI Reference", value: "CI-01-2501" },
  { icon: ThermometerSun, label: "Handling", value: "Fragile — optics" },
] as const;

export const shipmentTimeline = [
  { label: "Order Created", time: "May 27, 07:20 AM", place: "Production Office", done: true, active: false },
  { label: "Staged for Pickup", time: "May 27, 07:45 AM", place: "Art Dept Warehouse", done: true, active: false },
  { label: "En Route", time: "May 27, 09:15 AM", place: "Bridge Studios", done: false, active: true },
  { label: "Arrived on Set", time: "May 27, 12:10 PM", place: "Surrey Unit Base", done: false, active: false },
  { label: "Signed Off", time: "—", place: "Surrey Unit Base", done: false, active: false },
] as const;

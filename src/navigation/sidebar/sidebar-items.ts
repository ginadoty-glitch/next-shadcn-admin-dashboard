import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileCheck2,
  FolderArchive,
  type LucideIcon,
  MapPin,
  Package,
  PauseOctagon,
  ReceiptText,
  Settings,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 2,
    label: "Logistics",
    items: [
      {
        title: "Transport Orders",
        url: "/dashboard/logistics",
        icon: Truck,
      },
      {
        title: "Shipments",
        url: "/dashboard/coming-soon",
        icon: Package,
        comingSoon: true,
      },
      {
        title: "CI Registry",
        url: "/dashboard/coming-soon",
        icon: FileCheck2,
        comingSoon: true,
      },
      {
        title: "Rush Queue",
        url: "/dashboard/coming-soon",
        icon: Zap,
        comingSoon: true,
      },
      {
        title: "Holdbacks",
        url: "/dashboard/coming-soon",
        icon: PauseOctagon,
        comingSoon: true,
      },
    ],
  },
  {
    id: 3,
    label: "Production",
    items: [
      {
        title: "Schedule",
        url: "/dashboard/coming-soon",
        icon: Calendar,
        comingSoon: true,
      },
      {
        title: "Locations",
        url: "/dashboard/coming-soon",
        icon: MapPin,
        comingSoon: true,
      },
      {
        title: "Crew",
        url: "/dashboard/coming-soon",
        icon: Users,
        comingSoon: true,
      },
      {
        title: "Operations",
        url: "/dashboard/coming-soon",
        icon: ClipboardList,
        comingSoon: true,
      },
    ],
  },
  {
    id: 4,
    label: "Finance",
    items: [
      {
        title: "Live Budget",
        url: "/dashboard/coming-soon",
        icon: TrendingUp,
        comingSoon: true,
      },
      {
        title: "Check Requests",
        url: "/dashboard/coming-soon",
        icon: ReceiptText,
        comingSoon: true,
      },
    ],
  },
  {
    id: 5,
    label: "System",
    items: [
      {
        title: "Wrap Archive",
        url: "/dashboard/coming-soon",
        icon: FolderArchive,
        comingSoon: true,
      },
      {
        title: "References",
        url: "/dashboard/coming-soon",
        icon: BookOpen,
        comingSoon: true,
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings,
      },
    ],
  },
];

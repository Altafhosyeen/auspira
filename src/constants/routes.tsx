import { HomeOutlined } from '@ant-design/icons';
import {
  Activity,
  AlertTriangle,
  BookOpenCheck,
  Boxes,
  BriefcaseBusiness,
  ChartColumn,
  ClipboardList,
  Clock,
  ContrastIcon,
  FileQuestion,
  HandCoins,
  Handshake,
  LayoutDashboard,
  Radar,
  Settings,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type React from 'react';
import type { JSX } from 'react';
import { getLink } from '@/lib/utils/menu';
import { MENU_PATH } from './routes.constants';

const ICON_STYLE = { fontSize: '22px', width: '22px', height: '22px' };

export interface IRoute {
  pathname: string;
  name: string;
  label: string | JSX.Element | React.ReactNode;
  key: string;
  icon?: JSX.Element;
  children?: IRoute[];
  flag?: string;
}

export const ORGANIZATION_ROUTES: IRoute[] = [
  {
    key: MENU_PATH.DASHBOARD.key,
    pathname: MENU_PATH.DASHBOARD.pathname,
    label: getLink({
      label: 'Dashboard',
      path: MENU_PATH.DASHBOARD.pathname,
    }),
    name: 'Dashboard',
    icon: <LayoutDashboard style={ICON_STYLE} />,
  },
  {
    key: MENU_PATH.PROJECTS.key,
    pathname: MENU_PATH.PROJECTS.pathname,
    label: getLink({
      label: 'Project',
      path: MENU_PATH.PROJECTS.pathname,
    }),
    name: 'Projects',
    icon: <BriefcaseBusiness style={ICON_STYLE} />,
    children: [
      {
        key: MENU_PATH.PROJECTS_AWARENESS_NEW.key,
        pathname: MENU_PATH.PROJECTS_AWARENESS_NEW.pathname,
        label: getLink({
          label: 'Awareness',
          path: MENU_PATH.PROJECTS_AWARENESS_NEW.pathname,
        }),
        name: 'Awareness',
        icon: <Clock style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.PROJECTS_WATCHTOWER_QUEUE.key,
        pathname: MENU_PATH.PROJECTS_WATCHTOWER_QUEUE.pathname,
        label: getLink({
          label: 'Action Queue',
          path: MENU_PATH.PROJECTS_WATCHTOWER_QUEUE.pathname,
        }),
        name: 'Action Queue',
        icon: <Radar style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.CONTRACTS.key,
        pathname: MENU_PATH.CONTRACTS.pathname,
        label: getLink({
          label: 'Contracts',
          path: MENU_PATH.CONTRACTS.pathname,
        }),
        name: 'Contracts',
        icon: <BookOpenCheck style={ICON_STYLE} />,
      },
    ],
  },
  {
    key: MENU_PATH.CCA.key,
    pathname: '',
    label: getLink({
      label: 'Contract Control Agent',
      path: '',
    }),
    name: 'Contract Control Agent',
    icon: <ContrastIcon style={ICON_STYLE} />,
    children: [
      {
        key: MENU_PATH.CCA_EARLY_WARNING_NEW.key,
        pathname: MENU_PATH.CCA_EARLY_WARNING_NEW.pathname,
        label: getLink({
          label: 'Early Warnings',
          path: MENU_PATH.CCA_EARLY_WARNING_NEW.pathname,
        }),
        name: 'Early Warnings',
        icon: <AlertTriangle style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.COMPENSATION_EVENT.key,
        pathname: MENU_PATH.COMPENSATION_EVENT.pathname,
        label: getLink({
          label: 'Compensation Event',
          path: MENU_PATH.COMPENSATION_EVENT.pathname,
        }),
        name: 'Compensation Event',
        icon: <HandCoins style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.key,
        pathname: MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname,
        label: getLink({
          label: 'Project Management Instruction',
          path: MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname,
        }),
        name: 'Project Management Instruction',
        icon: <ClipboardList style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.CCA_DEFECT_NOTICES.key,
        pathname: MENU_PATH.CCA_DEFECT_NOTICES.pathname,
        label: getLink({
          label: 'Defect Notices',
          path: MENU_PATH.CCA_DEFECT_NOTICES.pathname,
        }),
        name: 'Defect Notices',
        icon: <TriangleAlert style={ICON_STYLE} />,
      },
    ],
  },
  {
    key: MENU_PATH.OPERATIONAL_CONTROL_AGENT.key,
    pathname: '',
    label: getLink({
      label: 'Operational Control Agent',
      path: '',
    }),
    name: 'Operational Control Agent',
    icon: <Handshake style={ICON_STYLE} />,
    children: [
      {
        key: MENU_PATH.OCA_REPORTING.key,
        pathname: MENU_PATH.OCA_REPORTING.pathname,
        label: getLink({
          label: 'Project Reporting',
          path: MENU_PATH.OCA_REPORTING.pathname,
        }),
        name: 'Project Reporting',
        icon: <ChartColumn style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.OCA_PROGRAM_HEALTH.key,
        pathname: MENU_PATH.OCA_PROGRAM_HEALTH.pathname,
        label: getLink({
          label: 'Program Health',
          path: MENU_PATH.OCA_PROGRAM_HEALTH.pathname,
        }),
        name: 'Program Health',
        icon: <Activity style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.OCA_REQUEST_FOR_INFORMATION.key,
        pathname: MENU_PATH.OCA_REQUEST_FOR_INFORMATION.pathname,
        label: getLink({
          label: 'Request for Information',
          path: MENU_PATH.OCA_REQUEST_FOR_INFORMATION.pathname,
        }),
        name: 'Request for Information',
        icon: <FileQuestion style={ICON_STYLE} />,
      },
      {
        key: MENU_PATH.OCA_RESOURCE_MANAGEMENT.key,
        pathname: MENU_PATH.OCA_RESOURCE_MANAGEMENT.pathname,
        label: getLink({
          label: 'Resource Management',
          path: MENU_PATH.OCA_RESOURCE_MANAGEMENT.pathname,
        }),
        name: 'Resource Management',
        icon: <Boxes style={ICON_STYLE} />,
      },
    ],
  },
  // {
  //   key: MENU_PATH.AI_ASSISTANT.key,
  //   pathname: MENU_PATH.AI_ASSISTANT.pathname,
  //   label: getLink({
  //     label: 'AI Assistant',
  //     path: MENU_PATH.AI_ASSISTANT.pathname,
  //   }),
  //   name: 'AI Assistant',
  //   icon: <Sparkles style={ICON_STYLE} />,
  // },
  // {
  //   key: MENU_PATH.DOCUMENTATIONS.key,
  //   pathname: MENU_PATH.DOCUMENTATIONS.pathname,
  //   label: getLink({
  //     label: 'Documentations',
  //     path: MENU_PATH.DOCUMENTATIONS.pathname,
  //   }),
  //   name: 'Documentations',
  //   icon: <NotepadText style={ICON_STYLE} />,
  // },
  {
    key: MENU_PATH.USERS.key,
    pathname: MENU_PATH.USERS.pathname,
    label: getLink({
      label: 'Users',
      path: MENU_PATH.USERS.pathname,
    }),
    name: 'Users',
    icon: <Users style={ICON_STYLE} />,
  },

  {
    key: 'settings',
    pathname: '/settings',
    label: getLink({
      label: 'Settings',
      path: '/settings',
    }),
    name: 'Settings',
    icon: <Settings style={ICON_STYLE} />,
  },
];

export const ADMIN_ROUTES: IRoute[] = [
  {
    key: MENU_PATH.DASHBOARD.key,
    pathname: MENU_PATH.DASHBOARD.pathname,
    label: getLink({
      label: 'Dashboard',
      path: MENU_PATH.DASHBOARD.pathname,
    }),
    name: 'Dashboard',
    icon: <HomeOutlined style={ICON_STYLE} />,
  },
];

export const USER_ROUTES: IRoute[] = [
  {
    key: MENU_PATH.DASHBOARD.key,
    pathname: MENU_PATH.DASHBOARD.pathname,
    label: getLink({
      label: 'Dashboard',
      path: MENU_PATH.DASHBOARD.pathname,
    }),
    name: 'Dashboard',
    icon: <HomeOutlined style={ICON_STYLE} />,
  },
];

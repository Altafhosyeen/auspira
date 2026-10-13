import {
  CommentOutlined,
  FileProtectOutlined,
  IdcardOutlined,
  ProjectOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { HandCoins } from 'lucide-react';
import { OPTIONAL_DOCS, REQUIRED_DOCS } from '@/constants/project.constants';

export const PARENT_ROUTES = [
  { path: 'projects', title: 'Projects', icon: <ProjectOutlined /> },
  { path: 'contracts', title: 'Contracts', icon: <FileProtectOutlined /> },
  {
    path: 'compensation-event',
    title: 'Compensation Event',
    icon: <HandCoins size={16} />,
  },
  {
    path: 'operational-control-agent',
    title: 'Operational Control Agent',
    icon: <CommentOutlined />,
  },
  { path: 'settings', title: 'Settings', icon: <SettingOutlined /> },
  { path: 'users', title: 'Users', icon: <IdcardOutlined /> },
  {
    path: 'contract-control-agent',
    title: 'Contract Control Agent',
    icon: <FileProtectOutlined />,
  },
] as const;

export type ParentRoutePath = (typeof PARENT_ROUTES)[number]['path'];

export type BreadcrumbDefinition = {
  label: string;
  parent?: ParentRoutePath;
  chain?: string[];
  /** Overrides the rendered parent-crumb text/icon for this route only (leaves `parent`'s
   *  shared PARENT_ROUTES entry — and every other route using it — untouched). */
  parentLabel?: string;
};

type ParentBreadcrumbRoutes = Record<string, Omit<BreadcrumbDefinition, 'parent'>>;

/** Document-review pages are reached from the Contract Registry, so each one gets a
 *  Registry crumb ahead of it. Labels are derived from the same REQUIRED_DOCS /
 *  OPTIONAL_DOCS entries the registry renders, so the two cannot drift apart. */
const defineDocumentReviewRoutes = (): ParentBreadcrumbRoutes =>
  Object.fromEntries(
    [...REQUIRED_DOCS, ...OPTIONAL_DOCS]
      .filter((doc): doc is typeof doc & { url: string } => Boolean(doc.url))
      .map((doc) => [
        // Strip the `?type=` query the optional docs carry — patterns match on path only.
        doc.url.split('?')[0],
        { label: doc.label, chain: ['/projects/contracts'] },
      ])
  );

const defineParentRoutes = (
  parent: ParentRoutePath,
  routes: ParentBreadcrumbRoutes
): Record<string, BreadcrumbDefinition> =>
  Object.fromEntries(Object.entries(routes).map(([path, route]) => [path, { ...route, parent }]));

// Manual breadcrumb definitions (ONLY THESE will render)
export const BREADCRUMB_MAP: Record<string, BreadcrumbDefinition> = {
  ...defineParentRoutes('projects', {
    '/': { label: 'NEC Project' },
    '/projects': { label: 'All Projects' },
    '/projects/signals': { label: 'Awareness Triage / All Awareness' },
    '/projects/signals/:id': {
      label: 'Review Signal',
      chain: ['/projects/signals'],
    },
    '/projects/awareness': { label: 'Awareness Triage / All Awareness' },
    '/projects/awareness/:id': {
      label: 'Review Signal',
      chain: ['/projects/awareness'],
    },
    '/projects/:id': {
      label: 'Project Onboarding',
      chain: ['/'],
    },
  }),
  /* --------------- /contracts/NEC Project / contract registry -------------- */
  ...defineParentRoutes('contracts', {
    '/projects/contracts': { label: 'NEC Project / Contract Registry' },
    // Document-review screens opened from the registry's "View" action.
    ...defineDocumentReviewRoutes(),
  }),

  /* ------ Compensation Event is its own top-level nav item, not a Contracts child ----- */
  ...defineParentRoutes('compensation-event', {
    '/contract-control-agent/compensation-event': { label: 'CE Register' },
    '/contract-control-agent/compensation-event/new': {
      label: 'Create Compensation Event',
      chain: ['/contract-control-agent/compensation-event'],
    },
    '/contract-control-agent/compensation-event/:id': {
      label: 'CE Detail',
      chain: ['/contract-control-agent/compensation-event'],
    },
    // The assessment is opened off the quotation screen, but both hang off the same alert
    // id, so the crumb links back to the register rather than to a positionally-resolved
    // quotation href that would not survive the differing path shapes.
    '/contract-control-agent/compensation-event/:id/assessment': {
      label: 'PM Assessment',
      chain: ['/contract-control-agent/compensation-event'],
    },
    '/contract-control-agent/compensation-event/quotation/:id': {
      label: 'Contractor Quotation',
      chain: ['/contract-control-agent/compensation-event'],
    },
    '/contract-control-agent/compensation-event/quotation/detail/:id': {
      label: 'Quotation',
      chain: ['/contract-control-agent/compensation-event'],
    },
  }),

  ...defineParentRoutes('users', {
    '/users': { label: 'Users' },
  }),

  ...defineParentRoutes('settings', {
    '/settings/profile': { label: 'Profile' },
  }),

  ...defineParentRoutes('operational-control-agent', {
    '/operational-control-agent/reporting': { label: 'Project Reporting' },
    '/operational-control-agent/reporting/:id': {
      label: 'Daily Site Report Details',
      chain: ['/operational-control-agent/reporting'],
    },
    '/operational-control-agent/program-health': { label: 'Program Health' },
    '/operational-control-agent/program-health/:id': {
      label: 'Programme Received',
      chain: ['/operational-control-agent/program-health'],
    },
    '/operational-control-agent/request-for-information': {
      label: 'Request for Information',
    },
    '/operational-control-agent/resource-management': { label: 'Resource Management' },
  }),

  ...defineParentRoutes('contract-control-agent', {
    '/contract-control-agent/early-warning-register': { label: 'Early Warning Register' },
    '/contract-control-agent/early-warning-register/:id': {
      label: 'Notice',
      chain: ['/contract-control-agent/early-warning-register'],
    },
    '/contract-control-agent/early-warning-register/detail/:id': {
      label: 'Early Warning',
      chain: ['/contract-control-agent/early-warning-register'],
    },
    '/contract-control-agent/early-warning-register/risk-reduction-meeting/:id': {
      label: 'Early Warning Meeting',
      chain: [
        '/contract-control-agent/early-warning-register',
        '/contract-control-agent/early-warning-register/detail/:id',
      ],
    },
    '/contract-control-agent/early-warning': { label: 'Early Warning Register' },
    '/contract-control-agent/early-warning/register': {
      label: 'Create Early Warning Register',
      chain: ['/contract-control-agent/early-warning'],
    },
    '/contract-control-agent/early-warning/:id': {
      label: 'Early Warning Detail',
      chain: ['/contract-control-agent/early-warning'],
    },
    '/contract-control-agent/early-warning/:id/meeting/:meetingId': {
      label: 'Early Warning Meeting',
      chain: ['/contract-control-agent/early-warning', '/contract-control-agent/early-warning/:id'],
    },
    '/contract-control-agent/action-queues': { label: 'Action Queues' },
    '/contract-control-agent/project-management-instruction': {
      label: "Project Manager's Instruction / PMI Register",
    },
    '/contract-control-agent/project-management-instruction/:id': {
      label: 'PMI Detail',
      chain: ['/contract-control-agent/project-management-instruction'],
    },
    '/contract-control-agent/project-management-instruction/register': {
      label: 'New PMI',
      chain: ['/contract-control-agent/project-management-instruction'],
    },
    '/contract-control-agent/defect-notices': { label: 'Defect Notices' },
    '/projects/watchtower-queue': {
      label: 'Watchtower & Action Queue',
      parentLabel: 'Awareness',
    },
    '/contract-control-agent/register': { label: 'Register Early Warning' },
    '/contract-control-agent/early-watchtower': { label: 'Watchtower' },
    '/contract-control-agent/early-watchtower/:id': {
      label: 'Review — Contractor Email',
      chain: ['/contract-control-agent/early-watchtower'],
    },
    '/contract-control-agent/early-watchtower/:id/register': {
      label: 'Register Early Warning',
      chain: [
        '/contract-control-agent/early-watchtower',
        '/contract-control-agent/early-watchtower/:id',
      ],
    },
  }),
};

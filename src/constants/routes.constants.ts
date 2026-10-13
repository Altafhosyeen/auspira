export const MENU_PATH = {
  DASHBOARD: {
    pathname: '/',
    key: '1',
  },
  PROJECTS: {
    pathname: '/projects',
    key: '1-1',
  },
  PROJECTS_AWARENESS: {
    pathname: '/projects/signals',
    key: '1-2',
  },
  PROJECTS_AWARENESS_NEW: {
    pathname: '/projects/awareness',
    key: '1-3',
  },
  PROJECTS_WATCHTOWER_QUEUE: {
    pathname: '/projects/watchtower-queue',
    key: '1-4',
  },
  CONTRACTS: {
    pathname: '/projects/contracts',
    key: '1-5',
  },

  // CLASSIFICATORS: {
  //   pathname: '/system/classifiers',
  //   key: '2-1',
  // },
  // ADMINISTRATORS: {
  //   pathname: '/system/administrators/new',
  //   key: '2-2',
  // },
  // ADMINISTRATOR_ROLES: {
  //   pathname: '/system/roles',
  //   key: '2-3',
  // },
  // GRADES: {
  //   pathname: '/system/grades',
  //   key: '2-4',
  // },
  // SETTINGS: {
  //   pathname: '/system/settings',
  //   key: '2-5',
  // },
  // AGENT: {
  //   pathname: '/system/agent',
  //   key: '2-6',
  // },
  // USERS: {
  //   pathname: '/system/users',
  //   key: '2-7',
  // },
  // INTEGRATIONS: {
  //   pathname: '/system/integrations',
  //   key: '2-8',
  // },

  // FINANCE
  OPERATIONAL_CONTROL_AGENT: {
    pathname: '/operational-control-agent',
    key: '3',
  },
  OCA_REPORTING: {
    pathname: '/operational-control-agent/reporting',
    key: '3-1',
  },
  OCA_PROGRAM_HEALTH: {
    pathname: '/operational-control-agent/program-health',
    key: '3-2',
  },
  OCA_REQUEST_FOR_INFORMATION: {
    pathname: '/operational-control-agent/request-for-information',
    key: '3-3',
  },
  OCA_RESOURCE_MANAGEMENT: {
    pathname: '/operational-control-agent/resource-management',
    key: '3-4',
  },

  AI_ASSISTANT: {
    pathname: '/ai-assistant',
    key: '4',
  },

  DOCUMENTATIONS: {
    pathname: '/documentations',
    key: '5',
  },

  USERS: {
    pathname: '/users',
    key: '6',
  },

  ACCOUNT_SETTINGS: {
    pathname: '/account-settings',
    key: '7',
  },
  CCA: {
    pathname: '/contract-control-agent',
    key: '8',
  },
  CCA_EARLY_WARNING_REGISTER: {
    pathname: '/contract-control-agent/early-warning-register',
    key: '8-1',
  },
  CCA_EARLY_WARNING_NEW: {
    pathname: '/contract-control-agent/early-warning',
    key: '8-7',
  },
  CCA_ACTION_QUEUES: {
    pathname: '/contract-control-agent/action-queues',
    key: '8-2',
  },
  WATCH_TOWER: {
    pathname: '/contract-control-agent/early-watchtower',
    key: '8-3',
  },
  CCA_REGISTER: {
    pathname: '/contract-control-agent/register',
    key: '8-5',
  },
  COMPENSATION_EVENT: {
    pathname: '/contract-control-agent/compensation-event',
    key: '8-9',
  },
  CCA_PROJECT_MANAGEMENT_INSTRUCTION: {
    pathname: '/contract-control-agent/project-management-instruction',
    key: '8-10',
  },
  CCA_DEFECT_NOTICES: {
    pathname: '/contract-control-agent/defect-notices',
    key: '8-11',
  },
};

export const NON_MENU_PATHS = {
  // AUTH
  LOGIN: '/login',
  ORGANIZATION_REGISTRATION: '/organization-registration',
  VERIFY_EMAIL: '/verify-email',
  SET_PASSWORD: '/set-password',
  WELCOME_BACK: '/welcome-back',
  OTP: '/otp',
  FORGET_PASSWORD: '/forget-password',
};

/**
 * The "raise a new instruction" screen under the PMI register. Derived from the
 * menu entry so the two cannot drift apart.
 */
export const PMI_REGISTER_PATH =
  `${MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname}/register` as const;

/**
 * Route prefixes that require an authenticated session.
 * Single source of truth consumed by middleware.ts (both the `authorized`
 * callback and the matcher must stay in sync with this list).
 * '/' is matched exactly; every other entry matches as a prefix.
 */
export const PROTECTED_ROUTES = [
  '/',
  MENU_PATH.PROJECTS.pathname,
  MENU_PATH.USERS.pathname,
  '/finance',
  NON_MENU_PATHS.WELCOME_BACK,
  '/settings',
  MENU_PATH.CCA.pathname,
  MENU_PATH.OPERATIONAL_CONTROL_AGENT.pathname,
] as const;

export const MENU_PATH_NAMES = {
  login: 'Login',
  home: 'Home',
  users: 'Users',
  projects: 'Projects',
  contracts: 'Contracts',
  operationalControlAgent: 'Operational Control Agent',
  aiAssistant: 'AI Assistant',
  documentations: 'Documentations',
};

export const AGENCY_PERFORMANCE_TAB = 4;

/**
 * The Program Health detail. Its route id is either a programme health id (a register
 * row) or a project alert id (the id the Awareness "Open" action navigates with), and the
 * two live in different APIs — so the screen is told which one it is looking at.
 */
export const PROGRAMME_HEALTH_PATH = MENU_PATH.OCA_PROGRAM_HEALTH.pathname;

/**
 * Marks the Program Health detail as opened from an Awareness signal: it is then read off
 * GET /api/project-alerts/{id}, because nothing has been accepted yet and no programme
 * health record exists. An absent flag means the register, which reads GET /api/programme/{id}.
 */
export const PROGRAMME_SOURCE_AWARENESS = 'Awareness' as const;

/**
 * Builds the Program Health detail URL for an alert row. The alert id travels in the path, so
 * the register's own links (a programme health id, no flag) are never confused with this one.
 */
export const buildProgrammeDetailPathFromAlert = (alertId: string): string =>
  `${PROGRAMME_HEALTH_PATH}/${alertId}?source=${PROGRAMME_SOURCE_AWARENESS}`;

/**
 * Marks a PMI draft as originating from the cross-reference flow. The register
 * screen reads this to prefill the instruction from the resolved data point.
 */
export const PMI_SOURCE_CROSS_REFERENCE = 'CrossReference' as const;

/**
 * Builds the PMI register URL for a data point that was just resolved in the
 * cross-reference screen, carrying the source flag, the cross-reference id, the
 * data point's name and the value the user agreed on.
 *
 * The name is what the register prints under its heading, so it is passed explicitly
 * rather than left for the register to look up.
 */
export const buildPmiRegisterPathFromCrossReference = (
  projectCrossReferenceId: string,
  value: string,
  dataPointName: string,
  isContractRoute = false
): string => {
  const params = new URLSearchParams({
    source: PMI_SOURCE_CROSS_REFERENCE,
    projectCrossReferenceId,
    value,
    dataPoint: dataPointName,
  });
  // Only written when set — the register reads its presence, so an absent flag and a
  // "false" one must not look the same in the query string.
  if (isContractRoute) params.set('contractRoute', 'true');
  return `${PMI_REGISTER_PATH}?${params.toString()}`;
};

/** Query keys the Contract Registry reads on arrival: which tab to open, and which
 *  cross-reference finding to open in that tab's detail drawer. */
export const CONTRACT_REGISTRY_TAB_PARAM = 'tab';
export const CONTRACT_REGISTRY_CROSS_REFERENCE_PARAM = 'crossReferenceId';
/** The Contract Registry's Cross-reference tab key. */
export const CONTRACT_REGISTRY_CROSS_REFERENCE_TAB = '7';

/**
 * Deep link into the Contract Registry's Cross-reference tab with one finding's drawer
 * open — how a PMI raised from a finding leads back to the finding it was raised over.
 */
export const buildContractCrossReferencePath = (projectCrossReferenceId: string): string => {
  const params = new URLSearchParams({
    [CONTRACT_REGISTRY_TAB_PARAM]: CONTRACT_REGISTRY_CROSS_REFERENCE_TAB,
    [CONTRACT_REGISTRY_CROSS_REFERENCE_PARAM]: projectCrossReferenceId,
  });
  return `${MENU_PATH.CONTRACTS.pathname}?${params.toString()}`;
};

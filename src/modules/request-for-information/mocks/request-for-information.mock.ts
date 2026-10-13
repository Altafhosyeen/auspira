import type {
  CompensationEventAuditEntry,
  CompensationEventEvidenceFile,
} from '@/modules/compensation-event';
import { REQUEST_FOR_INFORMATION_CLAUSE } from '../constants/request-for-information.constants';
import type {
  RequestForInformation,
  RequestForInformationThreadMessage,
} from '../types/request-for-information.types';

// Demo data behind `USE_MOCK_REQUEST_FOR_INFORMATION` — shown only when the real API
// errors or returns empty, so the register stays navigable while the backend RFI
// endpoints are still being built.
export const MOCK_REQUEST_FOR_INFORMATION_LIST: RequestForInformation[] = [
  {
    id: 'mock-rfi-024',
    projectName: 'Westfield Development Project',
    reference: 'RFI-024',
    title: 'Lap length for 32mm bars, capping beam',
    description:
      'Please confirm the required lap length for 32mm reinforcement bars in the capping beam, as the drawing detail conflicts with the project specification.',
    status: 'OPEN',
    raisedByName: 'David Thompson',
    raisedByRole: "Employer's PM",
    raisedToName: 'Sarah Mitchell',
    dueDate: '2026-07-20',
    dateIssued: '2026-08-20',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
    clauseNumber: REQUEST_FOR_INFORMATION_CLAUSE.number,
    clauseDescription: REQUEST_FOR_INFORMATION_CLAUSE.description,
    costImpact: 1200,
    currency: 'GBP',
    daysImpact: 2,
  },
  {
    id: 'mock-rfi-023',
    projectName: 'Westfield Development Project',
    reference: 'RFI-023',
    title: 'Fender chain grade clarification',
    description:
      'Clarification requested on the required grade for the fender chain assembly at Berth 2.',
    status: 'CLOSED',
    raisedByName: 'Sarah Mitchell',
    raisedByRole: "Employer's PM",
    raisedToName: 'David Thompson',
    dueDate: '2026-07-15',
    dateIssued: '2026-08-12',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
    clauseNumber: REQUEST_FOR_INFORMATION_CLAUSE.number,
    clauseDescription: REQUEST_FOR_INFORMATION_CLAUSE.description,
    costImpact: 0,
    currency: 'GBP',
    daysImpact: 0,
  },
  {
    id: 'mock-rfi-022',
    projectName: 'Westfield Development Project',
    reference: 'RFI-022',
    title: 'Dolphin pile toe level',
    description: 'Confirmation required on the design toe level for the dolphin piles.',
    status: 'CLOSED',
    raisedByName: 'David Thompson',
    raisedByRole: "Employer's PM",
    raisedToName: 'Sarah Mitchell',
    dueDate: '2026-07-09',
    dateIssued: '2026-08-01',
    createdAt: '2026-07-09T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
    clauseNumber: REQUEST_FOR_INFORMATION_CLAUSE.number,
    clauseDescription: REQUEST_FOR_INFORMATION_CLAUSE.description,
  },
  {
    id: 'mock-rfi-021',
    projectName: 'Westfield Development Project',
    reference: 'RFI-021',
    title: 'Berth 3 dredge tolerance',
    description: 'Query on the permitted over-dredge tolerance for Berth 3.',
    status: 'OPEN',
    raisedByName: 'Sarah Mitchell',
    raisedByRole: "Employer's PM",
    raisedToName: 'David Thompson',
    dueDate: '2026-07-05',
    dateIssued: '2026-07-10',
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z',
    clauseNumber: REQUEST_FOR_INFORMATION_CLAUSE.number,
    clauseDescription: REQUEST_FOR_INFORMATION_CLAUSE.description,
  },
  {
    id: 'mock-rfi-020',
    projectName: 'Westfield Development Project',
    reference: 'RFI-024',
    title: 'Tidal window for cofferdam dewatering',
    description: 'Request for the acceptable tidal window to safely dewater the cofferdam.',
    status: 'OPEN',
    raisedByName: 'David Thompson',
    raisedByRole: "Employer's PM",
    raisedToName: 'Sarah Mitchell',
    dueDate: '2026-07-20',
    dateIssued: '2026-07-10',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
    clauseNumber: REQUEST_FOR_INFORMATION_CLAUSE.number,
    clauseDescription: REQUEST_FOR_INFORMATION_CLAUSE.description,
  },
];

// Demo Email Thread tab content, keyed by RFI id — shown only while the real
// entity-conversations endpoint has nothing for a mock RFI's id (it always will, since
// mock ids don't exist as real backend entities). Remove alongside the mock list once
// the real RFI API ships and every id is a genuine entity.
export const MOCK_REQUEST_FOR_INFORMATION_THREAD: Record<
  string,
  RequestForInformationThreadMessage[]
> = {
  'mock-rfi-024': [
    {
      id: 'mock-rfi-024-msg-3',
      authorName: 'Sarah Mitchell',
      subject: 'RE: RFI-024 — Lap length for 32mm bars, capping beam',
      body: 'Reviewing the conflicting detail against the spec now — response due by 20 Aug.',
      sentAt: '2026-08-14T10:05:00Z',
    },
    {
      id: 'mock-rfi-024-msg-2',
      authorName: 'David Thompson',
      subject: 'RE: RFI-024 — Lap length for 32mm bars, capping beam',
      body: 'Attached the marked-up drawing showing the conflict against Section 3.2 of the spec.',
      sentAt: '2026-07-22T14:30:00Z',
    },
    {
      id: 'mock-rfi-024-msg-1',
      authorName: 'David Thompson',
      subject: 'RFI-024 — Lap length for 32mm bars, capping beam',
      body: 'Please confirm the required lap length for 32mm reinforcement bars in the capping beam, as the drawing detail conflicts with the project specification.',
      sentAt: '2026-07-20T09:00:00Z',
    },
  ],
  'mock-rfi-023': [
    {
      id: 'mock-rfi-023-msg-1',
      authorName: 'Sarah Mitchell',
      subject: 'RFI-023 — Fender chain grade clarification',
      body: 'Clarification requested on the required grade for the fender chain assembly at Berth 2.',
      sentAt: '2026-07-15T09:00:00Z',
    },
  ],
};

// Demo Documents tab content, keyed by RFI id — same fallback reasoning as the thread
// mock above. Mock rows carry no `filePath`, so the tab's download action degrades to
// the "cannot be downloaded yet" notice rather than hitting a real blob URL.
export const MOCK_REQUEST_FOR_INFORMATION_DOCUMENTS: Record<
  string,
  CompensationEventEvidenceFile[]
> = {
  'mock-rfi-024': [
    {
      id: 'mock-rfi-024-doc-1',
      name: 'Capping-Beam-Reinforcement-Detail-Rev-C.pdf',
      kind: 'PDF',
      sizeBytes: 2_411_520,
      uploadedAt: '2026-07-20T09:00:00Z',
      uploadedByName: 'David Thompson',
    },
    {
      id: 'mock-rfi-024-doc-2',
      name: 'Project-Specification-Section-3.2.pdf',
      kind: 'PDF',
      sizeBytes: 5_872_640,
      uploadedAt: '2026-07-20T09:00:00Z',
      uploadedByName: 'David Thompson',
    },
    {
      id: 'mock-rfi-024-doc-3',
      name: 'Marked-Up-Drawing-Conflict.jpg',
      kind: 'IMAGE',
      sizeBytes: 891_200,
      uploadedAt: '2026-07-22T14:30:00Z',
      uploadedByName: 'David Thompson',
    },
  ],
  'mock-rfi-023': [
    {
      id: 'mock-rfi-023-doc-1',
      name: 'Fender-Chain-Assembly-Spec.docx',
      kind: 'DOCX',
      sizeBytes: 314_880,
      uploadedAt: '2026-07-15T09:00:00Z',
      uploadedByName: 'Sarah Mitchell',
    },
  ],
};

// Demo Audit Trail tab content, keyed by RFI id — real `CompensationEventAuditEntry` rows
// so it renders through the same `AuditTimelineRow` the tab already uses; same fallback
// reasoning as the mocks above. `actorParty` is always 'PM' since every mock actor here is
// the Employer's PM side, not a system or contractor action.
export const MOCK_REQUEST_FOR_INFORMATION_AUDIT_TRAIL: Record<
  string,
  CompensationEventAuditEntry[]
> = {
  'mock-rfi-024': [
    {
      id: 'mock-rfi-024-audit-3',
      action: 'UPDATED',
      actorName: 'Sarah Mitchell',
      actorRole: "Employer's PM",
      actorParty: 'PM',
      isSender: false,
      details: 'Status moved to Open — response drafting in progress.',
      occurredAt: '2026-08-20T09:00:00Z',
    },
    {
      id: 'mock-rfi-024-audit-2',
      action: 'DOCUMENT_UPLOADED',
      actorName: 'David Thompson',
      actorRole: "Employer's PM",
      actorParty: 'PM',
      isSender: false,
      details: 'Marked-up drawing attached showing the lap-length conflict.',
      occurredAt: '2026-07-22T14:30:00Z',
    },
    {
      id: 'mock-rfi-024-audit-1',
      action: 'CREATED',
      actorName: 'David Thompson',
      actorRole: "Employer's PM",
      actorParty: 'PM',
      isSender: false,
      details: 'RFI-024 raised against Sarah Mitchell.',
      occurredAt: '2026-07-20T09:00:00Z',
    },
  ],
  'mock-rfi-023': [
    {
      id: 'mock-rfi-023-audit-2',
      action: 'CLOSED',
      actorName: 'David Thompson',
      actorRole: "Employer's PM",
      actorParty: 'PM',
      isSender: false,
      details: 'Grade confirmed — RFI closed.',
      occurredAt: '2026-08-12T09:00:00Z',
    },
    {
      id: 'mock-rfi-023-audit-1',
      action: 'CREATED',
      actorName: 'Sarah Mitchell',
      actorRole: "Employer's PM",
      actorParty: 'PM',
      isSender: false,
      details: 'RFI-023 raised against David Thompson.',
      occurredAt: '2026-07-15T09:00:00Z',
    },
  ],
};

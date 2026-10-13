import { parseBackendDate } from '@/lib/utils';
import { PROJECT_DAILY_REPORT_PROGRESS_ON_TRACK_THRESHOLD } from '../constants/project-daily-report.constants';
import { REGISTER_COLORS } from '../constants/project-daily-report-register.theme';
import type {
  DailySiteReportConversationDto,
  ProjectDailyReportThreadMessage,
} from '../types/project-daily-report.types';

// The register prints progress as a bare coloured percentage rather than a bar, so the colour
// is the only thing carrying whether a day was on track. Derived in one place so the table and
// any later summary tile cannot drift onto different thresholds.
export const getProgressColor = (progress: number) =>
  progress >= PROJECT_DAILY_REPORT_PROGRESS_ON_TRACK_THRESHOLD
    ? REGISTER_COLORS.progressOnTrack
    : REGISTER_COLORS.progressBehind;

// Clamped before display: a backend that reports 103% or -4% should still print a percentage
// the column can render, not a value that breaks the row.
export const formatProgress = (progress: number) =>
  `${Math.round(Math.min(100, Math.max(0, progress)))}%`;

/** Saves a fetched attachment blob — mirrors the PMI and Defect Notice download helpers. */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/* -------------------------------------------------------------------------- */
/* Email thread rows (shared conversations endpoint)                           */
/* -------------------------------------------------------------------------- */

/** Strips an email body down to a one-line preview — drops style blocks, tags and entities. */
const toSnippet = (html?: string | null): string =>
  (html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatThreadTime = (iso?: string): string => {
  const date = parseBackendDate(iso);
  if (!date) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Normalises the shared conversation rows onto the thread-list view model. The
// conversationId is carried through because it is what `EmailThreadModal` fetches the
// thread with — the row's own id is only a fallback key for a conversation the API
// returned without one.
export const toProjectDailyReportThreadMessages = (
  conversations: DailySiteReportConversationDto[]
): ProjectDailyReportThreadMessage[] => {
  if (!Array.isArray(conversations)) return [];
  return (
    conversations
      .map((msg, index) => {
        const conversationId = msg.conversationId || undefined;
        return {
          id: conversationId ?? `thread-${index}`,
          conversationId,
          authorName: msg.senderEmail || 'Unknown sender',
          subject: msg.subject || undefined,
          body: toSnippet(msg.body),
          sentAt: formatThreadTime(msg.timestampUtc),
        };
      })
      // A body that reduces to nothing under the snippet rules carries no correspondence worth
      // listing, so the row is dropped rather than shown as an empty thread.
      .filter((message) => message.body !== '')
  );
};

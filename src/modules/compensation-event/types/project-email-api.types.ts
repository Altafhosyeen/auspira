// Wire shapes for the ProjectEmails endpoints used by the Email Thread tab. Swagger
// documents neither response schema (no `$ref`) — this mirrors the shape confirmed by
// the working `EmailThreadModal` / `EarlyWarningThreadsPanel` implementations elsewhere
// in the app, which already call these same two endpoints in production.

export interface ProjectEmailAttachmentDto {
  url: string;
  name: string;
  contentType?: string | null;
}

/** One row of GET /api/project-emails/thread. */
export interface ProjectEmailMessageDto {
  id: string;
  provider: number | string;
  type: string;
  userEmail: string;
  userId: string;
  timestampUtc: string;
  subject: string;
  body?: string | null;
  conversationId: string;
  messageId: string;
  boxType: number | string;
  senderEmail: string | null;
  ccEmails: string | null;
  toEmails: string | null;
  source: string;
  attachmentUrls?: ProjectEmailAttachmentDto[];
}

/** One row of GET /api/project-emails/{entityId}/conversations. */
export interface EntityConversationDto {
  conversationId: string;
  subject: string;
  body?: string | null;
  senderEmail: string | null;
  timestampUtc: string;
  /** Total messages in this conversation — lets a caller page /project-emails/thread. */
  count: number;
}

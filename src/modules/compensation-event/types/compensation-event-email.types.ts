export interface ComposeEmailValues {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
}

export type ComposeEmailDefaults = Partial<ComposeEmailValues>;

// Toolbar actions are `document.execCommand` names — see the editor component for why.
export interface EmailEditorCommand {
  command: string;
  value?: string;
}

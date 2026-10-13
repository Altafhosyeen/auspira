import { IProgramStagesButton } from './program-stages.types';

export interface IEmailTemplate {
  id: string;
  name: string;
  subject: string;
  title: string;
  body: string;
  slug: string;
  desc: string;
  context: string;
  receiver: string;
  allowed_contexts: string;
  allowed_contexts_list: string[];
  buttons: IProgramStagesButton[];
  created_at: string | null;
  updated_at: string | null;
}

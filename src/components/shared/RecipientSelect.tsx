'use client';

import { Select, type SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useGetContactPersons } from '@/hooks/modules/project';
import type { ContactPerson } from '@/types/project/selection.types';

/**
 * `mode="tags"` keeps every recipient field free-text — the contact list is a convenience, so a
 * one-off address that was never added to the project still goes through. `optionLabelProp="value"`
 * makes the selected tag read as the bare address rather than the rich two-line dropdown label.
 * Collapsing to one visible tag keeps the field from growing with a long recipient list — the
 * rest sit behind a "+N more" tag that expands on click.
 */
export const RECIPIENT_SELECT_PROPS: SelectProps = {
  mode: 'tags',
  showSearch: true,
  allowClear: true,
  // Semicolons included so a recipient list pasted out of Outlook splits into tags.
  tokenSeparators: [',', ' ', ';'],
  optionLabelProp: 'value',
  maxTagCount: 1,
  maxTagPlaceholder: (omittedValues) => `+${omittedValues.length} more`,
};

const toRecipientOptions = (contacts?: ContactPerson[]): DefaultOptionType[] =>
  (contacts ?? [])
    .filter((contact) => !!contact.email)
    .map((contact) => ({
      value: contact.email!,
      // Two-line label: who they are on top, address underneath. `optionLabelProp="value"` on
      // the Select means the chosen tag still collapses to the bare address.
      label: (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {contact.role && (
              <span className="ds-micro! rounded-full bg-blue-100 px-2 py-0.5 font-semibold! text-blue-700">
                {contact.role}
              </span>
            )}
            <span className="ds-caption! font-semibold! text-slate-800">
              {contact.name || contact.email}
            </span>
          </div>
          <span className="ds-micro! text-slate-500">{contact.email}</span>
        </div>
      ),
    }));

/** Project contact persons as To/Cc/Bcc suggestions — shared by every recipient Select in the app. */
export const useRecipientOptions = (projectId?: string) => {
  const { data: contactPersons, isFetching } = useGetContactPersons<ContactPerson[]>(projectId);

  return {
    options: toRecipientOptions(contactPersons),
    isLoading: isFetching,
    noRecipientsHint: projectId
      ? 'No contact persons found for this project'
      : 'Select a project first',
  };
};

export interface RecipientSelectProps extends Omit<SelectProps, 'mode' | 'optionLabelProp'> {
  options?: DefaultOptionType[];
  loading?: boolean;
}

/** Recipient multi-select for To/Cc/Bcc fields — free-text tags plus project-contact suggestions,
 * collapsing to a "+N more" tag once more than one recipient is picked. */
export const RecipientSelect = ({ options, loading, ...rest }: RecipientSelectProps) => (
  <Select {...RECIPIENT_SELECT_PROPS} options={options} loading={loading} {...rest} />
);

import React from 'react';
import { ListChecks } from 'lucide-react';
import type { MissingField } from './request-missing-info.data';

const RequestedFieldsCard = ({ fields }: { fields: MissingField[] }) => {
  if (!fields.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <span className="badge-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <ListChecks className="h-4 w-4" />
        </span>
        <h4 className="ds-body-strong text-text">Missing fields requested</h4>
      </div>
      <ul className="mt-4 space-y-3.5">
        {fields.map((field) => (
          <li
            key={field.id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
          >
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${field.dotClass}`} />
            <span className="ds-caption text-text font-semibold">{field.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestedFieldsCard;

'use client';

import { ReactNode } from 'react';
import { Input, Tag } from 'antd';
import { MoveLeft } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
interface Props {
  title?: string;
  name?: string;
  refId?: string;
  description?: string;
  onCancel?: () => void;
  onSave?: () => void;
  loading?: boolean;
  actions?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  backText?: string;
  backURL?: string;
  setSearchText?: (text: string) => void;
}

function EditHeader({
  title,
  name,
  refId,
  description,
  onCancel,
  onSave,
  loading,
  actions,
  showSearch = false,
  searchPlaceholder = 'Search...',
  backText,
  backURL,
  setSearchText,
}: Props) {
  const router = useRouter();
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        {backText && (
          <div
            className="mb-1 flex cursor-pointer items-center gap-1 font-semibold text-blue-800"
            onClick={backURL ? () => router.push(backURL) : onCancel}
          >
            <MoveLeft />
            <p>{backText}</p>
          </div>
        )}
        <p className="flex items-end gap-2 text-2xl font-semibold">
          {title && <span className="text-xl font-normal text-[#1E1E1E]">{title}</span>}
          {name && <span className="text-xl font-normal text-[#1E1E1E]">{name}</span>}
          {refId && <Tag color="default">Ref ID: {refId}</Tag>}
        </p>

        {description && <p className="mt-1 text-xs text-[#666666]">{description}</p>}

        {showSearch && (
          <Input.Search
            placeholder={searchPlaceholder}
            className="mt-2! w-96!"
            // value={searchText}
            allowClear
            onSearch={(value) => setSearchText?.(value)}
          />
        )}
      </div>

      <div className="flex gap-2">
        {actions ? (
          actions
        ) : (
          <>
            <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>

            <button
              onClick={onSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EditHeader;

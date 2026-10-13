import {
  CloseOutlined,
  LoadingOutlined,
  MailOutlined,
  PaperClipOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useRef } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { useDownloadAttachment } from '@/hooks/modules/attachments';
import { InfoCard } from '../EarlyWarningFormControls';
import { type EvidenceItem, EW_FORM_COPY, formatFileSize } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { labels } = EW_FORM_COPY;

/** Dedupe key for a picked file — lets re-adding the same file twice no-op. */
const fileKey = (file: File) => `${file.name}|${file.size}|${file.lastModified}`;

interface EvidenceCardProps {
  /** Files picked by the user. Owned by the form so they can be submitted with it. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  /**
   * Auto-attached evidence comes from the originating project alert, so it has nothing to show
   * when an EW is raised manually. The manual file picker stays either way.
   */
  showAutoAttached?: boolean;
  /** Real evidence derived from the originating alert's email conversation — empty when none. */
  autoAttachedItems?: EvidenceItem[];
  /** Opens the full conversation viewer for the "Email thread" row — omit to render it inert. */
  onEmailThreadClick?: () => void;
}

export const EvidenceCard = ({
  files,
  onFilesChange,
  showAutoAttached = true,
  autoAttachedItems = [],
  onEmailThreadClick,
}: EvidenceCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Auto-attached items point at private storage — downloads go through the backend proxy.
  const { mutate: downloadAttachment, isPending, variables } = useDownloadAttachment();

  const addFiles = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const seen = new Set(files.map(fileKey));
    const additions = Array.from(picked).filter((file) => !seen.has(fileKey(file)));
    if (additions.length > 0) onFilesChange([...files, ...additions]);
  };

  const removeFile = (index: number) => onFilesChange(files.filter((_, i) => i !== index));

  // The card is a `gap-6` flex column, so an empty list div would still take a slot and leave a
  // double gap between the title and the picker — with a divider above the picker separating it
  // from nothing. Drop both when there is nothing to list.
  const hasRows = (showAutoAttached && autoAttachedItems.length > 0) || files.length > 0;

  return (
    <InfoCard title={labels.evidenceAutoAttached} bordered stacked>
      {hasRows && (
        <div className={S.evidenceStack}>
          {showAutoAttached &&
            autoAttachedItems.map((item) => (
              <div key={item.id} className={S.evidenceRow}>
                <div className={S.evidenceLeft}>
                  {item.iconType === 'attachment' &&
                    (isPending && variables?.url === item.url ? (
                      <LoadingOutlined className={S.evidenceIcon} spin />
                    ) : (
                      <PaperClipOutlined className={S.evidenceIcon} />
                    ))}
                  {item.iconType === 'email' && <MailOutlined className={S.evidenceIcon} />}
                  {item.url ? (
                    <DisabledTooltip
                      disabled={isPending && variables?.url === item.url}
                      reason="Downloading this file — please wait."
                    >
                      <button
                        type="button"
                        disabled={isPending && variables?.url === item.url}
                        onClick={() => downloadAttachment({ url: item.url!, fileName: item.label })}
                        className={`${S.evidenceLabel} cursor-pointer text-left hover:underline disabled:cursor-wait`}
                      >
                        {item.label}
                      </button>
                    </DisabledTooltip>
                  ) : item.iconType === 'email' && onEmailThreadClick ? (
                    <button
                      type="button"
                      onClick={onEmailThreadClick}
                      className={`${S.evidenceLabel} text-left hover:underline`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className={S.evidenceLabel}>{item.label}</span>
                  )}
                </div>
                {item.isAuto && <span className={S.autoTag}>{EW_FORM_COPY.autoTag}</span>}
              </div>
            ))}

          {files.map((file, index) => (
            <div key={fileKey(file)} className={S.evidenceRow}>
              <div className={S.evidenceLeft}>
                <PaperClipOutlined className={S.evidenceIcon} />
                <span className={S.evidenceLabel} title={file.name}>
                  {file.name}
                </span>
                <span className={S.evidenceMeta}>{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                className={S.removeBtn}
              >
                <CloseOutlined className="text-[10px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={hasRows ? S.addMoreWrap : undefined}>
        <button type="button" onClick={() => inputRef.current?.click()} className={S.addMore}>
          <PlusOutlined className="text-[10px]" />
          {EW_FORM_COPY.addMoreDocuments}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ''; // allow re-picking the same file after removing it
          }}
        />
      </div>
    </InfoCard>
  );
};

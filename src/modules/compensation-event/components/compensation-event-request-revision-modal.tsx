import { DeleteOutlined, EyeOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Modal, notification, Popconfirm, Typography, Upload } from 'antd';
import { type ReactNode, useEffect, useState } from 'react';
import IconChip from '@/components/shared/icon-chip';
import { isAllowedUploadFile, UPLOAD_ACCEPT } from '@/lib/utils/upload-file-rules';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS } from '../constants/compensation-event-quotation.theme';

const copy = CONTRACTOR_QUOTATION_COPY.requestRevisionModal;
const { popconfirm } = CONTRACTOR_QUOTATION_COPY;

/** Dedupe key for a picked file — lets re-adding the same file twice no-op. */
const fileKey = (file: File) => `${file.name}|${file.size}|${file.lastModified}`;

interface CompensationEventRequestRevisionModalProps {
  open: boolean;
  sending?: boolean;
  onCancel: () => void;
  // The comment maps straight to the endpoint's `description`; the staged files travel as
  // real multipart `attachments`. `subject` has no field of its own on screen — the caller
  // fills it with a fixed default, since the endpoint still requires one.
  onConfirm: (values: { comment: string; attachments: File[] }) => void;
  /** Names the record in the send popconfirm — read off the API by the caller. */
  confirmDescription?: ReactNode;
}

const CompensationEventRequestRevisionModal = ({
  open,
  sending = false,
  onCancel,
  onConfirm,
  confirmDescription,
}: CompensationEventRequestRevisionModalProps) => {
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  // Controlled so the comment is checked before the popconfirm opens.
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Re-seed each time the modal opens so a previous request's draft never leaks into the next.
  useEffect(() => {
    if (open) {
      setComment('');
      setFiles([]);
      setConfirmOpen(false);
    }
  }, [open]);

  const addFiles = (picked: File[]) => {
    const valid = picked.filter(isAllowedUploadFile);
    if (!valid.length) return;
    const seen = new Set(files.map(fileKey));
    const additions = valid.filter((file) => !seen.has(fileKey(file)));
    if (additions.length) setFiles((current) => [...current, ...additions]);
  };

  const removeFile = (index: number) =>
    setFiles((current) => current.filter((_, i) => i !== index));

  const replaceFile = (index: number, replacement?: File) => {
    if (!replacement || !isAllowedUploadFile(replacement)) return;
    setFiles((current) => current.map((file, i) => (i === index ? replacement : file)));
  };

  const viewFile = (file: File) => window.open(URL.createObjectURL(file), '_blank');

  const handleConfirmClick = () => {
    if (!comment.trim()) {
      notification.error({ message: copy.commentRequired });
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      destroyOnHidden
      maskClosable={!sending}
      width={600}
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {copy.title}
        </Typography.Title>
      }
      footer={
        <Flex justify="end" gap={12}>
          <Button onClick={onCancel} disabled={sending}>
            {copy.cancel}
          </Button>
          <Popconfirm
            title={popconfirm.requestRevision.title}
            description={confirmDescription}
            okText={popconfirm.requestRevision.okText}
            cancelText={popconfirm.cancel}
            okButtonProps={{ loading: sending }}
            open={confirmOpen}
            onOpenChange={(next) => {
              if (!next) setConfirmOpen(false);
            }}
            onConfirm={() => onConfirm({ comment: comment.trim(), attachments: files })}
          >
            <Button type="primary" loading={sending} onClick={handleConfirmClick}>
              {copy.confirm}
            </Button>
          </Popconfirm>
        </Flex>
      }
    >
      <Flex vertical gap={20} style={{ paddingBlock: 12 }}>
        <Flex vertical gap={8}>
          <Typography.Text>{copy.commentLabel}</Typography.Text>
          <Input.TextArea
            rows={4}
            value={comment}
            placeholder={copy.commentPlaceholder}
            disabled={sending}
            onChange={(event) => setComment(event.target.value)}
          />
        </Flex>

        <Flex
          vertical
          gap={16}
          style={{
            border: `1px solid ${QUOTATION_COLORS.groupBoxBorder}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={10}>
              <IconChip icon={<UploadOutlined />} bordered />
              <Typography.Text strong>{copy.uploadTitle}</Typography.Text>
            </Flex>

            <Upload
              multiple
              accept={UPLOAD_ACCEPT}
              showUploadList={false}
              disabled={sending}
              beforeUpload={(file) => (isAllowedUploadFile(file) ? false : Upload.LIST_IGNORE)}
              onChange={({ fileList }) =>
                addFiles(
                  fileList
                    .map((entry) => entry.originFileObj as File | undefined)
                    .filter((file): file is File => Boolean(file))
                )
              }
            >
              <Button type="primary" icon={<UploadOutlined />} disabled={sending}>
                {copy.uploadButton}
              </Button>
            </Upload>
          </Flex>

          {files.length ? (
            <Flex vertical gap={8}>
              {files.map((file, index) => (
                <Flex
                  key={fileKey(file)}
                  align="center"
                  gap={8}
                  style={{
                    border: `1px solid ${QUOTATION_COLORS.groupBoxBorder}`,
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  <FileOutlined style={{ color: QUOTATION_COLORS.main, fontSize: 22 }} />
                  <Typography.Text ellipsis style={{ flex: 1, minWidth: 0 }}>
                    {file.name}
                  </Typography.Text>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => viewFile(file)} />
                  <Upload
                    maxCount={1}
                    accept={UPLOAD_ACCEPT}
                    showUploadList={false}
                    beforeUpload={(f) => (isAllowedUploadFile(f) ? false : Upload.LIST_IGNORE)}
                    onChange={({ fileList }) =>
                      replaceFile(index, fileList[0]?.originFileObj as File | undefined)
                    }
                  >
                    <Button size="small" icon={<UploadOutlined />} />
                  </Upload>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFile(index)}
                  />
                </Flex>
              ))}
            </Flex>
          ) : (
            <Flex vertical gap={2}>
              <Typography.Text type="secondary">{copy.uploadEmpty}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {copy.uploadSupported}
              </Typography.Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default CompensationEventRequestRevisionModal;

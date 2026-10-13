import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Col, DatePicker, Form, Input, InputNumber, Row, Skeleton, Tooltip } from 'antd';
import type { FormInstance } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Info } from 'lucide-react';
import { useGetProjectById } from '@/hooks/modules/project';
import { useParams } from 'next/navigation';

const inputClassName = 'h-10! rounded-xl!';
const dateClassName = 'h-10! w-full! rounded-xl!';

/** Label-width-matched skeleton placeholder for a single pending field (see `isFieldPending`). */
const FieldSkeleton: React.FC<{ labelW: string }> = ({ labelW }) => (
  <div className="mb-3">
    <Skeleton.Input active size="small" className={`mb-2! h-3! ${labelW}!`} />
    <Skeleton.Input active block className="h-10! rounded-xl!" />
  </div>
);

// Letters, digits, spaces, and the punctuation legitimately found in party names (Ltd, &, ., ', -).
const PARTY_NAME_PATTERN = /^[A-Za-z0-9À-ÿ&.,'()/\-\s]+$/;
const PARTY_NAME_MAX_LENGTH = 100;
const partyNameRules = (label: string) => [
  { required: true, whitespace: true, message: `Please enter the ${label.toLowerCase()}` },
  {
    max: PARTY_NAME_MAX_LENGTH,
    message: `${label} must be ${PARTY_NAME_MAX_LENGTH} characters or fewer`,
  },
  { pattern: PARTY_NAME_PATTERN, message: `${label} contains invalid characters` },
];

const SITE_ADDRESS_PATTERN = /^[A-Za-z0-9À-ÿ,.'#/\-\s]+$/;
const SITE_ADDRESS_MAX_LENGTH = 200;
const siteAddressRules = [
  { required: true, whitespace: true, message: 'Please enter the site address' },
  {
    max: SITE_ADDRESS_MAX_LENGTH,
    message: `Site address must be ${SITE_ADDRESS_MAX_LENGTH} characters or fewer`,
  },
  { pattern: SITE_ADDRESS_PATTERN, message: 'Site address contains invalid characters' },
];

export const ExecuteStagContractDetailsForm = ({
  form,
  extracting = false,
  skeletonTimeoutMs = 10000,
}: {
  /** Owned by the parent so the step footer (rendered at the bottom) can validate/save this form. */
  form: FormInstance;
  /** True while the required contract documents are still being AI-extracted — the fields below are
   *  populated from that extraction, so a skeleton is shown until the data arrives. */
  extracting?: boolean;
  /** How long to show the skeleton before dropping into the real form regardless. Should match the
   *  parent's fast-poll window (`PROJECT_POLL_TIMEOUT_MS`) so the skeleton doesn't hide before — or
   *  linger after — the window it's actually describing. */
  skeletonTimeoutMs?: number;
}) => {
  const params = useParams();

  // Collapsible card — starts open; clicking the header toggles the form body.
  const [collapsed, setCollapsed] = useState(false);

  const projectId = params?.id as string | undefined;
  const isCreateNew = projectId === 'new';

  const {
    data: projectDetails,
    isSuccess,
    isLoading,
  } = useGetProjectById<any>({
    id: !isCreateNew && projectId ? projectId : '',
    enabled: !isCreateNew && !!projectId,
  });

  // True while the project's first load or the parent's AI extraction is still in flight — the
  // window in which any still-empty field below might yet fill in on its own.
  const isPolling = !isCreateNew && (isLoading || extracting);

  // Cap each field's skeleton at `skeletonTimeoutMs` — if extraction is still in flight after that,
  // drop into the real (possibly still-empty) input instead of leaving the user staring at a
  // skeleton indefinitely. Fields fill in on their own via the setFieldsValue effect below once
  // extraction does land (the parent keeps polling in the background past this point).
  const [skeletonTimedOut, setSkeletonTimedOut] = useState(false);
  useEffect(() => {
    if (!isPolling) {
      setSkeletonTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setSkeletonTimedOut(true), skeletonTimeoutMs);
    return () => clearTimeout(timer);
  }, [isPolling, skeletonTimeoutMs]);

  // Each AI-extracted field shows its own skeleton independently — arriving one at a time (e.g.
  // Employer lands while Contractor/Project Manager/Supervisor/Contract Value are still on the
  // way) must not dismiss the others' loading state early.
  const isFieldPending = (value: unknown) => !value && isPolling && !skeletonTimedOut;
  const employerPending = isFieldPending(projectDetails?.employer);
  const contractorPending = isFieldPending(projectDetails?.contractor);
  const projectManagerPending = isFieldPending(projectDetails?.projectManager);
  const supervisorPending = isFieldPending(projectDetails?.supervisor);
  const contractValuePending = isFieldPending(projectDetails?.contractValue);
  const anyFieldPending =
    employerPending ||
    contractorPending ||
    projectManagerPending ||
    supervisorPending ||
    contractValuePending;

  // -------------------------
  // Load form data
  // -------------------------
  useEffect(() => {
    if (!form || !isSuccess || !projectDetails) return;

    form.setFieldsValue({
      ...projectDetails,
      contractValue: projectDetails.contractValue
        ? String(projectDetails.contractValue).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : '',

      startDate: projectDetails.startDate ? dayjs(projectDetails.startDate) : null,

      completionDate: projectDetails.completionDate ? dayjs(projectDetails.completionDate) : null,

      defectDate: projectDetails.defectDate ? dayjs(projectDetails.defectDate) : null,
    });
  }, [isSuccess, projectDetails, form]);

  return (
    <div className="border-theme-border mt-4 rounded-2xl border bg-white p-4">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className={`flex w-full items-start justify-between gap-4 text-left ${
          collapsed ? '' : 'mb-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <h2 className="heading-section my-0">Confirm Contract Details</h2>
          <Tooltip
            title="Edit anything the AI got wrong — these become the project’s source of truth."
            placement="right"
          >
            <Info
              className="h-4 w-4 shrink-0 cursor-help text-slate-700 transition-colors hover:text-slate-600"
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </div>
        <DownOutlined
          className={`ds-caption! text-icon mt-1 shrink-0 transition-transform duration-200 ${
            collapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      <div className={collapsed ? 'hidden' : ''}>
        {anyFieldPending && (
          <div className="ds-caption! mb-4 flex items-center gap-2 text-slate-400">
            <span className="bg-theme-primary inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
            Reading contract details from your documents…
          </div>
        )}

        <Form
          layout="vertical"
          form={form}
          className="[&_.ant-form-item]:mb-2! [&_.ant-form-item-label]:pb-1!"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              {employerPending && <FieldSkeleton labelW="w-20" />}
              <div className={employerPending ? 'hidden' : ''}>
                <Form.Item label="Employer" name="employer" rules={partyNameRules('Employer')}>
                  <Input className={inputClassName} maxLength={PARTY_NAME_MAX_LENGTH} />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={12}>
              {contractorPending && <FieldSkeleton labelW="w-24" />}
              <div className={contractorPending ? 'hidden' : ''}>
                <Form.Item
                  label="Contractor"
                  name="contractor"
                  rules={partyNameRules('Contractor')}
                >
                  <Input className={inputClassName} maxLength={PARTY_NAME_MAX_LENGTH} />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={12}>
              {projectManagerPending && <FieldSkeleton labelW="w-28" />}
              <div className={projectManagerPending ? 'hidden' : ''}>
                <Form.Item
                  label="Project Manager"
                  name="projectManager"
                  rules={partyNameRules('Project Manager')}
                >
                  <Input className={inputClassName} maxLength={PARTY_NAME_MAX_LENGTH} />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={12}>
              {supervisorPending && <FieldSkeleton labelW="w-24" />}
              <div className={supervisorPending ? 'hidden' : ''}>
                <Form.Item
                  label="Supervisor"
                  name="supervisor"
                  rules={partyNameRules('Supervisor')}
                >
                  <Input className={inputClassName} maxLength={PARTY_NAME_MAX_LENGTH} />
                </Form.Item>
              </div>
            </Col>
            <Col xs={24} md={12}>
              {contractValuePending && <FieldSkeleton labelW="w-36" />}
              <div className={contractValuePending ? 'hidden' : ''}>
                <Form.Item
                  label="Contract Value Amount"
                  name="contractValue"
                  rules={[{ required: true, message: 'Please enter a contract value' }]}
                >
                  <InputNumber<number>
                    className={inputClassName}
                    style={{ width: '100%' }}
                    placeholder="Enter amount"
                    precision={0}
                    min={0}
                    // Formats numbers with commas on display
                    formatter={(value) =>
                      value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                    }
                    // Strips everything except digits, then converts to a clean number
                    parser={(value) => {
                      if (!value) return '' as any; // Allows the input to be completely cleared
                      const cleanValue = value.replace(/[^0-9]/g, '');
                      return cleanValue ? Number(cleanValue) : ('' as any);
                    }}
                    // Block any alphabetical/special keys from being typed
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        'Backspace',
                        'Tab',
                        'Enter',
                        'Delete',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown',
                        'Home',
                        'End',
                      ];

                      // If the key is not a control key and not a number, block it
                      if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Currency"
                name="currency"
                normalize={(value?: string) => (value ? value.toUpperCase() : value)}
                rules={[
                  { required: true, message: 'Please enter the contract currency' },
                  {
                    pattern: /^[A-Z]{3}$/,
                    message: 'Enter a valid 3-letter currency code (e.g. GBP, USD, EUR)',
                  },
                ]}
              >
                <Input
                  className={inputClassName}
                  maxLength={3}
                  placeholder="e.g. GBP"
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>

            {/* ---------------- DATE FIELDS ---------------- */}

            <Col xs={24} md={8}>
              <Form.Item label="Starting Date" name="startDate" rules={[{ required: true }]}>
                <DatePicker
                  className={dateClassName}
                  onChange={() => {
                    // Re-validate dependent dates when start date changes
                    form.validateFields(['completionDate', 'defectDate']).catch(() => {});
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Completion Date"
                name="completionDate"
                dependencies={['startDate']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue('startDate');

                      if (!value || !start) return Promise.resolve();

                      // Must be strictly after the start date (at least the next day)
                      if (value.isAfter(start, 'day')) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error('Completion date must be after the start date')
                      );
                    },
                  }),
                ]}
              >
                <DatePicker
                  className={dateClassName}
                  onChange={() => {
                    // Re-validate defect date when completion date changes
                    form.validateFields(['defectDate']).catch(() => {});
                  }}
                  disabledDate={(current) => {
                    const start = form.getFieldValue('startDate');
                    if (!start || !current) return false;

                    // Disable any day on or before the start date
                    return !current.isAfter(start, 'day');
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Defect Date"
                name="defectDate"
                dependencies={['completionDate']} // Add dependency on completion date
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const completion = getFieldValue('completionDate');

                      if (!value || !completion) return Promise.resolve();

                      // Must be strictly after the completion date (at least the next day)
                      if (value.isAfter(completion, 'day')) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error('Defect date must be after the completion date')
                      );
                    },
                  }),
                ]}
              >
                <DatePicker
                  className={dateClassName}
                  disabledDate={(current) => {
                    const completion = form.getFieldValue('completionDate');
                    if (!completion || !current) return false;

                    // Disable any day on or before the completion date
                    return !current.isAfter(completion, 'day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Site Address" name="siteAddress" rules={siteAddressRules}>
                <Input className={inputClassName} maxLength={SITE_ADDRESS_MAX_LENGTH} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

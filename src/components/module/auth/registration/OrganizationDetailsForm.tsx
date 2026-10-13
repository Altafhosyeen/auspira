import React from 'react';
import { Form, Input, Row, Col, notification, Button, AutoComplete } from 'antd';
import type { FormInstance } from 'antd';
import SelectX from '@/components/shared/SelectX';
import {
  useSearchOrganizationsName,
  verifyCompanyHouseNumber,
  type ICompanyHouseResult,
} from '@/hooks/modules/organization';

const { TextArea } = Input;

const EXPECTED_USERS_OPTIONS = [
  { label: '1 - 10 users', value: '1-10' },
  { label: '11 - 50 users', value: '11-50' },
  { label: '51 - 200 users', value: '51-200' },
  { label: '201 - 500 users', value: '201-500' },
  { label: '500+ users', value: '500+' },
];

const PROJECTS_OPTIONS = [
  { label: '0 - 5 projects', value: '0-5' },
  { label: '6 - 10 projects', value: '6-10' },
  { label: '11 - 20 projects', value: '11-20' },
  { label: '21 - 50 projects', value: '21-50' },
  { label: '50+ projects', value: '50+' },
];

const INDUSTRY_SECTOR_OPTIONS = [
  {
    label: 'Construction',
    value: 'construction',
  },
  {
    label: 'Technology',
    value: 'technology',
  },
  {
    label: 'Finance',
    value: 'finance',
  },
  {
    label: 'Healthcare',
    value: 'healthcare',
  },
  { label: 'Education', value: 'education' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Retail', value: 'retail' },
];

interface OrganizationDetailsFormProps {
  form?: FormInstance;
  onFinish?: (values: any) => void;
  onValuesChange?: (changedValues: any, allValues: any) => void;
}

const itemStyle = {
  marginBottom: 8,
};

type HouseVerifyStatus = 'idle' | 'loading' | 'valid' | 'invalid';

type CompanySearchItem = {
  title?: string;
  name?: string;
  companyNumber?: string;
  status?: string;
  addressSnippet?: string;
};

type CompanyNameOption = {
  value: string;
  label: React.ReactNode;
  data?: CompanySearchItem;
};

const COMPANY_HOUSE_NUMBER_REGEX = /^[A-Za-z0-9]{2,10}$/;

const getApiErrorDetails = (
  error: unknown
): {
  status?: number;
  message?: string;
} => {
  const response = (error as { response?: { status?: number; data?: { message?: string } } })
    ?.response;

  return {
    status: response?.status,
    message: response?.data?.message,
  };
};

const getStatusClasses = (status?: string): string => {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === 'active') {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (normalizedStatus === 'open') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  if (normalizedStatus === 'dissolved' || normalizedStatus === 'inactive') {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const OrganizationDetailsForm: React.FC<OrganizationDetailsFormProps> = ({
  form: externalForm,
  onFinish,
  onValuesChange,
}) => {
  const [internalForm] = Form.useForm();
  const form = externalForm ?? internalForm;
  const [houseVerifyStatus, setHouseVerifyStatus] = React.useState<HouseVerifyStatus>('idle');
  const [houseErrorMessage, setHouseErrorMessage] = React.useState<string | undefined>();
  const [verifiedCompany, setVerifiedCompany] = React.useState<ICompanyHouseResult | null>(null);
  const companyHouseNumber =
    (Form.useWatch('companyHouseNumber', form) as string | undefined) ?? '';
  const companyName = (Form.useWatch('companyName', form) as string | undefined) ?? '';
  const isCompanyHouseNumberFormatValid = COMPANY_HOUSE_NUMBER_REGEX.test(
    companyHouseNumber.trim()
  );
  const { data: searchNameDataList, isFetching: isCompanySearchLoading } =
    useSearchOrganizationsName(
      {
        term: companyName,
        top: 8,
        skip: 0,
      },
      { enabled: companyName.trim().length >= 2, staleTime: Infinity }
    );
  const canVerifyCompanyHouse =
    isCompanyHouseNumberFormatValid &&
    houseVerifyStatus !== 'loading' &&
    houseVerifyStatus !== 'valid';
  const verifyButtonLabel =
    houseVerifyStatus === 'loading'
      ? 'Verifying...'
      : houseVerifyStatus === 'valid'
        ? 'Verified'
        : 'Verify';
  const initialHouseNumberRef = React.useRef(
    ((form.getFieldValue('companyHouseNumber') as string | undefined) ?? '').trim()
  );
  const attemptedInitialVerifyRef = React.useRef(false);

  const handleVerifyCompanyHouse = async (rawValue?: string) => {
    const value = rawValue?.trim() ?? '';

    if (!value || !COMPANY_HOUSE_NUMBER_REGEX.test(value)) {
      setHouseVerifyStatus('idle');
      setHouseErrorMessage(undefined);
      setVerifiedCompany(null);
      return;
    }

    setHouseVerifyStatus('loading');
    setHouseErrorMessage(undefined);
    setVerifiedCompany(null);

    try {
      const result = await verifyCompanyHouseNumber(value);
      if (result?.exists) {
        setHouseVerifyStatus('valid');
        setVerifiedCompany(result);
        form.setFields([{ name: 'companyHouseNumber', errors: [] }]);

        // Auto-populate form fields from verified company data
        const addr = result.address;
        const formattedAddress = addr
          ? [
              addr.premises,
              addr.addressLine1,
              addr.addressLine2,
              addr.locality,
              addr.postalCode,
              addr.country,
            ]
              .filter(Boolean)
              .join(', ')
          : undefined;

        form.setFieldsValue({
          companyName: result.companyName,
          ...(formattedAddress ? { address: formattedAddress } : {}),
        });
      } else {
        setHouseVerifyStatus('invalid');
        setVerifiedCompany(null);
        setHouseErrorMessage('Company not found. Please check the number and try again.');
        form.setFields([
          {
            name: 'companyHouseNumber',
            errors: ['Company not found. Please check the number and try again.'],
          },
        ]);
      }
    } catch (error) {
      const { status, message } = getApiErrorDetails(error);

      setHouseVerifyStatus('invalid');
      setVerifiedCompany(null);

      const validationMessage =
        status === 409
          ? (message ?? 'Organisation  with this company house number already exists.')
          : 'Could not verify company house number. Please try again.';

      setHouseErrorMessage(validationMessage);
      form.setFields([
        {
          name: 'companyHouseNumber',
          errors: [validationMessage],
        },
      ]);
    }
  };

  // Derive company name options from search results
  const companyNameOptions = React.useMemo(() => {
    if (searchNameDataList?.items && Array.isArray(searchNameDataList.items)) {
      return (searchNameDataList.items as CompanySearchItem[])
        .filter((org: CompanySearchItem) => org && (org.title || org.name))
        .map((org: CompanySearchItem) => ({
          value: org.title || org.name || '',
          label: (
            <div className="rounded-md border border-gray-100 bg-white p-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
              <div className="flex items-start justify-between gap-3">
                <span className="truncate pr-2 text-sm font-semibold text-gray-900">
                  {org.title || org.name}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getStatusClasses(org.status)}`}
                >
                  {org.status || 'N/A'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                <span>
                  <span className="font-medium text-gray-700">House No:</span>{' '}
                  {org.companyNumber || 'N/A'}
                </span>
                {org.addressSnippet ? (
                  <span className="truncate">
                    <span className="font-medium text-gray-700">Address:</span> {org.addressSnippet}
                  </span>
                ) : null}
              </div>
            </div>
          ),
          data: org,
        }));
    }
    return [];
  }, [searchNameDataList?.items]);

  const handleCompanyNameSelect = (_value: string, option: CompanyNameOption) => {
    const selectedHouseNumber = option.data?.companyNumber?.trim();

    form.setFieldsValue({
      companyName: option.value,
      ...(selectedHouseNumber ? { companyHouseNumber: selectedHouseNumber } : {}),
    });

    setHouseVerifyStatus('idle');
    setHouseErrorMessage(undefined);
    setVerifiedCompany(null);

    if (selectedHouseNumber && COMPANY_HOUSE_NUMBER_REGEX.test(selectedHouseNumber)) {
      handleVerifyCompanyHouse(selectedHouseNumber);
    }
  };

  React.useEffect(() => {
    if (attemptedInitialVerifyRef.current) {
      return;
    }

    const initialValue = initialHouseNumberRef.current;
    if (!initialValue) {
      attemptedInitialVerifyRef.current = true;
      return;
    }

    if (companyHouseNumber.trim() !== initialValue) {
      return;
    }

    attemptedInitialVerifyRef.current = true;
    void handleVerifyCompanyHouse(initialValue);
  }, [companyHouseNumber]);

  const handleFinish = (values: any) => {
    notification.success({
      message: 'Form Submitted',
      description: 'Organisation  details have been successfully saved.',
      placement: 'topRight',
    });

    onFinish?.(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);

    notification.error({
      message: 'Validation Error',
      description: 'Please check the form for errors and try again.',
      placement: 'topRight',
    });
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        className="compact-form"
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
      >
        <Row gutter={[16, 0]}>
          {/* Company Name */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Company Name"
              name="companyName"
              style={itemStyle}
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <AutoComplete
                options={companyNameOptions}
                onSelect={(value, option) =>
                  handleCompanyNameSelect(value, option as CompanyNameOption)
                }
                filterOption={false}
                popupClassName="company-name-search-dropdown"
                notFoundContent={
                  companyName.trim().length >= 2
                    ? isCompanySearchLoading
                      ? 'Searching companies...'
                      : 'No suggestions found'
                    : undefined
                }
              >
                <Input placeholder="Search company name (e.g., Auspac)" allowClear />
              </AutoComplete>
            </Form.Item>
          </Col>
          {/* Company House Number */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Company House Number"
              name="companyHouseNumber"
              style={itemStyle}
              hasFeedback={houseVerifyStatus !== 'idle'}
              validateStatus={
                houseVerifyStatus === 'loading'
                  ? 'validating'
                  : houseVerifyStatus === 'valid'
                    ? 'success'
                    : houseVerifyStatus === 'invalid'
                      ? 'error'
                      : undefined
              }
              help={
                houseVerifyStatus === 'valid' && verifiedCompany ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${verifiedCompany.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span className={verifiedCompany.isActive ? 'text-green-600' : 'text-red-500'}>
                      {verifiedCompany.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                ) : houseVerifyStatus === 'invalid' ? (
                  houseErrorMessage
                ) : undefined
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter company house number',
                },
                {
                  pattern: COMPANY_HOUSE_NUMBER_REGEX,
                  message: 'Please enter a valid company house number (2-10 letters or digits)',
                },
                {
                  validator: async (_, value: string) => {
                    if (!value || !COMPANY_HOUSE_NUMBER_REGEX.test(value)) return Promise.resolve();
                    if (houseVerifyStatus === 'valid') return Promise.resolve();
                    if (houseVerifyStatus === 'loading')
                      return Promise.reject('Verifying company, please wait...');
                    if (houseVerifyStatus === 'invalid')
                      return Promise.reject(houseErrorMessage || 'Company not found.');
                    return Promise.reject('Please click Verify to validate this company number.');
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter company house number"
                maxLength={10}
                onPressEnter={() => {
                  if (canVerifyCompanyHouse) {
                    handleVerifyCompanyHouse(companyHouseNumber);
                  }
                }}
                onChange={() => {
                  setHouseVerifyStatus('idle');
                  setHouseErrorMessage(undefined);
                  setVerifiedCompany(null);
                  form.setFieldsValue({ companyName: undefined, address: undefined });
                }}
                suffix={
                  <div className="flex items-center gap-2">
                    {/* {houseVerifyStatus === 'valid' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : houseVerifyStatus === 'invalid' ? (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    ) : houseVerifyStatus === 'loading' ? (
                      <Spin size="small" />
                    ) : null} */}
                    <Button
                      type={houseVerifyStatus === 'valid' ? 'default' : 'primary'}
                      size="small"
                      className="min-w-18 rounded-md text-xs font-medium"
                      loading={houseVerifyStatus === 'loading'}
                      disabled={!canVerifyCompanyHouse}
                      onClick={() => handleVerifyCompanyHouse(companyHouseNumber)}
                    >
                      {verifyButtonLabel}
                    </Button>
                  </div>
                }
              />
            </Form.Item>
          </Col>

          {/* Company Address */}
          <Col xs={24}>
            <Form.Item
              label="Company Address"
              name="address"
              style={itemStyle}
              rules={[{ required: true, message: 'Please enter company address' }]}
            >
              <TextArea rows={2} placeholder="Street, city, postal code, country" />
            </Form.Item>
          </Col>

          {/* Industry Sector */}
          <Col xs={24}>
            <Form.Item
              label="Industry Sector"
              name="industrySector"
              style={itemStyle}
              rules={[{ required: true, message: 'Please select industry sector' }]}
            >
              <SelectX placeholder="Select industry sector" options={INDUSTRY_SECTOR_OPTIONS} />
            </Form.Item>
          </Col>

          {/* Expected Users */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Expected Users"
              name="expectedUsers"
              style={itemStyle}
              rules={[
                {
                  required: true,
                  message: 'Please select expected users range',
                },
              ]}
            >
              <SelectX placeholder="Select expected users" options={EXPECTED_USERS_OPTIONS} />
            </Form.Item>
          </Col>

          {/* Number of Projects */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Number of Projects"
              name="numberOfProjects"
              style={itemStyle}
              rules={[
                {
                  required: true,
                  message: 'Please select number of projects',
                },
              ]}
            >
              <SelectX placeholder="Select number of projects" options={PROJECTS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default OrganizationDetailsForm;

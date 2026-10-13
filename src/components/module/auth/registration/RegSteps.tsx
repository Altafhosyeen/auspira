'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Form, Skeleton } from 'antd';
import type { FormInstance } from 'antd';
import RegistrationStepsLayout, { RegistrationStep } from './RegistrationStepsLayout';
import OrganizationDetailsForm from './OrganizationDetailsForm';
import AccountDetailsForm from './AccountDetailsForm';
import { useCreateOrganization } from '@/hooks/modules/organization';
import type { IOrganization } from '@/types/organization/orgnization';
import { useRouter } from 'nextjs-toploader/app';
import { NON_MENU_PATHS } from '@/constants/routes.constants';

const REGISTRATION_DRAFT_STORAGE_KEY = 'organization-registration-draft-v1';

type OrganizationFormValues = {
  companyName?: string;
  address?: string | null;
  industrySector?: string | null;
  companyHouseNumber?: string | null;
  expectedUsers?: string | number;
  numberOfProjects?: string | number;
};

type RegistrationDraft = {
  currentStep: number;
  organizationValues: OrganizationFormValues;
  organizationFormValues: Record<string, unknown>;
  accountFormValues: Record<string, unknown>;
};

const clearFormErrors = (form: FormInstance) => {
  const fieldsWithErrors = form.getFieldsError().filter((field) => field.errors.length > 0);

  if (!fieldsWithErrors.length) {
    return;
  }

  form.setFields(
    fieldsWithErrors.map((field) => ({
      name: field.name,
      errors: [],
    }))
  );
};
const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    title: 'Organisation  Details',
    description: 'Set up your organisation to get started with Auspira',
  },
  {
    title: 'Account Details',
    description: 'Create your account to manage your organisation',
  },
];

const RegSteps: React.FC = () => {
  const route = useRouter();
  const [current, setCurrent] = useState(0);
  const [nextLoading, setNextLoading] = useState(false);
  const [previousLoading, setPreviousLoading] = useState(false);
  const [orgForm] = Form.useForm();
  const [accForm] = Form.useForm();
  const [organizationValues, setOrganizationValues] = useState<OrganizationFormValues>({});
  const [draftHydrated, setDraftHydrated] = useState(false);
  const { mutateAsync: createOrganizationMutation, isPending } = useCreateOrganization();

  const persistDraft = useCallback(
    (overrides?: Partial<RegistrationDraft>) => {
      if (typeof window === 'undefined') {
        return;
      }

      const draft: RegistrationDraft = {
        currentStep: current,
        organizationValues,
        organizationFormValues: orgForm.getFieldsValue(true),
        accountFormValues: accForm.getFieldsValue(true),
        ...overrides,
      };

      window.sessionStorage.setItem(REGISTRATION_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    },
    [accForm, current, orgForm, organizationValues]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.sessionStorage.getItem(REGISTRATION_DRAFT_STORAGE_KEY);
    if (!raw) {
      setDraftHydrated(true);
      return;
    }

    try {
      const draft = JSON.parse(raw) as Partial<RegistrationDraft>;

      if (draft.organizationFormValues) {
        orgForm.setFieldsValue(draft.organizationFormValues);
      }

      if (draft.accountFormValues) {
        accForm.setFieldsValue(draft.accountFormValues);
      }

      if (draft.organizationValues) {
        setOrganizationValues(draft.organizationValues);
      }

      const targetStep = draft.currentStep === 1 ? 1 : 0;
      setCurrent(targetStep);
    } catch (error) {
      console.error('Failed to restore registration draft:', error);
      window.sessionStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
    } finally {
      setDraftHydrated(true);
    }
  }, [accForm, orgForm]);

  useEffect(() => {
    if (!draftHydrated) {
      return;
    }

    persistDraft();
  }, [current, draftHydrated, organizationValues, persistDraft]);

  const handleStepChange = (step: number) => {
    console.log('onChange:', step);
    setCurrent(step);
  };

  const handlePrevious = () => {
    if (current === 0) {
      route.push(NON_MENU_PATHS.LOGIN);
      return;
    }

    setPreviousLoading(true);
    setTimeout(() => {
      clearFormErrors(accForm);
      setCurrent(0);
      setPreviousLoading(false);
    }, 300);
  };

  const handleNext = () => {
    // If on organisation step, validate organisation form then advance
    if (current === 0) {
      orgForm
        .validateFields()
        .then((values) => {
          setOrganizationValues(values);
          clearFormErrors(accForm);
          setNextLoading(true);
          setTimeout(() => {
            setCurrent(1);
            setNextLoading(false);
          }, 300);
        })
        .catch(() => {
          // validation errors will be shown by the form
        });
      return;
    }

    // If on account step (last step), validate and submit
    if (current === REGISTRATION_STEPS.length - 1) {
      accForm
        .validateFields()
        .then(() => {
          setNextLoading(true);
          // trigger form submit to run the child's onFinish
          accForm.submit();
          setTimeout(() => {
            setNextLoading(false);
          }, 500);
        })
        .catch(() => {
          // show errors
        });
      return;
    }
  };

  const handleAccountCreated = async (values: {
    fullName: string;
    jobTitle: string;
    workEmail: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    termsAccepted?: boolean;
    consentAccepted?: boolean;
  }) => {
    {
      const payload: IOrganization = {
        name: organizationValues.companyName || '',
        address: organizationValues.address || null,
        industrySector: organizationValues.industrySector || null,
        houseNumber: organizationValues.companyHouseNumber || null,
        expectedUsers: 12345,
        defaultAdmin: {
          email: values.workEmail,
          fullName: values.fullName,
          phoneNumber: values.mobile || null,
          jobTitle: values.jobTitle || null,
          password: values.password,
          confirmPassword: values.confirmPassword,
          acceptTerms: values.termsAccepted || false,
          acceptDataProcessing: values.consentAccepted || false,
        },
      };
      try {
        await createOrganizationMutation({ data: payload }).then((res) => {
          if (res) {
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
            }
            route.push(`otp?email=${encodeURIComponent(values.workEmail)}&org=${true}`);
          }
        });
        setNextLoading(false);
        // router.push(NON_MENU_PATHS.WELCOME_BACK);
      } catch (error) {
        setNextLoading(false);
        console.error('Organisation  creation failed:', error);
      }
    }
  };
  // Both steps stay mounted (only the active one is visible) so per-step local
  // state — e.g. the Company House Number "Verified" status — survives navigating
  // Next → Back. Unmounting reset that flag and made a re-verify error appear.
  const renderStepContent = () => (
    <>
      <div className={current === 0 ? 'block' : 'hidden'}>
        <OrganizationDetailsForm
          form={orgForm}
          onFinish={() => console.log('Org saved')}
          onValuesChange={(_, allValues) => {
            persistDraft({ organizationFormValues: allValues as Record<string, unknown> });
          }}
        />
      </div>
      <div className={current === 1 ? 'block' : 'hidden'}>
        <AccountDetailsForm
          form={accForm}
          onFinish={handleAccountCreated}
          onValuesChange={(_, allValues) => {
            persistDraft({ accountFormValues: allValues as Record<string, unknown> });
          }}
        />
      </div>
    </>
  );
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton active paragraph={{ rows: 10 }} title={false} />;
      </div>
    );
  }
  return (
    <RegistrationStepsLayout
      title="Get Started with Auspira"
      // subtitle="Tell us about your organisation. We’ll review your sign-up and email you when access is approved."
      steps={REGISTRATION_STEPS}
      currentStep={current}
      onStepChange={handleStepChange}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isFirstStep={false}
      isLastStep={current === REGISTRATION_STEPS.length - 1}
      nextLoading={nextLoading}
      previousLoading={previousLoading}
    >
      {renderStepContent()}
    </RegistrationStepsLayout>
  );
};

export default RegSteps;

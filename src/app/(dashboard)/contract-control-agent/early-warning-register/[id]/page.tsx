'use client';

import RegisterEarlyWarningWithCc from '@/components/contract-control-agent/RegisterEarlyWarningWithCc';
import PageX from '@/components/shared/PageX';

const Page = () => {
  /* --- "new" id → create mode (no prefill); an existing id prefills the form --- */

  return (
    <PageX>
      <RegisterEarlyWarningWithCc />
    </PageX>
  );
};

export default Page;

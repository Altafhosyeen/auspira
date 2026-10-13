'use client';

import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'nextjs-toploader/app';
import ButtonX from '@/components/antd/ButtonX';
import EarlyWarningRegisterTable from '@/components/contract-control-agent/EarlyWarningRegisterTable';
import PageX from '@/components/shared/PageX';
import { MENU_PATH } from '@/constants';

const Page = () => {
  const router = useRouter();
  return (
    <PageX
      heading="Early Warning Register"
      actions={
        <ButtonX
          onClick={() => router.push(`${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}/new`)}
          type="primary"
          icon={<PlusOutlined />}
        >
          Raise EW
        </ButtonX>
      }
    >
      {/* <div className="flex flex-wrap items-center gap-2">
        <p className="my-0 text-sm text-gray-500">
          All formally registered Early Warnings — Denton Wharf Phase 2
        </p>
        <span className="-mt-3 inline-flex items-center rounded-md bg-emerald-50 px-2 font-mono text-xs font-medium text-emerald-700">
          NEC4 Cl. 15.1
        </span>
      </div> */}

      <div className="">
        <EarlyWarningRegisterTable />
      </div>
    </PageX>
  );
};

export default Page;

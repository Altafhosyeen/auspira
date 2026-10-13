'use client';

import { useParams } from 'next/navigation';
import { CompensationEventAssessmentPage } from '@/modules/compensation-event';
import { useQuotationLinkBridgeStore } from '@/store/quotation.store';

const Page = () => {
  // The route id is the quotation's own id — the whole screen is read off
  // `GET /api/quotations/{id}`, unless the bridge below names the alert it arrived from.
  const { id } = useParams<{ id: string }>();

  // The quotation screen hands the linked compensation event's reference over through the
  // bridge store as a fast-path fallback, until the quotation's own fetch resolves one.
  const compensationEventReference = useQuotationLinkBridgeStore(
    (store) => store.linkedCompensationEventReference
  );
  // Set only when this screen was reached from the alert-driven quotation screen — that
  // screen's card reads off the alert, not the register's persisted quotation, so this one
  // has to match it rather than showing a different set of figures a click away.
  const projectAlertId = useQuotationLinkBridgeStore((store) => store.linkedProjectAlertId);

  return (
    <CompensationEventAssessmentPage
      id={id}
      compensationEventReference={compensationEventReference ?? undefined}
      projectAlertId={projectAlertId ?? undefined}
    />
  );
};

export default Page;

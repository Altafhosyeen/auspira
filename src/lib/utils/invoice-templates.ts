import {
  IInvoiceTemplate,
  IInvoiceTemplatePayload,
  IInvoiceTemplatePayloadItem,
} from '@/types/finance/invoice-templates';
import { ILookup } from '@/types/lookup.types';

type TInvoiceItemAmount = {
  quantity?: string;
  unit_price?: string;
};

export const getCurrencyCodeById = (
  currencies: ILookup[],
  selectedCurrencyId?: string,
  fallback = 'USD'
) => {
  if (!selectedCurrencyId) {
    return fallback;
  }

  return currencies.find((currency) => currency.id === selectedCurrencyId)?.code ?? fallback;
};

export const getInvoiceItemsTotal = (items: TInvoiceItemAmount[]) => {
  return items.reduce((sum, item) => {
    const quantity = Number(item?.quantity ?? 0);
    const unitPrice = Number(item?.unit_price ?? 0);

    if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
      return sum;
    }

    return sum + quantity * unitPrice;
  }, 0);
};

export const getVatRulePercentage = (vatRate?: string) => {
  const parsedRate = Number(vatRate);

  if (Number.isNaN(parsedRate)) {
    return Number.NaN;
  }

  return parsedRate / 100;
};

const normalizeItem = (item: NonNullable<IInvoiceTemplate['items']>[number], index: number) => {
  const payloadItem: IInvoiceTemplatePayloadItem = {
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    index,
  };

  if (item.id) {
    payloadItem.id = item.id;
  }

  if (item.desc) {
    payloadItem.desc = item.desc;
  }

  return payloadItem;
};

export const buildInvoiceTemplatePayload = (values: IInvoiceTemplate): IInvoiceTemplatePayload => {
  const currencyId = values.currency?.id?.trim?.() ?? '';
  const typeId = values.type?.id?.trim?.() ?? '';
  const vatRuleId = values.vat_rule?.id?.trim?.() ?? values.vat_rule?.vat_rule_id?.trim?.() ?? '';
  const seriesId = values.series?.id?.trim?.() ?? '';

  return {
    ...(values.id ? { id: values.id } : {}),
    name: values.name,
    desc: values.desc,
    instructions: values.instructions,
    disclaimer: values.disclaimer,
    slug: values.slug,
    deadline_days: values.deadline_days,
    reminder_days: values.reminder_days,
    currency_id: currencyId,
    type_id: typeId,
    series_id: seriesId,

    ...(vatRuleId ? { vat_rule_id: vatRuleId } : {}),
    items: (values.items ?? []).map((item, index) => normalizeItem(item, index)),
  };
};

export const getInvoiceTotalWithVat = (totalPrice: number, vatRulePercentage: number) => {
  if (Number.isNaN(vatRulePercentage)) {
    return totalPrice;
  }

  return totalPrice + totalPrice * vatRulePercentage;
};

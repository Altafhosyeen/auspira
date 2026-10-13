import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { IPaginatedApiResponse } from '@/types/api.types';
import { HelperFunctions } from '@/types/custom.types';
import { IInvoiceTemplateQueryParams } from '@/types/finance/invoice-templates';
import { IOrganization } from '@/types/organization/orgnization';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const ORGANIZATION_QUERY_KEY = ['organization'] as const;
export const createOrganization = async ({ data }: { data: IOrganization }) => {
  return AUSPIRA<IOrganization>({
    url: API_ENDPOINTS.ORGANIZATION.ORGANIZATION,
    method: 'POST',
    body: data,
    isPublic: true,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEY });
    },
  });
};

/* ------------------------- GET LIST ORG FRO ADMIN ------------------------- */

export const getOrganizations = async <T = IPaginatedApiResponse<IOrganization>>(
  params?: IInvoiceTemplateQueryParams
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.ORGANIZATION.ORGANIZATION, {
      skip: params?.skip,
      top: params?.top,
      term: params?.term?.trim(),
    }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetOrganizations = <T = IPaginatedApiResponse<IOrganization>>(
  params?: IInvoiceTemplateQueryParams,
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...ORGANIZATION_QUERY_KEY, params?.skip ?? 0, params?.top ?? 10, params?.term ?? ''],
    queryFn: async () => getOrganizations<T>(params),
    ...helpers,
  });

/* --------------------------- Verify Phone Numbe --------------------------- */

export const verifyPhoneNumber = async ({ phoneNumber }: { phoneNumber: string }) => {
  return AUSPIRA({
    url: API_ENDPOINTS.ORGANIZATION.VERIFY_NUMBER + phoneNumber,
    method: 'GET',
  });
};

export const useVerifyPhoneNumber = ({ phoneNumber }: { phoneNumber: string }) =>
  useMutation({
    mutationFn: () => verifyPhoneNumber({ phoneNumber }),
  });

/* ----------------------- Verify Company House Number ---------------------- */

export interface ICompanyHouseAddress {
  premises?: string;
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  postalCode?: string;
  country?: string;
}

export interface ICompanyHouseResult {
  companyNumber: string;
  companyName: string;
  exists: boolean;
  status: string;
  isActive: boolean;
  type: string;
  address?: ICompanyHouseAddress;
  conflict: boolean;
}

export const verifyCompanyHouseNumber = async (
  houseNumber: string
): Promise<ICompanyHouseResult> => {
  return AUSPIRA<ICompanyHouseResult>({
    url: API_ENDPOINTS.ORGANIZATION.VERIFY_COMPANY_HOUSE + houseNumber,
    method: 'GET',
    skipLoader: true,
  });
};

export const useVerifyCompanyHouseNumber = () =>
  useMutation({
    mutationFn: (houseNumber: string) => verifyCompanyHouseNumber(houseNumber),
  });

/* ------------------------------- GET ORG ME ------------------------------- */
export const getOrganizationMe = async <T = IPaginatedApiResponse<IOrganization>>(
  params?: IInvoiceTemplateQueryParams
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.ORGANIZATION.ORGANIZATION + '/me', {
      skip: params?.skip,
      top: params?.top,
      term: params?.term?.trim(),
    }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetOrganizationMe = <T = IPaginatedApiResponse<IOrganization>>(
  params?: IInvoiceTemplateQueryParams,
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    // 'me' segment keeps this out of the useGetOrganizations list cache, which would
    // otherwise share the exact same key for the default params.
    queryKey: [
      ...ORGANIZATION_QUERY_KEY,
      'me',
      params?.skip ?? 0,
      params?.top ?? 10,
      params?.term ?? '',
    ],
    queryFn: async () => getOrganizationMe<T>(params),
    ...helpers,
  });

/* --------------------------------- Search --------------------------------- */

export const searchOrganizationsName = async <T = IPaginatedApiResponse<IOrganization>>(
  params?: IInvoiceTemplateQueryParams
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.ORGANIZATION.SEARCH_COMPANY_NAME, {
      skip: params?.skip,
      top: params?.top,
      searchText: params?.term?.trim(),
    }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useSearchOrganizationsName = <T = IPaginatedApiResponse<IOrganization>>(
  params?: IInvoiceTemplateQueryParams,
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [
      ...ORGANIZATION_QUERY_KEY,
      'search',
      params?.skip ?? 0,
      params?.top ?? 10,
      params?.term ?? '',
    ],
    queryFn: async () => searchOrganizationsName<T>(params),
    ...helpers,
  });

import type { UseQueryOptions } from '@tanstack/react-query';
import type { HttpMethod } from './api.types';
import { MenuProps } from 'antd';
import { IApplicationStatus } from './institution/application-statuses.types';

export type AllowedMethodsType = HttpMethod;

export type HelperFunctions<
  TData,
  TError = Error,
  TQueryKey extends readonly unknown[] = readonly unknown[],
> = Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>;

export type MenuItem = Required<MenuProps>['items'][number];

export type LSPageSizeData = {
  [key: string | number]: {
    [key: string]: number;
  };
};

export interface AnchorItem {
  key: string;
  href: string;
  title: string;
}

export interface IPaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

export interface INormalizedListData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ICheckboxFields {
  name: keyof IApplicationStatus;
  label: string;
  bottomDesc: string;
  disabled?: boolean;
}

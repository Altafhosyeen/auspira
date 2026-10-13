'use client';

import React from 'react';
import { UploadChangeParam } from 'antd/es/upload';
import ReactCountryFlag from 'react-country-flag';

export const generateQueryParams = <T,>(object?: T): string => {
  if (!object) return '';
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (!value) return acc;
    if (Array.isArray(value)) {
      return acc + value.map?.((val) => `&${key}=${val}`).join('');
    }
    return acc + `&${key}=${value}`;
  }, '');
};

export const getSelectItems = <T,>(
  data: T[] | T | Record<string | number, string | number>,
  options?: { label: keyof T; value: keyof T; key: keyof T; title?: keyof T }
):
  | {
      key: string;
      label: React.ReactNode;
      value: string;
      title?: string;
    }[]
  | [] => {
  if (Array.isArray(data) && options) {
    return data?.map?.((item) => ({
      key: item[options.key]?.toString() as string,
      label: item[options.label] as React.ReactNode | string,
      value: item[options.value]?.toString() as string,
      title: item[options.title ?? options.label] as string,
    }));
  }

  if (data && typeof data === 'object') {
    return Object.entries(data as object).map?.(([key, value]) => ({
      key: key.toString(),
      label: value as React.ReactNode | string,
      value: key.toString(),
      title: value.toString(),
    }));
  }

  if (options)
    return [
      {
        key: data[options.key]?.toString() as string,
        label: data[options.label] as React.ReactNode | string,
        value: data[options.value]?.toString() as string,
        title: data[options.title ?? options.label] as string,
      },
    ];

  return [];
};

export const isObjectEmptyOrUndefined = (object: object | undefined) => {
  return !object || Object.keys(object).length === 0;
};

export const isAnyObjectKeyEmptyOrUndefined = (object: object | undefined) => {
  return (
    !object ||
    Object.keys(object).some((key) => {
      if (Array.isArray(object[key as keyof object])) {
        return (object[key as keyof object] as any[]).length === 0;
      }
      return !object[key as keyof object];
    })
  );
};

export const simulateIncrementalProgress = async ({
  onProgress,
  cancel,
  step = 10,
}: {
  onProgress?: (progress: { percent: number }) => void;
  cancel?: boolean;
  step?: number;
}) => {
  for (let percent = 0; percent <= 90; percent += step) {
    if (cancel) {
      return;
    }
    onProgress?.({ percent });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export const normFile = (e: UploadChangeParam) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Normalizes permission context strings to title case
 * Converts "agent-role", "agent_role", or "agent role" to "Agent Role"
 * @param context - The permission context string to normalize
 * @returns Normalized context in title case
 */
export const normalizeToTitleCase = (context: string): string => {
  return context
    .split(/[-_\s]+/) // Split by hyphen, underscore, or whitespace
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
interface FlagProps {
  countryCode: string;
}

const CountryFlag = ({ countryCode }: FlagProps) => {
  if (!countryCode) {
    return '🏳️';
  }
  if (countryCode.toLowerCase() === 'wd') {
    return '🌐';
  }

  return (
    <ReactCountryFlag
      countryCode={countryCode.toUpperCase()}
      svg={true}
      style={{
        width: '1.5em',
        height: '1.5em',
      }}
      title={countryCode.toUpperCase()}
    />
  );
};

export default CountryFlag;

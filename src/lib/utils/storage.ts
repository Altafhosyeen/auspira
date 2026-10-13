import ls from 'localstorage-slim';
import { LSPageSizeData } from '@/types';

export const cacheUserPageSize = ({
  userID,
  pageKey,
  pageSize,
}: {
  userID: string;
  pageKey: string;
  pageSize: number;
}) => {
  const storageData = ls.get<LSPageSizeData>('user-page-size-data', {});
  const userData = storageData?.[userID] || {};
  const pageSizeData = { ...userData, [pageKey]: pageSize };

  const newData = { ...storageData, [userID]: pageSizeData };
  ls.set('user-page-size-data', newData);
};

export const getCurrentUserPageSizeFromLS = ({
  userID,
  pageKey,
}: {
  userID: string;
  pageKey: string;
}) => {
  const storageData = ls.get<LSPageSizeData>('user-page-size-data') ?? {};
  const userData = storageData?.[userID] || {};
  return userData?.[pageKey] || 10;
};

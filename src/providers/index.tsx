import type { PropsWithChildren } from 'react';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { MotionProvider } from '../providers/MotionProvider';
import ToastProvider from './ToastProvider';
import { BackendKeepAlive } from './BackendKeepAlive';
import { GlobalLoader } from '@/components/shared/GlobalLoader';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <GlobalLoader />
      <BackendKeepAlive />
      <MotionProvider>
        <AuthProvider>
          <QueryProvider>
            <ToastProvider />
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </MotionProvider>
    </>
  );
}

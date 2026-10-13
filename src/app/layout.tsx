// 2. YOU MUST IMPORT THIS
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';

import './styles/globals.css';
import './styles/heading-base.css';
import './styles/sidebar-menu.css';
import 'antd/dist/reset.css';

import AntdProvider from '@/providers/antd-provider';
import { APP_META, APP_THEME } from '../constants';
import { Providers } from '../providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: APP_META.NAME,
  description: APP_META.DESCRIPTION,
  icons: {
    icon: '/assets/images/logo-only.png',
    apple: '/assets/images/logo-only.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={inter.variable}
      style={APP_THEME.cssVariables as React.CSSProperties}
    >
      <body style={{ fontFamily: APP_THEME.fontFamily }}>
        {/* Slim top progress bar shown while navigating between screens. */}
        <NextTopLoader
          color="var(--theme-primary)"
          height={3}
          showSpinner={false}
          shadow="0 0 8px rgba(34,76,125,0.5)"
          zIndex={2000}
        />
        {/* 3. YOU MUST WRAP EVERYTHING IN THE REGISTRY */}
        <AntdRegistry>
          <AntdProvider>
            <Providers>{children}</Providers>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

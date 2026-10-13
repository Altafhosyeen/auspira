'use client';
import { Layout, Skeleton } from 'antd';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { Suspense, useEffect } from 'react';
import OAuthCallbackHandler from '@/components/module/consent/OAuthCallbackHandler';
import ChatBot from '@/components/shared/ChatBot';
import BaseHeader from './BaseHeader';
import BaseSider from './BaseSider';

const { Header, Sider, Content } = Layout;

// Document-review routes (opened from a document's "View" action) render the
// JSON view / metadata panel full-screen — collapse the sider while they're open.
const DOCUMENT_REVIEW_SEGMENTS = [
  'site-information',
  'conditions-of-contract',
  'hsqe-requirements',
  'contract-data-part-1',
  'contract-data-part-2',
  'z-clauses',
  'view-document-scop',
  'form-of-agreement',
  'document',
];

const isDocumentReviewRoute = (pathname: string | null) => {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean); // ['projects', '<type>', '<id>']
  return segments[0] === 'projects' && DOCUMENT_REVIEW_SEGMENTS.includes(segments[1]);
};

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [manualCollapsed, setManualCollapsed] = React.useState(false);
  const [chatBotOpen, setChatBotOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoot = pathname === '/';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Document-review routes force the sider closed (full-screen JSON/metadata view);
  // everywhere else the user's manual toggle applies.
  const collapsed = isDocumentReviewRoute(pathname) || manualCollapsed;

  // Show loading state while checking auth
  // Full-screen auth loading state (PRO UI)
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md px-6 text-center">
          {/* App-style loader */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>

          {/* Title skeleton */}
          <div className="mb-4">
            <Skeleton.Input active className="!h-5 !w-48" />
          </div>

          {/* Content skeleton */}
          <Skeleton
            active
            paragraph={{
              rows: 3,
              width: ['100%', '90%', '80%'],
            }}
          />

          {/* subtle footer loading hint */}
          <div className="mt-6 flex justify-center">
            <div className="h-2 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render layout if not authenticated
  if (!session) {
    return null;
  }

  return (
    <Layout className="h-screen w-full">
      {/* OAuth connection callback handler (Google/Microsoft email connect) */}
      <Suspense fallback={null}>
        <OAuthCallbackHandler />
      </Suspense>

      {/* SIDEBAR */}
      <Sider
        width={300}
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={(value) => setManualCollapsed(value)}
        trigger={null}
        className="sticky top-0 left-0 h-screen overflow-y-auto bg-white! transition-all duration-500 ease-in-out"
      >
        <BaseSider collapsed={collapsed} />
      </Sider>

      {/* RIGHT SIDE */}
      <Layout className="h-screen w-full overflow-hidden transition-all duration-500 ease-in-out">
        {/* HEADER */}
        <Header className="flex !h-[52px] w-full items-center justify-center border-b border-gray-200 bg-white !px-2 sm:!px-3 lg:!px-5">
          <BaseHeader
            collapsed={collapsed}
            onToggleSidebar={() => setManualCollapsed(!collapsed)}
          />
        </Header>

        {/* BODY */}
        <div className="flex h-full flex-col overflow-hidden">
          {/* SCROLL AREA */}
          <Content className="flex-1 overflow-y-auto bg-[#F5F7FD] px-4 pt-4 pb-5">
            {children}
          </Content>
        </div>
      </Layout>

      {/* CHATBOT WIDGET */}
      {!isDashboardRoot && (
        <ChatBot
          isOpen={chatBotOpen}
          onClose={() => setChatBotOpen(false)}
          onOpen={() => setChatBotOpen(true)}
        />
      )}
    </Layout>
  );
};

export default BaseLayout;

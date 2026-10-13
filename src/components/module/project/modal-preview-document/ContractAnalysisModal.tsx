'use client';
import React, { useMemo } from 'react';
import { Button, Badge, Spin } from 'antd';
import {
  FileTextOutlined,
  ShareAltOutlined,
  MoreOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  UpOutlined,
  DownOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

interface ContractAnalysisModalProps {
  data?: {
    summary?: {
      title?: string;
      content?: string;
    };
    sections?: Array<{
      key?: string;
      value?: string | null;
      page_number?: number;
    }>;
  };
  loading?: boolean;
  closeModal?: () => void;
  selectedDocument?: {
    id?: string | number;
    fileName?: string;
    filename?: string;
    title?: string;
    name?: string;
    totalPages?: number;
  } | null;
}

type GroupedSection = {
  sectionName: string;
  items: Array<{
    key: string;
    value: string | null | undefined;
    pageNumber: number;
  }>;
};

export default function ContractAnalysisDashboard({
  data,
  loading = false,
  selectedDocument,
  closeModal,
}: ContractAnalysisModalProps) {
  console.log('Received data:', data);
  // Helper to get display name for sections
  const getSectionDisplayName = (prefix: string): string => {
    const names: Record<string, string> = {
      dates: 'Important Dates',
      working_areas: 'Working Areas',
      key_people: 'Key People',
    };
    return names[prefix] || prefix.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };
  // Group sections by their prefix (dates, working_areas, key_people)
  const groupedSections = useMemo(() => {
    if (!data?.sections || !Array.isArray(data.sections)) {
      return [];
    }

    const groups: Record<string, GroupedSection> = {};

    data.sections.forEach((section) => {
      if (!section.key) return;

      // Extract the prefix (dates, working_areas, key_people) and index
      const match = section.key.match(/^([^_]+(?:_[^_]+)*?)__(\d+)__/);
      if (match) {
        const prefix = match[1]; // e.g., "dates", "working_areas", "key_people"
        const groupKey = prefix;

        if (!groups[groupKey]) {
          groups[groupKey] = {
            sectionName: getSectionDisplayName(prefix),
            items: [],
          };
        }

        groups[groupKey].items.push({
          key: section.key.split('__').pop() || section.key,
          value: section.value,
          pageNumber: section.page_number || 0,
        });
      }
    });

    return Object.values(groups);
  }, [data]);

  // Helper to get section icon
  const getSectionIcon = (sectionName: string) => {
    if (sectionName.includes('Dates')) {
      return <CalendarOutlined className="ds-heading-3! text-blue-600" />;
    }
    if (sectionName.includes('Working Areas')) {
      return <EnvironmentOutlined className="ds-heading-3! text-blue-600" />;
    }
    if (sectionName.includes('Key People')) {
      return <UserOutlined className="ds-heading-3! text-blue-600" />;
    }
    return <FileTextOutlined className="ds-heading-3! text-blue-600" />;
  };

  // Helper to format key names for display
  const formatKeyName = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">No contract data available.</p>
      </div>
    );
  }

  const { summary } = data;
  const fileName =
    selectedDocument?.fileName ||
    selectedDocument?.filename ||
    selectedDocument?.name ||
    'Conditions.pdf';
  const documentTitle =
    selectedDocument?.title || summary?.title?.split('/').pop() || 'Contract Document';
  const totalPages = selectedDocument?.totalPages ?? 5;

  return (
    <div className="bg-surface-subtle text-text flex h-screen w-full flex-col overflow-hidden font-sans">
      {/* Document Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <FileTextOutlined className="ds-heading-2!" />
          </div>
          <div>
            <h1 className="ds-body-large! text-text font-bold!">{documentTitle}</h1>
            <p className="ds-caption! text-slate-500">
              {fileName} • {totalPages} pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            status="success"
            text={<span className="ds-caption! font-medium! text-emerald-700">Active</span>}
            className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1"
          />
          <Button
            icon={<ShareAltOutlined />}
            className="ds-caption! flex items-center rounded-lg border-slate-200 font-medium! text-slate-600"
          >
            Share
          </Button>
          <Button
            icon={<MoreOutlined />}
            type="text"
            className="rounded-lg text-slate-500 hover:bg-slate-50"
          />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - AI Analysis Dashboard */}
        <section className="bg-surface-subtle flex w-3/5 flex-col overflow-y-auto border-r border-slate-200 lg:w-[63%]">
          <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
            {/* AI Analysis Tag */}
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="ds-caption! font-bold! tracking-wider text-slate-700 uppercase">
                AI Analysis
              </span>
            </div>

            {/* Contract Summary Section */}
            {summary && summary.content && (
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="ds-caption! mb-3 font-bold! tracking-wider text-slate-700 uppercase">
                  Document Summary
                </p>
                <p className="ds-body! text-slate-700">{summary.content}</p>
              </div>
            )}

            {/* Dynamic Sections Listing */}
            <div className="">
              <div className="mb-4 flex items-baseline gap-2">
                <h2 className="heading-section">Extracted Information</h2>
                <span className="ds-caption! text-slate-700">
                  {groupedSections.length} sections found
                </span>
              </div>

              <div className="space-y-6">
                {groupedSections.map((section) => (
                  <div
                    key={section.sectionName}
                    className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    {/* Section Heading Info */}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded-xl bg-blue-50 p-2.5">
                        {getSectionIcon(section.sectionName)}
                      </div>
                      <div>
                        <h3 className="ds-body-large! text-text font-bold!">
                          {section.sectionName}
                        </h3>
                        <p className="ds-caption! mt-0.5 text-slate-700">
                          {section.items.length} {section.items.length === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>
                    </div>

                    {/* Section Key-Value Rows */}
                    {section.items.length > 0 && (
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {section.items.map(
                            (item) =>
                              item.value && (
                                <div key={item.key}>
                                  <p className="ds-micro! font-bold! tracking-wider text-slate-700 uppercase">
                                    {formatKeyName(item.key)}
                                  </p>
                                  <p className="ds-body! text-text mt-1 font-medium!">
                                    {item.value}
                                  </p>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Navigation Footer */}
            <footer className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
              <Button
                onClick={() => closeModal && closeModal()}
                icon={<LeftOutlined className="ds-caption!" />}
                className="ds-caption! rounded-lg border-slate-200 py-2 font-semibold! text-slate-600"
              >
                Back
              </Button>
              <Button
                type="primary"
                className="bg-surface-dark! ds-caption! hover:bg-surface-dark/90! flex h-9 items-center gap-1 rounded-lg border-none px-5 font-semibold! text-white"
              >
                Confirm & continue <RightOutlined className="ds-micro!" />
              </Button>
            </footer>
          </div>
        </section>

        {/* Right Column - Original Document View */}
        <section className="flex w-2/5 flex-col overflow-hidden bg-white lg:w-[37%]">
          {/* Doc Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
            <span className="ds-micro! font-bold! tracking-wider text-slate-700 uppercase">
              Original Document
            </span>
            <div className="flex items-center gap-1">
              <Button
                icon={<ZoomOutOutlined />}
                type="text"
                size="small"
                className="text-slate-700"
              />
              <Button
                icon={<ZoomInOutlined />}
                type="text"
                size="small"
                className="text-slate-700"
              />
              <Button
                icon={<DownloadOutlined />}
                type="text"
                size="small"
                className="text-slate-700"
              />
              <Button
                icon={<FullscreenOutlined />}
                type="text"
                size="small"
                className="text-slate-700"
              />
            </div>
          </div>

          {/* Document Pages Container */}
          <div className="flex flex-1 flex-col items-center space-y-6 overflow-y-auto bg-slate-100 p-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="w-full max-w-sm space-y-2">
                <p className="ds-caption! text-center font-medium! text-slate-700">
                  Page {num} of {totalPages}
                </p>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <FileTextOutlined className="text-6xl text-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination status footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
            <span className="ds-caption! font-semibold! text-slate-500">
              {totalPages} pages • PDF
            </span>
            <div className="flex gap-1">
              <Button
                icon={<UpOutlined className="ds-caption!" />}
                size="small"
                className="text-slate-700"
              />
              <Button
                icon={<DownOutlined className="ds-caption!" />}
                size="small"
                className="text-slate-700"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

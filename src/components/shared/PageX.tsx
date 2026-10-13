'use client';
import React, { ReactNode, useEffect, useRef } from 'react';
import { FloatButton, Tooltip } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { Info } from 'lucide-react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string | ReactNode;
  headingInfo?: ReactNode; // tooltip content shown via an info icon next to the heading
  headingExtra?: ReactNode; // inline content shown next to the heading (e.g. a document-count badge)
  subheading?: string | ReactNode;
  actions?: ReactNode; // 👈 new prop
  scrollClassName?: string; // extra classes for the scroll container (e.g. bounded height for sticky children)
  stickyHeader?: boolean; // pin the heading row to the top of the scroll container
  stickyContent?: ReactNode; // extra content pinned together with the header (e.g. a progress bar)
  scrollResetKey?: string | number; // when this changes, the scroll container resets to the top
  showScrollFab?: boolean; // show a floating scroll up / down button pinned to the corner
}

function PageX({
  children,
  className,
  heading,
  headingInfo,
  headingExtra,
  subheading,
  actions,
  scrollClassName,
  stickyHeader,
  stickyContent,
  scrollResetKey,
  showScrollFab,
  ...rest
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [heading, subheading, actions, scrollResetKey]);

  const scrollToTop = () => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => {
    const el = containerRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`overflow-x-hidden overflow-y-auto px-2 pb-4 ${
          stickyHeader ? 'bg-[#F8F9FF] pt-0' : 'pt-1'
        } ${scrollClassName ?? ''}`}
      >
        {/* Header + optional sticky content, pinned together as one block */}
        {(heading || actions || stickyContent) && (
          <div className={stickyHeader ? 'sticky top-0 z-40 -mx-2 bg-[#F8F9FF] px-2 pb-1' : ''}>
            {(heading || actions) && (
              <div className="flex items-center justify-between gap-4">
                {/* Left Side */}
                <div>
                  {heading && (
                    <p className="heading-page my-0 flex items-center gap-2">
                      <span>{heading}</span>
                      {headingInfo && (
                        <Tooltip title={headingInfo} placement="right">
                          <Info className="h-4 w-4 shrink-0 cursor-help text-slate-700 transition-colors hover:text-slate-600" />
                        </Tooltip>
                      )}
                    </p>
                  )}
                  {/* {subheading && <p className="mt-0.5 mb-1 text-sm text-gray-600">{subheading}</p>} */}
                </div>

                {/* Right Side (badge + actions) */}
                {(headingExtra || actions) && (
                  <div className="flex items-center gap-2">
                    {headingExtra}
                    {actions}
                  </div>
                )}
              </div>
            )}

            {stickyContent}
          </div>
        )}

        {/* Content */}
        <div className={`relative flex flex-col ${className}`} {...rest}>
          {children}
        </div>
      </div>

      {/* Sit to the LEFT of the ChatBot launcher (fixed right-6 bottom-23, 64px wide) so the
          scroll arrows and the chatbot read as one bottom-right control cluster. */}
      {showScrollFab && (
        <FloatButton.Group shape="circle" style={{ right: 104, bottom: 92 }}>
          <FloatButton icon={<UpOutlined />} tooltip="Scroll to top" onClick={scrollToTop} />
          <FloatButton
            icon={<DownOutlined />}
            tooltip="Scroll to bottom"
            onClick={scrollToBottom}
          />
        </FloatButton.Group>
      )}
    </>
  );
}

export default PageX;

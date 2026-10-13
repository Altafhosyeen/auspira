'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SelectX from './SelectX';

interface GenericPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function GenericPagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: GenericPaginationProps) {
  // `pageSize` drives every number below by division — a cleared/invalid value (e.g. from the
  // select's clear button) must never reach `Math.ceil`/`* pageSize`, or every figure here
  // renders as the literal string "NaN" instead of a number.
  const safePageSize = pageSize > 0 ? pageSize : (pageSizeOptions[0] ?? 10);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  const startItem = total === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const endItem = Math.min(currentPage * safePageSize, total);

  return (
    <div className="flex w-full flex-row justify-between">
      {/* Left */}
      <div className="flex items-center gap-3 text-sm text-[#4B5563]">
        <span className="text-[18px] text-[#212121]">Items per page:</span>
        <SelectX
          value={pageSize}
          onChange={(value) => onPageSizeChange?.(Number(value))}
          options={pageSizeOptions.map((option) => ({
            label: String(option),
            value: option,
          }))}
          // The page size must always hold one of `pageSizeOptions` — clearing it left nothing
          // to divide by and rendered "NaN" everywhere below (see `safePageSize` above).
          allowClear={false}
          className="w-15! rounded-sm! bg-[#4880FF1A]! text-[16px]!"
        />
        <span className="text-[18px] text-[#525252]">
          {startItem} - {endItem} of {total} items
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 text-sm text-[#4B5563]">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#E9EDF4] bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-[18px] text-[#525252]">
          {currentPage} of {totalPages} Pages
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#E9EDF4] bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

'use client';

import { Skeleton, type SkeletonProps } from 'antd';

interface Props extends SkeletonProps {
  label?: string;
}

function SkeletonX({ label, active = true, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-gray-500">{label}</span>}
      <Skeleton active={active} {...props} />
    </div>
  );
}
export default SkeletonX;

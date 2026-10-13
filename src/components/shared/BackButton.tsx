'use client';

import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ButtonX from '../antd/ButtonX';

interface BackButtonProps {
  className?: string;
  label?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ className, label = 'Go Back', onClick }) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (onClick) {
      onClick();
      return;
    }

    router.back();
  };

  return (
    <ButtonX
      icon={<ArrowLeft className="h-4.5 w-auto" />}
      onClick={handleGoBack}
      type="text"
      className={`${className ?? ''} flex items-center justify-center bg-transparent! text-[16px]! text-[#0A3E8C]!`}
    >
      {label}
    </ButtonX>
  );
};

export default BackButton;

import React from 'react';
import UploadCard from './UploadCard';

const UPLOADS = [
  {
    title: 'Form of Agreement',
    subtitle: 'The primary executing document.',
    required: true,
    fullWidth: true,
  },
  {
    title: 'Contract Data',
    subtitle: 'Part 1 & 2',
  },
  {
    title: 'Conditions',
    subtitle: 'Core & Main Options',
  },
  {
    title: 'Z-Clauses',
    subtitle: 'Additional conditions',
  },
  {
    title: 'Works Info',
    subtitle: 'Scope & specifications',
  },
  {
    title: 'Site Info',
    subtitle: 'Conditions & data',
  },
  {
    title: 'Pricing Document',
    subtitle: 'Activity Schedule for Option A',
    fullWidth: true,
  },
];

export default function UploadSection() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {UPLOADS.map((item) => (
        <UploadCard key={item.title} {...item} />
      ))}
    </div>
  );
}

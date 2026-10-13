import { Card } from 'antd';
import React from 'react';

const OPTIONS = [
  { id: 'option-1', label: 'Priced Contract with Activity Schedule' },
  { id: 'option-2', label: 'Priced Contract with Bill of Quantities' },
  { id: 'option-3', label: 'Priced Contract with Activity Schedule' },
  { id: 'option-4', label: 'Priced Contract with Activity Schedule' },
];

interface SpecificDocumentsProps {
  selected: number | null;
  onSelect: (index: number) => void;
}

export default function SpecificDocuments({ selected, onSelect }: SpecificDocumentsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {OPTIONS.map((item, i) => (
        <Card
          key={item.id}
          onClick={() => onSelect(i)}
          className={`w-[200px] cursor-pointer text-sm ${
            selected === i ? 'border-blue-500 shadow-sm' : 'border-gray-200'
          }`}
        >
          {item.label}
        </Card>
      ))}
    </div>
  );
}

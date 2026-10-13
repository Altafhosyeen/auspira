/**
 * Field Label
 * Reusable label component with optional required indicator
 */

import React from 'react';

interface FieldLabelProps {
  label: string;
  required?: boolean;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ label, required }) => (
  <label className="mb-1 block text-sm font-medium text-gray-700">
    {label}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

FieldLabel.displayName = 'FieldLabel';

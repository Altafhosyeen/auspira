'use client';
import { DatePicker, type DatePickerProps } from 'antd';

interface Props extends DatePickerProps {
  label?: string;
}

function DatePickerX({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}
      <DatePicker {...props} />
    </div>
  );
}

export default DatePickerX;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, DatePicker, Card, Segmented } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styles from '@/app/styles/dashboard.module.css';

const { RangePicker } = DatePicker;

const OrgFilters = () => {
  const [quickFilter, setQuickFilter] = useState('Last 30 days');
  const quickFilters = ['Last 30 days', 'Week', 'MTD', '3 month', '6 month'];

  return (
    <Card className="flex! w-full flex-col gap-4" style={{ animation: 'slideUp 0.5s ease-out' }}>
      <motion.span
        className="mb-4 text-sm font-medium text-[#7a879d]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Sort by
      </motion.span>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 space-x-2!">
          <RangePicker format="MM/DD/YYYY" size="large" suffixIcon={<CalendarOutlined />} />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="primary">Apply</Button>
          </motion.div>
        </div>
        <motion.div
          className={styles['dashboard-segment']}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Segmented
            sizes="large"
            className={styles['segment-control']}
            value={quickFilter}
            onChange={setQuickFilter}
            options={quickFilters}
            size="middle"
          />
        </motion.div>
      </div>
    </Card>
  );
};

export default OrgFilters;

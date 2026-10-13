'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ContractAnalysisCard: React.FC = () => {
  return (
    <Card
      className="rounded-xl border border-gray-200 shadow-sm"
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <Title level={5} className="!mb-0 font-bold!">
          Contract Analysis
        </Title>
        <motion.div whileHover={{ rotate: 20, scale: 1.2 }} whileTap={{ scale: 0.9 }}>
          <InfoCircleOutlined className="cursor-pointer text-gray-400" />
        </motion.div>
      </div>

      <motion.div
        className="mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Text className="font-medium text-green-500!">↑ 12.3%</Text>
        <Text className="ml-2 text-gray-500">than last month</Text>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((item, index) => (
          <motion.div
            key={item}
            className="rounded-lg bg-[#EFF4FF] p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)' }}
          >
            <Text className="mb-1 block text-gray-500">Contracts Analyzed</Text>
            <Title level={4} className="!mb-0 font-bold!">
              1,234
            </Title>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default ContractAnalysisCard;

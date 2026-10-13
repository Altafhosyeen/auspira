'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { elasticScaleVariants } from '@/lib/config/motion.config';

const { Title, Text } = Typography;

const data = [{ name: 'Progress', value: 89, fill: '#22c55e' }];

const ProjectHealthCard = () => {
  return (
    <Card
      className="rounded-2xl shadow-sm [&>.ant-card-body]:p-6"
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div className="flex items-start justify-between">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Title level={5} className="!mb-0 font-bold! text-gray-600">
            Project Health
          </Title>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
            <h1 className="text-4xl font-bold text-gray-700">89%</h1>
            <p className="mt-1 text-sm text-green-500">
              ↑ 12.3% <span className="text-gray-400">than last month</span>
            </p>
          </motion.div>
          <motion.div
            className="mt-4 flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircleFilled className="mt-1 text-lg text-green-500" />
            </motion.div>
            <Text className="text-gray-500">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </Text>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center"
          variants={elasticScaleVariants}
          whileHover="hover"
        >
          <RadialBarChart
            width={160}
            height={120}
            cx="50%"
            cy="100%"
            innerRadius="80%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
          <motion.div
            className="-mt-6 text-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            <p className="text-lg font-semibold text-gray-700">89%</p>
            <p className="text-sm text-gray-400">Complete</p>
          </motion.div>
        </motion.div>
      </div>
    </Card>
  );
};

export default ProjectHealthCard;

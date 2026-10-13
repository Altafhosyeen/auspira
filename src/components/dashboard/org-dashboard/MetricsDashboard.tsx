import React from 'react';
import { motion } from 'framer-motion';
import { Flex } from 'antd';
import { ArrowUpOutlined, InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { BookCheck, TrendingUp, TriangleAlert } from 'lucide-react';
import { elasticScaleVariants, dashboardPageVariants } from '@/lib/config/motion.config';

const MetricCard = ({
  title,
  icon,
  value,
  lastMonth,
  changeText,
  infoTooltip,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  lastMonth: string;
  changeText: string;
  infoTooltip?: string;
}) => (
  <motion.div
    className="rounded-xl bg-gradient-to-br p-4 transition-shadow hover:shadow-lg"
    variants={elasticScaleVariants}
    whileHover="hover"
  >
    <Flex align="center" justify="space-between" className="mb-1">
      <Flex align="center" gap={8}>
        <motion.div
          className="flex items-center justify-center rounded bg-green-100 p-1"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </Flex>
      <motion.div
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-50 transition-all hover:bg-slate-100"
        whileHover={{ scale: 1.2, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => infoTooltip && alert(infoTooltip)}
      >
        <InfoCircleOutlined className="text-sm text-slate-700" />
      </motion.div>
    </Flex>
    <div className="mb-4 text-xs text-slate-700">Last month: {lastMonth}</div>
    <motion.div
      className="mb-2 text-3xl leading-tight font-semibold text-slate-800"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {value}
    </motion.div>
    <Flex align="center" gap={6}>
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <ArrowUpOutlined className="text-xs text-green-500" />
      </motion.div>
      <span className="text-xs text-green-500">{changeText}</span>
    </Flex>
  </motion.div>
);

const MetricsDashboard = () => {
  const metricsData = [
    {
      title: 'Urgent',
      icon: <TrendingUp className="text-base text-green-500" />,
      value: '23',
      lastMonth: '220',
      changeText: '20% than last month',
      tooltip: 'Urgent issues that need immediate attention',
    },
    {
      title: 'Critical',
      icon: <TriangleAlert className="text-base text-orange-500" />,
      value: '03',
      lastMonth: '38',
      changeText: '11 than last month',
      tooltip: 'Critical bugs requiring escalation',
    },
    {
      title: 'Open CEs',
      icon: <EyeOutlined className="text-base text-blue-500" />,
      value: '14',
      lastMonth: '78%',
      changeText: '10% than last month',
      tooltip: 'Open change requests',
    },
    {
      title: 'Programs',
      icon: <BookCheck className="text-base text-green-500" />,
      value: '+47d',
      lastMonth: '4,8',
      changeText: '10% than last month',
      tooltip: 'Active programs this month',
    },
  ];

  return (
    <motion.div
      className="flex flex-wrap gap-4"
      variants={dashboardPageVariants}
      initial="hidden"
      animate="visible"
    >
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.title}
          className="min-w-[200px] flex-1"
          custom={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: (i: number) => ({
              opacity: 1,
              y: 0,
              transition: { delay: i * 0.1, duration: 0.5 },
            }),
          }}
          initial="hidden"
          animate="visible"
        >
          <MetricCard
            title={metric.title}
            icon={metric.icon}
            value={metric.value}
            lastMonth={metric.lastMonth}
            changeText={metric.changeText}
            infoTooltip={metric.tooltip}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MetricsDashboard;

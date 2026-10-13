'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Nov', value: 20 },
  { name: 'Dec', value: 28 },
  { name: 'Jan', value: 34 },
  { name: 'Feb', value: 40 },
  { name: 'Mar', value: 26 },
  { name: 'Apr', value: 30 },
];

export default function ProjectChartDashboard() {
  return (
    <div className="bg-gray-100 p-8" style={{ animation: 'slideUp 0.5s ease-out' }}>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-lg font-bold text-gray-700">Projects</h2>
          <motion.button
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            whileHover={{ scale: 1.05, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
          >
            See Details →
          </motion.button>
        </motion.div>

        <div className="flex items-center gap-6 rounded-lg p-6 shadow">
          <motion.div
            className="w-1/3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-sm text-gray-500">Overall</p>
            <p className="mb-4 text-xs text-gray-400">Description</p>
            <motion.h1
              className="text-4xl font-bold text-gray-700"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              23%
            </motion.h1>
            <p className="text-sm text-gray-500">Projects</p>
          </motion.div>

          <motion.div
            className="h-40 w-2/3 shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="value" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import AdminDashboard from '@/components/dashboard/admin-dashboard/AdminDashboard';
import { useAuthStore } from '@/store/auth.store';
import { SYSTEM_ROLE_IDS } from '@/constants/role.ids';
import { useSession } from 'next-auth/react';
import { slideUpFadeVariants } from '@/lib/config/motion.config';
import OrgDashboard from '@/components/dashboard/org-dashboard/OrgDashboard';

export default function HomePage() {
  const { data: session } = useSession();
  const loginUser = useAuthStore((state) => state.user);

  // Redirect if no session
  if (!session) {
    return <div className="p-6">No session found</div>;
  }

  // Use session user data if store hasn't synced yet
  const user = loginUser || session.user;
  const isSystemAdmin = user?.roleId === SYSTEM_ROLE_IDS.SYSTEM_ADMIN;
  const isOrganizationAdmin = user?.roleId === SYSTEM_ROLE_IDS.ORGANIZATION_ADMIN;
  const isOrganizationUser = user?.roleId === SYSTEM_ROLE_IDS.ORGANIZATION_USER;

  return (
    <>
      {isSystemAdmin && <AdminDashboard />}
      {isOrganizationAdmin && <OrgDashboard />}
      {isOrganizationUser && (
        <motion.div
          className="flex items-center justify-center p-6"
          variants={slideUpFadeVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-100 blur-3xl" />

            <div className="relative z-10 text-center">
              {/* Icon */}
              <motion.div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M9 11h6"
                  />
                </svg>
              </motion.div>

              {/* Title */}
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Coming Soon</h2>

              {/* Description */}
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Your organisation workspace is currently under setup and will be available soon.
                We’re preparing everything for your access.
              </p>

              {/* Status Badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                Setup in Progress
              </div>

              {/* Optional Role Info */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs tracking-wide text-gray-500 uppercase">Organisation Role</p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {user?.roleId || 'Pending Assignment'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

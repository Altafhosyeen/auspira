'use client';

import { useEffect } from 'react';
import { Button } from 'antd';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard segment error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-170 rounded-[14px] border border-slate-200 bg-white p-6">
        <h1 className="m-0 text-2xl font-bold text-slate-900">Dashboard crashed safely</h1>
        <p className="mt-2 mb-0 text-slate-600">
          This error is scoped to dashboard routes only. Other app sections remain unaffected.
        </p>

        <div className="mt-4.5 flex gap-3">
          <Button type="primary" onClick={reset}>
            Reload dashboard view
          </Button>
        </div>
      </section>
    </main>
  );
}

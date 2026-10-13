'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from 'antd';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled app error boundary:', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-170 rounded-[14px] border border-slate-200 bg-white p-6">
        <h1 className="m-0 text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 mb-0 text-slate-600">
          The page crashed unexpectedly. You can retry this route without affecting other pages.
        </p>

        <div className="mt-4.5 flex gap-3">
          <Button type="primary" onClick={reset}>
            Try again
          </Button>
          <Button>
            <Link href="/">Go to dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

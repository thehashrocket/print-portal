'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('Page Error:', error);

    // Send error to our logging endpoint
    void fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        },
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }),
    }).catch((err) => {
      console.error('Failed to log error:', err);
    });

    // Show toast notification
    toast.error('Something went wrong. Our team has been notified.');
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-red-600">500 - Server Error</h2>
        <p className="mb-4 text-gray-600">
          We're sorry, but something went wrong on our end. We've been notified and will fix it as soon as possible.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
} 
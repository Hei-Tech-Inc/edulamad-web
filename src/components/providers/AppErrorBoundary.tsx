'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isAbortError } from '@/lib/abort-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    if (isAbortError(error)) {
      return { hasError: false, error: undefined };
    }
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');
    return { hasError: true, error: err };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isAbortError(error)) return;
    if (process.env.NODE_ENV === 'development') {
      console.error('[AppErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError && !isAbortError(this.state.error)) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-4">
            <p className="text-sm text-slate-500">Something went wrong.</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="text-sm font-medium text-orange-600 underline"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

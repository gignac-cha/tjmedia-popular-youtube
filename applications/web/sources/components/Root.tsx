import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Application } from './Application.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Root(): ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <Application />
    </QueryClientProvider>
  );
}

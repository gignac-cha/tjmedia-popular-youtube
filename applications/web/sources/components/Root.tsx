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

export function Root(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Application />
    </QueryClientProvider>
  );
}

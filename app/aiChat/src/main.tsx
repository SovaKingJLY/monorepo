import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { App as AntdApp } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

createRoot(document.getElementById('root')!).render(

  <AntdApp>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </AntdApp>
)

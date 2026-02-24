import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import { App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import useDarkStore from './store/darkMode';

const queryClient = new QueryClient();
let root: Root | null = null;
let unsubscribeMainDarkStore: (() => void) | undefined;

interface QiankunProps {
  container?: HTMLElement;
  [key: string]: any;
}

function render(props: QiankunProps) {
  const { container } = props;

  const targetDom = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (targetDom) {
    if (!root) {
      root = createRoot(targetDom);
    }
    root.render(
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AntdApp>
    );
  } else {
    // 避免在 unmount 期间或非预期情况下报错
    if (!qiankunWindow.__POWERED_BY_QIANKUN__ || props?.container) {
      console.error('Root element not found');
    }
  }
}

renderWithQiankun({
  mount(props) {
    console.log('notebook mount', props);
    const darkModeStore = props?.darkModeStore;

    if (darkModeStore?.getState) {
      const mainDarkState = darkModeStore.getState();
      if (typeof mainDarkState?.isDark === 'boolean') {
        useDarkStore.getState().setDark(mainDarkState.isDark);
      }
      if (darkModeStore?.subscribe) {
        unsubscribeMainDarkStore = darkModeStore.subscribe((state: any) => {
          if (typeof state?.isDark === 'boolean') {
            useDarkStore.getState().setDark(state.isDark);
          }
        });
      }
      useDarkStore.getState().setGlobalDarkUpdater((payload) => {
        if (typeof payload?.isDark === 'boolean') {
          darkModeStore.getState()?.setDarkWithGlobal?.(payload.isDark);
        }
      });
    } else {
      useDarkStore.getState().setGlobalDarkUpdater(undefined);
    }

    render(props);
  },
  bootstrap() {
    console.log('notebook bootstrap');
  },
  unmount(_props: any) {
    console.log('notebook unmount');
    unsubscribeMainDarkStore?.();
    unsubscribeMainDarkStore = undefined;
    useDarkStore.getState().setGlobalDarkUpdater(undefined);
    if (root) {
      root.unmount();
      root = null;
    }
  },
  update(props: any) {
    console.log('notebook update', props);
  },
});

// 独立运行时
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}

import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import { App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const queryClient = new QueryClient();
let root: Root | null = null;
let actions: any = null;

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
    // 保存全局状态 actions
    actions = props.onGlobalStateChange && props.setGlobalState
      ? { onGlobalStateChange: props.onGlobalStateChange, setGlobalState: props.setGlobalState }
      : null;

    // 监听全局状态变化
    if (actions) {
      actions.onGlobalStateChange((state: any, prev: any) => {
        console.log('notebook 接收到全局状态变化:', state, prev);
      });
    }

    render(props);
  },
  bootstrap() {
    console.log('notebook bootstrap');
  },
  unmount(_props: any) {
    console.log('notebook unmount');
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

// 导出 actions 供其他组件使用
export const getGlobalActions = () => actions;

import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import { App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import useDarkStore from './store/darkMode';

// 创建 QueryClient 实例
const queryClient = new QueryClient();

// 定义 root 变量，用于在 unmount 时销毁，防止内存泄漏
let root: Root | null = null;
let actions: any = null;
let globalState: any = {}; // 存储全局状态

// 定义 Props 类型
interface QiankunProps {
  container?: HTMLElement;
  [key: string]: any;
}

/**
 * 封装渲染逻辑
 * @param props 主应用下发的 props
 */
function render(props: QiankunProps) {
  const { container } = props;

  // 关键点：
  // 1. 如果有 container (微前端模式)，就在 container 内部找 #root
  // 2. 如果没有 (独立运行模式)，就直接找全局的 document.getElementById('root')
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
          <App {...props} />
        </QueryClientProvider>
      </AntdApp>
    );
  } else {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__ || props?.container) {
      console.error('Root element not found');
    }
  }
}

renderWithQiankun({
  mount(props) {
    console.log('aiChat mount', props);
    // 保存全局状态 actions
    actions = props.onGlobalStateChange && props.setGlobalState
      ? { onGlobalStateChange: props.onGlobalStateChange, setGlobalState: props.setGlobalState }
      : null;

    useDarkStore.getState().setGlobalDarkUpdater(actions?.setGlobalState);

    // 监听全局状态变化
    if (actions) {
      actions.onGlobalStateChange((state: any, prev: any) => {
        console.log('aiChat 接收到全局状态变化:', state, prev);
        console.log('接收到的数据:', state);
        // 保存到本地状态
        globalState = state;
        window.dispatchEvent(new CustomEvent('aichat-global-state-change', { detail: state }));
        if (typeof state?.isDark === 'boolean') {
          useDarkStore.getState().setDark(state.isDark);
        }
      }, true);
    }

    render(props);
  },
  bootstrap() {
    console.log('aiChat bootstrap');
  },
  unmount(_props: any) {
    console.log('aiChat unmount');
    useDarkStore.getState().setGlobalDarkUpdater(undefined);
    if (root) {
      root.unmount();
      root = null;
    }
  },
  update(props: any) {
    console.log('aiChat update', props);
  },
});

/**
 * 判断是否独立运行
 * 如果不是被 qiankun 加载的，直接 render，方便单独开发调试
 */
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}

// 导出获取全局状态的函数
export const getGlobalState = () => globalState;
export const getGlobalActions = () => actions;

/**
 * 导出生命周期钩子
 */

// 1. bootstrap: 初始化调用
export async function bootstrap() {
  console.log('[react18] react app bootstraped');
}

// 2. mount: 每次进入子应用调用
export async function mount(props: QiankunProps) {
  console.log('[react18] props from main framework', props);
  render(props);
}

// 3. unmount: 每次切出/卸载调用
export async function unmount(_props: any) {
  console.log('[react18] react app unmount');
  if (root) {
    root.unmount(); // 销毁 React 实例
    root = null;    // 置空防止内存泄漏
  }
}
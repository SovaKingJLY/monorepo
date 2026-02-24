import { useRef, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { loadMicroApp, start } from 'qiankun';
import { useUserStore } from './store/user';
import { darkModeStoreBridge } from './store/darkMode';
import './App.less'

const App = () => {
    const navigate = useNavigate();
    const { checkLogin } = useUserStore();
    const [isChatLoading, setIsChatLoading] = useState(false);
    // 聊天窗口状态
    const [showChat, setShowChat] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const microAppRef = useRef<any>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        const init = async () => {
            await checkLogin();
            // 默认跳转到 notebook 主页
            if (window.location.pathname === '/') {
                navigate('/app/notebook');
            }
        };
        init();

        if (!startedRef.current) {
            start({
                sandbox: {
                    // strictStyleIsolation: true,
                }
            });
            startedRef.current = true;
        }
    }, [navigate]);

    // 监听 showChat 变化，首次打开时加载微应用
    useEffect(() => {
        if (showChat && !microAppRef.current && chatContainerRef.current) {
            setIsChatLoading(true);
            microAppRef.current = loadMicroApp({
                name: 'aiChat',
                entry: '//localhost:5174',
                container: chatContainerRef.current,
                props: {
                    appType: 'widget', // 明确标识为 widget 模式
                    darkModeStore: darkModeStoreBridge,
                }
            }, {
                sandbox: {
                    // strictStyleIsolation: true
                }
            });
            microAppRef.current.mountPromise.then(() => {
                // 这里表示子应用已经成功下载资源并渲染到 DOM 中了
                setIsChatLoading(false);
            }).catch((err: any) => {
                // 处理加载失败的情况
                console.error('微应用加载失败', err);
                setIsChatLoading(false); // 失败也要关闭 loading
            });
        }
    }, [showChat]);


    const styles = {
        container: {
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
        },
        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as 'column',
            backgroundColor: '#f0f2f5',
            overflow: 'auto',
            position: 'relative' as 'relative'
        },
        floatingBox: {
            position: 'fixed' as 'fixed',
            bottom: '40px',
            right: '40px',
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundColor: '#1890ff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'transform 0.3s'
        },
        chatBox: {
            position: 'fixed' as 'fixed',
            bottom: '110px',
            right: '40px',
            width: '700px',
            height: '800px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            zIndex: 999,
            overflow: 'hidden',
            display: showChat ? 'block' : 'none',
            border: '1px solid #e8e8e8'
        }
    };

    const toggleChat = () => {
        setShowChat((prev) => !prev);
    };

    return <>
        <div style={{ flex: 1, position: 'relative' }}>


            <div id="subapp-viewport"></div>
            <Outlet />
        </div>


        <div style={styles.chatBox} > {/* 这里 ref 仅用于可能的外部定位引用，或者可以去掉 */}

            {/* 区域 A：专门给 Qiankun 用的“无人区”，React 不要在里面渲染任何子元素 */}
            <div
                ref={chatContainerRef}
                style={{ width: '100%', height: '100%' }}
            />

            {/* 区域 B：React 控制的 Loading 遮罩层，覆盖在上面 */}
            {isChatLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', //以此遮挡加载过程中的闪烁
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <span>努力加载中...</span>
                </div>
            )}
        </div>


        {/* 悬浮框 */}
        <div
            style={styles.floatingBox}
            onClick={toggleChat}
            title={showChat ? "关闭聊天" : "打开聊天"}
        >
            <span style={{ fontSize: '24px' }}>{showChat ? '-' : '+'}</span>
        </div>
    </>
};


export default App;
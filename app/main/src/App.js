"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_router_1 = require("react-router");
var Header = antd_1.Layout.Header, Content = antd_1.Layout.Content, Sider = antd_1.Layout.Sider;
var App = function () {
    return (<antd_1.Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }}/>
        <antd_1.Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <antd_1.Menu.Item key="1">
            <react_router_1.Link to="/app/aiChat">AI Chat</react_router_1.Link>
          </antd_1.Menu.Item>
          <antd_1.Menu.Item key="2">
            <react_router_1.Link to="/app/notebook">Notebook</react_router_1.Link>
          </antd_1.Menu.Item>
        </antd_1.Menu>
      </Sider>
      <antd_1.Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
            <h2 style={{ textAlign: 'center', margin: 0 }}>Main Application Base</h2>
        </Header>
        <Content style={{ margin: '16px' }}>
          {/* Qiankun 子应用挂载点 */}
          <div id="subapp-viewport" style={{ minHeight: '100%', background: '#fff', padding: 24 }}></div>
          <react_router_1.Outlet />
        </Content>
      </antd_1.Layout>
    </antd_1.Layout>);
};
exports.default = App;

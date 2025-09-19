import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Home from './pages/Home';
import HomePage from './pages/HomePage';
import ModulesPage from './pages/ModulesPage';
import FeaturesPage from './pages/FeaturesPage';
import SeedreamPage from './pages/SeedreamPage';
import TestPage from './pages/TestPage';
import ChatPage from './pages/ChatPage';
import ChatDifyPage from './pages/ChatDifyPage';
import WorkflowPanel from './pages/WorkflowPanel';
import WorkflowMonitor from './pages/WorkflowMonitor';
import { ChatProvider } from './contexts/ChatContext';
import './App.css';

// 自定义主题配置
const theme = {
  token: {
    colorPrimary: '#667eea',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 20,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <ChatProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home-alt" element={<Home />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/seedream" element={<SeedreamPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat-dify" element={<ChatDifyPage />} />
            <Route path="/workflow" element={<WorkflowPanel />} />
            <Route path="/workflow/monitor" element={<WorkflowMonitor />} />
            {/* 可以添加更多路由 */}
            <Route path="/showcase/:category" element={<div>产品展示页面 - 开发中</div>} />
            <Route path="/showcase/qixing/:type" element={<div>器型分类页面 - 开发中</div>} />
          </Routes>
        </div>
      </ChatProvider>
    </ConfigProvider>
  );
}

export default App;
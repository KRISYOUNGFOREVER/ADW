import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Button, Space } from 'antd';
import { 
  DownOutlined, 
  RocketOutlined, 
  PictureOutlined, 
  StarOutlined,
  HistoryOutlined,
  SettingOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // AI 生成功能菜单
  const aiGenerationMenu = {
    items: [
      {
        key: 'seedream',
        label: 'Seedream 4.0',
        icon: <RocketOutlined />,
        onClick: () => navigate('/seedream')
      },
      {
        key: 'star3',
        label: '星流 Star-3',
        icon: <StarOutlined />,
        onClick: () => navigate('/modules')
      },
      {
        key: 'custom',
        label: '自定义模型',
        icon: <SettingOutlined />,
        onClick: () => navigate('/modules')
      }
    ]
  };

  // 产品展示菜单
  const productShowcaseMenu = {
    items: [
      {
        key: 'xiaomao',
        label: '小茅生图',
        onClick: () => navigate('/showcase/xiaomao')
      },
      {
        key: 'shangzuo',
        label: '上作花纸生图',
        onClick: () => navigate('/showcase/shangzuo')
      },
      {
        key: 'wangxuetao',
        label: '王雪涛生图',
        onClick: () => navigate('/showcase/wangxuetao')
      },
      {
        type: 'divider'
      },
      {
        key: 'qixing',
        label: '器型分类',
        children: [
          {
            key: 'pinmingbei',
            label: '品茗杯',
            onClick: () => navigate('/showcase/qixing/pinmingbei')
          },
          {
            key: 'chayegan',
            label: '茶叶罐',
            onClick: () => navigate('/showcase/qixing/chayegan')
          },
          {
            key: 'chahu',
            label: '茶壶',
            onClick: () => navigate('/showcase/qixing/chahu')
          }
        ]
      }
    ]
  };

  // 工具与服务菜单
  const toolsMenu = {
    items: [
      {
        key: 'test',
        label: '功能测试',
        icon: <SettingOutlined />,
        onClick: () => navigate('/test')
      },
      {
        key: 'history',
        label: '生成历史',
        icon: <HistoryOutlined />,
        onClick: () => navigate('/history')
      },
      {
        key: 'chat',
        label: '智能对话',
        icon: <UserOutlined />,
        onClick: () => navigate('/chat')
      }
    ]
  };

  return (
    <AntHeader className="custom-header">
      <div className="header-content">
        {/* 左侧品牌 */}
        <div className="header-brand" onClick={() => navigate('/')}>
          <span className="brand-text">贝瑞文化</span>
        </div>

        {/* 右侧导航菜单 */}
        <div className="header-nav">
          <Space size="large">
            {/* AI 生成功能 */}
            <Dropdown
              menu={aiGenerationMenu}
              placement="bottomRight"
              trigger={['hover']}
              onOpenChange={(open) => setHoveredMenu(open ? 'ai' : null)}
            >
              <Button 
                type="text" 
                className={`nav-button ${hoveredMenu === 'ai' ? 'active' : ''}`}
              >
                <RocketOutlined />
                AI 生成
                <DownOutlined />
              </Button>
            </Dropdown>

            {/* 产品展示 */}
            <Dropdown
              menu={productShowcaseMenu}
              placement="bottomRight"
              trigger={['hover']}
              onOpenChange={(open) => setHoveredMenu(open ? 'showcase' : null)}
            >
              <Button 
                type="text" 
                className={`nav-button ${hoveredMenu === 'showcase' ? 'active' : ''}`}
              >
                <PictureOutlined />
                产品展示
                <DownOutlined />
              </Button>
            </Dropdown>

            {/* 工具与服务 */}
            <Dropdown
              menu={toolsMenu}
              placement="bottomRight"
              trigger={['hover']}
              onOpenChange={(open) => setHoveredMenu(open ? 'tools' : null)}
            >
              <Button 
                type="text" 
                className={`nav-button ${hoveredMenu === 'tools' ? 'active' : ''}`}
              >
                <SettingOutlined />
                工具服务
                <DownOutlined />
              </Button>
            </Dropdown>

            {/* 设计工坊入口 */}
            <Button 
              type="primary" 
              className="cta-button"
              onClick={() => navigate('/features')}
            >
              <AppstoreOutlined />
              设计工坊
            </Button>
          </Space>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
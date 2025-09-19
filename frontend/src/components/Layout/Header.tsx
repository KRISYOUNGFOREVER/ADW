import React from 'react'
import { Layout, Badge, Button, Space, Dropdown, Avatar } from 'antd'
import { BellOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import { useSocket } from '../../contexts/SocketContext'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const { isConnected, pendingConfirmations } = useSocket()

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: '退出登录'
    }
  ]

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#52c41a' : '#ff4d4f'
            }}
          />
          <span style={{ fontSize: 14, color: '#666' }}>
            {isConnected ? 'WebSocket已连接' : 'WebSocket未连接'}
          </span>
        </div>
      </div>

      <Space size="middle">
        <Badge count={pendingConfirmations.length} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ fontSize: 16 }}
          />
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
        >
          <Avatar
            icon={<UserOutlined />}
            style={{ cursor: 'pointer' }}
          />
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
import React from 'react'
import { Typography, Space, Avatar, Badge } from 'antd'
import { RobotOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const ChatHeader: React.FC = () => {
  return (
    <Space align="center">
      <Badge dot status="success">
        <Avatar 
          icon={<RobotOutlined />} 
          style={{ backgroundColor: '#52c41a' }}
          size="large"
        />
      </Badge>
      <div>
        <Title level={4} style={{ margin: 0, fontSize: '16px' }}>
          AI设计助手
        </Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          在线 · 随时为您服务
        </Text>
      </div>
    </Space>
  )
}

export default ChatHeader
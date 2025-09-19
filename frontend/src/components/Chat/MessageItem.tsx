import React from 'react'
import { Avatar, Typography, Space, Tag, Image } from 'antd'
import { UserOutlined, RobotOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Message } from './MessageList'

const { Text } = Typography

interface MessageItemProps {
  message: Message
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.type === 'user'
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />
      case 'sent':
        return <CheckOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <CloseOutlined style={{ color: '#ff4d4f' }} />
      default:
        return null
    }
  }

  const formatContent = (content: string) => {
    // 检查是否包含图片URL
    const imageUrlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg))/gi
    const parts = content.split(imageUrlRegex)
    
    return parts.map((part, index) => {
      // 如果是图片URL
      if (imageUrlRegex.test(part)) {
        return (
          <div key={index} style={{ marginTop: '8px', marginBottom: '8px' }}>
            <Image
              src={part}
              alt="Generated Image"
              style={{ 
                maxWidth: '300px', 
                maxHeight: '300px',
                borderRadius: '8px'
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
        )
      }
      
      // 处理普通文本，支持加粗和换行
      return part.split('\n').map((line, lineIndex) => {
        const boldRegex = /\*\*(.*?)\*\*/g
        const textParts = line.split(boldRegex)
        
        return (
          <div key={`${index}-${lineIndex}`} style={{ marginBottom: lineIndex < part.split('\n').length - 1 ? '8px' : 0 }}>
            {textParts.map((textPart, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex}>{textPart}</strong>
              ) : (
                <span key={partIndex}>{textPart}</span>
              )
            )}
          </div>
        )
      })
    })
  }

  return (
    <div style={{ 
      width: '100%',
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        maxWidth: '70%',
        gap: '12px'
      }}>
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          style={{
            backgroundColor: isUser ? '#1890ff' : '#52c41a',
            flexShrink: 0
          }}
        />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start'
        }}>
          <div
            style={{
              background: isUser ? '#1890ff' : '#f6f6f6',
              color: isUser ? '#fff' : '#333',
              padding: '12px 16px',
              borderRadius: '12px',
              borderTopLeftRadius: isUser ? '12px' : '4px',
              borderTopRightRadius: isUser ? '4px' : '12px',
              maxWidth: '100%',
              wordBreak: 'break-word',
              lineHeight: '1.5'
            }}
          >
            <div style={{ fontSize: '14px' }}>
              {formatContent(message.content)}
            </div>
          </div>
          
          <Space 
            size="small" 
            style={{ 
              marginTop: '4px',
              fontSize: '12px'
            }}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {message.timestamp}
            </Text>
            {isUser && getStatusIcon()}
          </Space>
        </div>
      </div>
    </div>
  )
}

export default MessageItem
import React, { useEffect, useRef } from 'react'
import { List, Empty } from 'antd'
import { useChat } from '../../contexts/ChatContext'
import MessageItem from './MessageItem'

const MessageList: React.FC = () => {
  const { messages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <Empty 
          description="暂无消息，开始对话吧！"
          style={{ color: '#999' }}
        />
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <List
        dataSource={messages}
        renderItem={(message) => (
          <List.Item style={{ border: 'none', padding: '8px 0' }}>
            <MessageItem message={message} />
          </List.Item>
        )}
        style={{ padding: '0' }}
      />
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
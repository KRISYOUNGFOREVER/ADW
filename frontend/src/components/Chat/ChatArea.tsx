import React from 'react'
import { Layout } from 'antd'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

const { Header, Content, Footer } = Layout

const ChatArea: React.FC = () => {
  return (
    <Layout style={{ height: '100%', background: '#fff' }}>
      <Header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e8e8e8',
        padding: '0 24px',
        height: '64px',
        lineHeight: '64px'
      }}>
        <ChatHeader />
      </Header>
      
      <Content style={{ 
        padding: '16px 24px',
        overflow: 'auto',
        flex: 1
      }}>
        <MessageList />
      </Content>
      
      <Footer style={{ 
        background: '#fff',
        borderTop: '1px solid #e8e8e8',
        padding: '16px 24px'
      }}>
        <MessageInput />
      </Footer>
    </Layout>
  )
}

export default ChatArea
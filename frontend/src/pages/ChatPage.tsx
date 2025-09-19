import React from 'react'
import { Layout } from 'antd'
import { ChatProvider } from '../contexts/ChatContext'
import ChatSidebar from '../components/Chat/ChatSidebar'
import ChatArea from '../components/Chat/ChatArea'

const { Sider, Content } = Layout

const ChatPage: React.FC = () => {
  return (
    <Layout style={{ height: '100%', background: '#fff' }}>
      <Sider 
        width={300} 
        style={{ 
          background: '#fafafa', 
          borderRight: '1px solid #f0f0f0',
          height: '100%'
        }}
      >
        <ChatSidebar />
      </Sider>
      <Content style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ChatArea />
      </Content>
    </Layout>
  )
}

export default ChatPage
import React from 'react'
import { Typography, Card } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

const ChatDifyPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{ 
      height: '100vh', 
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        background: '#fff',
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <ArrowLeftOutlined 
          style={{ 
            fontSize: '18px', 
            cursor: 'pointer',
            color: '#666'
          }}
          onClick={() => navigate('/')}
        />
        <Title level={4} style={{ margin: 0, color: '#333' }}>
          AI设计助手 - 聊天式交互
        </Title>
      </div>

      {/* Dify Chatbot Iframe */}
      <div style={{ 
        flex: 1,
        padding: '24px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Card 
          style={{ 
            width: '100%',
            maxWidth: '1200px',
            height: '100%',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ 
            padding: 0,
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <iframe 
            src={`${window.location.protocol}//${window.location.hostname}/chatbot/JCHpLEF2vt3eJD91`}
            style={{
              width: '100%', 
              height: '100%', 
              minHeight: '700px',
              border: 'none',
              borderRadius: '12px'
            }}
            allow="microphone"
            title="AI设计助手"
          />
        </Card>
      </div>
    </div>
  )
}

export default ChatDifyPage
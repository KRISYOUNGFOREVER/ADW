import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Row, Col, Typography, Space } from 'antd'
import { MessageOutlined, NodeIndexOutlined, RobotOutlined, DesktopOutlined, StarOutlined, ThunderboltOutlined, HeartOutlined, BulbOutlined } from '@ant-design/icons'
import Logo from '../assets/logo.svg'

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MessageOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: '聊天式交互',
      description: '通过自然语言描述您的设计需求，AI将智能理解并为您生成个性化的设计方案。',
      path: '/chat',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <NodeIndexOutlined style={{ fontSize: '48px', color: '#4facfe' }} />,
      title: '工作流式交互',
      description: '深度定制的设计场景，通过结构化的工作流程实现精确的设计控制。',
      path: '/workflow',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: <BulbOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      title: '功能模块',
      description: '专业的AI设计工具集，包含打光渲染、材质更换、配色方案等多种功能。',
      path: '/modules',
      gradient: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)'
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装饰元素 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        zIndex: 0
      }} />

      {/* Header with Logo */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="贝瑞文化" style={{ height: '50px' }} />
          <div style={{ marginLeft: 'auto' }}>
            <Button type="text" style={{ marginRight: '16px', color: '#666' }}>关于我们</Button>
            <Button type="text" style={{ marginRight: '16px', color: '#666' }}>联系我们</Button>
            <Button type="primary" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '20px',
              padding: '0 24px'
            }}>
              登录
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ 
        position: 'relative',
        zIndex: 5,
        textAlign: 'center', 
        padding: '100px 20px 80px',
        color: '#2d3748'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '50px',
          marginBottom: '32px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <StarOutlined style={{ color: '#667eea', marginRight: '8px' }} />
          <span style={{ color: '#667eea', fontSize: '14px', fontWeight: '500' }}>AI驱动的设计革命</span>
        </div>
        
        <Title level={1} style={{ 
          color: '#2d3748', 
          fontSize: '56px', 
          marginBottom: '24px',
          fontWeight: '700',
          lineHeight: '1.2',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          重新定义设计创作
        </Title>
        
        <Paragraph style={{ 
          fontSize: '22px', 
          color: '#4a5568', 
          maxWidth: '700px', 
          margin: '0 auto 48px',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          通过先进的AI技术和直观的交互体验，让每一个创意都能完美呈现。
          专为高端定制设计而生的智能平台。
        </Paragraph>

        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '25px',
              height: '50px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: '500',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}
            onClick={() => navigate('/chat')}
          >
            开始创作
          </Button>
          <Button 
            size="large"
            style={{ 
              borderRadius: '25px',
              height: '50px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: '500',
              border: '2px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          >
            了解更多
          </Button>
        </Space>
      </div>

      {/* Features Section */}
      <div style={{ 
        position: 'relative',
        zIndex: 5,
        padding: '80px 20px', 
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        margin: '0 20px',
        borderRadius: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title level={2} style={{ 
              marginBottom: '16px', 
              color: '#2d3748',
              fontSize: '42px',
              fontWeight: '700'
            }}>
              选择您的创作方式
            </Title>
            <Paragraph style={{ 
              fontSize: '18px', 
              color: '#4a5568',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              三种不同的交互模式，满足不同层次的设计需求
            </Paragraph>
          </div>
          
          <Row gutter={[40, 40]} justify="center">
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} lg={8} key={index}>
                <Card
                  hoverable
                  style={{ 
                    height: '380px',
                    borderRadius: '24px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  bodyStyle={{ 
                    padding: '48px 40px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 2
                  }}
                  onClick={() => navigate(feature.path)}
                >
                  {/* 卡片背景渐变 */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: feature.gradient,
                    zIndex: 1
                  }} />
                  
                  <div>
                    <div style={{ 
                      marginBottom: '32px',
                      padding: '20px',
                      background: `linear-gradient(135deg, ${feature.icon.props.style.color}15, ${feature.icon.props.style.color}05)`,
                      borderRadius: '20px',
                      display: 'inline-block'
                    }}>
                      {feature.icon}
                    </div>
                    <Title level={3} style={{ 
                      marginBottom: '20px', 
                      color: '#2d3748',
                      fontSize: '24px',
                      fontWeight: '600'
                    }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ 
                      color: '#4a5568', 
                      fontSize: '16px',
                      lineHeight: '1.7',
                      marginBottom: '32px'
                    }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                  
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ 
                      background: feature.gradient,
                      border: 'none',
                      borderRadius: '16px',
                      height: '52px',
                      fontSize: '16px',
                      fontWeight: '500',
                      boxShadow: `0 8px 25px ${feature.icon.props.style.color}30`
                    }}
                  >
                    立即体验
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* About Section */}
      <div style={{ 
        position: 'relative',
        zIndex: 5,
        padding: '100px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Title level={2} style={{ 
            marginBottom: '32px', 
            color: '#2d3748',
            fontSize: '42px',
            fontWeight: '700'
          }}>
            为什么选择我们
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: '#4a5568',
            lineHeight: '1.8',
            marginBottom: '60px',
            maxWidth: '700px',
            margin: '0 auto 60px'
          }}>
            专注于高端定制产品的完整设计流程，从概念到成品，
            我们提供最专业的AI设计解决方案。
          </Paragraph>
          
          <Row gutter={[40, 40]} justify="center">
            <Col xs={24} sm={8}>
              <div style={{ 
                padding: '32px 24px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
              }}>
                <ThunderboltOutlined style={{ 
                  fontSize: '48px', 
                  color: '#667eea', 
                  marginBottom: '20px' 
                }} />
                <Title level={4} style={{ color: '#2d3748', margin: '0 0 12px', fontWeight: '600' }}>
                  智能高效
                </Title>
                <Paragraph style={{ margin: '0', color: '#4a5568', fontSize: '15px' }}>
                  AI驱动的设计流程，大幅提升创作效率
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ 
                padding: '32px 24px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
              }}>
                <StarOutlined style={{ 
                  fontSize: '48px', 
                  color: '#4facfe', 
                  marginBottom: '20px' 
                }} />
                <Title level={4} style={{ color: '#2d3748', margin: '0 0 12px', fontWeight: '600' }}>
                  个性定制
                </Title>
                <Paragraph style={{ margin: '0', color: '#4a5568', fontSize: '15px' }}>
                  深度定制化设计方案，满足独特需求
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ 
                padding: '32px 24px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
              }}>
                <HeartOutlined style={{ 
                  fontSize: '48px', 
                  color: '#764ba2', 
                  marginBottom: '20px' 
                }} />
                <Title level={4} style={{ color: '#2d3748', margin: '0 0 12px', fontWeight: '600' }}>
                  用心服务
                </Title>
                <Paragraph style={{ margin: '0', color: '#4a5568', fontSize: '15px' }}>
                  专业团队全程支持，确保最佳体验
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 5,
        padding: '40px 20px',
        background: 'rgba(45, 55, 72, 0.95)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <img src={Logo} alt="贝瑞文化" style={{ height: '40px', marginBottom: '16px', filter: 'brightness(0) invert(1)' }} />
          <Paragraph style={{ margin: '0', color: 'rgba(255, 255, 255, 0.7)' }}>
            © 2024 贝瑞文化. 保留所有权利.
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}

export default Home
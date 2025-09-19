import React from 'react';
import { Layout, Card, Row, Col, Typography, Button } from 'antd';
import { MessageOutlined, NodeIndexOutlined, BulbOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  // 三种交互模式配置
  const interactionModes = [
    {
      icon: <MessageOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: '聊天式交互',
      description: '通过自然语言描述您的设计需求，AI将智能理解并为您生成个性化的设计方案。',
      path: '/chat-dify',
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
      title: '常用功能',
      description: '专业的AI设计工具集，包含打光渲染、材质更换、配色方案等多种功能。',
      path: '/modules',
      gradient: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Content>
        {/* Header */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ArrowLeftOutlined 
              style={{ 
                fontSize: '20px', 
                cursor: 'pointer',
                color: '#666',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate('/')}
            />
            <Title level={2} style={{ margin: 0, color: '#2d3748', fontSize: '28px', fontWeight: '600' }}>
              设计工坊
            </Title>
          </div>
        </div>

        {/* 功能模块内容 */}
        <div style={{ 
          padding: '80px 20px',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <Title level={1} style={{ 
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
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                三种不同的交互模式，满足不同层次的设计需求，让您的创意无限延伸
              </Paragraph>
            </div>
            
            <Row gutter={[40, 40]} justify="center">
              {interactionModes.map((mode, index) => (
                <Col xs={24} sm={12} md={8} lg={8} key={index}>
                  <Card
                    hoverable
                    style={{ 
                      height: '420px',
                      borderRadius: '24px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    styles={{ 
                      body: { 
                        padding: '48px 40px',
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        zIndex: 2
                      }
                    }}
                    onClick={() => navigate(mode.path)}
                  >
                    {/* 卡片背景渐变 */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: mode.gradient,
                      zIndex: 1
                    }} />
                    
                    <div>
                      <div style={{ 
                        marginBottom: '32px',
                        padding: '24px',
                        background: `linear-gradient(135deg, ${mode.icon.props.style.color}15, ${mode.icon.props.style.color}05)`,
                        borderRadius: '20px',
                        display: 'inline-block'
                      }}>
                        {mode.icon}
                      </div>
                      <Title level={3} style={{ 
                        marginBottom: '20px', 
                        color: '#2d3748',
                        fontSize: '24px',
                        fontWeight: '600'
                      }}>
                        {mode.title}
                      </Title>
                      <Paragraph style={{ 
                        color: '#4a5568', 
                        fontSize: '16px',
                        lineHeight: '1.7',
                        marginBottom: '32px'
                      }}>
                        {mode.description}
                      </Paragraph>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="large"
                      style={{ 
                        background: mode.gradient,
                        border: 'none',
                        borderRadius: '16px',
                        height: '52px',
                        fontSize: '16px',
                        fontWeight: '500',
                        boxShadow: `0 8px 25px ${mode.icon.props.style.color}30`,
                        transition: 'all 0.3s ease'
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
      </Content>
    </Layout>
  );
};

export default FeaturesPage;
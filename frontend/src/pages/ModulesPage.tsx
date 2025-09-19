import React, { useState } from 'react'
import { Typography, Card, Row, Col, Button, Space, Modal, Upload, Form, Input, Select, Divider, Tag, Progress } from 'antd'
import { 
  ArrowLeftOutlined, 
  BulbOutlined, 
  SkinOutlined, 
  BgColorsOutlined, 
  HighlightOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface ModuleConfig {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
  category: 'rendering' | 'material' | 'lighting' | 'effect'
  status: 'available' | 'coming_soon' | 'beta'
}

interface TaskResult {
  id: string
  moduleId: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  result?: string
  createdAt: Date
}

const ModulesPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<TaskResult[]>([])

  const modules: ModuleConfig[] = [
    {
      id: 'seedream_4_0',
      title: 'Seedream 4.0',
      description: '最新版本的AI图像生成模型，支持高质量创意图像生成',
      icon: <BulbOutlined />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      category: 'rendering',
      status: 'available'
    },
    {
      id: 'lighting_render',
      title: '打光渲染',
      description: '为您的设计作品添加专业的光照效果，提升视觉质感',
      icon: <BulbOutlined />,
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)',
      category: 'lighting',
      status: 'available'
    },
    {
      id: 'material_change',
      title: '更换材质',
      description: '一键更换产品材质，支持陶瓷、金属、木材等多种材质',
      icon: <SkinOutlined />,
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
      category: 'material',
      status: 'available'
    },
    {
      id: 'color_scheme',
      title: '配色方案',
      description: '智能生成和谐的配色方案，让您的设计更加出彩',
      icon: <BgColorsOutlined />,
      color: '#13c2c2',
      gradient: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)',
      category: 'effect',
      status: 'available'
    },
    {
      id: 'texture_enhance',
      title: '纹理增强',
      description: '增强产品表面纹理细节，提升真实感和质感',
      icon: <HighlightOutlined />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
      category: 'effect',
      status: 'beta'
    },
    {
      id: 'style_transfer',
      title: '风格迁移',
      description: '将不同艺术风格应用到您的设计中，创造独特效果',
      icon: <ThunderboltOutlined />,
      color: '#eb2f96',
      gradient: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)',
      category: 'effect',
      status: 'coming_soon'
    },
    {
      id: 'background_remove',
      title: '背景替换',
      description: '智能去除或替换产品背景，适配不同展示场景',
      icon: <EyeOutlined />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      category: 'effect',
      status: 'available'
    }
  ]

  const categoryNames = {
    rendering: '渲染效果',
    material: '材质处理',
    lighting: '光照效果',
    effect: '特效处理'
  }

  const statusColors = {
    available: 'success',
    beta: 'warning',
    coming_soon: 'default'
  }

  const statusTexts = {
    available: '可用',
    beta: '测试版',
    coming_soon: '即将推出'
  }

  const handleModuleClick = (module: ModuleConfig) => {
    if (module.status === 'coming_soon') {
      Modal.info({
        title: '功能即将推出',
        content: `${module.title} 功能正在开发中，敬请期待！`,
      })
      return
    }
    
    // 特殊处理：Seedream 4.0 跳转到专用页面
    if (module.id === 'seedream_4_0') {
      navigate('/seedream')
      return
    }
    
    setSelectedModule(module)
    setModalVisible(true)
    form.resetFields()
  }

  const handleSubmit = async (values: any) => {
    if (!selectedModule) return

    setLoading(true)
    try {
      // 创建新任务
      const newTask: TaskResult = {
        id: Date.now().toString(),
        moduleId: selectedModule.id,
        status: 'processing',
        progress: 0,
        createdAt: new Date()
      }

      setTasks(prev => [newTask, ...prev])
      setModalVisible(false)

      // 模拟API调用和进度更新
      const updateProgress = (progress: number) => {
        setTasks(prev => prev.map(task => 
          task.id === newTask.id ? { ...task, progress } : task
        ))
      }

      // 模拟进度更新
      for (let i = 10; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500))
        updateProgress(i)
      }

      // 完成任务
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { 
              ...task, 
              status: 'completed', 
              progress: 100,
              result: `${selectedModule.title}处理完成，点击下载结果`
            } 
          : task
      ))

    } catch (error) {
      console.error('任务执行失败:', error)
      setTasks(prev => prev.map(task => 
        task.id === newTask.id ? { ...task, status: 'failed' } : task
      ))
    } finally {
      setLoading(false)
    }
  }

  const renderModuleCard = (module: ModuleConfig) => (
    <Card
      key={module.id}
      hoverable
      style={{
        height: '280px',
        background: module.gradient,
        border: 'none',
        borderRadius: '16px',
        cursor: module.status === 'coming_soon' ? 'not-allowed' : 'pointer',
        opacity: module.status === 'coming_soon' ? 0.7 : 1
      }}
      bodyStyle={{ 
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onClick={() => handleModuleClick(module)}
    >
      <div>
        <div style={{ 
          fontSize: '48px', 
          color: 'white', 
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {module.icon}
        </div>
        <Title level={4} style={{ color: 'white', textAlign: 'center', margin: '0 0 12px 0' }}>
          {module.title}
        </Title>
        <Paragraph style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          textAlign: 'center',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {module.description}
        </Paragraph>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Tag color={statusColors[module.status] as any}>
          {statusTexts[module.status]}
        </Tag>
      </div>
    </Card>
  )

  const renderTaskCard = (task: TaskResult) => {
    const module = modules.find(m => m.id === task.moduleId)
    if (!module) return null

    return (
      <Card
        key={task.id}
        size="small"
        style={{ marginBottom: '12px' }}
        title={
          <Space>
            <span style={{ color: module.color }}>{module.icon}</span>
            <span>{module.title}</span>
            <Tag color={task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : 'processing'}>
              {task.status === 'processing' ? '处理中' : task.status === 'completed' ? '已完成' : '失败'}
            </Tag>
          </Space>
        }
        extra={
          task.status === 'completed' && (
            <Button type="primary" size="small" icon={<DownloadOutlined />}>
              下载
            </Button>
          )
        }
      >
        {task.status === 'processing' && (
          <Progress percent={task.progress} size="small" />
        )}
        {task.result && (
          <Paragraph style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            {task.result}
          </Paragraph>
        )}
      </Card>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ marginRight: '16px' }}
          >
            返回首页
          </Button>
          <Title level={3} style={{ margin: 0, color: '#333' }}>
            AI设计功能模块
          </Title>
          <div style={{ marginLeft: 'auto' }}>
            <Paragraph style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              选择功能模块，一键生成专业设计效果
            </Paragraph>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <Row gutter={[24, 24]}>
          {/* 功能模块区域 */}
          <Col span={18}>
            <div style={{ marginBottom: '32px' }}>
              <Title level={4} style={{ marginBottom: '24px', color: '#333' }}>
                功能模块
              </Title>
              
              {Object.entries(categoryNames).map(([category, name]) => {
                const categoryModules = modules.filter(m => m.category === category)
                if (categoryModules.length === 0) return null
                
                return (
                  <div key={category} style={{ marginBottom: '32px' }}>
                    <Title level={5} style={{ marginBottom: '16px', color: '#666' }}>
                      {name}
                    </Title>
                    <Row gutter={[16, 16]}>
                      {categoryModules.map(module => (
                        <Col key={module.id} xs={24} sm={12} md={8} lg={6}>
                          {renderModuleCard(module)}
                        </Col>
                      ))}
                    </Row>
                  </div>
                )
              })}
            </div>
          </Col>

          {/* 任务状态区域 */}
          <Col span={6}>
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '20px'
            }}>
              <Title level={5} style={{ marginBottom: '16px' }}>
                任务状态
              </Title>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <PlusOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                  <div>暂无任务</div>
                  <div style={{ fontSize: '12px' }}>选择功能模块开始处理</div>
                </div>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {tasks.map(renderTaskCard)}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* 功能配置弹窗 */}
      <Modal
        title={
          <Space>
            <span style={{ color: selectedModule?.color }}>{selectedModule?.icon}</span>
            <span>{selectedModule?.title}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading}
            onClick={() => form.submit()}
            icon={<PlayCircleOutlined />}
          >
            开始处理
          </Button>
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="image"
            label="上传图片"
            rules={[{ required: true, message: '请上传要处理的图片' }]}
          >
            <Upload.Dragger
              name="file"
              multiple={false}
              accept="image/*"
              beforeUpload={() => false}
              style={{ padding: '20px' }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">支持 JPG、PNG、WebP 格式</p>
            </Upload.Dragger>
          </Form.Item>

          {selectedModule?.id === 'material_change' && (
            <Form.Item
              name="material"
              label="目标材质"
              rules={[{ required: true, message: '请选择目标材质' }]}
            >
              <Select placeholder="选择要更换的材质">
                <Option value="ceramic">陶瓷</Option>
                <Option value="metal">金属</Option>
                <Option value="wood">木材</Option>
                <Option value="glass">玻璃</Option>
                <Option value="plastic">塑料</Option>
                <Option value="fabric">织物</Option>
              </Select>
            </Form.Item>
          )}

          {selectedModule?.id === 'lighting_render' && (
            <>
              <Form.Item
                name="lighting_type"
                label="光照类型"
                rules={[{ required: true, message: '请选择光照类型' }]}
              >
                <Select placeholder="选择光照类型">
                  <Option value="natural">自然光</Option>
                  <Option value="studio">摄影棚光</Option>
                  <Option value="dramatic">戏剧性光照</Option>
                  <Option value="soft">柔和光照</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="intensity"
                label="光照强度"
              >
                <Select defaultValue="medium" placeholder="选择光照强度">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item
            name="description"
            label="补充说明"
          >
            <TextArea 
              rows={3} 
              placeholder="描述您的具体需求或特殊要求（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ModulesPage
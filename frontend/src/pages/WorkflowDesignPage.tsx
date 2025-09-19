import React, { useState } from 'react'
import { Typography, Card, Steps, Button, Form, Input, Select, Upload, Row, Col, Space, Divider, Alert } from 'antd'
import { ArrowLeftOutlined, UploadOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Step } = Steps
const { TextArea } = Input
const { Option } = Select

interface WorkflowStep {
  id: string
  title: string
  description: string
  status: 'wait' | 'process' | 'finish' | 'error'
  result?: any
}

const WorkflowDesignPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'requirement',
      title: '需求分析',
      description: '分析设计需求，确定设计方向',
      status: 'process'
    },
    {
      id: 'design_plan',
      title: '设计规划',
      description: '制定详细的设计方案和流程',
      status: 'wait'
    },
    {
      id: 'shape_design',
      title: '器形设计',
      description: '生成产品的基础造型设计',
      status: 'wait'
    },
    {
      id: 'pattern_design',
      title: '花纸设计',
      description: '创建装饰图案和纹理',
      status: 'wait'
    },
    {
      id: 'material_selection',
      title: '材质选择',
      description: '选择合适的材料和质感',
      status: 'wait'
    },
    {
      id: 'pattern_application',
      title: '花纸贴合',
      description: '将装饰图案应用到器形上',
      status: 'wait'
    },
    {
      id: 'final_render',
      title: '最终渲染',
      description: '生成高质量的产品效果图',
      status: 'wait'
    }
  ])

  const handleStartWorkflow = async (values: any) => {
    setLoading(true)
    try {
      // 这里调用workflow API
      console.log('启动工作流:', values)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 更新步骤状态
      setWorkflowSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'finish' } : step
      ))
      setCurrentStep(1)
      
    } catch (error) {
      console.error('工作流启动失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (currentStep < workflowSteps.length - 1) {
      setLoading(true)
      try {
        // 调用下一步的API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setWorkflowSteps(prev => prev.map((step, index) => {
          if (index === currentStep) return { ...step, status: 'finish' }
          if (index === currentStep + 1) return { ...step, status: 'process' }
          return step
        }))
        setCurrentStep(prev => prev + 1)
      } catch (error) {
        console.error('步骤执行失败:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5'
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
          AI设计工作流 - 深度定制设计
        </Title>
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {/* 左侧：工作流步骤 */}
          <Col xs={24} lg={8}>
            <Card 
              title="设计流程"
              style={{ height: 'fit-content' }}
            >
              <Steps 
                direction="vertical" 
                current={currentStep}
                size="small"
              >
                {workflowSteps.map((step, index) => (
                  <Step
                    key={step.id}
                    title={step.title}
                    description={step.description}
                    status={step.status}
                    icon={step.status === 'finish' ? <CheckCircleOutlined /> : undefined}
                  />
                ))}
              </Steps>
            </Card>
          </Col>

          {/* 右侧：当前步骤内容 */}
          <Col xs={24} lg={16}>
            <Card 
              title={`第 ${currentStep + 1} 步：${workflowSteps[currentStep]?.title}`}
              extra={
                <Space>
                  {currentStep > 0 && (
                    <Button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}>
                      上一步
                    </Button>
                  )}
                  {currentStep < workflowSteps.length - 1 && (
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />}
                      loading={loading}
                      onClick={handleNextStep}
                    >
                      执行下一步
                    </Button>
                  )}
                </Space>
              }
            >
              {currentStep === 0 && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleStartWorkflow}
                >
                  <Alert
                    message="请详细描述您的设计需求"
                    description="AI将根据您的描述分析需求并制定个性化的设计方案"
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                  />
                  
                  <Form.Item
                    label="产品类型"
                    name="productType"
                    rules={[{ required: true, message: '请选择产品类型' }]}
                  >
                    <Select placeholder="选择您要设计的产品类型">
                      <Option value="ceramic">陶瓷制品</Option>
                      <Option value="glass">玻璃制品</Option>
                      <Option value="metal">金属制品</Option>
                      <Option value="textile">纺织品</Option>
                      <Option value="other">其他</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="设计需求描述"
                    name="requirements"
                    rules={[{ required: true, message: '请描述您的设计需求' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="请详细描述您的设计需求，包括：&#10;- 产品用途和场景&#10;- 风格偏好（现代、古典、简约等）&#10;- 颜色偏好&#10;- 尺寸要求&#10;- 特殊功能需求&#10;- 其他重要细节"
                    />
                  </Form.Item>

                  <Form.Item
                    label="参考图片"
                    name="referenceImages"
                  >
                    <Upload
                      multiple
                      listType="picture-card"
                      beforeUpload={() => false}
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传参考图</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    label="预算范围"
                    name="budget"
                  >
                    <Select placeholder="选择预算范围（可选）">
                      <Option value="low">经济型</Option>
                      <Option value="medium">标准型</Option>
                      <Option value="high">高端型</Option>
                      <Option value="luxury">奢华型</Option>
                    </Select>
                  </Form.Item>

                  <Divider />

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large"
                      loading={loading}
                      icon={<PlayCircleOutlined />}
                      block
                    >
                      开始AI设计分析
                    </Button>
                  </Form.Item>
                </Form>
              )}

              {currentStep > 0 && (
                <div>
                  <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                    {workflowSteps[currentStep]?.description}
                  </Paragraph>
                  
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}>
                    <Title level={5}>当前步骤状态</Title>
                    {workflowSteps[currentStep]?.status === 'process' && (
                      <Alert
                        message="正在处理中..."
                        description="AI正在执行当前设计步骤，请稍候"
                        type="info"
                        showIcon
                      />
                    )}
                    {workflowSteps[currentStep]?.status === 'finish' && (
                      <Alert
                        message="步骤完成"
                        description="当前步骤已成功完成，可以继续下一步"
                        type="success"
                        showIcon
                      />
                    )}
                  </div>

                  {workflowSteps[currentStep]?.result && (
                    <div>
                      <Title level={5}>步骤结果</Title>
                      <div style={{ 
                        background: '#fff', 
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        {/* 这里显示步骤结果 */}
                        <Paragraph>步骤结果将在这里显示...</Paragraph>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default WorkflowDesignPage
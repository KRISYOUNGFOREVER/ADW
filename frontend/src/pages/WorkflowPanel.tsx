import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
  Drawer,
  Steps,
  Divider,
  Upload,
  Switch,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { 
  getWorkflows, 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow,
  runWorkflow,
  type Workflow,
  type WorkflowNode,
  type CreateWorkflowRequest
} from '../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { Step } = Steps

interface WorkflowFormData {
  name: string
  description: string
  category: string
  is_public: boolean
  nodes: WorkflowNode[]
}

const WorkflowPanel: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [form] = Form.useForm()

  // 工作流分类
  const categories = [
    { value: 'design', label: '设计类' },
    { value: 'analysis', label: '分析类' },
    { value: 'automation', label: '自动化' },
    { value: 'integration', label: '集成类' },
    { value: 'other', label: '其他' }
  ]

  // 模拟数据
  useEffect(() => {
    const mockWorkflows: Workflow[] = [
      {
        id: 'wf-001',
        name: 'UI设计工作流',
        description: '基于用户需求自动生成UI设计方案',
        category: 'design',
        is_public: true,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
        nodes: [
          {
            id: 'node-1',
            title: '需求分析',
            type: 'llm',
            status: 'idle',
            position: { x: 100, y: 100 }
          },
          {
            id: 'node-2',
            title: '设计生成',
            type: 'llm',
            status: 'idle',
            position: { x: 300, y: 100 }
          }
        ]
      },
      {
        id: 'wf-002',
        name: '文档分析工作流',
        description: '自动分析文档内容并生成摘要',
        category: 'analysis',
        is_public: false,
        created_at: '2024-01-19T15:30:00Z',
        updated_at: '2024-01-19T15:30:00Z',
        nodes: [
          {
            id: 'node-1',
            title: '文档解析',
            type: 'document_extractor',
            status: 'idle',
            position: { x: 100, y: 100 }
          },
          {
            id: 'node-2',
            title: '内容分析',
            type: 'llm',
            status: 'idle',
            position: { x: 300, y: 100 }
          },
          {
            id: 'node-3',
            title: '摘要生成',
            type: 'llm',
            status: 'idle',
            position: { x: 500, y: 100 }
          }
        ]
      }
    ]
    
    setWorkflows(mockWorkflows)
  }, [])

  // 创建工作流
  const handleCreateWorkflow = async (values: WorkflowFormData) => {
    try {
      setLoading(true)
      const request: CreateWorkflowRequest = {
        name: values.name,
        description: values.description,
        category: values.category,
        is_public: values.is_public,
        nodes: values.nodes || []
      }
      
      const newWorkflow = await createWorkflow(request)
      setWorkflows(prev => [newWorkflow, ...prev])
      setModalVisible(false)
      form.resetFields()
      message.success('工作流创建成功')
    } catch (error) {
      message.error('创建失败')
      console.error('创建工作流失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 编辑工作流
  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    form.setFieldsValue({
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      is_public: workflow.is_public
    })
    setModalVisible(true)
  }

  // 更新工作流
  const handleUpdateWorkflow = async (values: WorkflowFormData) => {
    if (!editingWorkflow) return
    
    try {
      setLoading(true)
      const updatedWorkflow = await updateWorkflow(editingWorkflow.id, {
        name: values.name,
        description: values.description,
        category: values.category,
        is_public: values.is_public
      })
      
      setWorkflows(prev => 
        prev.map(wf => wf.id === editingWorkflow.id ? updatedWorkflow : wf)
      )
      setModalVisible(false)
      setEditingWorkflow(null)
      form.resetFields()
      message.success('工作流更新成功')
    } catch (error) {
      message.error('更新失败')
      console.error('更新工作流失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除工作流
  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId)
      setWorkflows(prev => prev.filter(wf => wf.id !== workflowId))
      message.success('工作流删除成功')
    } catch (error) {
      message.error('删除失败')
      console.error('删除工作流失败:', error)
    }
  }

  // 运行工作流
  const handleRunWorkflow = async (workflowId: string) => {
    try {
      const result = await runWorkflow(workflowId, {})
      message.success(`工作流已启动，运行ID: ${result.run_id}`)
    } catch (error) {
      message.error('启动失败')
      console.error('运行工作流失败:', error)
    }
  }

  // 复制工作流
  const handleCopyWorkflow = async (workflow: Workflow) => {
    try {
      const request: CreateWorkflowRequest = {
        name: `${workflow.name} (副本)`,
        description: workflow.description,
        category: workflow.category,
        is_public: false,
        nodes: workflow.nodes
      }
      
      const newWorkflow = await createWorkflow(request)
      setWorkflows(prev => [newWorkflow, ...prev])
      message.success('工作流复制成功')
    } catch (error) {
      message.error('复制失败')
      console.error('复制工作流失败:', error)
    }
  }

  // 查看工作流详情
  const handleViewWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setDrawerVisible(true)
  }

  // 渲染分类标签
  const renderCategoryTag = (category: string) => {
    const categoryConfig = {
      design: { color: 'blue', text: '设计类' },
      analysis: { color: 'green', text: '分析类' },
      automation: { color: 'orange', text: '自动化' },
      integration: { color: 'purple', text: '集成类' },
      other: { color: 'default', text: '其他' }
    }
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 表格列定义
  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Workflow) => (
        <div>
          <Text strong>{text}</Text>
          {record.is_public && (
            <Tag color="green" size="small" style={{ marginLeft: 8 }}>
              公开
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text type="secondary">{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: renderCategoryTag
    },
    {
      title: '节点数',
      key: 'nodeCount',
      width: 80,
      render: (_, record: Workflow) => (
        <Text>{record.nodes?.length || 0}</Text>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      render: (_, record: Workflow) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewWorkflow(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditWorkflow(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunWorkflow(record.id)}
          >
            运行
          </Button>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleCopyWorkflow(record)}
          >
            复制
          </Button>
          <Popconfirm
            title="确定要删除这个工作流吗？"
            onConfirm={() => handleDeleteWorkflow(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>工作流管理</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingWorkflow(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            创建工作流
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>{workflows.length}</Title>
              <Text type="secondary">总工作流</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {workflows.filter(wf => wf.is_public).length}
              </Title>
              <Text type="secondary">公开工作流</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {workflows.filter(wf => wf.category === 'design').length}
              </Title>
              <Text type="secondary">设计类工作流</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {workflows.reduce((sum, wf) => sum + (wf.nodes?.length || 0), 0)}
              </Title>
              <Text type="secondary">总节点数</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 工作流列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个工作流`
          }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingWorkflow ? '编辑工作流' : '创建工作流'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingWorkflow(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingWorkflow ? handleUpdateWorkflow : handleCreateWorkflow}
        >
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="请输入工作流名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入工作流描述' }]}
          >
            <TextArea rows={3} placeholder="请输入工作流描述" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择工作流分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_public"
            label="公开设置"
            valuePropName="checked"
          >
            <Switch checkedChildren="公开" unCheckedChildren="私有" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingWorkflow ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                setEditingWorkflow(null)
                form.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工作流详情抽屉 */}
      <Drawer
        title="工作流详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedWorkflow && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>{selectedWorkflow.name}</Title>
              <Paragraph type="secondary">
                {selectedWorkflow.description}
              </Paragraph>
              <Space>
                {renderCategoryTag(selectedWorkflow.category)}
                {selectedWorkflow.is_public && (
                  <Tag color="green">公开</Tag>
                )}
              </Space>
            </div>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>工作流节点</Title>
              {selectedWorkflow.nodes && selectedWorkflow.nodes.length > 0 ? (
                <Steps direction="vertical" size="small">
                  {selectedWorkflow.nodes.map((node, index) => (
                    <Step
                      key={node.id}
                      title={node.title}
                      description={`类型: ${node.type}`}
                      status="wait"
                    />
                  ))}
                </Steps>
              ) : (
                <Text type="secondary">暂无节点</Text>
              )}
            </div>

            <Divider />

            <div>
              <Title level={5}>基本信息</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">创建时间:</Text>
                  <br />
                  <Text>{new Date(selectedWorkflow.created_at).toLocaleString()}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">更新时间:</Text>
                  <br />
                  <Text>{new Date(selectedWorkflow.updated_at).toLocaleString()}</Text>
                </Col>
              </Row>
            </div>

            <div style={{ marginTop: 24 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleRunWorkflow(selectedWorkflow.id)}
                >
                  运行工作流
                </Button>
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDrawerVisible(false)
                    handleEditWorkflow(selectedWorkflow)
                  }}
                >
                  编辑
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default WorkflowPanel
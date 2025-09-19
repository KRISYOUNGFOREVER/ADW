import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Progress, 
  Typography, 
  Row, 
  Col, 
  Statistic,
  Select,
  Input,
  DatePicker,
  Modal,
  Descriptions,
  Timeline,
  Alert
} from 'antd'
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { useSocket } from '../contexts/SocketContext'
import { 
  getWorkflowRunStatus, 
  stopWorkflowRun,
  type WorkflowRun,
  type WorkflowRunDetail,
  type WorkflowNode
} from '../services/api'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface WorkflowMonitorStats {
  total: number
  running: number
  succeeded: number
  failed: number
  stopped: number
}

const WorkflowMonitor: React.FC = () => {
  const { isConnected, subscribeToWorkflow, unsubscribeFromWorkflow } = useSocket()
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRun, setSelectedRun] = useState<WorkflowRunDetail | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [stats, setStats] = useState<WorkflowMonitorStats>({
    total: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    stopped: 0
  })

  // 过滤条件
  const [filters, setFilters] = useState({
    status: 'all',
    workflowId: '',
    dateRange: null as any
  })

  // 模拟数据
  useEffect(() => {
    const mockData: WorkflowRun[] = [
      {
        id: 'run-001',
        workflow_id: 'wf-design-001',
        status: 'running',
        inputs: { prompt: '设计一个现代化的登录页面' },
        elapsed_time: 45000,
        total_tokens: 1250,
        created_at: '2024-01-20T10:30:00Z'
      },
      {
        id: 'run-002',
        workflow_id: 'wf-analysis-001',
        status: 'succeeded',
        inputs: { document: 'product_spec.pdf' },
        outputs: { analysis: '产品分析报告已生成' },
        elapsed_time: 120000,
        total_tokens: 3500,
        created_at: '2024-01-20T09:15:00Z',
        finished_at: '2024-01-20T09:17:00Z'
      },
      {
        id: 'run-003',
        workflow_id: 'wf-design-002',
        status: 'failed',
        inputs: { prompt: '生成用户界面原型' },
        error: 'API调用超时',
        elapsed_time: 30000,
        total_tokens: 800,
        created_at: '2024-01-20T08:45:00Z',
        finished_at: '2024-01-20T08:45:30Z'
      }
    ]

    setWorkflowRuns(mockData)
    
    // 计算统计数据
    const newStats = mockData.reduce((acc, run) => {
      acc.total++
      acc[run.status]++
      return acc
    }, {
      total: 0,
      running: 0,
      succeeded: 0,
      failed: 0,
      stopped: 0
    })
    
    setStats(newStats)
  }, [])

  // 获取工作流详情
  const handleViewDetails = async (runId: string) => {
    try {
      setLoading(true)
      const detail = await getWorkflowRunStatus(runId)
      setSelectedRun(detail)
      setDetailModalVisible(true)
    } catch (error) {
      console.error('获取工作流详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 停止工作流
  const handleStopWorkflow = async (runId: string) => {
    try {
      await stopWorkflowRun(runId)
      // 更新本地状态
      setWorkflowRuns(prev => 
        prev.map(run => 
          run.id === runId 
            ? { ...run, status: 'stopped' as const }
            : run
        )
      )
    } catch (error) {
      console.error('停止工作流失败:', error)
    }
  }

  // 订阅工作流更新
  const handleSubscribe = (runId: string) => {
    subscribeToWorkflow(runId)
  }

  // 取消订阅
  const handleUnsubscribe = (runId: string) => {
    unsubscribeFromWorkflow(runId)
  }

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      running: { color: 'processing', text: '运行中' },
      succeeded: { color: 'success', text: '成功' },
      failed: { color: 'error', text: '失败' },
      stopped: { color: 'default', text: '已停止' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 进度计算
  const calculateProgress = (run: WorkflowRun) => {
    if (run.status === 'succeeded') return 100
    if (run.status === 'failed' || run.status === 'stopped') return 0
    // 运行中的进度模拟
    return Math.min(90, (run.elapsed_time / 180000) * 100)
  }

  // 表格列定义
  const columns = [
    {
      title: '工作流ID',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      width: 150,
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: '运行ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <Text code>{text.slice(-8)}</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag
    },
    {
      title: '进度',
      key: 'progress',
      width: 120,
      render: (_, record: WorkflowRun) => (
        <Progress 
          percent={calculateProgress(record)} 
          size="small"
          status={record.status === 'failed' ? 'exception' : undefined}
        />
      )
    },
    {
      title: '耗时',
      dataIndex: 'elapsed_time',
      key: 'elapsed_time',
      width: 100,
      render: (time: number) => `${Math.round(time / 1000)}s`
    },
    {
      title: 'Token消耗',
      dataIndex: 'total_tokens',
      key: 'total_tokens',
      width: 100,
      render: (tokens: number) => tokens.toLocaleString()
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: WorkflowRun) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
          >
            详情
          </Button>
          {record.status === 'running' && (
            <>
              <Button 
                type="link" 
                icon={<StopOutlined />}
                onClick={() => handleStopWorkflow(record.id)}
                danger
              >
                停止
              </Button>
              <Button 
                type="link" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleSubscribe(record.id)}
              >
                订阅
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  // 过滤数据
  const filteredData = workflowRuns.filter(run => {
    if (filters.status !== 'all' && run.status !== filters.status) return false
    if (filters.workflowId && !run.workflow_id.includes(filters.workflowId)) return false
    return true
  })

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>工作流监控</Title>
      
      {/* 连接状态提示 */}
      {!isConnected && (
        <Alert
          message="WebSocket连接断开"
          description="实时监控功能不可用，请检查网络连接"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总计" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="运行中" 
              value={stats.running} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="成功" 
              value={stats.succeeded} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="失败" 
              value={stats.failed} 
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 过滤器 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: '100%' }}
            >
              <Option value="all">全部状态</Option>
              <Option value="running">运行中</Option>
              <Option value="succeeded">成功</Option>
              <Option value="failed">失败</Option>
              <Option value="stopped">已停止</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="工作流ID"
              prefix={<SearchOutlined />}
              value={filters.workflowId}
              onChange={(e) => setFilters(prev => ({ ...prev, workflowId: e.target.value }))}
            />
          </Col>
          <Col span={8}>
            <RangePicker
              placeholder={['开始时间', '结束时间']}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                刷新
              </Button>
              <Button icon={<FilterOutlined />}>
                高级筛选
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 工作流列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="工作流详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRun && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="运行ID">{selectedRun.id}</Descriptions.Item>
              <Descriptions.Item label="工作流ID">{selectedRun.workflow_id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {renderStatusTag(selectedRun.status)}
              </Descriptions.Item>
              <Descriptions.Item label="耗时">
                {Math.round(selectedRun.elapsed_time / 1000)}秒
              </Descriptions.Item>
              <Descriptions.Item label="Token消耗">
                {selectedRun.total_tokens.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedRun.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {selectedRun.steps && selectedRun.steps.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>执行步骤</Title>
                <Timeline>
                  {selectedRun.steps.map((step: WorkflowNode) => (
                    <Timeline.Item
                      key={step.id}
                      color={
                        step.status === 'succeeded' ? 'green' :
                        step.status === 'failed' ? 'red' :
                        step.status === 'running' ? 'blue' : 'gray'
                      }
                    >
                      <div>
                        <Text strong>{step.title}</Text>
                        <div>{renderStatusTag(step.status)}</div>
                        {step.error && (
                          <Text type="danger" style={{ fontSize: '12px' }}>
                            错误: {step.error}
                          </Text>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WorkflowMonitor
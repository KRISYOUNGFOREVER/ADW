import React from 'react'
import { Card, Tag, Typography, Space, Button, Collapse } from 'antd'
import {
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { WorkflowNode } from '../../services/api'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

interface WorkflowNodeCardProps {
  node: WorkflowNode
  onRetry?: (nodeId: string) => void
  showDetails?: boolean
}

const WorkflowNodeCard: React.FC<WorkflowNodeCardProps> = ({
  node,
  onRetry,
  showDetails = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <LoadingOutlined spin style={{ color: '#1890ff' }} />
      case 'succeeded':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'stopped':
        return <StopOutlined style={{ color: '#faad14' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'processing'
      case 'succeeded':
        return 'success'
      case 'failed':
        return 'error'
      case 'stopped':
        return 'warning'
      default:
        return 'default'
    }
  }

  const formatElapsedTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  const renderInputsOutputs = (data: Record<string, any>, title: string) => {
    if (!data || Object.keys(data).length === 0) return null

    return (
      <div style={{ marginTop: 12 }}>
        <Text strong>{title}:</Text>
        <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        border: `1px solid ${node.status === 'failed' ? '#ff4d4f' : '#d9d9d9'}`
      }}
      title={
        <Space>
          {getStatusIcon(node.status)}
          <Text strong>{node.title}</Text>
          <Tag color={getStatusColor(node.status)}>{node.status}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatElapsedTime(node.elapsed_time)}
          </Text>
          {node.status === 'failed' && onRetry && (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => onRetry(node.id)}
            >
              重试
            </Button>
          )}
        </Space>
      }
    >
      <div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">节点类型: </Text>
            <Tag>{node.type}</Tag>
          </div>

          {node.execution_metadata && (
            <div>
              <Text type="secondary">执行信息: </Text>
              <Space>
                {node.execution_metadata.total_tokens && (
                  <Text>Tokens: {node.execution_metadata.total_tokens}</Text>
                )}
                {node.execution_metadata.total_price && (
                  <Text>
                    费用: {node.execution_metadata.total_price} {node.execution_metadata.currency}
                  </Text>
                )}
              </Space>
            </div>
          )}

          {node.error && (
            <div>
              <Text type="danger">错误信息:</Text>
              <Paragraph
                type="danger"
                style={{
                  background: '#fff2f0',
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 4,
                  marginBottom: 0
                }}
              >
                {node.error}
              </Paragraph>
            </div>
          )}

          {showDetails && (
            <Collapse size="small" ghost>
              <Panel header="详细信息" key="details">
                {renderInputsOutputs(node.inputs, '输入参数')}
                {renderInputsOutputs(node.outputs || {}, '输出结果')}
              </Panel>
            </Collapse>
          )}
        </Space>
      </div>
    </Card>
  )
}

export default WorkflowNodeCard
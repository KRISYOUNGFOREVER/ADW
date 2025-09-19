import React from 'react'
import { Card, Tag, Button, Space, Typography, Progress, Statistic } from 'antd'
import {
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { WorkflowRun } from '../../services/api'

const { Text, Title } = Typography

interface WorkflowRunCardProps {
  run: WorkflowRun
  onStop?: (runId: string) => void
  onRerun?: (runId: string) => void
}

const WorkflowRunCard: React.FC<WorkflowRunCardProps> = ({
  run,
  onStop,
  onRerun
}) => {
  const navigate = useNavigate()

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
        return null
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

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN')
  }

  const formatElapsedTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  const handleViewDetails = () => {
    navigate(`/workflow/${run.id}`)
  }

  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <Space>
          {getStatusIcon(run.status)}
          <Title level={5} style={{ margin: 0 }}>
            工作流运行 #{run.id.slice(-8)}
          </Title>
          <Tag color={getStatusColor(run.status)}>{run.status}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={handleViewDetails}
          >
            查看详情
          </Button>
          {run.status === 'running' && onStop && (
            <Button
              size="small"
              danger
              icon={<PauseCircleOutlined />}
              onClick={() => onStop(run.id)}
            >
              停止
            </Button>
          )}
          {(run.status === 'failed' || run.status === 'stopped') && onRerun && (
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => onRerun(run.id)}
            >
              重新运行
            </Button>
          )}
        </Space>
      }
    >
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">工作流ID: </Text>
              <Text code>{run.workflow_id}</Text>
            </div>
            
            <div>
              <Text type="secondary">开始时间: </Text>
              <Text>{formatTime(run.created_at)}</Text>
            </div>
            
            {run.finished_at && (
              <div>
                <Text type="secondary">结束时间: </Text>
                <Text>{formatTime(run.finished_at)}</Text>
              </div>
            )}

            {run.error && (
              <div>
                <Text type="danger">错误信息: </Text>
                <Text type="danger">{run.error}</Text>
              </div>
            )}
          </Space>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Statistic
            title="执行时间"
            value={formatElapsedTime(run.elapsed_time)}
            valueStyle={{ fontSize: 16 }}
          />
          
          <Statistic
            title="Token消耗"
            value={run.total_tokens}
            valueStyle={{ fontSize: 16 }}
          />
        </div>
      </div>

      {run.status === 'running' && (
        <div style={{ marginTop: 16 }}>
          <Progress
            percent={50}
            status="active"
            showInfo={false}
            strokeColor="#1890ff"
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            工作流正在执行中...
          </Text>
        </div>
      )}
    </Card>
  )
}

export default WorkflowRunCard
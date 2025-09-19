import React, { useState, useEffect } from 'react'
import { Modal, Button, Typography, Divider, Input, Space, Tag, message } from 'antd'
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ReloadOutlined, 
  EditOutlined,
  StopOutlined 
} from '@ant-design/icons'
import { confirmUserAction } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface UserConfirmationRequest {
  confirmationId: string
  workflow_run_id: string
  node_id: string
  node_title: string
  inputs: Record<string, any>
  outputs?: Record<string, any>
  message: string
  options?: string[]
  timeout?: number
}

interface UserConfirmationModalProps {
  visible: boolean
  onClose: () => void
}

const UserConfirmationModal: React.FC<UserConfirmationModalProps> = ({ 
  visible, 
  onClose 
}) => {
  const [currentRequest, setCurrentRequest] = useState<UserConfirmationRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [modifiedInputs, setModifiedInputs] = useState<Record<string, any>>({})
  const [comment, setComment] = useState('')
  const [showInputEditor, setShowInputEditor] = useState(false)

  useEffect(() => {
    const handleConfirmationRequest = (event: CustomEvent) => {
      const request = event.detail as UserConfirmationRequest
      setCurrentRequest(request)
      setModifiedInputs(request.inputs)
      setComment('')
      setShowInputEditor(false)
    }

    window.addEventListener('userConfirmationRequired', handleConfirmationRequest as EventListener)

    return () => {
      window.removeEventListener('userConfirmationRequired', handleConfirmationRequest as EventListener)
    }
  }, [])

  const handleAction = async (action: 'approve' | 'reject' | 'retry' | 'modify') => {
    if (!currentRequest) return

    setLoading(true)
    try {
      const response = {
        workflow_run_id: currentRequest.workflow_run_id,
        node_id: currentRequest.node_id,
        action,
        modified_inputs: action === 'modify' ? modifiedInputs : undefined,
        comment: comment || undefined
      }

      await confirmUserAction(currentRequest.confirmationId, response)
      
      message.success('操作已提交')
      setCurrentRequest(null)
      onClose()
    } catch (error) {
      console.error('提交确认失败:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setModifiedInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderInputsOutputs = (data: Record<string, any>, title: string, editable = false) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div>
          <Text strong>{title}</Text>
          <div className="confirmation-inputs">
            <Text type="secondary">无数据</Text>
          </div>
        </div>
      )
    }

    return (
      <div>
        <Text strong>{title}</Text>
        <div className="confirmation-inputs">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <Text code>{key}:</Text>
              {editable && showInputEditor ? (
                <Input
                  value={modifiedInputs[key] || value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  style={{ marginTop: 4 }}
                />
              ) : (
                <div style={{ 
                  marginTop: 4, 
                  padding: 8, 
                  background: '#f5f5f5', 
                  borderRadius: 4,
                  wordBreak: 'break-all'
                }}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed': return 'error'
      case 'running': return 'processing'
      case 'succeeded': return 'success'
      default: return 'default'
    }
  }

  if (!currentRequest) {
    return null
  }

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            节点确认
          </Title>
          <Tag color={getStatusColor('pending')}>
            等待确认
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="confirmation-dialog"
    >
      <div className="confirmation-content">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 节点信息 */}
          <div>
            <Title level={5}>节点: {currentRequest.node_title}</Title>
            <Paragraph>{currentRequest.message}</Paragraph>
          </div>

          <Divider />

          {/* 输入参数 */}
          {renderInputsOutputs(currentRequest.inputs, '输入参数', true)}

          {/* 输出结果 */}
          {currentRequest.outputs && (
            <>
              <Divider />
              {renderInputsOutputs(currentRequest.outputs, '输出结果')}
            </>
          )}

          {/* 参数编辑器 */}
          {showInputEditor && (
            <>
              <Divider />
              <div>
                <Text strong>备注说明</Text>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请输入操作说明或备注..."
                  rows={3}
                  style={{ marginTop: 8 }}
                />
              </div>
            </>
          )}

          <Divider />

          {/* 操作按钮 */}
          <div className="confirmation-actions">
            <Space wrap>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('approve')}
                loading={loading}
              >
                继续执行
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => handleAction('retry')}
                loading={loading}
              >
                重新执行
              </Button>

              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  if (showInputEditor) {
                    handleAction('modify')
                  } else {
                    setShowInputEditor(true)
                  }
                }}
                loading={loading}
              >
                {showInputEditor ? '确认修改' : '修改参数'}
              </Button>

              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => handleAction('reject')}
                loading={loading}
              >
                停止工作流
              </Button>

              <Button
                icon={<CloseCircleOutlined />}
                onClick={onClose}
                disabled={loading}
              >
                取消
              </Button>
            </Space>
          </div>
        </Space>
      </div>
    </Modal>
  )
}

export default UserConfirmationModal
import React, { useState, useRef } from 'react'
import { Input, Button, Space, Upload, message } from 'antd'
import { SendOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useChat } from '../../contexts/ChatContext'

const { TextArea } = Input

const MessageInput: React.FC = () => {
  const { sendMessage, uploadFile, isLoading, currentConversation } = useChat()
  const [inputValue, setInputValue] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const textAreaRef = useRef<any>(null)

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return

    const content = inputValue.trim()
    setInputValue('')
    
    try {
      await sendMessage(content)
    } catch (error) {
      message.error('发送消息失败')
      setInputValue(content) // 恢复输入内容
    }
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('文件大小不能超过10MB!')
        return false
      }
      return true
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setIsUploading(true)
        await uploadFile(file as File)
        onSuccess?.(file)
        message.success('文件上传成功')
      } catch (error) {
        onError?.(error as Error)
        message.error('文件上传失败')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '8px',
        background: '#fff'
      }}>
        <TextArea
          ref={textAreaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息... (Enter发送，Shift+Enter换行)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          variant="borderless"
          style={{ 
            resize: 'none',
            fontSize: '14px'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <Space>
            <Upload {...uploadProps}>
              <Button 
                type="text" 
                icon={<PaperClipOutlined />}
                size="small"
                style={{ color: '#666' }}
              >
                附件
              </Button>
            </Upload>
            
            <Button 
              type="text" 
              icon={<SmileOutlined />}
              size="small"
              style={{ color: '#666' }}
              disabled
            >
              表情
            </Button>
          </Space>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isLoading}
            disabled={!inputValue.trim()}
            style={{ borderRadius: '6px' }}
          >
            发送
          </Button>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '12px', 
        color: '#999', 
        marginTop: '8px',
        textAlign: 'center'
      }}>
        AI可能会出错，请核实重要信息
      </div>
    </div>
  )
}

export default MessageInput
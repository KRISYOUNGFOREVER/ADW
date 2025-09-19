import React, { useState } from 'react'
import { Input, Button, List, Avatar, Typography, Space, Dropdown, MenuProps } from 'antd'
import { PlusOutlined, SearchOutlined, MessageOutlined, MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useChat } from '../../contexts/ChatContext'

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
}

const { Text } = Typography

const ChatSidebar: React.FC = () => {
  const { 
    conversations, 
    currentConversation, 
    createNewConversation, 
    selectConversation, 
    deleteConversation,
    updateConversationTitle,
    isLoading 
  } = useChat()
  
  const [searchText, setSearchText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // 过滤对话列表
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchText.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  )

  // 处理新建对话
  const handleCreateConversation = async () => {
    await createNewConversation()
  }

  // 处理选择对话
  const handleSelectConversation = async (conversationId: string) => {
    if (editingId) return // 编辑模式下不允许切换
    await selectConversation(conversationId)
  }

  // 处理删除对话
  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteConversation(conversationId)
  }

  // 开始编辑标题
  const startEditTitle = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conversation.id)
    setEditingTitle(conversation.title)
  }

  // 保存标题编辑
  const saveEditTitle = async (conversationId: string) => {
    if (editingTitle.trim()) {
      await updateConversationTitle(conversationId, editingTitle.trim())
    }
    setEditingId(null)
    setEditingTitle('')
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  // 下拉菜单项
  const getMenuItems = (conversation: Conversation): MenuProps['items'] => [
    {
      key: 'edit',
      label: '重命名',
      icon: <EditOutlined />,
      onClick: (e) => startEditTitle(conversation, e.domEvent)
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: (e) => handleDeleteConversation(conversation.id, e.domEvent)
    }
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      {/* 新建对话按钮 */}
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleCreateConversation}
        loading={isLoading}
        style={{ marginBottom: 16 }}
        block
      >
        新建对话
      </Button>

      {/* 搜索框 */}
      <Input
        placeholder="搜索对话..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {/* 对话列表 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <List
          dataSource={filteredConversations}
          renderItem={(conversation) => (
            <List.Item
              key={conversation.id}
              style={{
                padding: '12px 8px',
                cursor: 'pointer',
                backgroundColor: currentConversation?.id === conversation.id ? '#e6f7ff' : 'transparent',
                borderRadius: '8px',
                marginBottom: '4px',
                border: currentConversation?.id === conversation.id ? '1px solid #1890ff' : '1px solid transparent'
              }}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<MessageOutlined />} />}
                title={
                  editingId === conversation.id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onPressEnter={() => saveEditTitle(conversation.id)}
                      onBlur={cancelEdit}
                      autoFocus
                      size="small"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        {conversation.title}
                      </Text>
                      <Dropdown
                        menu={{ items: getMenuItems(conversation) }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  )
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {conversation.lastMessage}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {conversation.timestamp}
                    </Text>
                  </div>
                }
              />
              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <div
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}
                >
                  {conversation.unreadCount}
                </div>
              )}
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default ChatSidebar
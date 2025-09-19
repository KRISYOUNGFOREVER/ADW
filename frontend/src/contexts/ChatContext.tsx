import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { 
  sendMessage, 
  getConversations, 
  getConversationMessages, 
  createConversation,
  deleteConversation,
  updateConversationTitle,
  uploadFile,
  type ChatMessage,
  type ChatConversation,
  type SendMessageRequest,
  type CreateConversationRequest
} from '../services/chatApi'
import webSocketService from '../services/websocket'

// 重新导出类型以保持兼容性
export type Message = ChatMessage
export type Conversation = ChatConversation

interface ChatContextType {
  // 状态
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isConnected: boolean
  
  // 对话管理
  createNewConversation: (request?: CreateConversationRequest) => Promise<void>
  selectConversation: (conversationId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>
  
  // 消息管理
  sendMessage: (content: string, type?: 'text' | 'file') => Promise<void>
  uploadFile: (file: File) => Promise<void>
  
  // WebSocket连接管理
  connectWebSocket: () => Promise<void>
  disconnectWebSocket: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // 初始化WebSocket连接
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        webSocketService.setEventHandlers({
          onConnect: () => {
            console.log('WebSocket连接成功')
            setIsConnected(true)
          },
          onDisconnect: (reason) => {
            console.log('WebSocket断开连接:', reason)
            setIsConnected(false)
          },
          onError: (error) => {
            console.error('WebSocket错误:', error)
            setIsConnected(false)
          },
          onChatMessage: (data) => {
            // 处理实时聊天消息
            if (data.conversationId === currentConversation?.id) {
              setMessages(prev => [...prev, data.message])
            }
          }
        })
        
        await webSocketService.connect()
      } catch (error) {
        console.error('WebSocket初始化失败:', error)
      }
    }

    initializeWebSocket()
    loadConversations()

    return () => {
      webSocketService.disconnect()
    }
  }, [])

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const conversationList = await getConversations()
      setConversations(conversationList)
    } catch (error) {
      console.error('加载对话列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 创建新对话
  const createNewConversation = useCallback(async (request?: CreateConversationRequest) => {
    try {
      setIsLoading(true)
      const response = await createConversation(request || {})
      setConversations(prev => [response.conversation, ...prev])
      setCurrentConversation(response.conversation)
      
      if (response.message) {
        setMessages([response.message])
      } else {
        setMessages([])
      }
      
      // 加入WebSocket房间
      webSocketService.joinChatRoom(response.conversation.id)
    } catch (error) {
      console.error('创建对话失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 选择对话
  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) return

      setCurrentConversation(conversation)
      
      // 加载对话消息
      const conversationMessages = await getConversationMessages(conversationId)
      setMessages(conversationMessages)
      
      // 离开之前的房间，加入新房间
      if (currentConversation) {
        webSocketService.leaveChatRoom(currentConversation.id)
      }
      webSocketService.joinChatRoom(conversationId)
    } catch (error) {
      console.error('选择对话失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [conversations, currentConversation])

  // 删除对话
  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      await deleteConversation(conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
        setMessages([])
        webSocketService.leaveChatRoom(conversationId)
      }
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }, [currentConversation])

  // 更新对话标题
  const handleUpdateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      const updatedConversation = await updateConversationTitle(conversationId, title)
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConversation : c)
      )
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(updatedConversation)
      }
    } catch (error) {
      console.error('更新对话标题失败:', error)
    }
  }, [currentConversation])

  // 发送消息
  const handleSendMessage = useCallback(async (content: string, type: 'text' | 'file' = 'text') => {
    if (!currentConversation) return

    try {
      const request: SendMessageRequest = {
        conversationId: currentConversation.id,
        content,
        type
      }

      const response = await sendMessage(request)
      
      // 更新消息列表
      setMessages(prev => [...prev, response.message])
      
      // 更新对话列表中的最后消息
      setConversations(prev => 
        prev.map(c => c.id === currentConversation.id ? response.conversation : c)
      )
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }, [currentConversation])

  // 上传文件
  const handleUploadFile = useCallback(async (file: File) => {
    try {
      setIsLoading(true)
      const response = await uploadFile(file)
      
      // 发送文件消息
      await handleSendMessage(`[文件] ${response.fileName}`, 'file')
    } catch (error) {
      console.error('上传文件失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [handleSendMessage])

  // WebSocket连接管理
  const connectWebSocket = useCallback(async () => {
    try {
      await webSocketService.connect()
      setIsConnected(true)
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      setIsConnected(false)
    }
  }, [])

  const disconnectWebSocket = useCallback(() => {
    webSocketService.disconnect()
    setIsConnected(false)
  }, [])

  const value: ChatContextType = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isConnected,
    createNewConversation,
    selectConversation,
    deleteConversation: handleDeleteConversation,
    updateConversationTitle: handleUpdateConversationTitle,
    sendMessage: handleSendMessage,
    uploadFile: handleUploadFile,
    connectWebSocket,
    disconnectWebSocket
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
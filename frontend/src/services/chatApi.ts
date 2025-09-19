import axios from 'axios'

const chatApi = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器
chatApi.interceptors.request.use(
  (config) => {
    console.log('Chat API请求:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('Chat请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
chatApi.interceptors.response.use(
  (response) => {
    console.log('Chat API响应:', response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('Chat响应错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 聊天相关接口类型定义
export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: string
  status?: 'sending' | 'sent' | 'failed'
}

export interface ChatConversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
}

export interface SendMessageRequest {
  conversationId: string
  content: string
  type?: 'text' | 'file'
  metadata?: Record<string, any>
}

export interface SendMessageResponse {
  message: ChatMessage
  conversation: ChatConversation
}

export interface CreateConversationRequest {
  title?: string
  initialMessage?: string
}

export interface CreateConversationResponse {
  conversation: ChatConversation
  message?: ChatMessage
}

// 聊天API方法
export const sendMessage = async (request: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await chatApi.post(`/conversations/${request.conversationId}/messages`, { content: request.content })
  return response.data
}

export const getConversations = async (): Promise<ChatConversation[]> => {
  const response = await chatApi.get('/conversations')
  return response.data
}

export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const response = await chatApi.get(`/conversations/${conversationId}/messages`)
  return response.data
}

export const createConversation = async (request: CreateConversationRequest): Promise<CreateConversationResponse> => {
  const response = await chatApi.post('/conversations', request)
  return response.data
}

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await chatApi.delete(`/conversations/${conversationId}`)
}

export const updateConversationTitle = async (conversationId: string, title: string): Promise<ChatConversation> => {
  const response = await chatApi.put(`/conversations/${conversationId}`, { title })
  return response.data
}

// 文件上传相关
export interface FileUploadResponse {
  fileId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadUrl?: string
}

export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await chatApi.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export default chatApi
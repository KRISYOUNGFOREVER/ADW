import { io, Socket } from 'socket.io-client'

export interface WebSocketConfig {
  url: string
  options?: {
    autoConnect?: boolean
    reconnection?: boolean
    reconnectionAttempts?: number
    reconnectionDelay?: number
    timeout?: number
  }
}

export interface WebSocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  onError?: (error: Error) => void
  onReconnect?: (attemptNumber: number) => void
  onReconnectError?: (error: Error) => void
  onMessage?: (data: any) => void
  onWorkflowUpdate?: (data: any) => void
  onUserConfirmation?: (data: any) => void
  onChatMessage?: (data: any) => void
}

class WebSocketService {
  private socket: Socket | null = null
  private config: WebSocketConfig
  private handlers: WebSocketEventHandlers = {}
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      options: {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        ...config.options
      }
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, this.config.options)
        
        this.socket.on('connect', () => {
          console.log('WebSocket连接成功')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.handlers.onConnect?.()
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket断开连接:', reason)
          this.isConnected = false
          this.handlers.onDisconnect?.(reason)
        })

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket连接错误:', error)
          this.handlers.onError?.(error)
          if (this.reconnectAttempts === 0) {
            reject(error)
          }
        })

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('WebSocket重连成功:', attemptNumber)
          this.isConnected = true
          this.handlers.onReconnect?.(attemptNumber)
        })

        this.socket.on('reconnect_error', (error) => {
          console.error('WebSocket重连错误:', error)
          this.reconnectAttempts++
          this.handlers.onReconnectError?.(error)
        })

        // 业务事件监听
        this.socket.on('message', (data) => {
          this.handlers.onMessage?.(data)
        })

        this.socket.on('workflow_update', (data) => {
          this.handlers.onWorkflowUpdate?.(data)
        })

        this.socket.on('user_confirmation_required', (data) => {
          this.handlers.onUserConfirmation?.(data)
        })

        this.socket.on('chat_message', (data) => {
          this.handlers.onChatMessage?.(data)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // 设置事件处理器
  setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  // 发送消息
  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  // 订阅工作流更新
  subscribeToWorkflow(workflowRunId: string): void {
    this.emit('subscribe_workflow', { workflowRunId })
  }

  // 取消订阅工作流更新
  unsubscribeFromWorkflow(workflowRunId: string): void {
    this.emit('unsubscribe_workflow', { workflowRunId })
  }

  // 发送聊天消息
  sendChatMessage(conversationId: string, message: string): void {
    this.emit('chat_message', { conversationId, message })
  }

  // 加入聊天房间
  joinChatRoom(conversationId: string): void {
    this.emit('join_chat', { conversationId })
  }

  // 离开聊天房间
  leaveChatRoom(conversationId: string): void {
    this.emit('leave_chat', { conversationId })
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // 获取Socket实例
  getSocket(): Socket | null {
    return this.socket
  }
}

// 创建默认WebSocket服务实例
const defaultWebSocketService = new WebSocketService({
  url: process.env.NODE_ENV === 'production' 
    ? 'wss://your-production-domain.com' 
    : 'http://localhost:3001', // 直接连接到MCP服务器的Socket.IO
  options: {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
  }
})

export { WebSocketService }
export default defaultWebSocketService
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { message } from 'antd'

interface UserConfirmationRequest {
  confirmationId: string
  runId: string
  nodeId: string
  message: string
  options?: any
  timestamp: number
}

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  isConnected: boolean  // 添加缺失的属性
  pendingConfirmations: UserConfirmationRequest[]  // 添加缺失的属性
  subscribeToWorkflow: (runId: string) => void
  unsubscribeFromWorkflow: (runId: string) => void
  subscribe: (event: string, callback: (data: any) => void) => void  // 添加通用订阅方法
  unsubscribe: (event: string, callback?: (data: any) => void) => void  // 添加通用取消订阅方法
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [pendingConfirmations, setPendingConfirmations] = useState<UserConfirmationRequest[]>([])

  useEffect(() => {
    // 连接到WebSocket服务器
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('WebSocket连接成功')
      setConnected(true)
      message.success('实时连接已建立')
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket连接断开')
      setConnected(false)
      message.warning('实时连接已断开')
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error)
      setConnected(false)
      message.error('连接服务器失败')
    })

    // 监听工作流状态变化
    newSocket.on('workflow_status_changed', (event) => {
      console.log('工作流状态变化:', event)
      message.info(`工作流 ${event.runId} 状态变为: ${event.currentStatus}`)
    })

    // 监听节点状态变化
    newSocket.on('node_status_changed', (event) => {
      console.log('节点状态变化:', event)
      const statusText: Record<string, string> = {
        running: '运行中',
        succeeded: '成功',
        failed: '失败',
        stopped: '已停止'
      }
      const statusDisplay = statusText[event.currentStatus] || event.currentStatus
      
      message.info(`节点 "${event.node.title}" 状态: ${statusDisplay}`)
    })

    // 监听用户确认请求
    newSocket.on('user_confirmation_required', (request: UserConfirmationRequest) => {
      console.log('需要用户确认:', request)
      setPendingConfirmations(prev => [...prev, request])
      // 这里会由具体的组件处理确认请求
      window.dispatchEvent(new CustomEvent('userConfirmationRequired', { 
        detail: request 
      }))
    })

    // 监听确认处理结果
    newSocket.on('confirmation_processed', (result) => {
      console.log('确认处理结果:', result)
      // 从待确认列表中移除已处理的确认
      setPendingConfirmations(prev => 
        prev.filter(req => req.confirmationId !== result.confirmationId)
      )
      message.success('操作已处理')
    })

    // 监听监控错误
    newSocket.on('monitoring_error', (error) => {
      console.error('监控错误:', error)
      message.error(`监控出错: ${error.error || '未知错误'}`)
    })

    setSocket(newSocket)

    // 清理函数
    return () => {
      newSocket.close()
    }
  }, [])

  const subscribeToWorkflow = (runId: string) => {
    if (socket) {
      socket.emit('subscribe_workflow', runId)
      console.log(`订阅工作流: ${runId}`)
    }
  }

  const unsubscribeFromWorkflow = (runId: string) => {
    if (socket) {
      socket.emit('unsubscribe_workflow', runId)
      console.log(`取消订阅工作流: ${runId}`)
    }
  }

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }

  const value: SocketContextType = {
    socket,
    connected,
    isConnected: connected,  // 添加isConnected属性
    pendingConfirmations,    // 添加pendingConfirmations属性
    subscribeToWorkflow,
    unsubscribeFromWorkflow,
    subscribe,               // 添加通用订阅方法
    unsubscribe             // 添加通用取消订阅方法
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export type { UserConfirmationRequest }
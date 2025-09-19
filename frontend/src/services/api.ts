import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 工作流相关API
export interface WorkflowRunRequest {
  workflowId: string
  inputs: Record<string, any>
  user?: string
}

export interface WorkflowRun {
  id: string
  workflow_id: string
  status: 'running' | 'succeeded' | 'failed' | 'stopped'
  inputs: Record<string, any>
  outputs?: Record<string, any>
  error?: string
  elapsed_time: number
  total_tokens: number
  created_at: string
  finished_at?: string
}

export interface WorkflowNode {
  id: string
  type: string
  title: string
  status: 'running' | 'succeeded' | 'failed' | 'stopped'
  inputs: Record<string, any>
  outputs?: Record<string, any>
  error?: string
  elapsed_time: number
  execution_metadata?: {
    total_tokens?: number
    total_price?: string
    currency?: string
  }
}

export interface WorkflowRunDetail extends WorkflowRun {
  steps: WorkflowNode[]
}

export interface UserConfirmationResponse {
  workflow_run_id: string
  node_id: string
  action: 'approve' | 'reject' | 'retry' | 'modify'
  modified_inputs?: Record<string, any>
  comment?: string
}

// 工作流管理相关接口
export interface Workflow {
  id: string
  name: string
  description: string
  category: string
  is_public: boolean
  nodes: WorkflowNode[]
  created_at: string
  updated_at: string
  status: 'active' | 'inactive'
}

export interface CreateWorkflowRequest {
  name: string
  description: string
  category: string
  is_public: boolean
  nodes: WorkflowNode[]
}

/**
 * 运行工作流
 */
export const runWorkflow = async (request: WorkflowRunRequest): Promise<WorkflowRun> => {
  const response = await api.post('/workflows/run', request)
  return response.data.data
}

/**
 * 获取工作流运行状态
 */
export const getWorkflowRunStatus = async (runId: string): Promise<WorkflowRunDetail> => {
  const response = await api.get(`/workflows/runs/${runId}`)
  return response.data.data
}

/**
 * 停止工作流运行
 */
export const stopWorkflowRun = async (runId: string): Promise<void> => {
  await api.post(`/workflows/runs/${runId}/stop`)
}

/**
 * 处理用户确认响应
 */
export const confirmUserAction = async (
  confirmationId: string, 
  response: UserConfirmationResponse
): Promise<any> => {
  const result = await api.post(`/confirmations/${confirmationId}/respond`, response)
  return result.data.data
}

/**
 * 获取待确认列表
 */
export const getPendingConfirmations = async (): Promise<any[]> => {
  const response = await api.get('/confirmations/pending')
  return response.data.data
}

/**
 * 获取活跃监控列表
 */
export const getActiveMonitors = async (): Promise<string[]> => {
  const response = await api.get('/monitoring/active')
  return response.data.data
}

/**
 * 获取工作流列表
 */
export const getWorkflows = async (): Promise<Workflow[]> => {
  const response = await api.get('/workflows')
  return response.data.data || []
}

/**
 * 创建工作流
 */
export const createWorkflow = async (workflow: CreateWorkflowRequest): Promise<Workflow> => {
  const response = await api.post('/workflows', workflow)
  return response.data.data
}

/**
 * 更新工作流
 */
export const updateWorkflow = async (id: string, workflow: Partial<CreateWorkflowRequest>): Promise<Workflow> => {
  const response = await api.put(`/workflows/${id}`, workflow)
  return response.data.data
}

/**
 * 删除工作流
 */
export const deleteWorkflow = async (id: string): Promise<void> => {
  await api.delete(`/workflows/${id}`)
}

export default api
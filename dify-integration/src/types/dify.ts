// Dify工作流相关类型定义

export interface DifyWorkflowRun {
  id: string;
  workflow_id: string;
  status: 'running' | 'succeeded' | 'failed' | 'stopped';
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  elapsed_time: number;
  total_tokens: number;
  created_at: string;
  finished_at?: string;
}

export interface DifyWorkflowNode {
  id: string;
  type: string;
  title: string;
  status: 'running' | 'succeeded' | 'failed' | 'stopped';
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  elapsed_time: number;
  execution_metadata?: {
    total_tokens?: number;
    total_price?: string;
    currency?: string;
  };
}

export interface DifyWorkflowRunDetail {
  id: string;
  workflow_id: string;
  status: 'running' | 'succeeded' | 'failed' | 'stopped';
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  elapsed_time: number;
  total_tokens: number;
  created_at: string;
  finished_at?: string;
  steps: DifyWorkflowNode[];
}

export interface UserConfirmationRequest {
  workflow_run_id: string;
  node_id: string;
  node_title: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  message: string;
  options?: string[];
  timeout?: number;
}

export interface UserConfirmationResponse {
  workflow_run_id: string;
  node_id: string;
  action: 'approve' | 'reject' | 'retry' | 'modify';
  modified_inputs?: Record<string, any>;
  comment?: string;
}

export interface WorkflowMonitoringConfig {
  webhook_url?: string;
  polling_interval: number;
  max_retries: number;
  timeout: number;
}
import axios, { AxiosInstance } from 'axios';
import { DifyWorkflowRun, DifyWorkflowRunDetail } from '../types/dify.js';

export class DifyClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 运行工作流
   */
  async runWorkflow(
    workflowId: string, 
    inputs: Record<string, any>, 
    user: string = 'system'
  ): Promise<DifyWorkflowRun> {
    const response = await this.client.post(`/workflows/run`, {
      inputs,
      response_mode: 'blocking',
      user
    });
    return response.data;
  }

  /**
   * 获取工作流运行状态
   */
  async getWorkflowRunStatus(runId: string): Promise<DifyWorkflowRun> {
    const response = await this.client.get(`/workflows/runs/${runId}`);
    return response.data;
  }

  /**
   * 获取工作流运行详情（包含节点信息）
   */
  async getWorkflowRunDetail(runId: string): Promise<DifyWorkflowRunDetail> {
    const response = await this.client.get(`/workflows/runs/${runId}/logs`);
    return response.data;
  }

  /**
   * 停止工作流运行
   */
  async stopWorkflowRun(runId: string): Promise<void> {
    await this.client.post(`/workflows/runs/${runId}/stop`);
  }

  /**
   * 重新运行工作流（从指定节点开始）
   */
  async retryWorkflowFromNode(
    workflowId: string,
    inputs: Record<string, any>,
    fromNodeId?: string
  ): Promise<DifyWorkflowRun> {
    const payload: any = {
      inputs,
      response_mode: 'blocking',
      user: 'system'
    };

    if (fromNodeId) {
      payload.from_node_id = fromNodeId;
    }

    const response = await this.client.post(`/workflows/run`, payload);
    return response.data;
  }

  /**
   * 获取工作流列表
   */
  async getWorkflows(): Promise<any[]> {
    const response = await this.client.get('/workflows');
    return response.data.data || [];
  }

  /**
   * 获取工作流详情
   */
  async getWorkflowDetail(workflowId: string): Promise<any> {
    const response = await this.client.get(`/workflows/${workflowId}`);
    return response.data;
  }
}
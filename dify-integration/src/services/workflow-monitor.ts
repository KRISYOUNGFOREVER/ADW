import { EventEmitter } from 'events';
import { DifyClient } from './dify-client.js';
import { 
  DifyWorkflowRun, 
  DifyWorkflowRunDetail, 
  DifyWorkflowNode,
  UserConfirmationRequest,
  WorkflowMonitoringConfig 
} from '../types/dify.js';

export class WorkflowMonitor extends EventEmitter {
  private difyClient: DifyClient;
  private config: WorkflowMonitoringConfig;
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();
  private runStates: Map<string, DifyWorkflowRunDetail> = new Map();

  constructor(difyClient: DifyClient, config: WorkflowMonitoringConfig) {
    super();
    this.difyClient = difyClient;
    this.config = config;
  }

  /**
   * 开始监控工作流运行
   */
  async startMonitoring(runId: string): Promise<void> {
    if (this.activeMonitors.has(runId)) {
      return; // 已在监控中
    }

    console.log(`开始监控工作流运行: ${runId}`);
    
    const monitor = setInterval(async () => {
      try {
        await this.checkWorkflowStatus(runId);
      } catch (error) {
        console.error(`监控工作流 ${runId} 时出错:`, error);
        this.emit('error', { runId, error });
      }
    }, this.config.polling_interval);

    this.activeMonitors.set(runId, monitor);
    
    // 立即检查一次状态
    await this.checkWorkflowStatus(runId);
  }

  /**
   * 停止监控工作流运行
   */
  stopMonitoring(runId: string): void {
    const monitor = this.activeMonitors.get(runId);
    if (monitor) {
      clearInterval(monitor);
      this.activeMonitors.delete(runId);
      this.runStates.delete(runId);
      console.log(`停止监控工作流运行: ${runId}`);
    }
  }

  /**
   * 检查工作流状态
   */
  private async checkWorkflowStatus(runId: string): Promise<void> {
    try {
      const runDetail = await this.difyClient.getWorkflowRunDetail(runId);
      const previousState = this.runStates.get(runId);
      
      // 更新状态
      this.runStates.set(runId, runDetail);

      // 检查整体状态变化
      if (!previousState || previousState.status !== runDetail.status) {
        this.emit('workflow_status_changed', {
          runId,
          previousStatus: previousState?.status,
          currentStatus: runDetail.status,
          runDetail
        });
      }

      // 检查节点状态变化
      this.checkNodeStatusChanges(runId, previousState, runDetail);

      // 如果工作流完成，停止监控
      if (['succeeded', 'failed', 'stopped'].includes(runDetail.status)) {
        this.stopMonitoring(runId);
      }

    } catch (error) {
      console.error(`获取工作流 ${runId} 状态失败:`, error);
      throw error;
    }
  }

  /**
   * 检查节点状态变化
   */
  private checkNodeStatusChanges(
    runId: string, 
    previousState: DifyWorkflowRunDetail | undefined, 
    currentState: DifyWorkflowRunDetail
  ): void {
    const previousNodes = new Map(
      (previousState?.steps || []).map(node => [node.id, node])
    );

    for (const currentNode of currentState.steps) {
      const previousNode = previousNodes.get(currentNode.id);

      // 节点状态发生变化
      if (!previousNode || previousNode.status !== currentNode.status) {
        this.emit('node_status_changed', {
          runId,
          nodeId: currentNode.id,
          previousStatus: previousNode?.status,
          currentStatus: currentNode.status,
          node: currentNode
        });

        // 检查是否需要用户确认
        this.checkForUserConfirmation(runId, currentNode);
      }
    }
  }

  /**
   * 检查是否需要用户确认
   */
  private checkForUserConfirmation(runId: string, node: DifyWorkflowNode): void {
    // 如果节点失败或需要用户输入，触发用户确认请求
    if (node.status === 'failed' || this.isUserInteractionNode(node)) {
      const confirmationRequest: UserConfirmationRequest = {
        workflow_run_id: runId,
        node_id: node.id,
        node_title: node.title,
        inputs: node.inputs,
        outputs: node.outputs,
        message: this.generateConfirmationMessage(node),
        options: this.getConfirmationOptions(node),
        timeout: 300000 // 5分钟超时
      };

      this.emit('user_confirmation_required', confirmationRequest);
    }
  }

  /**
   * 判断是否为用户交互节点
   */
  private isUserInteractionNode(node: DifyWorkflowNode): boolean {
    // 根据节点类型或特定标识判断是否需要用户交互
    const interactionNodeTypes = ['human-input', 'approval', 'confirmation'];
    return interactionNodeTypes.includes(node.type) || 
           node.title.toLowerCase().includes('confirm') ||
           node.title.toLowerCase().includes('approve');
  }

  /**
   * 生成确认消息
   */
  private generateConfirmationMessage(node: DifyWorkflowNode): string {
    if (node.status === 'failed') {
      return `节点 "${node.title}" 执行失败${node.error ? ': ' + node.error : ''}。是否重新执行？`;
    }
    
    return `节点 "${node.title}" 需要您的确认。请查看输入输出并选择操作。`;
  }

  /**
   * 获取确认选项
   */
  private getConfirmationOptions(node: DifyWorkflowNode): string[] {
    if (node.status === 'failed') {
      return ['重新执行', '修改参数后执行', '跳过此节点', '停止工作流'];
    }
    
    return ['继续执行', '修改参数', '停止工作流'];
  }

  /**
   * 获取当前监控的工作流列表
   */
  getActiveMonitors(): string[] {
    return Array.from(this.activeMonitors.keys());
  }

  /**
   * 获取工作流运行状态
   */
  getRunState(runId: string): DifyWorkflowRunDetail | undefined {
    return this.runStates.get(runId);
  }

  /**
   * 清理所有监控
   */
  cleanup(): void {
    for (const [runId] of this.activeMonitors) {
      this.stopMonitoring(runId);
    }
  }
}
import express, { Request, Response } from 'express';
import * as cors from 'cors';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import * as dotenv from 'dotenv';
import { DifyClient } from './services/dify-client.js';
import { WorkflowMonitor } from './services/workflow-monitor.js';
import { UserConfirmationRequest, UserConfirmationResponse } from './types/dify.js';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 初始化Dify客户端
const difyClient = new DifyClient(
  process.env.DIFY_API_BASE_URL || 'https://api.dify.ai/v1',
  process.env.DIFY_API_KEY || ''
);

// 初始化工作流监控器
const workflowMonitor = new WorkflowMonitor(difyClient, {
  polling_interval: 2000, // 2秒轮询一次
  max_retries: 3,
  timeout: 300000 // 5分钟超时
});

// 存储待确认的请求
const pendingConfirmations = new Map<string, UserConfirmationRequest>();

// 工作流监控事件处理
workflowMonitor.on('workflow_status_changed', (event) => {
  console.log('工作流状态变化:', event);
  io.emit('workflow_status_changed', event);
});

workflowMonitor.on('node_status_changed', (event) => {
  console.log('节点状态变化:', event);
  io.emit('node_status_changed', event);
});

workflowMonitor.on('user_confirmation_required', (request: UserConfirmationRequest) => {
  console.log('需要用户确认:', request);
  const confirmationId = `${request.workflow_run_id}_${request.node_id}`;
  pendingConfirmations.set(confirmationId, request);
  io.emit('user_confirmation_required', { ...request, confirmationId });
});

workflowMonitor.on('error', (error) => {
  console.error('监控错误:', error);
  io.emit('monitoring_error', error);
});

// API路由

/**
 * 运行工作流
 */
app.post('/api/workflows/run', async (req: Request, res: Response) => {
  try {
    const { workflowId, inputs, user } = req.body;
    
    if (!workflowId || !inputs) {
      return res.status(400).json({ error: '缺少必要参数: workflowId 和 inputs' });
    }

    const run = await difyClient.runWorkflow(workflowId, inputs, user);
    
    // 开始监控
    await workflowMonitor.startMonitoring(run.id);
    
    res.json({
      success: true,
      data: run
    });
  } catch (error) {
    console.error('运行工作流失败:', error);
    res.status(500).json({ 
      error: '运行工作流失败', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * 获取工作流运行状态
 */
app.get('/api/workflows/runs/:runId', async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const runDetail = await difyClient.getWorkflowRunDetail(runId);
    
    res.json({
      success: true,
      data: runDetail
    });
  } catch (error) {
    console.error('获取工作流状态失败:', error);
    res.status(500).json({ 
      error: '获取工作流状态失败', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * 停止工作流运行
 */
app.post('/api/workflows/runs/:runId/stop', async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    await difyClient.stopWorkflowRun(runId);
    workflowMonitor.stopMonitoring(runId);
    
    res.json({
      success: true,
      message: '工作流已停止'
    });
  } catch (error) {
    console.error('停止工作流失败:', error);
    res.status(500).json({ 
      error: '停止工作流失败', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * 处理用户确认响应
 */
app.post('/api/confirmations/:confirmationId/respond', async (req: Request, res: Response) => {
  try {
    const { confirmationId } = req.params;
    const response: UserConfirmationResponse = req.body;
    
    const request = pendingConfirmations.get(confirmationId);
    if (!request) {
      return res.status(404).json({ error: '确认请求不存在或已过期' });
    }

    // 根据用户响应执行相应操作
    let result;
    switch (response.action) {
      case 'approve':
        // 继续执行工作流（如果支持的话）
        result = { message: '已批准，工作流将继续执行' };
        break;
        
      case 'retry':
        // 重新执行节点
        const retryRun = await difyClient.retryWorkflowFromNode(
          request.workflow_run_id.split('_')[0], // 提取workflowId
          request.inputs,
          request.node_id
        );
        await workflowMonitor.startMonitoring(retryRun.id);
        result = { message: '节点重新执行中', runId: retryRun.id };
        break;
        
      case 'modify':
        // 使用修改后的参数重新执行
        const modifiedInputs = { ...request.inputs, ...response.modified_inputs };
        const modifiedRun = await difyClient.retryWorkflowFromNode(
          request.workflow_run_id.split('_')[0],
          modifiedInputs,
          request.node_id
        );
        await workflowMonitor.startMonitoring(modifiedRun.id);
        result = { message: '使用修改后的参数重新执行', runId: modifiedRun.id };
        break;
        
      case 'reject':
        // 停止工作流
        await difyClient.stopWorkflowRun(request.workflow_run_id);
        workflowMonitor.stopMonitoring(request.workflow_run_id);
        result = { message: '工作流已停止' };
        break;
        
      default:
        return res.status(400).json({ error: '无效的操作类型' });
    }

    // 移除待确认请求
    pendingConfirmations.delete(confirmationId);
    
    // 通知前端
    io.emit('confirmation_processed', {
      confirmationId,
      response,
      result
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('处理用户确认失败:', error);
    res.status(500).json({ 
      error: '处理用户确认失败', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * 获取待确认列表
 */
app.get('/api/confirmations/pending', (req: Request, res: Response) => {
  const pending = Array.from(pendingConfirmations.entries()).map(([id, request]) => ({
    confirmationId: id,
    ...request
  }));
  
  res.json({
    success: true,
    data: pending
  });
});

/**
 * 获取活跃监控列表
 */
app.get('/api/monitoring/active', (req: Request, res: Response) => {
  const activeMonitors = workflowMonitor.getActiveMonitors();
  
  res.json({
    success: true,
    data: activeMonitors
  });
});

// WebSocket连接处理
io.on('connection', (socket: Socket) => {
  console.log('客户端连接:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
  });
  
  // 客户端可以订阅特定工作流的更新
  socket.on('subscribe_workflow', (runId: string) => {
    socket.join(`workflow_${runId}`);
    console.log(`客户端 ${socket.id} 订阅工作流 ${runId}`);
  });
  
  socket.on('unsubscribe_workflow', (runId: string) => {
    socket.leave(`workflow_${runId}`);
    console.log(`客户端 ${socket.id} 取消订阅工作流 ${runId}`);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, () => {
  console.log(`Dify集成服务运行在 http://${HOST}:${PORT}`);
  console.log(`WebSocket服务运行在 ws://${HOST}:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  workflowMonitor.cleanup();
  server.close(() => {
    console.log('服务已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  workflowMonitor.cleanup();
  server.close(() => {
    console.log('服务已关闭');
    process.exit(0);
  });
});

export { difyClient, workflowMonitor };
# MCP连接中断问题解决方案

## 问题分析

### 后端日志分析
从你提供的日志可以看出：

1. **SSE连接建立成功**：
   - `🔌 [1] SSE connection request received`
   - `✅ [1] MCP server connected successfully`
   - `sessionId: 'f4c03e85-8854-420d-bd64-294b893ea45e'`

2. **多次POST请求处理正常**：
   - 6次POST请求都返回了`statusCode: 202`
   - Session ID匹配正确

3. **连接突然中断**：
   - `🔌 [1] Response closed`
   - `❌ [1] SSE connection error: Error: aborted`
   - `code: 'ECONNRESET'`

### 前端错误信息
`{"error": "MCP 服务连接失败，无法处理图像设计需求。请检查 MCP 服务器是否正常运行。"}`

## 根本原因

1. **SSE连接不稳定**：客户端（Dify）在处理过程中主动断开了连接
2. **缺少连接重试机制**：连接断开后没有自动重连
3. **错误处理不完善**：连接中断后没有给出明确的错误信息

## 解决方案

### 1. 优化SSE连接稳定性

#### 改进的连接处理：
```typescript
// 设置正确的SSE响应头
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Cache-Control',
  'X-Accel-Buffering': 'no' // 禁用nginx缓冲
});

// 发送初始连接确认
res.write(': connected\\n\\n');

// 缩短心跳间隔到15秒
const heartbeatInterval = setInterval(() => {
  if (currentTransport && !res.destroyed && !res.writableEnded) {
    res.write(': heartbeat\\n\\n');
  }
}, 15000);
```

#### 改进的错误处理：
```typescript
// 完善的连接清理逻辑
req.on('close', () => {
  console.log(`🔌 [${thisConnectionId}] SSE connection closed by client`);
  clearInterval(heartbeatInterval);
  if (currentTransport) {
    try {
      if (typeof currentTransport.close === 'function') {
        currentTransport.close();
      }
    } catch (closeError) {
      console.error(`❌ Error closing transport:`, closeError);
    }
    currentTransport = null;
  }
});
```

### 2. 增强POST消息处理

#### 改进的错误响应：
```typescript
if (!currentTransport) {
  res.status(503).json({ 
    error: 'MCP service unavailable', 
    message: 'SSE connection not established or lost. Please reconnect.' 
  });
  return;
}

// 添加Session ID验证
if (expectedSessionId && receivedSessionId !== expectedSessionId) {
  res.status(400).json({ 
    error: 'Session ID mismatch', 
    expected: expectedSessionId,
    received: receivedSessionId
  });
  return;
}

// 添加30秒超时处理
const timeout = setTimeout(() => {
  if (!res.headersSent) {
    res.status(408).json({ error: 'Request timeout' });
  }
}, 30000);
```

## Dify配置检查

### 正确的MCP服务器配置

在Dify的Agent策略中，MCP服务器配置应该是：

```json
{
  "liblib-mcp-server": {
    "transport": "sse",
    "url": "http://host.docker.internal:3001/mcp"
  }
}
```

### 关键配置要点：

1. **URL格式**：确保使用 `http://host.docker.internal:3001/mcp`
2. **传输协议**：必须设置为 `"transport": "sse"`
3. **端口号**：确认MCP服务器运行在3001端口
4. **网络访问**：确保Docker容器能访问宿主机的3001端口

## 故障排除步骤

### 1. 检查MCP服务器状态
```bash
curl -I http://localhost:3001/mcp
```
应该返回：
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 2. 检查Dify容器网络
如果Dify运行在Docker中，确保：
- 使用 `host.docker.internal` 而不是 `localhost`
- 或者将MCP服务器也运行在Docker网络中

### 3. 检查防火墙设置
确保3001端口没有被防火墙阻止

### 4. 查看详细日志
在MCP服务器日志中查找：
- SSE连接建立日志
- POST请求处理日志
- 错误和断开连接日志

## 测试验证

### 1. 手动测试SSE连接
```bash
curl -N -H "Accept: text/event-stream" http://localhost:3001/mcp
```

### 2. 测试MCP工具调用
在Dify中创建简单的测试对话：
- 输入："测试MCP连接"
- 观察是否能正常调用MCP工具

### 3. 监控连接稳定性
观察MCP服务器日志，确认：
- 心跳消息正常发送
- 没有连接中断错误
- POST请求正常处理

## 预防措施

1. **定期监控**：设置MCP服务器健康检查
2. **连接重试**：在客户端实现自动重连机制
3. **日志记录**：保持详细的连接和错误日志
4. **性能优化**：避免长时间阻塞操作

## 常见问题

### Q: 为什么连接会突然中断？
A: 通常是由于网络超时、客户端主动断开或服务器资源不足导致。

### Q: 如何确认Dify配置正确？
A: 检查MCP服务器配置中的URL和传输协议设置。

### Q: 连接中断后如何恢复？
A: 优化后的服务器会自动清理资源，客户端需要重新建立连接。

## 更新日志

- 优化SSE连接稳定性
- 增强错误处理和日志记录
- 添加连接超时和重试机制
- 完善资源清理逻辑
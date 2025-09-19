# Dify工作流节点介入开发参考文档

## 1. 核心API接口

### 1.1 工作流状态监控
```bash
# 获取工作流执行详情
GET /v1/workflows/run/{workflow_run_id}

# 获取工作流执行日志
GET /v1/workflows/logs
```

### 1.2 工作流状态类型
- `running` - 执行中
- `succeeded` - 成功完成  
- `failed` - 执行失败
- `stopped` - 已停止

## 2. 节点调试机制

### 2.1 单节点调试
- 独立测试特定节点，无需执行整个工作流
- 查看节点输入/输出和执行状态
- 获取节点执行历史记录

### 2.2 逐步执行
- 支持工作流逐步执行，每个节点后暂停
- 通过Variable Inspector查看/修改节点间数据流
- 修改上游变量测试下游节点响应

## 3. 用户交互实现方案

### 3.1 基于HTTP节点的确认机制
```javascript
// 工作流状态监控
class WorkflowMonitor {
  async getWorkflowStatus() {
    const response = await fetch(`/v1/workflows/run/${this.workflowRunId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  }
}
```

### 3.2 用户确认节点配置
```json
{
  "type": "http-request",
  "config": {
    "method": "POST",
    "url": "https://your-frontend.com/api/user-confirmation",
    "body": {
      "node_id": "{{node.id}}",
      "node_output": "{{node.output}}",
      "workflow_id": "{{workflow.id}}",
      "message": "请确认此节点的输出是否满足需求"
    },
    "timeout": 300
  }
}
```

## 4. 错误处理策略

### 4.1 三种处理方式
1. **None** - 直接抛出错误并中断流程
2. **Default Value** - 使用预定义值替换错误输出
3. **Fail Branch** - 执行预设的失败分支

### 4.2 重试机制
- 最大重试次数：10次
- 最大重试间隔：5000ms

## 5. 前端实现要点

### 5.1 实时状态更新
- 使用WebSocket或轮询监控工作流状态
- 实现节点状态实时可视化
- 绿色=成功，红色=失败，黄色=执行中

### 5.2 用户交互界面
```javascript
class NodeConfirmationComponent {
  confirmOutput(satisfied) {
    if (satisfied) {
      this.sendConfirmation({ satisfied: true });
    } else {
      // 显示反馈输入框
      document.querySelector('.feedback-section').style.display = 'block';
    }
  }

  async sendConfirmation(data) {
    await fetch('/api/node-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_id: this.nodeData.workflow_id,
        node_id: this.nodeData.id,
        ...data
      })
    });
  }
}
```

## 6. 后端集成要点

### 6.1 确认处理接口
```python
@app.route('/api/node-confirmation', methods=['POST'])
def handle_node_confirmation():
    data = request.json
    workflow_id = data['workflow_id']
    node_id = data['node_id']
    satisfied = data.get('satisfied', False)
    
    if satisfied:
        return continue_workflow(workflow_id, node_id)
    else:
        feedback = data.get('feedback', '')
        return retry_node(workflow_id, node_id, feedback)
```

### 6.2 Webhook集成
- 配置Dify webhook接收工作流状态变更通知
- 实现用户确认的回调处理
- 处理工作流暂停/恢复逻辑

## 7. 关键技术实现

### 7.1 工作流暂停机制
- 通过HTTP节点实现类似暂停功能
- 利用超时机制和错误处理等待用户确认

### 7.2 节点重新执行
- 利用Dify的重试机制和Fail Branch功能
- 通过修改节点输入参数实现重新执行

### 7.3 状态持久化
- 保存工作流执行状态和用户交互历史
- 支持工作流的恢复和继续执行

## 8. 开发守则

> **以破坏架构为耻，以遵循规范为荣**

- 严格遵循Dify API规范
- 保持与Dify平台的兼容性6
- 合理利用现有功能特性
- 确保系统稳定性和可维护性

---

**注意：** 此方案通过巧妙结合Dify现有功能实现用户交互确认，既保持平台兼容性又提供灵活的用户体验。
        
# Dify开发参考文档

## 1. Dify平台概述

### 1.1 Dify简介
Dify是一个开源的LLM应用开发平台，提供了直观的界面来设计AI工作流、管理智能体、集成各种工具和数据源。

### 1.2 核心功能
- **工作流编排**: 可视化的工作流设计器
- **智能体管理**: 创建和管理AI智能体
- **工具集成**: 集成各种外部工具和API
- **知识库管理**: 管理和检索知识库
- **多模态支持**: 支持文本、图像、音频等多种模态

## 2. Dify架构组件

### 2.1 核心组件

#### 2.1.1 工作流引擎 (Workflow Engine)
- **功能**: 执行复杂的AI工作流
- **特点**: 支持条件分支、循环、并行执行
- **用途**: 设计流程自动化、任务编排

#### 2.1.2 智能体 (Agent)
- **功能**: 基于LLM的智能决策和执行
- **特点**: 支持工具调用、记忆管理、角色设定
- **用途**: 需求分析、任务规划、决策制定

#### 2.1.3 工具集成 (Tool Integration)
- **功能**: 集成外部工具和服务
- **特点**: 支持HTTP API、数据库、文件系统等
- **用途**: 调用MCP服务、第三方API

#### 2.1.4 知识库 (Knowledge Base)
- **功能**: 存储和检索结构化知识
- **特点**: 支持向量检索、语义搜索
- **用途**: 设计规范、历史案例、最佳实践

## 3. 工作流开发

### 3.1 工作流节点类型

#### 3.1.1 输入节点
- **开始节点**: 工作流的入口点
- **用户输入节点**: 接收用户输入
- **文件上传节点**: 处理文件上传

#### 3.1.2 处理节点
- **LLM节点**: 调用大语言模型
- **代码执行节点**: 执行Python/JavaScript代码
- **HTTP请求节点**: 调用外部API
- **数据转换节点**: 数据格式转换

#### 3.1.3 控制节点
- **条件分支节点**: 基于条件进行分支
- **循环节点**: 重复执行子流程
- **并行节点**: 并行执行多个分支
- **等待节点**: 等待用户确认或外部事件

#### 3.1.4 输出节点
- **回答节点**: 返回结果给用户
- **文件输出节点**: 生成文件输出
- **结束节点**: 工作流结束点

### 3.2 设计流程工作流示例

#### 3.2.1 高端定制设计工作流
```yaml
workflow:
  name: "高端定制设计流程"
  nodes:
    - id: "start"
      type: "start"
      config:
        inputs:
          - name: "design_requirement"
            type: "string"
            required: true
    
    - id: "requirement_analysis"
      type: "llm"
      config:
        model: "gpt-4"
        prompt: |
          分析以下设计需求，提取关键信息：
          需求：{{start.design_requirement}}
          
          请提取：
          1. 产品类型
          2. 设计风格
          3. 材质要求
          4. 尺寸规格
          5. 特殊要求
    
    - id: "task_planning"
      type: "llm"
      config:
        model: "gpt-4"
        prompt: |
          基于需求分析结果，制定设计任务计划：
          分析结果：{{requirement_analysis.output}}
          
          请制定包含以下步骤的任务计划：
          1. 器形设计
          2. 花纸设计
          3. 材质选择
          4. 花纸贴合
          5. 产品渲染
    
    - id: "shape_design"
      type: "http"
      config:
        method: "POST"
        url: "http://localhost:3000/mcp/liblib/generate"
        body:
          prompt: "{{task_planning.shape_prompt}}"
          model: "F.1 Kontext"
          parameters:
            width: 1024
            height: 1024
    
    - id: "user_confirm_shape"
      type: "human"
      config:
        message: "请确认器形设计是否满足要求"
        inputs:
          - name: "shape_result"
            value: "{{shape_design.result}}"
    
    - id: "pattern_design"
      type: "http"
      config:
        method: "POST"
        url: "http://localhost:3000/mcp/liblib/generate"
        body:
          prompt: "{{task_planning.pattern_prompt}}"
          model: "LibDream"
    
    - id: "final_render"
      type: "http"
      config:
        method: "POST"
        url: "http://localhost:3000/mcp/liblib/workflow"
        body:
          workflow_id: "product_render_workflow"
          inputs:
            shape: "{{shape_design.result}}"
            pattern: "{{pattern_design.result}}"
    
    - id: "end"
      type: "answer"
      config:
        answer: "设计完成！最终效果图：{{final_render.result}}"
```

### 3.3 聊天式交互工作流示例

#### 3.3.1 智能设计助手工作流
```yaml
workflow:
  name: "智能设计助手"
  nodes:
    - id: "start"
      type: "start"
      config:
        inputs:
          - name: "user_message"
            type: "string"
    
    - id: "intent_recognition"
      type: "llm"
      config:
        model: "gpt-4"
        prompt: |
          识别用户意图：{{start.user_message}}
          
          可能的意图：
          1. 新设计需求
          2. 修改现有设计
          3. 咨询设计建议
          4. 查看历史设计
          
          返回JSON格式：{"intent": "意图", "confidence": 0.9}
    
    - id: "route_by_intent"
      type: "if-else"
      config:
        conditions:
          - condition: "{{intent_recognition.intent}} == '新设计需求'"
            target: "new_design_flow"
          - condition: "{{intent_recognition.intent}} == '修改现有设计'"
            target: "modify_design_flow"
          - condition: "{{intent_recognition.intent}} == '咨询设计建议'"
            target: "design_consultation"
        default: "general_response"
    
    - id: "new_design_flow"
      type: "subflow"
      config:
        workflow_id: "高端定制设计流程"
        inputs:
          design_requirement: "{{start.user_message}}"
    
    - id: "design_consultation"
      type: "llm"
      config:
        model: "gpt-4"
        prompt: |
          作为专业设计顾问，回答用户问题：
          问题：{{start.user_message}}
          
          请提供专业的设计建议和指导。
```

## 4. 智能体开发

### 4.1 智能体配置

#### 4.1.1 设计专家智能体
```yaml
agent:
  name: "设计专家"
  description: "专业的产品设计专家，擅长高端定制产品设计"
  model: "gpt-4"
  temperature: 0.7
  
  system_prompt: |
    你是一位经验丰富的产品设计专家，专门从事高端定制产品设计。
    
    你的专业领域包括：
    - 器形设计和结构优化
    - 装饰图案和纹理设计
    - 材质选择和搭配
    - 产品渲染和效果展示
    
    你的工作流程：
    1. 深入理解客户需求
    2. 分析设计可行性
    3. 制定详细设计方案
    4. 选择合适的工具和技术
    5. 监控设计质量
    6. 提供优化建议
  
  tools:
    - name: "liblib_generate"
      description: "调用LiblibAI生成图像"
    - name: "quality_assess"
      description: "评估设计质量"
    - name: "file_manager"
      description: "管理设计文件"
  
  memory:
    type: "conversation"
    max_tokens: 4000
```

#### 4.1.2 工具调用智能体
```yaml
agent:
  name: "工具调用专家"
  description: "负责选择和调用合适的设计工具"
  model: "gpt-4"
  temperature: 0.3
  
  system_prompt: |
    你是工具调用专家，负责为设计任务选择最合适的工具和参数。
    
    可用工具：
    1. LiblibAI图像生成 - 适用于各种图像生成任务
    2. ComfyUI工作流 - 适用于复杂的图像处理流程
    3. 文件管理工具 - 处理文件上传下载
    4. 质量评估工具 - 评估设计质量
    
    选择原则：
    - 根据任务类型选择最适合的工具
    - 考虑工具的性能和成本
    - 确保参数配置正确
    - 处理工具调用异常
  
  tools:
    - name: "tool_selector"
      description: "选择合适的工具"
    - name: "parameter_optimizer"
      description: "优化工具参数"
```

### 4.2 智能体工具集成

#### 4.2.1 MCP工具集成
```python
# 在Dify中集成MCP工具
def register_mcp_tools():
    tools = [
        {
            "name": "liblib_generate",
            "description": "使用LiblibAI生成图像",
            "parameters": {
                "prompt": {"type": "string", "required": True},
                "model": {"type": "string", "required": True},
                "width": {"type": "integer", "default": 1024},
                "height": {"type": "integer", "default": 1024}
            },
            "endpoint": "http://localhost:3000/mcp/liblib/generate"
        },
        {
            "name": "design_process",
            "description": "执行设计流程",
            "parameters": {
                "requirement": {"type": "string", "required": True},
                "process_type": {"type": "string", "required": True}
            },
            "endpoint": "http://localhost:3000/mcp/design-process/execute"
        }
    ]
    return tools
```

## 5. API接口参考

### 5.1 工作流API

#### 5.1.1 创建工作流
```http
POST /api/v1/workflows
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "name": "设计工作流",
  "description": "高端定制产品设计流程",
  "definition": {
    "nodes": [...],
    "edges": [...]
  }
}
```

#### 5.1.2 执行工作流
```http
POST /api/v1/workflows/{workflow_id}/run
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "inputs": {
    "design_requirement": "设计一个现代风格的花瓶"
  },
  "user_id": "user_123"
}
```

#### 5.1.3 获取执行状态
```http
GET /api/v1/workflows/runs/{run_id}
Authorization: Bearer {api_key}
```

### 5.2 智能体API

#### 5.2.1 创建对话
```http
POST /api/v1/chat-messages
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "inputs": {
    "query": "我需要设计一个现代风格的茶具"
  },
  "response_mode": "streaming",
  "user": "user_123"
}
```

#### 5.2.2 获取对话历史
```http
GET /api/v1/messages?user=user_123&limit=20
Authorization: Bearer {api_key}
```

### 5.3 工具API

#### 5.3.1 注册工具
```http
POST /api/v1/tools
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "name": "liblib_mcp",
  "description": "LiblibAI图像生成工具",
  "schema": {
    "type": "object",
    "properties": {
      "prompt": {"type": "string"},
      "model": {"type": "string"}
    }
  },
  "endpoint": "http://localhost:3000/mcp/liblib"
}
```

## 6. 数据库集成

### 6.1 数据源配置
```yaml
datasources:
  - name: "design_database"
    type: "postgresql"
    config:
      host: "localhost"
      port: 5432
      database: "aidesign"
      username: "dify_user"
      password: "password"
  
  - name: "file_storage"
    type: "s3"
    config:
      bucket: "design-files"
      region: "us-east-1"
      access_key: "ACCESS_KEY"
      secret_key: "SECRET_KEY"
```

### 6.2 知识库集成
```yaml
knowledge_bases:
  - name: "设计规范"
    description: "产品设计规范和标准"
    embedding_model: "text-embedding-ada-002"
    documents:
      - path: "./docs/design_standards.pdf"
      - path: "./docs/material_guide.pdf"
  
  - name: "历史案例"
    description: "历史设计案例库"
    embedding_model: "text-embedding-ada-002"
    documents:
      - path: "./cases/"
        recursive: true
```

## 7. 部署和配置

### 7.1 Docker部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  dify-web:
    image: langgenius/dify-web:latest
    ports:
      - "3000:3000"
    environment:
      - CONSOLE_API_URL=http://dify-api:5001
      - APP_API_URL=http://dify-api:5001
  
  dify-api:
    image: langgenius/dify-api:latest
    ports:
      - "5001:5001"
    environment:
      - SECRET_KEY=your-secret-key
      - DATABASE_URL=postgresql://user:pass@db:5432/dify
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=dify
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 7.2 环境变量配置
```env
# Dify配置
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/dify
REDIS_URL=redis://localhost:6379

# OpenAI配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE=https://api.openai.com/v1

# 文件存储配置
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage

# MCP服务配置
MCP_LIBLIB_ENDPOINT=http://localhost:3000/mcp/liblib
MCP_DESIGN_PROCESS_ENDPOINT=http://localhost:3000/mcp/design-process
```

## 8. 最佳实践

### 8.1 工作流设计原则
- **模块化设计**: 将复杂流程分解为可重用的子流程
- **错误处理**: 在关键节点添加错误处理逻辑
- **用户体验**: 在适当位置添加用户确认节点
- **性能优化**: 使用并行节点提高执行效率

### 8.2 智能体配置建议
- **角色明确**: 为每个智能体定义清晰的角色和职责
- **提示优化**: 编写详细和具体的系统提示
- **工具集成**: 合理配置智能体可用的工具
- **记忆管理**: 适当配置对话记忆长度

### 8.3 开发调试技巧
- **日志记录**: 在关键节点添加日志输出
- **测试数据**: 准备充分的测试用例
- **版本管理**: 使用版本控制管理工作流配置
- **监控告警**: 设置关键指标的监控和告警
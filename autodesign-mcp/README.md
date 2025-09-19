# LiblibAI MCP Server

这是一个用于LiblibAI图像生成API的MCP (Model Context Protocol) 服务器，提供了完整的图像生成功能封装。

## 功能特性

- 🎨 **设计模板支持**: 内置多种产品设计模板（金属、木质、塑料、织物等）
- 🚀 **星流Star-3 Alpha**: 支持最新的星流模型进行文生图和图生图
- 🔧 **自定义模型**: 支持LiblibAI平台上的自定义模型调用
- ⏱️ **异步处理**: 支持异步生图和轮询等待完成
- 🔐 **安全认证**: 完整的API签名验证机制
- 📊 **状态监控**: 实时查询生图进度和结果

## 安装配置

### 1. 安装依赖

```bash
npm install
```

### 2. 环境变量配置

创建 `.env` 文件并配置以下环境变量：

```env
LIBLIB_ACCESS_KEY=your_access_key_here
LIBLIB_SECRET_KEY=your_secret_key_here
LIBLIB_BASE_URL=https://openapi.liblibai.cloud
```

### 3. 获取API密钥

1. 访问 [LiblibAI开放平台](https://www.liblib.art/apis)
2. 注册并登录账号
3. 领取试用积分或购买API积分
4. 获取AccessKey和SecretKey

### 4. 构建和运行

```bash
# 构建项目
npm run build

# 运行服务器
npm start

# 开发模式
npm run dev
```

## MCP工具说明

### 1. test_liblib_connection
测试LiblibAI API连接状态

```json
{
  "name": "test_liblib_connection",
  "arguments": {}
}
```

### 2. list_design_templates
列出所有可用的设计模板

```json
{
  "name": "list_design_templates",
  "arguments": {}
}
```

### 3. generate_design_image
使用设计模板生成图片（基于星流Star-3 Alpha）

```json
{
  "name": "generate_design_image",
  "arguments": {
    "prompt": "一个现代简约的水杯设计",
    "template_id": "product_metal",
    "width": 1024,
    "height": 1024,
    "img_count": 1,
    "wait_for_completion": true,
    "max_wait_seconds": 180
  }
}
```

**可用模板ID:**
- `product_metal`: 金属产品设计
- `product_wood`: 木质产品设计
- `product_plastic`: 塑料产品设计
- `product_fabric`: 织物产品设计
- `ui_modern`: 现代UI设计
- `logo_minimalist`: 简约Logo设计

### 4. generate_text2img_advanced
高级文生图功能（使用自定义模型）

```json
{
  "name": "generate_text2img_advanced",
  "arguments": {
    "prompt": "beautiful landscape, mountains, sunset",
    "model_version_uuid": "your_model_version_uuid",
    "negative_prompt": "blurry, low quality",
    "width": 768,
    "height": 1024,
    "steps": 20,
    "cfg_scale": 7,
    "wait_for_completion": true
  }
}
```

### 5. check_generation_status
查询生图任务状态

```json
{
  "name": "check_generation_status",
  "arguments": {
    "generate_uuid": "your_generation_uuid"
  }
}
```

### 6. get_server_info
获取MCP服务器信息

```json
{
  "name": "get_server_info",
  "arguments": {}
}
```

## 生图状态说明

- `1`: 排队中
- `2`: 生图中
- `5`: 完成
- `6`: 失败

## 审核状态说明

- `3`: 审核通过
- 其他值: 审核中或未通过

## 错误处理

服务器会自动处理以下错误情况：

1. **认证错误**: 检查AccessKey和SecretKey是否正确
2. **网络错误**: 自动重试机制
3. **参数错误**: 详细的错误信息提示
4. **积分不足**: 返回账户余额信息

## 开发说明

### 项目结构

```
src/
├── index.ts          # MCP服务器主入口
├── liblib-client.ts  # LiblibAI API客户端
└── types.ts          # 类型定义（可选）
```

### 添加新功能

1. 在 `liblib-client.ts` 中添加新的API方法
2. 在 `index.ts` 中注册新的MCP工具
3. 更新工具的输入schema和处理逻辑

## 注意事项

1. **API限制**: 注意QPS限制和并发数限制
2. **积分消耗**: 每次生图都会消耗积分，请合理使用
3. **图片时效**: 生成的图片URL有7天有效期
4. **内容审核**: 生成的图片需要通过平台审核

## 许可证

MIT License

## 支持

如有问题，请联系LiblibAI商务：17521599324
# AI设计平台项目

## 项目概述

AI设计平台是一个基于人工智能的高端定制产品设计平台，旨在通过AI技术自动化设计流程，提高设计效率和质量。平台主要解决设计流程明确的高端定制化产品需求，包括器形设计、花纸设计、材质选择、花纸贴合、产品渲染等完整的设计流程。

## 技术架构

- **前端**: 工作流式交互 + 聊天式交互
- **后端**: Dify工作流引擎 + MCP服务集群
- **AI服务**: LiblibAI API + ComfyUI工作流
- **数据库**: PostgreSQL + Redis
- **部署**: Docker + Kubernetes

## 项目特点

- ✅ **功能解耦**: 各模块独立开发和部署
- ✅ **模块解耦**: 清晰的模块边界和接口
- ✅ **可扩展性**: 支持后续功能叠加
- ✅ **AI驱动**: 基于大模型的智能决策
- ✅ **用户友好**: 支持多种交互方式

## 文档结构

### 📋 核心文档
- [需求文档](./docs/需求文档.md) - 详细的业务需求和功能规范
- [项目架构文档](./docs/项目架构文档.md) - 系统架构设计和技术选型
- [功能模块文档](./docs/功能模块文档.md) - 各功能模块的详细说明

### 🔧 技术文档
- [工具文档](./docs/工具文档.md) - MCP工具开发和集成指南
- [Dify开发参考文档](./docs/Dify开发参考文档.md) - Dify平台开发参考

### 📁 现有资源
- [架构图](./AI设计平台架构图.txt) - 系统架构流程图
- [LiblibAI MCP](./autodesign-mcp/) - 已完成的LiblibAI MCP服务

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 本地开发环境搭建

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd AI-design-workflow
   ```

2. **启动Dify服务**
   ```bash
   # 确保Docker已启动
   docker-compose up -d
   ```

3. **配置LiblibAI MCP**
   ```bash
   cd autodesign-mcp
   npm install
   cp .env.example .env
   # 编辑.env文件，填入LiblibAI API密钥
   npm run build
   npm start
   ```

4. **访问服务**
   - Dify控制台: http://localhost:3000
   - LiblibAI MCP: http://localhost:3001

## 开发计划

### 阶段一：核心功能开发 (高优先级)
- [ ] 设计流程MCP开发
- [ ] Dify工作流配置
- [ ] 基础前端界面
- [ ] 核心设计流程验证

### 阶段二：功能完善 (中优先级)
- [ ] 文件管理MCP
- [ ] 质量评估MCP
- [ ] 用户交互优化
- [ ] 性能优化

### 阶段三：高级功能 (低优先级)
- [ ] 用户交互MCP
- [ ] 高级分析功能
- [ ] 移动端支持
- [ ] 多租户支持

## 项目结构

```
AI-design-workflow/
├── docs/                          # 项目文档
│   ├── 需求文档.md
│   ├── 项目架构文档.md
│   ├── 功能模块文档.md
│   ├── 工具文档.md
│   └── Dify开发参考文档.md
├── autodesign-mcp/               # LiblibAI MCP服务
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── README.md
├── frontend/                     # 前端应用 (待开发)
├── backend/                      # 后端服务 (待开发)
├── mcp-services/                 # 其他MCP服务 (待开发)
├── dify-configs/                 # Dify配置文件 (待开发)
├── docker-compose.yml            # Docker编排文件
├── AI设计平台架构图.txt           # 架构图
└── README.md                     # 项目说明
```

## 贡献指南

### 开发规范
- 使用TypeScript进行开发
- 遵循ESLint代码规范
- 编写完整的单元测试
- 提交前运行代码检查

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目负责人: [联系信息]
- 技术支持: [联系信息]
- 问题反馈: [Issue链接]

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。

---

**注意**: 本项目正在积极开发中，文档和功能可能会频繁更新。请定期查看最新版本的文档。
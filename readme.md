# AI设计工坊 - 智能设计平台

## 🎨 项目概述

AI设计工坊是一个基于人工智能的高端定制产品设计平台，旨在通过AI技术自动化设计流程，提高设计效率和质量。平台主要解决设计流程明确的高端定制化产品需求，包括器形设计、花纸设计、材质选择、花纸贴合、产品渲染等完整的设计流程。

### ✨ 核心特性

- 🎯 **多种交互方式**: 支持聊天式交互、工作流式交互和常用功能模块
- 🚀 **AI驱动设计**: 基于大模型的智能设计决策和自动化流程
- 🎨 **可视化界面**: 现代化的Web界面，直观易用的设计工坊体验
- 🔧 **模块化架构**: 功能解耦，支持独立开发和部署
- 📱 **响应式设计**: 适配不同设备和屏幕尺寸

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design
- **路由**: React Router
- **状态管理**: React Context

### 后端技术栈
- **AI工作流**: Dify工作流引擎
- **微服务**: MCP (Model Context Protocol) 服务集群
- **AI服务**: LiblibAI API + ComfyUI工作流
- **数据库**: PostgreSQL + Redis
- **部署**: Docker + Kubernetes

### 项目架构特点
- ✅ **功能解耦**: 各模块独立开发和部署
- ✅ **模块解耦**: 清晰的模块边界和接口
- ✅ **可扩展性**: 支持后续功能叠加
- ✅ **AI驱动**: 基于大模型的智能决策
- ✅ **用户友好**: 支持多种交互方式

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn
- Git

### 本地开发环境搭建

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/AI-design-workflow.git
   cd AI-design-workflow
   ```

2. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env.local
   # 编辑环境变量文件
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   - 前端应用: http://localhost:3002
   - 开发服务器会自动打开浏览器

### MCP服务配置 (可选)

1. **配置LiblibAI MCP**
   ```bash
   cd autodesign-mcp
   npm install
   cp .env.example .env
   # 编辑.env文件，填入LiblibAI API密钥
   npm run build
   npm start
   ```

2. **配置Dify集成**
   ```bash
   cd dify-integration
   npm install
   cp .env.example .env
   # 配置Dify相关环境变量
   ```

## 📱 功能模块

### 🏠 主页
- **产品展示**: 轮播图展示平台核心功能
- **简洁设计**: 专注于产品展示，移除冗余功能卡片

### 🎨 设计工坊
通过导航栏的"设计工坊"入口访问三种创作方式：

#### 💬 聊天式交互
- 自然语言对话式设计
- AI智能理解设计需求
- 实时设计建议和反馈

#### 🔄 工作流式交互
- 结构化的设计流程
- 步骤化的设计指导
- 可视化的工作流管理

#### 💡 常用功能
- 专业AI设计工具集
- 打光渲染、材质更换
- 配色方案等实用功能

## 📁 项目结构

```
AI-design-workflow/
├── frontend/                     # React前端应用
│   ├── src/
│   │   ├── components/          # 可复用组件
│   │   │   └── Header.tsx       # 导航栏组件
│   │   ├── pages/              # 页面组件
│   │   │   ├── HomePage.tsx    # 主页
│   │   │   └── FeaturesPage.tsx # 设计工坊页面
│   │   ├── contexts/           # React Context
│   │   ├── services/           # API服务
│   │   └── utils/              # 工具函数
│   ├── package.json
│   └── vite.config.ts
├── autodesign-mcp/              # LiblibAI MCP服务
│   ├── src/
│   ├── dist/
│   └── package.json
├── dify-integration/            # Dify集成服务
│   ├── src/
│   └── package.json
├── docs/                        # 项目文档
│   ├── 需求文档.md
│   ├── 项目架构文档.md
│   ├── 功能模块文档.md
│   └── 前端开发文档.md
├── .gitignore                   # Git忽略文件
└── README.md                    # 项目说明
```

## 🔧 开发指南

### 代码规范
- 使用TypeScript进行开发
- 遵循ESLint代码规范
- 使用Prettier格式化代码
- 编写完整的组件文档

### 提交规范
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 开发流程
1. 从main分支创建功能分支
2. 完成功能开发和测试
3. 提交Pull Request
4. 代码审查通过后合并

## 📋 开发计划

### ✅ 已完成功能
- [x] 前端基础架构搭建
- [x] 主页设计和实现
- [x] 设计工坊页面
- [x] 导航栏和路由配置
- [x] 响应式布局设计

### 🚧 进行中
- [ ] 聊天式交互功能
- [ ] 工作流式交互功能
- [ ] 常用功能模块开发

### 📅 计划中
- [ ] 用户认证系统
- [ ] 设计历史管理
- [ ] 文件上传和管理
- [ ] AI模型集成
- [ ] 性能优化

## 🤝 贡献指南

我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码

### 如何贡献
1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT License 许可证。详情请查看 [LICENSE](LICENSE) 文件。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 邮箱: [your-email@example.com]
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/AI-design-workflow/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-username/AI-design-workflow/discussions)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和设计师！

---

**⚠️ 注意**: 本项目正在积极开发中，功能和文档可能会频繁更新。建议定期查看最新版本的文档和发布说明。

**🌟 如果这个项目对您有帮助，请给我们一个Star！**
# igCircle Blog Client

一个基于 Next.js 15 和 Chakra UI 构建的现代化技术博客前端应用。

## 🚀 项目概述

igCircle Blog Client 是一个功能完整的博客前端应用，提供了文章浏览、搜索、分类、标签、用户认证等完整的博客功能。项目采用现代化的技术栈，支持服务端渲染(SSR)、响应式设计和暗黑模式。

[博客地址](https://www.igcricle.top/blog)

## ✨ 主要功能

### 📖 文章系统

- **文章浏览**: 支持分页浏览所有文章
- **文章详情**: 完整的文章内容展示，支持 Markdown 渲染
- **文章分类**: 按分类筛选和浏览文章
- **标签系统**: 多标签支持，便于文章分类和检索
- **文章搜索**: 全文搜索功能，支持标题、内容、摘要搜索
- **精选文章**: 展示推荐和热门文章
- **文章归档**: 按年月归档文章
- **阅读统计**: 文章浏览量、点赞数、分享数统计

### 👤 用户系统

- **用户注册**: 支持邮箱验证的用户注册
- **用户登录**: 安全的用户认证系统
- **密码重置**: 忘记密码功能
- **用户资料**: 个人资料管理
- **RSA 加密**: 密码传输加密保护

### 💬 评论系统

- **文章评论**: 用户可对文章进行评论
- **评论管理**: 评论的增删改查功能

### 🎨 用户体验

- **响应式设计**: 完美适配桌面端和移动端
- **暗黑模式**: 支持明暗主题切换
- **现代化 UI**: 基于 Chakra UI 的精美界面
- **加载优化**: 服务端渲染和客户端优化
- **错误处理**: 完善的错误边界和错误处理机制

## 🛠️ 技术栈

### 核心框架

- **Next.js 15**: React 全栈框架，支持 SSR/SSG
- **React 19**: 最新版本的 React
- **TypeScript**: 类型安全的 JavaScript 超集

### UI 组件库

- **Chakra UI 3**: 现代化的 React 组件库
- **Framer Motion**: 动画库
- **Lucide React**: 图标库

### 状态管理

- **Zustand**: 轻量级状态管理库
- **SWR**: 数据获取和缓存库

### Markdown 处理

- **React Markdown**: Markdown 渲染
- **Remark/Rehype**: Markdown 处理插件生态
- **Prism React Renderer**: 代码高亮
- **React Syntax Highlighter**: 语法高亮

### 工具链

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 管理
- **Lint-staged**: 暂存文件检查

### 安全

- **JSEncrypt**: RSA 加密
- **Node Forge**: 加密工具库

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── about/             # 关于页面
│   ├── archive/           # 文章归档页面
│   ├── articles/          # 文章相关页面
│   ├── categories/        # 分类页面
│   ├── login/             # 登录页面
│   ├── profile/           # 用户资料页面
│   ├── search/            # 搜索页面
│   ├── tags/              # 标签页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── providers.tsx      # 全局 Provider
├── components/             # React 组件
│   ├── Archive/           # 归档组件
│   ├── ArticleCard/       # 文章卡片组件
│   ├── ArticleList/       # 文章列表组件
│   ├── Articles/          # 文章相关组件
│   ├── Auth/              # 认证相关组件
│   ├── Comments/          # 评论组件
│   ├── Layout/            # 布局组件
│   ├── MarkdownRenderer/  # Markdown 渲染组件
│   └── ui/                # 基础 UI 组件
├── contexts/              # React Context
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具库
│   ├── api/               # API 客户端
│   ├── error-handler.ts   # 错误处理
│   ├── store.ts           # 状态管理
│   └── utils.ts           # 工具函数
└── types/                 # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:3000/blog` 启动。

### 构建生产版本

```bash
npm run build
npm run start
# 或
yarn build
yarn start
```

## 📝 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 检查
- `npm run lint:fix` - 自动修复 ESLint 问题
- `npm run format` - 格式化代码
- `npm run format:check` - 检查代码格式

## 🏗️ 架构设计

### API 层设计

项目采用分层架构，API 层使用统一的 `BaseApiClient` 类处理：

- HTTP 请求封装
- 错误处理和重试机制
- 认证 token 管理
- 请求/响应拦截

### 状态管理

使用 Zustand 进行状态管理，主要包括：

- 用户认证状态
- 主题设置
- 全局配置

### 类型安全

完整的 TypeScript 类型定义，包括：

- API 请求/响应类型
- 组件 Props 类型
- 业务数据模型类型

### 错误处理

多层次错误处理机制：

- 全局错误边界
- API 层错误处理
- 组件级错误处理
- 用户友好的错误提示

## 🎨 主题系统

项目支持完整的主题系统：

- 明暗模式切换
- 自定义颜色配置
- 响应式设计适配
- 语义化颜色 tokens

## 🔒 安全特性

- **RSA 加密**: 密码传输加密
- **Token 认证**: JWT token 认证机制
- **XSS 防护**: Markdown 内容安全渲染
- **CSRF 防护**: 请求安全验证

## 📱 响应式设计

项目完全支持响应式设计：

- 移动端优先的设计理念
- 灵活的网格布局系统
- 自适应的组件设计
- 触摸友好的交互体验

## 🔧 开发工具

### 代码质量

- ESLint 配置用于代码质量检查
- Prettier 配置用于代码格式化
- Husky + lint-staged 用于提交前检查

### 开发体验

- TypeScript 严格模式
- 路径别名配置 (`@/`)
- 热重载开发服务器
- 详细的错误信息和日志

## 🚀 部署

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 严格模式
- 编写有意义的提交信息
- 添加必要的测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Chakra UI](https://chakra-ui.com/) - 现代化组件库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [SWR](https://swr.vercel.app/) - 数据获取库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 [Issue](https://github.com/igCircle/igcircle-blog-client/issues)
- 邮箱: igcircle@163.com

---

⭐ 如果这个项目对你有帮助，请给它一个 star！

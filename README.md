# 宇宙中心统一认证中台前端门户 (IAM Frontend)

> **Vue 3 + Vite + Element Plus + Pinia + Vanilla CSS 高端设计系统**  
> 企业级统一身份认证与管控中台前端，采用前沿高阶科技美学设计（沉浸式深色玻璃拟态、流动光谱动效、动态响应式仪表盘），提供完整的 OIDC 授权流程、管控大盘、应用接入管理、组织架构与实时风控沙箱。

---

## 视觉与交互设计

- 🌌 **沉浸式深色工业美学**：
  - 基于 HSL 精调的专业科技灰暗色系体系，消除传统模板 AI 刻板感；
  - 纳米级细腻磨砂玻璃（Glassmorphism）、微渐变发光网格背景与呼吸光晕；
  - 精心调校的微动效（Smooth hover micro-interactions & SVG 动态呼吸灯）。
- 🖥️ **全终端自适应排版**：
  - 弹性网格响应式设计，适配桌面宽屏、笔记本与平板；
  - 暗色与科技蓝高对比度排版，清晰的可视化层级。

---

## 模块全景

1. **统一认证登录门户 (`/login`)**：
   - 品牌高阶科技登录界面；
   - 验证码动态点击刷新、一键填入管理员账号便利助手；
   - 自动识别并响应 OIDC 协议传参（`client_id`、`redirect_uri`、`response_type`）。
2. **管控大盘 (`/admin/dashboard`)**：
   - 核心运营指标卡片（总用户数、活跃会话、接入应用、风控拦截率）；
   - 近7日登录流量柱状统计；
   - 最近安全审计流水与实时风控态势。
3. **实时风控中心 (`/admin/risk-center`)**：
   - Flink + Kafka + Drools 流式风控计算引擎监控看板；
   - 实时规则定义与拦截权重展示；
   - OIDC 发现机制探针与公钥查看器。
4. **接入应用管理 (`/admin/apps`)**：
   - OIDC Client 管理（Client ID、回调白名单、Token 有效期）；
   - 密钥重置与一键单点登录全流程测试模拟。
5. **用户账号中心 (`/admin/users`)**：
   - 多维度用户检索（账号、姓名、公司、风控评级）；
   - 账号创建、编辑、密码重置与启禁停用。
6. **组织架构管理 (`/admin/company` & `/admin/dept`)**：
   - 公司板块与层级架构维护；
   - 部门树形关系展示与层级关系维护。
7. **安全审计日志 (`/admin/logs`)**：
   - 全维登录痕迹追踪（IP/属地、浏览器/系统、客户端、时间戳）；
   - 抽屉式审计详情查看（详细 UA 指纹、风控评分与归因分析）。
8. **OIDC 回调沙箱 (`/oidc-callback`)**：
   - 模拟第三方业务接入方接收 `code` 并自动请求 Token 兑换的全流程演练沙箱。

---

## 技术选型

| 模块 | 核心技术 | 说明 |
| :--- | :--- | :--- |
| **构建工具** | Vite 5.x | 秒级冷启动与 HMR 热更新 |
| **前端框架** | Vue 3 (Composition API, `<script setup>`) | 高性能响应式架构 |
| **状态管理** | Pinia | 轻量级用户会话与权限状态管理 |
| **路由导航** | Vue Router 4.x | 路由守卫与鉴权重定向 |
| **UI 组件库** | Element Plus 2.x | 深度自定制深色科技主题 |
| **网络请求** | Axios | 请求拦截、统一 Token 注入与全局错误提示 |
| **样式体系** | Vanilla CSS (Design Tokens) | 全局精准样式变量、玻璃拟态与动效 |

---

## 快速上手

### 1. 环境依赖
- **Node.js**: `v18.x` 或 `v20.x` / `v22.x`
- **npm** 或 **pnpm** / **yarn**

### 2. 安装依赖
```bash
npm install
```

### 3. 启动本地开发服务
```bash
npm run dev
```
启动后终端输出本地访问地址：`http://localhost:5173`。

### 4. 生产构建打包
```bash
npm run build
```
构建产物将输出至 `dist/` 目录。

---

## 本地访问路径索引

- **统一登录认证入口**：`http://localhost:5173/login`
- **中台管理控制台**：`http://localhost:5173/admin/dashboard`
- **实时风控流中心**：`http://localhost:5173/admin/risk-center`
- **应用接入管理**：`http://localhost:5173/admin/apps`
- **OIDC 认证回调沙箱**：`http://localhost:5173/oidc-callback`

> **初始管理员凭据**：
> 账号：`admin`  
> 密码：`admin`

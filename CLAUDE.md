# IT5007 Travel Planning Agent

AI 旅行规划 Web Agent 全栈项目。用户输入旅行需求（时间、目的地、人数），
Agent 自动浏览携程/去哪儿/Google Flights 等网站，搜索比价，
返回整理好的机票信息和推荐方案。

## 技术栈
- React + JavaScript (JSX) + HTML/CSS + Bootstrap
- Node.js + Express
- MongoDB
- Docker

## 常用命令
- 启动前端: `npm start`
- 启动后端: `npm run server`
- Docker 启动: `docker-compose up`
- 测试: `npm test`

## 项目结构
- src/components/ — React UI 组件
- src/pages/ — 页面
- server/ — Express 后端 + API 路由
- server/models/ — MongoDB 数据模型
- agent/ — Agent 核心逻辑（网页浏览、搜索、比价）

## 开发说明
- 使用 npm 作为包管理器
- 部署环境为 Docker 容器
- 前端开发时使用 `frontend-design` 和 `ui-ux-pro-max` 两个 skill 辅助
- PRD 详见项目根目录文档

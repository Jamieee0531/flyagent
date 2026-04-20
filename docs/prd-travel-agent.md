# Nomie - AI 旅行规划 Agent

## 是什么

用户通过聊天描述旅行需求，AI Agent 自动搜索比价，返回机票+酒店推荐方案并附带真实预订链接。核心卖点是多 Agent 协作架构、真实数据源集成（SerpApi Google Flights/Hotels）、和实时可视化的搜索过程。

## 典型使用场景

> **小明想五一去日本玩**
>
> 1. 小明打开 Nomie，登录账号，点击"新建旅行规划"
> 2. 聊天界面弹出，Agent 问："你好！请告诉我你的旅行计划～"
> 3. 小明输入："我想五一假期去日本东京玩5天，两个人，预算1万左右"
> 4. Agent 追问几个关键问题：
>    - "出发城市是哪里？"→ 小明："上海"
>    - "住宿偏好？民宿还是酒店？"→ 小明："酒店，交通方便的"
>    - "有特别想去的地方吗？"→ 小明："想去浅草寺和秋叶原"
> 5. 小明确认需求没问题，说："开始搜索吧！"
> 6. 屏幕右侧弹出 Agent 工作面板，小明能看到：
>    - 🔍 机票搜索 Agent — 正在搜索 Google Flights...
>    - 🔍 机票搜索 Agent — 正在搜索携程...
>    - 🏨 酒店搜索 Agent — 正在浏览 Booking.com...
>    - 📋 行程规划 Agent — 等待中...
> 7. 搜索过程中，结果卡片逐个出现（哪个 Agent 先完成哪个先显示）
> 8. 完成后生成结构化的方案卡片：
>    - **机票推荐**：Scoot SGD 1,282（往返总价）→ [点击跳转航司官网]
>    - **酒店推荐**：新宿 XX 酒店 SGD 200/晚 → [点击跳转 Booking.com]
>    - **行程表**：Day1 浅草寺→... Day2 秋叶原→...
>    - **注意事项**：签证、交通卡、天气提醒等
> 9. 小明觉得机票方案不错，点击链接跳转到航司官网完成预订

## 用户流程

```
注册/登录 → 新建对话 → 描述旅行需求 → Agent 对话确认细节
→ 4 个 Sub-agent 并行搜索（实时可视化进度，可随时停止）
→ 结果卡片逐个渲染（机票/酒店/行程/注意事项，带真实链接）
→ 收藏/保存方案 → 点击链接跳转预订平台
```

## 核心功能

1. **聊天式交互**：Lead Agent 通过多轮对话了解用户旅行需求，确认后再派发搜索
2. **真实数据源搜索**：Flight Search 通过 SerpApi 获取 Google Flights 真实价格；Hotel Search 通过 SerpApi 获取 Google Hotels 真实价格
3. **Agent 工作可视化**：实时展示 4 个 sub-agent 工作状态和进度，采用 2x2 grid 布局 + 像素风角色 sprite + 像素办公室背景
4. **结构化结果输出**：每个 sub-agent 完成后立刻渲染对应卡片（不等汇总），附带航司官网/Booking.com 真实链接
5. **行程表 + 注意事项生成**：Itinerary Planner 生成每日行程，Travel Tips 提供签证/天气/交通等实用信息
6. **用户系统**：邮箱+密码注册登录，历史 session 记录，方案收藏功能（队友 A Gateway 负责）
7. **随时停止**：用户可以随时中断 Agent 执行

## 不做的

- 不做代操作预订（用户点链接跳转后自行完成预订）
- 不做自动付款
- V1 不做对话式中途干预（执行过程中不能边跑边改需求）
- 不做 Agent 对话的中途需求修改（V1 确认后就执行，不能中途改）

## 页面结构

- **登录/注册页**：邮箱+密码登录注册
- **首页/历史页**：历史对话 session 列表，收藏的方案
- **对话页（核心页）**：聊天窗口 + Agent 工作可视化面板（具体布局待定）
- **方案详情页**：结构化展示搜索结果（机票/酒店/行程/注意事项），可收藏，可点击链接跳转

> 前端展示细节（可视化风格、组件设计等）后续单独出文档讨论。

## 技术栈

- 前端：React + JavaScript (JSX) + CSS (pixel art theme)
- 后端/Agent：基于 DeerFlow（字节跳动开源 Agent 平台）适配，Python 3.12 + LangGraph + LangChain
- 搜索 API：SerpApi（Google Flights + Google Hotels 真实数据）
- LLM：Gemini 2.5 Flash（Lead Agent + Flight/Hotel）+ GPT-4o-mini（Itinerary）
- 部署：Docker

> 技术栈可根据实际开发需要调整。

## 技术考量

- **基于 DeerFlow 架构**：采用 DeerFlow 的 ReAct 循环 + Middleware + 子 Agent 编排模式，参考 `deer-flow/deerflow-study-notes.md`
- **多 Agent 协作架构**：需要设计 sub-agent 的分工（机票搜索、酒店搜索、行程规划等）和协调机制
- **实时状态推送**：Agent 工作状态通过 SSE 流式推送到前端
- **状态机驱动的前端**：对话页使用显式状态机管理 phase 切换（chat → executing → result），消息流和 Agent 执行由 MainPage 统一控制

## 备注

- 团队 3 人
- 课程项目（IT5007）
- 界面语言目前为英语，双语切换功能待后续实现
- Agent 搜索不按用户国籍限制平台，以找到最优价格为目标
- 前端可视化风格已确定为**像素风（pixel art）**，参考 Star-Office-UI 项目，使用 Ark Pixel 字体、像素边框/阴影、warm brown 色板

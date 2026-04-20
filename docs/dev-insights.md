# Dev Insights — 踩坑与沉淀

## 2026-04-09｜本地开发网络假设陷阱

### 背景

启动 Nomie 后，浏览器注册/登录报 `Failed to fetch`，Gateway 日志完全没有收到任何请求。后端 curl 测试正常。排查了约 1 小时。

### 三个叠加的假设失效

**假设 1：`localhost` 是确定的**

代码写 `http://localhost:8080`，默认认为等于 `127.0.0.1`。但现代 macOS 浏览器优先把 `localhost` 解析为 `::1`（IPv6），而 Docker 默认只绑 IPv4（`127.0.0.1:8080`）。浏览器发出去的请求直接连不上，Gateway 日志里一条记录都没有。

**假设 2：curl 通 = 浏览器能访问**

用 `curl http://localhost:8080/health` 通过，就认为没问题。但 curl 和浏览器行为不同：
- curl 默认走 IPv4
- 浏览器走 IPv6 优先
- 浏览器还有 CORS preflight，curl 没有

**假设 3：改了代码就等于生效了**

改了 `gateway.js` fallback 为 `''`（想走 Vite 代理），但 `.env` 里 `VITE_GATEWAY_URL=http://127.0.0.1:8080` 优先级更高，悄悄把 fallback 覆盖掉，没有任何报错。

### 最终修法

- `vite.config.js` 加 proxy：`/api → http://127.0.0.1:8080`（浏览器请求走同源，Vite 在服务端转发）
- `gateway.js` BASE fallback 改为 `''`（相对路径，走代理）
- `.env` 里 `VITE_GATEWAY_URL` 清空，不覆盖 fallback

### 沉淀

> 写代码时的"应该能工作"和运行时的"真的能工作"之间，隔着一层未被验证的环境假设。每一个 `localhost`、每一个 fallback、每一个"我 curl 过了"，都是一个还没被验证的假设。

**具体规则：**
1. 前后端分离项目，Vite 开发环境一定要配 `server.proxy`，让 API 请求走同源，彻底消除 CORS 和 IP 协议版本问题。
2. 验证网络连通性必须用和目标环境一致的客户端（浏览器 DevTools Network tab），curl 不能代表浏览器。
3. 改配置前先理清优先级链（env var > 代码 fallback），确认上层没有覆盖再改下层。

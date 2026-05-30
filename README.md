# SEA Launch Copilot（Hackathon Demo）

面向 SME 的 AI 工作台 Demo：帮助品牌以 TikTok-first 策略进入东南亚市场（Demo 场景：湖南菜/中餐品牌进入新加坡）。

## 本地运行

```bash
npm install
npm run dev
```

前端：`http://localhost:5173/`  
后端：`http://localhost:3001/`

## Demo 工作流

- 首页就是 Intake + Dashboard 工作台
- 填写/预填业务信息 → 点击 Analyze Market Entry
- 默认调用 `POST /api/analyze-market-entry`（后端目前返回 mock 结果）
- UI 展示：Readiness Score、Checklist、Risk Register、Localization & TikTok Launch Pack、Advisor-Ready Export

## Mock / API 切换

前端通过环境变量控制数据源：
- `VITE_DATA_MODE=api`（默认）：走后端 `/api/analyze-market-entry`
- `VITE_DATA_MODE=mock`：前端直接使用 mock JSON（不依赖后端）

示例：
```bash
VITE_DATA_MODE=mock npm run dev
```

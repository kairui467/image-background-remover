# Image Background Remover — MVP 需求文档

**版本：** v0.1
**日期：** 2026-03-19
**作者：** Kerray Li
**状态：** 草稿
**飞书原文：** https://feishu.cn/docx/Pxi7dTh9QoVS08xlV2tc3glLnBb

---

## 1. 产品概述

### 1.1 产品定位

一个轻量级在线图片背景去除工具，用户上传图片后即可一键去除背景，无需注册、无需安装，处理结果直接下载。

### 1.2 目标用户

- 电商卖家（商品图处理）
- 设计师（快速抠图）
- 普通用户（证件照、头像处理）

### 1.3 核心价值主张

- 快：秒级处理
- 简：无注册、无登录、无存储
- 私：图片不落地，处理完即销毁

---

## 2. 技术架构

| 层级 | 技术选型 | 说明 |
| --- | --- | --- |
| 前端框架 | Next.js 14 (App Router) | SSR + API Routes 一体化 |
| UI 组件 | Tailwind CSS + shadcn/ui | 快速搭建，风格统一 |
| AI 能力 | Remove.bg API | 背景去除核心能力 |
| 图片处理 | 纯内存（Buffer） | 不写磁盘，不落存储 |
| 部署 | Cloudflare Pages + Workers | 全球 CDN，边缘计算 |
| 域名/SSL | Cloudflare | 自动 HTTPS |

---

## 3. 功能需求

### 3.1 核心功能（Must Have）

#### F1 - 图片上传
- 支持拖拽上传
- 支持点击选择文件
- 支持格式：JPG、PNG、WebP
- 文件大小限制：≤ 10MB（Remove.bg 限制）
- 上传前客户端校验格式和大小，给出友好提示

#### F2 - 背景去除处理
- 调用 Remove.bg API 处理图片
- 处理过程显示 loading 状态
- 处理失败给出明确错误提示（如额度不足、格式不支持）
- 全程内存处理，不写入任何存储

#### F3 - 结果展示
- Before / After 对比展示（左右滑动对比）
- 透明背景用棋盘格图案展示
- 支持缩放预览

#### F4 - 下载
- 下载格式：PNG（保留透明通道）
- 一键下载，文件名：`removed-bg-{原文件名}.png`

### 3.2 辅助功能（Should Have）

#### F5 - 使用引导
- 首页展示使用步骤（3步：上传 → 处理 → 下载）
- 示例图片展示效果

#### F6 - 多语言
- 默认中文
- 支持英文切换（i18n）

### 3.3 暂不做（Won't Have in MVP）

- 用户注册/登录
- 历史记录
- 批量处理
- 背景替换（换背景色/图）
- 付费订阅系统

---

## 4. 非功能需求

| 指标 | 目标值 |
| --- | --- |
| 页面首屏加载 | ≤ 2s |
| 图片处理响应时间 | ≤ 5s（依赖 Remove.bg） |
| 移动端适配 | 响应式，支持手机操作 |
| 浏览器兼容 | Chrome / Safari / Firefox 最新版 |
| 隐私合规 | 图片不落地，页面关闭后无残留 |

---

## 5. 页面结构

```
/                   首页（上传 + 处理 + 下载）
/about              关于页（可选）
```

MVP 只需一个页面搞定所有核心流程。

### 首页布局

```
[Header] Logo + 产品名 + 语言切换

[Hero区]
  标题：一键去除图片背景
  副标题：免费、快速、隐私安全

[上传区]
  拖拽框 / 点击上传
  支持格式说明

[处理结果区]（上传后显示）
  Before / After 对比
  下载按钮

[Footer] 版权信息
```

---

## 6. API 设计

### POST /api/remove-bg

**请求**
```
Content-Type: multipart/form-data
Body: image (File)
```

**响应（成功）**
```
Content-Type: image/png
Body: 处理后的图片二进制流
```

**响应（失败）**
```json
{
  "error": "错误描述",
  "code": "INVALID_FORMAT | FILE_TOO_LARGE | API_QUOTA_EXCEEDED | UNKNOWN"
}
```

---

## 7. Remove.bg API 集成说明

- API Key 通过环境变量注入：`REMOVE_BG_API_KEY`
- 免费额度：50次/月（测试够用）
- 付费：$0.2/张（高清）或按订阅
- 文档：https://www.remove.bg/api

---

## 8. 里程碑计划

| 阶段 | 内容 | 预计时间 |
| --- | --- | --- |
| M1 | 项目初始化 + 基础页面框架 | Day 1 |
| M2 | 上传组件 + API Route 联调 | Day 2 |
| M3 | Before/After 展示 + 下载 | Day 3 |
| M4 | UI 打磨 + 移动端适配 | Day 4 |
| M5 | Cloudflare 部署 + 域名配置 | Day 5 |

**目标：5个工作日内上线 MVP**

---

## 9. 风险与注意事项

| 风险 | 说明 | 应对 |
| --- | --- | --- |
| Remove.bg 免费额度耗尽 | 50次/月，测试期可能不够 | 准备付费账号或备用 API key |
| Cloudflare Workers 限制 | 单次请求 CPU 时间 10ms（免费版） | 使用 Paid Workers 或 Pages Functions |
| 大文件传输超时 | 10MB 图片在边缘节点可能超时 | 限制文件大小，前端强校验 |
| Remove.bg 服务不稳定 | 第三方依赖 | 加超时处理 + 友好错误提示 |

---

*文档持续更新，以最新版本为准。*

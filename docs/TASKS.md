# 开发任务拆分

基于 PRODUCT_DESIGN.md，按优先级拆分为可执行的开发任务。

---

## Phase 1 - MVP（本周）

### Task 1: 个人中心页面重构
**文件**: `src/app/profile/page.tsx`  
**优先级**: P0  
**工作量**: 3h

- [ ] 显示用户头像、名称、邮箱
- [ ] 额度显示（进度条：已用 / 总量）
- [ ] 订阅状态（方案名称、到期时间）
- [ ] 使用记录列表（时间、操作、消耗）
- [ ] 升级入口按钮（跳转 /pricing）
- [ ] 退出登录按钮

**API 依赖**:  
- `GET /api/user/profile` → 返回用户信息 + 额度 + 订阅状态
- `GET /api/user/records` → 返回使用记录列表

---

### Task 2: 用户 Profile API
**文件**: `src/app/api/user/profile/route.ts`  
**优先级**: P0  
**工作量**: 2h

- [ ] 返回当前用户信息
- [ ] 返回 credits（剩余额度）
- [ ] 返回 planType、planExpiresAt
- [ ] 返回 totalCreditsUsed

```typescript
// 返回格式
{
  user: { id, name, email, image, createdAt },
  credits: { remaining: 3, total: 3, used: 0 },
  plan: { type: "FREE", expiresAt: null }
}
```

---

### Task 3: 使用记录 API
**文件**: `src/app/api/user/records/route.ts`  
**优先级**: P0  
**工作量**: 1h

- [ ] 返回当前用户的 ImageRecord 列表
- [ ] 支持分页（page, limit）
- [ ] 按时间倒序排列

---

### Task 4: 额度用完拦截提示
**文件**: `src/app/page.tsx`  
**优先级**: P0  
**工作量**: 1h

- [ ] 未登录用户点击上传区域 → 弹出登录提示
- [ ] 已登录但额度为 0 → 弹出升级提示弹窗
- [ ] 弹窗包含：提示文案 + [查看定价] 按钮

---

### Task 5: 定价页面重构
**文件**: `src/app/pricing/page.tsx`  
**优先级**: P0  
**工作量**: 3h

- [ ] 三栏方案卡片（免费版、专业版⭐、企业版）
- [ ] 月度/年度切换 Tab（切换后价格变化）
- [ ] 积分包选项（4 个档位）
- [ ] 已登录用户高亮当前方案
- [ ] 付费按钮（暂时链接到 PayPal 占位或弹出"即将上线"提示）
- [ ] FAQ 部分（5-6 个常见问题）
- [ ] 底部信任背书（安全支付、退款承诺）

---

## Phase 2 - 订阅管理（第 2 周）

### Task 6: Prisma Schema 扩展
**文件**: `prisma/schema.prisma`  
**优先级**: P1  
**工作量**: 1h

- [ ] User 表添加 `totalCreditsUsed` 字段
- [ ] 新增 `Subscription` 表（订阅记录）
- [ ] 新增 `Payment` 表（支付记录）
- [ ] 运行 `prisma migrate`

---

### Task 7: 订阅管理 API
**文件**: `src/app/api/subscribe/route.ts`（扩展）  
**优先级**: P1  
**工作量**: 2h

- [ ] `POST /api/subscribe` → 创建订阅记录（现在直接更新 credits）
- [ ] `DELETE /api/subscribe` → 取消订阅
- [ ] `GET /api/subscribe` → 获取当前订阅

---

### Task 8: 支付集成（PayPal）
**文件**: `src/app/api/payment/`  
**优先级**: P1  
**工作量**: 4h

- [ ] `POST /api/payment/create` → 创建 PayPal 订单
- [ ] `POST /api/payment/capture` → 确认支付
- [ ] `POST /api/payment/webhook` → 处理 PayPal 回调
- [ ] 支付成功后更新 credits 和订阅状态

---

### Task 9: 账单历史页面
**文件**: `src/app/profile/billing/page.tsx`  
**优先级**: P1  
**工作量**: 2h

- [ ] 显示历史支付记录
- [ ] 显示金额、方案、状态、时间
- [ ] 下载发票按钮（生成简单 PDF）

---

## Phase 3 - 体验优化（第 3 周）

### Task 10: FAQ 独立页面
**文件**: `src/app/faq/page.tsx`  
**优先级**: P2  
**工作量**: 2h

- [ ] 分类展示常见问题
- [ ] 手风琴展开/收起
- [ ] 页面 SEO 优化（title, description）

---

### Task 11: 首页转化优化
**文件**: `src/app/page.tsx`  
**优先级**: P2  
**工作量**: 2h

- [ ] 显示"免费 3 次"徽章
- [ ] 添加效果对比图（before/after）
- [ ] 添加用户数量/处理图片数量统计
- [ ] 导航栏添加 [定价] [登录] 按钮

---

### Task 12: 邮件通知
**文件**: `src/lib/email.ts`  
**优先级**: P2  
**工作量**: 2h

- [ ] 注册欢迎邮件（含 3 次免费提示）
- [ ] 额度不足提醒邮件（剩余 1 次时触发）
- [ ] 订阅确认邮件
- [ ] 订阅到期提醒邮件

---

## 文件结构总览

```
src/
├── app/
│   ├── api/
│   │   ├── user/
│   │   │   ├── profile/route.ts     # Task 2
│   │   │   └── records/route.ts     # Task 3
│   │   ├── subscribe/route.ts       # Task 7
│   │   └── payment/
│   │       ├── create/route.ts      # Task 8
│   │       ├── capture/route.ts     # Task 8
│   │       └── webhook/route.ts     # Task 8
│   ├── profile/
│   │   ├── page.tsx                 # Task 1
│   │   └── billing/page.tsx         # Task 9
│   ├── pricing/page.tsx             # Task 5
│   ├── faq/page.tsx                 # Task 10
│   └── page.tsx                     # Task 4, 11
├── components/
│   ├── UserMenu.tsx
│   ├── Providers.tsx
│   ├── CreditsBar.tsx               # 新增：额度进度条组件
│   ├── PricingCard.tsx              # 新增：定价卡片组件
│   └── UpgradeModal.tsx             # 新增：升级提示弹窗
└── lib/
    ├── prisma.ts
    └── email.ts                     # Task 12
```

---

## 开发顺序建议

```
Day 1: Task 2 + Task 3（API 先行）
Day 2: Task 1（个人中心页面）
Day 3: Task 4 + Task 5（定价页面 + 额度拦截）
Day 4: Task 6 + Task 7（数据库 + 订阅 API）
Day 5: Task 8（PayPal 集成）
Day 6-7: Task 9 + Task 10 + Task 11（体验优化）
```

---

## 当前状态

| Task | 状态 | 备注 |
|------|------|------|
| Task 1: 个人中心 | 🟡 部分完成 | 需重构 |
| Task 2: Profile API | ❌ 未开始 | |
| Task 3: 记录 API | ❌ 未开始 | |
| Task 4: 额度拦截 | ❌ 未开始 | |
| Task 5: 定价页面 | 🟡 部分完成 | 需重构 |
| Task 6: Schema 扩展 | ❌ 未开始 | |
| Task 7: 订阅 API | 🟡 部分完成 | 需扩展 |
| Task 8: PayPal | ❌ 未开始 | |
| Task 9: 账单历史 | ❌ 未开始 | |
| Task 10: FAQ 页面 | ❌ 未开始 | |
| Task 11: 首页优化 | ❌ 未开始 | |
| Task 12: 邮件通知 | ❌ 未开始 | |

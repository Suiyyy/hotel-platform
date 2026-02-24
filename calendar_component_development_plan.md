# Calendar Component Development Plan
# 日历组件开发计划

## Overview / 概述

This plan outlines the development of a hotel booking calendar component for the smart travel hotel booking platform. The component will be similar to Ctrip/Meituan style, with bottom popup, month scrolling, and date range selection.

本计划概述了智慧出行酒店预订平台的酒店预订日历组件开发。该组件将采用类似携程/美团的风格，具有底部弹窗、月份滚动和日期范围选择功能。

---

## Requirements Summary / 需求总结

### User Requirements / 用户需求
- Target users: Friends/small group usage
- Product goal: Smart travel hotel booking platform focused on user experience
- Deployment: Has Alibaba Cloud server and WeChat Mini Program test AppID

### V1.5 Priorities / V1.5 优先级
1. **Calendar Component (Must-have now)** - Let users actually select dates
2. Core experience optimization
3. Local testing and stabilization

### V2.0 Plan (Recorded only) / V2.0 计划（仅记录）
1. Search page reference Ctrip modification
2. List page top search bar, filter area
3. Reduce AI feel & beautify interface
4. Call Gemini API
5. Show new hotel/price changes after录入
6. Deploy to server
7. Add more features

---

## Calendar Component Specifications / 日历组件规格

### 1. Basic Interaction / 基础交互

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Popup Style / 弹窗样式 | Bottom slide-out (Ctrip/Meituan style) 底部滑出（携程/美团风格） |
| Selection Flow / 选择流程 | Select check-in date first, then check-out date on same interface 先选入住日期，再在同一界面选离店日期 |
| Confirmation / 确认方式 | Show "Complete (X nights)" on button, click to close 按钮显示"完成（X晚）"，点击关闭 |
| Close Method / 关闭方式 | Only click bottom "Complete" button to close 仅点击底部"完成"按钮关闭 |

### 2. Date Selection / 日期选择

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Selectable Range / 可选范围 | Any date (no restrictions) 任意日期（无限制） |
| Stay Duration / 住宿天数 | No limit (can be 1 night or more) 不限制（可以选1天或更多） |
| Default Value / 默认值 | Today + Tomorrow when opening 打开时默认选中今天+明天 |
| Error Handling / 错误处理 | Cannot select check-out date earlier than check-in date 不允许选择早于入住日期的离店日期 |

### 3. Month Display / 月份展示

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Display Mode / 显示方式 | Show multiple months at once, scrollable vertically 一次显示多个月，可以上下滚动 |
| Month Title / 月份标题 | "February 2026" format "2026年2月"格式 |
| Popup Height / 弹窗高度 | 2/3 of screen height 占屏幕高度的 2/3 |
| Weekday Header / 星期标题 | "日 一 二 三 四 五 六" (Sunday leftmost) |
| Month Switching / 月份切换 | Only rely on vertical scrolling 只依靠上下滚动 |

### 4. Visual Indicators / 视觉标识

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Today Indicator / 今天标识 | Circle highlight + "今天" text in current date cell 圆圈高亮 + 当天的那一格显示"今天" |
| Check-in Date / 入住日期 | Dark blue fill + "入住" text 深蓝色填充 + "入住"文字 |
| Check-out Date / 离店日期 | Dark blue fill + "离店" text 深蓝色填充 + "离店"文字 |
| Middle Dates / 中间日期 | Light blue background connecting 浅蓝色背景连接 |
| Selected Display / 已选显示 | Only show in input box after closing, no display in popup 关闭后显示在输入框，弹窗内不显示 |

### 5. Tips & Prompts / 提示信息

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Nights Indicator / 晚数提示 | Show "X nights" tag above calendar 在日历上方显示"X晚"标签 |
| Incomplete Selection / 未完成选择 | Show "Please select check-out date" tooltip 显示"请选择离店日期"提示 |
| Button State / 按钮状态 | Grayed out and disabled when selection incomplete 未选择完整时，按钮置灰不可点击 |

### 6. Holidays & Weekends / 节假日与周末

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Weekend Display / 周末显示 | Simple weekend indicator (V1.5) 先用简单的周末标识（V1.5） |
| Weekend Color / 周末颜色 | Red (Saturday/Sunday) 红色（周六日） |
| Holidays / 节假日 | Add in V2.0 V2.0再加 |

### 7. Quick Actions / 快捷操作

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Quick Options / 快捷选项 | No "Today" button, only show "今天" in current date cell 没有"今天"按钮，只有当天的那一格显示"今天" |
| Quick Option Position / 快捷选项位置 | N/A 不适用 |

### 8. Price Display / 价格显示

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Show Price / 显示价格 | No price display in V1.5 V1.5先不显示价格 |
| Price Source / 价格来源 | N/A 不适用 |
| Price Position / 价格位置 | N/A 不适用 |

### 9. Style & Theme / 风格与主题

| Item / 项目 | Specification / 规格 |
|-------------|----------------------|
| Overall Style / 整体风格 | Clean & modern (Ctrip/Meituan style) 简洁现代（携程/美团风格） |
| Color Scheme / 颜色方案 | Blue theme (current project main color) 蓝色系（当前项目主色调） |

---

## Development Phases / 开发阶段

### Phase 1: Core Calendar Structure / 阶段1：核心日历结构
- [x] Create Calendar component file structure
- [x] Implement month grid display
- [x] Add weekday headers
- [x] Implement vertical scrolling for multiple months
- [x] Add month titles in "2026年2月" format

**Complexity / 复杂度**: Simple / 简单
**Status / 状态**: ✅ Completed / 已完成

### Phase 2: Date Selection Logic / 阶段2：日期选择逻辑
- [x] Implement check-in date selection
- [x] Implement check-out date selection (must be after check-in)
- [x] Add default selection (today + tomorrow)
- [x] Implement selection state management
- [x] Add "Please select check-out date" prompt
- [x] Handle clicking selected check-in date (cancel and restart)
- [x] Handle clicking selected check-out date (re-select)

**Complexity / 复杂度**: Moderate / 中等
**Status / 状态**: ✅ Completed / 已完成

### Phase 3: Visual Styling / 阶段3：视觉样式
- [ ] Implement today indicator (circle + "今天")
- [ ] Implement check-in date style (dark blue fill + "入住")
- [ ] Implement check-out date style (dark blue fill + "离店")
- [ ] Implement middle dates light blue background
- [ ] Add weekend color (red for Sat/Sun)
- [ ] Implement blue theme color scheme

**Complexity / 复杂度**: Moderate / 中等

### Phase 4: Popup & Interaction / 阶段4：弹窗与交互
- [ ] Implement bottom slide-out popup
- [ ] Add "X nights" indicator tag
- [ ] Implement bottom "Complete (X nights)" button
- [ ] Add button disabled state when selection incomplete
- [ ] Implement popup close on button click
- [ ] Add mask layer interaction

**Complexity / 复杂度**: Moderate / 中等

### Phase 5: Integration & Testing / 阶段5：集成与测试
- [ ] Integrate with search page
- [ ] Replace current simple date picker
- [ ] Test on WeChat Mini Program
- [ ] Test on H5
- [ ] Test edge cases
- [ ] Performance optimization

**Complexity / 复杂度**: Moderate / 中等

---

## File Structure / 文件结构

```
hotel-user-app/src/
├── components/
│   └── Calendar/
│       ├── index.jsx          # Main calendar component
│       └── index.scss         # Calendar styles
├── pages/
│   └── search/
│       └── index.jsx          # Integrate calendar here
```

---

## Technical Implementation Notes / 技术实现要点

### Platform Compatibility / 平台兼容性
- Use Taro components for cross-platform support
- Handle both `onClick` and `onTap` events
- Use Taro storage API instead of localStorage

### State Management / 状态管理
- Use React useState for component state
- Pass selected dates back to parent via props/callback
- Use Taro event system

### Performance / 性能
- Virtual scrolling for many months (if needed)
- Memoization for date calculations
- Lazy loading for month data

---

## Questions for Confirmation / 需要确认的问题

### Q1: Quick Options / 快捷选项
- Where should the "Today" button be placed? (Top of calendar? Above complete button?)
- "今天"按钮应该放在哪里？（日历顶部？完成按钮上方？）

### Q2: Price Display / 价格显示
- Should we show prices in V1.5? Or add in V2.0?
- If show, where to get price data? (From mock hotels? Random for demo?)
- V1.5是否显示价格？还是V2.0再加？
- 如果显示，价格数据从哪来？（从Mock酒店数据？还是随机演示？）

### Q3: Clicking Selected Dates / 点击已选日期
- Clicking selected check-in date: Cancel selection and restart
- Clicking selected check-out date: Re-select check-out date
- 点击已选中的入住日期：取消选择并重新开始
- 点击已选中的离店日期：重新选择离店日期

### Q4: Month Switching / 月份切换
- Only rely on vertical scrolling, no arrow buttons
- 只依靠上下滚动，不使用箭头按钮

---

## Next Steps / 下一步

1. Review and confirm this plan
2. Answer the 4 questions above
3. I'll adjust the plan based on your feedback
4. Start implementation phase by phase

---

## V2.0 Features (Recorded) / V2.0 功能（仅记录）

1. Search page reference Ctrip modification / 搜索页参考携程进行修改
2. List page top search bar, filter area / 列表页上方的搜索栏，筛选区域
3. Reduce AI feel & beautify interface / 降低页面ai味&美化界面
4. Call Gemini API / 调用gemini api
5. Show new hotel/price changes after录入 / 录入新酒店/价格变化后，展示新录入/价格变化
6. Deploy to server / 部署到服务器
7. Add more features / 添加更多功能

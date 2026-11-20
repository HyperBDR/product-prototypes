# HyperBDR 智能体集成原型

基于 `newmuse` 的 Navbar、Sidebar、Breadcrumb、app-container、Element UI 表单与表格视觉，在“设置”之后新增“智能体集成”顶部菜单，不使用左侧菜单；内容区域占满可用宽度。

## 页面内容

- 安装 HyperBDR skills 说明：三步说明、安装命令 `npx skills add hyperbdr`、复制命令、安全提示和支持的智能体环境。
- CLI Access Token 管理：令牌名称、脱敏前缀、创建/过期/最近使用时间、有效/已禁用/已过期状态。
- 创建令牌弹窗：名称、有效期 7/30/90/180/365 天、描述；创建后只显示一次完整 `hbd_pat_...` 明文。
- 令牌策略支持确认后启用、禁用和删除；删除不可恢复，明文不会出现在列表中。
- 所有操作为本地 mock，不调用后端接口。

## 方案依据

- `docs/plans/0009-cli-token-authorization.md`
- `newmuse/src/styles/variables.scss`
- `newmuse/src/styles/index.scss`
- `newmuse/src/styles/element-ui.scss`
- `newmuse/src/views/layout/components/Navbar.vue`
- `newmuse/src/views/layout/components/Sidebar.vue`
- `newmuse/src/views/setUp/global.vue`

文档中的关键安全语义已转成页面说明：Token 使用 `hbd_pat_` 前缀；服务端只保存 hash；创建、查询和管理使用网页登录/MFA 会话；令牌有有效期且不会自动刷新；列表只展示脱敏前缀；完整令牌只展示一次。

## 预览

入口为 `index.html`，可直接打开或通过原型仓库静态服务访问。`preview.png` 为当前预览截图。

## 排版调整

主按钮使用 flex 居中、14px 字号、固定行高和统一的 38px 高度，避免标题字号传递或上下 padding 挤压文字；弹窗取消和确认按钮保持相同高度。标准桌面宽度下卡片纵向排列，确保令牌表格能够显示全部列；宽屏使用双列布局。

## 令牌策略

- 创建令牌前会提示“创建后完整令牌只显示一次”，确认后才生成。
- 有效令牌可以禁用；禁用后保留记录，可在确认后重新启用。
- 可以删除令牌记录；删除前显示不可恢复提示，删除后需创建新令牌。
- 支持确认后批量禁用全部有效令牌。
- 已过期令牌不能启用，只能删除并重新创建。

本轮交互按产品反馈扩展为可逆的启用/禁用与永久删除，不直接等同于 0009 文档中不可逆的 revoked。正式后端需要补充禁用状态与删除失效语义；本原型仅演示本地状态，不修改真实凭据。创建确认会展示名称、有效期及预计过期时间；取消、关闭和 Escape 均不提交操作。关闭明文结果弹窗后清空临时明文。

## 中英文支持

页面参考 `network-configuration` 的本地 `translations.js` + `i18n.js` 结构：顶部语言按钮可在中文和英文之间切换，语言选择保存在 localStorage，刷新后保持。英文文案以 `newmuse/src/lang/en.js` 为来源，复用了 `route`、`form`、`table`、`global`、状态和安全相关术语；智能体集成及 Token 策略的新文案也放在同一双语字典中。

语言切换同时更新安装说明、令牌表头、状态、创建弹窗、确认提示、操作按钮及反馈消息。

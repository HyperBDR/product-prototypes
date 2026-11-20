# 云同步网关升级管理原型

入口为 index.html。纯 HTML、内联 CSS 和原生 JavaScript，无运行时框架、无后端请求，可直接打开，也可从原型仓库静态服务预览。

## 样式来源

- newmuse/src/styles/variables.scss、index.scss、element-ui.scss
- newmuse/src/views/layout/components/Navbar.vue、Sidebar.vue
- newmuse/src/components/CustomTable/index.vue
- newmuse/src/components/CustomDetail/jobDetailFrontEnd.vue（getUpgradeLog 分支，嵌套时间线）
- newmuse/src/views/operation/upgradeGateway.vue、upgradeFn.vue
- newmuse/src/lang/zh.js

Logo、SVG 和 Element/FontAwesome 字体从 newmuse 复制到本原型 assets 内，运行不引用其他原型或 newmuse。单色 SVG 按源组件的 fill 覆盖规则着色。

## 演示

每个场景有 8 条网关记录：升级失败、等待升级、准备中、升级中、无需升级、升级完成、不支持升级、获取版本失败，各一条。保持原页面的最小列宽与横向滚动；小窗口可横向滚动查看右侧状态和操作，左侧名称固定。

1. 勾选等待升级或升级失败的记录，点击升级。
2. 新任务立即进入准备中，6 秒后升级中，16 秒后升级完成；列表版本列显示为 -，升级后的版本保留在升级记录中。
3. 准备中可点击取消；网关返回等待升级，升级记录保留已取消任务。
4. 查看打开该网关自己的升级记录；详情可从列表或记录进入，支持刷新、收起和独立日志滚动。
5. 容灾/回切数据独立，回切使用源码的紫红色主题。
6. 支持名称/状态搜索、允许升级筛选、排序、分页、全选、侧栏折叠。

初始的准备中/升级中记录保持该状态，便于逐一查看；只有新创建的模拟任务自动推进。演示数据保存在 localStorage，刷新可继续任务。用 URL 参数 ?reset=1 重新加载可恢复所有初始状态。所有日期显示 GMT+08:00。初始历史记录日期为示例，新增记录使用当前时间。

## 验证

在本目录执行 node --test interactions.test.mjs。覆盖状态机、取消、重试资格、任务历史、场景隔离、刷新恢复、资源完整性。仓库根目录执行 npm run validate 和 npm run generate。

## 细节校准

- 固定列使用独立的连续阴影层，参数为源码的 5px 0 10px 0 rgba(0,0,0,.08)。与 Element UI 一致，滚动至最左侧或没有横向溢出时不显示，向右滚动时显示；不逐单元格绘制阴影。
- 图标字体使用 main.js 实际导入的 element-ui/lib/theme-chalk 资源，而不是未启用的 custom-theme 字体。
- 任务日志按 getUpgradeLog 分支显示“外层任务 + 内层日志”，每行是 [时间 GMT+08:00] - 原始文本，支持多行；普通 info 节点为灰色，失败节点为红色。没有源码中不存在的逐条复制按钮。
- 日志区域高度、摘要行高、分隔线、刷新按钮及嵌套缩进来自 index.scss；首次打开滚动到底部，手动刷新滚动到顶部。
- 日志内容仍是本地示例，部分英文措辞参考 exporter/logcollector/upgrade.go 的输出模板，不是对线上任务的真实日志抓取。

- 版本列规则：获取版本失败、升级完成均显示 -；容灾和回切、初始数据和操作后状态采用同一规则。升级记录中的升级前/后版本不受影响。

## 当前展示范围

按最新要求，回切标签保留但禁用，不可点击；当前原型仅开放容灾列表。


## 中英文

原型参考 `network-configuration` 的 `translations.js` / `i18n.js` 结构，新增本地 `translations.js` 和 `i18n.js`。语言菜单位于顶栏，默认简体中文，可切换 English；语言偏好保存在 localStorage，静态文案和动态状态、筛选、记录、详情、分页及提示会同步刷新。英文文案按 `newmuse/src/lang/en.js` 对应翻译项整理，中文文案按 `newmuse/src/lang/zh.js` 对应翻译项整理。

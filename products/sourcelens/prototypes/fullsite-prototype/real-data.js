/* 示例数据：结构、数量、类型和版本形态取自真实环境的只读核对（技能 13 / MCP 2 / 连接 7 / 知识库 21 / 助手 29 / 环境变量集 12），名称已全部脱敏，不含任何凭证、地址、环境变量值。
   技能与 MCP 目前是全局资源（后端没有租户字段）；租户 / 多租户相关的数字仍是设计稿示意。 */
(function () {
'use strict';
const SK = (slug, desc, ver, upd, use, src) => ({ slug, name: slug, desc, ver, upd, use, src: src || 'upload' });
H.REAL = {
  TODAY: '2026-11-10',
  skills: [
    SK('architecture-evolution-framework', '分析复杂产品 / 业务 / 组织 / AI 系统的架构演进路径', '20cc0ed9ae34', '2026-07-27', 1),
    SK('architecture-governance', '评审前后治理架构决策，判断一项变更是否应该通过', '1b7d85eedbca', '2026-07-30', 1),
    SK('collaboration-conflict-resolution', '分离证据、利益与假设，分析并化解协作冲突', '018128df1b0b', '2026-07-23', 2),
    SK('billing-query-view', '查询并展示报价单、发票、票据等业务单据', '3280b4b3e061', '2026-10-14', 2),
    SK('engineering-report', '按人输出工程工作报告：完成 / 进行中 / 风险 / 评语（日报到年报）', 'e82a7402b565', '2026-10-19', 1),
    SK('frontend-ui-engineering', '（手动创建，无描述）', '1', '2026-07-16', 1, 'manual'),
    SK('insight-diagram', '为任意项目生成 UML 图、架构图与流程图', 'b41524f13658', '2026-07-25', 2),
    SK('license-cli', '通过内置命令行工具查询授权平台', '9de5539535e8', '2026-08-19', 1),
    SK('officecli', '创建、检查、校验和修改 Office 文档（docx / xlsx / pptx）', 'e831f1cead19', '2026-08-23', 1),
    SK('reasoning-architecture-framework', '多语言思考伙伴，诊断复杂的产品、业务与运营问题', 'bb8a2c728b10', '2026-07-23', 1),
    SK('sentry-cli', 'Sentry CLI：问题、事件、发布与诊断', '887cbd390525', '2026-08-17', 0),
    SK('test-quality-dashboard', '从测试管理系统采集测试数据，生成质量与业务影响报告', '6b3b7ffce978', '2026-11-04', 1),
    SK('support-ticket-research', '查询并分析授权范围内的支持工单', '695fbd1ca762', '2026-09-04', 1),
  ],
  mcp: [
    { slug: 'Biz-MCP-admin', name: 'Biz-MCP-admin', desc: '通过 URL 接入的 MCP Server（管理侧）', ver: '1', upd: '2026-10-10', use: 1, src: 'url' },
    { slug: 'Biz-MCP-user', name: 'Biz-MCP-user', desc: '通过 URL 接入的 MCP Server（用户侧）', ver: '1', upd: '2026-10-10', use: 1, src: 'url' },
  ],
  plugins: [['github', 'GitHub', '1.0.0'], ['gitlab', 'GitLab', '1.0.0'], ['feishu', '飞书', '1.0.0'], ['jira', 'Jira', '1.0.0'], ['typesafe', 'TypeSafe AI', '1.0.0']],
  conns: [
    { name: '飞书应用 A', plugin: 'feishu', kbs: ['Presales-PPT-repo', 'Presales-Project-repo', 'price-list-repo', 'Backup-Product-Docs', 'Company Knowledge Base', 'product-b-feishu-matrix', 'Project-Weekly-Report', 'compute-power-kb'] },
    { name: 'OrgMain', plugin: 'github', kbs: ['docs-product-a-repo', 'docs-product-b-repo', 'product-c-repo', '授权平台'] },
    { name: 'OrgMain', plugin: 'gitlab', kbs: ['platform-core-repo', 'product-b-repo'] },
    { name: '飞书应用 C', plugin: 'feishu', kbs: ['Projects-Manage', 'Weekly Report'] },
    { name: '飞书应用 B', plugin: 'feishu', kbs: ['kb-sample'] },
    { name: 'OrgMain', plugin: 'jira', kbs: [] },
    { name: 'DecisionAPI', plugin: 'typesafe', kbs: [] },
  ],
  uploadKbs: ['Metrics', 'sample-upload', 'Policies', 'personal-upload'],
  assistants: ['Product-A-AI-Assistant', 'Presales Assistant', 'Price Assistant', 'Industry Insight', 'Backup Product Assistant', 'Company-Knowledge-Base', 'Decision Bridge Assistant', 'Engineering Ops', 'Product-B-AI-Assistant', 'Product-B-Code-Analysis', 'Projects AI Assistant', 'Product-C-AI-Assistant', 'Metrics Assistant', 'License Platform Assistant', 'License Platform Assistant New', 'License Platform Expert', 'OfficeCli', 'Intelligent Brains', 'Problem Analysis Assistant', 'Policies Assistant', 'Projects Manage', 'Quotation&Invoice-User', 'Quotation&Invoice-Admin', 'Private Assistant', 'Partner Assistant', 'Smart Collaboration', 'test', 'Situation Awareness', 'Manual Upload Code Analysis'],
  envsets: [
    ['Product-A-AI-Assistant · officecli', ['DOTNET_SYSTEM_GLOBALIZATION_INVARIANT', 'OFFICECLI_NO_AUTO_RESIDENT', 'OFFICECLI_SKIP_UPDATE']],
    ['Biz-MCP-online-test', ['BIZ_MCP_TOKEN']], ['Biz-MCP-online-test (2)', ['BIZ_MCP_TOKEN']],
    ['Engineering Ops · test-quality-dashboard', ['TESTMGMT_TOKEN', 'TESTMGMT_URL']],
    ['GitHub', ['GH_TOKEN']], ['GitLab', ['GITLAB_HOST', 'GITLAB_TOKEN']], ['JIRA', ['JIRA_PASSWORD', 'JIRA_PROJECT', 'JIRA_SERVER', 'JIRA_USERNAME']],
    ['License Platform Assistant New · license-cli', ['LICENSE_ENDPOINT', 'LICENSE_PASSWORD', 'LICENSE_USERNAME']],
    ['office-cli', ['DOTNET_SYSTEM_GLOBALIZATION_INVARIANT', 'OFFICECLI_NO_AUTO_RESIDENT', 'OFFICECLI_SKIP_UPDATE']],
    ['OfficeCli · officecli', ['DOTNET_SYSTEM_GLOBALIZATION_INVARIANT', 'OFFICECLI_NO_AUTO_RESIDENT', 'OFFICECLI_SKIP_UPDATE']],
    ['Tickets Research AI · support-ticket-research', ['TICKET_AUTH_TYPE', 'TICKET_BASE_URL', 'TICKET_LOGIN_URL', 'TICKET_PASSWORD', 'TICKET_TIMEOUT', 'TICKET_USERNAME']],
    ['正式环境', ['LICENSE_ENDPOINT', 'LICENSE_PASSWORD', 'LICENSE_USERNAME']],
  ],
  /** 版本显示：技能的版本是上传包的内容哈希（#xxxx），其余为语义化版本（v1.0.0） */
  vtxt: v => /^[0-9a-f]{12}$/.test(String(v)) ? '#' + String(v).slice(0, 7) : 'v' + v,
  daysAgo: d => Math.max(0, Math.round((new Date('2026-11-10') - new Date(d)) / 86400000)),
};
H.vtxt = H.REAL.vtxt;
})();

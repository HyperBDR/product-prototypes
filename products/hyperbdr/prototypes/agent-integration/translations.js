// English wording follows the equivalent entries in newmuse/src/lang/en.js:
// route.*, form.*, table.*, global.*, and common status terminology.
window.AGENT_MESSAGES = {
  zh: {
    language: 'English', nav: ['概览','资源容灾','资源编排','配置管理','运维管理','监控与告警管理','设置','智能体集成'],
    crumb: '智能体集成', tab: '智能体集成',
    installTitle: '安装 HyperBDR skills', installSubtitle: '让智能体安全调用 HyperBDR',
    installIntro: '安装 HyperBDR skills 后，支持的智能体可以理解 HyperBDR 的资源、容灾和运维操作。请先完成安装，再使用下方的 CLI Access Token 连接当前租户。',
    steps: ['安装 skills','配置访问令牌','开始使用'], stepCopy: ['在智能体所在环境执行安装命令，完成 HyperBDR 工具能力注册。','创建一个有明确有效期的 CLI Token，仅在生成时复制一次明文。','重新打开智能体会话，让它发现 HyperBDR skills 并访问业务接口。'],
    command: '安装命令', copy: '复制', security: '安全提示', securityCopy: 'skills 不包含账号凭据。请不要把完整 Token 提交到代码仓库、聊天记录或公开日志中。',
    usage: '使用说明', usageItems: ['令牌管理接口只允许已完成网页登录和 MFA 的会话使用。','CLI 请求通过 X-AUTH-TOKEN 携带令牌，过期或禁用后无法访问，令牌不会自动刷新。','令牌权限跟随当前账号角色和租户状态，建议为不同环境创建不同令牌。'],
    tokenManagement: '令牌管理', create: '＋ 创建令牌', bulkDisable: '全部禁用', tokenIntro: 'CLI Access Token 用于 hyperbdrctl 和智能体调用 HyperBDR API。', tokenIntro2: '令牌明文只在创建成功后显示一次，列表仅展示脱敏前缀。禁用可恢复，删除不可恢复。',
    headers: ['令牌名称','Token','创建时间','过期时间','状态','操作'], statuses: {active:'已启用',disabled:'已禁用',expired:'已过期'}, actions:{enable:'启用',disable:'禁用',delete:'删除',cannotEnable:'不可启用'}, count:(n,a)=>`共 ${n} 个令牌，其中 ${a} 个已启用`,
    createTitle:'创建 CLI Access Token', close:'关闭', name:'令牌名称', nameHint:'使用环境或用途命名，方便后续撤销和审计。', expiry:'有效期', description:'描述', descriptionPlaceholder:'可选，例如：生产环境智能体调用', cancel:'取消', confirm:'确认', createToken:'创建令牌',
    successTitle:'令牌创建成功', onceTitle:'⚠ 令牌只显示一次', onceCopy:'请立即复制并安全保存。关闭此窗口后，将无法再次查看完整令牌。', expiryAt:'过期时间', fullToken:'完整令牌', saved:'我已安全保存',
    confirmCreate:'确认创建令牌', confirmCreateLead:'请确认以下令牌策略：', confirmCreateBody:'权限跟随当前账号与租户，创建后立即启用，到期后不会自动续期。', confirmCreateNote:'完整令牌只显示一次，请确认已准备好安全保存。',
    confirmDisableAll:'确认全部禁用', confirmDisableAllLead:'确定禁用全部 {n} 个已启用令牌？', confirmDisableAllBody:'使用这些令牌的智能体及 CLI 将立即无法继续访问 HyperBDR。', confirmDisableAllNote:'记录和原有效期保留，之后可逐个启用未过期令牌。',
    confirmDisable:'确认禁用令牌', confirmEnable:'确认启用令牌', confirmDisableLead:'确定禁用“{name}”？', confirmEnableLead:'确定启用“{name}”？', confirmDisableBody:'禁用后，使用该令牌的智能体和 CLI 将立即无法访问 HyperBDR。', confirmEnableBody:'启用后，持有此令牌的智能体和 CLI 将恢复当前账号权限范围内的访问。请确认使用环境可信。', confirmDisableNote:'令牌不会被删除，可在过期前重新启用。', confirmEnableNote:'启用不会延长原有效期，也不会再次显示完整令牌。',
    confirmDelete:'确认删除令牌', confirmDeleteLead:'确定删除“{name}”？', confirmDeleteBody:'删除后，该令牌将立即失效并从管理列表移除。', confirmDeleteNote:'此操作不可恢复，原令牌无法重新启用；如需再次访问，必须创建新令牌。',
    toasts:{copied:'安装命令已复制',tokenCopied:'令牌已复制',created:'令牌已创建，请妥善保管',disabled:'令牌已禁用',enabled:'令牌已启用',deleted:'令牌已删除',allDisabled:'已禁用 {n} 个令牌',noActive:'当前没有已启用令牌',nameRequired:'请输入 1–100 个字符的令牌名称',expiryRequired:'请选择有效期',expired:'令牌已过期，请创建新令牌',copyFailed:'复制失败，请手动选择并复制'},
    navSide:['全局设置','授权管理','用户管理','版本信息','智能体集成']
  },
  en: {
    language: '中文', nav: ['Dashboard','DR','Orchestration','Configuration','Operations','Monitor & Alerts','Settings','Agent Integration'],
    crumb: 'Agent Integration', tab: 'Agent Integration',
    installTitle: 'Install HyperBDR skills', installSubtitle: 'Let your agent securely call HyperBDR',
    installIntro: 'After installing HyperBDR skills, compatible agents can understand HyperBDR resource, DR, and operations actions. Install the skills first, then connect the current tenant with a CLI Access Token.',
    steps: ['Install skills','Configure access token','Start using'], stepCopy: ['Run the installation command in the agent environment to register HyperBDR tool capabilities.','Create a CLI Token with an explicit lifetime. The plaintext token is shown only once.','Reopen the agent session so it can discover HyperBDR skills and access business APIs.'],
    command: 'Installation command', copy: 'Copy', security: 'Security notice', securityCopy: 'Skills do not contain account credentials. Never commit a complete Token to a repository, chat, or public log.',
    usage: 'Usage notes', usageItems: ['Token management APIs require a normal web session that has completed email login and MFA.','CLI requests send the token in X-AUTH-TOKEN. Expired or disabled tokens cannot access the API and are not refreshed automatically.','Token permissions follow the current account role and tenant state. Create separate tokens for separate environments.'],
    tokenManagement: 'Token Management', create: '+ Create Token', bulkDisable: 'Disable all', tokenIntro: 'CLI Access Token is used by hyperbdrctl and agents to call HyperBDR APIs.', tokenIntro2: 'Plaintext is shown only once; the list shows only a masked prefix. Disabled tokens can be enabled again; deletion cannot be undone.',
    headers: ['Token Name','Token','Creation Time','Expiration Time','Status','Actions'], statuses: {active:'Enabled',disabled:'Disabled',expired:'Expired'}, actions:{enable:'Enable',disable:'Disable',delete:'Delete',cannotEnable:'Cannot enable'}, count:(n,a)=>`${n} token${n===1?'':'s'} total, ${a} enabled`,
    createTitle:'Create CLI Access Token', close:'Close', name:'Token Name', nameHint:'Name it by environment or purpose for later management and audit.', expiry:'Expiration', description:'Description', descriptionPlaceholder:'Optional, e.g. production agent access', cancel:'Cancel', confirm:'Confirm', createToken:'Create Token',
    successTitle:'Token Created', onceTitle:'⚠ Token shown only once', onceCopy:'Copy and store it securely now. After closing this window, the complete token cannot be viewed again.', expiryAt:'Expiration Time', fullToken:'Complete Token', saved:'I have saved it securely',
    confirmCreate:'Confirm Token Creation', confirmCreateLead:'Review the token policy:', confirmCreateBody:'Permissions follow the current account and tenant. The token is enabled immediately and does not renew after expiration.', confirmCreateNote:'The complete token is shown only once. Confirm that you are ready to store it securely.',
    confirmDisableAll:'Confirm Disable All', confirmDisableAllLead:'Disable all {n} enabled tokens?', confirmDisableAllBody:'Agents and CLI clients using these tokens will immediately lose access to HyperBDR.', confirmDisableAllNote:'Records and original expiration dates are retained. Unexpired tokens can be enabled individually later.',
    confirmDisable:'Confirm Disable Token', confirmEnable:'Confirm Enable Token', confirmDisableLead:'Disable “{name}”?', confirmEnableLead:'Enable “{name}”?', confirmDisableBody:'Agents and CLI clients using this token will immediately lose access to HyperBDR.', confirmEnableBody:'The token will regain access within the current account permissions. Confirm that the environment is trusted.', confirmDisableNote:'The token is retained and can be enabled again before it expires.', confirmEnableNote:'Enabling does not extend the original expiration or reveal the complete token again.',
    confirmDelete:'Confirm Delete Token', confirmDeleteLead:'Delete “{name}”?', confirmDeleteBody:'The token becomes invalid immediately and is removed from the management list.', confirmDeleteNote:'This cannot be undone. Create a new token if access is needed again.',
    toasts:{copied:'Installation command copied',tokenCopied:'Token copied',created:'Token created. Store it securely.',disabled:'Token disabled',enabled:'Token enabled',deleted:'Token deleted',allDisabled:'Disabled {n} tokens',noActive:'There are no enabled tokens',nameRequired:'Enter a token name between 1 and 100 characters',expiryRequired:'Select an expiration',expired:'Token has expired. Create a new token.',copyFailed:'Copy failed. Select and copy it manually'},
    navSide:['Global Settings','License Management','User Management','Versions','Agent Integration']
  }
};

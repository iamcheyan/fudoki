(function () {
  'use strict';

  // 常用计算机术语读音与翻译覆盖
  const TECH_TERM_OVERRIDES = {
    // 编程语言与框架
    'javascript': { reading: 'ジャバスクリプト', translations: { zh: 'JavaScript 脚本语言', ja: 'JavaScript', en: 'JavaScript' } },
    'typescript': { reading: 'タイプスクリプト', translations: { zh: 'TypeScript 类型化脚本', ja: 'TypeScript', en: 'TypeScript' } },
    'node.js': { reading: 'ノードジェイエス', translations: { zh: 'Node.js 运行时', ja: 'Node.js', en: 'Node.js runtime' } },
    'nodejs': { reading: 'ノードジェイエス', translations: { zh: 'Node.js 运行时', ja: 'Node.js', en: 'Node.js' } },
    'react': { reading: 'リアクト', translations: { zh: 'React 前端库', ja: 'React', en: 'React library' } },
    'vue': { reading: 'ヴュー', translations: { zh: 'Vue 前端框架', ja: 'Vue', en: 'Vue framework' } },
    'angular': { reading: 'アンギュラー', translations: { zh: 'Angular 前端框架', ja: 'Angular', en: 'Angular framework' } },
    'python': { reading: 'パイソン', translations: { zh: 'Python 编程语言', ja: 'Python', en: 'Python programming language' } },
    'express': { reading: 'エクスプレス', translations: { zh: 'Express 后端框架', ja: 'Express', en: 'Express framework' } },
    'js': { reading: 'ジェイエス', translations: { zh: 'JS（JavaScript）', ja: 'JS（JavaScript）', en: 'JS (JavaScript)' } },
    
    // 状态管理与UI库
    'redux': { reading: 'リダックス', translations: { zh: 'Redux 状态管理库', ja: 'Redux', en: 'Redux state management' } },
    'material-ui': { reading: 'マテリアルユーアイ', translations: { zh: 'Material-UI 组件库', ja: 'Material-UI', en: 'Material-UI component library' } },
    'materialui': { reading: 'マテリアルユーアイ', translations: { zh: 'Material-UI 组件库', ja: 'Material-UI', en: 'Material-UI' } },
    
    // 数据库
    'postgresql': { reading: 'ポストグレスキューエル', translations: { zh: 'PostgreSQL 数据库', ja: 'PostgreSQL', en: 'PostgreSQL database' } },
    'postgres': { reading: 'ポストグレス', translations: { zh: 'PostgreSQL 数据库', ja: 'PostgreSQL', en: 'PostgreSQL' } },
    'redis': { reading: 'レディス', translations: { zh: 'Redis 缓存数据库', ja: 'Redis', en: 'Redis cache' } },
    'mongodb': { reading: 'モンゴディービー', translations: { zh: 'MongoDB 文档数据库', ja: 'MongoDB', en: 'MongoDB database' } },
    'mysql': { reading: 'マイエスキューエル', translations: { zh: 'MySQL 数据库', ja: 'MySQL', en: 'MySQL database' } },
    
    // 标记语言与数据格式
    'markdown': { reading: 'マークダウン', translations: { zh: 'Markdown 标记语言', ja: 'Markdown', en: 'Markdown markup language' } },
    'html': { reading: 'エイチティーエムエル', translations: { zh: '超文本标记语言', ja: 'ハイパーテキストマークアップ言語', en: 'HyperText Markup Language' } },
    'css': { reading: 'シーエスエス', translations: { zh: '层叠样式表', ja: 'カスケーディング・スタイル・シート', en: 'Cascading Style Sheets' } },
    'json': { reading: 'ジェイソン', translations: { zh: 'JSON 数据格式', ja: 'JSON', en: 'JSON data format' } },
    'yaml': { reading: 'ヤムル', translations: { zh: 'YAML 配置格式', ja: 'YAML', en: 'YAML configuration format' } },
    'xml': { reading: 'エックスエムエル', translations: { zh: 'XML 标记语言', ja: 'XML', en: 'XML markup language' } },
    
    // 协议与标准
    'http': { reading: 'エイチティーティーピー', translations: { zh: '超文本传输协议', ja: 'ハイパーテキスト転送プロトコル', en: 'Hypertext Transfer Protocol' } },
    'https': { reading: 'エイチティーティーピーエス', translations: { zh: 'HTTPS 安全协议', ja: 'HTTPS', en: 'HTTPS secure protocol' } },
    'api': { reading: 'エーピーアイ', translations: { zh: '应用程序接口', ja: 'アプリケーション・プログラミング・インタフェース', en: 'Application Programming Interface' } },
    'rest': { reading: 'レスト', translations: { zh: 'REST API 风格', ja: 'REST', en: 'REST API' } },
    'graphql': { reading: 'グラフキューエル', translations: { zh: 'GraphQL 查询语言', ja: 'GraphQL', en: 'GraphQL query language' } },
    'websocket': { reading: 'ウェブソケット', translations: { zh: 'WebSocket 协议', ja: 'WebSocket', en: 'WebSocket protocol' } },
    'mtls': { reading: 'エムティーエルエス', translations: { zh: '双向 TLS 认证', ja: '相互TLS', en: 'Mutual TLS' } },
    
    // URL与网络
    'url': { reading: 'ユーアールエル', translations: { zh: '统一资源定位符', ja: 'URL', en: 'Uniform Resource Locator' } },
    'uri': { reading: 'ユーアールアイ', translations: { zh: '统一资源标识符', ja: 'URI', en: 'Uniform Resource Identifier' } },
    'dns': { reading: 'ディーエヌエス', translations: { zh: '域名系统', ja: 'DNS', en: 'Domain Name System' } },
    
    // UI/UX
    'ui': { reading: 'ユーアイ', translations: { zh: '用户界面', ja: 'ユーザーインターフェース', en: 'User Interface' } },
    'ux': { reading: 'ユーエックス', translations: { zh: '用户体验', ja: 'ユーザーエクスペリエンス', en: 'User Experience' } },
    
    // 开发工具
    'ide': { reading: 'アイディーイー', translations: { zh: '集成开发环境', ja: '統合開発環境', en: 'Integrated Development Environment' } },
    'git': { reading: 'ギット', translations: { zh: '分布式版本控制 Git', ja: 'Git', en: 'Git version control' } },
    'github': { reading: 'ギットハブ', translations: { zh: '代码托管平台 GitHub', ja: 'GitHub', en: 'GitHub platform' } },
    'gitlab': { reading: 'ギットラボ', translations: { zh: 'GitLab 代码平台', ja: 'GitLab', en: 'GitLab platform' } },
    'npm': { reading: 'エヌピーエム', translations: { zh: 'NPM 包管理器', ja: 'NPM', en: 'NPM package manager' } },
    'yarn': { reading: 'ヤーン', translations: { zh: 'Yarn 包管理器', ja: 'Yarn', en: 'Yarn package manager' } },
    'webpack': { reading: 'ウェブパック', translations: { zh: 'Webpack 打包工具', ja: 'Webpack', en: 'Webpack bundler' } },
    'vite': { reading: 'ヴィート', translations: { zh: 'Vite 构建工具', ja: 'Vite', en: 'Vite build tool' } },
    'eslint': { reading: 'イーエスリント', translations: { zh: 'ESLint 代码检查工具', ja: 'ESLint', en: 'ESLint linter' } },
    'prettier': { reading: 'プリティア', translations: { zh: 'Prettier 代码格式化工具', ja: 'Prettier', en: 'Prettier code formatter' } },
    
    // 容器与编排
    'docker': { reading: 'ドッカー', translations: { zh: 'Docker 容器引擎', ja: 'Docker', en: 'Docker container engine' } },
    'kubernetes': { reading: 'クバネティス', translations: { zh: 'Kubernetes 容器编排', ja: 'Kubernetes', en: 'Kubernetes' } },
    'k8s': { reading: 'ケーエイツ', translations: { zh: 'K8s（Kubernetes 缩写）', ja: 'K8s', en: 'K8s (Kubernetes)' } },
    'pod': { reading: 'ポッド', translations: { zh: 'Pod（K8s 最小部署单元）', ja: 'ポッド', en: 'Pod' } },
    'helm': { reading: 'ヘルム', translations: { zh: 'Helm K8s 包管理器', ja: 'Helm', en: 'Helm package manager' } },
    'kustomize': { reading: 'カスタマイズ', translations: { zh: 'Kustomize K8s 配置管理', ja: 'Kustomize', en: 'Kustomize' } },
    
    // CI/CD与自动化
    'jenkins': { reading: 'ジェンキンス', translations: { zh: 'Jenkins CI/CD 工具', ja: 'Jenkins', en: 'Jenkins automation' } },
    'argocd': { reading: 'アルゴシーディー', translations: { zh: 'Argo CD 持续部署', ja: 'Argo CD', en: 'Argo CD' } },
    'argo': { reading: 'アルゴ', translations: { zh: 'Argo 工作流引擎', ja: 'Argo', en: 'Argo workflow' } },
    'tekton': { reading: 'テクトン', translations: { zh: 'Tekton CI/CD 框架', ja: 'Tekton', en: 'Tekton' } },
    
    // 监控与日志
    'prometheus': { reading: 'プロメテウス', translations: { zh: 'Prometheus 监控系统', ja: 'Prometheus', en: 'Prometheus monitoring' } },
    'grafana': { reading: 'グラファナ', translations: { zh: 'Grafana 可视化平台', ja: 'Grafana', en: 'Grafana visualization' } },
    'loki': { reading: 'ロキ', translations: { zh: 'Loki 日志聚合系统', ja: 'Loki', en: 'Loki log aggregation' } },
    'elasticsearch': { reading: 'エラスティックサーチ', translations: { zh: 'Elasticsearch 搜索引擎', ja: 'Elasticsearch', en: 'Elasticsearch' } },
    'kibana': { reading: 'キバナ', translations: { zh: 'Kibana 数据可视化', ja: 'Kibana', en: 'Kibana' } },
    'fluentd': { reading: 'フルエントディー', translations: { zh: 'Fluentd 日志收集器', ja: 'Fluentd', en: 'Fluentd' } },
    'fluentbit': { reading: 'フルエントビット', translations: { zh: 'Fluent Bit 轻量日志收集', ja: 'Fluent Bit', en: 'Fluent Bit' } },
    'thanos': { reading: 'サノス', translations: { zh: 'Thanos 高可用 Prometheus', ja: 'Thanos', en: 'Thanos' } },
    
    // 消息队列
    'kafka': { reading: 'カフカ', translations: { zh: 'Kafka 消息队列', ja: 'Kafka', en: 'Kafka message queue' } },
    'rabbitmq': { reading: 'ラビットエムキュー', translations: { zh: 'RabbitMQ 消息代理', ja: 'RabbitMQ', en: 'RabbitMQ' } },
    'redis': { reading: 'レディス', translations: { zh: 'Redis 缓存与消息', ja: 'Redis', en: 'Redis' } },
    
    // 服务网格与网络
    'istio': { reading: 'イスティオ', translations: { zh: 'Istio 服务网格', ja: 'Istio', en: 'Istio service mesh' } },
    'envoy': { reading: 'エンボイ', translations: { zh: 'Envoy 代理服务器', ja: 'Envoy', en: 'Envoy proxy' } },
    'nginx': { reading: 'エンジンエックス', translations: { zh: 'Nginx 网络服务器', ja: 'Nginx', en: 'Nginx web server' } },
    'traefik': { reading: 'トラフィック', translations: { zh: 'Traefik 反向代理', ja: 'Traefik', en: 'Traefik reverse proxy' } },
    'calico': { reading: 'キャリコ', translations: { zh: 'Calico 网络插件', ja: 'Calico', en: 'Calico network plugin' } },
    'cni': { reading: 'シーエヌアイ', translations: { zh: 'CNI 容器网络接口', ja: 'CNI', en: 'Container Network Interface' } },
    'ebpf': { reading: 'イービーピーエフ', translations: { zh: 'eBPF 内核编程技术', ja: 'eBPF', en: 'eBPF' } },
    
    // 安全与策略
    'opa': { reading: 'オーピーエー', translations: { zh: 'OPA 开放策略代理', ja: 'OPA', en: 'Open Policy Agent' } },
    'gatekeeper': { reading: 'ゲートキーパー', translations: { zh: 'Gatekeeper 策略控制器', ja: 'Gatekeeper', en: 'Gatekeeper' } },
    'oauth': { reading: 'オーオース', translations: { zh: 'OAuth 授权协议', ja: 'OAuth', en: 'OAuth protocol' } },
    'jwt': { reading: 'ジェイダブリューティー', translations: { zh: 'JWT 令牌', ja: 'JWT', en: 'JSON Web Token' } },
    'ssl': { reading: 'エスエスエル', translations: { zh: 'SSL 安全协议', ja: 'SSL', en: 'SSL protocol' } },
    'tls': { reading: 'ティーエルエス', translations: { zh: 'TLS 传输层安全', ja: 'TLS', en: 'Transport Layer Security' } },
    'spiffe': { reading: 'スピッフ', translations: { zh: 'SPIFFE 身份框架', ja: 'SPIFFE', en: 'SPIFFE identity framework' } },
    
    // 存储与数据库工具
    'etcd': { reading: 'エトセディー', translations: { zh: 'etcd 分布式键值存储', ja: 'etcd', en: 'etcd distributed key-value store' } },
    's3': { reading: 'エススリー', translations: { zh: 'S3 对象存储', ja: 'S3', en: 'S3 object storage' } },
    'aws': { reading: 'エーダブリューエス', translations: { zh: 'AWS 云平台', ja: 'AWS', en: 'Amazon Web Services' } },
    'azure': { reading: 'アジュール', translations: { zh: 'Azure 微软云', ja: 'Azure', en: 'Microsoft Azure' } },
    'gcp': { reading: 'ジーシーピー', translations: { zh: 'GCP 谷歌云', ja: 'GCP', en: 'Google Cloud Platform' } },
    'ssd': { reading: 'エスエスディー', translations: { zh: 'SSD 固态硬盘', ja: 'SSD', en: 'Solid State Drive' } },
    
    // 部署与发布策略
    'canary': { reading: 'カナリー', translations: { zh: 'Canary 金丝雀发布', ja: 'カナリーリリース', en: 'Canary deployment' } },
    'bluegreen': { reading: 'ブルーグリーン', translations: { zh: '蓝绿部署', ja: 'ブルーグリーンデプロイ', en: 'Blue-Green deployment' } },
    'flagger': { reading: 'フラガー', translations: { zh: 'Flagger 渐进式交付', ja: 'Flagger', en: 'Flagger progressive delivery' } },
    
    // 自动扩缩容
    'hpa': { reading: 'エイチピーエー', translations: { zh: 'HPA 水平自动扩缩容', ja: 'HPA', en: 'Horizontal Pod Autoscaler' } },
    'vpa': { reading: 'ブイピーエー', translations: { zh: 'VPA 垂直自动扩缩容', ja: 'VPA', en: 'Vertical Pod Autoscaler' } },
    
    // 硬件与系统
    'cpu': { reading: 'シーピーユー', translations: { zh: 'CPU 中央处理器', ja: 'CPU', en: 'Central Processing Unit' } },
    'gpu': { reading: 'ジーピーユー', translations: { zh: 'GPU 图形处理器', ja: 'GPU', en: 'Graphics Processing Unit' } },
    'ram': { reading: 'ラム', translations: { zh: 'RAM 内存', ja: 'RAM', en: 'Random Access Memory' } },
    'rom': { reading: 'ロム', translations: { zh: 'ROM 只读存储器', ja: 'ROM', en: 'Read-Only Memory' } },
    
    // 其他常用术语
    'ai': { reading: 'エーアイ', translations: { zh: 'AI 人工智能', ja: 'AI', en: 'Artificial Intelligence' } },
    'ml': { reading: 'エムエル', translations: { zh: 'ML 机器学习', ja: 'ML', en: 'Machine Learning' } },
    'nlp': { reading: 'エヌエルピー', translations: { zh: 'NLP 自然语言处理', ja: 'NLP', en: 'Natural Language Processing' } },
    'devops': { reading: 'デブオプス', translations: { zh: 'DevOps 开发运维', ja: 'DevOps', en: 'DevOps' } },
    'cicd': { reading: 'シーアイシーディー', translations: { zh: 'CI/CD 持续集成部署', ja: 'CI/CD', en: 'Continuous Integration/Deployment' } },
    'crud': { reading: 'クラッド', translations: { zh: 'CRUD 增删改查', ja: 'CRUD', en: 'Create, Read, Update, Delete' } },
    'mvc': { reading: 'エムブイシー', translations: { zh: 'MVC 模型视图控制器', ja: 'MVC', en: 'Model-View-Controller' } },
    'mvvm': { reading: 'エムブイブイエム', translations: { zh: 'MVVM 模型视图视图模型', ja: 'MVVM', en: 'Model-View-ViewModel' } },
    'raft': { reading: 'ラフト', translations: { zh: 'Raft 共识算法', ja: 'Raft', en: 'Raft consensus algorithm' } },
    'bash': { reading: 'バッシュ', translations: { zh: 'Bash Shell 脚本', ja: 'Bash', en: 'Bash shell' } },
    'shell': { reading: 'シェル', translations: { zh: 'Shell 命令行', ja: 'シェル', en: 'Shell' } },
    'linux': { reading: 'リナックス', translations: { zh: 'Linux 操作系统', ja: 'Linux', en: 'Linux operating system' } },
    'unix': { reading: 'ユニックス', translations: { zh: 'Unix 操作系统', ja: 'Unix', en: 'Unix operating system' } },
    'windows': { reading: 'ウィンドウズ', translations: { zh: 'Windows 操作系统', ja: 'Windows', en: 'Windows OS' } },
    'macos': { reading: 'マックオーエス', translations: { zh: 'macOS 操作系统', ja: 'macOS', en: 'macOS' } },
    'ios': { reading: 'アイオーエス', translations: { zh: 'iOS 移动系统', ja: 'iOS', en: 'iOS' } },
    'android': { reading: 'アンドロイド', translations: { zh: 'Android 移动系统', ja: 'Android', en: 'Android' } }
  };

  function normalizeTechKey(s) {
    return String(s || '').trim().toLowerCase();
  }

  function getTechOverride(token) {
    if (!token) return null;
    const keys = [token.surface, token.lemma, token.reading].filter(Boolean);
    for (const k of keys) {
      const key = normalizeTechKey(k);
      if (TECH_TERM_OVERRIDES[key]) return TECH_TERM_OVERRIDES[key];
      const noDot = key.replace(/\./g, '');
      if (TECH_TERM_OVERRIDES[noDot]) return TECH_TERM_OVERRIDES[noDot];
    }
    return null;
  }

  function parsePartOfSpeech(pos) {
    if (!Array.isArray(pos) || pos.length === 0) {
      return { main: '未知', details: [] };
    }
    const posMap = {
      '名詞': '名',
      '動詞': '动', 
      '形容詞': '形',
      '副詞': '副',
      '助詞': '助',
      '助動詞': '助动',
      '連体詞': '连体',
      '接続詞': '接续',
      '感動詞': '感叹',
      '記号': '标点',
      '補助記号': '符号',
      'フィラー': '填充',
      '其他': '其他'
    };
    const main = pos[0] || '未知';
    const mainChinese = posMap[main] || main;
    const details = [];
    if (pos.length > 1 && pos[1] !== '*') details.push(`细分: ${pos[1]}`);
    if (pos.length > 2 && pos[2] !== '*') details.push(`类型: ${pos[2]}`);
    if (pos.length > 3 && pos[3] !== '*') details.push(`形态: ${pos[3]}`);
    return { main: mainChinese, details, original: pos };
  }

  function formatDetailInfo(token, posInfo, i18n = {}) {
    const t = (key, fallback) => i18n[key] || fallback || key;
    const details = [];
    details.push(`<div class="detail-item"><strong>${t('lbl_surface','表层形')}:</strong> ${token.surface}</div>`);
    if (token.lemma && token.lemma !== token.surface) {
      details.push(`<div class="detail-item"><strong>${t('lbl_base','基本形')}:</strong> ${token.lemma}</div>`);
    }
    if (token.reading && token.reading !== token.surface) {
      let displayReading = token.reading;
      details.push(`<div class="detail-item"><strong>${t('lbl_reading','读音')}:</strong> ${displayReading}</div>`);
    }
    details.push(`<div class="detail-item translation-item"><strong>${t('lbl_translation','翻译')}:</strong> <span class="translation-content">${t('loading','加载中...')}</span></div>`);
    details.push(`<div class="detail-item"><strong>${t('lbl_pos','词性')}:</strong> ${posInfo.main}</div>`);
    if (posInfo.details && posInfo.details.length > 0) {
      posInfo.details.forEach(detail => {
        details.push(`<div class="detail-item">${detail}</div>`);
      });
    }
    if (posInfo.original && posInfo.original.length > 0) {
      const originalPos = posInfo.original.filter(p => p !== '*').join(' / ');
      if (originalPos) {
        details.push(`<div class="detail-item"><strong>${t('lbl_pos_raw','原始标签')}:</strong> ${originalPos}</div>`);
      }
    }
    return details.join('');
  }

  window.FudokiDict = window.FudokiDict || {
    getTechOverride,
    parsePartOfSpeech,
    formatDetailInfo
  };
})();



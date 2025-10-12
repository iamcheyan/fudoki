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
    
    // 常见编程语言、工具与生态
    'go': { reading: 'ゴー', translations: { zh: 'Go 编程语言', ja: 'Go言語', en: 'Go programming language' } },
    'golang': { reading: 'ゴーラング', translations: { zh: 'Go 编程语言', ja: 'Go言語', en: 'Go programming language' } },
    'rust': { reading: 'ラスト', translations: { zh: 'Rust 编程语言', ja: 'Rust', en: 'Rust programming language' } },
    'ruby': { reading: 'ルビー', translations: { zh: 'Ruby 编程语言', ja: 'Ruby', en: 'Ruby programming language' } },
    'php': { reading: 'ピーエイチピー', translations: { zh: 'PHP 超文本预处理器', ja: 'PHP', en: 'PHP Hypertext Preprocessor' } },
    'swift': { reading: 'スイフト', translations: { zh: 'Swift 编程语言', ja: 'Swift', en: 'Swift programming language' } },
    'kotlin': { reading: 'コトリン', translations: { zh: 'Kotlin 编程语言', ja: 'Kotlin', en: 'Kotlin programming language' } },
    'scala': { reading: 'スカラ', translations: { zh: 'Scala 编程语言', ja: 'Scala', en: 'Scala programming language' } },
    'perl': { reading: 'パール', translations: { zh: 'Perl 编程语言', ja: 'Perl', en: 'Perl programming language' } },
    'haskell': { reading: 'ハスケル', translations: { zh: 'Haskell 函数式语言', ja: 'Haskell', en: 'Haskell functional language' } },
    'clojure': { reading: 'クロージャー', translations: { zh: 'Clojure 函数式语言', ja: 'Clojure', en: 'Clojure functional language' } },
    'elixir': { reading: 'エリクサー', translations: { zh: 'Elixir 函数式语言', ja: 'Elixir', en: 'Elixir programming language' } },
    'erlang': { reading: 'アーラング', translations: { zh: 'Erlang 并发语言', ja: 'Erlang', en: 'Erlang programming language' } },
    'fortran': { reading: 'フォートラン', translations: { zh: 'Fortran 科学计算语言', ja: 'Fortran', en: 'Fortran programming language' } },
    'csharp': { reading: 'シーシャープ', translations: { zh: 'C# 编程语言', ja: 'C#', en: 'C# programming language' } },
    'fsharp': { reading: 'エフシャープ', translations: { zh: 'F# 编程语言', ja: 'F#', en: 'F# programming language' } },
    'dotnet': { reading: 'ドットネット', translations: { zh: '.NET 开发平台', ja: '.NET', en: '.NET development platform' } },
    '.net': { reading: 'ドットネット', translations: { zh: '.NET 开发平台', ja: '.NET', en: '.NET development platform' } },
    'unity': { reading: 'ユニティー', translations: { zh: 'Unity 游戏引擎', ja: 'Unity', en: 'Unity game engine' } },
    'unreal': { reading: 'アンリアル', translations: { zh: 'Unreal 游戏引擎', ja: 'Unreal Engine', en: 'Unreal Engine' } },
    'godot': { reading: 'ゴドー', translations: { zh: 'Godot 游戏引擎', ja: 'Godot', en: 'Godot game engine' } },
    'electron': { reading: 'エレクトロン', translations: { zh: 'Electron 跨端框架', ja: 'Electron', en: 'Electron framework' } },
    'deno': { reading: 'デノ', translations: { zh: 'Deno 运行时', ja: 'Deno', en: 'Deno runtime' } },
    'bun': { reading: 'バン', translations: { zh: 'Bun JavaScript 运行时', ja: 'Bun', en: 'Bun JavaScript runtime' } },
    'rollup': { reading: 'ロールアップ', translations: { zh: 'Rollup 打包工具', ja: 'Rollup', en: 'Rollup bundler' } },
    'esbuild': { reading: 'イーエスビルド', translations: { zh: 'esbuild 打包器', ja: 'esbuild', en: 'esbuild bundler' } },
    'webpacker': { reading: 'ウェブパッカー', translations: { zh: 'Webpacker 打包器', ja: 'Webpacker', en: 'Webpacker bundler' } },
    'parcel': { reading: 'パーセル', translations: { zh: 'Parcel 打包器', ja: 'Parcel', en: 'Parcel bundler' } },
    'babel': { reading: 'バベル', translations: { zh: 'Babel 转译器', ja: 'Babel', en: 'Babel transpiler' } },
    'jest': { reading: 'ジェスト', translations: { zh: 'Jest 测试框架', ja: 'Jest', en: 'Jest testing framework' } },
    'mocha': { reading: 'モカ', translations: { zh: 'Mocha 测试框架', ja: 'Mocha', en: 'Mocha test framework' } },
    'chai': { reading: 'チャイ', translations: { zh: 'Chai 断言库', ja: 'Chai', en: 'Chai assertion library' } },
    'pytest': { reading: 'パイテスト', translations: { zh: 'Pytest 测试框架', ja: 'Pytest', en: 'Pytest testing framework' } },
    'nose': { reading: 'ノーズ', translations: { zh: 'nose 测试框架', ja: 'nose', en: 'nose testing framework' } },
    'selenium': { reading: 'セレン', translations: { zh: 'Selenium 自动化测试', ja: 'Selenium', en: 'Selenium automation testing' } },
    'cypress': { reading: 'サイプレス', translations: { zh: 'Cypress 前端测试', ja: 'Cypress', en: 'Cypress frontend testing' } },
    'playwright': { reading: 'プレイライト', translations: { zh: 'Playwright 自动化测试', ja: 'Playwright', en: 'Playwright automation testing' } },
    'storybook': { reading: 'ストーリーブック', translations: { zh: 'Storybook 组件文档', ja: 'Storybook', en: 'Storybook component library' } },
    'next.js': { reading: 'ネクストジェイエス', translations: { zh: 'Next.js 应用框架', ja: 'Next.js', en: 'Next.js framework' } },
    'nextjs': { reading: 'ネクストジェイエス', translations: { zh: 'Next.js 应用框架', ja: 'Next.js', en: 'Next.js framework' } },
    'nuxt': { reading: 'ナクスト', translations: { zh: 'Nuxt.js 应用框架', ja: 'Nuxt', en: 'Nuxt.js framework' } },
    'svelte': { reading: 'スヴェルト', translations: { zh: 'Svelte 前端框架', ja: 'Svelte', en: 'Svelte framework' } },
    'solidjs': { reading: 'ソリッドジェイエス', translations: { zh: 'SolidJS 前端框架', ja: 'SolidJS', en: 'SolidJS framework' } },
    'astro': { reading: 'アストロ', translations: { zh: 'Astro 静态站点框架', ja: 'Astro', en: 'Astro framework' } },
    'remix': { reading: 'レミックス', translations: { zh: 'Remix 全栈框架', ja: 'Remix', en: 'Remix full stack framework' } },
    'laravel': { reading: 'ララベル', translations: { zh: 'Laravel PHP 框架', ja: 'Laravel', en: 'Laravel PHP framework' } },
    'symfony': { reading: 'シンフォニー', translations: { zh: 'Symfony PHP 框架', ja: 'Symfony', en: 'Symfony PHP framework' } },
    'django': { reading: 'ジャンゴ', translations: { zh: 'Django Python 框架', ja: 'Django', en: 'Django Python framework' } },
    'flask': { reading: 'フラスク', translations: { zh: 'Flask Python 框架', ja: 'Flask', en: 'Flask Python framework' } },
    'fastapi': { reading: 'ファストエーピーアイ', translations: { zh: 'FastAPI Python 框架', ja: 'FastAPI', en: 'FastAPI Python framework' } },
    'pytorch': { reading: 'パイトーチ', translations: { zh: 'PyTorch 深度学习库', ja: 'PyTorch', en: 'PyTorch deep learning library' } },
    'tensorflow': { reading: 'テンソルフロー', translations: { zh: 'TensorFlow 深度学习框架', ja: 'TensorFlow', en: 'TensorFlow deep learning framework' } },
    'keras': { reading: 'ケラス', translations: { zh: 'Keras 神经网络库', ja: 'Keras', en: 'Keras neural network library' } },
    'scikit-learn': { reading: 'サイキットラーン', translations: { zh: 'Scikit-learn 机器学习库', ja: 'Scikit-learn', en: 'Scikit-learn ML library' } },
    'lightgbm': { reading: 'ライトジービーエム', translations: { zh: 'LightGBM 梯度提升库', ja: 'LightGBM', en: 'LightGBM boosting library' } },
    'xgboost': { reading: 'エックスジーブースト', translations: { zh: 'XGBoost 梯度提升库', ja: 'XGBoost', en: 'XGBoost library' } },
    'catboost': { reading: 'キャットブースト', translations: { zh: 'CatBoost 梯度提升库', ja: 'CatBoost', en: 'CatBoost library' } },
    'opencv': { reading: 'オーピーシーブイ', translations: { zh: 'OpenCV 计算机视觉库', ja: 'OpenCV', en: 'OpenCV computer vision' } },
    'pandas': { reading: 'パンダス', translations: { zh: 'Pandas 数据分析库', ja: 'Pandas', en: 'Pandas data analysis' } },
    'numpy': { reading: 'ナムパイ', translations: { zh: 'NumPy 数值计算库', ja: 'NumPy', en: 'NumPy numerical computing' } },
    'matplotlib': { reading: 'マットプロットリブ', translations: { zh: 'Matplotlib 绘图库', ja: 'Matplotlib', en: 'Matplotlib plotting library' } },
    'seaborn': { reading: 'シーボーン', translations: { zh: 'Seaborn 可视化库', ja: 'Seaborn', en: 'Seaborn visualization library' } },
    'plotly': { reading: 'プロットリー', translations: { zh: 'Plotly 可视化库', ja: 'Plotly', en: 'Plotly visualization library' } },
    'superset': { reading: 'スーパーセット', translations: { zh: 'Superset 数据可视化', ja: 'Superset', en: 'Superset data visualization' } },
    'metabase': { reading: 'メタベース', translations: { zh: 'Metabase 数据分析', ja: 'Metabase', en: 'Metabase analytics' } },
    'airflow': { reading: 'エアフロー', translations: { zh: 'Airflow 工作流调度', ja: 'Airflow', en: 'Airflow workflow orchestrator' } },
    'prefect': { reading: 'プレフェクト', translations: { zh: 'Prefect 工作流调度', ja: 'Prefect', en: 'Prefect workflow orchestrator' } },
    'dagster': { reading: 'ダグスター', translations: { zh: 'Dagster 数据编排', ja: 'Dagster', en: 'Dagster data orchestrator' } },
    'spark': { reading: 'スパーク', translations: { zh: 'Apache Spark 大数据引擎', ja: 'Apache Spark', en: 'Apache Spark big data engine' } },
    'hadoop': { reading: 'ハドゥープ', translations: { zh: 'Hadoop 大数据框架', ja: 'Hadoop', en: 'Hadoop framework' } },
    'hive': { reading: 'ハイブ', translations: { zh: 'Hive 数据仓库', ja: 'Hive', en: 'Hive data warehouse' } },
    'presto': { reading: 'プレスト', translations: { zh: 'Presto 分布式查询引擎', ja: 'Presto', en: 'Presto query engine' } },
    'trino': { reading: 'トリノ', translations: { zh: 'Trino 分布式查询引擎', ja: 'Trino', en: 'Trino query engine' } },
    'druid': { reading: 'ドルイド', translations: { zh: 'Druid 实时分析库', ja: 'Druid', en: 'Druid analytics database' } },
    'clickhouse': { reading: 'クリックハウス', translations: { zh: 'ClickHouse 列式数据库', ja: 'ClickHouse', en: 'ClickHouse columnar database' } },
    'cassandra': { reading: 'カサンドラ', translations: { zh: 'Cassandra 分布式数据库', ja: 'Cassandra', en: 'Apache Cassandra database' } },
    'dynamodb': { reading: 'ダイナモディービー', translations: { zh: 'Amazon DynamoDB', ja: 'DynamoDB', en: 'Amazon DynamoDB' } },
    'logstash': { reading: 'ログスタッシュ', translations: { zh: 'Logstash 日志管道', ja: 'Logstash', en: 'Logstash data pipeline' } },
    'graylog': { reading: 'グレーログ', translations: { zh: 'Graylog 日志平台', ja: 'Graylog', en: 'Graylog log platform' } },
    'splunk': { reading: 'スプランク', translations: { zh: 'Splunk 日志分析', ja: 'Splunk', en: 'Splunk log analytics' } },
    'datadog': { reading: 'データドッグ', translations: { zh: 'Datadog 监控平台', ja: 'Datadog', en: 'Datadog monitoring platform' } },
    'newrelic': { reading: 'ニューレリック', translations: { zh: 'New Relic 监控平台', ja: 'New Relic', en: 'New Relic monitoring' } },
    'tempo': { reading: 'テンポ', translations: { zh: 'Grafana Tempo 分布式追踪', ja: 'Tempo', en: 'Grafana Tempo tracing' } },
    'jaeger': { reading: 'イェーガー', translations: { zh: 'Jaeger 分布式追踪', ja: 'Jaeger', en: 'Jaeger tracing' } },
    'zipkin': { reading: 'ジップキン', translations: { zh: 'Zipkin 分布式追踪', ja: 'Zipkin', en: 'Zipkin tracing' } },
    'opentelemetry': { reading: 'オープンテレメトリー', translations: { zh: 'OpenTelemetry 可观测性', ja: 'OpenTelemetry', en: 'OpenTelemetry observability' } },
    'linkerd': { reading: 'リンカード', translations: { zh: 'Linkerd 服务网格', ja: 'Linkerd', en: 'Linkerd service mesh' } },
    'consul': { reading: 'コンスル', translations: { zh: 'Consul 服务发现', ja: 'Consul', en: 'Consul service discovery' } },
    'vault': { reading: 'ボールト', translations: { zh: 'Vault 秘密管理', ja: 'Vault', en: 'Vault secrets management' } },
    'nomad': { reading: 'ノマド', translations: { zh: 'Nomad 调度系统', ja: 'Nomad', en: 'Nomad scheduler' } },
    'terraform': { reading: 'テラフォーム', translations: { zh: 'Terraform 基础设施即代码', ja: 'Terraform', en: 'Terraform infrastructure as code' } },
    'pulumi': { reading: 'プルーミ', translations: { zh: 'Pulumi 基础设施即代码', ja: 'Pulumi', en: 'Pulumi infrastructure as code' } },
    'ansible': { reading: 'アンシブル', translations: { zh: 'Ansible 配置管理', ja: 'Ansible', en: 'Ansible configuration management' } },
    'chef': { reading: 'シェフ', translations: { zh: 'Chef 配置管理', ja: 'Chef', en: 'Chef configuration management' } },
    'puppet': { reading: 'パペット', translations: { zh: 'Puppet 配置管理', ja: 'Puppet', en: 'Puppet configuration management' } },
    'saltstack': { reading: 'ソルトスタック', translations: { zh: 'SaltStack 配置管理', ja: 'SaltStack', en: 'SaltStack configuration management' } },
    'bitbucket': { reading: 'ビットバケット', translations: { zh: 'Bitbucket 代码托管', ja: 'Bitbucket', en: 'Bitbucket code hosting' } },
    'gerrit': { reading: 'ゲリット', translations: { zh: 'Gerrit 代码评审', ja: 'Gerrit', en: 'Gerrit code review' } },
    'perforce': { reading: 'パーフォース', translations: { zh: 'Perforce 版本控制', ja: 'Perforce', en: 'Perforce version control' } },
    'svn': { reading: 'エスブイエヌ', translations: { zh: 'SVN 版本控制', ja: 'Subversion', en: 'Subversion version control' } },
    'mercurial': { reading: 'マーキュリアル', translations: { zh: 'Mercurial 分布式版本控制', ja: 'Mercurial', en: 'Mercurial DVCS' } },
    'bazaar': { reading: 'バザール', translations: { zh: 'Bazaar 版本控制', ja: 'Bazaar', en: 'Bazaar version control' } },
    'submodule': { reading: 'サブモジュール', translations: { zh: 'Git 子模块', ja: 'Gitサブモジュール', en: 'Git submodule' } },
    'monorepo': { reading: 'モノレポ', translations: { zh: 'Monorepo 单存储库模式', ja: 'モノレポ', en: 'Monorepo single repository' } },
    'microservice': { reading: 'マイクロサービス', translations: { zh: '微服务架构', ja: 'マイクロサービス', en: 'Microservice architecture' } },
    'serverless': { reading: 'サーバレス', translations: { zh: 'Serverless 无服务器架构', ja: 'サーバーレス', en: 'Serverless architecture' } },
    'lambda': { reading: 'ラムダ', translations: { zh: 'AWS Lambda 函数', ja: 'AWS Lambda', en: 'AWS Lambda function' } },
    'fargate': { reading: 'ファーゲート', translations: { zh: 'AWS Fargate 容器服务', ja: 'AWS Fargate', en: 'AWS Fargate service' } },
    'eks': { reading: 'イーケーエス', translations: { zh: 'Amazon EKS 托管 Kubernetes', ja: 'Amazon EKS', en: 'Amazon EKS managed Kubernetes' } },
    'aks': { reading: 'エーケーエス', translations: { zh: 'Azure AKS 托管 Kubernetes', ja: 'Azure AKS', en: 'Azure AKS managed Kubernetes' } },
    'gke': { reading: 'ジーケーイー', translations: { zh: 'Google GKE 托管 Kubernetes', ja: 'Google GKE', en: 'Google GKE managed Kubernetes' } },
    'cloudrun': { reading: 'クラウドルン', translations: { zh: 'Cloud Run 无服务器容器', ja: 'Cloud Run', en: 'Cloud Run serverless containers' } },
    'appengine': { reading: 'アップエンジン', translations: { zh: 'App Engine 平台', ja: 'App Engine', en: 'Google App Engine' } },
    'heroku': { reading: 'ヘロク', translations: { zh: 'Heroku 云平台', ja: 'Heroku', en: 'Heroku cloud platform' } },
    'vercel': { reading: 'バーセル', translations: { zh: 'Vercel 前端部署平台', ja: 'Vercel', en: 'Vercel deployment platform' } },
    'netlify': { reading: 'ネトリファイ', translations: { zh: 'Netlify 静态站点平台', ja: 'Netlify', en: 'Netlify static hosting' } },
    'firebase': { reading: 'ファイアベース', translations: { zh: 'Firebase 后端服务', ja: 'Firebase', en: 'Firebase backend service' } },
    'supabase': { reading: 'スーパベース', translations: { zh: 'Supabase 后端服务', ja: 'Supabase', en: 'Supabase backend service' } },
    'pocketbase': { reading: 'ポケットベース', translations: { zh: 'PocketBase 轻量后端', ja: 'PocketBase', en: 'PocketBase lightweight backend' } },
    'hasura': { reading: 'ハスラ', translations: { zh: 'Hasura GraphQL 服务', ja: 'Hasura', en: 'Hasura GraphQL service' } },
    'strapi': { reading: 'ストラピ', translations: { zh: 'Strapi Headless CMS', ja: 'Strapi', en: 'Strapi headless CMS' } },
    'contentful': { reading: 'コンテントフル', translations: { zh: 'Contentful Headless CMS', ja: 'Contentful', en: 'Contentful headless CMS' } },
    'sanity': { reading: 'サニティ', translations: { zh: 'Sanity Headless CMS', ja: 'Sanity', en: 'Sanity headless CMS' } },
    'notion': { reading: 'ノーション', translations: { zh: 'Notion 协作平台', ja: 'Notion', en: 'Notion collaboration platform' } },
    'figma': { reading: 'フィグマ', translations: { zh: 'Figma 设计工具', ja: 'Figma', en: 'Figma design tool' } },
    'sketch': { reading: 'スケッチ', translations: { zh: 'Sketch 设计工具', ja: 'Sketch', en: 'Sketch design tool' } },
    'photoshop': { reading: 'フォトショップ', translations: { zh: 'Photoshop 图像处理', ja: 'Photoshop', en: 'Photoshop image editor' } },
    'illustrator': { reading: 'イラストレーター', translations: { zh: 'Illustrator 矢量设计', ja: 'Illustrator', en: 'Adobe Illustrator' } },
    'premiere': { reading: 'プレミア', translations: { zh: 'Premiere 视频剪辑', ja: 'Premiere Pro', en: 'Adobe Premiere Pro' } },
    'aftereffects': { reading: 'アフターエフェクツ', translations: { zh: 'After Effects 动效', ja: 'After Effects', en: 'Adobe After Effects' } },
    'lightroom': { reading: 'ライトルーム', translations: { zh: 'Lightroom 照片管理', ja: 'Lightroom', en: 'Adobe Lightroom' } },
    'blender': { reading: 'ブレンダー', translations: { zh: 'Blender 三维建模', ja: 'Blender', en: 'Blender 3D modeling' } },
    'maya': { reading: 'マヤ', translations: { zh: 'Maya 三维软件', ja: 'Maya', en: 'Autodesk Maya' } },
    'autocad': { reading: 'オートキャド', translations: { zh: 'AutoCAD 设计软件', ja: 'AutoCAD', en: 'AutoCAD design software' } },
    'sap': { reading: 'エスエーピー', translations: { zh: 'SAP 企业资源规划', ja: 'SAP', en: 'SAP ERP' } },
    'salesforce': { reading: 'セールスフォース', translations: { zh: 'Salesforce 客户关系管理', ja: 'Salesforce', en: 'Salesforce CRM' } },
    'workday': { reading: 'ワークデイ', translations: { zh: 'Workday 企业管理', ja: 'Workday', en: 'Workday enterprise management' } },
    'slack': { reading: 'スラック', translations: { zh: 'Slack 协作工具', ja: 'Slack', en: 'Slack collaboration tool' } },
    'zoom': { reading: 'ズーム', translations: { zh: 'Zoom 会议软件', ja: 'Zoom', en: 'Zoom video meeting' } },
    'teams': { reading: 'チームズ', translations: { zh: 'Microsoft Teams 协作', ja: 'Microsoft Teams', en: 'Microsoft Teams collaboration' } },
    'meet': { reading: 'ミート', translations: { zh: 'Google Meet 会议', ja: 'Google Meet', en: 'Google Meet video meeting' } },
    'webex': { reading: 'ウェベックス', translations: { zh: 'Webex 会议', ja: 'Webex', en: 'Cisco Webex meeting' } },
    'outlook': { reading: 'アウトルック', translations: { zh: 'Outlook 邮件客户端', ja: 'Outlook', en: 'Microsoft Outlook email client' } },
    'gmail': { reading: 'ジーメール', translations: { zh: 'Gmail 邮件服务', ja: 'Gmail', en: 'Gmail email service' } },
    'exchange': { reading: 'エクスチェンジ', translations: { zh: 'Exchange 邮件服务', ja: 'Exchange', en: 'Microsoft Exchange service' } },
    'onedrive': { reading: 'ワンドライブ', translations: { zh: 'OneDrive 云存储', ja: 'OneDrive', en: 'OneDrive cloud storage' } },
    'drive': { reading: 'ドライブ', translations: { zh: 'Google Drive 云存储', ja: 'Google Drive', en: 'Google Drive cloud storage' } },
    'dropbox': { reading: 'ドロップボックス', translations: { zh: 'Dropbox 云存储', ja: 'Dropbox', en: 'Dropbox cloud storage' } },
    'box': { reading: 'ボックス', translations: { zh: 'Box 企业云盘', ja: 'Box', en: 'Box cloud storage' } },
    'evernote': { reading: 'エバーノート', translations: { zh: 'Evernote 笔记应用', ja: 'Evernote', en: 'Evernote note app' } },
    'notion.so': { reading: 'ノーション', translations: { zh: 'Notion 协作平台', ja: 'Notion', en: 'Notion collaboration platform' } },
    'obsidian': { reading: 'オブシディアン', translations: { zh: 'Obsidian 知识管理', ja: 'Obsidian', en: 'Obsidian knowledge base' } },
    'logseq': { reading: 'ログシーク', translations: { zh: 'Logseq 知识管理', ja: 'Logseq', en: 'Logseq knowledge base' } },
    'anki': { reading: 'アンキ', translations: { zh: 'Anki 问答卡片', ja: 'Anki', en: 'Anki spaced repetition' } },
    'ankiweb': { reading: 'アンキウェブ', translations: { zh: 'AnkiWeb 同步服务', ja: 'AnkiWeb', en: 'AnkiWeb sync service' } },
    'notepad++': { reading: 'ノートパッドプラスプラス', translations: { zh: 'Notepad++ 文本编辑器', ja: 'Notepad++', en: 'Notepad++ text editor' } },
    'sublime': { reading: 'サブライム', translations: { zh: 'Sublime Text 编辑器', ja: 'Sublime Text', en: 'Sublime Text editor' } },
    'vscode': { reading: 'ブイエスコード', translations: { zh: 'Visual Studio Code 编辑器', ja: 'Visual Studio Code', en: 'Visual Studio Code editor' } },
    'intellij': { reading: 'インテリジェイ', translations: { zh: 'IntelliJ IDEA 集成开发环境', ja: 'IntelliJ IDEA', en: 'IntelliJ IDEA IDE' } },
    'pycharm': { reading: 'パイチャーム', translations: { zh: 'PyCharm Python IDE', ja: 'PyCharm', en: 'PyCharm IDE' } },
    'webstorm': { reading: 'ウェブストーム', translations: { zh: 'WebStorm JavaScript IDE', ja: 'WebStorm', en: 'WebStorm IDE' } },
    'clion': { reading: 'シーライオン', translations: { zh: 'CLion C/C++ IDE', ja: 'CLion', en: 'CLion IDE' } },
    'rider': { reading: 'ライダー', translations: { zh: 'Rider .NET IDE', ja: 'Rider', en: 'Rider .NET IDE' } },
    'androidstudio': { reading: 'アンドロイドスタジオ', translations: { zh: 'Android Studio IDE', ja: 'Android Studio', en: 'Android Studio IDE' } },
    'xcode': { reading: 'エックスコード', translations: { zh: 'Xcode iOS 开发工具', ja: 'Xcode', en: 'Xcode IDE' } },
    'visual studio': { reading: 'ビジュアルスタジオ', translations: { zh: 'Visual Studio IDE', ja: 'Visual Studio', en: 'Visual Studio IDE' } },
    'dreamweaver': { reading: 'ドリームウィーバー', translations: { zh: 'Dreamweaver 网页设计', ja: 'Dreamweaver', en: 'Adobe Dreamweaver' } },
    'frontpage': { reading: 'フロントページ', translations: { zh: 'FrontPage 网页编辑器', ja: 'FrontPage', en: 'Microsoft FrontPage' } },
    'powerbi': { reading: 'パワービーアイ', translations: { zh: 'Power BI 商业智能', ja: 'Power BI', en: 'Power BI business intelligence' } },
    'tableau': { reading: 'タブロー', translations: { zh: 'Tableau 数据分析', ja: 'Tableau', en: 'Tableau analytics' } },
    'looker': { reading: 'ルッカー', translations: { zh: 'Looker 数据平台', ja: 'Looker', en: 'Looker data platform' } },
    'qlik': { reading: 'クリック', translations: { zh: 'Qlik 数据分析', ja: 'Qlik', en: 'Qlik analytics' } },
    'snowflake': { reading: 'スノーフレーク', translations: { zh: 'Snowflake 云数据仓库', ja: 'Snowflake', en: 'Snowflake cloud data warehouse' } },
    'bigquery': { reading: 'ビッグクエリ', translations: { zh: 'BigQuery 大数据分析', ja: 'BigQuery', en: 'BigQuery analytics' } },
    'redshift': { reading: 'レッドシフト', translations: { zh: 'Amazon Redshift 数据仓库', ja: 'Amazon Redshift', en: 'Amazon Redshift data warehouse' } },
    'glue': { reading: 'グルー', translations: { zh: 'AWS Glue 数据集成', ja: 'AWS Glue', en: 'AWS Glue data integration' } },
    'athena': { reading: 'アテナ', translations: { zh: 'Amazon Athena 查询服务', ja: 'Amazon Athena', en: 'Amazon Athena query service' } },
    'kinesis': { reading: 'キネシス', translations: { zh: 'Amazon Kinesis 流数据', ja: 'Amazon Kinesis', en: 'Amazon Kinesis data streams' } },
    'firehose': { reading: 'ファイアホース', translations: { zh: 'Amazon Kinesis Firehose', ja: 'Kinesis Firehose', en: 'Kinesis Data Firehose' } },
    'eventbridge': { reading: 'イベントブリッジ', translations: { zh: 'Amazon EventBridge 事件总线', ja: 'Amazon EventBridge', en: 'Amazon EventBridge event bus' } },
    'sqs': { reading: 'エスキューエス', translations: { zh: 'Amazon SQS 队列', ja: 'Amazon SQS', en: 'Amazon SQS queue' } },
    'sns': { reading: 'エスエヌエス', translations: { zh: 'Amazon SNS 通知', ja: 'Amazon SNS', en: 'Amazon SNS notifications' } },
    'activemq': { reading: 'アクティブエムキュー', translations: { zh: 'ActiveMQ 消息代理', ja: 'ActiveMQ', en: 'ActiveMQ message broker' } },
    'pulsar': { reading: 'パルサー', translations: { zh: 'Apache Pulsar 流处理', ja: 'Apache Pulsar', en: 'Apache Pulsar streaming' } },
    'nats': { reading: 'ナッツ', translations: { zh: 'NATS 消息系统', ja: 'NATS', en: 'NATS messaging system' } },
    'mqtt': { reading: 'エムキューティーティー', translations: { zh: 'MQTT 物联网协议', ja: 'MQTT', en: 'MQTT IoT protocol' } },
    'coap': { reading: 'コーアップ', translations: { zh: 'CoAP 受限应用协议', ja: 'CoAP', en: 'CoAP constrained application protocol' } },
    'lorawan': { reading: 'ロラワン', translations: { zh: 'LoRaWAN 低功耗广域网络', ja: 'LoRaWAN', en: 'LoRaWAN low power wide area network' } },
    'zigbee': { reading: 'ジグビー', translations: { zh: 'Zigbee 无线协议', ja: 'Zigbee', en: 'Zigbee wireless protocol' } },
    'bluetooth': { reading: 'ブルートゥース', translations: { zh: 'Bluetooth 蓝牙', ja: 'Bluetooth', en: 'Bluetooth wireless technology' } },
    'wifi': { reading: 'ワイファイ', translations: { zh: 'Wi-Fi 无线网络', ja: 'Wi-Fi', en: 'Wi-Fi wireless network' } },
    'ethernet': { reading: 'イーサネット', translations: { zh: '以太网协议', ja: 'Ethernet', en: 'Ethernet protocol' } },
    'lan': { reading: 'ラン', translations: { zh: '局域网', ja: 'LAN', en: 'Local Area Network' } },
    'wan': { reading: 'ワン', translations: { zh: '广域网', ja: 'WAN', en: 'Wide Area Network' } },
    'vpn': { reading: 'ブイピーエヌ', translations: { zh: 'VPN 虚拟专用网络', ja: 'VPN', en: 'Virtual Private Network' } },
    'firewall': { reading: 'ファイアウォール', translations: { zh: '防火墙', ja: 'ファイアウォール', en: 'Firewall' } },
    'intrusion': { reading: 'イントルージョン', translations: { zh: '入侵检测', ja: '侵入検知', en: 'Intrusion detection' } },
    'honeypot': { reading: 'ハニーポット', translations: { zh: '蜜罐系统', ja: 'ハニーポット', en: 'Honeypot security system' } },
    'malware': { reading: 'マルウェア', translations: { zh: '恶意软件', ja: 'マルウェア', en: 'Malware' } },
    'ransomware': { reading: 'ランサムウェア', translations: { zh: '勒索软件', ja: 'ランサムウェア', en: 'Ransomware' } },
    'phishing': { reading: 'フィッシング', translations: { zh: '网络钓鱼', ja: 'フィッシング', en: 'Phishing' } },
    'spoofing': { reading: 'スプーフィング', translations: { zh: '欺骗攻击', ja: 'スプーフィング', en: 'Spoofing attack' } },
    'botnet': { reading: 'ボットネット', translations: { zh: '僵尸网络', ja: 'ボットネット', en: 'Botnet' } },
    'zero-day': { reading: 'ゼロデイ', translations: { zh: '零日漏洞', ja: 'ゼロデイ脆弱性', en: 'Zero-day vulnerability' } },
    'patch': { reading: 'パッチ', translations: { zh: '补丁程序', ja: 'パッチ', en: 'Software patch' } },
    'firmware': { reading: 'ファームウェア', translations: { zh: '固件', ja: 'ファームウェア', en: 'Firmware' } },
    'bios': { reading: 'バイオス', translations: { zh: 'BIOS 固件', ja: 'BIOS', en: 'BIOS firmware' } },
    'uefi': { reading: 'ウエフィ', translations: { zh: 'UEFI 固件接口', ja: 'UEFI', en: 'UEFI firmware interface' } },
    'sata': { reading: 'サタ', translations: { zh: 'SATA 接口', ja: 'SATA', en: 'Serial ATA interface' } },
    'nvme': { reading: 'エヌブイエムイー', translations: { zh: 'NVMe 高速接口', ja: 'NVMe', en: 'NVMe high-speed interface' } },
    'ssd': { reading: 'エスエスディー', translations: { zh: 'SSD 固态硬盘', ja: 'SSD', en: 'Solid State Drive' } },
    'hdd': { reading: 'エイチディーディー', translations: { zh: 'HDD 机械硬盘', ja: 'HDD', en: 'Hard Disk Drive' } },
    'raid': { reading: 'レイド', translations: { zh: 'RAID 磁盘阵列', ja: 'RAID', en: 'RAID disk array' } },
    'san': { reading: 'サン', translations: { zh: 'SAN 存储网络', ja: 'SAN', en: 'Storage Area Network' } },
    'nas': { reading: 'ナス', translations: { zh: 'NAS 网络存储', ja: 'NAS', en: 'Network Attached Storage' } },
    'ipfs': { reading: 'アイピーフェス', translations: { zh: 'IPFS 行星文件系统', ja: 'IPFS', en: 'InterPlanetary File System' } },
    'blockchain': { reading: 'ブロックチェーン', translations: { zh: '区块链', ja: 'ブロックチェーン', en: 'Blockchain' } },
    'smart contract': { reading: 'スマートコントラクト', translations: { zh: '智能合约', ja: 'スマートコントラクト', en: 'Smart contract' } },
    'ethereum': { reading: 'イーサリアム', translations: { zh: '以太坊', ja: 'イーサリアム', en: 'Ethereum' } },
    'solidity': { reading: 'ソリディティ', translations: { zh: 'Solidity 合约语言', ja: 'Solidity', en: 'Solidity contract language' } },
    'bitcoin': { reading: 'ビットコイン', translations: { zh: '比特币', ja: 'ビットコイン', en: 'Bitcoin' } },
    'defi': { reading: 'ディーファイ', translations: { zh: '去中心化金融', ja: 'ディーファイ', en: 'Decentralized finance' } },
    'nft': { reading: 'エヌエフティー', translations: { zh: '非同质化代币', ja: 'NFT', en: 'Non-Fungible Token' } },
    'metaverse': { reading: 'メタバース', translations: { zh: 'Metaverse 元宇宙', ja: 'メタバース', en: 'Metaverse virtual world' } },
    'digital twin': { reading: 'デジタルツイン', translations: { zh: '数字孪生', ja: 'デジタルツイン', en: 'Digital twin' } },
    'aiops': { reading: 'エーアイオプス', translations: { zh: 'AIOps 智能运维', ja: 'AIOps', en: 'AI for IT Operations' } },
    'mlops': { reading: 'エムエルオプス', translations: { zh: 'MLOps 机器学习运维', ja: 'MLOps', en: 'Machine Learning Operations' } },
    'dataops': { reading: 'データオプス', translations: { zh: 'DataOps 数据运维', ja: 'DataOps', en: 'Data Operations' } },
    'finops': { reading: 'フィンオプス', translations: { zh: 'FinOps 云成本管理', ja: 'FinOps', en: 'Financial Operations' } },
    'revops': { reading: 'レブオプス', translations: { zh: 'RevOps 收入运营', ja: 'RevOps', en: 'Revenue Operations' } },
    'sre': { reading: 'エスアールイー', translations: { zh: 'SRE 网站可靠性工程', ja: 'SRE', en: 'Site Reliability Engineering' } },
    'pagerduty': { reading: 'ペイジャーデューティー', translations: { zh: 'PagerDuty 值班系统', ja: 'PagerDuty', en: 'PagerDuty incident response' } },
    'opsgenie': { reading: 'オプスジニー', translations: { zh: 'Opsgenie 值班系统', ja: 'Opsgenie', en: 'Opsgenie incident management' } },
    'statuspage': { reading: 'ステータスページ', translations: { zh: 'Statuspage 状态页服务', ja: 'Statuspage', en: 'Statuspage status service' } },
    'incident': { reading: 'インシデント', translations: { zh: '事故事件', ja: 'インシデント', en: 'Incident' } },
    'postmortem': { reading: 'ポストモーテム', translations: { zh: '故障复盘', ja: 'ポストモーテム', en: 'Postmortem review' } },
    'sla': { reading: 'エスエルエー', translations: { zh: '服务等级协议', ja: 'SLA', en: 'Service Level Agreement' } },
    'slo': { reading: 'エスエルオー', translations: { zh: '服务等级目标', ja: 'SLO', en: 'Service Level Objective' } },
    'sli': { reading: 'エスエルアイ', translations: { zh: '服务等级指标', ja: 'SLI', en: 'Service Level Indicator' } },
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

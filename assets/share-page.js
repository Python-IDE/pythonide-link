(function (global) {
  'use strict';

  const API_BASE = 'https://community-api-axuaystczl.cn-hangzhou.fcapp.run';
  const APP_STORE_URL = 'https://apps.apple.com/app/id6753987304';
  const SITE_ORIGIN = 'https://link.pythonide.xin';
  const DEFAULT_TITLE = 'Python IDE 社区作品';
  const DEFAULT_DESCRIPTION = '在 Python IDE 中查看、运行和导入社区作品。';
  const DEFAULT_SHARE_IMAGE = `${SITE_ORIGIN}/assets/app-icon.png`;

  const CATEGORY_LABELS = {
    python: 'Python',
    miniapp: 'MiniApp',
    appui: 'AppUI',
    html: 'HTML',
    scene: 'Scene',
    pygame: 'Pygame',
    widget: 'Widget',
    other: '社区作品',
  };

  const FILE_LABELS = {
    py: 'PY',
    pyw: 'PY',
    html: 'HTML',
    htm: 'HTML',
    js: 'JS',
    css: 'CSS',
    json: 'JSON',
    miniapp: 'APP',
    minip: 'APP',
    zip: 'ZIP',
  };

  const COPY = {
    zh: {
      communityWork: 'PythonIDE 社区作品',
      loadingWork: '正在加载作品',
      openApp: '在 PythonIDE 中打开',
      downloadApp: '下载 PythonIDE',
      copyLink: '复制分享链接',
      copied: '链接已复制',
      copyFallback: '请长按地址栏复制链接',
      browserNote: '若没有自动打开，请确认已安装最新版 PythonIDE。',
      embeddedNote: '微信内无法跳转时，请从右上角菜单使用系统浏览器打开。',
      actionTitle: '在 PythonIDE 中打开',
      actionDescription: '运行代码、查看完整项目并保存到你的设备。',
      launchTitle: '没有打开 App？',
      launchBody: '请再次尝试，或先下载最新版 PythonIDE。',
      modalKicker: '在系统浏览器中继续',
      modalTitle: '从右上角菜单打开浏览器',
      modalStep1: '点击页面右上角的菜单按钮',
      modalStep2: '选择“在默认浏览器中打开”',
      modalStep3: '再次点击“在 PythonIDE 中打开”',
      gotIt: '我知道了',
      readOnly: '只读预览',
      partial: '部分预览',
      codePreview: '代码预览',
      workPreview: '作品预览',
      singleFile: '单文件',
      project: '项目',
      views: '浏览',
      likes: '喜欢',
      runs: '运行',
      imports: '导入',
      updated: (date) => date ? `${date}更新` : '社区创作者',
      statusUnavailable: '暂时无法加载作品预览',
      statusUnavailableBody: '请检查网络后重试，或直接在 PythonIDE 中打开。',
      retry: '重新加载',
      openCommunityWork: '打开社区作品',
      previewFailedBody: '预览暂时没有加载成功，但仍可直接在 PythonIDE 中打开。',
      previewUnavailable: '预览暂不可用',
      previewUnavailableBody: '使用下方按钮在 PythonIDE 中打开这个作品。',
      community: '社区作品',
      remoteImport: '远程导入',
      importRemoteProject: '导入远程项目',
      missingProjectURL: '缺少项目地址',
      remoteSummary: '确认来源可信后，在 PythonIDE 中继续下载和导入。',
      invalidRemoteSummary: '这个导入链接没有包含有效的远程项目地址。',
      remoteProject: '远程项目',
      invalidLink: '无效链接',
      trustedSource: '请返回分享来源获取完整链接。',
      importInApp: '在 PythonIDE 中导入',
      cannotImport: '无法继续导入',
      externalWarning: '外部项目可能包含不受信任的代码，请只导入你了解的来源。',
      verifySource: '导入前请确认来源',
      verifySourceBody: '远程项目可能包含可执行代码，请只导入可信链接。',
      transfer: '传输',
      preview: '预览',
      method: '导入方式',
      source: '来源',
      readOnlyValue: '只读',
      confirmValue: '确认',
      shareLink: '分享链接',
      continueInApp: '在 PythonIDE 中继续',
      shortSummary: '这个短链接将在 PythonIDE 中解析并打开对应内容。',
      pythonIDEShare: 'PythonIDE 分享',
      useButton: '使用下方按钮在 App 中继续。',
      safeValue: '安全',
      linkStructure: '链接结构',
      openMethod: '打开方式',
      content: '内容',
      status: '状态',
      homeTitle: '把灵感变成可以运行的作品',
      homeSummary: '在 iPhone 和 iPad 上编写 Python，探索社区作品、AppUI、MiniApp 和更多原生能力。',
      homeDetail: 'iPhone 与 iPad 上的 Python 开发工具',
      homePreview: '编写、运行并分享属于你的 Python 作品。',
      language: '语言',
      platform: '平台',
      native: '原生',
      experience: '体验',
      skipLink: '跳到作品内容',
      website: '官网',
      privacy: '隐私',
      workPreviewLabel: '作品预览',
      codePreviewLabel: '代码预览',
      coverAlt: '作品封面',
      statsLabel: '作品数据',
    },
    en: {
      communityWork: 'PythonIDE Community',
      loadingWork: 'Loading work',
      openApp: 'Open in PythonIDE',
      downloadApp: 'Download PythonIDE',
      copyLink: 'Copy share link',
      copied: 'Link copied',
      copyFallback: 'Press and hold the address bar to copy the link',
      browserNote: 'If nothing opens, make sure the latest PythonIDE is installed.',
      embeddedNote: 'If WeChat blocks the app, use the top-right menu to open this page in your default browser.',
      actionTitle: 'Open in PythonIDE',
      actionDescription: 'Run the code, view the complete project, and save it to your device.',
      launchTitle: 'App did not open?',
      launchBody: 'Try again, or download the latest PythonIDE first.',
      modalKicker: 'Continue in your browser',
      modalTitle: 'Open this page from the top-right menu',
      modalStep1: 'Tap the menu button in the top-right corner',
      modalStep2: 'Choose “Open in Default Browser”',
      modalStep3: 'Tap “Open in PythonIDE” again',
      gotIt: 'Got it',
      readOnly: 'Read-only preview',
      partial: 'Partial preview',
      codePreview: 'Code preview',
      workPreview: 'Work preview',
      singleFile: 'single file',
      project: 'project',
      views: 'Views',
      likes: 'Likes',
      runs: 'Runs',
      imports: 'Imports',
      updated: (date) => date ? `Updated ${date}` : 'Community creator',
      statusUnavailable: 'Preview is temporarily unavailable',
      statusUnavailableBody: 'Check your connection and retry, or open it directly in PythonIDE.',
      retry: 'Retry',
      openCommunityWork: 'Open community work',
      previewFailedBody: 'The preview could not load, but the work can still be opened in PythonIDE.',
      previewUnavailable: 'Preview unavailable',
      previewUnavailableBody: 'Use the buttons below to open this work in PythonIDE.',
      community: 'Community work',
      remoteImport: 'Remote import',
      importRemoteProject: 'Import remote project',
      missingProjectURL: 'Project URL missing',
      remoteSummary: 'Confirm that you trust the source, then continue the import in PythonIDE.',
      invalidRemoteSummary: 'This import link does not contain a valid remote project URL.',
      remoteProject: 'Remote project',
      invalidLink: 'Invalid link',
      trustedSource: 'Return to the source of this share to get the complete link.',
      importInApp: 'Import in PythonIDE',
      cannotImport: 'Unable to import',
      externalWarning: 'External projects may contain untrusted code. Import only from sources you know.',
      verifySource: 'Verify the source before importing',
      verifySourceBody: 'Remote projects may contain executable code. Import only trusted links.',
      transfer: 'Transfer',
      preview: 'Preview',
      method: 'Method',
      source: 'Source',
      readOnlyValue: 'Read only',
      confirmValue: 'Confirm',
      shareLink: 'Share link',
      continueInApp: 'Continue in PythonIDE',
      shortSummary: 'PythonIDE will resolve this short link and open the corresponding content.',
      pythonIDEShare: 'PythonIDE Share',
      useButton: 'Use the buttons below to continue in the app.',
      safeValue: 'Safe',
      linkStructure: 'Link',
      openMethod: 'Open with',
      content: 'Content',
      status: 'Status',
      homeTitle: 'Turn ideas into working projects',
      homeSummary: 'Write Python on iPhone and iPad, explore community projects, AppUI, MiniApp, and more native capabilities.',
      homeDetail: 'Python development for iPhone and iPad',
      homePreview: 'Write, run, and share your own Python projects.',
      language: 'Language',
      platform: 'Platform',
      native: 'Native',
      experience: 'Experience',
      skipLink: 'Skip to the work',
      website: 'Website',
      privacy: 'Privacy',
      workPreviewLabel: 'Work preview',
      codePreviewLabel: 'Code preview',
      coverAlt: 'Work cover',
      statsLabel: 'Work statistics',
    },
  };

  function decodeSegment(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function safeForwardedPath(value) {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '';
    try {
      const url = new URL(value, SITE_ORIGIN);
      return url.origin === SITE_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : '';
    } catch {
      return '';
    }
  }

  function preferredLanguage(path, navigatorLanguage, storedLanguage) {
    try {
      const requested = new URL(path || '/', SITE_ORIGIN).searchParams.get('lang');
      if (requested === 'zh' || requested === 'en') return requested;
    } catch {
      // Fall through to the saved or browser language.
    }
    if (storedLanguage === 'zh' || storedLanguage === 'en') return storedLanguage;
    return String(navigatorLanguage || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function parseRoutePath(value) {
    const path = safeForwardedPath(value) || '/';
    const url = new URL(path, SITE_ORIGIN);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 's' && parts[1]) {
      return { type: 'script', id: decodeSegment(parts[1]), path: url.pathname };
    }
    if (parts[0] === 'l' && parts[1]) {
      return { type: 'short', code: decodeSegment(parts[1]), path: url.pathname };
    }
    if (parts[0] === 'import') {
      return {
        type: 'import',
        remote: url.searchParams.get('url') || url.searchParams.get('u') || '',
        path: `${url.pathname}${url.search}`,
      };
    }
    return { type: 'home', path: '/' };
  }

  function routeDisplayPath(route, languageValue = 'zh', hash = '') {
    const url = new URL(route?.path || '/', SITE_ORIGIN);
    url.searchParams.delete('v');
    if (languageValue === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    return `${url.pathname}${url.search}${hash || ''}`;
  }

  function customURLFor(route) {
    if (route.type === 'script') {
      return `pythonide://community/script?id=${encodeURIComponent(route.id)}`;
    }
    if (route.type === 'short') {
      return `pythonide://link?code=${encodeURIComponent(route.code)}`;
    }
    if (route.type === 'import' && route.remote) {
      return `pythonide://import?url=${encodeURIComponent(route.remote)}`;
    }
    return 'pythonide://';
  }

  function detectEmbeddedBrowser(userAgent) {
    const ua = String(userAgent || '');
    if (/MicroMessenger/i.test(ua)) return { embedded: true, name: '微信', key: 'wechat' };
    if (/QQ\//i.test(ua) || /MQQBrowser/i.test(ua)) return { embedded: true, name: 'QQ', key: 'qq' };
    if (/Weibo/i.test(ua)) return { embedded: true, name: '微博', key: 'weibo' };
    if (/DingTalk/i.test(ua)) return { embedded: true, name: '钉钉', key: 'dingtalk' };
    if (/BytedanceWebview|Toutiao|Aweme/i.test(ua)) return { embedded: true, name: '当前应用', key: 'bytedance' };
    return { embedded: false, name: '', key: '' };
  }

  function formatCount(value, locale) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) return '0';
    try {
      return new Intl.NumberFormat(locale || 'zh-CN', {
        notation: number >= 10000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
      }).format(number);
    } catch {
      return String(Math.round(number));
    }
  }

  function normalizedTags(script) {
    const values = [];
    [script.category, ...(Array.isArray(script.ai_tags) ? script.ai_tags : []), ...(Array.isArray(script.tags) ? script.tags : [])]
      .forEach((value) => {
        const tag = String(value || '').trim();
        if (tag && !values.some((item) => item.toLowerCase() === tag.toLowerCase())) values.push(tag);
      });
    return values.slice(0, 6);
  }

  function previewLines(content, maxLines, maxCharacters) {
    const source = String(content || '').replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
    if (!source.trim()) return [];
    const bounded = source.slice(0, maxCharacters || 8000);
    return bounded.split('\n').slice(0, maxLines || 34).map((line) => line.slice(0, 320));
  }

  function safeImageURL(value) {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function filePresentation(script) {
    const fileType = String(script.file_type || '').trim().replace(/^\./, '').toLowerCase();
    const category = String(script.category || 'other').trim().toLowerCase();
    const runtime = String(script.runtime || '').trim();
    return {
      badge: FILE_LABELS[fileType] || FILE_LABELS[category] || String(fileType || category || 'CODE').slice(0, 4).toUpperCase(),
      categoryLabel: CATEGORY_LABELS[category] || category || '社区作品',
      detail: [fileType ? `.${fileType}` : '', runtime].filter(Boolean).join(' · ') || 'Python IDE 作品',
      language: fileType || category || 'code',
    };
  }

  function isProjectScript(script) {
    const contentMode = String(script.content_mode || '').toLowerCase();
    const tags = normalizedTags(script).map((value) => value.toLowerCase());
    return contentMode === 'project_package'
      || Boolean(script.package_id)
      || tags.includes('project')
      || tags.includes('project_package')
      || tags.includes('community_content_mode:project_package');
  }

  function typePresentation(script, languageValue = 'zh') {
    const locale = languageValue === 'en' ? 'en' : 'zh';
    const category = String(script.category || '').trim().toLowerCase();
    const fileType = String(script.file_type || '').trim().replace(/^\./, '').toLowerCase();
    const tags = normalizedTags(script).map((value) => value.toLowerCase());
    const taggedRuntime = tags.find((value) => value.startsWith('community_runtime:'))?.split(':').slice(1).join(':') || '';
    const runtime = String(script.runtime || taggedRuntime).trim().toLowerCase();
    const project = isProjectScript(script);
    const format = project
      ? (locale === 'en' ? 'project' : '项目')
      : (locale === 'en' ? 'single file' : '单文件');
    const matches = (...values) => values.some((value) => (
      category === value || fileType === value || runtime === value || tags.includes(value)
    ));

    if (matches('pygame', 'scene', 'game')) {
      const runtimeLabel = matches('pygame') ? 'Pygame ' : (matches('scene') ? 'Scene ' : '');
      return { kind: 'game', symbol: '', label: `Game · ${runtimeLabel}${format}`, isProject: project };
    }
    if (matches('miniapp', 'minip')) {
      return { kind: 'miniapp', symbol: '', label: `MiniApp · ${format}`, isProject: project };
    }
    if (matches('appui', 'ui')) {
      return { kind: 'appui', symbol: '', label: `AppUI · ${format}`, isProject: project };
    }
    if (matches('widget', 'widgets')) {
      return { kind: 'widget', symbol: '', label: `Widget · ${format}`, isProject: project };
    }
    if (matches('html', 'htm')) {
      return { kind: 'html', symbol: '</>', label: `HTML · ${format}`, isProject: project };
    }
    if (matches('python', 'py', 'pyw')) {
      return { kind: 'python', symbol: 'PY', label: `Python · ${format}`, isProject: project };
    }
    return {
      kind: 'other',
      symbol: '{ }',
      label: locale === 'en' ? 'PythonIDE · Community work' : 'PythonIDE · 社区作品',
      isProject: project,
    };
  }

  function shareRevision(script, scriptID = '') {
    const source = String(
      script?.content_hash || script?.updated_at || script?.approved_at || script?.version || scriptID || 'preview',
    );
    let hash = 2166136261;
    for (const character of source) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function shareImageURL(script, scriptID) {
    const cover = safeImageURL(script?.cover_image_url || script?.preview_image_url || script?.thumbnail_url);
    if (cover) return cover;
    return `${SITE_ORIGIN}/og/script/${encodeURIComponent(scriptID)}.png?v=${shareRevision(script, scriptID)}`;
  }

  function socialDescription(script) {
    return String(script.ai_summary || script.summary || DEFAULT_DESCRIPTION).trim().slice(0, 150) || DEFAULT_DESCRIPTION;
  }

  function hostnameFor(value) {
    try {
      return new URL(value).hostname;
    } catch {
      return '';
    }
  }

  const core = {
    customURLFor,
    decodeSegment,
    detectEmbeddedBrowser,
    filePresentation,
    formatCount,
    isProjectScript,
    normalizedTags,
    parseRoutePath,
    previewLines,
    preferredLanguage,
    routeDisplayPath,
    safeForwardedPath,
    safeImageURL,
    shareImageURL,
    shareRevision,
    socialDescription,
    typePresentation,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  global.PythonIDEShareCore = core;
  if (typeof document === 'undefined') return;

  const query = new URLSearchParams(location.search);
  const forwardedPath = safeForwardedPath(query.get('path'));
  const initialPath = forwardedPath || `${location.pathname}${location.search}${location.hash}`;
  const route = parseRoutePath(initialPath);
  const embeddedBrowser = detectEmbeddedBrowser(navigator.userAgent);
  let savedLanguage = '';
  try {
    savedLanguage = localStorage.getItem('pythonide_share_language') || '';
  } catch {
    // Private browsing may make storage unavailable.
  }
  let language = preferredLanguage(initialPath, navigator.language, savedLanguage);
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  document.documentElement.dataset.lang = language;

  if (global.history && typeof global.history.replaceState === 'function') {
    try {
      const cleanDisplayPath = routeDisplayPath(route, language, new URL(initialPath, SITE_ORIGIN).hash);
      const visiblePath = `${location.pathname}${location.search}${location.hash}`;
      if (forwardedPath || visiblePath !== cleanDisplayPath) {
        global.history.replaceState(null, '', cleanDisplayPath);
      }
    } catch {
      // Keep the fallback URL if the browser rejects history replacement.
    }
  }

  const el = {};
  [
    'eyebrow', 'title', 'summary', 'authorRow', 'authorAvatar', 'authorInitial', 'authorName', 'authorDetail',
    'workCard', 'typeSymbol', 'typeLabel', 'previewLabel', 'previewSkeleton', 'coverPreview', 'coverImage',
    'codePreview', 'codeContent', 'posterPreview', 'posterSymbol', 'projectFacts',
    'stats', 'openApp', 'openAppLabel', 'downloadApp', 'downloadAppLabel', 'copyLink', 'browserNote',
    'launchFallback', 'statusCard', 'statusTitle', 'statusMessage', 'retryButton', 'browserModal', 'modalKicker',
    'browserModalTitle', 'modalStep1', 'modalStep2', 'modalStep3', 'modalBackdrop', 'modalCopyLink', 'modalClose',
    'toast', 'actionTitle', 'actionDescription', 'skipLink', 'footerWebsite', 'footerPrivacy',
  ].forEach((id) => { el[id] = document.getElementById(id); });

  let retryAction = null;
  let toastTimer = null;
  let launchTimer = null;
  let currentScript = null;
  let currentView = route.type;

  function setLoading(isLoading) {
    document.body.classList.toggle('is-loading', isLoading);
    el.workCard.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    el.previewSkeleton.classList.toggle('hidden', !isLoading);
    if (isLoading) hidePreviews();
  }

  function setText(target, value) {
    if (target) target.textContent = String(value || '');
  }

  function tr(key) {
    return COPY[language]?.[key] ?? COPY.zh[key] ?? key;
  }

  function applyStaticCopy() {
    setText(el.openAppLabel, tr('openApp'));
    setText(el.downloadAppLabel, tr('downloadApp'));
    setText(el.copyLink, tr('copyLink'));
    setText(el.actionTitle, tr('actionTitle'));
    setText(el.actionDescription, tr('actionDescription'));
    setText(el.modalKicker, tr('modalKicker'));
    setText(el.browserModalTitle, tr('modalTitle'));
    setText(el.modalStep1, tr('modalStep1'));
    setText(el.modalStep2, tr('modalStep2'));
    setText(el.modalStep3, tr('modalStep3'));
    setText(el.modalCopyLink, tr('copyLink'));
    setText(el.modalClose, tr('gotIt'));
    setText(el.retryButton, tr('retry'));
    setText(el.skipLink, tr('skipLink'));
    setText(el.footerWebsite, tr('website'));
    setText(el.footerPrivacy, tr('privacy'));
    setText(document.querySelector('.loading-label'), tr('loadingWork'));
    setText(el.launchFallback?.querySelector('strong'), tr('launchTitle'));
    setText(el.launchFallback?.querySelector('p'), tr('launchBody'));
    const embeddedNote = language === 'zh'
      ? `${embeddedBrowser.name || '当前应用'}内无法跳转时，请从右上角菜单使用系统浏览器打开。`
      : tr('embeddedNote');
    setText(el.browserNote, embeddedBrowser.embedded ? embeddedNote : tr('browserNote'));
    if (el.modalBackdrop) el.modalBackdrop.setAttribute('aria-label', language === 'en' ? 'Close' : '关闭提示');
    if (el.workCard) el.workCard.setAttribute('aria-label', tr('workPreviewLabel'));
    if (el.codeContent?.parentElement) el.codeContent.parentElement.setAttribute('aria-label', tr('codePreviewLabel'));
    if (el.coverImage) el.coverImage.alt = tr('coverAlt');
    if (el.stats) el.stats.setAttribute('aria-label', tr('statsLabel'));
    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.lang === language ? 'true' : 'false');
    });
  }

  function setLanguage(nextLanguage, refreshContent) {
    language = nextLanguage === 'en' ? 'en' : 'zh';
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.documentElement.dataset.lang = language;
    try {
      localStorage.setItem('pythonide_share_language', language);
    } catch {
      // Language switching still works when storage is unavailable.
    }
    applyStaticCopy();
    if (global.history && typeof global.history.replaceState === 'function') {
      try {
        global.history.replaceState(null, '', routeDisplayPath(route, language, location.hash));
      } catch {
        // The page remains usable if an embedded browser rejects history changes.
      }
    }
    if (refreshContent) refreshCurrentView();
  }

  function setMeta(name, content, property) {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(property ? 'property' : 'name', name);
      document.head.appendChild(node);
    }
    node.setAttribute('content', content);
  }

  function updatePageMetadata(title, description, imageURL) {
    const cleanTitle = String(title || DEFAULT_TITLE).trim() || DEFAULT_TITLE;
    const cleanDescription = String(description || DEFAULT_DESCRIPTION).trim().slice(0, 160) || DEFAULT_DESCRIPTION;
    const canonicalURL = `${SITE_ORIGIN}${route.path || '/'}`;
    document.title = cleanTitle === DEFAULT_TITLE ? cleanTitle : `${cleanTitle} · Python IDE`;
    setMeta('description', cleanDescription, false);
    setMeta('og:title', cleanTitle, true);
    setMeta('og:description', cleanDescription, true);
    setMeta('og:url', canonicalURL, true);
    setMeta('og:image', imageURL || DEFAULT_SHARE_IMAGE, true);
    setMeta('twitter:title', cleanTitle, false);
    setMeta('twitter:description', cleanDescription, false);
    setMeta('twitter:image', imageURL || DEFAULT_SHARE_IMAGE, false);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', canonicalURL);
  }

  function renderStats(items) {
    el.stats.replaceChildren(...items.map(({ value, label }) => {
      const item = document.createElement('div');
      item.className = 'stat';
      const strong = document.createElement('strong');
      const span = document.createElement('span');
      strong.textContent = value;
      span.textContent = label;
      item.append(strong, span);
      return item;
    }));
  }

  function renderCode(lines) {
    el.codeContent.replaceChildren(...lines.map((line, index) => {
      const row = document.createElement('span');
      const number = document.createElement('span');
      const text = document.createElement('span');
      row.className = 'code-line';
      number.className = 'code-number';
      text.className = 'code-text';
      number.textContent = String(index + 1);
      text.textContent = line || ' ';
      row.append(number, text);
      return row;
    }));
  }

  function hidePreviews() {
    el.coverPreview.classList.add('hidden');
    el.codePreview.classList.add('hidden');
    el.posterPreview.classList.add('hidden');
  }

  function svgNode(name, attributes = {}) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function createTypeIcon(kind) {
    const svg = svgNode('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    if (kind === 'miniapp') {
      svg.append(
        svgNode('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3 }),
        svgNode('path', { d: 'M3 9h18' }),
        svgNode('circle', { cx: 7, cy: 6.5, r: 0.7 }),
        svgNode('circle', { cx: 10, cy: 6.5, r: 0.7 }),
      );
    } else if (kind === 'game') {
      svg.append(
        svgNode('path', { d: 'M8.2 8h7.6c2 0 3.4 1.3 3.9 3.2l1 4.1c.4 1.7-1.5 3-2.8 1.8l-2.2-2H8.3l-2.2 2c-1.3 1.2-3.2-.1-2.8-1.8l1-4.1C4.8 9.3 6.2 8 8.2 8Z' }),
        svgNode('path', { d: 'M8 11v4M6 13h4' }),
        svgNode('circle', { cx: 16, cy: 12, r: 0.8 }),
        svgNode('circle', { cx: 18, cy: 14, r: 0.8 }),
      );
    } else if (kind === 'appui') {
      svg.append(
        svgNode('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3 }),
        svgNode('path', { d: 'M8 4v16M8 10h13' }),
      );
    } else if (kind === 'widget') {
      svg.append(
        svgNode('rect', { x: 3, y: 3, width: 8, height: 8, rx: 2 }),
        svgNode('rect', { x: 13, y: 3, width: 8, height: 5, rx: 2 }),
        svgNode('rect', { x: 3, y: 13, width: 8, height: 8, rx: 2 }),
        svgNode('rect', { x: 13, y: 10, width: 8, height: 11, rx: 2 }),
      );
    }
    return svg;
  }

  function setTypeIcon(target, presentation) {
    target.dataset.kind = presentation.kind;
    if (presentation.symbol) {
      target.textContent = presentation.symbol;
      return;
    }
    target.replaceChildren(createTypeIcon(presentation.kind));
  }

  function renderPreviewHeader(presentation, mode) {
    setText(el.typeLabel, presentation.label);
    setText(el.previewLabel, mode === 'code' ? tr('codePreview') : tr('workPreview'));
    setTypeIcon(el.typeSymbol, presentation);
    setTypeIcon(el.posterSymbol, presentation);
  }

  function renderPoster(presentation, facts = []) {
    hidePreviews();
    renderPreviewHeader(presentation, 'work');
    el.projectFacts.replaceChildren(...facts.map((value) => {
      const fact = document.createElement('span');
      fact.className = 'project-fact';
      fact.textContent = value;
      return fact;
    }));
    el.posterPreview.classList.remove('hidden');
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'zh-CN', {
        year: 'numeric', month: 'short', day: 'numeric',
      }).format(date);
    } catch {
      return '';
    }
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }

  function renderAuthor(script) {
    const fallbackAuthor = language === 'en' ? 'Community creator' : '社区创作者';
    const author = String(script.author_name || fallbackAuthor).trim() || fallbackAuthor;
    const date = formatDate(script.updated_at || script.approved_at || script.created_at);
    setText(el.authorName, author);
    setText(el.authorDetail, tr('updated')(date));
    setText(el.authorInitial, Array.from(author)[0] || 'P');
    el.authorRow.hidden = false;
    el.authorAvatar.hidden = true;
    el.authorInitial.hidden = false;

    const avatarID = String(script.author_avatar_id || '').trim();
    const explicitAvatar = safeImageURL(script.author_avatar_url || script.avatar_url || script.user_avatar_url);
    const avatarURL = explicitAvatar || (avatarID
      ? `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(avatarID)}&size=160`
      : '');
    if (avatarURL) {
      el.authorAvatar.onload = () => {
        el.authorAvatar.hidden = false;
        el.authorInitial.hidden = true;
      };
      el.authorAvatar.onerror = () => {
        el.authorAvatar.hidden = true;
        el.authorInitial.hidden = false;
      };
      el.authorAvatar.src = avatarURL;
      el.authorAvatar.alt = language === 'en' ? `${author}'s avatar` : `${author}的头像`;
    }
  }

  function renderProject(script, presentation) {
    const facts = [
      script.entry_file ? `${language === 'en' ? 'Entry' : '入口'} ${script.entry_file}` : '',
      Number(script.package_file_count) > 0
        ? `${script.package_file_count} ${language === 'en' ? 'files' : '个文件'}`
        : '',
      formatBytes(script.package_size_bytes),
    ].filter(Boolean);
    renderPoster(presentation, facts);
  }

  function renderGeneric(label, symbol) {
    renderPoster({
      kind: 'other',
      symbol: symbol || '{ }',
      label,
      isProject: false,
    });
  }

  function renderCodePreview(lines, presentation) {
    hidePreviews();
    renderPreviewHeader(presentation, 'code');
    renderCode(lines);
    el.projectFacts.replaceChildren();
    el.codePreview.classList.remove('hidden');
  }

  function renderScriptStats(script) {
    const locale = language === 'en' ? 'en-US' : 'zh-CN';
    renderStats([
      { value: formatCount(script.view_count, locale), label: tr('views') },
      { value: formatCount(script.like_count, locale), label: tr('likes') },
      { value: formatCount(script.run_count, locale), label: tr('runs') },
      { value: formatCount(script.download_count, locale), label: tr('imports') },
    ]);
  }

  function renderScript(script) {
    currentScript = script;
    currentView = 'script';
    el.openApp.disabled = false;
    hideStatus();
    setText(el.openAppLabel, tr('openApp'));
    const title = String(script.title || tr('community')).trim() || tr('community');
    const description = socialDescription(script);
    const presentation = typePresentation(script, language);
    const coverURL = safeImageURL(script.cover_image_url || script.preview_image_url || script.thumbnail_url);
    const lines = previewLines(script.content, 34, 8000);

    setText(el.eyebrow, tr('communityWork'));
    setText(el.title, title);
    setText(el.summary, description);
    renderAuthor(script);
    renderPreviewHeader(presentation, 'work');

    if (coverURL) {
      hidePreviews();
      el.coverImage.onload = () => {
        hidePreviews();
        renderPreviewHeader(presentation, 'work');
        el.coverPreview.classList.remove('hidden');
        setLoading(false);
      };
      el.coverImage.onerror = () => {
        if (isProjectScript(script)) {
          renderProject(script, presentation);
        } else if (lines.length) {
          renderCodePreview(lines, presentation);
        } else {
          renderPoster(presentation);
        }
        setLoading(false);
      };
      el.coverImage.src = coverURL;
    } else if (isProjectScript(script)) {
      renderProject(script, presentation);
    } else if (lines.length) {
      renderCodePreview(lines, presentation);
    } else {
      renderPoster(presentation);
    }

    renderScriptStats(script);

    updatePageMetadata(title, description, shareImageURL(script, route.id));
    setText(el.actionDescription, script.ai_usage_hint || tr('actionDescription'));
    if (!coverURL) setLoading(false);
  }

  function showStatus(title, message, canRetry) {
    setText(el.statusTitle, title);
    setText(el.statusMessage, message);
    el.statusCard.classList.remove('hidden');
    el.retryButton.classList.toggle('hidden', !canRetry);
  }

  function hideStatus() {
    el.statusCard.classList.add('hidden');
    el.retryButton.classList.add('hidden');
  }

  function renderScriptError() {
    currentScript = null;
    currentView = 'script-error';
    el.authorRow.hidden = true;
    el.openApp.disabled = false;
    setText(el.openAppLabel, tr('openApp'));
    setText(el.eyebrow, tr('communityWork'));
    setText(el.title, tr('openCommunityWork'));
    setText(el.summary, tr('previewFailedBody'));
    renderGeneric(`PythonIDE · ${tr('community')}`, '{ }');
    renderStats([
      { value: '—', label: tr('views') }, { value: '—', label: tr('likes') },
      { value: '—', label: tr('runs') }, { value: '—', label: tr('imports') },
    ]);
    updatePageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
    showStatus(tr('statusUnavailable'), tr('statusUnavailableBody'), true);
    setLoading(false);
  }

  function initialScriptData(scriptID) {
    const node = document.getElementById('initial-script-data');
    if (!node) return null;
    try {
      const script = JSON.parse(node.textContent || '{}');
      return String(script?.script_id || '') === String(scriptID || '') ? script : null;
    } catch {
      return null;
    }
  }

  async function loadScript(initialScript = null) {
    currentView = 'script-loading';
    hideStatus();
    el.coverImage.onload = null;
    el.coverImage.onerror = null;
    el.coverImage.removeAttribute('src');
    const hasInitialScript = Boolean(initialScript);
    if (hasInitialScript) renderScript(initialScript);
    else setLoading(true);
    retryAction = () => loadScript(initialScript);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`${API_BASE}/v1/scripts/${encodeURIComponent(route.id)}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!payload || !payload.script) throw new Error('Missing script');
      renderScript(payload.script);
    } catch {
      if (!hasInitialScript) renderScriptError();
    } finally {
      clearTimeout(timeout);
    }
  }

  function loadImport() {
    currentView = 'import';
    currentScript = null;
    el.authorRow.hidden = true;
    hideStatus();
    setText(el.eyebrow, `PythonIDE · ${tr('remoteImport')}`);
    setText(el.title, route.remote ? tr('importRemoteProject') : tr('missingProjectURL'));
    setText(el.summary, route.remote ? tr('remoteSummary') : tr('invalidRemoteSummary'));
    renderGeneric(`URL · ${tr('remoteImport')}`, '↗');
    renderStats([
      { value: 'HTTPS', label: tr('transfer') }, { value: tr('readOnlyValue'), label: tr('preview') },
      { value: 'App', label: tr('method') }, { value: tr('confirmValue'), label: tr('source') },
    ]);
    setText(el.actionTitle, route.remote ? tr('importInApp') : tr('cannotImport'));
    setText(el.openAppLabel, route.remote ? tr('importInApp') : tr('cannotImport'));
    setText(el.actionDescription, tr('externalWarning'));
    el.openApp.disabled = !route.remote;
    showStatus(tr('verifySource'), tr('verifySourceBody'), false);
    updatePageMetadata('导入远程项目 · Python IDE', route.remote ? `从 ${hostnameFor(route.remote)} 导入远程项目。` : DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
    setLoading(false);
  }

  function loadShort() {
    currentView = 'short';
    currentScript = null;
    el.authorRow.hidden = true;
    el.openApp.disabled = false;
    setText(el.openAppLabel, tr('openApp'));
    hideStatus();
    setText(el.eyebrow, `PythonIDE · ${tr('shareLink')}`);
    setText(el.title, tr('continueInApp'));
    setText(el.summary, tr('shortSummary'));
    renderGeneric(`PythonIDE · ${tr('shareLink')}`, '↗');
    renderStats([
      { value: tr('safeValue'), label: tr('linkStructure') }, { value: 'App', label: tr('openMethod') },
      { value: '—', label: tr('content') }, { value: '—', label: tr('status') },
    ]);
    updatePageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
    setLoading(false);
  }

  function loadHome() {
    currentView = 'home';
    currentScript = null;
    el.authorRow.hidden = true;
    el.openApp.disabled = false;
    setText(el.openAppLabel, tr('openApp'));
    hideStatus();
    setText(el.eyebrow, 'PythonIDE');
    setText(el.title, tr('homeTitle'));
    setText(el.summary, tr('homeSummary'));
    renderGeneric(`PythonIDE · ${tr('native')}`, 'PY');
    renderStats([
      { value: 'Python', label: tr('language') }, { value: 'iOS', label: tr('platform') },
      { value: tr('native'), label: tr('experience') }, { value: tr('community'), label: tr('shareLink') },
    ]);
    updatePageMetadata('Python IDE 分享', DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
    setLoading(false);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    setText(el.toast, message);
    el.toast.classList.add('is-visible');
    toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 1800);
  }

  async function copyCurrentLink() {
    const cleanURL = `${SITE_ORIGIN}${routeDisplayPath(route, language)}`;
    try {
      await navigator.clipboard.writeText(cleanURL);
      showToast(tr('copied'));
      return;
    } catch {
      const input = document.createElement('textarea');
      input.value = cleanURL;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      showToast(copied ? tr('copied') : tr('copyFallback'));
    }
  }

  function openBrowserModal() {
    el.browserModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => el.modalCopyLink.focus(), 0);
  }

  function closeBrowserModal() {
    el.browserModal.classList.add('hidden');
    document.body.style.overflow = '';
    el.openApp.focus();
  }

  function launchApp() {
    if (el.openApp.disabled) return;
    if (embeddedBrowser.embedded) {
      openBrowserModal();
      return;
    }
    el.launchFallback.classList.add('hidden');
    clearTimeout(launchTimer);
    location.href = customURLFor(route);
    launchTimer = setTimeout(() => {
      if (document.visibilityState === 'visible') el.launchFallback.classList.remove('hidden');
    }, 1600);
  }

  function refreshCurrentView() {
    if (currentView === 'script' && currentScript) {
      const presentation = typePresentation(currentScript, language);
      setText(el.eyebrow, tr('communityWork'));
      renderAuthor(currentScript);
      renderScriptStats(currentScript);
      setText(el.actionDescription, currentScript.ai_usage_hint || tr('actionDescription'));
      if (!el.codePreview.classList.contains('hidden')) renderPreviewHeader(presentation, 'code');
      else renderPreviewHeader(presentation, 'work');
      if (!el.posterPreview.classList.contains('hidden')) {
        if (isProjectScript(currentScript)) renderProject(currentScript, presentation);
        else renderPoster(presentation);
      }
      return;
    }
    if (currentView === 'script-error') renderScriptError();
    else if (currentView === 'import') loadImport();
    else if (currentView === 'short') loadShort();
    else if (currentView === 'home') loadHome();
  }

  el.openApp.addEventListener('click', launchApp);
  el.copyLink.addEventListener('click', copyCurrentLink);
  el.modalCopyLink.addEventListener('click', copyCurrentLink);
  el.modalClose.addEventListener('click', closeBrowserModal);
  el.modalBackdrop.addEventListener('click', closeBrowserModal);
  el.retryButton.addEventListener('click', () => {
    if (retryAction) retryAction();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clearTimeout(launchTimer);
      el.launchFallback.classList.add('hidden');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !el.browserModal.classList.contains('hidden')) closeBrowserModal();
  });
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang, true));
  });
  document.querySelectorAll('.button').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      button.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
    });
  });

  el.downloadApp.href = APP_STORE_URL;
  setLanguage(language, false);

  if (route.type === 'script') loadScript(initialScriptData(route.id));
  else if (route.type === 'import') loadImport();
  else if (route.type === 'short') loadShort();
  else loadHome();
}(typeof globalThis !== 'undefined' ? globalThis : this));

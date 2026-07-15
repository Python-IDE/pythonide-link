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
    return String(script.content_mode || '').toLowerCase() === 'project_package' || Boolean(script.package_id);
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
    safeForwardedPath,
    safeImageURL,
    socialDescription,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  global.PythonIDEShareCore = core;
  if (typeof document === 'undefined') return;

  const query = new URLSearchParams(location.search);
  const forwardedPath = safeForwardedPath(query.get('path'));
  const initialPath = forwardedPath || `${location.pathname}${location.search}${location.hash}`;
  const route = parseRoutePath(initialPath);
  const embeddedBrowser = detectEmbeddedBrowser(navigator.userAgent);

  if (forwardedPath && global.history && typeof global.history.replaceState === 'function') {
    try {
      global.history.replaceState(null, '', forwardedPath);
    } catch {
      // Keep the fallback URL if the browser rejects history replacement.
    }
  }

  const el = {};
  [
    'eyebrow', 'title', 'summary', 'authorRow', 'authorAvatar', 'authorInitial', 'authorName', 'authorDetail',
    'workCard', 'fileBadge', 'fileName', 'fileDetail', 'tagList', 'previewSkeleton', 'coverPreview', 'coverImage',
    'codePreview', 'codeLanguage', 'codeStatus', 'codeContent', 'projectPreview', 'projectKicker', 'projectTitle',
    'projectDescription', 'projectFacts', 'genericPreview', 'genericSymbol', 'genericTitle', 'genericDescription',
    'stats', 'openApp', 'downloadApp', 'copyLink', 'browserNote', 'launchFallback', 'statusCard', 'statusTitle',
    'statusMessage', 'retryButton', 'embeddedGuide', 'embeddedGuideTitle', 'embeddedGuideText', 'browserModal',
    'modalBackdrop', 'modalCopyLink', 'modalClose', 'toast', 'actionTitle', 'actionDescription',
  ].forEach((id) => { el[id] = document.getElementById(id); });

  let retryAction = null;
  let toastTimer = null;
  let launchTimer = null;

  function setLoading(isLoading) {
    document.body.classList.toggle('is-loading', isLoading);
    el.workCard.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    el.previewSkeleton.classList.toggle('hidden', !isLoading);
    if (isLoading) hidePreviews();
  }

  function setText(target, value) {
    if (target) target.textContent = String(value || '');
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

  function renderTags(tags) {
    el.tagList.replaceChildren(...tags.map((text) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = text;
      return tag;
    }));
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
    el.projectPreview.classList.add('hidden');
    el.genericPreview.classList.add('hidden');
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
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

  function renderAuthor(script, presentation) {
    const author = String(script.author_name || '社区创作者').trim() || '社区创作者';
    const date = formatDate(script.updated_at || script.approved_at || script.created_at);
    const details = [`${presentation?.categoryLabel || '社区'}作品`];
    if (date) details.push(`${date}更新`);
    setText(el.authorName, author);
    setText(el.authorDetail, details.join(' · '));
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
      el.authorAvatar.alt = `${author}的头像`;
    }
  }

  function renderProject(script, presentation) {
    hidePreviews();
    el.projectPreview.classList.remove('hidden');
    setText(el.projectKicker, `${presentation.categoryLabel.toUpperCase()} · PYTHON IDE PROJECT`);
    setText(el.projectTitle, script.title || '完整项目');
    setText(el.projectDescription, script.ai_usage_hint || '这是一个完整项目包，请在 Python IDE 中下载并运行全部内容。');
    const facts = [
      script.runtime ? String(script.runtime).toUpperCase() : '',
      script.entry_file ? `入口 ${script.entry_file}` : '',
      Number(script.package_file_count) > 0 ? `${script.package_file_count} 个文件` : '',
      formatBytes(script.package_size_bytes),
    ].filter(Boolean);
    el.projectFacts.replaceChildren(...facts.map((value) => {
      const fact = document.createElement('span');
      fact.className = 'project-fact';
      fact.textContent = value;
      return fact;
    }));
  }

  function renderGeneric(title, description, symbol) {
    hidePreviews();
    el.genericPreview.classList.remove('hidden');
    setText(el.genericTitle, title);
    setText(el.genericDescription, description);
    setText(el.genericSymbol, symbol || '{ }');
  }

  function renderScript(script) {
    const title = String(script.title || '社区作品').trim() || '社区作品';
    const description = socialDescription(script);
    const presentation = filePresentation(script);
    const tags = normalizedTags(script);
    const coverURL = safeImageURL(script.cover_image_url || script.preview_image_url || script.thumbnail_url);
    const lines = previewLines(script.content, 34, 8000);

    setText(el.eyebrow, 'PYTHON IDE 社区作品');
    setText(el.title, title);
    setText(el.summary, description);
    setText(el.fileBadge, presentation.badge);
    setText(el.fileName, title);
    setText(el.fileDetail, presentation.detail);
    renderTags(tags);
    renderAuthor(script, presentation);

    if (coverURL) {
      hidePreviews();
      el.coverImage.onload = () => {
        hidePreviews();
        el.coverPreview.classList.remove('hidden');
        setLoading(false);
      };
      el.coverImage.onerror = () => {
        if (isProjectScript(script)) {
          renderProject(script, presentation);
        } else if (lines.length) {
          hidePreviews();
          renderCode(lines);
          el.codePreview.classList.remove('hidden');
        } else {
          renderGeneric(title, script.ai_usage_hint || '在 App 中查看完整作品内容。', presentation.badge);
        }
        setLoading(false);
      };
      el.coverImage.src = coverURL;
    } else if (isProjectScript(script)) {
      renderProject(script, presentation);
    } else if (lines.length) {
      hidePreviews();
      renderCode(lines);
      setText(el.codeLanguage, presentation.language.toUpperCase());
      setText(el.codeStatus, script.content.length > 8000 || script.content.split(/\r?\n/).length > 34 ? '部分预览' : '只读预览');
      el.codePreview.classList.remove('hidden');
    } else {
      renderGeneric(title, script.ai_usage_hint || '在 App 中查看完整作品内容。', presentation.badge);
    }

    renderStats([
      { value: formatCount(script.view_count), label: '浏览' },
      { value: formatCount(script.like_count), label: '喜欢' },
      { value: formatCount(script.run_count), label: '运行' },
      { value: formatCount(script.download_count), label: '导入' },
    ]);

    updatePageMetadata(title, description, `${SITE_ORIGIN}/og/script/${encodeURIComponent(route.id)}.png`);
    setText(el.actionDescription, script.ai_usage_hint || '运行代码、查看完整项目并保存到你的设备。');
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

  async function loadScript() {
    setLoading(true);
    hideStatus();
    retryAction = loadScript;
    el.coverImage.onload = null;
    el.coverImage.onerror = null;
    el.coverImage.removeAttribute('src');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
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
      setText(el.eyebrow, 'PYTHON IDE 社区');
      setText(el.title, '打开社区作品');
      setText(el.summary, '作品预览暂时没有加载成功，但这个链接仍然可以在 Python IDE 中打开。');
      setText(el.fileBadge, 'PY');
      setText(el.fileName, '社区作品');
      setText(el.fileDetail, route.id);
      renderTags(['社区作品']);
      renderGeneric('预览暂不可用', '你仍然可以使用下方按钮在 Python IDE 中打开这个作品。', '{ }');
      renderStats([
        { value: '—', label: '浏览' }, { value: '—', label: '喜欢' },
        { value: '—', label: '运行' }, { value: '—', label: '导入' },
      ]);
      updatePageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
      showStatus('暂时无法加载作品预览', '请检查网络后重新加载，或直接尝试在 Python IDE 中打开。', true);
      setLoading(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  function loadImport() {
    setText(el.eyebrow, 'PYTHON IDE 远程导入');
    setText(el.title, route.remote ? '导入远程项目' : '缺少项目地址');
    setText(el.summary, route.remote ? '确认来源可信后，在 Python IDE 中继续下载和导入。' : '这个导入链接没有包含有效的远程项目地址。');
    setText(el.fileBadge, 'URL');
    setText(el.fileName, route.remote ? hostnameFor(route.remote) || '远程项目' : '无效链接');
    setText(el.fileDetail, '远程导入');
    renderTags(['远程导入']);
    renderGeneric('远程项目', route.remote || '请返回分享来源获取完整链接。', '↗');
    renderStats([
      { value: 'HTTPS', label: '传输' }, { value: '只读', label: '预览' },
      { value: 'App', label: '导入方式' }, { value: '确认', label: '来源' },
    ]);
    setText(el.actionTitle, route.remote ? '在 Python IDE 中导入' : '无法继续导入');
    setText(el.actionDescription, '外部项目可能包含不受信任的代码，请只导入你了解的来源。');
    el.openApp.disabled = !route.remote;
    showStatus('导入前请确认来源', '远程项目可能包含可执行代码，请只导入可信链接。', false);
    updatePageMetadata('导入远程项目 · Python IDE', route.remote ? `从 ${hostnameFor(route.remote)} 导入远程项目。` : DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
    setLoading(false);
  }

  function loadShort() {
    setText(el.eyebrow, 'PYTHON IDE 分享链接');
    setText(el.title, '在 Python IDE 中继续');
    setText(el.summary, '这个短链接将在 Python IDE 中解析并打开对应内容。');
    setText(el.fileBadge, 'LINK');
    setText(el.fileName, '分享链接');
    setText(el.fileDetail, route.code);
    renderTags(['短链接']);
    renderGeneric('Python IDE 分享', '使用下方按钮在 App 中继续。', '↗');
    renderStats([
      { value: '安全', label: '链接结构' }, { value: 'App', label: '打开方式' },
      { value: '—', label: '内容' }, { value: '—', label: '状态' },
    ]);
    updatePageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE);
    setLoading(false);
  }

  function loadHome() {
    setText(el.eyebrow, 'PYTHON IDE');
    setText(el.title, '把灵感变成可以运行的作品');
    setText(el.summary, '在 iPhone 和 iPad 上编写 Python，探索社区作品、AppUI、MiniApp 和更多原生能力。');
    setText(el.fileBadge, 'PY');
    setText(el.fileName, 'Python IDE');
    setText(el.fileDetail, 'iPhone 与 iPad 上的 Python 开发工具');
    renderTags(['Python', 'AppUI', 'MiniApp']);
    renderGeneric('Python IDE', '编写、运行并分享属于你的 Python 作品。', '{ }');
    renderStats([
      { value: 'Python', label: '语言' }, { value: 'iOS', label: '平台' },
      { value: '原生', label: '体验' }, { value: '社区', label: '分享' },
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
    const cleanURL = `${SITE_ORIGIN}${route.path || '/'}`;
    try {
      await navigator.clipboard.writeText(cleanURL);
      showToast('链接已复制');
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
      showToast(copied ? '链接已复制' : '请长按地址栏复制链接');
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

  function configureEmbeddedGuide() {
    if (!embeddedBrowser.embedded) return;
    document.body.classList.add('is-embedded');
    el.embeddedGuide.classList.remove('hidden');
    setText(el.embeddedGuideTitle, `${embeddedBrowser.name}内可能无法直接打开 App`);
    setText(el.embeddedGuideText, '请点右上角菜单，选择“在默认浏览器中打开”。');
    setText(el.browserNote, `${embeddedBrowser.name}内无法跳转时，请先从右上角菜单使用系统浏览器打开。`);
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

  el.downloadApp.href = APP_STORE_URL;
  configureEmbeddedGuide();

  if (route.type === 'script') loadScript();
  else if (route.type === 'import') loadImport();
  else if (route.type === 'short') loadShort();
  else loadHome();
}(typeof globalThis !== 'undefined' ? globalThis : this));

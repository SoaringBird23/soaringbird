/* PeaceNews 前端逻辑 */

const state = {
  user: null,
  isAdmin: false,
  isPublisher: false,
  category: '',          // 当前分类筛选
  days: 0,               // 时间筛选（0=全部，1/3/7/30=近 N 天）
  page: 1,
  total: 0,
  currentNews: null,
  editingId: null,
  commentPage: 1,
  commentTotal: 0,
  config: { hero: '1', columns: '3', per_page: '20' },
  gallery: [],        // 插图列表 [{url, caption, position}]
  galleryEditIdx: -1, // 当前编辑的插图索引
  dragIdx: -1,        // 拖拽源索引
  video: '',          // 发布/编辑弹窗中的视频 URL
};

/* SVG 图标常量 */
const ICON = {
  heart: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
};

/* ===== API 请求封装（与 app29.js 一致） ===== */
async function api(path, options = {}) {
  const { raw, ...opts } = { credentials: 'same-origin', ...options };
  if (!raw) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (opts.body && typeof opts.body === 'object') {
      opts.body = JSON.stringify(opts.body);
    }
  }
  const res = await fetch(path, opts);
  const ct = res.headers.get('content-type') || '';
  let data = null;
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text.substring(0, 100) || `${res.status} ${res.statusText}`);
    }
    return text;
  }
  if (!res.ok) {
    const err = new Error(data.error || `${res.status} ${res.statusText}`);
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ===== 工具 ===== */
function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() / 1000 - ts;
  const s = Math.floor(diff);
  if (s < 60) return '刚刚';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' 分钟前';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' 小时前';
  const d = Math.floor(h / 24);
  if (d < 30) return d + ' 天前';
  return new Date(ts * 1000).toLocaleDateString('zh-CN');
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined && text !== null) e.textContent = text;
  return e;
}

// 转义 HTML 特殊字符，防止 XSS
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function renderMarkdown(text, images) {
  if (!text) return '';
  // 段落规范化：连续空行合并为一段间距；两个非空文本行之间的单个换行补成空行（两段之间隔一空行）。
  // 列表项/引用/标题/代码块/图片标记等块级内容不受影响。
  text = normalizeParagraphs(text);
  // 替换 [img:序号] 为实际图片 HTML
  if (images && images.length) {
    text = text.replace(/\[img:(\d+)\]/g, (m, num) => {
      const idx = parseInt(num, 10) - 1;
      const img = images[idx];
      if (!img) return m;
      const pos = img.position || 'center';
      const caption = img.caption ? `<figcaption>${img.caption}</figcaption>` : '';
      const alignClass = `pn-article-img pn-article-img-${pos}`;
      return `</p><figure class="${alignClass}"><img src="${img.url}" alt="${img.caption || ''}">${caption}</figure><p>`;
    });
  }
  try {
    if (typeof marked !== 'undefined') {
      marked.setOptions({ breaks: true, gfm: true });
      const raw = marked.parse(text);
      if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(raw, {
          ALLOWED_TAGS: ['p','br','strong','em','code','pre','blockquote','ul','ol','li','a','img','h1','h2','h3','h4','h5','h6','hr','del','ins','sub','sup','table','thead','tbody','tr','th','td','span','div','figure','figcaption'],
          ALLOWED_ATTR: ['href','src','alt','title','class','target','rel'],
          ALLOW_DATA_ATTR: false
        });
      }
      // DOMPurify 不可用时降级为纯文本，禁止渲染原始 HTML
      return esc(text);
    }
  } catch (e) {}
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

/* 段落之间留空行：把两个非空文本行之间的单个换行补成双换行；块级语法行不补 */
function normalizeParagraphs(t) {
  if (!t) return '';
  t = t.replace(/\r\n?/g, '\n');
  const isBlock = (s) => /^\s{0,3}([-*] |\d+\. |>|#{1,6} |```|\[img:|\n)/.test(s);
  const lines = t.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const prev = lines[i - 1] || '';
    if (i > 0 && ln.trim() && prev.trim() && out[out.length - 1] !== '' && !isBlock(ln) && !isBlock(prev)) {
      out.push('');
    }
    out.push(ln);
  }
  return out.join('\n');
}

function requireLogin() {
  alert('请先登录后再操作');
  window.location.href = '/signin';
}

/* ===== Toast 提示 ===== */
let _toastTimer = null;
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'pn-toast show ' + type;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = 'pn-toast'; }, 2600);
}

/* ===== 带进度条的图片上传（fetch 无上传进度，改用 XHR） ===== */
function uploadWithProgress(file, onProgress, url, timeout) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url || '/api/upload/news-image');
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
    });
    xhr.addEventListener('load', () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch (e) {}
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
      else reject(new Error(data.error || `上传失败（${xhr.status}）`));
    });
    xhr.addEventListener('error', () => reject(new Error('网络错误，上传失败')));
    xhr.addEventListener('timeout', () => reject(new Error('上传超时，请重试')));
    xhr.timeout = timeout || 120000;
    xhr.send(fd);
  });
}

function uploadVideoWithProgress(file, onProgress) {
  return uploadWithProgress(file, onProgress, '/api/upload/news-video', 600000);
}

/* ===== 顶栏三行（行情/天气/快讯）：渲染失败仅隐藏该行，不阻塞头条与列表 ===== */
/* 行情/天气按 9 个一组分页，每页停留 8s 后滚动切换：
   行情行：方块从左到右挨个以贝塞尔曲线向上滑出（从下到上滚动）；天气行：整行自下而上滑动；
   快讯（最新新闻）单行显示一条，每 8 秒向上滚动一条；
   右头条单条：整标题换行 + 日期置于最后一行最右侧，每 8 分钟向上滚动一条（头条头图保持自身节奏）。
   鼠标滚轮在三行范围内可手动上滑/下滑（上一页/下一页）。 */
const TOPBAR_PAGE_SIZE = 9;
const TOPBAR_SWITCH_MS = 8000;
const TOPBAR_STAGGER_MS = 85;
const TOPBAR_FLASH_STEP_MS = 8000;

/* 带超时的 API 拉取：顶栏行情接口首响很慢（可达 15s+），给 22s 超时避免永久挂起 */
async function apiTopbar(url, timeoutMs) {
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, timeoutMs || 22000);
  try {
    return await api(url, ctrl ? { signal: ctrl.signal } : {});
  } finally {
    clearTimeout(timer);
  }
}

async function loadTopbarRow(key, url, renderFn) {
  const row = document.getElementById('tbRow' + key);
  if (!row) return;
  const track = row.querySelector('.pn-tb-track');
  if (!track) return;
  const retry = (delay) => setTimeout(() => loadTopbarRow(key, url, renderFn), delay);
  try {
    const data = await apiTopbar(url);
    if (!data || !data.ok || !Array.isArray(data.items)) throw new Error('bad payload');
    track.textContent = '';
    row.style.display = '';
    renderFn(track, data);
  } catch (e) {
    console.warn('顶栏行加载失败:', key, e);
    // 已有成功数据则整行保留（不隐藏），稍后重试刷新；否则显示"加载中…"占位，绝不直接隐藏整行
    if (track.children.length) {
      retry(20000);
    } else {
      track.textContent = '';
      const ph = el('div', 'pn-tb-placeholder', '内容加载中…');
      ph.style.cssText = 'flex:1;text-align:center;color:var(--text3);font-size:14px;padding:10px;min-width:0;';
      track.appendChild(ph);
      row.style.display = '';
      retry(8000);
    }
  }
}

function wxKind(code, isDay) {
  if (!isDay) return 'night';
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2) return 'cloudy';
  if (code === 3) return 'overcast';
  if (code >= 95) return 'storm';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 80 && code <= 86) return 'rain';
  if (code >= 45 && code <= 48) return 'fog';
  return 'cloudy';
}

/* 日出/日落前后 30 分钟：改用晨昏渐变（dawn/dusk），其余按天气类别 */
function wxPhase(it) {
  const now = Date.now() / 1000;
  const W = 30 * 60;
  if (it.sunrise && Math.abs(now - it.sunrise) <= W) return 'dawn';
  if (it.sunset && Math.abs(now - it.sunset) <= W) return 'dusk';
  return wxKind(it.code, it.is_day);
}

/* 分页轮播：items 每 9 个一组渲染进 page，axis='x' 横向（股市）、'y' 纵向（天气）
   无缝循环：末尾克隆第 1 页，滑到克隆页后无动画重置回第 0 页，避免"滑完就没/倒带回退" */
function setupPagedTopbar(track, items, renderItem, axis) {
  const isY = axis === 'y';
  // 兜底：不依赖 HTML/CSS 是否就绪，强制分页容器样式
  track.classList.add(isY ? 'pn-tb-paged-v' : 'pn-tb-paged-h');
  track.style.overflow = 'hidden';
  track.style.gap = '0';
  if (isY) track.style.height = '92px';
  const pages = [];
  for (let i = 0; i < items.length; i += TOPBAR_PAGE_SIZE) {
    const page = el('div', 'pn-tb-page');
    items.slice(i, i + TOPBAR_PAGE_SIZE).forEach(it => page.appendChild(renderItem(it)));
    track.appendChild(page);
    pages.push(page);
  }
  if (pages.length <= 1) return null;
  // 无缝循环：克隆第 1 页追加到末尾
  const clone = pages[0].cloneNode(true);
  track.appendChild(clone);
  // 像素位移：百分比 translate 依赖元素自身尺寸（受 padding/box-sizing 干扰），
  // 改用实际页宽/页高计算，确保每页恰好移动一屏，杜绝逐页错位、重叠、消失
  const pageLen = () => (isY ? track.clientHeight : track.clientWidth);
  const moveTo = (i, animate) => {
    track.style.transition = animate ? '' : 'none';
    const step = pageLen();
    track.style.transform = isY
      ? 'translateY(' + (-i * step) + 'px)'
      : 'translateX(' + (-i * step) + 'px)';
  };
  let idx = 0;
  let timer = null;
  const schedule = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      idx += 1;
      if (idx >= pages.length) {
        // 已滑到末尾克隆页（视觉与第 1 页相同），无动画瞬间回到真实第 0 页，杜绝空白
        idx = 0;
        moveTo(0, false);
      } else {
        moveTo(idx, true);
      }
    }, TOPBAR_SWITCH_MS);
  };
  const next = () => {
    schedule();
    if (idx + 1 >= pages.length) { idx = 0; moveTo(0, false); }
    else { idx += 1; moveTo(idx, true); }
  };
  const prev = () => {
    schedule();
    if (idx > 0) { idx -= 1; moveTo(idx, true); }
    else { moveTo(pages.length - 1, false); idx = pages.length - 2; moveTo(idx, true); }
  };
  schedule();
  return { next, prev };
}

/* 行情/天气行：9 个方块等分一行，每页停留 TOPBAR_SWITCH_MS；
   双轨结构：每个 cell 内有两个独立层（a/b）。切换时——
   出场层从左到右挨个 translateY(0→-100%) 向上滑出；
   入场层从左到右挨个 translateY(100%→0) 从下方滑入（入场交错稍晚于出场）。
   出和入都有独立的从左到右交错节奏。cellHeight 控制行高（天气卡渐变在各自层上，不会透出空白）。 */
function setupStaggerUpTopbar(track, items, renderItem, opts) {
  opts = opts || {};
  const cellH = opts.cellHeight || 72;
  /* pageSize：每页条数（默认 9 = 与股市一致；头条类设 1 = 一行一条，整行单格滚动）
     cells：每行渲染的格子数（默认与 pageSize 一致；pageSize=1 时 cells=1 单格占满整行） */
  const PS = opts.pageSize || TOPBAR_PAGE_SIZE;
  const CELLS = (opts.cells != null) ? opts.cells : PS;
  /* gradientOnCell：天色渐变底色挂在格子上（格子常驻不透明），文字层透明滑动——
     切换时格子永远有底色、不露白色间隙，且新层文字从下方进入不会压在旧层文字上 */
  const gradOnCell = !!opts.gradientOnCell;
  const pages = [];
  for (let i = 0; i < items.length; i += PS) {
    pages.push(items.slice(i, i + PS));
  }
  if (!pages.length) return null;
  track.classList.add('pn-tb-stagger');
  track.style.overflow = 'hidden';
  track.style.gap = (opts.gap != null ? opts.gap : 8) + 'px';
  track.style.height = cellH + 'px';
  const cells = [];
  for (let k = 0; k < CELLS; k++) {
    const cell = el('div', 'pn-tb-cell');
    cell.style.height = cellH + 'px';
    const a = el('div', 'pn-tb-layer'); a.style.height = cellH + 'px';
    const b = el('div', 'pn-tb-layer'); b.style.height = cellH + 'px';
    cell.appendChild(a);
    cell.appendChild(b);
    track.appendChild(cell);
    cells.push({ cell, a, b, vis: 'a' }); // vis = 当前显示的层
  }
  if (pages.length <= 1) {
    cells.forEach((c, k) => { const n = setLayer(c.a, pages[0][k]); applyKind(c.cell, n); });
    return { next: () => {}, prev: () => {} };
  }
  const DUR = 560;
  const STAG = TOPBAR_STAGGER_MS;
  const FADE_OUT = 110;      // 旧层文字快速淡出，先走干净，新层再进入，两层文字互不压盖
  const ENTER_DELAY = 140;   // 入场比出场稍晚
  const animMs = DUR + (TOPBAR_PAGE_SIZE - 1) * STAG + ENTER_DELAY + 140;
  let cur = 0;
  let timer = null;
  let animTo = null;

  function setLayer(layer, item) {
    layer.textContent = '';
    if (!item) return null;
    const node = renderItem(item);
    node.classList.add('pn-tb-cell-item');
    layer.appendChild(node);
    return node;
  }
  function applyKind(cell, node) {
    if (!gradOnCell || !node || !node.dataset || !node.dataset.kind) return;
    cell.className = 'pn-tb-cell kind-' + node.dataset.kind;
  }
  const visOf = (c) => (c.vis === 'a' ? c.a : c.b);
  const hidOf = (c) => (c.vis === 'a' ? c.b : c.a);

  const initFill = () => {
    const curPage = pages[cur % pages.length];
    const nextPage = pages[(cur + 1) % pages.length];
    cells.forEach((c, k) => {
      c.vis = 'a';
      const na = setLayer(c.a, curPage[k]);
      const nb = setLayer(c.b, nextPage[k]);
      applyKind(c.cell, na);
      c.a.style.transition = 'none'; c.a.style.transform = 'translateY(0)'; c.a.style.opacity = '1';
      c.b.style.transition = 'none'; c.b.style.transform = 'translateY(30%)'; c.b.style.opacity = '0';
    });
    void track.offsetHeight;
  };
  const settle = () => {
    cells.forEach((c) => {
      visOf(c).style.transition = 'none'; visOf(c).style.transform = 'translateY(0)'; visOf(c).style.opacity = '1';
      hidOf(c).style.transition = 'none'; hidOf(c).style.transform = 'translateY(30%)'; hidOf(c).style.opacity = '0';
      hidOf(c).textContent = '';
    });
  };
  const animateNext = () => {
    const nextPage = pages[(cur + 1) % pages.length];
    cells.forEach((c, k) => {
      const vis = visOf(c);
      const hid = hidOf(c);
      const nn = setLayer(hid, nextPage[k]);
      applyKind(c.cell, nn);
      hid.style.transition = 'none';
      hid.style.transform = 'translateY(30%)';
      hid.style.opacity = '0';
      void c.cell.offsetHeight;
      /* 出场层：快速淡出（110ms）并向上滑 30%；入场层：稍晚从下方 30% 滑入淡入。
         底色常驻格子，文字层透明——不露白色间隙，也不出现新数据压住旧城市名的重叠 */
      vis.style.transition = 'transform ' + DUR + 'ms cubic-bezier(0.22,1,0.36,1) ' + (k * STAG) + 'ms, opacity ' + FADE_OUT + 'ms linear ' + (k * STAG) + 'ms';
      vis.style.transform = 'translateY(-30%)';
      vis.style.opacity = '0';
      hid.style.transition = 'transform ' + DUR + 'ms cubic-bezier(0.22,1,0.36,1) ' + (k * STAG + ENTER_DELAY) + 'ms, opacity 220ms linear ' + (k * STAG + ENTER_DELAY) + 'ms';
      hid.style.transform = 'translateY(0)';
      hid.style.opacity = '1';
      c.vis = (c.vis === 'a') ? 'b' : 'a';
    });
    cur = (cur + 1) % pages.length;
    animTo = setTimeout(() => { animTo = null; settle(); }, animMs);
  };
  const animatePrev = () => {
    const prevPage = pages[(cur - 1 + pages.length) % pages.length];
    cells.forEach((c, k) => {
      const vis = visOf(c);
      const hid = hidOf(c);
      const nn = setLayer(hid, prevPage[k]);
      applyKind(c.cell, nn);
      hid.style.transition = 'none';
      hid.style.transform = 'translateY(-30%)';
      hid.style.opacity = '0';
      void c.cell.offsetHeight;
      /* 反向：出场层下滑 30% 并快淡出；入场层稍晚从上方 30% 滑入 */
      vis.style.transition = 'transform ' + DUR + 'ms cubic-bezier(0.22,1,0.36,1) ' + (k * STAG) + 'ms, opacity ' + FADE_OUT + 'ms linear ' + (k * STAG) + 'ms';
      vis.style.transform = 'translateY(30%)';
      vis.style.opacity = '0';
      hid.style.transition = 'transform ' + DUR + 'ms cubic-bezier(0.22,1,0.36,1) ' + (k * STAG + ENTER_DELAY) + 'ms, opacity 220ms linear ' + (k * STAG + ENTER_DELAY) + 'ms';
      hid.style.transform = 'translateY(0)';
      hid.style.opacity = '1';
      c.vis = (c.vis === 'a') ? 'b' : 'a';
    });
    cur = (cur - 1 + pages.length) % pages.length;
    animTo = setTimeout(() => { animTo = null; settle(); }, animMs);
  };
  const schedule = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(animateNext, TOPBAR_SWITCH_MS);
  };
  const next = () => { if (animTo) return; schedule(); animateNext(); };
  const prev = () => { if (animTo) return; schedule(); animatePrev(); };
  initFill();
  schedule();
  return { next, prev };
}

/* 快讯单行：只显示第一条，定时向上滚动切换下一条 */
function setupFlashTicker(track, items) {
  if (!items.length) return null;
  items.forEach(it => {
    const c = el('a', 'pn-tb-flash-item');
    c.href = 'javascript:void(0)';
    c.addEventListener('click', (e) => { e.preventDefault(); if (it.id) openDetail(it.id); });
    c.appendChild(el('span', 'pn-tb-flash-time', formatMD(it.ts)));
    c.appendChild(el('span', 'pn-tb-flash-title', it.title || ''));
    track.appendChild(c);
  });
  if (items.length <= 1) return null;
  let idx = 0;
  let timer = null;
  const schedule = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      idx = (idx + 1) % items.length;
      if (idx === 0) {
        // 回绕到最后一条回到第一条：关过渡瞬移，避免整条倒带
        track.style.transition = 'none';
        track.style.transform = 'translateY(0)';
        void track.offsetHeight;
        track.style.transition = '';
      } else {
        track.style.transform = 'translateY(' + (-idx * 100) + '%)';
      }
    }, TOPBAR_FLASH_STEP_MS);
  };
  const next = () => { schedule(); idx = (idx + 1) % items.length; if (idx === 0) { track.style.transition = 'none'; track.style.transform = 'translateY(0)'; void track.offsetHeight; track.style.transition = ''; } else { track.style.transform = 'translateY(' + (-idx * 100) + '%)'; } };
  const prev = () => { schedule(); idx = (idx + items.length - 1) % items.length; track.style.transform = 'translateY(' + (-idx * 100) + '%)'; };
  schedule();
  return { next, prev };
}

/* 顶栏行高随窗口自适应：按窗口高度比例取整并限幅（与 CSS 的 clamp 保持一致） */
function tbCellH(ratio, min, max) {
  const vh = window.innerHeight || 900;
  return Math.max(min, Math.min(max, Math.round(vh * ratio)));
}

function initTopbar() {
  // 给一行挂滚轮控制：向下滚=下一页/下一条（上滑），向上滚=上一页/上一条（下滑）
  const bindWheel = (row, ctl) => {
    if (!row || !ctl) return;
    row.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) ctl.next();
      else ctl.prev();
      e.preventDefault();
    }, { passive: false });
  };
  // 行情行：红涨绿跌，9 个一组等分（格间竖线分隔，无独立卡片框）；两行结构：第一行指数名称，第二行价格+涨跌幅；逐格贝塞尔上滑
  loadTopbarRow('Stock', '/api/topbar/stock', (track, data) => {
    const row = track.closest('.pn-tb-row');
    const ctl = setupStaggerUpTopbar(track, data.items || [], (it) => {
      if (!it) return null;
      const c = el('div', 'pn-tb-stk');
      c.appendChild(el('div', 'pn-tb-stk-name', it.name || ''));
      const row2 = el('div', 'pn-tb-stk-data');
      const dir = it.pct > 0 ? 'up' : it.pct < 0 ? 'down' : 'flat';
      row2.appendChild(el('div', 'pn-tb-stk-price ' + dir, Number(it.price).toFixed(2)));
      row2.appendChild(el('div', 'pn-tb-stk-chg ' + dir, (it.pct > 0 ? '+' : '') + Number(it.pct).toFixed(2) + '%'));
      c.appendChild(row2);
      return c;
    }, { cellHeight: tbCellH(0.05, 46, 58), gap: 0 });
    bindWheel(row, ctl);
  });
  // 天气行：9 个一组等分（格间竖线分隔），两行结构：第一行城市名称，第二行气温+天气状况；保留天色渐变底色，逐格贝塞尔上滑
  loadTopbarRow('Weather', '/api/topbar/weather', (track, data) => {
    const row = track.closest('.pn-tb-row');
    const ctl = setupStaggerUpTopbar(track, data.items || [], (it) => {
      if (!it) return null;
      const c = el('div', 'pn-tb-wx');
      c.dataset.kind = wxPhase(it); // 渐变底色挂到格子上（gradientOnCell）
      c.appendChild(el('div', 'pn-tb-wx-name', it.name || ''));
      const row2 = el('div', 'pn-tb-wx-data');
      row2.appendChild(el('div', 'pn-tb-wx-temp', Math.round(it.temp) + '°'));
      row2.appendChild(el('div', 'pn-tb-wx-desc', it.desc || ''));
      c.appendChild(row2);
      return c;
    }, { cellHeight: tbCellH(0.05, 46, 58), gap: 0, gradientOnCell: true });
    bindWheel(row, ctl);
  });
  // 头条（最新新闻）行：一行一条，单格占满整行，沿用同一套逐格上滑（贝塞尔、8 秒一条）
  loadTopbarRow('Flash', '/api/topbar/flash', (track, data) => {
    const row = track.closest('.pn-tb-row');
    const ctl = setupStaggerUpTopbar(track, data.items || [], (it) => {
      if (!it) return null;
      const c = el('a', 'pn-tb-flash-item');
      c.href = 'javascript:void(0)';
      c.addEventListener('click', (e) => { e.preventDefault(); if (it.id) openDetail(it.id); });
      c.appendChild(el('span', 'pn-tb-flash-time', formatMD(it.ts)));
      c.appendChild(el('span', 'pn-tb-flash-title', it.title || ''));
      return c;
    }, { cellHeight: tbCellH(0.042, 42, 58), pageSize: 1, cells: 1, gap: 8 });
    bindWheel(row, ctl);
  });
}

/* ===== 初始化 ===== */
async function init() {
  try {
    const data = await api('/api/me');
    state.user = data.user || null;
  } catch (e) {
    state.user = null;
  }
  const loginBtn = document.getElementById('navLoginBtn');
  const userBox = document.getElementById('navUser');
  if (state.user) {
    loginBtn.style.display = 'none';
    userBox.style.display = 'flex';
    document.getElementById('navUsername').textContent = state.user.username || '';
    const av = document.getElementById('navAvatar');
    if (state.user.avatar) { av.src = state.user.avatar; av.style.display = ''; }
    else { av.style.display = 'none'; }
    try {
      const chk = await api('/api/admin/check');
      state.isAdmin = !!(chk.is_admin || chk.is_super_admin);
      state.isPublisher = state.isAdmin || !!chk.can_publish_news;
    } catch (e) { state.isAdmin = false; state.isPublisher = false; }
    if (state.isPublisher) document.getElementById('publishBtn').style.display = '';
  }
  try {
    const cfg = await api('/api/news/config');
    if (cfg.config) state.config = cfg.config;
  } catch (e) {}
  initAnnBar();
  renderSiteDate();
  await renderCategoryChips();
  applyConfig();
  initTopbar();
  await loadHeadline();
  await loadNews(1);
  bindEvents();
  initInfiniteScroll();
  initTextSelectionMenu();

  // 支持 URL 参数直接打开新闻详情（admin 编辑跳转用）
  const params = new URLSearchParams(window.location.search);
  const directId = params.get('id');
  if (directId) openDetail(directId);
}

function applyConfig() {
  const grid = document.getElementById('newsGrid');
  const cols = parseInt(state.config.columns) || 3;
  grid.classList.add('pn-masonry');
  grid.style.setProperty('--pn-cols', cols);
  // hero 配置开关控制头条轮播区
  const h = document.getElementById('headline');
  if (h) h.dataset.disabled = state.config.hero === '1' ? '' : '1';
}

/* ===== 头条轮播 + 瀑布流 ===== */
const head = { list: [], idx: 0, timer: null };
let moreLoading = false;
let hasMore = true;

/* ===== 顶部公告条 ===== */
function initAnnBar() {
  const bar = document.getElementById('annBar');
  if (!bar) return;
  let dismissed = false;
  try { dismissed = localStorage.getItem('pn_ann_dismissed') === '1'; } catch (e) {}
  const sync = () => {
    const on = !bar.classList.contains('hidden');
    document.body.classList.toggle('has-annbar', on);
  };
  if (dismissed) bar.classList.add('hidden');
  sync();
  const close = document.getElementById('annBarClose');
  if (close) {
    close.addEventListener('click', () => {
      bar.classList.add('hidden');
      sync();
      try { localStorage.setItem('pn_ann_dismissed', '1'); } catch (e) {}
    });
  }
}

/* ===== 站点标题行日期 ===== */
function renderSiteDate() {
  const box = document.getElementById('siteDate');
  if (!box) return;
  const d = new Date();
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
  box.textContent = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + week;
}

/* ===== 分类标签栏（服务端分类 + 设计稿预设顺序） ===== */
const CAT_ORDER = ['时事', '社会', '经济', '体育', '科技', '娱乐', '人文', '生活', '环境'];
const CAT_GREEN = ['社群'];
const CAT_HIDE = ['国际', '财经', '文娱', '游戏社群', '评论', '媒体']; // 已合并/废弃分类，不单独展示（国际∪时事统一叫"时事"）
const CAT_OTHER = ['其他']; // 未匹配主分类的兜底栏目
/* 各分类悬停介绍（重新撰写） */
const CAT_DESC = {
  '全部': '聚合全站资讯，纵览每日大事',
  '时事': '时政要闻、政策发布与国际动态',
  '社会': '民生百态、公共事件与舆论热点',
  '经济': '宏观数据、市场行情与企业动向',
  '体育': '赛事战报、转会动态与体坛人物',
  '科技': 'AI、硬件、互联网与前沿创新',
  '娱乐': '影视综艺、明星动态与文娱热点',
  '人文': '深度特稿、历史文化与思想评论',
  '生活': '消费、健康、出行与实用资讯',
  '环境': '气候、能源与生态保护议题',
  '社群': '社区用户自产内容与讨论精华',
  '其他': '未归类资讯，五花八门都在这'
};

/* 液态玻璃滑动胶囊：跟随选中分类平滑移动 */
function posCatIndicator() {
  const bar = document.getElementById('categoryBar');
  if (!bar) return;
  let ind = document.getElementById('catIndicator');
  if (!ind) {
    ind = document.createElement('div');
    ind.id = 'catIndicator';
    ind.className = 'pn-cat-indicator';
    bar.insertBefore(ind, bar.firstChild);
  }
  const act = bar.querySelector('.pn-cat-chip.active');
  if (!act) { ind.style.opacity = '0'; return; }
  ind.style.left = act.offsetLeft + 'px';
  ind.style.top = act.offsetTop + 'px';
  ind.style.width = act.offsetWidth + 'px';
  ind.style.height = act.offsetHeight + 'px';
  ind.style.opacity = '1';
}

/* 分类悬停介绍：液态玻璃小气泡 */
function bindCatTip() {
  const bar = document.getElementById('categoryBar');
  if (!bar) return;
  let tip = document.getElementById('catTip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'catTip';
    tip.className = 'pn-cat-tip';
    document.body.appendChild(tip);
  }
  bar.addEventListener('mouseover', (e) => {
    const chip = e.target.closest('.pn-cat-chip');
    if (!chip) { tip.classList.remove('show'); return; }
    const name = chip.dataset.cat || '全部';
    tip.textContent = CAT_DESC[name] || chip.dataset.desc || '查看该分类下全部新闻';
    const r = chip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - 90, window.innerWidth - 300)) + 'px';
    tip.style.top = (r.bottom + 8) + 'px';
    tip.classList.add('show');
  });
  bar.addEventListener('mouseleave', () => tip.classList.remove('show'));
}

async function renderCategoryChips() {
  const bar = document.getElementById('categoryBar');
  if (!bar) return;
  let cats = [];
  const defs = {};
  try {
    const data = await api('/api/news/categories');
    cats = (data.categories || []).map(c => c.name).filter(Boolean);
    (data.categories || []).forEach(c => { if (c.desc) defs[c.name] = c.desc; });
  } catch (e) { console.warn('分类加载失败，沿用静态分类', e); return; }
  if (!cats.length) return;

  const preset = CAT_ORDER.filter(c => cats.includes(c));
  const extra = cats.filter(c => CAT_ORDER.indexOf(c) === -1 && CAT_GREEN.indexOf(c) === -1 && CAT_HIDE.indexOf(c) === -1 && CAT_OTHER.indexOf(c) === -1).sort((a, b) => a.localeCompare(b, 'zh'));
  const green = CAT_GREEN.filter(c => cats.includes(c));
  const ordered = preset.concat(extra).concat(green);
  // 提交型栏目始终保留（当前可能暂无内容）
  CAT_GREEN.forEach(c => { if (ordered.indexOf(c) === -1) ordered.push(c); });
  CAT_OTHER.forEach(c => { if (ordered.indexOf(c) === -1) ordered.push(c); });
  // 合并主标签"时事"始终保留（国际∪时事统一展示，即使 categories 接口未返回"时事"也要出现）
  if (ordered.indexOf('时事') === -1) ordered.push('时事');

  // 只重建分类标签，保留首位的非原生时间下拉（不整块清空 categoryBar）
  bar.querySelectorAll('.pn-cat-chip').forEach(c => c.remove());
  const allBtn = el('button', 'pn-cat-chip' + (state.category ? '' : ' active'), '全部');
  allBtn.type = 'button';
  allBtn.dataset.cat = '';
  allBtn.title = '全部分类';
  bar.appendChild(allBtn);
  ordered.forEach(name => {
    const isGreen = CAT_GREEN.indexOf(name) !== -1;
    const btn = el('button', 'pn-cat-chip' + (isGreen ? ' pn-cat-green' : ''), name);
    btn.type = 'button';
    btn.dataset.cat = name;
    if (defs[name]) btn.dataset.desc = defs[name]; // 自定义悬停介绍（优先服务端定义）
    if (state.category === name) btn.classList.add('active');
    bar.appendChild(btn);
  });
  posCatIndicator();
  bindCatTip();
  requestAnimationFrame(posCatIndicator);
  if (!window.__catResizeBound) {
    window.__catResizeBound = true;
    window.addEventListener('resize', () => {
      clearTimeout(window.__catResizeT);
      window.__catResizeT = setTimeout(posCatIndicator, 120);
    });
  }
}

function selectCategory(cat) {
  state.category = cat || '';
  document.querySelectorAll('#categoryBar .pn-cat-chip').forEach(c => {
    c.classList.toggle('active', (c.dataset.cat || '') === state.category);
  });
  posCatIndicator();
}

/* ===== 时间筛选：非原生下拉（位于"全部"标签左侧，随分类标签一起居中） ===== */
function initFilterBar() {
  const drop = document.getElementById('timeDrop');
  const btn = document.getElementById('timeDropBtn');
  const menu = document.getElementById('timeMenu');
  if (!drop || !btn || !menu) return;
  const labels = { 0: '全部时间', 1: '今天', 3: '近3天', 7: '近7天', 30: '近30天' };
  const setLabel = () => {
    btn.textContent = (labels[state.days] || labels[0]) + ' ▾';
    document.querySelectorAll('#timeMenu .pn-time-opt').forEach(o => {
      o.classList.toggle('active', parseInt(o.dataset.days, 10) === state.days);
    });
  };
  const applyDays = (days) => {
    state.days = days;
    setLabel();
    drop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    showGridSkeleton();
    clearLoadError();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadNews(1);
    /* 时间按钮文字宽度变化会使分类标签组重新居中，滑动胶囊需随之归位 */
    requestAnimationFrame(() => requestAnimationFrame(posCatIndicator));
  };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = drop.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('.pn-time-opt').forEach(opt => {
    opt.addEventListener('click', () => applyDays(parseInt(opt.dataset.days, 10) || 0));
  });
  document.addEventListener('click', (e) => {
    if (drop && !drop.contains(e.target)) drop.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
  setLabel();
}

/* ===== 空状态 / 错误边界 ===== */
function updateEmptyState(count) {
  const empty = document.getElementById('newsEmpty');
  if (!empty) return;
  const filtered = !!state.category || state.days > 0;
  empty.style.display = count ? 'none' : '';
  if (count) return;
  const t = document.getElementById('emptyTitle');
  const h = document.getElementById('emptyHint');
  const scope = [];
  if (state.category) scope.push(state.category);
  if (state.days > 0) scope.push(state.days === 1 ? '今天' : '近' + state.days + '天');
  if (t) t.textContent = filtered ? '该筛选下暂无内容' : '暂无新闻';
  if (h) h.textContent = filtered
    ? '试试「' + (scope.join(' · ') || '全部') + '」以外的分类或时间范围'
    : '信源正在聚合中，稍后再来看看';
}

function clearLoadError() {
  const box = document.getElementById('newsGrid');
  if (box) {
    const err = box.querySelector('.pn-load-error');
    if (err) err.remove();
  }
  const mb = document.getElementById('moreBox');
  if (mb) mb.classList.remove('error');
}

function showLoadError(e) {
  const grid = document.getElementById('newsGrid');
  if (!grid || grid.querySelector('.pn-card') || grid.querySelector('.pn-skel-card')) return;
  if (grid.querySelector('.pn-load-error')) return;
  const box = el('div', 'pn-load-error');
  box.appendChild(el('div', 'pn-load-error-title', '内容加载失败'));
  box.appendChild(el('div', 'pn-load-error-desc', (e && e.message) ? String(e.message) : '网络异常，请检查网络后重试'));
  const btn = el('button', 'pn-retry-btn', '重试');
  btn.type = 'button';
  btn.addEventListener('click', () => {
    clearLoadError();
    showGridSkeleton();
    loadNews(1);
  });
  box.appendChild(btn);
  grid.appendChild(box);
}

/* ===== 列表（瀑布流 + 无限加载） ===== */
async function loadNews(page, append = false) {
  if (moreLoading) return;
  moreLoading = true;
  const firstPage = page === 1 && !append;
  if (firstPage) { clearLoadError(); showGridSkeleton(); }
  setMoreText(append ? '加载中…' : '');
  try {
    const catParam = state.category ? '&category=' + encodeURIComponent(state.category) : '';
    const dayParam = state.days > 0 ? '&days=' + state.days : '';
    const data = await api('/api/news?page=' + page + catParam + dayParam);
    state.page = data.page;
    state.total = data.total;
    const items = data.news || [];
    if (page === 1) {
      renderMasonry(items, false);
      updateEmptyState(items.length);
    } else {
      renderMasonry(items, true);
    }
    const perPage = parseInt(state.config.per_page) || 20;
    hasMore = state.page * perPage < state.total;
    setMoreText(hasMore ? '下滑加载更多' : (state.total ? '已显示全部' : ''));
    clearLoadError();
  } catch (e) {
    console.error(e);
    if (firstPage) { clearGridSkeleton(); updateEmptyState(0); }
    setMoreText('加载失败 · 点击此处重试');
    const mb = document.getElementById('moreBox');
    if (mb) mb.classList.add('error');
    showLoadError(e);
  } finally {
    moreLoading = false;
  }
}

function renderMasonry(items, append) {
  const grid = document.getElementById('newsGrid');
  if (!append) grid.textContent = '';
  for (const n of items) {
    grid.appendChild(buildCardEl(n));
  }
}

/* ===== 首屏/切换分类的加载骨架 ===== */
function showGridSkeleton() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;
  grid.textContent = '';
  const count = Math.min(9, Math.max(3, parseInt(state.config.per_page) || 6));
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const card = el('div', 'pn-skel-card');
    card.appendChild(el('div', 'pn-skel-cover'));
    card.appendChild(el('div', 'pn-skel-line'));
    card.appendChild(el('div', 'pn-skel-line short'));
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function clearGridSkeleton() {
  const grid = document.getElementById('newsGrid');
  if (grid) grid.textContent = '';
}

function setMoreText(text) {
  const t = document.getElementById('moreText');
  if (t) t.textContent = text;
}

/* ===== 头条轮播（左大图/无图降级卡 + 右列表，独立接口固定 5 条，不随分类切换重建） ===== */
/* 头条图统一走本机代理 /api/news/img?u=...：同源加载快、可缓存、避免外站防盗链/超时导致空白；
   本地已同源的图（/uploads/... 等）直接原样使用，不绕代理 */
function imgProxy(u) {
  if (!u) return '';
  if (u.charAt(0) === '/' || u.indexOf('http') !== 0) return u;
  if (u.indexOf('/api/news/img') === 0) return u;
  return '/api/news/img?u=' + encodeURIComponent(u);
}
/* 预取下一张头条图，保证轮播切换时图片已就绪（优先实时加载头图渲染） */
function preloadHeadImage(i) {
  const n = head.list && head.list[i];
  if (!n || !n.image) return;
  const im = new Image();
  im.src = imgProxy(n.image);
}

async function loadHeadline() {
  const hEl = document.getElementById('headline');
  if (!hEl || hEl.dataset.disabled === '1') return;
  stopAuto();
  try {
    const data = await api('/api/news/headline');
    renderHeadline(data.news || []);
  } catch (e) {
    console.warn('头条加载失败', e);
    hEl.style.display = 'none';
  }
}

function renderHeadline(items) {
  const hEl = document.getElementById('headline');
  const carousel = document.getElementById('carousel');
  const hlist = document.getElementById('hlist');
  carousel.textContent = '';
  hlist.textContent = '';
  head.list = (items || []).slice(0, 5);
  head.idx = 0;
  stopAuto();
  if (!head.list.length) { hEl.style.display = 'none'; return; }
  hEl.style.display = '';

  // 左：轮播卡（图在上、标题在下方流式排布；无图=纯文本降级卡）
  const frame = el('div', 'pn-car-frame' + (head.list[0].image ? '' : ' no-img'));
  const media = el('div', 'pn-car-media');
  if (head.list[0].image) {
    const img = el('img', 'pn-car-img');
    // 优先实时渲染：eager + 高优先级 + 本机代理加载，立即开始拉取
    img.loading = 'eager';
    img.fetchPriority = 'high';
    img.decoding = 'async';
    img.alt = '';
    img.onerror = () => { img.style.display = 'none'; frame.classList.add('no-img'); };
    img.src = imgProxy(head.list[0].image);
    media.appendChild(img);
  }
  const prevBtn = el('button', 'pn-car-arrow prev');
  prevBtn.type = 'button';
  prevBtn.setAttribute('aria-label', '上一条');
  prevBtn.textContent = '‹';
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); gotoHead(head.idx - 1); });
  const nextBtn = el('button', 'pn-car-arrow next');
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', '下一条');
  nextBtn.textContent = '›';
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); gotoHead(head.idx + 1); });
  media.appendChild(prevBtn);
  media.appendChild(nextBtn);
  frame.appendChild(media);
  const overlay = el('div', 'pn-car-overlay');
  overlay.appendChild(el('div', 'pn-car-meta', ''));
  overlay.appendChild(el('h2', 'pn-car-title', ''));
  frame.appendChild(overlay);
  const dots = el('div', 'pn-car-dots');
  head.list.forEach((n, i) => {
    const d = el('button', 'pn-car-dot' + (i === 0 ? ' active' : ''));
    d.title = n.title;
    d.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); gotoHead(i); });
    dots.appendChild(d);
  });
  frame.appendChild(dots);
  preloadHeadImage(1);
  frame.addEventListener('mouseenter', stopAuto);
  frame.addEventListener('focusin', stopAuto);
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); gotoHead(head.idx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); gotoHead(head.idx + 1); }
  });
  // 图题/降级卡整卡点击进入详情
  frame.addEventListener('click', () => { if (head.list[head.idx]) openDetail(head.list[head.idx].id); });
  carousel.appendChild(frame);

  // 头图区域滚轮：向上/向下滚动切换头条内容（阻止页面滚动穿透）
  if (!hEl.dataset.wheel) {
    hEl.dataset.wheel = '1';
    hEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      stopAuto();
      gotoHead(head.idx + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });
  }

  // 右：头条列表（多条，每条整标题换行 + 日期在最后一行最右侧；高亮跟随左图轮播）
  hlist.appendChild(el('div', 'pn-hlist-title', '头条'));
  const ul = el('div', 'pn-hl-list');
  head.list.forEach((n, i) => {
    const li = el('a', 'pn-hl-item' + (i === 0 ? ' active' : ''));
    li.href = 'javascript:void(0)';
    li.addEventListener('click', (e) => { e.preventDefault(); stopAuto(); gotoHead(i, true); openDetail(n.id); });
    li.appendChild(el('span', 'pn-hl-text', n.title || ''));
    li.appendChild(el('span', 'pn-hl-date', formatMD(n.created_at)));
    ul.appendChild(li);
  });
  hlist.appendChild(ul);

  paintHead();
  startAuto();
}

function paintHead() {
  const n = head.list[head.idx];
  if (!n) return;
  const frame = document.querySelector('#carousel .pn-car-frame');
  const media = document.querySelector('#carousel .pn-car-media');
  const img = document.querySelector('#carousel .pn-car-img');
  const title = document.querySelector('#carousel .pn-car-title');
  const meta = document.querySelector('#carousel .pn-car-meta');
  if (frame) frame.classList.toggle('no-img', !n.image);
  /* 无图时保留媒体区占位高度（渐变底），标题与圆点仍位于卡片下方，不压缩头图区 */
  if (media) media.style.display = '';
  if (img) {
    if (n.image) {
      img.style.display = '';
      // 淡入淡出：先淡出，加载完成后再淡入，切换有视觉过渡
      img.style.opacity = '0';
      img.onload = () => { img.style.opacity = '1'; };
      img.src = imgProxy(n.image);
      img.alt = n.title;
      // 万一缓存图片未触发 onload
      if (img.complete) img.style.opacity = '1';
    } else {
      img.style.display = 'none';
      img.removeAttribute('src');
    }
  }
  if (title) title.textContent = n.title;
  if (meta) meta.textContent = formatDate(n.created_at) + (n.category ? ' · ' + n.category : '');
  document.querySelectorAll('#carousel .pn-car-dot').forEach((d, i) => d.classList.toggle('active', i === head.idx));
  document.querySelectorAll('#hlist .pn-hl-item').forEach((li, i) => li.classList.toggle('active', i === head.idx));
}

function gotoHead(i) {
  head.idx = (i + head.list.length) % head.list.length;
  paintHead();
  // 预取下一条图，保证下一次切换即点即显
  preloadHeadImage((head.idx + 1) % head.list.length);
}

function startAuto() {
  stopAuto();
  if (head.list.length <= 1) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  head.timer = setInterval(() => gotoHead(head.idx + 1), 4000);
}

function stopAuto() {
  if (head.timer) { clearInterval(head.timer); head.timer = null; }
}

/* ===== 无限滚动 ===== */
function initInfiniteScroll() {
  const moreBox = document.getElementById('moreBox');
  if (!moreBox) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore && !moreLoading) {
      loadNews(state.page + 1, true);
    }
  }, { rootMargin: '400px' });
  io.observe(moreBox);
}

function buildCardEl(n) {
  const card = el('div', 'pn-card');
  if (n.video) {
    // 有视频：封面位渲染播放器（视频优先于封面图）
    const coverWrap = el('div', 'pn-card-cover');
    const v = el('video', '');
    v.src = n.video;
    v.controls = true;
    v.preload = 'metadata';
    v.setAttribute('playsinline', '');
    v.addEventListener('click', (e) => e.stopPropagation());
    coverWrap.appendChild(v);
    card.appendChild(coverWrap);
  } else if (n.image) {
    const coverWrap = el('div', 'pn-card-cover');
    const img = el('img', '');
    img.src = n.image;
    img.alt = n.title;
    img.loading = 'lazy';
    coverWrap.appendChild(img);
    card.appendChild(coverWrap);
  } else {
    // 无图：纯文本降级卡，不显示任何配图占位/占位封面
    card.classList.add('no-img');
  }
  const body = el('div', 'pn-card-body');
  const metaRow = el('div', 'pn-card-meta');
  metaRow.appendChild(el('div', 'pn-time', formatDate(n.created_at)));
  if (!n.author_is_source) {
    // 注册用户发布：橙色"本站作者"标签（样式与"聚合 n 篇"一致）
    metaRow.appendChild(el('span', 'pn-card-agg pn-card-self', '本站作者'));
  }
  if (n.related_count > 0) {
    const agg = el('span', 'pn-card-agg');
    agg.textContent = '聚合 ' + n.related_count + ' 篇';
    metaRow.appendChild(agg);
  }
  body.appendChild(metaRow);
  body.appendChild(el('h3', 'pn-card-title', n.title));
  // source 抓取的新闻不展示点赞/评论统计（author_is_source 由服务端标记）
  if (!n.author_is_source) {
    const stats = el('div', 'pn-card-stats');
    stats.innerHTML = `${ICON.heart}<span>${n.likes}</span><span class="pn-stats-sep">·</span>${ICON.comment}<span>${n.comment_count}</span>`;
    body.appendChild(stats);
  }
  card.appendChild(body);
  card.addEventListener('click', () => openDetail(n.id));
  return card;
}

/* 日期格式：2026年7月26日 */
function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/* 短日期（不显示年份）：9月16日；当年 9月10日 → "9月10日" */
function formatShortDate(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/* 头条日期：仅月-日，带"号"，如 9月16号 */
function formatMD(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}月${d.getDate()}号`;
}

/* ===== 详情 ===== */
async function openDetail(id) {
  try {
    const data = await api('/api/news/' + encodeURIComponent(id));
    state.currentNews = data.news;
    document.getElementById('listView').style.display = 'none';
    document.getElementById('detailView').style.display = '';
    renderDetail(data.news);
    loadRelatedNews(id);
    const agentSide = document.getElementById('agentSide');
    if (data.news.ai_allowed === false) {
      if (agentSide) agentSide.style.display = 'none';
    } else {
      if (agentSide) agentSide.style.display = '';
      loadAgentAnalysis(id);
    }
    await loadComments(id);
    window.scrollTo(0, 0);
  } catch (e) {
    toast(e.message || '加载失败', 'error');
  }
}

function renderDetail(n) {
  document.getElementById('dTitle').textContent = n.title;
  const origEl = document.getElementById('dOrigTitle');
  if (n.need_translate && n.original_title && n.original_title !== n.title) {
    origEl.textContent = '原文：' + n.original_title;
    origEl.style.display = '';
  } else {
    origEl.style.display = 'none';
  }
  const authorEl = document.getElementById('dAuthor');
  authorEl.textContent = n.author_name || '官方';
  const av = document.getElementById('dAvatar');
  if (n.author_avatar) { av.src = n.author_avatar; av.style.display = ''; }
  else { av.style.display = 'none'; }
  // 点击头像/昵称进入个人主页
  const goToProfile = () => {
    if (n.author_id) window.location.href = '/?profile=' + encodeURIComponent(n.author_id);
  };
  av.style.cursor = n.author_id ? 'pointer' : 'default';
  av.onclick = n.author_id ? goToProfile : null;
  authorEl.style.cursor = n.author_id ? 'pointer' : 'default';
  authorEl.onclick = n.author_id ? goToProfile : null;
  document.getElementById('dTime').textContent = formatDate(n.created_at);
  const cover = document.getElementById('dCover');
  const dVideo = document.getElementById('dVideo');
  if (n.video) {
    cover.style.display = 'none';
    dVideo.src = n.video;
    dVideo.style.display = '';
  } else {
    dVideo.removeAttribute('src');
    dVideo.load && dVideo.load();
    dVideo.style.display = 'none';
    if (n.image) {
      cover.src = n.image;
      cover.style.display = '';
      cover.onerror = () => { cover.style.display = 'none'; };
    } else { cover.style.display = 'none'; }
  }
  document.getElementById('dContent').innerHTML = renderMarkdown(n.content, n.images);
  // 实时翻译：外文新闻显示按钮，点击整篇翻译标题+正文；中文新闻隐藏
  const transArea = document.getElementById('dTranslateArea');
  const transBox = document.getElementById('dTranslateBox');
  const transBtn = document.getElementById('dTranslateBtn');
  if (n.is_foreign) {
    transArea.style.display = '';
    transBox.style.display = 'none';
    transBtn.textContent = '实时翻译';
    transBtn.disabled = false;
    transBtn.onclick = async () => {
      if (transBox.style.display !== 'none') {
        transBox.style.display = 'none';
        transBtn.textContent = '实时翻译';
        return;
      }
      transBtn.textContent = '翻译中…';
      transBtn.disabled = true;
      try {
        const res = await Promise.race([
          api('/api/news/translate', {
            method: 'POST',
            body: JSON.stringify({ news_id: n.id }),
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('翻译超时，请稍后重试')), 30000)),
        ]);
        let html = '';
        if (res.title && res.title !== n.title) {
          html += '<div class="pn-tr-title">' + esc(res.title) + '</div>';
        }
        if (res.content) {
          html += '<div class="pn-tr-body">' + esc(res.content) + '</div>';
        }
        if (!html) {
          html = '<div class="pn-tr-empty">未获取到译文（原文可能已是中文或翻译服务暂不可用）</div>';
        }
        transBox.innerHTML = html;
        transBox.style.display = '';
        transBtn.textContent = '收起译文';
      } catch (err) {
        toast((err && err.message) || '翻译失败', 'error');
        transBtn.textContent = '实时翻译';
      } finally {
        transBtn.disabled = false;
      }
    };
  } else {
    transArea.style.display = 'none';
    transBox.style.display = 'none';
    transBtn.onclick = null;
  }
  updateLikeUI(n.liked, n.likes);
  document.getElementById('dEditBtn').style.display = state.isPublisher ? '' : 'none';
  document.getElementById('dDeleteBtn').style.display = state.isPublisher ? '' : 'none';
}

/* ===== AI 分析 · 分析视角 + markdown 渲染 ===== */
let _agentNewsId = null;
let _activeViewpointId = null;
let _viewpointNameMap = {};
const _AGENT_DEFAULT_VIEWPOINT = 'comprehensive';

async function loadAgentAnalysis(newsId) {
  _agentNewsId = newsId;
  _activeViewpointId = null;
  const body = document.getElementById('agentBody');
  if (!body) return;
  const sumPane = document.getElementById('agentSummaryPane');
  const anaPane = document.getElementById('agentAnalysisPane');
  if (sumPane) sumPane.innerHTML = '';
  if (anaPane) anaPane.innerHTML = '';
  body.innerHTML = '';
  try {
    const [assessRes, analysesRes] = await Promise.all([
      api('/api/agent-analysis/assessment/' + encodeURIComponent(newsId)),
      api('/api/agent-analysis/' + encodeURIComponent(newsId)),
    ]);
    const assessment = (assessRes && assessRes.assessment) || [];
    const analyses = (analysesRes && analysesRes.analyses) || [];
    assessment.forEach(function (a) { if (a.viewpoint_id) _viewpointNameMap[a.viewpoint_id] = a.name; });
    renderAgentAssessment(assessment, analyses);
  } catch (e) {
    body.innerHTML =
      '<p class="pn-agent-tip">AI 视角评估加载失败，可直接选择视角生成分析。</p>' +
      '<button class="pn-agent-btn" id="agentRunBtn" onclick="triggerAgentAnalysis(\'' + _AGENT_DEFAULT_VIEWPOINT + '\')">生成 AI 分析</button>';
  }
}

function renderAgentAssessment(assessment, analyses, showList) {
  const body = document.getElementById('agentBody');
  if (!body) return;
  if (!assessment.length) {
    body.innerHTML = '<p class="pn-agent-tip">暂无可用的 AI 视角。</p>';
    return;
  }
  const doneMap = {};
  const runningMap = {};
  (analyses || []).forEach(function (a) {
    if (a.status === 'success' && a.content) doneMap[a.viewpoint_id] = a;
    if (a.status === 'running') runningMap[a.viewpoint_id] = true;
  });
  // 摘要 + 关键事实单列上方独立区块（跨视角合并去重）
  renderAgentSummaryPanel(analyses);
  // 分析内容面板：位于视角列表上方，展示当前视角分析
  const anaPane = document.getElementById('agentAnalysisPane');
  if (anaPane) {
    const curId = _activeViewpointId || _AGENT_DEFAULT_VIEWPOINT;
    const cur = doneMap[curId];
    if (cur && cur.content) {
      _activeViewpointId = curId;
      renderAgentOutput(cur.content, cur);
      // 任务5：已有分析时默认隐藏视角入口列表；点「换一个角度分析」后 showList=true 才重新显示
      if (!showList) { body.innerHTML = ''; return; }
    } else {
      // 用户最新指令：打开详情页默认只展示「事实分析」，不自动生成综合深度分析；
      // 无 comprehensive 缓存且该视角可用时，此处展示入口按钮，点击后才生成
      const defVp = assessment.find(function (a) { return a.viewpoint_id === _AGENT_DEFAULT_VIEWPOINT && a.applicable; });
      if (defVp) {
        anaPane.innerHTML =
          '<div class="pn-agent-current"><span class="pn-agent-current-name">综合深度分析</span>' +
          '<button class="pn-agent-switch" id="agentRunBtn" onclick="triggerAgentAnalysis(\'' + _AGENT_DEFAULT_VIEWPOINT + '\')">生成综合深度分析</button></div>' +
          '<p class="pn-agent-tip">点击生成跨视角综合深度分析（汇总事实、角度与展望）。</p>';
      } else {
        anaPane.innerHTML = '';
      }
    }
  }
  // 极简列表：视角名 + 可选/不可选 + 一句话理由 + 操作按钮，不再展示评分条/胶囊/介绍等
  // 综合深度分析（comprehensive）固定在顶部 anaPane 作为唯一入口，侧栏列表只留 12 个分析角度，避免重复
  let html = '<div class="pn-agent-vp-simple-list">';
  assessment.forEach(function (item) {
    if (item.viewpoint_id === _AGENT_DEFAULT_VIEWPOINT) return;
    const ok = !!item.applicable;
    const done = !!doneMap[item.viewpoint_id];
    const running = !!runningMap[item.viewpoint_id];
    let op = '';
    if (running) {
      op = '<span class="pn-agent-vp-simple-state">生成中…</span>';
    } else if (done) {
      op = '<button class="pn-agent-vp-simple-btn" onclick="showAgentAnalysis(\'' + item.viewpoint_id + '\')">查看分析</button>';
    } else if (ok) {
      op = '<button class="pn-agent-vp-simple-btn" onclick="triggerAgentAnalysis(\'' + item.viewpoint_id + '\')">用此视角分析</button>';
    }
    html += '<div class="pn-agent-vp-simple ' + (ok ? 'ok' : 'no') + '">' +
      '<span class="pn-agent-vp-simple-name">' + esc(item.name || item.viewpoint_id) + '</span>' +
      '<span class="pn-agent-vp-simple-tag">' + (ok ? '可选' : '不可选') + '</span>' +
      '<span class="pn-agent-vp-simple-reason">' + esc(item.reason || '') + '</span>' + op +
      '</div>';
  });
  html += '</div>';
  body.innerHTML = html;
  // 用户最新指令：打开详情页默认只展示「事实分析」，综合深度分析改为按钮入口（上方 anaPane 已渲染），
  // 不再自动触发 comprehensive 生成；用户点击「生成综合深度分析」后才开始生成
}

function stripMainSourceMark(s) {
  // 事实/摘要中「主新闻原文」类标注去掉（前后矛盾、冗长）；外部援引来源（如 E5 百度百科）括号标注保留
  if (!s) return '';
  return String(s)
    .replace(/[（(]\s*来源[:：]\s*(?:新闻标题|新闻原文链接|新闻原文|主新闻原文|主新闻|新闻正文|原标题|标题|原文链接|原文)\s*[)）]/gi, '')
    .replace(/[（(]\s*(?:来源[:：]\s*)?(?:主新闻原文|新闻原文|新闻正文|原标题|原文)\s*[)）]/gi, '')
    .replace(/[（(]\s*主新闻原文\s*[)）]/gi, '')
    .trim();
}

function renderAgentSummaryPanel(analyses) {
  const pane = document.getElementById('agentSummaryPane');
  if (!pane) return;
  const done = (analyses || []).filter(function (a) { return a.status === 'success' && a.content; });
  if (!done.length) { pane.innerHTML = ''; return; }
  const seenSum = {};
  const seenFact = {};
  const sumItems = [];
  const factItems = [];
  done.forEach(function (a) {
    const c = a.content || {};
    if (c.summary) {
      const k = String(c.summary).trim();
      if (k && !seenSum[k]) {
        seenSum[k] = true;
        sumItems.push('<div class="pn-agent-summary pn-agent-md">' + renderAgentMd(stripMainSourceMark(c.summary)) + '</div>');
      }
    }
    if (Array.isArray(c.facts)) {
      c.facts.forEach(function (f) {
        const clean = stripMainSourceMark(f);
        const k = String(clean).trim();
        if (k && !seenFact[k]) {
          seenFact[k] = true;
          factItems.push('<li class="pn-agent-md">' + renderAgentMd(clean) + '</li>');
        }
      });
    }
  });
  // 摘要与关键事实合并为单一「事实」区块：库内原文事实直接展示，仅外部援引保留括号来源标注
  let html = '';
  const inner = [];
  if (sumItems.length) inner.push(sumItems.join(''));
  if (factItems.length) inner.push('<ul class="pn-agent-facts">' + factItems.join('') + '</ul>');
  if (inner.length) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">事实</div>' +
      inner.join('<div class="pn-agent-fact-divider"></div>') + '</div>';
  }
  pane.innerHTML = html || '';
}

async function showAgentAnalysis(viewpointId) {
  const body = document.getElementById('agentBody');
  if (!body || !_agentNewsId) return;
  renderAgentLoading('加载已生成的分析…');
  try {
    const res = await api('/api/agent-analysis/' + encodeURIComponent(_agentNewsId));
    const list = (res && res.analyses) || [];
    const done = list.find(function (a) { return a.viewpoint_id === viewpointId && a.status === 'success' && a.content; });
    if (done) {
      _activeViewpointId = viewpointId;
      renderAgentOutput(done.content, done);
      return;
    }
    renderAgentAssessmentFromServer();
  } catch (e) {
    renderAgentAssessmentFromServer();
  }
}

async function renderAgentAssessmentFromServer() {
  if (!_agentNewsId) return;
  try {
    const [assessRes, analysesRes] = await Promise.all([
      api('/api/agent-analysis/assessment/' + encodeURIComponent(_agentNewsId)),
      api('/api/agent-analysis/' + encodeURIComponent(_agentNewsId)),
    ]);
    renderAgentAssessment((assessRes && assessRes.assessment) || [], (analysesRes && analysesRes.analyses) || [], true);
  } catch (e) {
    renderAgentError('评估加载失败，请重试。');
  }
}

function renderAgentLoading(text) {
  const pane = document.getElementById('agentAnalysisPane') || document.getElementById('agentBody');
  if (!pane) return;
  pane.innerHTML =
    '<div class="pn-agent-loading"><span class="pn-agent-spinner"></span><span>' + esc(text || 'AI 分析生成中…') + '</span></div>';
}

function renderAgentError(msg) {
  const pane = document.getElementById('agentAnalysisPane') || document.getElementById('agentBody');
  if (!pane) return;
  pane.innerHTML =
    '<div class="pn-agent-error">' + esc(msg || '分析失败，请稍后重试。') + '</div>' +
    '<button class="pn-agent-btn" id="agentRunBtn" onclick="triggerAgentAnalysis(\'' + (_activeViewpointId || _AGENT_DEFAULT_VIEWPOINT) + '\')">重试分析</button>';
}

function renderAgentOutput(output, meta) {
  const pane = document.getElementById('agentAnalysisPane') || document.getElementById('agentBody');
  if (!pane) return;
  let html = '';
  const vname = (meta && meta.viewpoint_name)
    ? meta.viewpoint_name
    : (_viewpointNameMap[meta && meta.viewpoint_id] || '');
  const vid = (meta && meta.viewpoint_id) || _activeViewpointId || _AGENT_DEFAULT_VIEWPOINT;
  // 顶部工具栏：当前视角 + 切换视角 + 重新分析（极简，不再展示匹配度/评估提示/视角介绍等）
  html += '<div class="pn-agent-current">' +
    '<span class="pn-agent-current-name">' + esc(vname || 'AI 分析') + '</span>' +
    '<button class="pn-agent-switch" onclick="renderAgentAssessmentFromServer()">换一个角度分析</button>' +
    '<button class="pn-agent-switch" onclick="triggerAgentAnalysis(\'' + vid + '\', true)">重新分析</button>' +
    '</div>';
  // 摘要/关键事实已合并于上方「事实」区块，此处只保留各角度分析要点锐度正文；
  // 与事实区重复的条目（相同或完全被事实包含的短句）过滤，避免同一内容重复出现
  const factKeys = (output && Array.isArray(output.facts) ? output.facts : []).map(function (f) {
    return String(f || '').replace(/[\s\p{P}]/gu, '').toLowerCase();
  }).filter(function (k) { return k; });
  const normKey = function (s) { return String(s || '').replace(/[\s\p{P}]/gu, '').toLowerCase(); };
  const angles = (output && Array.isArray(output.angles) ? output.angles : []).filter(function (a) {
    const key = normKey(a);
    if (!key) return false;
    if (factKeys.indexOf(key) >= 0) return false;
    if (key.length <= 30 && factKeys.some(function (fk) { return fk.indexOf(key) >= 0; })) return false;
    return true;
  });
  if (angles.length) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">分析角度</div><ul class="pn-agent-angles">' +
      angles.map(function (a) { return '<li class="pn-agent-md">' + renderAgentMd(a) + '</li>'; }).join('') + '</ul></div>';
  }
  if (output && output.history) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">历史背景</div><div class="pn-agent-history pn-agent-md">' + renderAgentMd(output.history) + '</div></div>';
  }
  if (output && output.outlook) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">未来推演</div><div class="pn-agent-outlook pn-agent-md">' + renderAgentMd(output.outlook) + '</div></div>';
  }
  if (output && output.uncertainty) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">不确定性 / 待核实</div><div class="pn-agent-uncertainty pn-agent-md">' + renderAgentMd(output.uncertainty) + '</div></div>';
  }
  // 参考报道：兼容两种结构（旧版数组 [{title,source}] / 新版 {recent:[...], historical:[...]}）
  let refsRecent = [];
  let refsHist = [];
  if (output && output.references && !Array.isArray(output.references)) {
    refsRecent = output.references.recent || [];
    refsHist = output.references.historical || [];
  } else if (output && Array.isArray(output.references)) {
    refsRecent = output.references.filter(function (r) { return !r || r.tag !== 'historical'; });
    refsHist = output.references.filter(function (r) { return r && r.tag === 'historical'; });
  }
  function refLineHtml(r) {
    const rt = (r && r.title) ? renderAgentMd(r.title) : '';
    const rid = (r && r.ref_id) ? '<span class="pn-agent-ref-id">' + esc(r.ref_id) + '</span> ' : '';
    const rs = (r && r.source) ? ' <span class="pn-agent-ref-src">[' + esc(r.source) + ']</span>' : '';
    return '<li class="pn-agent-md">' + rid + rt + rs + '</li>';
  }
  if (refsRecent.length) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">近期相关报道</div><ul class="pn-agent-facts">' +
      refsRecent.map(refLineHtml).join('') + '</ul></div>';
  }
  if (refsHist.length) {
    html += '<div class="pn-agent-block"><div class="pn-agent-block-title">历史背景报道</div><ul class="pn-agent-facts">' +
      refsHist.map(refLineHtml).join('') + '</ul></div>';
  }
  if (!html) {
    html = '<p class="pn-agent-tip">该新闻暂无可展示的分析结果。</p>';
  }
  pane.innerHTML = html;
  // 任务5：出现分析内容时隐藏视角入口列表（点「换一个角度分析」再显示）
  const vpList = document.getElementById('agentBody');
  if (vpList && vpList !== pane) vpList.innerHTML = '';
}

/* ---- 轻量 markdown 渲染（纯前端本地实现，无外部 CDN） ---- */
function renderAgentMd(src) {
  if (!src) return '';
  let text = String(src);
  const blocks = [];
  text = text.replace(/```([\w+-]*)\n?([\s\S]*?)```/g, function (m, lang, code) {
    const idx = blocks.length;
    blocks.push('<pre class="pn-md-pre"><code class="pn-md-code">' + esc(code.replace(/\n$/, '')) + '</code></pre>');
    return '\u0000MD_BLOCK_' + idx + '\u0000';
  });
  text = esc(text);
  text = text.replace(/`([^`\n]+)`/g, function (m, code) {
    return '<code class="pn-md-inline">' + code + '</code>';
  });
  const lines = text.split('\n');
  let html = '';
  let inList = null;
  function closeList() {
    if (inList) { html += '</' + inList + '>'; inList = null; }
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const blockMatch = line.match(/^\u0000MD_BLOCK_(\d+)\u0000$/);
    if (blockMatch) { closeList(); html += blocks[Number(blockMatch[1])]; continue; }
    if (!trimmed) { closeList(); continue; }
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const lv = h[1].length;
      html += '<h' + lv + ' class="pn-md-h' + lv + '">' + inlineMd(h[2]) + '</h' + lv + '>';
      continue;
    }
    if (trimmed.indexOf('>') === 0 || trimmed.indexOf('&gt;') === 0) {
      closeList();
      html += '<blockquote class="pn-md-quote">' + inlineMd(trimmed.replace(/^&gt;\s?/, '').replace(/^>\s?/, '').trim()) + '</blockquote>';
      continue;
    }
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (inList !== 'ul') { closeList(); html += '<ul class="pn-md-ul">'; inList = 'ul'; }
      html += '<li>' + inlineMd(ul[1]) + '</li>';
      continue;
    }
    const ol = trimmed.match(/^\d+[.、)]\s+(.*)$/);
    if (ol) {
      if (inList !== 'ol') { closeList(); html += '<ol class="pn-md-ol">'; inList = 'ol'; }
      html += '<li>' + inlineMd(ol[1]) + '</li>';
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeList();
      html += '<hr class="pn-md-hr">';
      continue;
    }
    closeList();
    let para = line;
    while (i + 1 < lines.length && lines[i + 1].trim() &&
           !/^\u0000MD_BLOCK_/.test(lines[i + 1]) &&
           !lines[i + 1].match(/^(#{1,6}\s|>\s?|[-*]\s|\d+[.、)]\s)/)) {
      para += '\n' + lines[i + 1];
      i++;
    }
    html += '<p class="pn-md-p">' + inlineMd(para.replace(/\n/g, '<br>')) + '</p>';
  }
  closeList();
  html = html.replace(/\u0000MD_BLOCK_(\d+)\u0000/g, function (m, idx) { return blocks[Number(idx)]; });
  return html;
}

function inlineMd(s) {
  let t = String(s);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  t = t.replace(/`([^`\n]+)`/g, '<code class="pn-md-inline">$1</code>');
  return t;
}

async function triggerAgentAnalysis(viewpointId, force) {
  const body = document.getElementById('agentBody');
  if (!body || !_agentNewsId) return;
  const vid = viewpointId || _activeViewpointId || _AGENT_DEFAULT_VIEWPOINT;
  _activeViewpointId = vid;
  const vname = _viewpointNameMap[vid] || '';
  renderAgentLoading(vname ? '「' + vname + '」分析生成中…' : 'AI 分析生成中…');
  const btn = document.getElementById('agentRunBtn');
  if (btn) btn.disabled = true;
  try {
    const res = await api('/api/agent-analysis/analyze', {
      method: 'POST',
      body: { news_id: _agentNewsId, viewpoint_id: vid, force: force ? 1 : 0 },
    });
    if (res && res.error) {
      renderAgentError(res.error);
      return;
    }
    if (res && res.status === 'failed') {
      renderAgentError(res.error || 'AI 分析失败，请稍后重试。');
      return;
    }
    if (res && res.status === 'running') {
      renderAgentLoading('该新闻的分析正在生成中…');
      return;
    }
    if (res && (res.status === 'ok' || res.status === 'cached') && res.output) {
      renderAgentOutput(res.output, res);
      refreshAgentSummary();
      return;
    }
    renderAgentError('分析返回异常，请稍后重试。');
  } catch (e) {
    renderAgentError((e && e.message) || '分析失败，请稍后重试。');
  }
}

async function refreshAgentSummary() {
  if (!_agentNewsId) return;
  try {
    const res = await api('/api/agent-analysis/' + encodeURIComponent(_agentNewsId));
    renderAgentSummaryPanel((res && res.analyses) || []);
  } catch (e) { /* 忽略，摘要面板保持现状 */ }
}

/* ===== 相关新闻 · 多信源聚合 ===== */
async function loadRelatedNews(newsId) {
  const section = document.getElementById('relatedSection');
  const list = document.getElementById('relatedList');
  const note = document.getElementById('relatedNote');
  try {
    const data = await api('/api/news/' + encodeURIComponent(newsId) + '/related');
    const items = data.related || [];
    section.style.display = '';
    if (!items.length) {
      note.textContent = '7 天内未找到跨信源相关报道，本页为单信源内容。';
      list.textContent = '';
      const empty = el('div', 'pn-related-empty');
      empty.textContent = '暂无聚合内容';
      list.appendChild(empty);
      return;
    }
    note.textContent = '匹配原则：标题主题词重叠计分（英文/数字词 ×3、中文双字词 ×1，含摘要兜底），得分 ≥3 且 7 天内，不同信源各取最新一条。命中词：' +
      (data.matched_tokens || []).slice(0, 6).join('、');
    list.textContent = '';
    items.forEach(r => {
      const card = document.createElement('div');
      card.className = 'pn-related-item';
      const srcBadge = r.source ? '<span class="pn-source-badge">' + esc(r.source) + '</span>' : '';
      const catBadge = r.category ? '<span class="pn-related-cat">' + esc(r.category) + '</span>' : '';
      const same = r.same_category ? '<span class="pn-related-same">同分类</span>' : '';
      // 正文预览优先（已抓取的真实内容）；无正文时回退到摘要
      let sumHtml = '';
      let bodyHtml = '';
      if (r.content_preview) {
        bodyHtml = '<div class="pn-related-body">' + esc(r.content_preview) + '</div>';
        if (r.has_more_content) {
          bodyHtml += '<button type="button" class="pn-related-expand" data-id="' + encodeURIComponent(r.id) + '">展开全文</button>';
        }
      } else if (r.summary) {
        sumHtml = '<div class="pn-related-summary">' + esc(r.summary) + '</div>';
      }
      card.innerHTML =
        '<div class="pn-related-link">' +
          esc(r.title) +
        '</div>' +
        '<div class="pn-related-meta">' + srcBadge + catBadge + same +
          '<span class="pn-related-time">' + formatDate(r.created_at) + '</span>' +
        '</div>' +
        sumHtml +
        bodyHtml +
        (r.need_translate ? '<button type="button" class="pn-related-translate">实时翻译</button>' : '') +
        '<div class="pn-related-tr"></div>';
      // 点击相关报道标题：站内打开详情（不再跳根路径 /?id=）
      const rlink = card.querySelector('.pn-related-link');
      if (rlink) {
        rlink.style.cursor = 'pointer';
        rlink.addEventListener('click', () => openDetail(r.id));
      }
      // 聚合报道的实时翻译：可展开/收起译文
      const trb = card.querySelector('.pn-related-translate');
      if (trb) {
        let opened = false;
        trb.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const box = card.querySelector('.pn-related-tr');
          if (opened && box) {
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
            trb.textContent = box.style.display === 'none' ? '实时翻译' : '收起译文';
            return;
          }
          trb.disabled = true;
          trb.textContent = '翻译中…';
          try {
            // 30 秒超时保护：长文 AI 翻译耗时可能较长，超时给出明确反馈而不是无限等待
            const res = await Promise.race([
              api('/api/news/translate', { method: 'POST', body: JSON.stringify({ news_id: r.id }) }),
              new Promise((_, rej) => setTimeout(() => rej(new Error('翻译超时，请稍后重试')), 30000)),
            ]);
            if (!box) return;
            let html = '';
            if (res.title && res.title !== r.title) html += '<div class="pn-tr-title">' + esc(res.title) + '</div>';
            if (res.content) html += '<div class="pn-tr-body">' + esc(res.content) + '</div>';
            box.innerHTML = html || '<div class="pn-tr-empty">未获取到译文（原文可能已是中文或翻译服务暂不可用）</div>';
            box.style.display = 'block';
            opened = true;
            trb.textContent = '收起译文';
          } catch (err) {
            toast((err && err.message) || '翻译失败', 'error');
          } finally {
            trb.disabled = false;
          }
        });
      }
      const exp = card.querySelector('.pn-related-expand');
      if (exp) {
        exp.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            const d = await api('/api/news/' + encodeURIComponent(r.id));
            const full = (d.news && d.news.content) || '';
            if (full) {
              exp.style.display = 'none';
              let fullEl = card.querySelector('.pn-related-full');
              if (!fullEl) {
                fullEl = document.createElement('div');
                fullEl.className = 'pn-related-full';
                card.appendChild(fullEl);
              }
              fullEl.innerHTML = renderMarkdown(full, (d.news && d.news.images) || []);
              // 收起按钮：收回展开的全文并恢复“展开全文”
              let colEl = card.querySelector('.pn-related-collapse');
              if (!colEl) {
                colEl = document.createElement('button');
                colEl.type = 'button';
                colEl.className = 'pn-related-collapse';
                colEl.textContent = '收起';
                card.appendChild(colEl);
              }
              colEl.onclick = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                fullEl.innerHTML = '';
                fullEl.style.display = 'none';
                colEl.remove();
                exp.style.display = '';
              };
            }
          } catch (err) {
            toast((err && err.message) || '加载失败', 'error');
          }
        });
      }
      list.appendChild(card);
    });
  } catch (e) {
    section.style.display = 'none';
  }
}

function updateLikeUI(liked, likes) {
  const btn = document.getElementById('dLikeBtn');
  btn.classList.toggle('liked', !!liked);
  document.getElementById('dLikeCount').textContent = likes;
}

async function toggleNewsLike() {
  if (!state.user) return requireLogin();
  if (!state.currentNews) return;
  try {
    const data = await api('/api/news/' + encodeURIComponent(state.currentNews.id) + '/like', { method: 'POST' });
    updateLikeUI(data.liked, data.likes);
  } catch (e) {
    if (e.status === 401) return requireLogin();
    toast(e.message || '操作失败', 'error');
  }
}

function reportNews() {
  if (!state.currentNews) return;
  if (typeof window.openReportSheet === 'function') {
    window.openReportSheet('news', state.currentNews.id, state.currentNews.title);
  }
}

async function deleteNews() {
  if (!state.currentNews) return;
  if (!confirm('确定删除这条新闻吗？其评论也会一并删除。')) return;
  try {
    await api('/api/admin/news/' + encodeURIComponent(state.currentNews.id), { method: 'DELETE' });
    backToList();
    loadNews(1);
    toast('已删除');
  } catch (e) {
    toast(e.message || '删除失败', 'error');
  }
}

function backToList() {
  state.currentNews = null;
  document.getElementById('detailView').style.display = 'none';
  document.getElementById('listView').style.display = '';
}

/* ===== 评论 ===== */
async function loadComments(newsId, page = 1, append = false) {
  try {
    const data = await api('/api/news/' + encodeURIComponent(newsId) + '/comments?page=' + page);
    state.commentPage = data.page;
    state.commentTotal = data.total;
    renderComments(data.comments || [], append);
    updateCommentMore();
  } catch (e) {
    console.error(e);
  }
}

function updateCommentMore() {
  const btn = document.getElementById('commentMore');
  const loaded = document.getElementById('commentList').children.length;
  btn.style.display = loaded < state.commentTotal ? '' : 'none';
}

function renderComments(comments, append = false) {
  const list = document.getElementById('commentList');
  if (!append) list.textContent = '';
  document.getElementById('cCount').textContent = '(' + state.commentTotal + ')';
  for (const c of comments) {
    list.appendChild(buildCommentEl(c));
  }
}

function buildCommentEl(c) {
  const item = el('div', 'pn-comment');
  const goToProfile = () => {
    if (c.author_id) window.location.href = '/?profile=' + encodeURIComponent(c.author_id);
  };
  if (c.author_avatar) {
    const img = el('img', 'pn-avatar');
    img.src = c.author_avatar;
    img.alt = '';
    if (c.author_id) { img.style.cursor = 'pointer'; img.onclick = goToProfile; }
    item.appendChild(img);
  }
  const body = el('div', 'pn-comment-body');
  const head = el('div', 'pn-comment-head');
  const authorSpan = el('span', 'pn-author', c.author_name);
  if (c.author_id) { authorSpan.style.cursor = 'pointer'; authorSpan.onclick = goToProfile; }
  head.appendChild(authorSpan);
  head.appendChild(el('span', 'pn-time', timeAgo(c.created_at)));
  body.appendChild(head);
  body.appendChild(el('div', 'pn-comment-content', c.content));
  if (c.image) {
    const img = el('img', 'pn-comment-img');
    img.src = c.image;
    img.alt = '';
    body.appendChild(img);
  }
  const actions = el('div', 'pn-comment-actions');
  const likeBtn = el('button', 'pn-like-btn small' + (c.liked ? ' liked' : ''));
  likeBtn.innerHTML = ICON.heart + '<span>' + c.likes + '</span>';
  likeBtn.addEventListener('click', async () => {
    if (!state.user) return requireLogin();
    try {
      const data = await api('/api/news/comments/' + encodeURIComponent(c.id) + '/like', { method: 'POST' });
      likeBtn.classList.toggle('liked', data.liked);
      likeBtn.innerHTML = ICON.heart + '<span>' + data.likes + '</span>';
    } catch (e) {
      if (e.status === 401) return requireLogin();
      toast(e.message || '操作失败', 'error');
    }
  });
  actions.appendChild(likeBtn);
  if (state.user && (state.user.id === c.author_id || state.isAdmin)) {
    const delBtn = el('button', 'pn-delete-btn small', '删除');
    delBtn.addEventListener('click', async () => {
      if (!confirm('确定删除这条评论吗？')) return;
      try {
        await api('/api/news/comments/' + encodeURIComponent(c.id), { method: 'DELETE' });
        item.remove();
        state.commentTotal = Math.max(0, state.commentTotal - 1);
        document.getElementById('cCount').textContent = '(' + state.commentTotal + ')';
        updateCommentMore();
      } catch (e) {
        toast(e.message || '删除失败', 'error');
      }
    });
    actions.appendChild(delBtn);
  }
  body.appendChild(actions);
  item.appendChild(body);
  return item;
}

async function submitComment() {
  if (!state.user) return requireLogin();
  if (!state.currentNews) return;
  const input = document.getElementById('commentInput');
  const content = input.value.trim();
  if (!content) { toast('请输入评论内容', 'error'); return; }
  const btn = document.getElementById('commentSubmit');
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = '发表中…';
  try {
    const data = await api('/api/news/' + encodeURIComponent(state.currentNews.id) + '/comments', {
      method: 'POST',
      body: { content, image: '' }
    });
    input.value = '';
    document.getElementById('commentList').appendChild(buildCommentEl(data.comment));
    state.commentTotal += 1;
    document.getElementById('cCount').textContent = '(' + state.commentTotal + ')';
    updateCommentMore();
    toast('评论成功');
  } catch (e) {
    if (e.status === 401) return requireLogin();
    toast(e.message || '评论失败，请重试', 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = '发表评论';
  }
}

/* ===== 发布 / 编辑 ===== */
function openPublishModal(edit = false) {
  state.editingId = edit && state.currentNews ? state.currentNews.id : null;
  document.getElementById('mModalTitle').textContent = state.editingId ? '编辑新闻' : '发布新闻';
  document.getElementById('mSubmit').textContent = state.editingId ? '保存' : '发布';
  if (state.editingId) {
    document.getElementById('mTitle').value = state.currentNews.title || '';
    document.getElementById('mContent').value = state.currentNews.content || '';
    document.getElementById('mSummary').value = state.currentNews.summary || '';
    document.getElementById('mCategory').value = state.currentNews.category || '';
    document.getElementById('mPinned').checked = !!state.currentNews.pinned;
    const pv = document.getElementById('mPreview');
    if (state.currentNews.image) { pv.src = state.currentNews.image; pv.style.display = ''; }
    // 加载已有视频
    state.video = state.currentNews.video || '';
    setModalVideo(state.video);
    // 加载已有插图
    state.gallery = Array.isArray(state.currentNews.images) ? state.currentNews.images.map(i => ({...i})) : [];
  } else {
    state.gallery = [];
    state.video = '';
    setModalVideo('');
    document.getElementById('mAiAllowed').checked = true;
  }
  renderGallery();
  switchEditTab('edit');
  document.getElementById('publishModal').classList.add('show');
}

function closePublishModal() {
  document.getElementById('publishModal').classList.remove('show');
  state.editingId = null;
  state.gallery = [];
  state.video = '';
  document.getElementById('mTitle').value = '';
  document.getElementById('mContent').value = '';
  document.getElementById('mSummary').value = '';
  document.getElementById('mCategory').value = '';
  document.getElementById('mPinned').checked = false;
  document.getElementById('mImage').value = '';
  document.getElementById('mVideoInput').value = '';
  setModalVideo('');
  const pv = document.getElementById('mPreview');
  pv.style.display = 'none';
  pv.src = '';
  renderGallery();
  switchEditTab('edit');
}

/* 弹窗内视频预览：url 为空则隐藏 */
function setModalVideo(url) {
  const wrap = document.getElementById('mVideoWrap');
  const v = document.getElementById('mVideoPreview');
  if (url) { v.src = url; wrap.style.display = ''; }
  else { v.removeAttribute('src'); v.load && v.load(); wrap.style.display = 'none'; }
}

/* ===== 插图管理 ===== */
function renderGallery() {
  const list = document.getElementById('mGalleryList');
  list.textContent = '';
  state.gallery.forEach((img, idx) => {
    const item = el('div', 'pn-gallery-item');
    item.draggable = true;
    item.dataset.idx = idx;
    const num = el('div', 'pn-gallery-item-num', String(idx + 1));
    item.appendChild(num);
    const imgEl = el('img');
    imgEl.src = img.url;
    imgEl.alt = '';
    item.appendChild(imgEl);
    const delBtn = el('button', 'pn-gallery-item-del', '×');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.gallery.splice(idx, 1);
      renderGallery();
    });
    item.appendChild(delBtn);
    // 点击编辑
    item.addEventListener('click', () => openImageEdit(idx));
    // 拖拽排序
    item.addEventListener('dragstart', (e) => {
      state.dragIdx = idx;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIdx = state.dragIdx;
      const toIdx = idx;
      if (fromIdx < 0 || fromIdx === toIdx) return;
      const [moved] = state.gallery.splice(fromIdx, 1);
      state.gallery.splice(toIdx, 0, moved);
      state.dragIdx = -1;
      renderGallery();
    });
    list.appendChild(item);
  });
}

async function handleGalleryUpload(files) {
  if (!files || !files.length) return;
  for (const file of files) {
    try {
      setProgress('正在上传插图… 0%', 0);
      const url = await uploadWithProgress(file, (pct) => setProgress(`正在上传插图… ${pct}%`, pct));
      state.gallery.push({ url: '/' + url.replace(/^\/+/, ''), caption: '', position: 'center' });
    } catch (e) {
      toast(e.message || '插图上传失败', 'error');
    }
  }
  setProgress(null);
  renderGallery();
}

function openImageEdit(idx) {
  const img = state.gallery[idx];
  if (!img) return;
  state.galleryEditIdx = idx;
  document.getElementById('iePreview').src = img.url;
  document.getElementById('ieCaption').value = img.caption || '';
  // 设置位置按钮
  document.querySelectorAll('#iePosition .pn-pos-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.pos === (img.position || 'center'));
  });
  document.getElementById('ieInsert').textContent = `在光标处插入 [img:${idx + 1}]`;
  document.getElementById('imageEditModal').classList.add('show');
}

function closeImageEdit() {
  // 保存编辑结果
  if (state.galleryEditIdx >= 0 && state.gallery[state.galleryEditIdx]) {
    state.gallery[state.galleryEditIdx].caption = document.getElementById('ieCaption').value.trim();
    const activePos = document.querySelector('#iePosition .pn-pos-btn.active');
    state.gallery[state.galleryEditIdx].position = activePos ? activePos.dataset.pos : 'center';
  }
  document.getElementById('imageEditModal').classList.remove('show');
  state.galleryEditIdx = -1;
  renderGallery();
}

function insertImageTag() {
  if (state.galleryEditIdx < 0) return;
  const textarea = document.getElementById('mContent');
  const tag = `[img:${state.galleryEditIdx + 1}]`;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  textarea.value = text.substring(0, start) + tag + text.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + tag.length;
  closeImageEdit();
}

/* ===== 剪贴板粘贴：图片自动上传插入 / Markdown 原样保留 ===== */
function insertIntoEditor(text) {
  const textarea = document.getElementById('mContent');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

/* 把网页复制的 HTML 片段转换为 Markdown，保留代码块/表格/链接/图片/标题/列表等结构 */
function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = [];
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    const inner = () => Array.from(node.childNodes).map(walk).join('');
    if (tag === 'br') return '  \n';
    if (tag === 'pre') {
      const c = node.querySelector('code');
      const code = (c || node).textContent.replace(/\n$/, '');
      return '\n```\n' + code + '\n```\n';
    }
    if (tag === 'code') return '`' + node.textContent + '`';
    if (tag === 'a') {
      const t = inner().trim();
      const href = node.getAttribute('href') || '';
      return t && href ? '[' + t + '](' + href + ')' : (t || href);
    }
    if (tag === 'img') {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      return src ? '![' + alt + '](' + src + ')' : '';
    }
    if (/^h[1-6]$/.test(tag)) return '\n' + '#'.repeat(+tag[1]) + ' ' + inner().trim() + '\n';
    if (tag === 'blockquote') return '\n> ' + inner().trim().replace(/\n/g, '\n> ') + '\n';
    if (tag === 'hr') return '\n---\n';
    if (tag === 'table') {
      const rows = [];
      node.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('th, td').forEach(c => cells.push(Array.from(c.childNodes).map(walk).join('').trim().replace(/\|/g, '\\|')));
        if (cells.length) rows.push(cells);
      });
      if (!rows.length) return '';
      const lines = ['', '| ' + rows[0].join(' | ') + ' |', '| ' + rows[0].map(() => '---').join(' | ') + ' |'];
      rows.slice(1).forEach(r => lines.push('| ' + r.join(' | ') + ' |'));
      lines.push('');
      return lines.join('\n');
    }
    if (tag === 'ul' || tag === 'ol') {
      const ordered = tag === 'ol';
      const lines = [];
      Array.from(node.children).forEach((li, i) => {
        if (li.tagName.toLowerCase() !== 'li') return;
        const prefix = ordered ? (i + 1) + '. ' : '- ';
        lines.push(prefix + Array.from(li.childNodes).map(walk).join('').trim().replace(/\n+/g, ' '));
      });
      return '\n' + lines.join('\n') + '\n';
    }
    if (['p','div','section','article','li','tr','h1','h2','h3','h4','h5','h6'].includes(tag)) {
      return '\n' + inner().trim() + '\n';
    }
    if (['strong','b'].includes(tag)) return '**' + inner() + '**';
    if (['em','i'].includes(tag)) return '*' + inner() + '*';
    if (['del','s','strike'].includes(tag)) return '~~' + inner() + '~~';
    return inner();
  }
  Array.from(doc.body ? doc.body.childNodes : []).forEach(n => {
    const s = walk(n);
    if (s) out.push(s);
  });
  return out.join('').replace(/\n{3,}/g, '\n\n').trim();
}

async function handleEditorPaste(e) {
  const cd = e.clipboardData;
  if (!cd) return;
  // 1) 图片：剪贴板含图片文件（本地截图/网页复制的图片）→ 自动上传并插入 [img:N]
  const imgItems = Array.from(cd.items || []).filter(it => it.type && it.type.startsWith('image/'));
  if (imgItems.length) {
    e.preventDefault();
    const file = imgItems[0].getAsFile();
    if (!file) return;
    // 剪贴板文件常缺扩展名，按 MIME 补全以便通过后端格式校验
    const mimeExt = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp' };
    const ext = mimeExt[file.type] || '.png';
    const uploadFile = (file.name && /\.(png|jpe?g|gif|webp)$/i.test(file.name)) ? file : new File([file], 'pasted' + ext, { type: file.type });
    toast('正在上传粘贴的图片…', 'success');
    try {
      const url = await uploadWithProgress(uploadFile, null);
      state.gallery.push({ url: '/' + url.replace(/^\/+/, ''), caption: '', position: 'center' });
      renderGallery();
      insertIntoEditor('[img:' + state.gallery.length + ']');
      toast('图片已上传并插入', 'success');
    } catch (err) {
      toast(err.message || '粘贴图片上传失败', 'error');
    }
    return;
  }
  // 2) Markdown：剪贴板含 HTML 结构（从网页/富文本复制）→ 转 Markdown 保留格式
  const html = cd.getData('text/html');
  if (html) {
    e.preventDefault();
    const plain = cd.getData('text/plain') || '';
    if (/<(pre|code|table|a|img|h[1-6]|ul|ol|blockquote|strong|b|em|i)[ >]/i.test(html)) {
      const md = htmlToMarkdown(html);
      insertIntoEditor('\n' + md + '\n');
      toast('已粘贴 Markdown 格式内容', 'success');
    } else {
      // 无结构化标签（如纯文本复制）→ 保持原样插入
      insertIntoEditor(plain);
    }
    return;
  }
  // 3) 纯文本：交给浏览器默认行为原样插入，无需处理
}

/* ===== 编辑器工具栏 ===== */
function handleToolbarAction(action) {
  const textarea = document.getElementById('mContent');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  let insert = '';
  let cursorOffset = 0;

  switch (action) {
    case 'bold':
      insert = `**${selected || '粗体'}**`;
      cursorOffset = selected ? 0 : -2;
      break;
    case 'italic':
      insert = `*${selected || '斜体'}*`;
      cursorOffset = selected ? 0 : -1;
      break;
    case 'strikethrough':
      insert = `~~${selected || '删除线'}~~`;
      cursorOffset = selected ? 0 : -2;
      break;
    case 'h2':
      insert = `\n## ${selected || '标题'}\n`;
      break;
    case 'quote':
      insert = `\n> ${selected || '引用'}\n`;
      break;
    case 'code':
      if (selected && selected.includes('\n')) {
        insert = '\n```\n' + selected + '\n```\n';
      } else {
        insert = '`' + (selected || 'code') + '`';
      }
      break;
    case 'ul':
      if (selected) {
        insert = '\n' + selected.split('\n').map(l => '- ' + l).join('\n') + '\n';
      } else {
        insert = '\n- 列表项\n';
        cursorOffset = -4;
      }
      break;
    case 'ol':
      if (selected) {
        insert = '\n' + selected.split('\n').map((l, i) => (i + 1) + '. ' + l).join('\n') + '\n';
      } else {
        insert = '\n1. 列表项\n';
        cursorOffset = -4;
      }
      break;
    case 'link':
      insert = `[${selected || '链接文字'}](https://)`;
      break;
    case 'image':
      // 触发插图上传
      document.getElementById('mGalleryInput').click();
      return;
    case 'video':
      // 触发视频上传（工具栏入口）
      document.getElementById('mVideoInput').click();
      return;
    case 'divider':
      insert = '\n---\n';
      break;
  }

  textarea.value = text.substring(0, start) + insert + text.substring(end);
  textarea.focus();
  if (cursorOffset) {
    textarea.selectionStart = textarea.selectionEnd = start + insert.length + cursorOffset;
  } else {
    textarea.selectionStart = textarea.selectionEnd = start + insert.length;
  }
}

function switchEditTab(tab) {
  const editBtn = document.getElementById('mTabEdit');
  const previewBtn = document.getElementById('mTabPreview');
  const textarea = document.getElementById('mContent');
  const previewBox = document.getElementById('mPreviewBox');
  const toolbar = document.getElementById('mToolbar');
  if (tab === 'preview') {
    previewBtn.classList.add('active');
    editBtn.classList.remove('active');
    const content = textarea.value.trim();
    previewBox.innerHTML = content ? renderMarkdown(content, state.gallery) : '<p style="color:var(--text3);text-align:center;padding:20px">没有内容可预览</p>';
    previewBox.style.display = '';
    textarea.style.display = 'none';
    if (toolbar) toolbar.style.display = 'none';
  } else {
    editBtn.classList.add('active');
    previewBtn.classList.remove('active');
    previewBox.style.display = 'none';
    textarea.style.display = '';
    if (toolbar) toolbar.style.display = '';
  }
}

function setProgress(text, pct) {
  const box = document.getElementById('mProgress');
  if (text === null) {
    box.classList.remove('show');
    document.getElementById('mProgressBar').style.width = '0%';
    return;
  }
  box.classList.add('show');
  document.getElementById('mProgressText').textContent = text;
  document.getElementById('mProgressBar').style.width = (pct || 0) + '%';
}

async function submitNews() {
  const title = document.getElementById('mTitle').value.trim();
  const content = document.getElementById('mContent').value.trim();
  const summary = document.getElementById('mSummary').value.trim();
  const category = document.getElementById('mCategory').value;
  const pinned = document.getElementById('mPinned').checked;
  const file = document.getElementById('mImage').files[0];
  if (!title || !content) { toast('标题和内容不能为空', 'error'); return; }
  const btn = document.getElementById('mSubmit');
  const btnText = btn.textContent;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = state.editingId ? '保存中…' : '发布中…';
  try {
    // 编辑模式下未重选图片则保留原封面（去掉前导斜杠，与上传返回格式一致）
    let image = state.editingId ? (state.currentNews.image || '').replace(/^\/+/, '') : '';
    if (file) {
      setProgress('正在上传图片… 0%', 0);
      image = await uploadWithProgress(file, (pct) => setProgress(`正在上传图片… ${pct}%`, pct));
    }
    // 视频：编辑模式未重选则保留原视频；选新文件则上传
    let video = state.editingId ? (state.currentNews.video || '').replace(/^\/+/, '') : '';
    const vfile = document.getElementById('mVideoInput').files[0];
    if (vfile) {
      setProgress('正在上传视频… 0%', 0);
      video = await uploadVideoWithProgress(vfile, (pct) => setProgress(`正在上传视频… ${pct}%`, pct));
    }
    setProgress(state.editingId ? '正在保存…' : '正在发布…', 100);
    const payload = { title, content, image, video, summary, category, pinned, images: state.gallery };
    if (state.editingId) {
      const data = await api('/api/admin/news/' + encodeURIComponent(state.editingId), {
        method: 'PUT',
        body: payload
      });
      state.currentNews = data.news;
      renderDetail(data.news);
    } else {
      await api('/api/admin/news', { method: 'POST', body: payload });
      loadNews(1);
    }
    closePublishModal();
    toast(state.editingId ? '保存成功' : '发布成功');
  } catch (e) {
    toast(e.message || (state.editingId ? '保存失败，请重试' : '发布失败，请重试'), 'error');
  } finally {
    setProgress(null);
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = btnText;
  }
}

/* ===== 事件绑定 ===== */
function bindEvents() {
  document.getElementById('backBtn').addEventListener('click', backToList);
  document.getElementById('dLikeBtn').addEventListener('click', toggleNewsLike);
  document.getElementById('dEditBtn').addEventListener('click', () => openPublishModal(true));
  document.getElementById('dDeleteBtn').addEventListener('click', deleteNews);
  document.getElementById('commentSubmit').addEventListener('click', submitComment);
  document.getElementById('commentMore').addEventListener('click', () => {
    if (state.currentNews) loadComments(state.currentNews.id, state.commentPage + 1, true);
  });
  document.getElementById('publishBtn').addEventListener('click', () => openPublishModal(false));
  document.getElementById('mCancel').addEventListener('click', closePublishModal);
  document.getElementById('mSubmit').addEventListener('click', submitNews);
  document.getElementById('mTabEdit').addEventListener('click', () => switchEditTab('edit'));
  document.getElementById('mTabPreview').addEventListener('click', () => switchEditTab('preview'));
  document.getElementById('publishModal').addEventListener('click', (e) => {
    if (e.target.id === 'publishModal') closePublishModal();
  });
  document.getElementById('mImage').addEventListener('change', (e) => {
    const pv = document.getElementById('mPreview');
    const f = e.target.files[0];
    if (f) { pv.src = URL.createObjectURL(f); pv.style.display = ''; }
    else { pv.style.display = 'none'; pv.src = ''; }
  });
  // 视频上传：选文件后本地预览，提交时上传；移除按钮清空
  document.getElementById('mVideoInput').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) setModalVideo(URL.createObjectURL(f));
    else setModalVideo('');
  });
  document.getElementById('mVideoRemove').addEventListener('click', () => {
    document.getElementById('mVideoInput').value = '';
    state.video = '';
    setModalVideo('');
  });
  // 插图上传
  document.getElementById('mGalleryInput').addEventListener('change', (e) => {
    handleGalleryUpload(e.target.files);
    e.target.value = '';
  });
  // 工具栏
  document.querySelectorAll('#mToolbar .pn-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => handleToolbarAction(btn.dataset.action));
  });
  // 键盘快捷键
  document.getElementById('mContent').addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const map = { b: 'bold', i: 'italic', d: 'strikethrough', k: 'code', l: 'link' };
    const action = map[e.key.toLowerCase()];
    if (action) { e.preventDefault(); handleToolbarAction(action); }
  });
  // 剪贴板粘贴：图片自动上传插入 / Markdown 保留格式
  document.getElementById('mContent').addEventListener('paste', handleEditorPaste);
  // 插图编辑弹层
  document.getElementById('ieCancel').addEventListener('click', closeImageEdit);
  document.getElementById('ieInsert').addEventListener('click', insertImageTag);
  document.querySelectorAll('#iePosition .pn-pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#iePosition .pn-pos-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  document.getElementById('imageEditModal').addEventListener('click', (e) => {
    if (e.target.id === 'imageEditModal') closeImageEdit();
  });
  // 分类筛选（事件委托，兼容动态渲染的分类标签）
  const catBar = document.getElementById('categoryBar');
  if (catBar) {
    catBar.addEventListener('click', (e) => {
      const chip = e.target.closest('.pn-cat-chip');
      if (!chip) return;
      const cat = chip.dataset.cat || '';
      if (cat === state.category) return;
      /* 切换分类不回到页面顶端：记录当前位置，内容重载后恢复（防止网格清空导致高度塌缩把滚动条顶回顶部） */
      const keepScroll = window.scrollY;
      selectCategory(cat);
      showGridSkeleton();
      clearLoadError();
      loadNews(1).then(() => {
        requestAnimationFrame(() => window.scrollTo(0, Math.min(keepScroll, document.body.scrollHeight - window.innerHeight)));
      }).catch(() => {});
    });
  }
  // 时间筛选
  initFilterBar();
  // 加载失败时点击占位重试
  const moreBox = document.getElementById('moreBox');
  if (moreBox) {
    moreBox.addEventListener('click', () => {
      if (!moreBox.classList.contains('error')) return;
      clearLoadError();
      loadNews(Math.max(1, state.page || 1));
    });
  }
  // 全屏编辑
  document.getElementById('mFullscreenBtn').addEventListener('click', () => {
    const overlay = document.getElementById('publishModal');
    overlay.classList.toggle('fullscreen');
    const btn = document.getElementById('mFullscreenBtn');
    const isFs = overlay.classList.contains('fullscreen');
    btn.title = isFs ? '退出全屏' : '全屏编辑';
    // 切换图标
    btn.innerHTML = isFs
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
  });
}

/* ===== 块三：文本选中悬浮菜单（词语解释/分析视角/辨别真伪/事实评价） ===== */
let _textMenuSel = null;
let _textMenuTimer = null;

function initTextSelectionMenu() {
  const menu = document.getElementById('textMenu');
  if (!menu) return;
  document.addEventListener('selectionchange', function () {
    clearTimeout(_textMenuTimer);
    _textMenuTimer = setTimeout(updateTextSelectionMenu, 120);
  });
  document.addEventListener('mousedown', function (e) {
    const m = document.getElementById('textMenu');
    const r = document.getElementById('textMenuResult');
    if (m && !m.contains(e.target) && r && !r.contains(e.target)) hideTextMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideTextMenu();
  });
  menu.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-mode]');
    if (btn) {
      // 四功能选中态：点哪个哪个变橙色底白字胶囊，切换时高亮随之切换
      menu.querySelectorAll('[data-mode]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      runTextAnalysis(btn.getAttribute('data-mode'));
    }
    const close = e.target.closest('[data-close]');
    if (close) hideTextMenu();
  });
}

function updateTextSelectionMenu() {
  const menu = document.getElementById('textMenu');
  if (!menu) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.toString().trim()) { hideTextMenu(); return; }
  const text = sel.toString().trim();
  if (text.length < 2 || text.length > 500) return;
  const anchor = sel.anchorNode;
  const el = anchor && anchor.nodeType === 3 ? anchor.parentElement : anchor;
  if (!el || !el.closest) return;
  // 仅正文/详情区（正文、翻译框、评论列表、评论区）与多源聚合区（中文/原文）选中时弹出
  const zone = el.closest('#dContent, #dTranslateBox, #commentList, .pn-comment-box, .pn-comments, #relatedSection, #relatedList, .pn-related-item, .pn-related-link, .pn-related-body, .pn-related-summary, .pn-tr-title, .pn-tr-body');
  if (!zone) { hideTextMenu(); return; }
  if (sel.rangeCount < 1) return;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;
  _textMenuSel = { text: text, context: buildSelectionContext(sel) };
  menu.style.display = 'flex';
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  let left = rect.left + rect.width / 2 - mw / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - mw - 8));
  let top = rect.top - mh - 6;
  if (top < 8) top = rect.bottom + 6;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  const result = document.getElementById('textMenuResult');
  if (result && result.style.display !== 'none') positionTextResult(menu, result);
}

function buildSelectionContext(sel) {
  const text = sel.toString().replace(/\s+/g, ' ').trim();
  if (!text) return '';
  let node = sel.anchorNode;
  let container = node && node.nodeType === 3 ? node.parentElement : node;
  if (container && container.closest) {
    const zone = container.closest('#dContent, .pn-comments, #commentList, .pn-comment-box, #relatedSection, #relatedList, .pn-related-item, .pn-related-link, .pn-related-body, .pn-related-summary, .pn-tr-title, .pn-tr-body');
    if (zone) container = zone;
  }
  if (!container || !container.textContent) return '';
  let full = container.textContent.replace(/\s+/g, ' ').trim();
  const idx = full.indexOf(text);
  if (idx < 0) return full.substring(0, 800);
  const start = Math.max(0, idx - 400);
  const end = Math.min(full.length, idx + text.length + 400);
  return full.substring(start, end);
}

function positionTextResult(menu, result) {
  const mh = menu.offsetHeight;
  let left = parseFloat(menu.style.left) || 0;
  let top = parseFloat(menu.style.top) || 0;
  const rw = Math.min(420, window.innerWidth - 16);
  left = Math.max(8, Math.min(left, window.innerWidth - rw - 8));
  result.style.left = left + 'px';
  result.style.top = (top + mh + 6) + 'px';
  result.style.width = rw + 'px';
  result.style.maxHeight = Math.max(120, window.innerHeight - top - mh - 24) + 'px';
}

function showTextMenuLoading() {
  const result = document.getElementById('textMenuResult');
  if (!result) return;
  result.innerHTML = '<div class="pn-text-menu-loading"><span class="pn-agent-spinner"></span><span>AI 结合外部新闻源分析中…</span></div>';
  result.style.display = 'block';
  const menu = document.getElementById('textMenu');
  if (menu) positionTextResult(menu, result);
}

async function runTextAnalysis(mode) {
  if (!_textMenuSel) return;
  const MODES = { explain: '词语解释', viewpoint: '分析视角', verify: '辨别真伪', evaluate: '事实评价' };
  const result = document.getElementById('textMenuResult');
  if (!result) return;
  showTextMenuLoading();
  try {
    const res = await api('/api/text-analysis', {
      method: 'POST',
      body: { mode: mode, selected_text: _textMenuSel.text, context: _textMenuSel.context },
    });
    if (res && res.error) {
      result.innerHTML = '<div class="pn-text-menu-error">' + esc(res.error) + '</div>';
      return;
    }
    const selText = _textMenuSel.text;
    let html = '<div class="pn-text-menu-head">' +
      '<span class="pn-text-menu-mode">' + (MODES[mode] || mode) + '</span>' +
      '<span class="pn-text-menu-sel">' + esc(selText.length > 40 ? selText.substring(0, 40) + '…' : selText) + '</span>' +
      '<button type="button" class="pn-text-menu-close" data-close="1">×</button></div>';
    html += '<div class="pn-text-menu-body pn-agent-md">' + renderAgentMd(res.result || '') + '</div>';
    if (res.external && res.external.length) {
      html += '<div class="pn-text-menu-ext"><div class="pn-text-menu-ext-title">外部检索参考（国外新闻源）</div><ul class="pn-agent-facts">' +
        res.external.map(function (r) {
          return '<li class="pn-agent-md">' +
            (r.source ? '<span class="pn-agent-ref-src">[' + esc(r.source) + ']</span> ' : '') +
            (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + renderAgentMd(r.title || r.url) + '</a>' : renderAgentMd(r.title || '')) +
            (r.date ? ' <span class="pn-text-menu-date">' + esc(r.date) + '</span>' : '') + '</li>';
        }).join('') + '</ul></div>';
    }
    result.innerHTML = html;
    const menu = document.getElementById('textMenu');
    if (menu) positionTextResult(menu, result);
  } catch (e) {
    result.innerHTML = '<div class="pn-text-menu-error">' + esc((e && e.message) || '分析失败，请稍后重试。') + '</div>';
  }
}

function hideTextMenu() {
  const menu = document.getElementById('textMenu');
  const result = document.getElementById('textMenuResult');
  if (menu) menu.style.display = 'none';
  if (result) result.style.display = 'none';
  _textMenuSel = null;
}

init();

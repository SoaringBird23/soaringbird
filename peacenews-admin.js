/* PeaceNews 管理后台 */
const state = { user: null, isAdmin: false, page: 1, total: 0, perPage: 20, config: {} };

async function api(path, options = {}) {
  const { raw, ...opts } = { credentials: 'same-origin', ...options };
  if (!raw) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (opts.body && typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, opts);
  const ct = res.headers.get('content-type') || '';
  let data = null;
  if (ct.includes('application/json')) data = await res.json();
  else { const text = await res.text(); if (!res.ok) throw new Error(text.substring(0,100)); return text; }
  if (!res.ok) { const err = new Error(data.error || `${res.status}`); err.status = res.status; throw err; }
  return data;
}

function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'pn-toast show ' + type;
  setTimeout(() => { t.className = 'pn-toast'; }, 2600);
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

async function init() {
  const hint = document.getElementById('loginHint');
  const hintP = hint.querySelector('p');
  const hintLink = hint.querySelector('a');
  hint.style.display = 'none';

  // 第一步：检查登录状态
  let meData;
  try {
    meData = await api('/api/me');
  } catch (e) {
    hintP.textContent = '网络错误，请刷新重试';
    if (hintLink) hintLink.style.display = 'none';
    hint.style.display = '';
    return;
  }
  state.user = meData.user;
  if (!state.user) {
    hintP.textContent = '需要登录才能访问管理后台';
    if (hintLink) { hintLink.textContent = '前往登录'; hintLink.href = '/signin?redirect=/peacenews/admin'; hintLink.style.display = ''; }
    hint.style.display = '';
    return;
  }

  // 第二步：检查管理员权限
  let chk;
  try {
    chk = await api('/api/admin/check');
  } catch (e) {
    if (e.status === 401) {
      hintP.textContent = '登录已过期，请重新登录';
      if (hintLink) { hintLink.textContent = '重新登录'; hintLink.href = '/signin?redirect=/peacenews/admin'; hintLink.style.display = ''; }
    } else {
      hintP.textContent = '验证权限失败：' + (e.message || '未知错误');
      if (hintLink) hintLink.style.display = 'none';
    }
    hint.style.display = '';
    return;
  }
  if (!chk.is_admin && !chk.is_super_admin) {
    hintP.textContent = '你的账号没有管理权限';
    if (hintLink) { hintLink.textContent = '返回新闻'; hintLink.href = '/peacenews'; hintLink.style.display = ''; }
    hint.style.display = '';
    return;
  }

  state.isAdmin = true;
  hint.style.display = 'none';
  document.getElementById('adminContent').style.display = '';

  try {
    const cfg = await api('/api/news/config');
    state.config = cfg.config;
    fillConfigForm();
  } catch (e) {}

  await loadNews(1);
  bindEvents();
}

function fillConfigForm() {
  document.getElementById('cfgHero').checked = state.config.hero === '1';
  document.getElementById('cfgColumns').value = state.config.columns || '3';
  document.getElementById('cfgPerPage').value = state.config.per_page || '20';
}

async function saveConfig() {
  const updates = {
    hero: document.getElementById('cfgHero').checked ? '1' : '0',
    columns: parseInt(document.getElementById('cfgColumns').value),
    per_page: parseInt(document.getElementById('cfgPerPage').value),
  };
  const btn = document.getElementById('saveConfigBtn');
  btn.disabled = true; btn.textContent = '保存中…';
  try {
    const data = await api('/api/admin/news/config', { method: 'PUT', body: updates });
    state.config = data.config;
    toast('设置已保存');
  } catch (e) {
    toast(e.message || '保存失败', 'error');
  } finally {
    btn.disabled = false; btn.textContent = '保存设置';
  }
}

async function loadNews(page) {
  state.page = page;
  try {
    const data = await api('/api/news?page=' + page);
    state.total = data.total;
    state.perPage = data.per_page || 20;
    renderNewsList(data.news || []);
    renderPager();
  } catch (e) { toast(e.message || '加载失败', 'error'); }
}

function renderNewsList(items) {
  const list = document.getElementById('newsList');
  list.textContent = '';
  if (!items.length) { list.appendChild(el('div', '', '暂无新闻')); return; }
  for (const n of items) {
    const item = el('div', 'pna-news-item');
    if (n.image) { const img = el('img'); img.src = n.image; img.alt = ''; item.appendChild(img); }
    else { const ph = el('div'); ph.style.cssText = 'width:64px;height:48px;border-radius:8px;background:var(--bg-fill);flex-shrink:0'; item.appendChild(ph); }
    const info = el('div', 'pna-news-info');
    info.appendChild(el('h3', '', n.title));
    info.appendChild(el('p', '', `${formatDate(n.created_at)} · ${n.likes} 赞 · ${n.comment_count} 评论`));
    item.appendChild(info);
    const actions = el('div', 'pna-news-actions');
    const editBtn = el('button', '', '编辑');
    editBtn.addEventListener('click', () => { window.location.href = '/peacenews?id=' + encodeURIComponent(n.id); });
    actions.appendChild(editBtn);
    const featBtn = el('button', '', n.featured ? '取消精选' : '精选');
    if (n.featured) featBtn.classList.add('active');
    featBtn.addEventListener('click', async () => {
      try {
        const data = await api('/api/admin/news/' + encodeURIComponent(n.id) + '/featured', { method: 'PUT' });
        n.featured = data.featured;
        featBtn.textContent = data.featured ? '取消精选' : '精选';
        featBtn.classList.toggle('active', data.featured);
        toast(data.featured ? '已设为精选' : '已取消精选');
      } catch (e) { toast(e.message || '操作失败', 'error'); }
    });
    actions.appendChild(featBtn);
    const pinBtn = el('button', '', n.pinned ? '取消置顶' : '置顶');
    if (n.pinned) pinBtn.classList.add('active');
    pinBtn.addEventListener('click', async () => {
      try {
        const data = await api('/api/admin/news/' + encodeURIComponent(n.id) + '/pinned', { method: 'PUT' });
        n.pinned = data.pinned;
        pinBtn.textContent = data.pinned ? '取消置顶' : '置顶';
        pinBtn.classList.toggle('active', data.pinned);
        toast(data.pinned ? '已置顶' : '已取消置顶');
      } catch (e) { toast(e.message || '操作失败', 'error'); }
    });
    actions.appendChild(pinBtn);
    const delBtn = el('button', 'del-btn', '删除');
    delBtn.addEventListener('click', async () => {
      if (!confirm('确定删除「' + n.title + '」？')) return;
      try {
        await api('/api/admin/news/' + encodeURIComponent(n.id), { method: 'DELETE' });
        toast('已删除');
        loadNews(state.page);
      } catch (e) { toast(e.message || '删除失败', 'error'); }
    });
    actions.appendChild(delBtn);
    item.appendChild(actions);
    list.appendChild(item);
  }
}

function renderPager() {
  const pager = document.getElementById('pager');
  pager.textContent = '';
  const pages = Math.ceil(state.total / state.perPage);
  if (pages <= 1) return;
  for (let p = 1; p <= pages; p++) {
    const btn = el('button', 'pn-page-btn' + (p === state.page ? ' active' : ''), String(p));
    btn.addEventListener('click', () => loadNews(p));
    pager.appendChild(btn);
  }
}

function bindEvents() {
  document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
  initLayoutEditor();
  document.getElementById('saveLayoutBtn').addEventListener('click', saveLayout);
}

/* ===== 排版编辑器 ===== */
function initLayoutEditor() {
  const editor = document.getElementById('layoutEditor');
  if (!editor) return;
  let dragEl = null;

  editor.querySelectorAll('.pna-layout-block').forEach(block => {
    block.addEventListener('dragstart', (e) => {
      dragEl = block;
      block.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    block.addEventListener('dragend', () => {
      block.classList.remove('dragging');
      editor.querySelectorAll('.pna-layout-block').forEach(b => b.classList.remove('drag-over'));
      dragEl = null;
    });
    block.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (block !== dragEl) block.classList.add('drag-over');
    });
    block.addEventListener('dragleave', () => block.classList.remove('drag-over'));
    block.addEventListener('drop', (e) => {
      e.preventDefault();
      block.classList.remove('drag-over');
      if (!dragEl || block === dragEl) return;
      const allBlocks = [...editor.querySelectorAll('.pna-layout-block')];
      const fromIdx = allBlocks.indexOf(dragEl);
      const toIdx = allBlocks.indexOf(block);
      if (fromIdx < toIdx) editor.insertBefore(dragEl, block.nextSibling);
      else editor.insertBefore(dragEl, block);
    });
  });

  // 加载保存的排版顺序
  loadLayoutOrder();
}

function loadLayoutOrder() {
  const saved = localStorage.getItem('pn_layout_order');
  if (!saved) return;
  try {
    const order = JSON.parse(saved);
    const editor = document.getElementById('layoutEditor');
    if (!editor) return;
    for (const blockId of order) {
      const block = editor.querySelector(`[data-block="${blockId}"]`);
      if (block) editor.appendChild(block);
    }
  } catch (e) {}
}

async function saveLayout() {
  const editor = document.getElementById('layoutEditor');
  const blocks = editor.querySelectorAll('.pna-layout-block');
  const order = [...blocks].map(b => b.dataset.block);
  localStorage.setItem('pn_layout_order', JSON.stringify(order));
  toast('排版已保存');
}

init();

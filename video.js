/* Video 前端逻辑 — 沉浸式暗色风格 */

const state = {
  user: null, isAdmin: false, page: 1, total: 0, perPage: 12,
  currentVideo: null, allVideos: [], sort: 'latest', searchQuery: '',
  uploadFile: null, uploadDuration: 0, uploadThumb: '', uploadCover: null,
};

const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
const ICON_EYE = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_HEART = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

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
  else { const text = await res.text(); if (!res.ok) throw new Error(text.substring(0, 100) || `${res.status}`); return text; }
  if (!res.ok) { const err = new Error(data.error || `${res.status}`); err.status = res.status; throw err; }
  return data;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'vd-toast show ' + type;
  setTimeout(() => { t.className = 'vd-toast'; }, 2600);
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return '刚刚';
  const m = Math.floor(s / 60); if (m < 60) return m + '分钟前';
  const h = Math.floor(m / 60); if (h < 24) return h + '小时前';
  const d = Math.floor(h / 24); if (d < 30) return d + '天前';
  return new Date(ts * 1000).toLocaleDateString('zh-CN');
}

function fmtDur(s) { if (!s) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
function fmtSize(b) { if (!b) return '0 B'; const u=['B','KB','MB','GB']; let i=0; while(b>=1024&&i<3){b/=1024;i++;} return b.toFixed(i?1:0)+' '+u[i]; }
function fmtN(n) { if (!n) return '0'; if (n>=10000) return (n/10000).toFixed(1)+'万'; if (n>=1000) return (n/1000).toFixed(1)+'千'; return String(n); }
function requireLogin() { toast('请先登录', 'error'); setTimeout(() => { window.location.href = '/signin?redirect=/video'; }, 1000); }

/* ===== Canvas 截取首帧 ===== */
function generateThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto'; video.muted = true; video.playsInline = true;
    video.src = URL.createObjectURL(file);
    video.addEventListener('loadeddata', () => {
      const seekTime = Math.min(0.5, (video.duration || 1) * 0.1);
      video.currentTime = seekTime;
    });
    video.addEventListener('seeked', () => {
      try {
        const canvas = document.getElementById('thumbCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 640; canvas.height = 360;
        ctx.drawImage(video, 0, 0, 640, 360);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(video.src);
        resolve(dataUrl);
      } catch (e) { URL.revokeObjectURL(video.src); resolve(''); }
    });
    video.addEventListener('error', () => { URL.revokeObjectURL(video.src); resolve(''); });
  });
}

/* ===== 初始化 ===== */
async function init() {
  document.getElementById('vdApp').style.display = '';
  try { const d = await api('/api/me'); state.user = d.user || null; } catch (e) { state.user = null; }
  if (state.user) {
    document.getElementById('navLoginBtn').style.display = 'none';
    document.getElementById('navUser').style.display = 'flex';
    const av = document.getElementById('navAvatar');
    if (state.user.avatar) { av.src = state.user.avatar; }
    try { const c = await api('/api/admin/check'); state.isAdmin = !!(c.is_admin || c.is_super_admin); } catch (e) {}
  }
  await loadVideos(1);
  bindEvents();
}

/* ===== 列表 ===== */
async function loadVideos(page) {
  state.page = page;
  document.getElementById('videoLoading').style.display = '';
  document.getElementById('videoEmpty').style.display = 'none';
  try {
    const d = await api('/api/video/list?page=' + page);
    state.total = d.total; state.perPage = d.per_page;
    state.allVideos = d.videos || [];
    applyFilters();
    updateHero();
  } catch (e) { toast(e.message || '加载失败', 'error'); }
  finally { document.getElementById('videoLoading').style.display = 'none'; }
}

function updateHero() {
  const hero = document.getElementById('heroSection');
  const videos = [...state.allVideos].sort((a, b) => b.views - a.views);
  const featured = videos[0];
  if (!featured) { hero.style.display = 'none'; return; }
  hero.style.display = '';
  const bg = document.getElementById('heroBg');
  const thumbSrc = featured.thumbnail || ('/api/video/thumb/' + featured.id);
  bg.style.backgroundImage = `url(${thumbSrc})`;
  document.getElementById('heroTitle').textContent = featured.title;
  document.getElementById('heroMeta').textContent = `${fmtN(featured.views)} 次观看 · ${fmtDur(featured.duration)} · ${timeAgo(featured.created_at)}`;
  document.getElementById('heroPlay').onclick = () => openPlayer(featured.id);
  hero.onclick = (e) => { if (e.target.id !== 'heroPlay') openPlayer(featured.id); };
}

function applyFilters() {
  let items = [...state.allVideos];
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    items = items.filter(v => v.title.toLowerCase().includes(q) || (v.description||'').toLowerCase().includes(q));
  }
  if (state.sort === 'popular') items.sort((a,b) => b.views - a.views);
  else if (state.sort === 'likes') items.sort((a,b) => b.likes - a.likes);
  else items.sort((a,b) => b.created_at - a.created_at);
  renderList(items);
  renderPager();
}

function renderList(items) {
  const grid = document.getElementById('videoGrid');
  grid.textContent = '';
  document.getElementById('videoEmpty').style.display = items.length ? 'none' : '';
  for (const v of items) grid.appendChild(buildCard(v));
}

function buildCard(v) {
  const card = el('div', 'vd-card');
  const thumb = el('div', 'vd-card-thumb');
  // 有缩略图用缩略图，没有则用按需生成接口
  const thumbSrc = v.thumbnail || ('/api/video/thumb/' + v.id);
  const img = el('img'); img.src = thumbSrc; img.alt = v.title; img.loading = 'lazy';
  img.onerror = () => { thumb.innerHTML = '<div class="vd-card-thumb-ph"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></div>'; };
  thumb.appendChild(img);
  thumb.appendChild(el('div', 'vd-card-dur', fmtDur(v.duration)));
  card.appendChild(thumb);
  card.appendChild(el('div', 'vd-card-title', v.title));
  const sub = el('div', 'vd-card-sub');
  const views = el('span'); views.innerHTML = ICON_EYE + '<span>' + fmtN(v.views) + '</span>'; sub.appendChild(views);
  sub.appendChild(el('span', 'vd-card-sub-sep', '·'));
  const likes = el('span'); likes.innerHTML = ICON_HEART + '<span>' + fmtN(v.likes) + '</span>'; sub.appendChild(likes);
  sub.appendChild(el('span', 'vd-card-sub-sep', '·'));
  sub.appendChild(el('span', '', timeAgo(v.created_at)));
  card.appendChild(sub);
  card.onclick = () => openPlayer(v.id);
  return card;
}

function renderPager() {
  const pager = document.getElementById('pager');
  pager.textContent = '';
  const pages = Math.ceil(state.total / state.perPage);
  if (pages <= 1) return;
  for (let p = 1; p <= pages; p++) {
    const btn = el('button', p === state.page ? 'active' : '', String(p));
    btn.onclick = () => loadVideos(p);
    pager.appendChild(btn);
  }
}

/* ===== 播放 ===== */
async function openPlayer(id) {
  try {
    const d = await api('/api/video/' + id);
    state.currentVideo = d.video;
    document.getElementById('listView').style.display = 'none';
    document.getElementById('playView').style.display = '';
    const player = document.getElementById('videoPlayer');
    player.src = d.video.filepath;
    player.play().catch(() => {});
    document.getElementById('dTitle').textContent = d.video.title;
    document.getElementById('dAuthor').textContent = d.video.author_name || '已注销';
    const av = document.getElementById('dAvatar');
    if (d.video.author_avatar) { av.src = d.video.author_avatar; av.style.display = ''; } else { av.style.display = 'none'; }
    document.getElementById('dViews').textContent = fmtN(d.video.views) + ' 次观看';
    document.getElementById('dTime').textContent = timeAgo(d.video.created_at);
    document.getElementById('dDesc').textContent = d.video.description || '';
    document.getElementById('dLikeCount').textContent = fmtN(d.video.likes);
    document.getElementById('dLikeBtn').classList.toggle('liked', !!d.video.liked);
    document.getElementById('dDeleteBtn').style.display = state.isAdmin ? '' : 'none';
    window.scrollTo(0, 0);
  } catch (e) { toast(e.message || '加载失败', 'error'); }
}

function backToList() {
  const p = document.getElementById('videoPlayer'); p.pause(); p.src = '';
  state.currentVideo = null;
  document.getElementById('playView').style.display = 'none';
  document.getElementById('listView').style.display = '';
}

async function toggleLike() {
  if (!state.user) return requireLogin();
  if (!state.currentVideo) return;
  try {
    const d = await api('/api/video/' + state.currentVideo.id + '/like', { method: 'POST' });
    document.getElementById('dLikeBtn').classList.toggle('liked', d.liked);
    document.getElementById('dLikeCount').textContent = fmtN(d.likes);
  } catch (e) { if (e.status === 401) return requireLogin(); toast(e.message || '失败', 'error'); }
}

async function deleteVideo() {
  if (!state.currentVideo || !confirm('确定删除？')) return;
  try {
    await api('/api/admin/video/' + state.currentVideo.id, { method: 'DELETE' });
    backToList(); loadVideos(1); toast('已删除');
  } catch (e) { toast(e.message || '失败', 'error'); }
}

function shareVideo() {
  if (!state.currentVideo) return;
  const url = location.origin + '/video?id=' + state.currentVideo.id;
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('链接已复制')).catch(() => prompt('复制：', url));
  else prompt('复制：', url);
}

/* ===== 上传 ===== */
function openUpload() { if (!state.user) return requireLogin(); document.getElementById('uploadModal').classList.add('show'); resetUpload(); }
function closeUpload() { document.getElementById('uploadModal').classList.remove('show'); resetUpload(); }

function resetUpload() {
  state.uploadFile = null; state.uploadDuration = 0; state.uploadThumb = '';
  state.uploadCover = null;
  document.getElementById('uploadFile').value = '';
  document.getElementById('uploadTitle').value = '';
  document.getElementById('uploadDesc').value = '';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('uploadZone').style.display = '';
  document.getElementById('uploadForm').style.display = 'none';
  document.getElementById('coverSection').style.display = 'none';
  document.getElementById('coverFile').value = '';
  document.getElementById('coverPreview').src = '';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('uploadProgressBar').style.width = '0%';
  document.getElementById('uploadSubmit').disabled = true;
  document.getElementById('uploadSubmit').textContent = '提交审核';
  document.getElementById('titleCount').textContent = '0/120';
  document.getElementById('descCount').textContent = '0/500';
}

async function handleFile(file) {
  if (!file) return;
  const ext = '.' + (file.name.split('.').pop()||'').toLowerCase();
  if (!['.mp4','.mov','.webm','.m4v'].includes(ext)) { toast('仅支持 MP4/MOV/WebM', 'error'); return; }
  if (file.size > 600*1024*1024) { toast('不能超过 600MB', 'error'); return; }
  state.uploadFile = file;
  const pv = document.getElementById('previewVideo');
  pv.src = URL.createObjectURL(file);
  pv.onloadedmetadata = async () => {
    state.uploadDuration = pv.duration;
    document.getElementById('uploadDuration').textContent = fmtDur(pv.duration);
    if (pv.duration > 600) { toast('不能超过 10 分钟', 'error'); resetUpload(); return; }
    const thumb = await generateThumbnail(file);
    state.uploadThumb = thumb;
    if (thumb) document.getElementById('previewThumb').src = thumb;
    document.getElementById('uploadSubmit').disabled = false;
  };
  document.getElementById('uploadFileName').textContent = file.name;
  document.getElementById('uploadFileSize').textContent = fmtSize(file.size);
  document.getElementById('uploadZone').style.display = 'none';
  document.getElementById('uploadPreview').style.display = 'flex';
  document.getElementById('uploadForm').style.display = '';
  document.getElementById('coverSection').style.display = '';
  // 设置封面预览为自动截图
  if (state.uploadThumb) document.getElementById('coverPreview').src = state.uploadThumb;
  if (!document.getElementById('uploadTitle').value)
    document.getElementById('uploadTitle').value = file.name.replace(/\.[^.]+$/, '');
  updateCount('uploadTitle', 'titleCount', 120);
  updateCount('uploadDesc', 'descCount', 500);
}

function updateCount(inputId, countId, max) {
  const v = document.getElementById(inputId).value;
  document.getElementById(countId).textContent = v.length + '/' + max;
}

async function submitUpload() {
  if (!state.uploadFile) { toast('请先选择视频', 'error'); return; }
  if (state.uploadDuration > 600) { toast('不能超过 10 分钟', 'error'); return; }
  const title = document.getElementById('uploadTitle').value.trim();
  if (!title) { toast('请输入标题', 'error'); return; }
  const desc = document.getElementById('uploadDesc').value.trim();
  const btn = document.getElementById('uploadSubmit');
  btn.disabled = true; btn.textContent = '上传中';
  document.getElementById('uploadProgress').style.display = '';

  const fd = new FormData();
  fd.append('file', state.uploadFile);
  fd.append('title', title);
  fd.append('description', desc);
  fd.append('duration', String(state.uploadDuration));
  if (state.uploadCover) fd.append('cover', state.uploadCover);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/video/upload');
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const pct = Math.round(e.loaded / e.total * 100);
      document.getElementById('uploadProgressText').textContent = '上传中 ' + pct + '%';
      document.getElementById('uploadProgressBar').style.width = pct + '%';
    }
  });
  xhr.addEventListener('load', () => {
    let data = {}; try { data = JSON.parse(xhr.responseText); } catch (e) {}
    if (xhr.status >= 200 && xhr.status < 300 && data.id) {
      closeUpload();
      loadVideos(1);
      toast('上传成功，等待审核');
      return;
    }
    toast(data.error || '上传失败', 'error');
    btn.disabled = false; btn.textContent = '提交审核';
  });
  xhr.addEventListener('error', () => { toast('网络错误', 'error'); btn.disabled = false; btn.textContent = '提交审核'; });
  xhr.send(fd);
}

/* ===== 事件 ===== */
function bindEvents() {
  document.getElementById('backBtn').onclick = backToList;
  document.getElementById('dLikeBtn').onclick = toggleLike;
  document.getElementById('dDeleteBtn').onclick = deleteVideo;
  document.getElementById('dShareBtn').onclick = shareVideo;
  document.getElementById('uploadBtn').onclick = openUpload;
  document.getElementById('uploadCancel').onclick = closeUpload;
  document.getElementById('uploadCancel2').onclick = closeUpload;
  document.getElementById('uploadSubmit').onclick = submitUpload;
  document.getElementById('uploadModal').onclick = (e) => { if (e.target.id === 'uploadModal') closeUpload(); };
  document.getElementById('uploadChange').onclick = () => document.getElementById('uploadFile').click();
  document.getElementById('uploadTitle').oninput = () => updateCount('uploadTitle', 'titleCount', 120);
  document.getElementById('uploadDesc').oninput = () => updateCount('uploadDesc', 'descCount', 500);
  document.getElementById('coverBtn').onclick = () => document.getElementById('coverFile').click();
  document.getElementById('coverFile').onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    state.uploadCover = file;
    const reader = new FileReader();
    reader.onload = (ev) => { document.getElementById('coverPreview').src = ev.target.result; };
    reader.readAsDataURL(file);
  };
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('uploadFile');
  zone.onclick = () => input.click();
  input.onchange = (e) => handleFile(e.target.files[0]);
  zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('drag-over'); };
  zone.ondragleave = () => zone.classList.remove('drag-over');
  zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); };
  let timer = null;
  document.getElementById('searchInput').oninput = (e) => {
    clearTimeout(timer); timer = setTimeout(() => { state.searchQuery = e.target.value.trim(); applyFilters(); }, 300);
  };
  document.getElementById('filterBar').onclick = (e) => {
    const seg = e.target.closest('.vd-seg'); if (!seg) return;
    document.querySelectorAll('.vd-seg').forEach(s => s.classList.remove('active'));
    seg.classList.add('active'); state.sort = seg.dataset.sort; applyFilters();
  };
  const params = new URLSearchParams(location.search);
  const directId = params.get('id');
  if (directId) openPlayer(directId);
}

init();

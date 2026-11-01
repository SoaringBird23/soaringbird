/* 翱翔鸟 Team — 前端
   所有请求走同源 Cookie 鉴权；非员工在服务端已被 404 拦截。 */
(() => {
  'use strict';

  const SOURCE_EXTS = new Set(['.java','.kt','.kts','.swift','.m','.mm','.py','.pyw','.js','.mjs','.cjs','.ts','.tsx','.jsx','.c','.h','.cc','.cpp','.hpp','.cs','.go','.rs','.rb','.php','.pl','.lua','.scala','.dart','.sh','.bash','.zsh','.ps1','.bat','.cmd','.sql','.env','.ini','.toml','.gradle','.properties','.key','.pem','.p12','.pfx','.jks','.keystore','.asc','.gpg','.crt','.cer','.der','.ppk','.mobileprovision','.yml','.yaml','.lock','.pom','.mk','.cmake','.csproj','.vcxproj','.pbxproj','.storyboard','.xib','.ipynb','.vue','.svelte','.astro','.proto']);
  const IMAGE_EXTS = new Set(['.png','.jpg','.jpeg','.gif','.webp','.svg']);
  const VIDEO_EXTS = new Set(['.mp4','.webm','.mov','.mkv']);
  const AUDIO_EXTS = new Set(['.mp3','.wav','.m4a','.flac']);
  const PRIORITY = { 0: '普通', 1: '重要', 2: '紧急' };
  const TASK_STATUS = { todo: '待开始', doing: '进行中', done: '已完成' };
  const ACTION_LABEL = {
    upload: '上传', upload_version: '更新版本', mkdir: '新建文件夹', download: '下载',
    download_version: '下载历史版本', preview: '预览', view: '预览', edit: '编辑',
    restore: '恢复版本', delete: '移到回收站', undelete: '移出回收站', purge: '彻底删除',
    classify: '调整密级', meta: '修改属性', share: '共享', unshare: '停止共享',
    share_open: '通过链接下载', comment: '评论', member_add: '添加成员',
    member_update: '调整权限', member_remove: '移出团队', verify: '通过验证',
    send_code: '发送验证码', task_create: '创建任务', task_update: '更新任务',
    task_delete: '删除任务', event_create: '添加日程',
    send_file: '定向发送文件', chat_open: '发起会话', chat_group: '创建群聊',
    announce_create: '发布公告', announce_edit: '编辑公告', announce_delete: '删除公告',
  };

  // en 是侧栏与页眉的英文微标（层级不靠加粗，靠字号与灰阶）
  const NAV = {
    home:          { title: '首页',     en: 'Home',          icon: 'i-home' },
    dashboard:     { title: '概览',     en: 'Overview',      icon: 'i-gauge' },
    tasks:         { title: '任务',     en: 'Tasks',         icon: 'i-check-circle' },
    board:         { title: '看板',     en: 'Board',         icon: 'i-columns' },
    todos:         { title: '待办',     en: 'To-dos',        icon: 'i-checklist' },
    calendar:      { title: '日历',     en: 'Calendar',      icon: 'i-calendar' },
    contributions: { title: '贡献',     en: 'Contributions', icon: 'i-activity' },
    shared:        { title: 'Shared',    en: 'Shared',        icon: 'i-cloud' },
    personal:      { title: 'My Files',  en: 'My Files',      icon: 'i-person' },
    recent:        { title: 'Recents',   en: 'Recents',       icon: 'i-clock' },
    links:         { title: '共享链接',  en: 'Links',          icon: 'i-link' },
    trash:         { title: '回收站',    en: 'Trash',         icon: 'i-trash' },
    storage:       { title: '存储',      en: 'Storage',       icon: 'i-disk' },
    inbox:         { title: '通知',      en: 'Inbox',         icon: 'i-inbox' },
    chats:         { title: '会话',      en: 'Chats',         icon: 'i-chat' },
    ai:            { title: 'AI 接入',   en: 'AI Access',     icon: 'i-key' },
    members:       { title: '成员',      en: 'Members',       icon: 'i-people' },
    activity:      { title: 'Activity',  en: 'Activity',      icon: 'i-chart' },
  };
  const FILE_NAVS = new Set(['shared', 'personal', 'recent', 'links', 'trash']);

  const S = {
    me: null, nav: 'home', items: [], crumb: [], folder: '',
    sort: 'updated_at', order: 'desc', q: '', sel: null,
    selSet: [], multi: false, anchor: null,
    inspTab: 'meta', view: 'list', gateShown: false,
    tasks: { filter: 'mine', items: [], counts: {} },
    boardAll: false, aiTool: 'generic',
    cal: { cursor: new Date(), day: null },
    contrib: { days: 182, userId: '' },
    viewer: { item: null, version: 0, editing: false, dirty: false, save: null },
    chats: { items: [], active: null, msgs: [], last: 0 },
    members: null,
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const icon = (id, cls = 'icon') => `<svg class="${cls}"><use href="#${id}"/></svg>`;

  /* ===================== 动效内核 =====================
     凡是「手指/指针直接拖」的东西都走这里：先 1:1 跟手，松手再把此刻的手势速度
     交给弹簧接着走——中间没有「先播完动画再响应」的断裂，随时可被再次抓住接管。
     弹簧只暴露两个参数：阻尼比 damping 与响应 response(秒)。
     这里换算成质量归一化(mass=1)的刚度 k 与阻尼 c。 */
  const _RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const prefersReduce = () => !!(_RM && _RM.matches);

  // 指数衰减的动量投影：松手后还会往前「滑」多远（非 v²/2a）
  const projectMomentum = (v, decel = 0.998) => (v / 1000) * decel / (1 - decel);

  // 阻尼比 ζ 与响应 t(秒) → k、c
  function springKC(response, damping) {
    const w = (2 * Math.PI) / response;
    return { k: w * w, c: 2 * damping * w };
  }

  // 可随时打断的弹簧：再次调用会从「当前屏幕值 + 当前速度」接管，绝不跳回目标值
  function springTo(opts) {
    const { from, to, velocity = 0, response = 0.34, damping = 1, onFrame, onDone } = opts;
    const ctrl = { value: from, velocity, cancel() {} };
    if (prefersReduce()) { ctrl.value = to; ctrl.velocity = 0; onFrame(to, 0); onDone && onDone(); return ctrl; }
    const { k, c } = springKC(response, damping);
    let x = from, v = velocity, raf = 0, last = 0, alive = true;
    ctrl.cancel = () => { alive = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
    const finish = () => { ctrl.value = to; ctrl.velocity = 0; onFrame(to, 0); onDone && onDone(); };
    const step = (t) => {
      if (!alive) return;
      if (!last) last = t;
      let dt = (t - last) / 1000; last = t;
      if (dt > 0.05) dt = 0.05;                          // 掉帧封顶，避免积分发散
      const sub = Math.max(1, Math.ceil(dt / (1 / 300))); // 固定子步长，跨刷新率手感一致
      const h = dt / sub;
      for (let i = 0; i < sub; i++) { const a = -k * (x - to) - c * v; v += a * h; x += v * h; }
      ctrl.value = x; ctrl.velocity = v;
      if (Math.abs(x - to) < 0.35 && Math.abs(v) < 3) { finish(); return; }
      onFrame(x, v);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return ctrl;
  }

  // 手势速度：取最近 ~90ms 的采样点算，松手瞬间的快慢方向都从这里来
  function tracker() {
    const s = [];
    return {
      reset() { s.length = 0; },
      push(t, x, y) { s.push({ t, x, y }); while (s.length > 2 && t - s[0].t > 90) s.shift(); },
      last() { return s.length ? s[s.length - 1] : null; },
      velocity() {
        if (s.length < 2) return { x: 0, y: 0 };
        const a = s[0], b = s[s.length - 1], dt = (b.t - a.t) / 1000;
        if (dt <= 0) return { x: 0, y: 0 };
        return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
      },
    };
  }

  // 越过边界后越推越沉——像真的东西，「推不太动」而不是硬停
  const rubberband = (over, dim, k = 0.55) => (over * dim * k) / (dim + k * Math.abs(over));

  // 读元素当前的 translate，用于「从当前屏幕位置接管」
  function translateOf(el) {
    try { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { x: m.m41, y: m.m42 }; }
    catch (_) { return { x: 0, y: 0 }; }
  }

  // 可交互控件：拖动逻辑要绕开它们，别破坏输入与文本选择
  const INTERACTIVE = 'input,textarea,select,button,a,[contenteditable="true"]';
  const isInteractive = (t) => !!(t && t.closest && t.closest(INTERACTIVE));

  /* ===================== 焦点管理 =====================
     弹层声明了 aria-modal="true"，就必须真的把背景挡在键盘之外：
     否则 Tab 会跑到身后的侧栏和工具栏上，读屏也会「同时看到」模态与背景。
     用 inert 把背景整块停用，比手工做首尾焦点环可靠得多（不用管动态内容）。 */
  function syncInert() {
    const modal = $('#veil').classList.contains('on')
      || !$('#cmdk').hidden
      || $('#viewer').classList.contains('on')
      || $('#gate').classList.contains('on');
    const app = $('#app');
    if (app) {
      if (modal || $('#app').hidden) app.setAttribute('inert', '');
      else app.removeAttribute('inert');
    }
    // 侧栏只有在「自己开着」且「上面没压模态」时才允许键盘进入，其余一律挡掉。
    // 这样关闭动画期间和「从面板里开出弹层」两种情况都不会漏。
    const ins = $('#inspector');
    if (ins) {
      if (modal || !ins.classList.contains('on')) ins.setAttribute('inert', '');
      else ins.removeAttribute('inert');
    }
    return modal;
  }


  /* ===================== 格式化 ===================== */
  const p2 = (x) => String(x).padStart(2, '0');

  function fmtSize(n) {
    n = Number(n) || 0;
    if (n < 1000) return `${n} 字节`;
    const u = ['KB', 'MB', 'GB', 'TB'];
    let v = n / 1024, i = 0;
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${u[i]}`;
  }
  function fmtDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts * 1000), now = new Date();
    const hm = `${p2(d.getHours())}:${p2(d.getMinutes())}`;
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(d, now)) return `今天 ${hm}`;
    if (sameDay(d, new Date(now - 864e5))) return `昨天 ${hm}`;
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function fmtShort(ts) {
    if (!ts) return '—';
    const d = new Date(ts * 1000), now = new Date();
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}/${d.getDate()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }
  function fmtDay(ts) {
    const d = new Date(ts * 1000);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function fmtDue(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000), now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return `今天 ${p2(d.getHours())}:${p2(d.getMinutes())}`;
    if (d.toDateString() === new Date(now - 864e5).toDateString()) return '昨天';
    if (d.toDateString() === new Date(now.getTime() + 864e5).toDateString()) return '明天';
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }
  function dayStart(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function ymd(d) { return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; }
  function extOf(name) { const i = name.lastIndexOf('.'); return i > 0 ? name.slice(i).toLowerCase() : ''; }
  function kindIcon(it) {
    if (it.is_dir) return { id: 'i-folder', cls: 'folder' };
    const e = it.ext || extOf(it.name);
    if (it.classification === 'secret') return { id: 'i-lock', cls: 'lock' };
    if (IMAGE_EXTS.has(e)) return { id: 'i-image', cls: '' };
    if (SOURCE_EXTS.has(e)) return { id: 'i-code', cls: 'code' };
    return { id: 'i-doc', cls: '' };
  }
  function initials(name) { return (name || '?').trim().slice(0, 1).toUpperCase(); }

  /* ===================== 请求 ===================== */
  class ApiError extends Error {
    constructor(status, message, payload) { super(message); this.status = status; this.payload = payload; }
  }
  async function api(path, opts = {}) {
    let res;
    try {
      res = await fetch(path, { credentials: 'same-origin', ...opts });
    } catch (e) {
      // fetch 直接 reject 基本都是网络问题。别把浏览器的 "Failed to fetch" 甩给用户，
      // 换成一句人话，并告诉他「再试一次就好」——错误提示要给出路，不是审判。
      throw new ApiError(0, '网络断开了。你的内容都还在，重试一次就好。', null);
    }
    const ct = res.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) { try { body = await res.json(); } catch (e) { body = null; } }
    if (!res.ok) {
      if (res.status === 404) {
        if (body && body.need_verify) { showGate(); throw new ApiError(404, '请完成验证', body); }
        throw new ApiError(404, '会话已过期，重新登录论坛就好，已打开的内容不会丢。', body);
      }
      throw new ApiError(res.status, (body && body.error) || `没能完成这次请求（${res.status}），稍等片刻再试一次。`, body);
    }
    return body;
  }
  const jpost = (p, d) => api(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d || {}) });
  const jpatch = (p, d) => api(p, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d || {}) });

  /* ===================== Toast ===================== */
  function toast(msg, kind = 'ok', ms = 2600) {
    const n = el('div', 'toast' + (kind === 'err' ? ' err' : ''));
    n.innerHTML = `${icon(kind === 'err' ? 'i-alert' : 'i-check', 'icon icon-13')}<span>${esc(msg)}</span>`;
    $('#toasts').appendChild(n);
    setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 240); }, ms);
    return n;
  }

  /* ===================== 弹层 ===================== */
  // 详情弹层里用于「边看边刷新」的定时器，关弹层必须清掉
  let sheetTimer = null;
  // 关掉弹层后把焦点还给原来那个元素，键盘用户不会掉到页面顶部
  let sheetReturnFocus = null;
  // 入场/回弹/飞出共用一个弹簧句柄，重开时先掐掉上一段，避免两段动画打架
  let sheetAnim = null;
  // 下滑关闭的手势状态
  const sheetDrag = { active: false };
  function sheetTeardown() {
    if (sheetTimer) { clearInterval(sheetTimer); sheetTimer = null; }
    S.pullTaskUpdates = null;
    const veil = $('#veil'), box = $('#sheet');
    veil.classList.remove('on');
    veil.style.opacity = '';
    box.classList.remove('is-draggable');
    box.style.transform = ''; box.style.opacity = '';
    box.innerHTML = '';
    syncInert();                       // 先解除背景锁定，再把焦点还回去，否则焦点会落到被 inert 的区域上
    if (sheetReturnFocus && sheetReturnFocus.isConnected) sheetReturnFocus.focus();
    sheetReturnFocus = null;
  }
  function closeSheet() {
    if (sheetAnim) { sheetAnim.cancel(); sheetAnim = null; }
    sheetTeardown();
  }
  function openSheet(html, onMount, opts) {
    if (sheetAnim) { sheetAnim.cancel(); sheetAnim = null; }
    if (sheetTimer) { clearInterval(sheetTimer); sheetTimer = null; }
    S.pullTaskUpdates = null;
    const veil = $('#veil'), box = $('#sheet');
    if (!veil.classList.contains('on')) sheetReturnFocus = document.activeElement;
    // 每次都重置类名，避免上一个宽弹层的样式串到下一个普通确认框
    box.className = 'sheet' + (opts && opts.wide ? ' is-wide' : '');
    box.innerHTML = html;
    veil.classList.add('on');
    veil.style.opacity = '';
    syncInert();                       // 声明了 aria-modal 就要真的把背景挡在键盘之外
    veil.onclick = (e) => { if (e.target === veil) closeSheet(); };
    onMount && onMount(box);
    // 焦点要先进弹层：否则 Tab 还在背后的页面上跑，读屏也不知道弹了东西
    if (!box.contains(document.activeElement)) box.focus();
    // 只有「装得下」的弹层才允许下滑关闭；否则纵向手势要留给内容滚动
    box.classList.toggle('is-draggable', box.getBoundingClientRect().height < window.innerHeight - 48);
    // 入场：整块从下方 12px、缩到 97% 弹上来，落定即材质到位
    if (prefersReduce()) { box.style.transform = ''; box.style.opacity = ''; return; }
    sheetAnim = springTo({
      from: 1, to: 0, response: 0.3, damping: 0.86,
      onFrame: (x) => {
        box.style.transform = `translate3d(0, ${x * 12}px, 0) scale(${1 - x * 0.03})`;
        box.style.opacity = String(1 - x * 0.7);
      },
      onDone: () => { box.style.transform = ''; box.style.opacity = ''; sheetAnim = null; },
    });
  }

  /* 下滑关闭：拖到一半松手还能弹回去，拽住不放就一直是跟手的那一块 —— 手势本身就是动画 */
  (function initSheetGesture() {
    const box = $('#sheet'), veil = $('#veil');
    let armed = false, pid = 0, startX = 0, startY = 0, baseY = 0;
    const tr = tracker();
    const setY = (y) => {
      const h = box.offsetHeight || 1;
      const fade = Math.max(0, 1 - Math.max(0, y) / (h * 1.5));
      box.style.transform = `translate3d(0, ${y}px, 0)`;
      box.style.opacity = String(fade);
      veil.style.opacity = String(Math.max(0.2, fade));
    };
    const rest = () => { box.style.transform = ''; box.style.opacity = ''; veil.style.opacity = ''; };
    box.addEventListener('pointerdown', (e) => {
      if (!box.classList.contains('is-draggable')) return;
      if (isInteractive(e.target) || (e.target.closest && e.target.closest('[data-move]'))) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (window.getSelection && String(window.getSelection())) return;
      if (sheetAnim) { sheetAnim.cancel(); sheetAnim = null; }
      armed = true; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY; baseY = translateOf(box).y;
      tr.reset();                                  // 清掉上一次手势的采样，别让上一把的速度串到这一把
      tr.push(performance.now(), e.clientX, e.clientY);
    });
    box.addEventListener('pointermove', (e) => {
      if (!armed || e.pointerId !== pid) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!sheetDrag.active) {
        // 先够一点纵向位移才认定「下滑」，免得点一下、横一下都误触
        if (Math.abs(dy) < 6 || Math.abs(dy) < Math.abs(dx)) { tr.push(performance.now(), e.clientX, e.clientY); return; }
        sheetDrag.active = true;
        try { box.setPointerCapture(pid); } catch (_) {}
      }
      tr.push(performance.now(), e.clientX, e.clientY);
      let y = baseY + dy;
      if (y < 0) y = -rubberband(-y, box.offsetHeight || 300);   // 反向：带阻尼，像推不太动
      setY(y);
      e.preventDefault();
    });
    const release = (e) => {
      if (!armed || e.pointerId !== pid) return;
      armed = false;
      tr.push(performance.now(), e.clientX, e.clientY);   // 补上「松手这一刻」的采样，速度窗口才覆盖最近的真实运动
      if (!sheetDrag.active) return;
      sheetDrag.active = false;
      try { box.releasePointerCapture(pid); } catch (_) {}
      const v = tr.velocity().y;
      const h = box.offsetHeight || 300;
      const from = translateOf(box).y;
      // 动量投影决定去留：拖得够远、或者甩得够快，就关
      if (from + projectMomentum(v) > h * 0.34 || v > 950) {
        springTo({ from, to: h + 60, velocity: v, response: 0.3, damping: 0.9,
          onFrame: (y) => { box.style.transform = `translate3d(0, ${y}px, 0)`; box.style.opacity = '0'; veil.style.opacity = '0'; },
          onDone: sheetTeardown });
      } else {
        springTo({ from, to: 0, velocity: v, response: 0.3, damping: 0.82, onFrame: setY, onDone: rest });
      }
    };
    box.addEventListener('pointerup', release);
    box.addEventListener('pointercancel', () => {
      if (!armed) return;
      armed = false;
      if (!sheetDrag.active) return;
      sheetDrag.active = false;
      springTo({ from: translateOf(box).y, to: 0, velocity: 0, onFrame: setY, onDone: rest });
    });
  })();

  function sheet(opts) {
    const { title, desc = '', input = false, value = '', placeholder = '', area = false,
            fields = '', okText = '确定', cancelText = '取消', danger = false, onOk } = opts;
    openSheet(`
      <h3>${esc(title)}</h3>
      ${desc ? `<p>${esc(desc)}</p>` : ''}
      ${input ? (area
        ? `<textarea class="field area" id="sIn" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
        : `<input class="field" id="sIn" placeholder="${esc(placeholder)}" value="${esc(value)}">`) : ''}
      ${fields}
      <div class="sheet-actions">
        <button class="btn" id="sCancel">${esc(cancelText)}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="sOk">${esc(okText)}</button>
      </div>`, (box) => {
      const inp = $('#sIn', box);
      if (inp) { inp.focus(); if (!area) inp.select(); }
      $('#sCancel', box).onclick = closeSheet;
      if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter' && !area && !e.shiftKey) $('#sOk', box).click(); };
      $('#sOk', box).onclick = async () => {
        try {
          const keep = await onOk(inp ? inp.value : undefined, box);
          if (keep !== false) closeSheet();
        } catch (e) { toast(e.message, 'err'); }
      };
    });
    $$('#codeInputs input')[0].focus();   // 门一出现就把焦点交给第一个输入格
  }

  /* ===================== 菜单 ===================== */
  // 菜单要能被键盘完整使用：方向键在项间移动、Esc 关闭、关掉后焦点还给触发按钮
  let menuAnchor = null;
  function closeMenu() {
    const m = $('#menu');
    if (!m.classList.contains('on')) return;
    // 只有「焦点本来就在菜单里」才把焦点还回去；鼠标点在别处时别去抢焦点
    const inside = m.contains(document.activeElement);
    m.classList.remove('on');
    m.innerHTML = '';
    if (inside && menuAnchor && menuAnchor.isConnected) menuAnchor.focus();
    menuAnchor = null;
  }
  function openMenu(anchor, entries) {
    const m = $('#menu');
    const list = entries.filter(Boolean);
    // 只有菜单里真有勾选项时才留出勾选栏，否则每个标签都平白多缩进一块
    const anyCheck = list.some((it) => it.check);
    m.innerHTML = '';
    list.forEach((it) => {
      if (it.sep) { const s = el('div', 'menu-sep'); s.setAttribute('role', 'separator'); m.appendChild(s); return; }
      if (it.label_only) { const l = el('div', 'menu-label', esc(it.label_only)); l.setAttribute('role', 'presentation'); m.appendChild(l); return; }
      // 勾选标记放最前面 —— macOS 的菜单就是这么排的，放右侧是 Windows 的习惯
      const b = el('button', 'menu-item' + (it.danger ? ' danger' : '') + (it.check ? ' is-check' : ''));
      const boxed = typeof it.check === 'boolean';   // 只有真正的开关项才声明成 checkbox，动作项混进来会被读屏念成「未勾选」
      b.setAttribute('role', boxed ? 'menuitemcheckbox' : 'menuitem');
      b.setAttribute('tabindex', '-1');
      if (boxed) b.setAttribute('aria-checked', it.check ? 'true' : 'false');
      if (it.disabled) { b.setAttribute('disabled', ''); b.setAttribute('aria-disabled', 'true'); }
      b.innerHTML = `${anyCheck ? `<span class="menu-check">${it.check ? icon('i-check', 'icon icon-13') : ''}</span>` : ''}${it.icon ? icon(it.icon, 'icon icon-13') : ''}<span>${esc(it.label)}</span>`;
      b.onclick = () => { closeMenu(); it.onClick && it.onClick(); };
      m.appendChild(b);
    });
    m.style.visibility = 'hidden';
    m.classList.add('on');
    const r = anchor.getBoundingClientRect();
    const mw = m.offsetWidth, mh = m.offsetHeight;
    let top = r.bottom + 6;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    m.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - mw - 8))}px`;
    m.style.top = `${top}px`;
    m.style.setProperty('--menu-origin', top < r.top ? 'bottom right' : 'top right');
    m.style.visibility = '';
    menuAnchor = anchor;
    const first = $$('.menu-item:not([disabled])', m)[0];
    if (first) first.focus();
  }
  const menuItems = () => $$('#menu .menu-item:not([disabled])');
  $('#menu').addEventListener('keydown', (e) => {
    const items = menuItems();
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === 'Tab') { closeMenu(); }
  });
  document.addEventListener('pointerdown', (e) => {
    const m = $('#menu');
    if (m.classList.contains('on') && !m.contains(e.target)) closeMenu();
  }, true);

  /* ===================== 验证门 ===================== */
  function showGate() {
    if (S.gateShown) return;
    S.gateShown = true;
    $('#gate').classList.add('on');
    syncInert();
    $$('#codeInputs input').forEach((inp, i, arr) => {
      inp.value = '';
      inp.oninput = () => {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
        inp.classList.toggle('filled', !!inp.value);
        if (inp.value && i < arr.length - 1) arr[i + 1].focus();
        if (arr.every((x) => x.value)) verifyCode();
      };
      inp.onkeydown = (e) => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
          arr[i - 1].focus(); arr[i - 1].value = ''; arr[i - 1].classList.remove('filled');
        }
        if (e.key === 'Enter') verifyCode();
      };
      inp.onpaste = (e) => {
        const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!t) return;
        e.preventDefault();
        t.split('').forEach((ch, k) => { if (arr[k]) { arr[k].value = ch; arr[k].classList.add('filled'); } });
        (arr[Math.min(t.length, 5)] || arr[5]).focus();
        if (t.length === 6) verifyCode();
      };
    });
  }
  const gateErr = (m) => { $('#gateErr').textContent = m || ''; };

  async function sendCode() {
    const btn = $('#btnSendCode');
    btn.disabled = true;
    gateErr('');
    try {
      const r = await jpost('/api/team/auth/send-code');
      $('#gateHint').textContent = `验证码已发送至 ${r.email}，10 分钟内有效。此设备 7 天内不再重复验证。`;
      $$('#codeInputs input')[0].focus();
      let left = 60;
      const t = setInterval(() => {
        left--;
        btn.textContent = left > 0 ? `重新发送（${left} 秒）` : '重新发送';
        if (left <= 0) { clearInterval(t); btn.disabled = false; btn.textContent = '重新发送'; }
      }, 1000);
    } catch (e) { gateErr(e.message); btn.disabled = false; }
  }
  async function verifyCode() {
    const code = $$('#codeInputs input').map((i) => i.value).join('');
    if (code.length !== 6) { gateErr('验证码为 6 位数字'); return; }
    const btn = $('#btnVerify');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    gateErr('');
    try {
      await jpost('/api/team/auth/verify', { code });
      $('#gate').classList.remove('on');
      S.gateShown = false;
      syncInert();
      await boot();
    } catch (e) {
      gateErr(e.message);
      $$('#codeInputs input').forEach((i) => { i.value = ''; i.classList.remove('filled'); });
      $$('#codeInputs input')[0].focus();
    } finally {
      btn.disabled = false;
      btn.textContent = '继续';
    }
  }
  $('#btnSendCode').onclick = sendCode;
  $('#btnVerify').onclick = verifyCode;

  /* ===================== 移动端抽屉导航 ===================== */
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    $('#navToggle').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  $('#navToggle').setAttribute('aria-expanded', 'false');
  $('#navToggle').onclick = () => setNav(!document.body.classList.contains('nav-open'));
  $('#navScrim').onclick = () => setNav(false);

  /* ===================== 启动 ===================== */
  async function boot() {
    let me;
    try {
      me = await api('/api/team/me');
    } catch (e) {
      if (e.status === 404 && !S.gateShown) { showGate(); return; }
      $('#app').hidden = true;
      $('#gate').classList.remove('on');
      syncInert();
      document.body.insertAdjacentHTML('beforeend',
        `<div class="empty" style="padding-top:26vh">${icon('i-cloud', 'icon icon-20')}<h3>暂时连不上 Team</h3>
         <p>${esc(e.message)}</p>
         <button class="btn btn-primary" id="bootRetry" style="margin-top:10px">重新加载</button></div>`);
      const br = $('#bootRetry');
      if (br) br.onclick = () => location.reload();
      return;
    }
    S.me = me;
    if (!me.verified) { $('#app').hidden = true; showGate(); return; }
    $('#gate').classList.remove('on');
    $('#app').hidden = false;
    syncInert();
    paintIdentity();
    await refresh();
    watchEdges();
    if (rtSupported()) rtConnect(); else rtGoFallback();
    maybeWelcome();
  }

  /* ===================== 初次见面 ===================== */
  // 一台设备只在第一次打开时露一次脸；关掉就记下来，之后不再打扰。
  function maybeWelcome() {
    let seen = '';
    try { seen = localStorage.getItem('sb_team_hello') || ''; } catch (e) { return; }
    if (seen) return;
    try { localStorage.setItem('sb_team_hello', '1'); } catch (e) { /* 无痕模式写不进去，跳过 */ }
    openSheet(`
      <h3>欢迎来到 Team</h3>
      <p>这里放的是还不方便放到 Git 上的内容——内部资料、机密文档和日常协作。
        默认只有团队里对应的人能看到。</p>
      <p style="color:var(--text-3);font-size:13px">按 ⌘K 可以随时搜索文件、任务和内容。</p>
      <div class="sheet-actions">
        <button class="btn btn-primary" id="helloOk">开始</button>
      </div>`, (box) => {
      $('#helloOk', box).onclick = closeSheet;
    });
  }

  function avatarHTML(user) {
    return user.avatar ? `<img src="${esc(user.avatar)}" alt="">` : esc(initials(user.username));
  }

  function paintIdentity() {
    const me = S.me;
    $('#sideAv').innerHTML = avatarHTML(me.user);
    $('#sideName').textContent = me.user.username;
    $('#sideRole').textContent = [me.user.job_title, me.user.department].filter(Boolean).join(' · ') || me.role_label;
    $('#navAdmin').style.display = me.can_manage ? '' : 'none';
    renderAcct();
  }

  /* ===================== 侧栏底部账户 ===================== */
  function closeAcct() {
    $('#acctPanel').hidden = true;
    $('#sideFoot').classList.remove('is-on');
    $('#sideFoot').setAttribute('aria-expanded', 'false');
  }

  function renderAcct() {
    const me = S.me;
    $('#acctPanel').innerHTML = `
      <div class="acct-id">
        <span class="avatar">${avatarHTML(me.user)}</span>
        <div>
          <b>${esc(me.user.username)}</b>
          <span>${esc(me.role_label)}</span>
        </div>
      </div>
      <div class="acct-facts">
        ${me.user.job_title ? `<div class="acct-fact"><i>职务</i><span>${esc(me.user.job_title)}</span></div>` : ''}
        ${me.user.department ? `<div class="acct-fact"><i>部门</i><span>${esc(me.user.department)}</span></div>` : ''}
        ${me.user.email ? `<div class="acct-fact"><i>邮箱</i><span>${esc(me.user.email)}</span></div>` : ''}
        <div class="acct-fact"><i>密级</i><span>可读至${esc(me.clearance_label)}</span></div>
      </div>
      <div class="acct-acts">
        <button class="btn btn-sm" id="acctLock">${icon('i-lock', 'icon icon-13')}锁定并重新验证</button>
        ${me.user.is_super_admin ? `<button class="btn btn-sm" id="acctForum">${icon('i-cloud', 'icon icon-13')}论坛</button>` : ''}
      </div>`;
    $('#acctLock').onclick = () => {
      closeAcct();
      sheet({
        title: '锁定 Team',
        desc: '需要重新输入验证码才能继续使用，已打开的文件不会被改动。',
        danger: true, okText: '锁定',
        onOk: async () => { await jpost('/api/team/auth/logout'); location.reload(); },
      });
    };
    const forum = $('#acctForum');
    if (forum) forum.onclick = () => { location.href = '/'; };
  }

  $('#sideFoot').onclick = () => {
    const panel = $('#acctPanel');
    const open = panel.hidden;
    panel.hidden = !open;
    $('#sideFoot').classList.toggle('is-on', open);
    $('#sideFoot').setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  document.addEventListener('pointerdown', (e) => {
    if (!$('#acctPanel').hidden && !$('#sideFoot').contains(e.target) && !$('#acctPanel').contains(e.target)) closeAcct();
  }, true);

  function meters() {
    const q = S.me.quotas;
    const ps = Math.min(1, q.shared_used / q.shared_quota);
    const pm = Math.min(1, q.personal_used / q.personal_quota);
    $('#meterShared').style.transform = `scaleX(${ps})`;
    $('#meterMine').style.transform = `scaleX(${pm})`;
    $('#meterSharedText').textContent = `${fmtSize(q.shared_used)} / ${fmtSize(q.shared_quota)}`;
    $('#meterMineText').textContent = `${fmtSize(q.personal_used)} / ${fmtSize(q.personal_quota)}`;
  }

  async function refresh() {
    meters();
    await loadNav();
    loadCounts();
    chatTick();
  }

  async function loadCounts() {
    try {
      const [d, t, ib] = await Promise.all([
        api('/api/team/dashboard'), api('/api/team/todos'), api('/api/team/inbox?limit=1'),
      ]);
      $('#cntTasks').textContent = d.tasks.mine_open || '';
      $('#cntTodos').textContent = t.counts.open || '';
      const unread = ib.unread || 0;
      const c = $('#cntInbox');
      c.textContent = unread || '';
      c.classList.toggle('is-unread', unread > 0);
    } catch (e) { /* 计数失败不影响主流程 */ }
  }

  /* ===================== 滚动边缘 ===================== */
  // 内容贴上/贴下浮动条时才渐隐；静止在顶部时一条线都不留。
  // 只在滚动与 DOM 变化时算，不做任何定时轮询。
  const EDGE_PAIRS = [
    ['.main', '.main'],
    ['#list', '.main'],
    ['.ins-body', '.inspector'],
    ['.cmdk-list', '.cmdk-card'],
    ['.viewer-stage', '.viewer'],
  ];
  const EDGE_SELECTOR = '.main, #list, .ins-body, .cmdk-list, .viewer-stage';

  function edgeUpdate(el) {
    const pair = EDGE_PAIRS.find((p) => el.matches(p[0]));
    if (!pair) return;
    const host = el.closest(pair[1]);
    if (!host) return;
    host.classList.toggle('is-edged', el.scrollTop > 2);
    host.classList.toggle('is-edged-end', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }

  function sweepEdges() {
    EDGE_PAIRS.forEach((p) => {
      $$(p[0]).forEach((el) => {
        if (el.scrollHeight > el.clientHeight + 2) { edgeUpdate(el); return; }
        const host = el.closest(p[1]);
        if (host) host.classList.remove('is-edged', 'is-edged-end');
      });
    });
  }

  let edgeRaf = 0;
  function scheduleEdges() {
    if (edgeRaf) return;
    edgeRaf = requestAnimationFrame(() => { edgeRaf = 0; sweepEdges(); });
  }

  document.addEventListener('scroll', (e) => {
    const t = e.target;
    if (t && t.nodeType === 1 && typeof t.matches === 'function' && t.matches(EDGE_SELECTOR)) edgeUpdate(t);
  }, true);

  let edgeWatched = false;
  function watchEdges() {
    if (!edgeWatched) {
      edgeWatched = true;
      ['#list', '#inspector', '#cmdk'].forEach((sel) => {
        const el = $(sel);
        if (el) new MutationObserver(scheduleEdges).observe(el, { childList: true, subtree: true });
      });
    }
    scheduleEdges();
  }

  /* ===================== 侧栏与头部 ===================== */
  function switchNav(nav) {
    S.nav = nav;
    S.folder = ''; S.q = ''; S.sel = null;
    // 多选态必须跟着板块一起清：否则切到看板/通知后底部「已选 N 项」还在，
    // 而 selectedItems() 仍指向上一批文件，点「移动 / 发送」会真的发出去
    S.multi = false; S.selSet = []; S.anchor = null;
    paintMulti();
    $('#searchInput').value = '';
    $$('.nav-item').forEach((x) => x.classList.toggle('is-on', x.dataset.nav === nav));
    closeInspector(); closeViewer(); closeAcct(); setNav(false);
  }
  $$('.nav-item').forEach((b) => {
    b.onclick = () => { switchNav(b.dataset.nav); loadNav(); };
  });

  function setHead(title, sub, actions) {
    $('#headTitle').textContent = title;
    $('#headSub').textContent = sub || '';
    const box = $('#headActions');
    box.innerHTML = '';
    (actions || []).forEach((a) => {
      const btn = el('button', 'btn' + (a.primary ? ' btn-primary' : ''));
      btn.innerHTML = `${a.icon ? icon(a.icon, 'icon icon-13') : ''}${esc(a.label)}`;
      // 只有图标没有文字时，读屏只会念「按钮」，补一个名字
      if (!a.label) btn.setAttribute('aria-label', a.aria || '操作');
      btn.onclick = a.onClick;
      box.appendChild(btn);
    });
    const isFile = FILE_NAVS.has(S.nav);
    $('#toolrow').style.display = isFile ? '' : 'none';
    $('#segView').hidden = !isFile;
    $('#btnSelect').hidden = !multiEnabled();
    // 「最近使用」固定按时间倒序并分组，排序菜单在那里是空承诺，直接收起来
    const noSort = S.nav === 'recent';
    $('#btnSort').hidden = noSort;
    const sortSep = $('#btnSort').nextElementSibling;
    if (sortSep) sortSep.hidden = noSort;
  }

  function skeleton(n = 6) {
    return `<div>${'<div class="sk-row"></div>'.repeat(n)}</div>`;
  }

  /* 板块级降级：单个接口失败只影响本板块，不拖垮整页 */
  function panelNote(text, action) {
    return `<div class="panel-pad" style="color:var(--text-3);font-size:12.5px;display:flex;align-items:center;gap:8px">
      <span>${esc(text)}</span>${action ? `<button class="pill-btn" data-retry="${esc(action)}">重试</button>` : ''}</div>`;
  }

  /* ===================== 人文关怀 ===================== */
  // 带「下一步」的空状态：一个大符号 + 一句安抚 + 一个能立刻做的事。
  // 空状态不是死胡同，它应该顺手告诉人「接下来能做什么」。
  function emptyState({ icon: ic = 'i-cloud', title, hint = '', action = '' }) {
    return `<div class="empty">${icon(ic, 'icon icon-20')}<h3>${esc(title)}</h3>`
      + (hint ? `<p>${esc(hint)}</p>` : '')
      + (action ? `<button class="btn btn-primary" data-empty-act style="margin-top:10px">${esc(action)}</button>` : '')
      + '</div>';
  }
  // 空状态里的动作按钮统一在这里接线：渲染完再绑，避免到处散落 onclick
  function bindEmptyAct(root, fn) {
    const b = $('[data-empty-act]', root);
    if (b && fn) b.onclick = fn;
  }
  // 模块级失败：先说清「数据没丢」，再给一个重试。错误提示要给出路，而不是审判。
  function loadFail(e, retryId) {
    return `<div class="empty">${icon('i-alert', 'icon icon-20')}<h3>没能载入</h3>
      <p>别担心，你的内容都还在。${esc((e && e.message) || '')}</p>
      ${retryId ? `<button class="btn" id="${retryId}" style="margin-top:4px">再试一次</button>` : ''}</div>`;
  }

  /* ===================== 路由 ===================== */
  // 渲染是异步的：途中再切板块时，先发出的请求可能后返回，把旧板块的内容盖到新板块上
  // （典型表现是标题写 My Files、列表却是 Shared）。渲染函数内部直接写 DOM、无法回滚，
  // 所以这里用世代号做「后来者重画」：旧世代完成时若发现当前世代已落屏，就再画一遍当前板块。
  // 世代号严格递增，每条迟到的响应最多触发一次重画，不会打转。
  let navSeq = 0;
  let paintedSeq = 0;
  async function loadNav() {
    const seq = ++navSeq;
    const list = $('#list');
    list.innerHTML = skeleton(7);
    $('#crumb').innerHTML = '';
    const meta = NAV[S.nav];
    setHead(meta.title, '');
    $('#main').classList.toggle('is-chat', S.nav === 'chats');
    try {
      if (S.nav === 'home') return await renderHome();
      if (S.nav === 'dashboard') return await renderDashboard();
      if (S.nav === 'contributions') return await renderContributions();
      if (S.nav === 'tasks') return await renderTasks();
      if (S.nav === 'board') return await renderBoard();
      if (S.nav === 'todos') return await renderTodos();
      if (S.nav === 'calendar') return await renderCalendar();
      if (S.nav === 'inbox') return await renderInbox();
      if (S.nav === 'chats') return await renderChats();
      if (S.nav === 'members') return await renderMembers();
      if (S.nav === 'ai') return await renderAi();
      if (S.nav === 'storage') return await renderStorage();
      if (S.nav === 'activity') return await renderActivity();
      return await renderFiles();
    } catch (e) {
      list.innerHTML = loadFail(e, 'navRetry');
      const r = $('#navRetry');
      if (r) r.onclick = () => loadNav();
      return;
    } finally {
      if (seq === navSeq) {
        paintedSeq = seq;
      } else if (paintedSeq === navSeq) {
        // 当前世代早已落屏，而我这一代更旧 —— 说明刚才把旧内容盖上去了，重画一次。
        // 标记成未落屏，避免同一批迟到的响应各触发一次重画。
        paintedSeq = 0;
        loadNav();
      }
    }
  }

  /* ===================== 文件视图 ===================== */
  function cmpItems(a, b) {
    if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
    const dir = S.order === 'asc' ? 1 : -1;
    if (S.sort === 'name') return a.name.localeCompare(b.name, 'zh') * dir;
    return ((a[S.sort] || 0) - (b[S.sort] || 0)) * dir;
  }

  const SORT_LABEL = { updated_at: '修改日期', name: '名称', size: '大小', created_at: '创建日期' };
  // 排序列头与工具栏菜单是两个入口，状态必须走同一条路，
  // 否则从列头改排序时工具栏标签还停在「修改日期」，显示的排序和实际不符
  function setSort(k) {
    if (S.sort === k) S.order = S.order === 'asc' ? 'desc' : 'asc';
    else { S.sort = k; S.order = k === 'name' ? 'asc' : 'desc'; }
    $('#sortLabel').textContent = SORT_LABEL[k] || k;
  }

  async function renderFiles() {
    // 列表重新载入即退出多选，避免选中集合与最新数据不一致
    S.multi = false; S.selSet = []; S.anchor = null;
    paintMulti();
    const qs = new URLSearchParams();
    if (S.q) qs.set('q', S.q);
    qs.set('sort', S.sort); qs.set('order', S.order);
    if (S.nav === 'recent') {
      const [a, b] = await Promise.all([
        api(`/api/team/list?scope=shared&view=recent&${qs}`),
        api(`/api/team/list?scope=personal&view=recent&${qs}`),
      ]);
      S.items = [...a.items, ...b.items].sort((x, y) => y.updated_at - x.updated_at);
      S.crumb = [];
    } else {
      const scope = S.nav === 'personal' ? 'personal' : 'shared';
      const view = S.nav === 'links' ? 'shared' : (S.nav === 'trash' ? 'trash' : 'files');
      qs.set('scope', scope); qs.set('view', view);
      if (view === 'files' && S.folder) qs.set('parent', S.folder);
      const r = await api(`/api/team/list?${qs}`);
      S.items = r.items;
      S.crumb = r.path || [];
      if (view === 'files') S.items.sort(cmpItems);
    }
    // 进了子文件夹后 S.items 只是当前文件夹的内容，拿它冒充「Shared 总数」会误导
    if (S.nav === 'shared') $('#cntShared').textContent = S.crumb.length ? '' : S.items.length;
    const canUpload = S.nav !== 'links' && S.nav !== 'trash';
    setHead(NAV[S.nav].title, '', [
      canUpload ? { label: '上传', icon: 'i-upload', primary: true, onClick: pickUpload } : null,
      (S.nav === 'shared' || S.nav === 'personal') ? { label: '新建文件夹', icon: 'i-plus', onClick: newFolder } : null,
    ].filter(Boolean));
    paintCrumbs();
    paintList();
  }

  function paintCrumbs() {
    const box = $('#crumb');
    if (!S.crumb.length || (S.nav !== 'shared' && S.nav !== 'personal')) { box.innerHTML = ''; return; }
    const rootName = S.nav === 'personal' ? 'My Files' : 'Shared';
    const parts = [`<button class="btn btn-quiet btn-sm" data-crumb="">${esc(rootName)}</button>`];
    S.crumb.forEach((c) => {
      parts.push(`<span style="color:var(--text-3);display:inline-flex">${icon('i-chevron-right', 'icon icon-13')}</span>`);
      parts.push(`<button class="btn btn-quiet btn-sm" data-crumb="${esc(c.id)}">${esc(c.name)}</button>`);
    });
    box.innerHTML = parts.join('');
    $$('#crumb [data-crumb]').forEach((b) => {
      b.onclick = () => { S.folder = b.dataset.crumb; S.sel = null; closeInspector(); loadNav(); };
    });
  }

  function paintList() {
    const list = $('#list');
    const sub = $('#headSub');
    const folders = S.items.filter((i) => i.is_dir).length;
    const bytes = S.items.reduce((s, i) => s + (i.size || 0), 0);
    const q = S.me.quotas;
    const personal = S.nav === 'personal';
    const free = personal ? q.personal_quota - q.personal_used : q.shared_quota - q.shared_used;
    let t = `${S.items.length} 项`;
    if (folders) t += `，${folders} 个文件夹`;
    t += ` · 共 ${fmtSize(bytes)} · 剩余 ${fmtSize(free)}`;
    sub.textContent = S.q ? `“${S.q}”的搜索结果：${S.items.length} 项` : t;

    if (!S.items.length) {
      const canWrite = !!(S.me && S.me.can_write);
      const map = {
        trash: ['回收站是空的', '删掉的内容会先放在这里，需要时还能找回。'],
        links: ['还没有共享链接', '在文件上创建共享链接后，会出现在这里。'],
        recent: ['还没有最近打开的项目', '你打开或修改过的项目会出现在这里。'],
        personal: ['这里还是空的', '只有你自己看得见，放心放东西。'],
      };
      const hit = map[S.nav];
      if (hit) { list.innerHTML = emptyState({ icon: 'i-cloud', title: hit[0], hint: hit[1] }); return; }
      if (S.q) {
        list.innerHTML = emptyState({ icon: 'i-search', title: `没有找到「${S.q}」`, hint: '换个关键词试试；也可能它不在你的可读范围内。' });
        return;
      }
      if (canWrite) {
        list.innerHTML = emptyState({ icon: 'i-cloud', title: '共享空间还是空的', hint: '把第一份文件放进来，团队就能一起看了。', action: '上传文件' });
        bindEmptyAct(list, () => pickUpload());
        return;
      }
      list.innerHTML = emptyState({ icon: 'i-cloud', title: '这个文件夹是空的', hint: '还没有人往这里放东西。' });
      return;
    }
    if (S.view === 'grid') return paintCards();

    const wrap = el('div', 'list' + (S.multi ? ' is-multi' : ''));
    const head = el('div', 'list-head');
    const sb = (key, label) => `<button data-sort="${key}">${esc(label)}${S.sort === key
      ? icon('i-chevron-down', 'icon icon-13' + (S.order === 'asc' ? ' is-asc' : '')) : ''}</button>`;
    head.innerHTML = `<span class="pick-cell"></span>${sb('name', '名称')}<span>种类</span>${sb('size', '大小')}${sb('updated_at', '修改日期')}
      <span class="col-owner">上传者</span><span class="col-class">密级</span><span></span>`;
    $$('button[data-sort]', head).forEach((b) => {
      b.onclick = () => {
        setSort(b.dataset.sort);
        S.items.sort(cmpItems);
        paintList();
      };
    });
    wrap.appendChild(head);

    const grouped = S.nav === 'recent';
    let last = null;
    S.items.forEach((it) => {
      if (grouped) {
        const g = groupOf(it.updated_at);
        if (g !== last) { last = g; wrap.appendChild(el('div', 'group-title', `${esc(g)}<span class="spacer"></span>`)); }
      }
      wrap.appendChild(rowNode(it));
    });
    list.innerHTML = '';
    list.appendChild(wrap);
  }

  function groupOf(ts) {
    const now = new Date();
    const start = dayStart(now).getTime();
    const t = ts * 1000, day = 864e5;
    if (t >= start) return '今天';
    if (t >= start - day) return '昨天';
    if (t >= start - 7 * day) return '前 7 天';
    if (t >= start - 30 * day) return '前 30 天';
    return '更早';
  }

  function rowNode(it) {
    const r = el('div', 'row' + (S.sel === it.id ? ' is-sel' : '') + (isChecked(it.id) ? ' is-check' : ''));
    r.dataset.id = it.id;
    r.tabIndex = 0;
    r.setAttribute('role', 'button');
    r.setAttribute('aria-label', `${it.name}，${it.kind}，${it.classification_label}`);
    const gi = kindIcon(it);
    r.innerHTML = `
      <span class="pick-cell"><span class="cb">${icon('i-check')}</span></span>
      <div class="cell-name">
        <span class="glyph ${gi.cls}">${icon(gi.id, 'icon icon-20')}</span>
        <b>${esc(it.name)}</b>${it.version > 1 ? `<span class="ver-tag">v${it.version}</span>` : ''}
      </div>
      <span class="row-sub">${it.is_dir ? '文件夹' : `${esc(it.kind)} · ${fmtSize(it.size)} · ${esc(fmtDate(it.updated_at))}`}</span>
      <div class="cell">${esc(it.kind)}</div>
      <div class="cell">${it.is_dir ? '—' : fmtSize(it.size)}</div>
      <div class="cell">${fmtDate(it.updated_at)}</div>
      <div class="cell col-owner">${esc(it.owner_name || '—')}</div>
      <div class="col-class"><span class="tag ${it.classification}">${esc(it.classification_label)}</span></div>
      <div class="row-actions">
        <button class="icon-btn" data-act="more" title="更多">${icon('i-more', 'icon icon-13')}</button>
      </div>`;
    r.onfocus = () => { if (!S.multi && S.sel !== it.id) { S.sel = it.id; highlight(); } };
    r.onclick = (e) => {
      if (e.target.closest('[data-act="more"]')) { openRowMenu(e.target.closest('button'), it); return; }
      // 多选模式：点击整行即勾选/取消
      if (S.multi) { toggleCheck(it.id, e.shiftKey); return; }
      // 桌面快捷点选：Cmd/Ctrl 加选、Shift 连选，会自动进入多选模式
      if (e.metaKey || e.ctrlKey) { enterMulti(); toggleCheck(it.id); return; }
      if (e.shiftKey && S.anchor) { enterMulti(); rangeCheck(it.id); return; }
      selectItem(it, false);
    };
    r.ondblclick = () => {
      if (S.multi) return;
      if (it.is_dir) { S.folder = it.id; S.sel = null; closeInspector(); loadNav(); }
      else openViewer(it);
    };
    return r;
  }

  function paintCards() {
    const box = el('div', 'cards');
    S.items.forEach((it) => {
      const gi = kindIcon(it);
      const c = el('div', 'card' + (S.sel === it.id ? ' is-sel' : ''));
      c.innerHTML = `<div class="glyph" style="color:var(--${gi.cls === 'folder' ? 'accent' : 'text-2'})">${icon(gi.id, 'icon icon-20')}</div>
        <b>${esc(it.name)}</b><span>${it.is_dir ? '文件夹' : fmtSize(it.size)}</span>`;
      c.onclick = () => selectItem(it, false);
      c.ondblclick = () => { if (it.is_dir) { S.folder = it.id; loadNav(); } else openViewer(it); };
      box.appendChild(c);
    });
    $('#list').innerHTML = '';
    $('#list').appendChild(box);
  }

  function openRowMenu(anchor, it) {
    openMenu(anchor, [
      it.is_dir ? { label: '打开', icon: 'i-folder', onClick: () => { S.folder = it.id; loadNav(); } }
                : { label: '预览', icon: 'i-eye', onClick: () => openViewer(it) },
      it.is_dir ? null : { label: '下载', icon: 'i-download', onClick: () => downloadItem(it) },
      it.is_dir ? null : { label: '发送给成员', icon: 'i-send-plane', onClick: () => sendItem(it) },
      { sep: true },
      { label: '重命名', icon: 'i-pencil', disabled: !it.can_modify, onClick: () => renameItem(it) },
      { label: '密级', icon: 'i-shield', disabled: !it.can_modify, onClick: () => classifyItem(it) },
      it.is_dir ? null : { label: '版本记录', icon: 'i-history', onClick: () => { selectItem(it, false); switchTab('versions'); } },
      { sep: true },
      ...(S.nav === 'trash'
        ? [{ label: '放回原处', icon: 'i-history', disabled: !it.can_delete, onClick: () => restoreItem(it) },
           { label: '彻底删除', icon: 'i-trash', danger: true, disabled: !S.me.can_manage, onClick: () => purgeItem(it) }]
        : [{ label: '删除', icon: 'i-trash', danger: true, disabled: !it.can_delete, onClick: () => deleteItem(it) }]),
    ]);
  }

  /* ===================== 选择与检视 ===================== */
  function highlight() {
    $$('.row').forEach((r) => r.classList.toggle('is-sel', r.dataset.id === S.sel));
    $$('.card').forEach((c, i) => c.classList.toggle('is-sel', S.items[i] && S.items[i].id === S.sel));
  }
  function selectedItem() { return S.items.find((i) => i.id === S.sel) || null; }

  /* ===================== 多选 ===================== */
  // 回收站里没有下载/移动/发送语义，不开放多选
  function multiEnabled() { return FILE_NAVS.has(S.nav) && S.nav !== 'trash'; }
  function isChecked(id) { return S.selSet.indexOf(id) >= 0; }
  function selectedItems() { return S.items.filter((i) => isChecked(i.id)); }

  function paintMulti() {
    const on = S.multi;
    $('#multiBar').hidden = !on;
    $('#toolrow').style.display = (on || !FILE_NAVS.has(S.nav)) ? 'none' : '';
    if (on) $('#mbCount').textContent = `已选 ${S.selSet.length} 项`;
    paintAllLabel();
    const wrap = $('#list .list');
    if (wrap) wrap.classList.toggle('is-multi', on);
  }

  // 「全选」按钮点下去其实是反选，文案必须跟着走，否则等于骗人
  function paintAllLabel() {
    const all = S.items.length > 0 && S.selSet.length === S.items.length;
    $('#mbAll').textContent = all ? '取消全选' : '全选';
  }

  function paintChecks() {
    $$('.row').forEach((r) => r.classList.toggle('is-check', isChecked(r.dataset.id)));
    if (S.multi) $('#mbCount').textContent = `已选 ${S.selSet.length} 项`;
    paintAllLabel();
  }

  function enterMulti() {
    if (S.multi || !multiEnabled()) return;
    S.multi = true;
    S.sel = null;
    closeInspector();
    // 多选统一用列表视图（卡片视图没有复选框）
    if (S.view !== 'list') {
      S.view = 'list';
      $$('#segView button').forEach((x) => x.classList.toggle('is-on', x.dataset.view === 'list'));
    }
    paintList();
    paintMulti();
  }

  function exitMulti() {
    S.multi = false;
    S.selSet = [];
    S.anchor = null;
    paintList();
    paintMulti();
  }

  function toggleCheck(id, shift) {
    if (shift && S.anchor) { rangeCheck(id); return; }
    const i = S.selSet.indexOf(id);
    if (i >= 0) S.selSet.splice(i, 1); else S.selSet.push(id);
    S.anchor = id;
    paintChecks();
  }

  function rangeCheck(id) {
    const ids = S.items.map((x) => x.id);
    const a = ids.indexOf(S.anchor), b = ids.indexOf(id);
    if (a < 0 || b < 0) return;
    const next = new Set(S.selSet);
    for (let k = Math.min(a, b); k <= Math.max(a, b); k++) next.add(ids[k]);
    S.selSet = [...next];
    S.anchor = id;
    paintChecks();
  }

  function checkAll() {
    const ids = S.items.map((i) => i.id);
    S.selSet = S.selSet.length === ids.length ? [] : ids;
    S.anchor = null;
    paintChecks();
  }
  function selectItem(it, openPreview, tab) {
    S.sel = it.id;
    highlight();
    if (openPreview) openViewer(it);
    else openInspector(it, tab || 'meta');
  }
  let insAnim = null;
  function closeInspector() {
    const ins = $('#inspector');
    if (insAnim) { insAnim.cancel(); insAnim = null; }
    ins.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ins-on');
    ins.classList.remove('on');
    syncInert();
    pingPresence();   // 关掉面板即刻广播「我不在这个文件上了」，不用等下一个心跳
    if (prefersReduce()) { ins.style.transform = ''; return; }
    const w = ins.offsetWidth || 340;
    insAnim = springTo({
      from: translateOf(ins).x, to: w, response: 0.34, damping: 0.9,
      onFrame: (x) => { ins.style.transform = `translate3d(${x}px, 0, 0)`; },
      onDone: () => { ins.style.transform = ''; insAnim = null; },
    });
  }

  /* 右滑关闭：从头部抓，向右甩出去就关，没甩够就弹回来 —— 全程可打断 */
  (function initInsGesture() {
    const ins = $('#inspector');
    let armed = false, dragging = false, pid = 0, startX = 0, baseX = 0;
    const tr = tracker();
    const setX = (x) => { ins.style.transform = `translate3d(${x}px, 0, 0)`; };
    ins.addEventListener('pointerdown', (e) => {
      if (!ins.classList.contains('on')) return;
      if (!(e.target.closest && e.target.closest('.ins-head'))) return;   // 只从头部抓，正文要留给选择与滚动
      if (isInteractive(e.target) || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (insAnim) { insAnim.cancel(); insAnim = null; }
      armed = true; dragging = false; pid = e.pointerId;
      startX = e.clientX; baseX = translateOf(ins).x;
      tr.reset();                                  // 清掉上一次手势的采样
      tr.push(performance.now(), e.clientX, 0);
    });
    ins.addEventListener('pointermove', (e) => {
      if (!armed || e.pointerId !== pid) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (dx < 6) { tr.push(performance.now(), e.clientX, 0); return; }   // 只认「向右」的意图
        dragging = true;
        try { ins.setPointerCapture(pid); } catch (_) {}
      }
      tr.push(performance.now(), e.clientX, 0);
      let x = baseX + dx;
      if (x < 0) x = -rubberband(-x, ins.offsetWidth || 340);              // 反向：带阻尼
      setX(x);
      e.preventDefault();
    });
    const release = (e) => {
      if (!armed || e.pointerId !== pid) return;
      armed = false;
      tr.push(performance.now(), e.clientX, 0);          // 补上松手采样
      if (!dragging) return;
      dragging = false;
      try { ins.releasePointerCapture(pid); } catch (_) {}
      const v = tr.velocity().x;
      const w = ins.offsetWidth || 340;
      const from = translateOf(ins).x;
      if (from + projectMomentum(v) > w * 0.42 || v > 900) {
        ins.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('ins-on');
        ins.classList.remove('on');
        syncInert();
        insAnim = springTo({ from, to: w, velocity: v, response: 0.34, damping: 0.95,
          onFrame: setX, onDone: () => { ins.style.transform = ''; insAnim = null; } });
      } else {
        insAnim = springTo({ from, to: 0, velocity: v, response: 0.34, damping: 0.82,
          onFrame: setX, onDone: () => { ins.style.transform = ''; insAnim = null; } });
      }
    };
    ins.addEventListener('pointerup', release);
    ins.addEventListener('pointercancel', () => {
      if (!armed) return;
      armed = false;
      if (!dragging) return;
      dragging = false;
      insAnim = springTo({ from: translateOf(ins).x, to: 0, velocity: 0, onFrame: setX, onDone: () => { ins.style.transform = ''; insAnim = null; } });
    });
  })();

  async function openInspector(it, tab) {
    S.inspTab = tab || 'meta';
    const ins = $('#inspector');
    const wasOn = ins.classList.contains('on');
    ins.classList.add('on');
    ins.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ins-on');
    syncInert();
    const gi = kindIcon(it);
    ins.innerHTML = `
      <div class="ins-head">
        <span class="glyph" style="color:var(--${gi.cls === 'folder' ? 'accent' : 'text-2'})">${icon(gi.id, 'icon icon-20')}</span>
        <div class="ins-title">
          <h2 title="${esc(it.name)}">${esc(it.name)}</h2>
          <p>${esc(it.kind)} · ${it.is_dir ? '文件夹' : fmtSize(it.size)}</p>
        </div>
        ${it.is_dir || !(it.previewable || it.inline_viewable) ? '' : `<button class="btn btn-sm" id="insPreview">${icon('i-expand', 'icon icon-13')}预览</button>`}
        <button class="icon-btn" id="insClose" title="关闭">${icon('i-x', 'icon icon-15')}</button>
      </div>
      <div class="ins-tabs">
        <button class="ins-tab" data-t="meta">信息</button>
        ${it.is_dir ? '' : '<button class="ins-tab" data-t="versions">版本</button>'}
        <button class="ins-tab" data-t="comments">评论</button>
      </div>
      <div class="ins-viewers" id="insViewers" hidden></div>
      <div class="ins-body" id="insBody"></div>`;
    $('#insClose').onclick = closeInspector;
    const pv = $('#insPreview');
    if (pv) pv.onclick = () => openViewer(it);
    $$('.ins-tab', ins).forEach((b) => { b.onclick = () => switchTab(b.dataset.t); });
    switchTab(S.inspTab);
    renderViewers();
    pingPresence();
    // 滑入：从右侧整块推入；若只是切换标签（本就在屏上）就不重播
    if (!wasOn && !prefersReduce()) {
      if (insAnim) { insAnim.cancel(); insAnim = null; }
      const w = ins.offsetWidth || 340;
      insAnim = springTo({
        from: w, to: 0, response: 0.34, damping: 0.9,
        onFrame: (x) => { ins.style.transform = `translate3d(${x}px, 0, 0)`; },
        onDone: () => { ins.style.transform = ''; insAnim = null; },
      });
    } else if (prefersReduce()) { ins.style.transform = ''; }
  }
  async function switchTab(t) {
    const it = selectedItem();
    if (!it) return;
    S.inspTab = t;
    $$('.ins-tab').forEach((b) => b.classList.toggle('is-on', b.dataset.t === t));
    const body = $('#insBody');
    body.innerHTML = skeleton(4);
    try {
      if (t === 'meta') return renderMeta(body, it);
      if (t === 'versions') return await renderVersions(body, it);
      if (t === 'comments') return await renderComments(body, it);
    } catch (e) {
      body.innerHTML = loadFail(e, 'tabRetry');
      const r = $('#tabRetry', body);
      if (r) r.onclick = () => switchTab(t);
    }
  }
  function renderMeta(body, it) {
    const rows = [
      ['名称', esc(it.name)],
      ['种类', esc(it.kind)],
      ['大小', it.is_dir ? '—' : fmtSize(it.size)],
      ['密级', `<span class="tag ${it.classification}">${esc(it.classification_label)}</span>${it.source_locked ? ' <span class="badge warn">' + icon('i-key', 'icon icon-13') + '源码自动定密</span>' : ''}`],
      ['版本', `v${it.version}`],
      ['上传者', esc(it.owner_name || '—')],
      ['创建时间', fmtDay(it.created_at)],
      ['修改时间', fmtDay(it.updated_at)],
      ['位置', it.scope === 'personal' ? 'My Files' : 'Shared'],
    ];
    body.innerHTML = `<dl>${rows.map(([k, v]) => `<div class="meta-row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px">
        ${it.is_dir ? '' : `<button class="btn btn-sm" id="mDown">${icon('i-download', 'icon icon-13')}下载</button>`}
        ${it.is_dir ? '' : `<button class="btn btn-sm" id="mShare" ${it.can_modify ? '' : 'disabled'}>${icon('i-share', 'icon icon-13')}共享</button>`}
        <button class="btn btn-sm" id="mRename" ${it.can_modify ? '' : 'disabled'}>${icon('i-pencil', 'icon icon-13')}重命名</button>
        <button class="btn btn-sm" id="mClass" ${it.can_modify ? '' : 'disabled'}>${icon('i-shield', 'icon icon-13')}密级</button>
        <button class="btn btn-sm btn-danger" id="mDel" ${it.can_delete ? '' : 'disabled'}>${icon('i-trash', 'icon icon-13')}删除</button>
      </div>`;
    const bind = (id, fn) => { const n = $(id, body); if (n) n.onclick = fn; };
    bind('#mDown', () => downloadItem(it));
    bind('#mShare', () => shareItem(it));
    bind('#mRename', () => renameItem(it));
    bind('#mClass', () => classifyItem(it));
    bind('#mDel', () => deleteItem(it));
    if (!it.is_dir) loadLinkedTasks(body, it);
  }

  // 文件 → 任务：这个文件牵涉了哪些任务
  async function loadLinkedTasks(body, it) {
    const host = el('div');
    host.innerHTML = '<p style="color:var(--text-4);font-size:11.5px;margin:16px 0 6px">关联任务</p><div class="sk-row"></div>';
    body.appendChild(host);
    let items = [];
    try {
      const d = await api(`/api/team/tasks?file=${it.id}`);
      items = d.items || [];
    } catch (e) { host.remove(); return; }
    host.innerHTML = `<p style="color:var(--text-4);font-size:11.5px;margin:16px 0 6px">关联任务${items.length ? ` · ${items.length}` : ''}</p>`;
    if (!items.length) {
      host.insertAdjacentHTML('beforeend', '<p style="color:var(--text-3);font-size:12.5px;margin:0 0 8px">还没有关联任务。</p>');
    } else {
      items.forEach((t) => {
        const b = el('button', 'chip-link');
        b.style.margin = '0 6px 6px 0';
        b.innerHTML = `${icon('i-check-circle', 'icon icon-13')}<span>${esc(t.title)}</span>`;
        b.onclick = () => taskDetail(t);
        host.appendChild(b);
      });
    }
    if (S.me.can_write) {
      const add = el('button', 'pill-btn');
      add.textContent = '新建关联任务';
      add.style.marginTop = '4px';
      add.onclick = () => taskEditor(null, { id: it.id, name: it.name });
      host.appendChild(el('div')).appendChild(add);
    }
  }
  async function renderVersions(body, it) {
    const data = await api(`/api/team/file/${it.id}/versions`);
    body.innerHTML = `
      <p style="color:var(--text-3);font-size:12px;margin:0 0 10px">保留最近 ${data.max_versions} 个版本，超过 ${data.ttl_days} 天的自动清理。</p>
      ${data.items.map((v) => `
        <div class="ver-item ${v.current ? 'cur' : ''}">
          <span class="ver-no">v${v.version}</span>
          <div class="ver-meta"><b>${esc(v.note || '历史版本')}</b><span>${esc(v.username || '—')} · ${fmtShort(v.created_at)} · ${fmtSize(v.size)}</span></div>
          ${v.current ? '<span class="badge accent">当前</span>' : `
            <button class="btn btn-sm" data-df="${v.version}">对比</button>
            <button class="btn btn-sm" data-dl="${v.version}">${icon('i-download', 'icon icon-13')}</button>
            <button class="btn btn-sm" data-rs="${v.version}" ${it.can_modify ? '' : 'disabled'}>恢复</button>`}
        </div>`).join('')}`;
    $$('[data-df]', body).forEach((b) => { b.onclick = () => openDiff(it, +b.dataset.df, 0); });
    $$('[data-dl]', body).forEach((b) => { b.onclick = () => { location.href = `/api/team/file/${it.id}/versions/${b.dataset.dl}/download`; }; });
    $$('[data-rs]', body).forEach((b) => {
      b.onclick = () => sheet({
        title: `恢复到 v${b.dataset.rs}`, desc: '当前内容会先存为一个新版本。', okText: '恢复',
        onOk: async () => {
          const r = await jpost(`/api/team/file/${it.id}/versions/${b.dataset.rs}/restore`);
          toast(`已恢复到 v${b.dataset.rs}`);
          await reloadKeep();
          switchTab('versions');
        },
      });
    });
  }

  // 版本对比：把后端算好的行级 diff 渲染成 GitHub 风格的 +/- 视图
  async function openDiff(it, from, to) {
    let data;
    try { data = await api(`/api/team/file/${it.id}/diff?from=${from}&to=${to}`); }
    catch (e) { toast(e.message, 'err'); return; }
    const rows = data.lines || [];
    const body = rows.length ? rows.map((r) => {
      if (r.t === 'hunk') return `<div class="diff-row hunk"><span class="diff-gut"></span><span class="diff-gut"></span><span class="diff-body">${esc(r.text)}</span></div>`;
      if (r.t === 'note') return `<div class="diff-row note"><span class="diff-gut"></span><span class="diff-gut"></span><span class="diff-body">${esc(r.text)}</span></div>`;
      const cls = r.t === 'add' ? 'add' : r.t === 'del' ? 'del' : 'ctx';
      const sign = r.t === 'add' ? '+' : r.t === 'del' ? '−' : '';
      return `<div class="diff-row ${cls}">`
        + `<span class="diff-gut">${r.a ? r.a : ''}</span><span class="diff-gut">${r.b ? r.b : ''}</span>`
        + `<span class="diff-body"><span class="diff-sign">${sign}</span>${esc(r.text) || '&nbsp;'}</span></div>`;
    }).join('') : '<div class="diff-empty">两个版本内容一致。</div>';
    const stat = data.same ? '<span style="color:var(--text-3)">无变化</span>'
      : `<span class="diff-add">+${data.stats.add}</span> <span class="diff-del">−${data.stats.del}</span>`;
    openSheet(`
      <h3>${esc(data.from_label)} → ${esc(data.to_label)}</h3>
      <p class="diff-stat">${stat}${data.truncated ? ' · 内容较大，仅对比前 512KB' : ''}</p>
      <div class="diff-view">${body}</div>
      <div class="sheet-actions"><button class="btn btn-primary" id="sClose">关闭</button></div>`,
      (box) => { $('#sClose', box).onclick = closeSheet; }, { wide: true });
  }
  // 把正文里的 @用户名 标出来。用一次正则扫描（长名字排在前面），
  // 不能逐个名字 replace：先包一层 <span> 后，短名字「张三」会再次命中
  // 「张三丰」标签内部的文本，套出嵌套标签。
  function highlightMentions(text, names) {
    const list = [...new Set((names || []).filter(Boolean))].sort((a, b) => b.length - a.length);
    if (!list.length) return esc(text);
    const alts = list.map((n) => esc(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp('@(?:' + alts.join('|') + ')', 'g');
    return esc(text).replace(re, (m) => `<span class="cmt-at">${m}</span>`);
  }

  let cmtReply = '';   // 当前回复目标（顶层评论 id），换文件或重渲染时清空
  async function renderComments(body, it) {
    const data = await api(`/api/team/file/${it.id}`);
    // 提及高亮要拿成员名册；列表失败也不该挡住评论本身
    if (!S.members || !S.members.length) {
      try { S.members = (await api('/api/team/members')).items || []; } catch (e) { /* 仅供高亮 */ }
    }
    const names = (S.members || []).map((m) => m.username).filter(Boolean);
    const all = data.comments || [];
    const canComment = data.can_comment !== false;
    const canMod = !!data.can_moderate;
    cmtReply = '';
    // 用详情接口里带回的在场名单做首屏，之后靠 SSE 的 presence 事件增量更新
    if (Array.isArray(data.viewers)) presence.files[it.id] = data.viewers;

    const kidsOf = (id) => all.filter((c) => c.parent_id === id);
    const card = (c, isReply) => {
      const acts = [];
      if (canComment && !isReply) acts.push(`<button class="cmt-act" data-reply="${esc(c.id)}" data-who="${esc(c.username)}" type="button">回复</button>`);
      if (c.mine || canMod) acts.push(`<button class="cmt-act" data-del="${esc(c.id)}" type="button">删除</button>`);
      if (c.mine || canMod) acts.push(`<button class="cmt-act" data-res="${esc(c.id)}" data-on="${c.resolved ? 0 : 1}" type="button">${c.resolved ? '重新打开' : '标为已解决'}</button>`);
      return `<div class="cmt${isReply ? ' cmt-reply' : ''}${c.resolved ? ' cmt-resolved' : ''}">
        <div class="cmt-head"><b>${esc(c.username || '—')}</b><span>${fmtShort(c.created_at)}</span>
          ${c.resolved ? `<span class="cmt-done">${icon('i-check', 'icon icon-13')}已解决</span>` : ''}</div>
        <p>${highlightMentions(c.content, names)}</p>
        ${acts.length ? `<div class="cmt-acts">${acts.join('')}</div>` : ''}
      </div>`;
    };

    const tops = all.filter((c) => !c.parent_id);
    body.innerHTML = `
      ${tops.map((c) => card(c, false) + kidsOf(c.id).map((k) => card(k, true)).join('')).join('')
        || '<p class="cmt-none">暂无评论。用 @名字 可以提及成员并通知到人。</p>'}
      ${canComment ? `<div class="cmt-form">
        <div class="cmt-reply-to" id="cmtReplyTo" hidden></div>
        <div class="cmt-typing" id="cmtTyping" hidden></div>
        <textarea id="cText" placeholder="添加评论，用 @名字 提及成员"></textarea>
        <div class="cmt-form-bar">
          <button class="btn btn-sm" id="cAt" type="button">@ 提及</button>
          <button class="btn btn-primary" id="cSend" type="button">发送</button>
        </div>
      </div>` : '<p class="cmt-none">你的角色为只读访客，无法评论。</p>'}`;

    if (canComment) {
      const ta = $('#cText', body);
      const send = async () => {
        const t = (ta.value || '').trim();
        if (!t) return;
        try {
          await jpost(`/api/team/file/${it.id}/comments`, { content: t, parent_id: cmtReply });
          clearTimeout(typingOffTimer); typingOffTimer = null;
          sendTyping(false);
          switchTab('comments');
        } catch (e) { toast(e.message, 'err'); }   // 静默会把用户刚敲的一段话一起吞掉
      };
      $('#cSend', body).onclick = send;
      // ⌘/Ctrl+Enter 发送：评论是多行输入，单独回车留给换行
      ta.onkeydown = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); send(); } };
      ta.oninput = noteTyping;   // 让同文件的其他人在面板上看到「正在输入…」

      const setReply = (id, who) => {
        cmtReply = id || '';
        const box = $('#cmtReplyTo', body);
        box.hidden = !id;
        box.innerHTML = id ? `<span>回复 <b>@${esc(who)}</b></span><button class="pill-btn" id="cmtReplyX" type="button">取消</button>` : '';
        if (id) {
          ta.focus();
          const x = $('#cmtReplyX', body);
          if (x) x.onclick = () => setReply('', '');
        }
      };
      $$('.cmt-act[data-reply]', body).forEach((b) => { b.onclick = () => setReply(b.dataset.reply, b.dataset.who); });

      const atBtn = $('#cAt', body);
      if (atBtn) atBtn.onclick = (e) => {
        if (!names.length) { toast('还没有可提及的成员', 'err'); return; }
        openMenu(e.currentTarget, names.map((n) => ({
          label: '@' + n, icon: 'i-people',
          onClick: () => {
            const p = ta.selectionStart == null ? ta.value.length : ta.selectionStart;
            const pre = ta.value.slice(0, p), post = ta.value.slice(p);
            const ins = (pre && !/\s$/.test(pre) ? ' ' : '') + '@' + n + ' ';
            ta.value = pre + ins + post;
            const np = p + ins.length;
            ta.focus();
            try { ta.setSelectionRange(np, np); } catch (_) { /* 老浏览器忽略 */ }
          },
        })));
      };
    }

    $$('.cmt-act[data-del]', body).forEach((b) => {
      b.onclick = () => sheet({
        title: '删除评论', desc: '删除后不可恢复；如果它是顶层评论，下面的回复会一起删掉。',
        danger: true, okText: '删除',
        onOk: async () => {
          await api(`/api/team/file/${it.id}/comments/${b.dataset.del}`, { method: 'DELETE' });
          switchTab('comments');
        },
      });
    });
    $$('.cmt-act[data-res]', body).forEach((b) => {
      b.onclick = async () => {
        try {
          await jpatch(`/api/team/file/${it.id}/comments/${b.dataset.res}`, { resolved: b.dataset.on === '1' });
          switchTab('comments');
        } catch (e) { toast(e.message, 'err'); }
      };
    });
    renderViewers();
    renderTyping();
  }

  /* ===================== 全屏查看器 ===================== */
  function wmUrl(text) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="190">
      <g fill="#7d7d7d" font-family="-apple-system,Helvetica,sans-serif" font-size="12.5" transform="rotate(-24 170 95)">
        <text x="8" y="80">${text}</text><text x="160" y="158">${text}</text>
      </g></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }
  function closeViewer() {
    $('#viewer').classList.remove('on', 'editing');
    $('#viewer').setAttribute('aria-hidden', 'true');
    $('#vStage').innerHTML = '';
    $('#vEdit').hidden = true;
    $('#vState').textContent = '';
    S.viewer = { item: null, version: 0, editing: false, dirty: false, save: null };
    syncInert();
    if (viewerReturn && viewerReturn.isConnected) viewerReturn.focus();
    viewerReturn = null;
  }
  let viewerReturn = null;
  async function openViewer(it) {
    if (it.is_dir) return;
    const v = $('#viewer');
    if (!v.classList.contains('on')) viewerReturn = document.activeElement;
    v.classList.add('on');
    v.classList.remove('editing');
    v.setAttribute('aria-hidden', 'false');
    syncInert();
    if (!v.contains(document.activeElement)) v.focus();   // 背景已 inert，焦点得先落进查看器
    const gi = kindIcon(it);
    $('#vGlyph').innerHTML = icon(gi.id, 'icon icon-20');
    $('#vName').textContent = it.name;
    $('#vMeta').textContent = `${it.kind} · ${fmtSize(it.size)} · ${it.classification_label}${it.version > 1 ? ` · v${it.version}` : ''}`;
    $('#vEdit').hidden = true;
    $('#vEdit').onclick = null;
    $('#vDownload').onclick = () => downloadItem(it);
    $('#vClose').onclick = closeViewer;
    const stage = $('#vStage');
    const e = it.ext || extOf(it.name);
    S.viewer = { item: it, version: it.version, editing: false, dirty: false, save: null };
    stage.className = 'viewer-stage';

    if (it.editable || it.previewable) {
      // 先开大文件再开小文件时，大文件的响应可能后到，会把内容渲染到另一个文件名下；
      // 关掉查看器后响应到达还会塞回已清空的 #vStage。落屏前确认查看器还停在同一个文件。
      const openedId = it.id;
      const gone = () => !S.viewer.item || S.viewer.item.id !== openedId;
      stage.innerHTML = skeleton(8);
      let data;
      try { data = await api(`/api/team/file/${it.id}/content`); }
      catch (err) {
        if (gone()) return;
        stage.innerHTML = `<div class="empty">${icon('i-alert', 'icon icon-20')}<h3>无法预览</h3><p>${esc(err.message)}</p></div>`;
        return;
      }
      if (gone()) return;
      S.viewer.version = data.version;
      const lines = data.content.split('\n').length;
      stage.innerHTML = `
        <div class="viewer-editor">
          <div class="gutter" id="vGutter">${Array.from({ length: lines }, (_, i) => i + 1).join('\n')}</div>
          <div class="code-area">
            <pre id="vPre">${esc(data.content)}</pre>
            <textarea id="vArea" spellcheck="false" aria-label="文件内容"></textarea>
          </div>
          ${data.watermark ? '<div class="wm" id="vWm"></div>' : ''}
        </div>`;
      const ta = $('#vArea'), gutter = $('#vGutter');
      const sync = () => { gutter.textContent = Array.from({ length: ta.value.split('\n').length }, (_, i) => i + 1).join('\n'); };
      ta.oninput = () => { if (!S.viewer.dirty) { S.viewer.dirty = true; $('#vState').textContent = '未保存'; } sync(); };
      ta.onkeydown = (ev) => {
        if (ev.key === 'Tab') {
          ev.preventDefault();
          const s = ta.selectionStart, en = ta.selectionEnd;
          ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(en);
          ta.selectionStart = ta.selectionEnd = s + 2;
          ta.oninput();
        }
        if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); saveFile(); }
      };
      if (data.watermark) {
        const w = $('#vWm');
        w.style.backgroundImage = wmUrl(`${S.me.user.username} · ${fmtShort(Math.floor(Date.now() / 1000))}`);
        w.style.backgroundSize = '340px 190px';
      }
      if (it.editable) { $('#vEdit').hidden = false; $('#vEdit').innerHTML = `${icon('i-pencil', 'icon icon-13')}编辑`; }
      $('#vState').textContent = `v${data.version}` + (data.truncated ? ' · 仅显示前 2 MB' : '');
      S.viewer.save = saveFile;
      $('#vEdit').onclick = toggleEdit;

      function toggleEdit() {
        const on = !S.viewer.editing;
        if (!on && S.viewer.dirty) { saveFile(); return; }
        S.viewer.editing = on;
        v.classList.toggle('editing', on);
        $('#vEdit').classList.toggle('btn-primary', on);
        $('#vEdit').innerHTML = on ? `${icon('i-check', 'icon icon-13')}存储` : `${icon('i-pencil', 'icon icon-13')}编辑`;
        if (on) { if (!ta.value) ta.value = data.content; ta.focus(); $('#vState').textContent = `v${S.viewer.version} · ⌘S 存储`; }
      }
      async function saveFile() {
        if (!S.viewer.editing && !S.viewer.dirty) return;
        try {
          const r = await api(`/api/team/file/${it.id}/content`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: ta.value, version: S.viewer.version }),
          });
          S.viewer.version = r.version;
          S.viewer.dirty = false;
          S.viewer.editing = false;
          v.classList.remove('editing');
          $('#vEdit').classList.remove('btn-primary');
          $('#vEdit').innerHTML = `${icon('i-pencil', 'icon icon-13')}编辑`;
          $('#vState').textContent = `已存储 v${r.version}`;
          toast(`已保存 · v${r.version}`);
          await reloadKeep();
        } catch (err) {
          if (err.status === 409) { toast('文件已被他人更新，请关闭后重新打开', 'err', 4000); $('#vState').textContent = '版本冲突'; }
          else toast(err.message, 'err');
        }
      }
      return;
    }

    if (IMAGE_EXTS.has(e)) {
      stage.classList.add('center');
      stage.innerHTML = `<img src="/api/team/file/${it.id}/view" alt="${esc(it.name)}">`;
      if (it.watermark) stage.insertAdjacentHTML('beforeend', '<div class="wm" id="vWm"></div>');
    } else if (e === '.pdf') {
      stage.innerHTML = `<iframe src="/api/team/file/${it.id}/view" title="${esc(it.name)}"></iframe>`;
    } else if (VIDEO_EXTS.has(e)) {
      stage.classList.add('center');
      stage.innerHTML = `<video src="/api/team/file/${it.id}/view" controls autoplay></video>`;
    } else if (AUDIO_EXTS.has(e)) {
      stage.classList.add('center');
      stage.innerHTML = `<audio src="/api/team/file/${it.id}/view" controls autoplay></audio>`;
    } else {
      stage.innerHTML = `<div class="empty">${icon('i-doc', 'icon icon-20')}<h3>无法预览</h3><p>下载后用本地应用打开。</p>
        <button class="btn btn-primary" id="vFallback" style="margin-top:6px">${icon('i-download', 'icon icon-13')}下载</button></div>`;
      $('#vFallback').onclick = () => downloadItem(it);
    }
    if (S.viewer && $('#vWm')) {
      const w = $('#vWm');
      w.style.backgroundImage = wmUrl(`${S.me.user.username} · ${fmtShort(Math.floor(Date.now() / 1000))}`);
      w.style.backgroundSize = '340px 190px';
    }
  }

  /* ===================== 公告栏 ===================== */
  function announceEditor(a) {
    sheet({
      title: a ? '编辑公告' : '发布公告',
      desc: a ? '' : '发布后会显示在首页和概览，团队成员都能看到。',
      fields: `<input class="field" id="anTitle" placeholder="标题（可选）" maxlength="80" value="${esc(a ? a.title : '')}">
        <textarea class="field area" id="anBody" placeholder="正文" maxlength="3000">${esc(a ? a.body : '')}</textarea>`,
      okText: a ? '存储' : '发布',
      onOk: async () => {
        const title = $('#anTitle').value.trim();
        const body = $('#anBody').value.trim();
        if (!body) { toast('公告内容不能为空', 'err'); return false; }
        try {
          if (a) await jpatch(`/api/team/announcements/${a.id}`, { title, body });
          else await jpost('/api/team/announcements', { title, body });
        } catch (e) { toast(e.message, 'err'); return false; }
        toast(a ? '已保存' : '公告已发布，团队都能看到了。');
        loadNav();
      },
    });
    $('#anBody').focus();
  }

  function announceBlock(items, canPost) {
    const head = `
      <div class="section-head">
        <div class="section-title">公告${items.length ? `<span class="section-note">${items.length} 条</span>` : ''}</div>
        ${canPost ? '<button class="pill-btn" id="anNew">发布公告</button>' : ''}
      </div>`;
    if (!items.length) {
      return head + `<div class="panel">${panelNote(canPost ? '还没有公告。想告诉大家的事，从右上角发布。' : '还没有公告。')}</div>`;
    }
    return head + `<div class="panel">${items.map((a) => `
      <article class="annc">
        <div class="annc-head">
          <span class="annc-av">${a.author_avatar ? `<img src="${esc(a.author_avatar)}" alt="">` : esc(initials(a.author_name))}</span>
          <span class="annc-who"><b>${esc(a.author_name)}</b><small>${fmtDue(a.created_at)}${a.updated_at > a.created_at + 1 ? ' · 已编辑' : ''}</small></span>
          ${(a.can_edit || a.can_delete) ? `<button class="icon-btn" data-an-menu="${esc(a.id)}" title="更多">${icon('i-more', 'icon icon-15')}</button>` : ''}
        </div>
        ${a.title ? `<h4 class="annc-title">${esc(a.title)}</h4>` : ''}
        <p class="annc-body is-clamp">${esc(a.body)}</p>
        <button class="annc-more" data-an-toggle hidden>展开</button>
      </article>`).join('')}</div>`;
  }

  function wireAnnounce(items) {
    const add = $('#anNew');
    if (add) add.onclick = () => announceEditor(null);
    $$('[data-an-toggle]').forEach((b) => {
      b.onclick = () => {
        const p = b.previousElementSibling;
        const clamped = p.classList.toggle('is-clamp');
        b.textContent = clamped ? '展开' : '收起';
      };
    });
    // 判断正文是否真的被截断：先解掉行数限制量一次，再收回
    $$('.annc-body.is-clamp').forEach((p) => {
      const b = p.nextElementSibling;
      if (!b) return;
      p.classList.remove('is-clamp');
      const full = p.scrollHeight;
      p.classList.add('is-clamp');
      if (full > p.clientHeight + 4) b.hidden = false;
    });
    $$('[data-an-menu]').forEach((b) => {
      b.onclick = () => {
        const a = items.find((x) => x.id === b.dataset.anMenu);
        openMenu(b, [
          a.can_edit ? { label: '编辑', icon: 'i-pencil', onClick: () => announceEditor(a) } : null,
          a.can_delete ? {
            label: '删除', icon: 'i-trash', danger: true,
            onClick: () => sheet({
              title: '删除公告',
              desc: (a.title || a.body).replace(/\s+/g, ' ').slice(0, 60),
              okText: '删除', danger: true,
              onOk: async () => {
                try { await api(`/api/team/announcements/${a.id}`, { method: 'DELETE' }); }
                catch (e) { toast(e.message, 'err'); return false; }
                toast('已删除');
                loadNav();
              },
            }),
          } : null,
        ]);
      };
    });
  }

  /* ===================== 首页 ===================== */
  async function renderHome() {
    const me = S.me;
    const h = new Date().getHours();
    const greet = h < 6 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
    const today = new Date();
    const ds = dayStart(today).getTime() / 1000;
    const de = ds + 86400;
    // 任一接口失败只降级对应板块，不整页报错
    const [dR, evR, tdR, tkR] = await Promise.allSettled([
      api('/api/team/dashboard'),
      api(`/api/team/events?from=${ds}&to=${de}`),
      api('/api/team/todos'),
      api('/api/team/tasks?filter=mine'),
    ]);
    const d = dR.status === 'fulfilled' ? dR.value : null;
    const evs = evR.status === 'fulfilled' ? evR.value.items : null;
    const todos = tdR.status === 'fulfilled' ? tdR.value.items : null;
    const tasks = tkR.status === 'fulfilled' ? tkR.value.items : null;
    const failMsg = '暂时无法载入。';

    $('#headTitle').textContent = `${greet}，${me.user.username}`;
    $('#headSub').textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
      + (d ? ` · 共享空间已用 ${fmtSize(d.storage.shared_used)}` : '');
    $('#headActions').innerHTML = '';

    const openTodos = todos ? todos.filter((t) => !t.done) : null;
    const openTasks = tasks ? tasks.filter((t) => t.status !== 'done') : null;
    const annItems = d ? (d.announcements || []) : null;
    const annHTML = annItems === null
      ? `<div class="section-head"><div class="section-title">公告</div></div><div class="panel">${panelNote(failMsg, 'home')}</div>`
      : announceBlock(annItems, !!d.can_announce);

    const evBlock = evs === null ? panelNote(failMsg, 'home')
      : (evs.length ? evs.map((e) => `
          <div class="day-ev">
            <span class="tm">${e.all_day ? '全天' : `${p2(new Date(e.start_at * 1000).getHours())}:${p2(new Date(e.start_at * 1000).getMinutes())}`}</span>
            <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.title)}</span>
            <span class="badge ${e.scope === 'team' ? 'warn' : ''}">${e.scope === 'team' ? '团队' : '个人'}</span>
          </div>`).join('') : panelNote('今天没有日程。'));
    const todoBlock = openTodos === null ? panelNote(failMsg, 'home')
      : (openTodos.length ? openTodos.slice(0, 6).map((t) => `
          <div class="item">
            <button class="check" data-check="${esc(t.id)}" aria-label="完成">${icon('i-check', 'icon')}</button>
            <div class="item-body">
              <div class="item-title">${esc(t.content)}</div>
              ${t.due_at ? `<div class="item-meta"><span style="color:var(--${t.overdue ? 'danger' : 'text-3'})">${fmtDue(t.due_at)}</span></div>` : ''}
            </div>
          </div>`).join('') : panelNote('没有待办。想到什么，随手记一条。'));
    const taskBlock = openTasks === null ? panelNote(failMsg, 'home')
      : (openTasks.length ? openTasks.slice(0, 6).map((t) => `
          <div class="item">
            <button class="check" data-task="${esc(t.id)}" data-status="${esc(t.status)}" aria-label="完成">${icon('i-check', 'icon')}</button>
            <div class="item-body">
              <div class="item-title">${esc(t.title)}</div>
              <div class="item-meta">
                ${t.priority ? `<span class="badge ${t.priority === 2 ? 'danger' : 'warn'}">${PRIORITY[t.priority]}</span>` : ''}
                <span>${esc(t.creator_name)} 下发</span>
                ${t.due_at ? `<span class="dot"></span><span style="color:var(--${t.overdue ? 'danger' : 'text-3'})">${fmtDue(t.due_at)}</span>` : ''}
              </div>
            </div>
          </div>`).join('') : panelNote('暂时没有派给你的任务。'));
    const fileBlock = !d ? panelNote(failMsg, 'home')
      : (d.recent_files.length ? d.recent_files.slice(0, 6).map((f) => `
          <div class="day-ev" data-open="${esc(f.id)}">
            <span style="color:var(--text-3);display:flex">${icon(kindIcon(f).id, 'icon icon-20')}</span>
            <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.name)}</span>
            <span style="color:var(--text-3);font-size:12.5px">${fmtDate(f.updated_at)}</span>
          </div>`).join('') : panelNote('还没有文件。把第一份放进来吧。'));

    $('#list').innerHTML = `
      ${annHTML}
      <div class="cols">
        <div>
          <div class="section-title">今天<span class="section-note">${evs === null ? '' : `${evs.length} 项日程`}</span></div>
          <div class="panel">${evBlock}</div>
          <div class="section-title">待办<span class="section-note">${openTodos === null ? '' : `${openTodos.length} 项待完成`}</span></div>
          <div class="panel">${todoBlock}</div>
        </div>
        <div>
          <div class="section-title">指派给我的任务<span class="section-note">${openTasks === null ? '' : `${openTasks.length} 项未完成`}</span></div>
          <div class="panel">${taskBlock}</div>
          <div class="section-title">最近项目</div>
          <div class="panel">${fileBlock}</div>
        </div>
      </div>`;

    $$('[data-retry]').forEach((b) => { b.onclick = () => loadNav(); });
    $$('[data-check]').forEach((b) => {
      b.onclick = async () => {
        try { await jpatch(`/api/team/todos/${b.dataset.check}`, { done: true }); toast('已完成。'); }
        catch (e) { toast(e.message, 'err'); }
        loadNav(); loadCounts();
      };
    });
    $$('[data-task]').forEach((b) => {
      b.onclick = async () => {
        const next = b.dataset.status === 'done' ? 'todo' : 'done';
        try {
          await jpatch(`/api/team/tasks/${b.dataset.task}`, { status: next });
          toast(next === 'done' ? '已完成，辛苦了。' : '已重新打开。');
        } catch (e) { toast(e.message, 'err'); }
        loadNav(); loadCounts();
      };
    });
    $$('[data-open]').forEach((r) => {
      r.onclick = () => { S.nav = 'shared'; $$('.nav-item').forEach((x) => x.classList.toggle('is-on', x.dataset.nav === 'shared')); loadNav(); };
    });
    if (annItems) wireAnnounce(annItems);
  }

  /* ===================== 仪表盘 ===================== */
  async function renderDashboard() {
    const d = await api('/api/team/dashboard');
    setHead('概览', '团队概况', []);
    const q = d.storage;
    const classOrder = ['public', 'internal', 'confidential', 'secret'];
    const classLabel = S.me.labels.classes;
    const maxKind = Math.max(1, ...d.kinds.map((k) => k.count));
    const maxContrib = Math.max(1, ...d.top_contributors.map((c) => c.count));
    $('#list').innerHTML = `
      ${announceBlock(d.announcements || [], !!d.can_announce)}
      <div class="stat-grid" style="margin-top:20px">
        <div class="stat"><div class="k">共享空间</div>
          <div class="v">${fmtSize(q.shared_used).split(' ')[0]}<span class="u">${fmtSize(q.shared_used).split(' ')[1] || ''}</span></div>
          <div class="s">共 ${fmtSize(q.shared_quota)} · ${q.files} 个文件</div></div>
        <div class="stat"><div class="k">我的任务</div>
          <div class="v">${d.tasks.mine_open}<span class="u">项未完成</span></div>
          <div class="s">${d.tasks.mine_overdue ? `${d.tasks.mine_overdue} 项已逾期` : '没有逾期'}</div></div>
        <div class="stat"><div class="k">待办</div>
          <div class="v">${d.todos.open}<span class="u">项待完成</span></div>
          <div class="s">今天完成 ${d.todos.done_today} 项</div></div>
        <div class="stat"><div class="k">近 30 天操作</div>
          <div class="v">${d.activity.last30}<span class="u">次</span></div>
          <div class="s">累计 ${d.activity.total} 次</div></div>
      </div>

      <div class="cols" style="margin-top:20px">
        <div>
          <div class="section-title">容量</div>
          <div class="panel panel-pad">
            <div class="bar-row"><span class="lb">共享空间</span>
              <div class="bar"><i style="transform:scaleX(${Math.min(1, q.shared_used / q.shared_quota)})"></i></div>
              <span class="vv">${fmtSize(q.shared_used)}</span></div>
            <div class="bar-row"><span class="lb">我的空间</span>
              <div class="bar"><i style="transform:scaleX(${Math.min(1, q.mine_used / q.mine_quota)})"></i></div>
              <span class="vv">${fmtSize(q.mine_used)}</span></div>
            <div class="bar-row"><span class="lb">回收站</span>
              <div class="bar"><i style="transform:scaleX(0)"></i></div>
              <span class="vv">${q.trash} 项</span></div>
          </div>

          <div class="section-title">文件密级</div>
          <div class="panel panel-pad">
            ${classOrder.map((k) => {
              const total = classOrder.reduce((s, x) => s + d.classes[x], 0) || 1;
              const v = d.classes[k];
              return `<div class="bar-row"><span class="lb">${esc(classLabel[k])}</span>
                <div class="bar"><i class="${k === 'secret' ? 'danger' : k === 'confidential' ? 'warn' : ''}" style="transform:scaleX(${v / total})"></i></div>
                <span class="vv">${v}</span></div>`;
            }).join('')}
          </div>

          <div class="section-title">文件类型</div>
          <div class="panel panel-pad">
            ${d.kinds.length ? d.kinds.map((k) => `<div class="bar-row"><span class="lb">${esc(k.label)}</span>
              <div class="bar"><i style="transform:scaleX(${k.count / maxKind})"></i></div>
              <span class="vv">${k.count}</span></div>`).join('')
              : '<div style="color:var(--text-3);font-size:12.5px">暂无文件。</div>'}
          </div>
        </div>

        <div>
          <div class="section-title">近 30 天贡献</div>
          <div class="panel">
            ${d.top_contributors.length ? d.top_contributors.map((c) => `
              <div class="day-ev">
                <span style="width:28px;flex:0 0 auto;color:var(--text-3)">${esc(initials(c.username))}</span>
                <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.username)}</span>
                <div class="bar" style="width:80px;flex:0 0 auto"><i style="transform:scaleX(${c.count / maxContrib})"></i></div>
                <span class="vv" style="width:34px">${c.count}</span>
              </div>`).join('') : '<div class="panel-pad" style="color:var(--text-3);font-size:12.5px">暂无数据。</div>'}
          </div>

          <div class="section-title">团队</div>
          <div class="panel panel-pad">
            <div class="bar-row"><span class="lb">成员</span><div class="bar"><i style="transform:scaleX(1)"></i></div><span class="vv">${d.members.total} 人</span></div>
            <div class="bar-row"><span class="lb">进行中任务</span>
              <div class="bar"><i class="warn" style="transform:scaleX(${d.tasks.team_open / Math.max(d.tasks.team_open, 1)})"></i></div>
              <span class="vv">${d.tasks.team_open}</span></div>
            <div class="bar-row"><span class="lb">我下发的</span>
              <div class="bar"><i style="transform:scaleX(${d.tasks.assigned_open / Math.max(d.tasks.assigned_open, 1)})"></i></div>
              <span class="vv">${d.tasks.assigned_open}</span></div>
          </div>

          <div class="section-title">最近动态</div>
          <div class="panel">
            ${d.recent_activity.length ? d.recent_activity.map((a) => `
              <div class="day-ev">
                <span style="width:52px;flex:0 0 auto;color:var(--text-3);font-size:11.5px">${fmtShort(a.created_at)}</span>
                <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  <b style="font-weight:500">${esc(a.username)}</b> ${esc(ACTION_LABEL[a.action] || a.action)}${a.file_name ? ` ${esc(a.file_name)}` : ''}</span>
              </div>`).join('') : '<div class="panel-pad" style="color:var(--text-3);font-size:12.5px">暂无动态。</div>'}
          </div>
        </div>
      </div>`;
    wireAnnounce(d.announcements || []);
  }

  /* ===================== 贡献日历 ===================== */
  async function renderContributions() {
    const days = S.contrib.days;
    const qs = new URLSearchParams({ days: String(days) });
    if (S.contrib.userId) qs.set('user_id', S.contrib.userId);
    const d = await api(`/api/team/contributions?${qs}`);
    const canSeeOthers = S.me.can_manage || S.me.role === 'core';
    let members = [];
    if (canSeeOthers) {
      try { members = (await api('/api/team/members')).items; } catch (e) { members = []; }
    }
    setHead('贡献日历', `${d.member.username} · 近 ${days} 天共 ${d.total} 次操作`, [
      canSeeOthers && members.length ? {
        label: d.member.username, icon: 'i-person', onClick: (e) => {
          openMenu(e.currentTarget, members.filter((m) => m.status === 'active').map((m) => ({
            label: m.username, check: (S.contrib.userId || S.me.user.id) === m.user_id,
            onClick: () => { S.contrib.userId = m.user_id === S.me.user.id ? '' : m.user_id; loadNav(); },
          })));
        },
      } : null,
      { label: days === 182 ? '近一年' : '近半年', icon: 'i-calendar', onClick: () => { S.contrib.days = days === 182 ? 365 : 182; loadNav(); } },
    ].filter(Boolean));

    const map = new Map(d.buckets.map((b) => [b.date, b.count]));
    const first = new Date(d.start * 1000);
    const last = new Date(d.end * 1000);
    const cells = [];
    const pad = (first.getDay() + 6) % 7; // 周一为一周起点
    for (let i = 0; i < pad; i++) cells.push('<i style="visibility:hidden"></i>');
    let streak = 0, best = 0;
    for (let t = new Date(first); t <= last; t.setDate(t.getDate() + 1)) {
      const key = ymd(t);
      const c = map.get(key) || 0;
      if (c > 0) { streak++; if (streak > best) best = streak; } else streak = 0;
      const lv = c === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((c / Math.max(1, d.max)) * 4)));
      cells.push(`<i${lv ? ` data-l="${lv}"` : ''} title="${key} · ${c} 次操作"></i>`);
    }
    const months = [];
    let lastMonth = -1;
    for (let t = new Date(first); t <= last; t.setDate(t.getDate() + 1)) {
      if (t.getDate() <= 7 && t.getMonth() !== lastMonth) { lastMonth = t.getMonth(); months.push(`${t.getMonth() + 1}月`); }
    }
    const maxAct = Math.max(1, ...d.by_action.map((a) => a.count));

    $('#list').innerHTML = `
      <div class="panel panel-pad">
        <div class="heat-wrap"><div class="heat">${cells.join('')}</div></div>
        <div class="heat-legend">
          <span style="margin-right:6px">${months.join(' · ')}</span>
          <span class="spacer" style="flex:1 1 auto"></span>
          少 <i></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i> 多
        </div>
      </div>
      <div class="cols" style="margin-top:16px">
        <div>
          <div class="section-title">概览</div>
          <div class="panel panel-pad">
            <div class="bar-row"><span class="lb">总操作</span><div class="bar"><i style="transform:scaleX(1)"></i></div><span class="vv">${d.total}</span></div>
            <div class="bar-row"><span class="lb">最长连续</span><div class="bar"><i style="transform:scaleX(${Math.min(1, best / Math.max(1, days / 4))})"></i></div><span class="vv">${best} 天</span></div>
            <div class="bar-row"><span class="lb">单日最多</span><div class="bar"><i class="warn" style="transform:scaleX(1)"></i></div><span class="vv">${d.max} 次</span></div>
          </div>
        </div>
        <div>
          <div class="section-title">操作类型</div>
          <div class="panel panel-pad">
            ${d.by_action.length ? d.by_action.map((a) => `<div class="bar-row"><span class="lb">${esc(ACTION_LABEL[a.action] || a.action)}</span>
              <div class="bar"><i style="transform:scaleX(${a.count / maxAct})"></i></div>
              <span class="vv">${a.count}</span></div>`).join('')
              : '<div style="color:var(--text-3);font-size:12.5px">暂无操作记录。</div>'}
          </div>
        </div>
      </div>`;
  }

  /* ===================== 工作任务 ===================== */
  async function renderTasks() {
    const d = await api(`/api/team/tasks?filter=${S.tasks.filter}`);
    S.tasks = { filter: S.tasks.filter, items: d.items, counts: d.counts };
    const canAssign = S.me.can_manage || S.me.role === 'core';
    setHead('任务', `${d.counts.mine} 项指派给我${d.counts.overdue ? `，${d.counts.overdue} 项已逾期` : ''}`,
      canAssign ? [{ label: '新建任务', icon: 'i-plus', primary: true, onClick: () => taskEditor(null) }] : []);

    const tabs = [['mine', '指派给我'], ['assigned', '我下发的'], ['done', '已完成']];
    if (canAssign) tabs.splice(2, 0, ['team', '全部']);
    const seg = el('div', 'seg-line');
    seg.innerHTML = tabs.map(([k, label]) =>
      `<button data-f="${k}" class="${S.tasks.filter === k ? 'is-on' : ''}">${esc(label)}${d.counts[k] ? ` ${d.counts[k]}` : ''}</button>`).join('');
    seg.appendChild(el('div', 'spacer'));
    const box = el('div');
    box.appendChild(seg);
    const panel = el('div', 'panel');
    if (!d.items.length) {
      panel.innerHTML = `<div class="empty" style="padding:56px 0">${icon('i-check-circle', 'icon icon-20')}<h3>还没有任务</h3>
        <p>${canAssign ? '派一件事出去，进度就有人跟了。' : '被指派给你的任务会出现在这里。'}</p></div>`;
    } else {
      d.items.forEach((t) => panel.appendChild(taskNode(t)));
    }
    box.appendChild(panel);
    $('#list').innerHTML = '';
    $('#list').appendChild(box);
    $$('[data-f]', seg).forEach((b) => { b.onclick = () => { S.tasks.filter = b.dataset.f; loadNav(); }; });
  }

  function taskNode(t) {
    const n = el('div', 'item' + (t.status === 'done' ? ' done' : ''));
    n.innerHTML = `
      <button class="check ${t.status === 'done' ? 'on' : ''}" data-t="${esc(t.id)}" aria-label="完成">${icon('i-check', 'icon')}</button>
      <div class="item-body">
        <div class="item-title">${esc(t.title)}</div>
        <div class="item-meta">
          ${t.priority ? `<span class="badge ${t.priority === 2 ? 'danger' : 'warn'}">${PRIORITY[t.priority]}</span>` : ''}
          <span>${esc(t.assignee_name || '未指派')}</span>
          ${t.creator_name ? `<span class="dot"></span><span>${esc(t.creator_name)} 下发</span>` : ''}
          ${t.due_at ? `<span class="dot"></span><span style="color:var(--${t.overdue ? 'danger' : 'text-3'})">${fmtDue(t.due_at)}</span>` : ''}
          ${t.status === 'doing' ? '<span class="dot"></span><span>进行中</span>' : ''}
          ${t.progress ? `<span class="dot"></span><span>进度 ${t.progress}%</span>` : ''}
          ${t.detail ? `<span class="dot"></span><span>${esc(t.detail.slice(0, 40))}</span>` : ''}
        </div>
        ${t.progress ? `<div class="tprog"><i style="width:${t.progress}%"></i></div>` : ''}
      </div>
      <div class="item-actions">
        <button class="pill-btn" data-edit="${esc(t.id)}">详情</button>
        <button class="icon-btn" data-more="${esc(t.id)}" aria-label="更多操作">${icon('i-more', 'icon icon-13')}</button>
      </div>`;
    const toggle = $('[data-t]', n);
    toggle.onclick = async () => {
      try {
        await jpatch(`/api/team/tasks/${t.id}`, { status: t.status === 'done' ? 'todo' : 'done' });
        toast(t.status === 'done' ? '已重新打开。' : '已完成，辛苦了。');
        loadNav(); loadCounts();
      } catch (e) { toast(e.message, 'err'); }
    };
    $('[data-edit]', n).onclick = () => taskDetail(t);
    $('[data-more]', n).onclick = (e) => openMenu(e.currentTarget, [
      { label: '详情与进展', icon: 'i-chart', onClick: () => taskDetail(t) },
      { label: '编辑任务', icon: 'i-pencil', onClick: () => taskEditor(t) },
      { label: t.status === 'doing' ? '标记为待开始' : '标记为进行中', icon: 'i-swap', disabled: !t.can_edit && !t.mine, onClick: async () => {
        try {
          await jpatch(`/api/team/tasks/${t.id}`, { status: t.status === 'doing' ? 'todo' : 'doing' });
          toast('状态已更新'); loadNav();
        } catch (err) { toast(err.message, 'err'); }
      } },
      { sep: true },
      { label: '删除任务', icon: 'i-trash', danger: true, disabled: !t.can_delete, onClick: () => sheet({
        title: `删除「${t.title}」`, desc: '任务会被删除，相关讨论仍然保留。', danger: true, okText: '删除',
        onOk: async () => {
          try {
            await api(`/api/team/tasks/${t.id}`, { method: 'DELETE' });
            toast('任务已删除'); loadNav(); loadCounts();
          } catch (err) { toast(err.message, 'err'); }
        },
      }) },
    ]);
    return n;
  }

  /* ===================== 任务详情与进展时间线 ===================== */
  function timelineHTML(items) {
    if (!items.length) return '<div class="tl-empty">还没有进展记录。</div>';
    return items.map((u) => `
      <div class="tl-row${u.source === 'ai' ? ' is-ai' : ''}">
        <span class="tl-ico">${icon(u.source === 'ai' ? 'i-key' : 'i-pencil', 'icon icon-13')}</span>
        <div class="tl-body">
          <div class="tl-head">
            <b>${esc(u.source === 'ai' ? `${u.user_name} 的 AI${u.agent ? `（${u.agent}）` : ''}` : u.user_name)}</b>
            <span>${fmtDate(u.created_at)}</span>
          </div>
          ${(u.progress >= 0 || u.status) ? `<div class="tl-flags">
            ${u.status ? `<span class="badge">${esc(TASK_STATUS[u.status] || u.status)}</span>` : ''}
            ${u.progress >= 0 ? `<span class="badge">进度 ${u.progress}%</span>` : ''}
          </div>` : ''}
          ${u.body ? `<div class="tl-text">${esc(u.body)}</div>` : ''}
        </div>
      </div>`).join('');
  }

  async function taskDetail(t) {
    const d = await api(`/api/team/tasks/${t.id}/updates`);
    const task = d.task || t;
    const canReport = S.me.can_write;
    openSheet(`
      <h3>${esc(task.title)}</h3>
      <div class="td-meta">
        <span class="badge ${task.status === 'doing' ? 'warn' : ''}">${esc(TASK_STATUS[task.status] || task.status)}</span>
        <span>${esc(task.assignee_name || '未指派')}</span>
        ${task.creator_name ? `<span class="dot"></span><span>${esc(task.creator_name)} 下发</span>` : ''}
        ${task.due_at ? `<span class="dot"></span><span style="color:var(--${task.overdue ? 'danger' : 'text-3'})">${fmtDue(task.due_at)}</span>` : ''}
      </div>
      ${task.detail ? `<p class="td-detail">${esc(task.detail)}</p>` : ''}
      ${task.file_id ? `<div style="margin:0 0 12px"><button class="chip-link" id="tdFile">${icon('i-doc', 'icon icon-13')}<span>${esc(task.file_name || '关联文件')}</span></button></div>` : ''}
      <div class="td-prog">
        <div class="td-prog-head"><span>进度</span><b>${task.progress}%</b></div>
        <div class="tprog big"><i style="width:${task.progress}%"></i></div>
      </div>
      ${canReport ? `
        <label class="lbl">补充进展</label>
        <textarea class="field area" id="tdBody" placeholder="做了什么、结果如何"></textarea>
        <div class="field-row">
          <div style="flex:1 1 0;text-align:left">
            <label class="lbl">进度</label>
            <input class="field" id="tdProgress" type="number" min="0" max="100" value="${task.progress}">
          </div>
          <div style="flex:1 1 0;text-align:left">
            <label class="lbl">状态</label>
            <select class="field" id="tdStatus">
              <option value="">不改变</option>
              ${Object.keys(TASK_STATUS).map((k) => `<option value="${k}" ${task.status === k ? 'selected' : ''}>${TASK_STATUS[k]}</option>`).join('')}
            </select>
          </div>
        </div>` : ''}
      <label class="lbl">进展记录<span id="tdCount">${d.items.length ? `（${d.items.length} 条）` : ''}</span></label>
      <div class="timeline" id="tdLine">${timelineHTML(d.items || [])}</div>
      <div class="sheet-actions">
        <button class="btn" id="tdEdit">编辑任务</button>
        ${canReport ? '<button class="btn btn-primary" id="tdAdd">汇报进展</button>' : ''}
      </div>`, (box) => {
      $('#tdEdit', box).onclick = () => { closeSheet(); taskEditor(task); };
      const tf = $('#tdFile', box);
      if (tf) tf.onclick = () => { closeSheet(); openFileById(task.file_id); };
      // 输入框预填的是打开弹层时的值，只有用户真改过才提交；
      // 否则「只想补一句话」会把打开时的旧进度、旧状态原样写回任务
      let shownProg = String(task.progress);
      let shownStatus = task.status;
      let touched = false;
      const pgEl = $('#tdProgress', box);
      const stEl = $('#tdStatus', box);
      if (pgEl) pgEl.oninput = () => { touched = true; };
      if (stEl) stEl.onchange = () => { touched = true; };
      // 边看边刷新：SSE 推来 tasks 事件时立刻拉一次，另有 15 秒兜底
      const pullUpdates = async () => {
        try {
          const nd = await api(`/api/team/tasks/${task.id}/updates`);
          const list = nd.items || [];
          const line = $('#tdLine', box);
          if (!line) return;
          const t2 = nd.task || {};
          line.innerHTML = timelineHTML(list);
          const c = $('#tdCount', box);
          if (c) c.textContent = list.length ? `（${list.length} 条）` : '';
          const h = $('.td-prog-head b', box);
          if (h) h.textContent = `${t2.progress || 0}%`;
          const bar = $('.td-prog .tprog i', box);
          if (bar) bar.style.width = `${t2.progress || 0}%`;
          // 用户没动过表单时，把控件同步到最新值，避免显示与任务实际不符
          if (!touched) {
            shownProg = String(t2.progress || 0);
            shownStatus = t2.status || 'todo';
            if (pgEl) pgEl.value = shownProg;
            if (stEl) stEl.value = shownStatus;
          }
        } catch (e) { /* 刷新失败静默跳过 */ }
      };
      S.pullTaskUpdates = pullUpdates;
      sheetTimer = setInterval(pullUpdates, 15000);
      const add = $('#tdAdd', box);
      if (!add) return;
      add.onclick = async () => {
        const body = $('#tdBody', box).value.trim();
        const payload = {};
        if (body) payload.body = body;
        if (pgEl && pgEl.value !== '' && String(pgEl.value) !== shownProg) payload.progress = Number(pgEl.value);
        if (stEl && stEl.value && stEl.value !== shownStatus) payload.status = stEl.value;
        if (!body && payload.progress === undefined && payload.status === undefined) {
          toast('请填写进展，或调整进度与状态', 'err'); return;
        }
        try {
          await jpost(`/api/team/tasks/${task.id}/updates`, payload);
          toast('进展已记录');
          closeSheet();
          if (S.nav === 'tasks') await renderTasks(); else await loadNav();
          loadCounts();
        } catch (e) { toast(e.message, 'err'); }
      };
    }, { wide: true });
  }

  async function taskEditor(t, link) {
    const canAssign = S.me.can_manage || S.me.role === 'core';
    // 关联文件：编辑已有任务时沿用原值，从文件页新建时带上那个文件
    let fileId = (t && t.file_id) || (link && link.id) || '';
    let fileName = (t && t.file_name) || (link && link.name) || '';
    // 每次都取最新的成员列表：此前 S.members 初值为 [] 导致这里永远不请求，负责人下拉是空的
    if (canAssign) {
      try { S.members = (await api('/api/team/members')).items; } catch (e) { S.members = S.members || []; }
    }
    const members = S.members || [];
    const due = t && t.due_at ? new Date(t.due_at * 1000) : null;
    const dueVal = due ? `${due.getFullYear()}-${p2(due.getMonth() + 1)}-${p2(due.getDate())}T${p2(due.getHours())}:${p2(due.getMinutes())}` : '';
    const fields = `
      <label class="lbl">说明</label>
      <textarea class="field area" id="tDetail" placeholder="可选">${t ? esc(t.detail || '') : ''}</textarea>
      ${canAssign ? `<label class="lbl">负责人</label>
        <select class="field" id="tAssignee">
          <option value="">未指派</option>
          ${members.filter((m) => m.status === 'active').map((m) => `<option value="${esc(m.user_id)}" ${(t ? t.assignee_id === m.user_id : m.user_id === S.me.user.id) ? 'selected' : ''}>${esc(m.username)}</option>`).join('')}
        </select>` : ''}
      <div class="field-row">
        <div style="flex:1 1 0;text-align:left">
          <label class="lbl">优先级</label>
          <select class="field" id="tPriority">
            ${[0, 1, 2].map((p) => `<option value="${p}" ${t && t.priority === p ? 'selected' : ''}>${PRIORITY[p]}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1.3 1 0;text-align:left">
          <label class="lbl">截止</label>
          <input class="field" id="tDue" type="datetime-local" value="${dueVal}">
        </div>
      </div>
      <div id="tFileRow">${fileName ? `<label class="lbl">关联文件</label>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <button class="chip-link" type="button" id="tFileOpen">${icon('i-doc', 'icon icon-13')}<span>${esc(fileName)}</span></button>
          <button class="pill-btn" type="button" id="tFileClear">移除关联</button>
        </div>` : ''}</div>`;
    sheet({
      title: t ? '任务详情' : '新建任务',
      input: true, value: t ? t.title : '', placeholder: '要做什么',
      fields, okText: t ? '存储' : '下发',
      onOk: async (title, box) => {
        const v = (title || '').trim();
        if (t) {
          if (v && v !== t.title) await jpatch(`/api/team/tasks/${t.id}`, { title: v });
        } else if (!v) { toast('任务标题不能为空', 'err'); return false; }
        const body = {
          detail: $('#tDetail', box) ? $('#tDetail', box).value.trim() : '',
          priority: parseInt($('#tPriority', box).value, 10) || 0,
          due_at: $('#tDue', box).value ? Math.floor(new Date($('#tDue', box).value).getTime() / 1000) : 0,
        };
        // 只在关联真的变了的时候提交，避免把已有任务的文件关联抹掉
        if (fileId !== ((t && t.file_id) || '')) body.file_id = fileId;
        const asg = $('#tAssignee', box);
        // 直接提交成员 id：服务端优先按 id 解析，避免用户名改名后指派失效
        if (asg) body.assignee = asg.value || '';
        if (t) await jpatch(`/api/team/tasks/${t.id}`, body);
        else await jpost('/api/team/tasks', { title: v, ...body });
        // 新建后切到「我下发的」：指派给他人的任务在「指派给我」里看不到
        if (!t) S.tasks.filter = 'assigned';
        toast(t ? '已保存' : '任务已下发，相关人员会收到通知。');
        loadNav(); loadCounts();
      },
    });
    const clr = $('#tFileClear');
    if (clr) clr.onclick = () => {
      fileId = '';
      const row = $('#tFileRow');
      if (row) row.innerHTML = '<p style="color:var(--text-3);font-size:12px;margin:2px 0 0">已取消关联。</p>';
    };
    const op = $('#tFileOpen');
    if (op) op.onclick = () => { closeSheet(); openFileById(fileId); };
  }

  /* ===================== 任务看板 ===================== */
  const BOARD_COLS = [
    { k: 'todo',  t: 'To do' },
    { k: 'doing', t: 'Doing' },
    { k: 'done',  t: 'Done' },
  ];
  const boardLabel = (st) => (BOARD_COLS.find((c) => c.k === st) || BOARD_COLS[0]).t;

  async function renderBoard() {
    const canSeeAll = S.me.can_manage || S.me.role === 'core';
    const flt = (canSeeAll && S.boardAll) ? 'team' : 'mine';
    const d = await api(`/api/team/tasks?filter=${flt}`);
    const head = flt === 'team' ? '全团队任务，按状态分栏' : '指派给我的任务，按状态分栏';
    setHead('看板', head, canSeeAll
      ? [{ label: '新建任务', icon: 'i-plus', primary: true, onClick: () => taskEditor(null) }] : []);

    const box = el('div');
    if (canSeeAll) {
      const seg = el('div', 'seg-line');
      seg.innerHTML = `<button data-b="mine" class="${flt === 'mine' ? 'is-on' : ''}">指派给我</button>
        <button data-b="team" class="${flt === 'team' ? 'is-on' : ''}">全团队</button>`;
      box.appendChild(seg);
      $$('[data-b]', seg).forEach((b) => { b.onclick = () => { S.boardAll = b.dataset.b === 'team'; loadNav(); }; });
    }
    const board = el('div', 'board');
    BOARD_COLS.forEach((c) => {
      const col = el('div', 'board-col');
      col.dataset.status = c.k;
      col.setAttribute('role', 'list');
      col.setAttribute('aria-label', `${c.t}（${d.items.filter((t) => (t.status || 'todo') === c.k).length} 项）`);
      const items = d.items.filter((t) => (t.status || 'todo') === c.k);
      col.innerHTML = `<div class="board-col-head"><span class="t">${c.t}</span><span class="c">${items.length}</span></div>`;
      if (items.length) items.forEach((t) => col.appendChild(boardCard(t)));
      else col.appendChild(el('div', 'board-empty', '此栏为空'));
      board.appendChild(col);
    });
    box.appendChild(board);
    $('#list').innerHTML = '';
    $('#list').appendChild(box);
  }

  function boardCard(t) {
    const n = el('div', 'board-card' + (t.status === 'done' ? ' done' : ''));
    n.dataset.id = t.id;
    n._task = t;
    n.tabIndex = 0;                    // 卡片进入 Tab 顺序，键盘也能读到/打开任务
    // 卡片里嵌着「移动」按钮，所以不能声明 role=button（交互元素不可嵌套），
    // 用 listitem + 回车快捷键来表达「可打开」
    n.setAttribute('role', 'listitem');
    n.setAttribute('aria-keyshortcuts', 'Enter');
    n.setAttribute('aria-label', `任务：${t.title}，状态 ${boardLabel(t.status || 'todo')}`);
    n.onpointerdown = boardPointerDown;
    n.innerHTML = `
      <div class="bc-title">${esc(t.title)}</div>
      <div class="bc-meta">
        ${t.priority ? `<span class="badge ${t.priority === 2 ? 'danger' : 'warn'}">${PRIORITY[t.priority]}</span>` : ''}
        <span>${esc(t.assignee_name || '未指派')}</span>
        ${t.due_at ? `<span style="color:var(--${t.overdue ? 'danger' : 'text-4'})">${fmtDue(t.due_at)}</span>` : ''}
        ${t.progress ? `<span>${t.progress}%</span>` : ''}
        ${t.file_name ? `<span>${icon('i-doc', 'icon icon-13')}${esc(t.file_name)}</span>` : ''}
        <span style="flex:1 1 auto"></span>
        <button class="pill-btn" data-move="1">移动</button>
      </div>
      ${t.progress ? `<div class="tprog"><i style="width:${t.progress}%"></i></div>` : ''}`;
    n.onkeydown = (e) => {
      // 空格会让按钮重复触发，所以只在卡片本身有焦点时接管
      if (e.target !== n) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); taskDetail(t); }
    };
    n.onclick = (e) => {
      // 刚拖完的那一次 click 要吞掉，否则一松手就顺手把详情弹开了
      if (BOARD_DRAG.suppressClick) { BOARD_DRAG.suppressClick = false; return; }
      if (e.target.closest('[data-move]')) return;
      taskDetail(t);
    };
    $('[data-move]', n).onclick = (e) => {
      e.stopPropagation();
      openMenu(e.currentTarget, BOARD_COLS.map((c) => ({
        label: c.t, icon: 'i-swap', check: (t.status || 'todo') === c.k, disabled: (t.status || 'todo') === c.k,
        onClick: () => moveTask(t, c.k),
      })).concat([{ sep: true }, { label: '打开详情', icon: 'i-chart', onClick: () => taskDetail(t) }]));
    };
    return n;
  }

  /* ===================== 看板拖拽：1:1 跟手 + 动量落列 =====================
     指针按下即「武装」，走够 5px 才真正拎起来：这样单击还是单击。
     拎起后复制一张浮卡贴着指针走（原卡留成淡痕），松手时用松手速度做动量投影，
     飞到哪一栏就落在哪一栏；落定后再乐观地把真实卡片挪过去，随即后台 PATCH。
     触屏上纵向手势要留给页面滚动，故仍走卡片上的「移动」菜单兜底。 */
  const BOARD_DRAG = { t: null, card: null, float: null, pid: 0, armed: false, active: false,
                       suppressClick: false, sx: 0, sy: 0, ox: 0, oy: 0, w: 0, h: 0,
                       dx: 0, dy: 0, px: 0, py: 0, colFrom: null, colTo: null, raf: 0, tracker: null };

  function boardIsHorizontal() {
    const cols = $$('.board-col');
    if (cols.length < 2) return true;
    const a = cols[0].getBoundingClientRect(), b = cols[1].getBoundingClientRect();
    return Math.abs(a.top - b.top) < 24;   // 顶边齐 => 并排；错开 => 纵向堆叠
  }
  // 离哪个栏最近就归哪栏：并排时由 x 决定，堆叠时由 y 决定
  function boardColumnAt(px, py) {
    let best = null, bestD = Infinity;
    $$('.board-col').forEach((c) => {
      const r = c.getBoundingClientRect();
      const dx = px < r.left ? r.left - px : (px > r.right ? px - r.right : 0);
      const dy = py < r.top ? r.top - py : (py > r.bottom ? py - r.bottom : 0);
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  }
  function boardPointerDown(e) {
    const card = e.currentTarget;
    if (!card._task || (e.target.closest && e.target.closest('[data-move]'))) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const d = BOARD_DRAG;
    d.t = card._task; d.card = card; d.pid = e.pointerId;
    d.armed = true; d.active = false; d.suppressClick = false;
    d.sx = e.clientX; d.sy = e.clientY;
    const r = card.getBoundingClientRect();
    d.ox = r.left; d.oy = r.top; d.w = r.width; d.h = r.height;
    d.colFrom = card.closest('.board-col'); d.colTo = null;
    d.tracker = tracker(); d.tracker.push(performance.now(), e.clientX, e.clientY);
  }
  function boardDragBegin() {
    const d = BOARD_DRAG;
    d.active = true;
    d.card.classList.add('is-origin');
    const f = d.card.cloneNode(true);
    f.classList.remove('is-origin');
    f.classList.add('board-float');
    f.style.width = d.w + 'px';
    f.style.left = d.ox + 'px';
    f.style.top = d.oy + 'px';
    f.style.transform = 'translate3d(0, 0, 0) scale(1.02)';
    document.body.appendChild(f);
    d.float = f;
    document.body.classList.add('is-board-drag');
    try { d.card.setPointerCapture(d.pid); } catch (_) {}
  }
  function boardPaint() {
    const d = BOARD_DRAG;
    if (!d.float) return;
    d.float.style.transform = `translate3d(${d.dx}px, ${d.dy}px, 0) scale(1.02)`;
    const col = boardColumnAt(d.px, d.py);
    if (col !== d.colTo) {
      if (d.colTo) d.colTo.classList.remove('is-over');
      d.colTo = col;
      if (col && col !== d.colFrom) col.classList.add('is-over');
    }
  }
  function boardClear() {
    const d = BOARD_DRAG;
    if (d.float) { d.float.remove(); d.float = null; }
    if (d.card) d.card.classList.remove('is-origin');
    if (d.colTo) d.colTo.classList.remove('is-over');
    if (d.colFrom) d.colFrom.classList.remove('is-over');
    document.body.classList.remove('is-board-drag');
    if (d.raf) { cancelAnimationFrame(d.raf); d.raf = 0; }
    d.t = null; d.card = null; d.armed = false; d.active = false; d.colFrom = null; d.colTo = null;
  }
  // 两轴各一条弹簧，互不干扰（一条 2D 弹簧会在两轴速度不同时「走样」）
  function boardFlyTo(tx, ty, fx, fy, vx, vy, onDone) {
    let cx = fx, cy = fy, pending = 2;
    const paint = () => { if (BOARD_DRAG.float) BOARD_DRAG.float.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(1)`; };
    const done = () => { if (--pending === 0) onDone(); };
    springTo({ from: fx, to: tx, velocity: vx, response: 0.3, damping: 0.9, onFrame: (x) => { cx = x; paint(); }, onDone: done });
    springTo({ from: fy, to: ty, velocity: vy, response: 0.3, damping: 0.9, onFrame: (y) => { cy = y; paint(); }, onDone: done });
  }
  function boardBump(col, delta) {
    if (!col) return;
    const c = col.querySelector('.board-col-head .c');
    if (c) c.textContent = String(Math.max(0, (parseInt(c.textContent, 10) || 0) + delta));
    if (delta < 0 && !col.querySelector('.board-card') && !col.querySelector('.board-empty')) {
      col.appendChild(el('div', 'board-empty', '此栏为空'));
    }
  }
  function boardCommit(target) {
    const d = BOARD_DRAG;
    const card = d.card, t = d.t, from = d.colFrom;
    if (d.float) { d.float.remove(); d.float = null; }
    card.classList.remove('is-origin');
    document.body.classList.remove('is-board-drag');
    const status = target.dataset.status;
    const empty = target.querySelector('.board-empty');
    if (empty) empty.remove();
    const firstCard = target.querySelector('.board-card');
    target.insertBefore(card, firstCard || null);   // 落在该栏顶端——正是浮卡停住的位置
    boardBump(from, -1); boardBump(target, 1);
    d.t = null; d.card = null; d.armed = false; d.active = false; d.colFrom = null; d.colTo = null;
    if (t.status !== status) { t.status = status; moveTask(t, status, { silent: true }); }
  }
  document.addEventListener('pointermove', (e) => {
    const d = BOARD_DRAG;
    if (!d.armed || e.pointerId !== d.pid) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.active) {
      if (Math.hypot(dx, dy) < 5) { d.tracker.push(performance.now(), e.clientX, e.clientY); return; }
      boardDragBegin();
    }
    d.tracker.push(performance.now(), e.clientX, e.clientY);
    d.dx = dx; d.dy = dy; d.px = e.clientX; d.py = e.clientY;
    if (!d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; boardPaint(); });
  });
  function boardPointerUp(e) {
    const d = BOARD_DRAG;
    if (!d.armed || e.pointerId !== d.pid) return;
    d.armed = false;
    if (!d.active) return;                 // 没拎起来：交给 click
    d.active = false;
    d.suppressClick = true;
    try { d.card.releasePointerCapture(d.pid); } catch (_) {}
    d.tracker.push(performance.now(), e.clientX, e.clientY);
    const v = d.tracker.velocity();
    const horiz = boardIsHorizontal();
    // 动量投影：松手瞬间往哪飞、飞多远，决定归哪一栏
    const tx = d.px + (horiz ? projectMomentum(v.x) : 0);
    const ty = d.py + (horiz ? 0 : projectMomentum(v.y));
    const target = boardColumnAt(tx, ty) || d.colFrom;
    if (d.colTo) d.colTo.classList.remove('is-over');
    d.colTo = null;
    if (target && target !== d.colFrom) {
      const head = target.querySelector('.board-col-head');
      const first = target.querySelector('.board-card:not(.is-origin)');
      const tr = (first || head).getBoundingClientRect();
      boardFlyTo(tr.left - d.ox, (first ? tr.top : tr.bottom + 8) - d.oy, d.dx, d.dy, v.x, v.y, () => boardCommit(target));
    } else {
      boardFlyTo(0, 0, d.dx, d.dy, v.x, v.y, () => boardClear());
    }
  }
  document.addEventListener('pointerup', boardPointerUp);
  document.addEventListener('pointercancel', (e) => { if (BOARD_DRAG.armed) { BOARD_DRAG.armed = false; if (BOARD_DRAG.active) { BOARD_DRAG.active = false; boardClear(); } } });

  async function moveTask(t, status, opts) {
    try {
      await jpatch(`/api/team/tasks/${t.id}`, { status });
      toast(status === 'done' ? '已完成，辛苦了。' : `已移到${TASK_STATUS[status]}`);
      // 从看板拖过去的：DOM 已乐观落位，别再整栏重绘，免得落点又跳一下
      if (opts && opts.silent) { loadCounts(); return; }
      await loadNav();
      loadCounts();
    } catch (e) {
      toast(e.message, 'err');
      if (opts && opts.silent) await loadNav();   // 失败就按服务端回滚整栏
    }
  }

  /* ===================== 通知中心 ===================== */
  async function renderInbox() {
    const d = await api('/api/team/inbox');
    const items = d.items || [];
    const acts = [];
    if (d.unread) acts.push({
      label: '全部标为已读', icon: 'i-check', onClick: async () => {
        await jpost('/api/team/inbox/read', {});
        toast('已全部标为已读');
        loadNav(); loadCounts();
      },
    });
    if (items.length) acts.push({
      label: '清空', icon: 'i-trash', onClick: () => sheet({
        title: '清空通知', desc: '通知记录会被删除，任务与文件不受影响。',
        danger: true, okText: '清空',
        onOk: async () => {
          await api('/api/team/inbox', { method: 'DELETE' });
          toast('通知已清空');
          loadNav(); loadCounts();
        },
      }),
    });
    setHead('通知', d.unread ? `${d.unread} 条未读` : '全部已读', acts);
    const box = el('div');
    const panel = el('div', 'panel');
    if (!items.length) {
      panel.innerHTML = `<div class="empty" style="padding:52px 0">${icon('i-inbox', 'icon icon-20')}<h3>暂时没有新消息</h3>
        <p>有人 @ 你、回复你，或给你安排任务时，会出现在这里。</p></div>`;
    } else {
      items.forEach((n) => panel.appendChild(inboxRow(n)));
    }
    box.appendChild(panel);
    $('#list').innerHTML = '';
    $('#list').appendChild(box);
  }

  function inboxRow(n) {
    const link = n.link || '';
    const r = el('div', 'ib-row' + (n.read ? '' : ' is-unread') + (link ? ' is-link' : ''));
    r.innerHTML = `
      <span class="ib-flag${n.read ? ' read' : ''}"></span>
      <div class="ib-body">
        <div class="ib-text">${esc(n.text)}</div>
        <div class="ib-foot">
          <span>${fmtDate(n.created_at)}</span>
          ${link ? '<button class="go" type="button">打开</button>' : ''}
        </div>
      </div>`;
    const act = async () => {
      if (!n.read) {
        try { await jpost('/api/team/inbox/read', { id: n.id }); } catch (e) { /* 已读失败不阻塞跳转 */ }
        n.read = 1;
        r.classList.remove('is-unread');
        $('.ib-flag', r).classList.add('read');
        loadCounts();
      }
      if (link) openLink(link);
    };
    r.onclick = act;
    const go = $('.go', r);
    // 整行可点只图方便，键盘与读屏走这个真实按钮
    if (go) go.onclick = (e) => { e.stopPropagation(); act(); };
    return r;
  }

  // 通知里的落点：task/<id> 或 file/<id>（可再带一个 tab，如 file/<id>/comments）
  async function openLink(link) {
    const [kind, id, tab] = String(link || '').split('/');
    if (kind === 'task' && id) {
      try {
        const d = await api(`/api/team/tasks/${id}/updates`);
        taskDetail(d.task || { id });
      } catch (e) { toast('任务已不存在', 'err'); }
      return;
    }
    if (kind === 'file' && id) openFileById(id, tab);
  }

  // 按 id 定位文件：先问服务端它属于哪个空间、哪个目录，再切过去选中
  async function openFileById(fid, tab) {
    let f;
    try { f = await api(`/api/team/file/${fid}`); }
    catch (e) { toast('文件已不存在', 'err'); return; }
    switchNav(f.scope === 'personal' ? 'personal' : 'shared');
    S.folder = f.parent_id || '';
    await loadNav();
    const it = S.items.find((x) => x.id === fid);
    if (it) selectItem(it, false, tab);
    else toast('文件不在当前目录', 'err');
  }

  /* ===================== 存储 ===================== */
  const TYPE_LABEL = { image: '图片', video: '视频', audio: '音频', doc: '文档', code: '代码', archive: '压缩包', other: '其他' };

  async function renderStorage() {
    const d = await api('/api/team/storage');
    const byType = (d.by_type || []).filter((x) => x.bytes > 0);
    const total = byType.reduce((s, x) => s + x.bytes, 0);
    setHead('存储', total ? `${fmtSize(total)}，按类型分布` : '还没有文件', []);
    const box = el('div');
    const legend = byType.map((x) => `<span class="li"><i class="sw" style="background:var(--t-${x.key})"></i>${TYPE_LABEL[x.key] || x.key}
      <span class="n">${fmtSize(x.bytes)} · ${x.files}</span></span>`).join('');
    const seg = byType.map((x) => `<i style="width:${(x.bytes / total * 100).toFixed(2)}%;background:var(--t-${x.key})"></i>`).join('');
    box.innerHTML = `
      <div class="st-total">
        <div class="stat"><div class="k">共享空间占用</div><div class="v">${fmtSize(d.shared.used)}</div>
          <div class="k" style="margin-top:2px">上限 ${fmtSize(d.shared.quota)} · ${d.shared.files} 个文件</div></div>
        <div class="stat"><div class="k">我的空间占用</div><div class="v">${fmtSize(d.mine.used)}</div>
          <div class="k" style="margin-top:2px">上限 ${fmtSize(d.mine.quota)}</div></div>
        <div class="stat"><div class="k">成员个人空间合计</div><div class="v">${fmtSize(d.personal.used)}</div>
          <div class="k" style="margin-top:2px">${d.personal.members} 位成员</div></div>
      </div>
      <div class="section-title">按类型<span class="section-note">${byType.length ? '仅统计你可读的文件' : '暂无数据'}</span></div>
      <div class="panel panel-pad">
        ${byType.length ? `<div class="st-bar">${seg}</div><div class="st-legend">${legend}</div>`
          : `<div style="color:var(--text-3);font-size:12.5px">还没有可统计的文件。</div>`}
      </div>
      <div class="section-title">按成员<span class="section-note">个人空间占用，从高到低</span></div>
      <div class="panel panel-pad" id="stMembers"></div>`;
    $('#list').innerHTML = '';
    $('#list').appendChild(box);

    let names = {};
    try {
      const ms = (S.members && S.members.length) ? S.members : (await api('/api/team/members')).items;
      S.members = ms;
      ms.forEach((m) => { names[m.user_id] = m.username; });
    } catch (e) { /* 名字取不到就退回 user_id */ }
    const host = $('#stMembers', box);
    const quota = d.mine.quota;
    const maxUsed = Math.max(1, ...(d.per_member || []).map((m) => m.used));
    if (!(d.per_member || []).length) {
      host.innerHTML = '<div style="color:var(--text-3);font-size:12.5px">还没有成员数据。</div>';
    } else {
      d.per_member.forEach((m) => {
        const row = el('div', 'bar-row');
        row.innerHTML = `<span class="lb">${esc(names[m.user_id] || m.user_id)}</span>
          <div class="bar"><i style="transform:scaleX(${(m.used / maxUsed).toFixed(3)})"></i></div>
          <span class="vv">${fmtSize(m.used)}</span>`;
        host.appendChild(row);
      });
      host.insertAdjacentHTML('beforeend',
        `<p style="color:var(--text-4);font-size:11.5px;margin:10px 0 0">每人上限 ${fmtSize(quota)}，条形按占用最高的成员等比换算。</p>`);
    }
  }


  /* ===================== AI 接入 ===================== */
  const AI_TOOLS = [
    { k: 'generic', name: '通用', lead: '' },
    { k: 'traecode', name: 'TraeCode', lead: '你在 TraeCode 里工作。' },
    { k: 'claude', name: 'Claude Code', lead: '你在 Claude Code 里工作。' },
    { k: 'doubao', name: '豆包', lead: '你在豆包里工作。' },
  ];

  // 给成员白嫖算力用：都是「注册即得、不用绑卡」的服务商。
  // 版本与额度过期快，只写不会变的接入形态，具体数字留给官方控制台。
  const FREE_PROVIDERS = [
    {
      name: '英伟达 NVIDIA NIM',
      site: 'https://build.nvidia.com',
      base: 'https://integrate.api.nvidia.com/v1',
      note: '注册并验证手机号即可领 Key，不用绑卡。模型页上标了 free endpoint 的都能白用，有每分钟请求数限制，排队比主流模型轻。',
    },
    {
      name: 'Agnes 2.5 Flash',
      site: 'https://platform.agnes-ai.com',
      base: 'https://apihub.agnes-ai.com/v1',
      model: 'agnes-2.5-flash',
      note: '文本模型长期免费，只受每分钟请求数限制，适合写代码和多步任务。除了 OpenAI 格式，它也提供 Anthropic 格式接口，用 Claude Code 的可以把地址指过来。',
    },
    {
      name: 'Google Gemini 2.5 Flash',
      site: 'https://aistudio.google.com/app/apikey',
      base: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.5-flash',
      note: '免费层长期有效，不用绑卡，但每天和每分钟都有次数上限；免费层的请求内容可能被用于产品改进，别丢敏感资料进去。',
    },
    {
      name: '智谱 GLM Flash',
      site: 'https://open.bigmodel.cn/usercenter/apikeys',
      base: 'https://open.bigmodel.cn/api/paas/v4',
      note: 'Flash 系列长期免费，并发较低，日常问答和轻量任务是够的。',
    },
  ];

  // 复制给 AI 工具粘贴的最小配置
  function freeConfigText(p) {
    return [`Base URL  ${p.base}`, p.model ? `模型      ${p.model}` : '模型      在控制台里挑带 free 标记的']
      .join('\n');
  }

  // 给成员复制给 AI 用的提示词；token 传 <你的令牌> 即为模板
  function aiPromptText(token, tool) {
    const base = location.origin;
    const t = AI_TOOLS.find((x) => x.k === tool) || AI_TOOLS[0];
    const lines = [
      '你是我的工作助手，需要把工作进度同步到团队空间「翱翔鸟 Team」。',
      '',
      `接口地址：${base}`,
      `访问令牌：${token}`,
      `每个请求都要带请求头：Authorization: Bearer ${token}`,
      '',
      '可用接口：',
      `1) GET  ${base}/api/ai/ping                  自检令牌是否有效，先跑这个`,
      `2) GET  ${base}/api/ai/tasks?filter=mine     列出指派给我的任务，拿到 id / status / progress`,
      `3) GET  ${base}/api/ai/tasks/<任务id>         查看任务详情与已有进展`,
      `4) POST ${base}/api/ai/tasks/<任务id>/report  汇报进展，请求体是 JSON：`,
      '   { "body": "这一步做了什么、结果如何", "progress": 0-100, "status": "todo|doing|done" }',
      '   三个字段都可以不带，但一次至少要带一个；任务做完请把 status 置为 done。',
      '',
      '要求：',
      '- 开工前先调接口 2 拿到真实的任务 id，不要凭标题猜。',
      '- 每完成一个可验证的阶段性结果就汇报一次；body 写清楚做了什么、结果如何。',
      '- progress 如实填写，不要一直填 100。',
      '- 全部完成后用 status=done 汇报一次收尾结论。',
    ];
    if (t.lead) lines.splice(1, 0, t.lead);
    return lines.join('\n');
  }

  // 独立的接口清单，收进折叠区，避免和提示词抢注意力
  function aiApiText() {
    const base = location.origin;
    return [
      `GET  ${base}/api/ai/ping`,
      '     自检令牌。返回 user / role / token。',
      `GET  ${base}/api/ai/me`,
      '     当前身份与任务计数。',
      `GET  ${base}/api/ai/tasks?filter=mine|assigned|all`,
      '     任务列表，可加 status=todo|doing|done、include_done=1。',
      `GET  ${base}/api/ai/tasks/<任务id>`,
      '     任务详情与全部进展记录。',
      `POST ${base}/api/ai/tasks/<任务id>/report`,
      '     body / progress / status 至少带一个；可加 chat_id 把这条进展贴进会话。',
      `GET  ${base}/api/ai/chats`,
      '     我参与的会话，用于取 chat_id。',
      '',
      '令牌失效、过期或被吊销时返回 401，重新生成一个即可。',
    ].join('\n');
  }

  async function copyText(text, okMsg = '已复制') {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg);
    } catch (e) {
      toast('复制失败，请手动选中后复制', 'err');
    }
  }

  async function renderAi() {
    const d = await api('/api/team/tokens');
    const items = d.items || [];
    const active = items.filter((t) => !t.revoked);
    const canWrite = S.me.can_write;
    setHead('AI 接入', active.length ? `${active.length} 个令牌可用` : '把 AI 助手接入团队',
      canWrite ? [{ label: '生成令牌', icon: 'i-plus', primary: true, onClick: () => tokenEditor() }] : []);

    const tool = S.aiTool || 'generic';
    const lastUsed = active.reduce((m, t) => Math.max(m, t.last_used_at || 0), 0);
    const box = el('div');
    box.innerHTML = `
      <div class="panel ai-status${active.length ? '' : ' is-off'}">
        <span class="beat"></span>
        <div class="txt">
          <b>${active.length ? 'Connected' : 'Not connected'}</b>
          <span>${active.length
            ? `${active.length} 个令牌可用${lastUsed ? ` · 最近调用 ${fmtDate(lastUsed)}` : ' · 还没有被调用过'}`
            : '生成一个令牌，把提示词交给 TraeCode、Claude Code、豆包这类助手。'}</span>
        </div>
      </div>
      ${active.length ? '' : `
      <div class="section-title">三步接入</div>
      <div class="panel panel-pad ai-steps">
        <div class="ai-step"><b>1</b><div><span>生成令牌</span><small>令牌代表你的身份，AI 的操作都记在你名下。</small></div></div>
        <div class="ai-step"><b>2</b><div><span>把提示词交给 AI</span><small>令牌和提示词一起粘贴给助手。</small></div></div>
        <div class="ai-step"><b>3</b><div><span>进度进入团队</span><small>汇报写进对应任务的进展记录，并通知下发任务的人。</small></div></div>
      </div>`}
      <div class="section-title">我的令牌<span class="section-note">${active.length} / ${d.max} 可用</span></div>
      <div class="panel" id="tokList"></div>
      <div class="section-title">接入提示词</div>
      <div class="panel panel-pad">
        <div class="ai-tools" id="aiTools">
          ${AI_TOOLS.map((x) => `<button class="ai-tool${x.k === tool ? ' is-on' : ''}" data-tool="${x.k}">${x.name}</button>`).join('')}
        </div>
        <div class="code-block prompt-box" id="promptBox" style="margin-top:11px"></div>
        <div class="prompt-actions">
          <button class="btn" id="copyPrompt">${icon('i-doc', 'icon icon-13')}复制提示词</button>
          <span class="hint">把 &lt;你的令牌&gt; 换成令牌列表里的那一串</span>
        </div>
        <details class="ai-fold">
          <summary>接口清单</summary>
          <div class="code-block" id="apiBox"></div>
        </details>
      </div>
      <div class="section-title">免费额度怎么领<span class="section-note">注册即得，不用绑卡</span></div>
      <div class="panel panel-pad" id="freeList"></div>`;
    $('#list').innerHTML = '';
    $('#list').appendChild(box);

    const tl = $('#tokList', box);
    if (!items.length) {
      tl.innerHTML = `<div class="empty" style="padding:44px 0">${icon('i-key', 'icon icon-20')}<h3>还没有接入令牌</h3>
        <p>${canWrite ? '生成后，AI 可以替你汇报进度、更新任务。' : '只读访客不能创建令牌。'}</p></div>`;
    } else {
      items.forEach((t) => tl.appendChild(tokenNode(t)));
    }

    const paintPrompt = () => {
      $('#promptBox', box).textContent = aiPromptText('<你的令牌>', S.aiTool || 'generic');
    };
    paintPrompt();
    $('#apiBox', box).textContent = aiApiText();

    const fl = $('#freeList', box);
    FREE_PROVIDERS.forEach((p, i) => {
      const row = el('div', 'fp-row');
      row.innerHTML = `
        <div class="fp-head">
          <b>${esc(p.name)}</b>
          <button class="pill-btn" data-copy="${i}">复制配置</button>
        </div>
        <div class="fp-kv"><span>Base URL</span><code>${esc(p.base)}</code></div>
        ${p.model ? `<div class="fp-kv"><span>模型</span><code>${esc(p.model)}</code></div>` : ''}
        <p class="fp-note">${esc(p.note)}</p>
        <a class="fp-site" href="${esc(p.site)}" target="_blank" rel="noopener noreferrer">去申请${icon('i-link', 'icon icon-13')}</a>`;
      $('[data-copy]', row).onclick = () => copyText(freeConfigText(p), `${p.name} 配置已复制`);
      fl.appendChild(row);
    });
    $$('[data-tool]', box).forEach((b) => {
      b.onclick = () => {
        S.aiTool = b.dataset.tool;
        $$('[data-tool]', box).forEach((x) => x.classList.toggle('is-on', x === b));
        paintPrompt();
      };
    });
    $('#copyPrompt', box).onclick = () => copyText($('#promptBox', box).textContent, '提示词已复制');
  }

  function tokenNode(t) {
    const n = el('div', 'item tok-item' + (t.revoked ? ' done' : ''));
    n.innerHTML = `
      <span class="tok-ico">${icon('i-key', 'icon icon-20')}</span>
      <div class="item-body">
        <div class="item-title">${esc(t.name || '未命名')}${t.revoked ? '<span class="badge">已吊销</span>' : ''}</div>
        <div class="item-meta">
          <code class="tok-prefix">${esc(t.prefix)}…</code>
          <span class="dot"></span><span>创建于 ${fmtDate(t.created_at)}</span>
          <span class="dot"></span><span>${t.last_used_at ? `上次调用 ${fmtDate(t.last_used_at)}` : '还没被调用过'}</span>
          <span class="dot"></span><span>共 ${t.use_count} 次</span>
        </div>
      </div>
      <div class="item-actions">
        ${t.revoked ? '' : '<button class="pill-btn" data-revoke="1">吊销</button>'}
      </div>`;
    const rb = $('[data-revoke]', n);
    if (rb) {
      rb.onclick = () => sheet({
        title: `吊销「${t.name || '未命名'}」`,
        desc: '吊销后使用该令牌的 AI 会失去访问权限，无法恢复。',
        danger: true, okText: '吊销',
        onOk: async () => {
          await api(`/api/team/tokens/${t.id}`, { method: 'DELETE' });
          toast('令牌已吊销'); loadNav();
        },
      });
    }
    return n;
  }

  function tokenEditor() {
    sheet({
      title: '生成接入令牌',
      desc: '给每个工具起一个名字，日后可以单独吊销。',
      input: true, placeholder: '例如 TraeCode、Claude Code、豆包',
      okText: '生成',
      onOk: async (v) => {
        const name = (v || '').trim();
        if (!name) { toast('令牌名称不能为空', 'err'); return false; }
        const r = await jpost('/api/team/tokens', { name });
        showToken(r.token, name);
        // 返回 false 阻止 sheet() 收尾时关掉刚打开的令牌弹层
        return false;
      },
    });
  }

  // 明文令牌只出现这一次，务必让成员当场复制
  function showToken(token, name) {
    const prompt = aiPromptText(token);
    openSheet(`
      <h3>令牌已生成</h3>
      <p>「${esc(name)}」的令牌只显示这一次，关闭后无法再次查看。请复制保存。</p>
      <label class="lbl">令牌</label>
      <div class="code-block" id="tkVal">${esc(token)}</div>
      <label class="lbl">接入提示词（已填好令牌，可直接给 AI）</label>
      <div class="code-block" id="tkPrompt">${esc(prompt)}</div>
      <div class="sheet-actions">
        <button class="btn" id="tkCopyTok">${icon('i-key', 'icon icon-13')}复制令牌</button>
        <button class="btn btn-primary" id="tkCopyAll">${icon('i-doc', 'icon icon-13')}复制提示词</button>
      </div>
      <div class="sheet-actions">
        <button class="btn btn-quiet" id="tkDone">我已保存好</button>
      </div>`, (box) => {
      $('#tkCopyTok', box).onclick = () => copyText(token, '令牌已复制');
      $('#tkCopyAll', box).onclick = () => copyText(prompt, '提示词已复制');
      $('#tkDone', box).onclick = () => { closeSheet(); loadNav(); };
    });
  }

  /* ===================== 待办 ===================== */
  async function renderTodos() {
    const d = await api('/api/team/todos');
    setHead('待办', `${d.counts.open} 项待完成`, []);
    const open = d.items.filter((t) => !t.done);
    const overdue = open.filter((t) => t.overdue);
    const later = open.filter((t) => !t.overdue);
    const done = d.items.filter((t) => t.done);
    const box = el('div');
    box.innerHTML = `
      <div class="quick-add">
        <input id="todoInput" placeholder="添加待办" autocomplete="off">
        <button class="btn btn-primary" id="todoAdd">添加</button>
      </div>
      ${d.items.length ? '' : `<div class="empty">${icon('i-checklist', 'icon icon-20')}<h3>还没有待办</h3><p>只有你自己看得见。</p></div>`}
      ${overdue.length ? `<div class="section-title">已逾期<span class="section-note">${overdue.length} 项</span></div><div class="panel" id="gOver"></div>` : ''}
      ${later.length ? `<div class="section-title">待完成<span class="section-note">${later.length} 项</span></div><div class="panel" id="gOpen"></div>` : ''}
      ${done.length ? `<div class="section-title">已完成<span class="section-note">${done.length} 项</span></div><div class="panel" id="gDone"></div>` : ''}`;
    $('#list').innerHTML = '';
    $('#list').appendChild(box);
    const fill = (id, arr) => {
      const p = $(id);
      if (!p) return;
      arr.forEach((t) => p.appendChild(todoNode(t)));
    };
    fill('#gOver', overdue);
    fill('#gOpen', later);
    fill('#gDone', done.slice(0, 30));

    const add = async () => {
      const v = $('#todoInput').value.trim();
      if (!v) return;
      await jpost('/api/team/todos', { content: v });
      toast('已记下这条待办。');
      loadNav(); loadCounts();
    };
    $('#todoAdd').onclick = add;
    $('#todoInput').onkeydown = (e) => { if (e.key === 'Enter') add(); };
    $('#todoInput').focus();
  }

  function todoNode(t) {
    const n = el('div', 'item' + (t.done ? ' done' : ''));
    n.innerHTML = `
      <button class="check ${t.done ? 'on' : ''}" data-t="${esc(t.id)}" aria-label="完成">${icon('i-check', 'icon')}</button>
      <div class="item-body">
        <div class="item-title">${esc(t.content)}</div>
        ${t.due_at ? `<div class="item-meta"><span style="color:var(--${t.overdue ? 'danger' : 'text-3'})">${fmtDue(t.due_at)}</span></div>` : ''}
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-more="${esc(t.id)}" aria-label="更多操作">${icon('i-more', 'icon icon-13')}</button>
      </div>`;
    $('[data-t]', n).onclick = async () => {
      try {
        await jpatch(`/api/team/todos/${t.id}`, { done: !t.done });
        loadNav(); loadCounts();
      } catch (e) { toast(e.message, 'err'); }
    };
    $('[data-more]', n).onclick = (e) => openMenu(e.currentTarget, [
      { label: '编辑', icon: 'i-pencil', onClick: () => sheet({
        title: '编辑待办', input: true, value: t.content, okText: '存储',
        onOk: async (v) => { if (!v || !v.trim()) return false; await jpatch(`/api/team/todos/${t.id}`, { content: v.trim() }); loadNav(); },
      }) },
      { label: t.done ? '标记为未完成' : '标记为已完成', icon: 'i-check', onClick: async () => {
        try {
          await jpatch(`/api/team/todos/${t.id}`, { done: !t.done }); loadNav(); loadCounts();
        } catch (e) { toast(e.message, 'err'); }
      } },
      { sep: true },
      // 删除不可恢复，跟「清空通知」那些一样先确认，别一点就没
      { label: '删除', icon: 'i-trash', danger: true, onClick: () => sheet({
        title: '删除待办',
        desc: `「${t.content}」删除后无法恢复。`,
        danger: true, okText: '删除',
        onOk: async () => {
          try {
            await api(`/api/team/todos/${t.id}`, { method: 'DELETE' });
            toast('已删除'); loadNav(); loadCounts();
          } catch (e) { toast(e.message, 'err'); }
        },
      }) },
    ]);
    return n;
  }

  /* ===================== 日历 ===================== */
  async function renderCalendar() {
    const cur = S.cal.cursor;
    const first = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(1 - ((first.getDay() + 6) % 7));
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridStart.getDate() + 41);
    let evs = { items: [] };
    let evFailed = false;
    try {
      evs = await api(`/api/team/events?from=${Math.floor(gridStart.getTime() / 1000)}&to=${Math.floor((gridEnd.getTime() + 86400) / 1000)}`);
    } catch (e) { evFailed = true; }
    const canTeam = S.me.can_manage || S.me.role === 'core';
    setHead('日历', evFailed
      ? `${cur.getFullYear()}年${cur.getMonth() + 1}月 · 日程载入失败`
      : `${cur.getFullYear()}年${cur.getMonth() + 1}月 · ${evs.items.length} 项日程`, [
      { label: '', icon: 'i-chevron-left', aria: '上个月', onClick: () => { S.cal.cursor = new Date(cur.getFullYear(), cur.getMonth() - 1, 1); S.cal.day = null; loadNav(); } },
      { label: '今天', onClick: () => { S.cal.cursor = new Date(); S.cal.day = ymd(new Date()); loadNav(); } },
      { label: '', icon: 'i-chevron-right', aria: '下个月', onClick: () => { S.cal.cursor = new Date(cur.getFullYear(), cur.getMonth() + 1, 1); S.cal.day = null; loadNav(); } },
      { label: '新建日程', icon: 'i-plus', primary: true, onClick: () => eventEditor(canTeam) },
    ]);
    if (!S.cal.day || !S.cal.day.startsWith(`${cur.getFullYear()}-${p2(cur.getMonth() + 1)}`)) S.cal.day = ymd(new Date());

    const byDay = new Map();
    evs.items.forEach((e) => {
      const k = ymd(new Date(e.start_at * 1000));
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(e);
    });
    const todayKey = ymd(new Date());
    const pad = (first.getDay() + 6) % 7;
    const weeks = Math.ceil((pad + new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate()) / 7);
    let cells = '';
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const k = ymd(d);
      const list = byDay.get(k) || [];
      cells += `<div class="cal-cell ${d.getMonth() !== cur.getMonth() ? 'out' : ''} ${k === todayKey ? 'today' : ''}" data-day="${k}">
        <div class="d">${d.getDate()}</div>
        ${list.slice(0, 3).map((e) => `<button class="cal-ev ${e.scope === 'team' ? 'team' : ''}" data-ev="${esc(e.id)}" title="${esc(e.title)}">${esc(e.title)}</button>`).join('')}
        ${list.length > 3 ? `<div class="cal-more">还有 ${list.length - 3} 项</div>` : ''}
      </div>`;
    }
    const dayEvs = (byDay.get(S.cal.day) || []).sort((a, b) => a.start_at - b.start_at);
    const dayDate = new Date(`${S.cal.day}T00:00:00`);
    $('#list').innerHTML = `
      <div class="cal-head">${['一', '二', '三', '四', '五', '六', '日'].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
      <div class="section-title">${dayDate.getMonth() + 1}月${dayDate.getDate()}日<span class="section-note">${dayEvs.length} 项</span></div>
      <div class="panel">
        ${dayEvs.length ? dayEvs.map((e) => `
          <div class="day-ev" data-ev="${esc(e.id)}" style="cursor:default">
            <span class="tm">${e.all_day ? '全天' : `${p2(new Date(e.start_at * 1000).getHours())}:${p2(new Date(e.start_at * 1000).getMinutes())}`}</span>
            <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.title)}</span>
            <span class="badge ${e.scope === 'team' ? 'warn' : ''}">${e.scope === 'team' ? '团队' : '个人'}</span>
            ${e.can_edit ? `<button class="icon-btn" data-del="${esc(e.id)}" data-del-title="${esc(e.title)}" aria-label="删除日程">${icon('i-trash', 'icon icon-13')}</button>` : ''}
          </div>`).join('') : panelNote(evFailed ? '日程没能载入。' : '这一天还没有安排。', evFailed ? 'cal' : '')}
      </div>`;
    $$('[data-day]').forEach((c) => {
      c.onclick = (e) => {
        if (e.target.closest('[data-ev]')) return;
        S.cal.day = c.dataset.day;
        loadNav();
      };
    });
    $$('[data-retry]').forEach((b) => { b.onclick = () => loadNav(); });
    $$('[data-del]').forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        const title = b.dataset.delTitle || '这条日程';
        sheet({
          title: '删除日程',
          desc: `「${title}」删除后无法恢复。`,
          danger: true, okText: '删除',
          onOk: async () => {
            try {
              await api(`/api/team/events/${b.dataset.del}`, { method: 'DELETE' });
              toast('日程已删除'); loadNav();
            } catch (err) { toast(err.message, 'err'); }
          },
        });
      };
    });
  }

  function eventEditor(canTeam) {
    const base = S.cal.day ? new Date(`${S.cal.day}T09:00:00`) : new Date();
    const val = `${base.getFullYear()}-${p2(base.getMonth() + 1)}-${p2(base.getDate())}T09:00`;
    const val2 = `${base.getFullYear()}-${p2(base.getMonth() + 1)}-${p2(base.getDate())}T10:00`;
    sheet({
      title: '新建日程', input: true, placeholder: '日程名称',
      fields: `
        <div class="field-row">
          <div style="flex:1 1 0;text-align:left"><label class="lbl">开始</label>
            <input class="field" id="eStart" type="datetime-local" value="${val}"></div>
          <div style="flex:1 1 0;text-align:left"><label class="lbl">结束</label>
            <input class="field" id="eEnd" type="datetime-local" value="${val2}"></div>
        </div>
        ${canTeam ? `<label class="lbl">可见范围</label>
          <select class="field" id="eScope"><option value="personal">仅自己</option><option value="team">团队</option></select>` : ''}`,
      okText: '添加',
      onOk: async (title, box) => {
        const v = (title || '').trim();
        if (!v) { toast('日程名称不能为空', 'err'); return false; }
        const sc = $('#eScope', box);
        await jpost('/api/team/events', {
          title: v,
          start_at: Math.floor(new Date($('#eStart', box).value).getTime() / 1000),
          end_at: Math.floor(new Date($('#eEnd', box).value).getTime() / 1000),
          scope: sc ? sc.value : 'personal',
        });
        toast('日程已添加');
        loadNav();
      },
    });
  }

  /* ===================== 团队成员 ===================== */
  function memberAvatar(m, size) {
    return m.avatar
      ? `<img src="${esc(m.avatar)}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover">`
      : icon('i-person', 'icon icon-20');
  }

  function editMemberDialog(m) {
    openSheet(`
      <h3>${esc(m.username)}</h3>
      <p>职务与部门只用于团队内展示，不影响权限。</p>
      <input class="field" id="emJob" placeholder="职务" value="${esc(m.job_title)}">
      <input class="field" id="emDept" placeholder="部门" value="${esc(m.department)}">
      <div class="sheet-actions">
        <button class="btn" id="sCancel">取消</button>
        <button class="btn btn-primary" id="sOk">存储</button>
      </div>`, (box) => {
      const job = $('#emJob', box), dept = $('#emDept', box);
      job.focus(); job.select();
      $('#sCancel', box).onclick = closeSheet;
      $('#sOk', box).onclick = async () => {
        try {
          await jpatch(`/api/team/members/${m.user_id}`,
            { job_title: job.value.trim(), department: dept.value.trim() });
          toast('已保存');
          closeSheet();
          loadNav();
        } catch (e) { toast(e.message, 'err'); }
      };
    });
  }

  function addMemberDialog() {
    const roles = S.me.labels.roles;
    openSheet(`
      <h3>添加成员</h3>
      <p>填写对方在论坛绑定的邮箱，确认账户身份后加入团队。</p>
      <input class="field" id="amEmail" placeholder="论坛绑定邮箱" autocomplete="off" spellcheck="false">
      <div id="amPreview"></div>
      <div class="sheet-actions">
        <button class="btn" id="sCancel">取消</button>
        <button class="btn btn-primary" id="amOk">查找账户</button>
      </div>`, (box) => {
      const inp = $('#amEmail', box), ok = $('#amOk', box), pv = $('#amPreview', box);
      let found = null;
      inp.focus();
      $('#sCancel', box).onclick = closeSheet;

      async function lookup() {
        const email = inp.value.trim();
        if (!email) { toast('邮箱不能为空', 'err'); return; }
        ok.disabled = true;
        try {
          const r = await api(`/api/team/member-lookup?email=${encodeURIComponent(email)}`);
          found = r.user;
          pv.innerHTML = `
            <div class="acct-card" style="margin-bottom:10px">
              <span class="acct-av">${r.user.avatar ? `<img src="${esc(r.user.avatar)}" alt="">` : esc(initials(r.user.username))}</span>
              <span class="acct-main">
                <b>${esc(r.user.username)}</b>
                <small>${esc(r.user.email)}</small>
                ${r.user.joined_at ? `<small>论坛注册于 ${esc(fmtDay(r.user.joined_at))}</small>` : ''}
              </span>
            </div>
            ${r.user.in_team ? '' : `
              <select class="field" id="amRole">
                ${['member', 'core', 'guest'].map((k) => `<option value="${k}">${esc(roles[k] || k)}</option>`).join('')}
              </select>
              <input class="field" id="amJob" placeholder="职务（可选）" autocomplete="off">
              <input class="field" id="amDept" placeholder="部门（可选）" autocomplete="off">`}`;
          inp.disabled = true;
          ok.disabled = false;
          if (r.user.in_team) {
            ok.textContent = '已在团队中';
            ok.disabled = true;
            ok.classList.remove('btn-primary');
            $('#sCancel', box).textContent = '关闭';
          } else {
            ok.textContent = '加入团队';
            ok.onclick = submit;
          }
        } catch (e) {
          found = null;
          pv.innerHTML = '';
          ok.disabled = false;
          toast(e.message, 'err');
        }
      }

      async function submit() {
        ok.disabled = true;
        try {
          const r = await jpost('/api/team/members', {
            email: found.email,
            role: ($('#amRole', box) || {}).value || 'member',
            job_title: ($('#amJob', box) || {}).value || '',
            department: ($('#amDept', box) || {}).value || '',
          });
          toast(`${r.username} 已加入团队。`);
          closeSheet();
          loadNav();
        } catch (e) { toast(e.message, 'err'); ok.disabled = false; }
      }

      ok.onclick = lookup;
      inp.onkeydown = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (found) submit(); else lookup();
      };
    });
  }

  async function renderMembers() {
    const data = await api('/api/team/members');
    S.members = data.items;
    S.online = data.online || [];
    setHead('成员', `${data.items.length} 位成员 · ${S.online.length} 人在线`, []);
    if (!data.can_manage) {
      $('#list').innerHTML = `<div class="empty">${icon('i-shield', 'icon icon-20')}<h3>仅拥有者可见</h3>
        <p>成员的个人文件对所有人（包括管理员）都不可见，只有用量数字可由拥有者查看。</p></div>`;
      return;
    }
    $('#headActions').innerHTML = `<button class="btn btn-primary" id="memAdd">${icon('i-plus', 'icon icon-13')}添加成员</button>`;
    $('#memAdd').onclick = addMemberDialog;
    $('#list').innerHTML = `
      <div class="panel">
        <div class="mem-row mem-head" style="color:var(--text-3);font-size:11.5px;height:26px">
          <span>成员</span>
          <span class="mem-role">角色</span>
          <span class="mem-job">职务</span>
          <span class="mem-dept">部门</span>
          <span class="mem-size">我的文件</span>
          <span class="mem-time">加入时间</span>
          <span></span>
        </div>
        ${data.items.map((m) => `
          <div class="mem-row">
            <div class="cell-name">
              <span class="glyph">${memberAvatar(m, 20)}</span>
              <b>${esc(m.username)}</b><span class="presence-dot${m.online ? ' is-on' : ''}" data-online="${esc(m.user_id)}"></span>${m.is_me ? '<span class="ver-tag">我</span>' : ''}${m.status === 'suspended' ? '<span class="badge">已暂停</span>' : ''}
            </div>
            <span class="cell-sub mem-sub">${esc([m.job_title, m.department].filter(Boolean).join(' · ') || m.role_label)}</span>
            <span class="badge mem-role ${m.role === 'owner' ? 'accent' : m.role === 'core' ? 'warn' : ''}">${esc(m.role_label)}</span>
            <span class="cell-sub mem-job" title="${esc(m.job_title)}">${esc(m.job_title) || '—'}</span>
            <span class="cell-sub mem-dept" title="${esc(m.department)}">${esc(m.department) || '—'}</span>
            <span class="cell-sub mem-size">${fmtSize(m.personal_used)}</span>
            <span class="cell-sub mem-time">${fmtDate(m.created_at)}</span>
            <button class="icon-btn" data-mem="${esc(m.user_id)}" aria-label="成员操作" ${m.role === 'owner' ? 'disabled' : ''}>${icon('i-more', 'icon icon-13')}</button>
          </div>`).join('')}
      </div>`;
    $$('[data-mem]').forEach((b) => {
      const m = data.items.find((x) => x.user_id === b.dataset.mem);
      const setRole = (r) => sheet({
        title: `把 ${m.username} 改为${data.roles[r]}`,
        desc: r === 'core' ? '核心成员能管团队文件、也能看到所有人的任务。' : '权限立即生效。',
        danger: r === 'guest', okText: '确认修改',
        onOk: async () => {
          try {
            await jpatch(`/api/team/members/${m.user_id}`, { role: r });
            toast('权限已更新'); loadNav();
          } catch (err) { toast(err.message, 'err'); }
        },
      });
      const setStatus = (st) => {
        jpatch(`/api/team/members/${m.user_id}`, { status: st })
          .then(() => { toast(st === 'suspended' ? '已暂停访问' : '已恢复访问'); loadNav(); })
          .catch((err) => toast(err.message, 'err'));
      };
      b.onclick = (e) => openMenu(e.currentTarget, [
        { label_only: '权限' },
        // 改角色等于提权/降权，改错会直接改变对方能看到什么，必须确认
        ...['core', 'member', 'guest'].map((r) => ({
          label: data.roles[r], check: m.role === r, icon: 'i-shield', disabled: m.role === r,
          onClick: () => setRole(r),
        })),
        { sep: true },
        { label: '编辑资料', icon: 'i-pencil', onClick: () => editMemberDialog(m) },
        { sep: true },
        m.status === 'active'
          ? { label: '暂停访问', icon: 'i-lock', onClick: () => sheet({
              title: `暂停 ${m.username} 的访问`,
              desc: '暂停后对方立刻无法进入团队，随时可以恢复。',
              okText: '暂停访问',
              onOk: () => setStatus('suspended'),
            }) }
          : { label: '恢复访问', icon: 'i-check', onClick: () => setStatus('active') },
        { label: '移出团队', icon: 'i-trash', danger: true, onClick: () => sheet({
          title: `将 ${m.username} 移出团队`, desc: '移出后对方将无法再访问。之后需要时，可以重新邀请。', danger: true, okText: '移出',
          onOk: async () => {
            try {
              await api(`/api/team/members/${m.user_id}`, { method: 'DELETE' });
              toast('已移出'); loadNav();
            } catch (err) { toast(err.message, 'err'); }
          },
        }) },
      ]);
    });
  }

  /* ===================== 操作日志 ===================== */
  async function renderActivity() {
    const data = await api('/api/team/activity?limit=200');
    setHead('Activity', `最近 ${data.items.length} 条记录`, []);
    $('#list').innerHTML = `<div class="panel">${data.items.map((a) => `
      <div class="day-ev">
        <span class="tm" style="width:88px">${fmtShort(a.created_at)}</span>
        <span style="width:78px;flex:0 0 auto">${esc(a.username)}</span>
        <span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${esc(ACTION_LABEL[a.action] || a.action)}${a.file_name ? ` · ${esc(a.file_name)}` : ''}${a.detail ? ` · ${esc(a.detail)}` : ''}</span>
        <span style="color:var(--text-3);font-size:11.5px">${esc(a.ip || '')}</span>
      </div>`).join('') || emptyState({ icon: 'i-activity', title: '暂无记录', hint: '团队里的操作会按时间留在这里。' })}</div>`;
  }

  /* ===================== 在线聊天 ===================== */
  const narrow = () => window.matchMedia('(max-width: 860px)').matches;

  function clockOf(ts) { const d = new Date(ts * 1000); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; }
  function dayLabelOf(ts) {
    const d = new Date(ts * 1000), now = new Date();
    const same = (a, b) => a.toDateString() === b.toDateString();
    if (same(d, now)) return '今天';
    if (same(d, new Date(now - 864e5))) return '昨天';
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  const peerOf = (c) => (c.members || []).find((m) => m.user_id !== S.me.user.id) || null;

  function chatAvatar(c, size) {
    const p = c.kind === 'group' ? null : peerOf(c);
    const src = (p && p.avatar) || '';
    if (src) return `<img src="${esc(src)}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block">`;
    const label = c.kind === 'group' ? (c.title || '群').slice(0, 1) : initials(p ? p.username : '?');
    return `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;
      background:var(--fill-strong);font-size:${Math.round(size * 0.42)}px;font-weight:600;color:var(--text-2)">${esc(label)}</span>`;
  }

  function chatRow(c) {
    const last = c.last;
    const preview = last ? `${c.kind === 'group' ? `${last.sender_name}：` : ''}${last.body}` : '还没有消息';
    return `<button class="chat-item${S.chats.active === c.id ? ' is-on' : ''}" data-cid="${esc(c.id)}">
      <span>${chatAvatar(c, 34)}</span>
      <span class="ci-main"><b>${esc(c.title)}</b><small>${esc(preview)}</small></span>
      <span class="ci-side">
        <span class="ci-time">${last ? esc(fmtShort(last.created_at)) : ''}</span>
        ${c.unread ? `<span class="chat-dot">${c.unread > 99 ? '99+' : c.unread}</span>` : ''}
      </span>
    </button>`;
  }

  const chatListHTML = (items) => (items.length ? items.map(chatRow).join('')
    : emptyState({ icon: 'i-chat', title: '还没有会话', hint: '从右上角发起一对一或群聊。' }));

  function wireChatList() {
    $$('#chatList .chat-item').forEach((b) => { b.onclick = () => openChat(b.dataset.cid); });
  }

  const chatSig = (items) => items.map((c) => `${c.id}/${c.unread}/${c.title}/${c.last ? c.last.created_at : 0}`).join('|');

  function paintChatBadge(n) {
    const node = $('#cntChats');
    if (node) node.textContent = n ? (n > 99 ? '99+' : String(n)) : '';
  }

  async function renderChats() {
    setHead('会话', '', [
      { label: '发起会话', icon: 'i-chat', onClick: newDirectChat },
      { label: '新建群聊', icon: 'i-group-chat', primary: true, onClick: newGroupChat },
    ]);
    const r = await api('/api/team/chats');
    S.chats.items = r.items;
    S.chats.sig = chatSig(r.items);
    paintChatBadge(r.total_unread);
    if (S.chats.active && !r.items.some((c) => c.id === S.chats.active)) S.chats.active = null;
    if (!S.chats.active && r.items.length && !narrow()) S.chats.active = r.items[0].id;
    $('#list').innerHTML = `
      <div class="chat${S.chats.active && narrow() ? ' is-thread' : ''}" id="chatRoot">
        <div class="chat-side">
          <div class="chat-side-head">会话<span class="spacer"></span><span id="chatCount">${r.items.length}</span></div>
          <div class="chat-list" id="chatList">${chatListHTML(r.items)}</div>
        </div>
        <div class="chat-thread" id="chatThread"></div>
      </div>`;
    wireChatList();
    if (S.chats.active) await loadThread(S.chats.active);
    else paintThread();
  }

  async function refreshChatList() {
    const r = await api('/api/team/chats');
    paintChatBadge(r.total_unread);
    const sig = chatSig(r.items);
    S.chats.items = r.items;
    if (sig === S.chats.sig) return;
    S.chats.sig = sig;
    const list = $('#chatList');
    if (!list) return;
    list.innerHTML = chatListHTML(r.items);
    wireChatList();
    const cnt = $('#chatCount');
    if (cnt) cnt.textContent = r.items.length;
  }

  async function openChat(cid) {
    S.chats.active = cid;
    const root = $('#chatRoot');
    if (root) root.classList.toggle('is-thread', narrow());
    $$('#chatList .chat-item').forEach((x) => x.classList.toggle('is-on', x.dataset.cid === cid));
    await loadThread(cid);
  }

  async function loadThread(cid) {
    const r = await api(`/api/team/chats/${cid}/messages?limit=80`);
    S.chats.msgs = r.items;
    S.chats.meta = r.chat;
    S.chats.last = r.items.length ? r.items[r.items.length - 1].created_at : 0;
    if (S.chats.active === cid) paintThread(true);
    markRead(cid, Date.now() / 1000);
  }

  async function pollThread(cid) {
    const r = await api(`/api/team/chats/${cid}/messages?after=${S.chats.last}`);
    if (!r.items.length) return;
    const have = new Set(S.chats.msgs.map((m) => m.id));
    const add = r.items.filter((m) => !have.has(m.id));
    if (!add.length) return;
    S.chats.msgs.push(...add);
    S.chats.last = add[add.length - 1].created_at;
    if (S.chats.active === cid) paintThread(false);
    markRead(cid, add[add.length - 1].created_at);
  }

  async function markRead(cid, ts) {
    try { await jpost(`/api/team/chats/${cid}/read`, { ts }); } catch (e) { /* 已读回执失败不打断 */ }
  }

  function renderMsgs() {
    const c = S.chats.meta;
    if (!S.chats.msgs.length) return `<div class="empty" style="margin:auto">${icon('i-chat', 'icon icon-20')}<h3>还没有消息</h3><p>说点什么，开始这段对话。</p></div>`;
    let out = '', lastDay = '', lastSender = '';
    S.chats.msgs.forEach((m) => {
      const day = dayLabelOf(m.created_at);
      if (day !== lastDay) { out += `<div class="chat-day">${esc(day)}</div>`; lastDay = day; lastSender = ''; }
      const showWho = c.kind === 'group' && !m.mine && m.sender_id !== lastSender;
      lastSender = m.sender_id;
      out += `<div class="msg${m.mine ? ' is-mine' : ''}">
        ${showWho ? `<span class="who">${esc(m.sender_name)}</span>` : ''}
        <div class="bubble">${esc(m.body)}</div>
        <span class="stamp">${esc(clockOf(m.created_at))}</span>
      </div>`;
    });
    return out;
  }

  function scrollChatBody(force) {
    const b = $('#chatBody');
    if (!b) return;
    const nearBottom = b.scrollHeight - b.scrollTop - b.clientHeight < 90;
    if (force || nearBottom) b.scrollTop = b.scrollHeight;
  }

  function paintThread(forceScroll) {
    const host = $('#chatThread');
    if (!host) return;
    const c = S.chats.meta;
    if (!c) {
      host.innerHTML = `<div class="empty" style="margin:auto">${icon('i-chat', 'icon icon-20')}<h3>选择一个会话</h3><p>从左边选一个，继续。</p></div>`;
      return;
    }
    const p = peerOf(c);
    const sub = c.kind === 'group' ? `${c.members.length} 位成员`
      : [p && p.job_title, p && p.department, p && p.role_label].filter(Boolean).join(' · ');
    host.innerHTML = `
      <div class="chat-head">
        ${narrow() ? `<button class="icon-btn" id="chatBack" title="返回">${icon('i-chevron-left', 'icon icon-15')}</button>` : ''}
        <span>${chatAvatar(c, 32)}</span>
        <span class="ct-title"><b>${esc(c.title)}</b><small>${esc(sub || '')}</small></span>
        <button class="icon-btn" id="chatMore" title="更多">${icon('i-more', 'icon icon-13')}</button>
      </div>
      <div class="chat-body" id="chatBody">${renderMsgs()}</div>
      <div class="chat-compose">
        <textarea id="chatInput" rows="1" placeholder="输入消息，Enter 发送" maxlength="4000"></textarea>
        <button class="btn btn-primary" id="chatSend" title="发送">${icon('i-send-plane', 'icon icon-13')}</button>
      </div>`;
    const back = $('#chatBack');
    if (back) back.onclick = () => {
      $('#chatRoot').classList.remove('is-thread');
      S.chats.active = null;
      $$('#chatList .chat-item').forEach((x) => x.classList.remove('is-on'));
      paintThread();
    };
    $('#chatMore').onclick = (e) => openMenu(e.currentTarget, [
      { label: c.kind === 'group' ? '群成员' : '成员资料', icon: 'i-people', onClick: () => showChatMembers(c) },
      { sep: true },
      { label: c.kind === 'group' ? '退出群聊' : '删除会话', icon: 'i-trash', danger: true, onClick: () => leaveChat(c) },
    ]);
    const ta = $('#chatInput');
    ta.oninput = () => { ta.style.height = 'auto'; ta.style.height = `${Math.min(132, ta.scrollHeight)}px`; };
    ta.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendChat(); }
    };
    $('#chatSend').onclick = sendChat;
    scrollChatBody(forceScroll);
  }

  async function sendChat() {
    const ta = $('#chatInput');
    if (!ta || !S.chats.active) return;
    const body = ta.value.trim();
    if (!body) return;
    const btn = $('#chatSend');
    btn.disabled = true;
    try {
      await jpost(`/api/team/chats/${S.chats.active}/messages`, { body });
      ta.value = '';
      ta.style.height = 'auto';
      await pollThread(S.chats.active);
    } catch (e) { toast(e.message, 'err'); }
    btn.disabled = false;
    ta.focus();
  }

  function showChatMembers(c) {
    openSheet(`
      <h3>${esc(c.title)}</h3>
      <p>${c.kind === 'group' ? `${c.members.length} 位成员` : '一对一成员'}</p>
      <div class="pick">${c.members.map((m) => `
        <div class="pick-row" style="cursor:default">
          <span class="pick-av">${m.avatar ? `<img src="${esc(m.avatar)}" alt="">` : esc(initials(m.username))}</span>
          <span class="pick-main">
            <b>${esc(m.username)}${m.user_id === S.me.user.id ? '（我）' : ''}</b>
            <small>${esc([m.job_title, m.department].filter(Boolean).join(' · ') || m.role_label)}</small>
          </span>
        </div>`).join('')}</div>
      <div class="sheet-actions"><button class="btn btn-primary" id="sOk">完成</button></div>`,
      (box) => { $('#sOk', box).onclick = closeSheet; });
  }

  function leaveChat(c) {
    const label = c.kind === 'group' ? '退出群聊' : '删除会话';
    const desc = c.kind === 'group' ? '退出后不再收到该群消息，历史消息仍保留给其他成员。'
      : '会话只从你的列表中移除，对方不受影响。';
    sheet({
      title: label, desc, danger: true, okText: label,
      onOk: async () => {
        await api(`/api/team/chats/${c.id}`, { method: 'DELETE' });
        S.chats.active = null; S.chats.meta = null; S.chats.msgs = [];
        toast(`已${label}`);
        loadNav();
      },
    });
  }

  function newDirectChat() {
    memberPicker({
      title: '发起会话', okText: '开始', multi: false,
      desc: '选择一位团队成员开始一对一聊天。',
      onOk: async (ids) => {
        const r = await jpost('/api/team/chats', { user_id: ids[0] });
        switchNav('chats');
        S.chats.active = r.id;
        S.chats.meta = null;
        await loadNav();
      },
    });
  }

  async function newGroupChat() {
    let items;
    try { items = (await api('/api/team/peers')).items; } catch (e) { toast(e.message, 'err'); return; }
    if (items.length < 2) { toast('群聊至少需要 3 位成员，请先添加成员', 'err'); return; }
    const sel = new Set();
    openSheet(`
      <h3>新建群聊</h3>
      <p>填写名称并选择成员，含你本人在内至少 3 人。</p>
      <input class="field" id="gcName" placeholder="群聊名称" autocomplete="off">
      <div class="pick" id="gcList">${pickRowsHTML(items)}</div>
      <div class="sheet-actions">
        <button class="btn" id="sCancel">取消</button>
        <button class="btn btn-primary" id="sOk">创建</button>
      </div>`, (box) => {
      $('#gcName', box).focus();
      $('#sCancel', box).onclick = closeSheet;
      wirePick(box, sel, true);
      $('#sOk', box).onclick = async () => {
        const name = $('#gcName', box).value.trim();
        if (!name) { toast('群聊名称不能为空', 'err'); return; }
        if (sel.size < 2) { toast('至少再选择 2 位成员', 'err'); return; }
        try {
          const r = await jpost('/api/team/chats/group', { name, user_ids: [...sel] });
          closeSheet();
          switchNav('chats');
          S.chats.active = r.id;
          S.chats.meta = null;
          await loadNav();
        } catch (e) { toast(e.message, 'err'); }
      };
    });
  }

  /* ===================== 实时通道（SSE）===================== */
  // 服务端只推「哪个主题变了」，具体数据仍走 REST —— 前端永远以数据库为准，
  // 不会出现推送内容和库里对不上的情况。连上就停掉轮询，断了自动退化成慢轮询兜底。
  const RT = { es: null, down: false, fallback: null, fails: 0 };

  function rtSupported() { return typeof window.EventSource === 'function'; }

  function rtConnect() {
    if (!rtSupported() || !S.me || S.gateShown) return;
    rtStopFallback();
    if (RT.es) { try { RT.es.close(); } catch (e) { /* noop */ } }
    let es;
    try { es = new EventSource('/api/team/stream'); } catch (e) { rtGoFallback(); return; }
    RT.es = es;
    es.addEventListener('ready', (e) => {
      RT.down = false; RT.fails = 0;
      try {
        const d = JSON.parse(e.data || '{}');
        if (Array.isArray(d.online)) { S.online = d.online; renderOnline(); }
      } catch (err) { /* noop */ }
      presenceStart();   // 通道就绪后再开在场心跳，避免登录前空跑
    });
    es.addEventListener('sync', (e) => {
      let d;
      try { d = JSON.parse(e.data || '{}'); } catch (err) { return; }
      rtApply(d);
    });
    es.addEventListener('error', () => {
      // EventSource 自己会重连；连续失败才退化成慢轮询，免得断网时空转
      RT.down = true; RT.fails += 1;
      if (RT.fails >= 3) rtGoFallback();
    });
  }

  function rtGoFallback() {
    if (RT.fallback) return;
    RT.fallback = setInterval(chatTick, 20000);
  }
  function rtStopFallback() {
    if (RT.fallback) { clearInterval(RT.fallback); RT.fallback = null; }
  }

  // 只做「该刷新什么」的决策，具体渲染仍交给原有的 loadNav / pollThread
  function rtApply(d) {
    const t = d.topic;
    if (t === 'presence') {
      if (Array.isArray(d.online)) { S.online = d.online; renderOnline(); }
      if (d.files && typeof d.files === 'object') { presence.files = d.files; renderViewers(); }
      return;
    }
    if (t === 'typing') {
      if (d.file && d.uid) {
        const box = presence.typing[d.file] || (presence.typing[d.file] = {});
        if (d.on) {
          box[d.uid] = { uid: d.uid, name: d.name || '成员', ts: Date.now() / 1000 };
          // 对方断线时可能来不及发 off，兜底 6 秒后自行淡出
          setTimeout(() => {
            const b = presence.typing[d.file];
            if (b && b[d.uid] && Date.now() / 1000 - b[d.uid].ts >= 5) { delete b[d.uid]; renderTyping(); }
          }, 6000);
        } else {
          delete box[d.uid];
        }
        renderTyping();
      }
      return;
    }
    if (t === 'inbox') { loadCounts(); if (S.nav === 'inbox') loadNav(); return; }
    if (t === 'chat') {
      refreshChatList();
      if (S.nav === 'chats' && S.chats.active && (!d.chat_id || d.chat_id === S.chats.active)) pollThread(S.chats.active);
      return;
    }
    if (t === 'tasks') {
      loadCounts();
      if (S.pullTaskUpdates) S.pullTaskUpdates();
      if (S.nav === 'tasks' || S.nav === 'board' || S.nav === 'dashboard' || S.nav === 'contributions') loadNav();
      return;
    }
    if (t === 'files') {
      if (FILE_NAVS.has(S.nav)) loadNav();
      loadCounts();
      // 别人新发的评论要能实时出现在当前打开的面板上；
      // 但如果用户正在输入框里写（有草稿且焦点在），别把内容刷没了。
      const ta = $('#cText');
      const typing = ta && document.activeElement === ta && ta.value.trim();
      if (!typing && S.inspTab === 'comments' && $('#inspector').classList.contains('on') && selectedItem()) {
        switchTab('comments');
      }
      return;
    }
    if (t === 'members') { if (S.nav === 'members') loadNav(); return; }
    if (t === 'announce') { if (S.nav === 'home' || S.nav === 'dashboard') loadNav(); return; }
    if (t === 'events') { if (S.nav === 'calendar') loadNav(); return; }
    if (t === 'todos') { loadCounts(); if (S.nav === 'todos' || S.nav === 'home') loadNav(); return; }
  }

  function renderOnline() {
    const set = new Set(S.online || []);
    $$('[data-online]').forEach((el) => {
      const on = set.has(el.dataset.online);
      el.classList.toggle('is-on', on);
      el.title = on ? '在线' : '离线';
    });
    if (S.nav === 'members' && S.members) {
      const sub = $('#headSub');
      if (sub) sub.textContent = `${S.members.length} 位成员 · ${set.size} 人在线`;
    }
  }

  /* ===================== 在场 / 输入中 ===================== */
  const presence = { files: {}, typing: {} };   // files: {fid:[uid]}  typing: {fid:{uid:{name,ts}}}
  let presenceTick = null;
  let typingOnTimer = null;
  let typingOffTimer = null;

  // 只有「面板打开且选中了文件」才算正在查看；关掉面板即上报空串
  function watchedFile() {
    if (!S.me || !S.sel) return '';
    return $('#inspector').classList.contains('on') ? S.sel : '';
  }
  function nameOf(uid) {
    const m = (S.members || []).find((x) => x.user_id === uid);
    return (m && m.username) || '成员';
  }
  function pingPresence() {
    if (!S.me || S.gateShown || document.hidden) return;
    jpost('/api/team/presence', { file: watchedFile() }).catch(() => {});
  }
  function presenceStart() {
    if (presenceTick) return;
    pingPresence();
    presenceTick = setInterval(pingPresence, 25000);
  }
  function renderViewers() {
    const box = $('#insViewers');
    const it = selectedItem();
    if (!box || !it) return;
    const me = S.me && S.me.user.id;
    const uids = (presence.files[it.id] || []).filter((u) => u && u !== me);
    if (!uids.length) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    box.innerHTML = `${icon('i-eye', 'icon icon-13')}<span>${uids.map((u) => esc(nameOf(u))).join('、')} 正在查看</span>`;
  }
  function renderTyping() {
    const box = $('#cmtTyping');
    const it = selectedItem();
    if (!box || !it) return;
    const now = Date.now() / 1000;
    const me = S.me && S.me.user.id;
    const list = Object.values(presence.typing[it.id] || {})
      .filter((x) => x && now - x.ts < 6 && x.uid !== me);
    box.hidden = !list.length;
    box.textContent = list.length ? `${list.map((x) => x.name).join('、')} 正在输入…` : '';
  }
  function sendTyping(on) {
    const fid = watchedFile();
    if (!fid) return;
    jpost('/api/team/typing', { file: fid, on }).catch(() => {});
  }
  // 节流：最多每 3 秒发一次「正在输入」，停手约 3 秒后补一条 off
  function noteTyping() {
    if (!typingOnTimer) {
      sendTyping(true);
      typingOnTimer = setTimeout(() => { typingOnTimer = null; }, 3000);
    }
    clearTimeout(typingOffTimer);
    typingOffTimer = setTimeout(() => { typingOffTimer = null; sendTyping(false); }, 3200);
  }

  // 回到前台时补一次（后台期间可能错过了事件），并确保通道还活着
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (RT.es && !RT.down) { loadCounts(); refreshChatList(); }
    else rtConnect();
  });

  let chatBusy = false;
  async function chatTick() {
    // 验证门弹出（会话已失效）或页面在后台时没必要空转，省掉每 5 秒一次的无用请求
    if (chatBusy || !S.me || S.gateShown || document.hidden) return;
    chatBusy = true;
    try {
      await refreshChatList();
      if (S.nav === 'chats' && S.chats.active) await pollThread(S.chats.active);
    } catch (e) { /* 轮询失败静默重试 */ }
    chatBusy = false;
  }
  // 实时通道优先：连上后不再定时轮询，只在断线时由 rtGoFallback() 退化兜底

  /* ===================== 文件操作 ===================== */
  function downloadItem(it) {
    if (it.is_dir) { triggerDownload(`/api/team/folder/${it.id}/download`); return; }
    triggerDownload(`/api/team/file/${it.id}/download`);
  }

  /* ===================== 批量操作 ===================== */
  function triggerDownload(url) {
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function batchDownload() {
    const items = selectedItems();
    if (!items.length) { toast('请先选择要下载的项目', 'err'); return; }
    const files = items.filter((i) => !i.is_dir);
    const dirs = items.filter((i) => i.is_dir);
    // 浏览器逐个下载：连续触发太快会被拦，留出间隔
    for (const f of files) { triggerDownload(`/api/team/file/${f.id}/download`); await sleep(350); }
    for (const d of dirs) { triggerDownload(`/api/team/folder/${d.id}/download`); await sleep(700); }
    toast(`已发起 ${items.length} 项下载`);
  }

  async function batchMove() {
    const items = selectedItems();
    if (!items.length) { toast('请先选择要移动的项目', 'err'); return; }
    const scope = S.nav === 'personal' ? 'personal' : 'shared';
    await folderPicker({
      title: '移动到',
      desc: `共 ${items.length} 项会被移动到所选文件夹。`,
      scope,
      onOk: async (parent) => {
        let ok = 0;
        const errs = [];
        for (const i of items) {
          try { await jpatch(`/api/team/file/${i.id}/meta`, { parent_id: parent }); ok++; }
          catch (e) { errs.push(`${i.name}：${e.message}`); }
        }
        if (ok) toast(`已移动 ${ok} 项`);
        if (errs.length) toast(errs[0] + (errs.length > 1 ? ` 等 ${errs.length} 项失败` : ''), 'err');
        exitMulti();
        await loadNav();
      },
    });
  }

  async function batchSend() {
    const items = selectedItems();
    if (!items.length) { toast('请先选择要发送的项目', 'err'); return; }
    const files = items.filter((i) => !i.is_dir);
    const skipped = items.length - files.length;
    if (!files.length) { toast('文件夹暂不支持定向发送', 'err'); return; }
    await memberPicker({
      title: '发送给成员', okText: '发送',
      desc: `共 ${files.length} 个文件会复制到对方的「我的文件 / 收到的文件」，只有对方本人可见，并计入对方的个人空间。`
        + (skipped ? `已跳过 ${skipped} 个文件夹。` : ''),
      onOk: async (ids) => {
        let ok = 0, skip = 0;
        const why = [];
        for (const f of files) {
          try {
            const r = await jpost(`/api/team/file/${f.id}/send`, { user_ids: ids });
            ok += r.delivered.length;
            skip += r.skipped.length;
            (r.skipped || []).forEach((s) => why.push(`${f.name}：${s.reason}`));
          } catch (e) { skip += ids.length; why.push(`${f.name}：${e.message}`); }
        }
        // 只说「N 份未发送」等于没说，把原因带上
        const tail = why.length ? `：${why.slice(0, 3).join('；')}${why.length > 3 ? ' 等' : ''}` : '';
        toast(`已发送 ${ok} 份` + (skip ? `，${skip} 份未发送${tail}` : ''), skip ? 'err' : 'ok', skip ? 6000 : 2600);
        exitMulti();
        await loadNav();
      },
    });
  }

  /* 目标文件夹选择器：在当前存储范围内逐层进入 */
  async function folderPicker({ title, desc = '', scope = 'shared', okText = '移动到这里', onOk }) {
    const st = { cur: '', crumb: [] };
    const rowsHTML = (dirs) => (dirs.length
      ? dirs.map((f) => `
        <button class="pick-row" data-fid="${esc(f.id)}">
          <span class="pick-av">${icon('i-folder', 'icon icon-13')}</span>
          <span class="pick-main"><b>${esc(f.name)}</b><small>${esc(f.owner_name || '文件夹')}</small></span>
          <span class="tick">${icon('i-chevron-right', 'icon icon-13')}</span>
        </button>`).join('')
      : '<p style="margin:14px 0;color:var(--text-3);font-size:12.5px">这里没有子文件夹，可直接移动到这里</p>');
    openSheet(`
      <h3>${esc(title)}</h3>
      ${desc ? `<p>${esc(desc)}</p>` : ''}
      <div id="fpPos" style="font-size:12px;color:var(--text-3);margin-bottom:6px"></div>
      <div class="pick" id="fpList"></div>
      <div class="sheet-actions">
        <button class="btn" id="sCancel">取消</button>
        <button class="btn btn-primary" id="sOk">${esc(okText)}</button>
      </div>`, async (box) => {
      $('#sCancel', box).onclick = closeSheet;
      const load = async () => {
        const qs = new URLSearchParams({ scope, view: 'files' });
        if (st.cur) qs.set('parent', st.cur);
        const r = await api(`/api/team/list?${qs}`);
        st.crumb = r.path || [];
        const dirs = r.items.filter((i) => i.is_dir);
        $('#fpList', box).innerHTML = rowsHTML(dirs);
        $$('#fpList .pick-row', box).forEach((b) => {
          b.onclick = () => { st.cur = b.dataset.fid; load(); };
        });
        const path = ['根目录', ...st.crumb.map((c) => esc(c.name))].join(' / ');
        $('#fpPos', box).innerHTML = `位置：${path}`
          + (st.crumb.length ? ' · <button class="pill-btn" id="fpUp">上一级</button>' : '');
        const up = $('#fpUp', box);
        if (up) {
          up.onclick = () => {
            st.cur = st.crumb.length > 1 ? st.crumb[st.crumb.length - 2].id : '';
            load();
          };
        }
      };
      $('#sOk', box).onclick = async () => {
        try { await onOk(st.cur); closeSheet(); } catch (e) { toast(e.message, 'err'); }
      };
      try { await load(); } catch (e) { toast(e.message, 'err'); closeSheet(); }
    });
  }

  function pickUpload() { const p = $('#filePicker'); p.value = ''; p.click(); }
  $('#filePicker').onchange = (e) => uploadFiles(e.target.files);

  /* 成员选择器：数据源为团队成员列表 */
  function pickRowsHTML(items) {
    return items.map((m) => `
      <button class="pick-row" data-uid="${esc(m.user_id)}">
        <span class="pick-av">${m.avatar ? `<img src="${esc(m.avatar)}" alt="">` : esc(initials(m.username))}</span>
        <span class="pick-main">
          <b>${esc(m.username)}</b>
          <small>${esc([m.job_title, m.department].filter(Boolean).join(' · ') || m.role_label)}</small>
        </span>
        <span class="tick">${icon('i-check', 'icon icon-13')}</span>
      </button>`).join('');
  }

  function wirePick(box, sel, multi) {
    $$('.pick-row', box).forEach((b) => {
      b.onclick = () => {
        const uid = b.dataset.uid;
        if (!multi) sel.clear();
        if (sel.has(uid)) sel.delete(uid); else sel.add(uid);
        $$('.pick-row', box).forEach((x) => x.classList.toggle('is-on', sel.has(x.dataset.uid)));
      };
    });
  }

  async function memberPicker({ title, desc = '', okText = '确定', multi = true, onOk }) {
    let items;
    try {
      items = (await api('/api/team/peers')).items;
    } catch (e) { toast(e.message, 'err'); return; }
    if (!items.length) { toast('团队里还没有其他成员', 'err'); return; }
    const sel = new Set();
    openSheet(`
      <h3>${esc(title)}</h3>
      ${desc ? `<p>${esc(desc)}</p>` : ''}
      <div class="pick" id="pkList">${pickRowsHTML(items)}</div>
      <div class="sheet-actions">
        <button class="btn" id="sCancel">取消</button>
        <button class="btn btn-primary" id="sOk">${esc(okText)}</button>
      </div>`, (box) => {
      $('#sCancel', box).onclick = closeSheet;
      wirePick(box, sel, multi);
      $('#sOk', box).onclick = async () => {
        if (!sel.size) { toast('请至少选择一位成员', 'err'); return; }
        try { await onOk([...sel]); closeSheet(); } catch (e) { toast(e.message, 'err'); }
      };
    });
  }

  async function sendItem(it) {
    if (it.is_dir) { toast('文件夹暂不支持定向发送', 'err'); return; }
    await memberPicker({
      title: '发送给成员', okText: '发送',
      desc: `「${it.name}」会复制到对方的「我的文件 / 收到的文件」，只有对方本人可见，并计入对方的个人空间。`,
      onOk: async (ids) => {
        const r = await jpost(`/api/team/file/${it.id}/send`, { user_ids: ids });
        if (r.delivered.length) toast(`已发送给 ${r.delivered.length} 位成员`);
        if (r.skipped.length) toast(`${r.skipped.length} 位未发送：${r.skipped.map((s) => s.reason).join('、')}`, 'err');
      },
    });
  }

  function shareItem(it) {
    // 文件夹没有分享接口，服务端会回 404；不拦的话会被 ApiError 翻成「会话已过期」
    if (it.is_dir) { toast('文件夹暂不支持生成共享链接', 'err'); return; }
    sheet({
      title: '共享', input: true, value: '72', okText: '生成链接',
      desc: '链接有效期（小时）。公开与内部密级可以共享，源码与密钥类文件不可共享。',
      onOk: async (v) => {
        const hours = Math.max(1, Math.min(720, parseInt(v, 10) || 72));
        const r = await jpost(`/api/team/file/${it.id}/share`, { hours });
        const url = `${location.origin}${r.url}`;
        let auto = false;
        try { await navigator.clipboard.writeText(url); auto = true; } catch (e) { /* 剪贴板被拒就走下面的按钮 */ }
        // 原来这里弹的是 window.prompt：阻塞、样式割裂，而且剪贴板失败时用户没法手动拿链接
        openSheet(`
          <h3>链接已生成</h3>
          <p>${hours} 小时内有效，到期自动失效。${auto ? '已复制到剪贴板。' : '复制下面这串发给对方。'}</p>
          <input class="field" id="shUrl" value="${esc(url)}" readonly>
          <div class="sheet-actions">
            <button class="btn btn-primary" id="shCopy">复制链接</button>
          </div>`, (box) => {
          const inp = $('#shUrl', box);
          inp.focus(); inp.select();
          $('#shCopy', box).onclick = () => copyText(url, '链接已复制');
        });
        // 返回 false 阻止 sheet() 收尾时把刚打开的链接弹层一起关掉
        return false;
      },
    });
  }
  function renameItem(it) {
    sheet({
      title: '重命名', input: true, value: it.name, okText: '存储',
      onOk: async (v) => {
        if (!v || v === it.name) return false;
        await jpatch(`/api/team/file/${it.id}/meta`, { name: v });
        toast('已重命名');
        await reloadKeep();
      },
    });
  }
  function classifyItem(it) {
    const L = S.me.labels.classes;
    const order = ['public', 'internal', 'confidential', 'secret'];
    const hint = { public: '全体成员', internal: '正式成员及以上', confidential: '核心成员及以上', secret: '仅拥有者' };
    const maxIdx = order.indexOf(S.me.clearance);
    openSheet(`
      <h3>密级</h3>
      <p>${esc(it.source_locked ? '源码与密钥类文件自动定为「机密」，不可下调。' : '超出权限的文件不会出现在列表中。')}</p>
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:16px">
        ${order.map((k) => {
          const locked = it.source_locked && order.indexOf(k) < order.indexOf('confidential');
          const tooHigh = order.indexOf(k) > maxIdx;
          return `<button class="menu-item" data-cls="${k}" ${locked || tooHigh ? 'disabled' : ''}>
            <span class="tag ${k}">${esc(L[k])}</span>
            <span style="color:var(--text-3);font-size:11.5px">${hint[k]}</span>
            ${it.classification === k ? `<span class="menu-check">${icon('i-check', 'icon icon-13')}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
      <div class="sheet-actions"><button class="btn" id="clsCancel">取消</button></div>`, (box) => {
      $('#clsCancel', box).onclick = closeSheet;
      $$('[data-cls]', box).forEach((b) => {
        b.onclick = async () => {
          try {
            await jpatch(`/api/team/file/${it.id}/meta`, { classification: b.dataset.cls });
            closeSheet(); toast('密级已更新');
            await reloadKeep(); switchTab('meta');
          } catch (e) { toast(e.message, 'err'); }
        };
      });
    });
  }
  function deleteItem(it) {
    sheet({
      title: `删除「${it.name}」`, desc: '项目会移到回收站。', danger: true, okText: '删除',
      onOk: async () => {
        await api(`/api/team/file/${it.id}`, { method: 'DELETE' });
        toast('已移到回收站'); closeInspector();
        await loadNav();
      },
    });
  }
  function restoreItem(it) {
    jpost(`/api/team/file/${it.id}/restore`).then(() => { toast('已放回原处'); closeInspector(); loadNav(); })
      .catch((e) => toast(e.message, 'err'));
  }
  function purgeItem(it) {
    sheet({
      title: `彻底删除「${it.name}」`, desc: '项目和它的全部历史版本都会被抹除，这一步无法撤回。', danger: true, okText: '彻底删除',
      onOk: async () => {
        await api(`/api/team/file/${it.id}/purge`, { method: 'DELETE' });
        toast('已彻底删除'); closeInspector();
        await loadNav();
      },
    });
  }
  function newFolder() {
    sheet({
      title: '新建文件夹', input: true, placeholder: '未命名文件夹', okText: '创建',
      onOk: async (v) => {
        if (!v || !v.trim()) return false;
        const scope = S.nav === 'personal' ? 'personal' : 'shared';
        await jpost('/api/team/folder', { name: v.trim(), scope, parent: (S.nav === 'shared' || S.nav === 'personal') ? S.folder : '' });
        toast('已创建');
        await loadNav();
      },
    });
  }
  async function reloadKeep() {
    const keep = S.sel;
    const scroll = $('#main').scrollTop;
    await loadNav();
    $('#main').scrollTop = scroll;
    const it = S.items.find((i) => i.id === keep);
    if (it) { S.sel = keep; highlight(); const ins = $('#inspector'); if (ins.classList.contains('on')) openInspector(it, S.inspTab); }
    meters();
  }

  /* ===================== 上传 ===================== */
  function uploadOne(file, opts = {}) {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('scope', opts.scope || 'shared');
      if (opts.parent) fd.append('parent', opts.parent);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/team/upload');
      xhr.withCredentials = true;
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && opts.onProgress) opts.onProgress(e.loaded / e.total); };
      xhr.onload = () => {
        let j = {};
        try { j = JSON.parse(xhr.responseText); } catch (e) { /* 忽略 */ }
        if (xhr.status === 200) resolve(j);
        else reject(new ApiError(xhr.status, j.error || `上传失败（${xhr.status}），请重试`, j));
      };
      xhr.onerror = () => reject(new ApiError(0, '网络连接已中断'));
      xhr.send(fd);
    });
  }

  async function uploadFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (!S.me.can_write) { toast('当前角色无法上传', 'err'); return; }
    const scope = S.nav === 'personal' ? 'personal' : 'shared';
    const parent = (S.nav === 'shared' || S.nav === 'personal') ? S.folder : '';
    const note = toast(`正在上传 ${list.length} 个文件`, 'ok', 360000);
    let ok = 0, ver = 0, fail = [];
    for (const f of list) {
      try {
        const r = await uploadOne(f, {
          scope, parent,
          onProgress: (prog) => {
            const span = note.querySelector('span');
            if (span) span.textContent = `${f.name} · ${Math.round(prog * 100)}%`;
          },
        });
        ok++;
        if (r.updated) { ver++; toast(`「${f.name}」已更新为 v${r.version}`); }
      } catch (e) { fail.push(`${f.name}：${e.message}`); }
    }
    note.remove();
    if (ok && !ver) toast(`已上传 ${ok} 个文件`);
    // 原来只报第一条失败原因，其余失败的文件对用户等于凭空消失
    if (fail.length === 1) toast(fail[0], 'err', 4200);
    else if (fail.length) toast(`${fail.length} 个文件上传失败：${fail.slice(0, 3).join('；')}${fail.length > 3 ? ' 等' : ''}`, 'err', 6000);
    await loadNav();
  }

  let dragDepth = 0;
  window.addEventListener('dragenter', (e) => {
    if (!S.me || !S.me.can_write) return;
    if (!Array.from(e.dataTransfer.types || []).includes('Files')) return;
    dragDepth++;
    $('#dropVeil').classList.add('on');
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) $('#dropVeil').classList.remove('on');
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    $('#dropVeil').classList.remove('on');
    if (S.me && S.me.can_write) uploadFiles(e.dataTransfer.files);
  });
  $('#dropVeil').addEventListener('click', () => { dragDepth = 0; $('#dropVeil').classList.remove('on'); });

  /* ===================== 命令面板 ⌘K ===================== */
  // 导航、常用动作、任务、文件统一进一个入口；输入即筛，回车即走
  const cmdk = { items: [], idx: 0, open: false, loading: false };

  function cmdkStatic() {
    const out = [];
    Object.keys(NAV).forEach((k) => {
      if (k === 'activity' || k === 'members') {
        if (!(S.me && S.me.can_manage)) return;
      }
      out.push({ group: 'Go to', label: NAV[k].en, kw: NAV[k].title, icon: NAV[k].icon, run: () => goNav(k) });
    });
    if (S.me && S.me.can_write) {
      out.push({ group: 'Actions', label: 'New Task', kw: '新建 任务', icon: 'i-plus', run: () => taskEditor(null) });
      out.push({ group: 'Actions', label: 'New Token', kw: '令牌 接入 AI', icon: 'i-key', run: () => { goNav('ai'); setTimeout(() => tokenEditor(), 220); } });
      if (FILE_NAVS.has(S.nav) && S.nav !== 'trash') {
        out.push({ group: 'Actions', label: 'New Folder', kw: '新建 文件夹', icon: 'i-folder', run: () => newFolder() });
      }
    }
    out.push({ group: 'Actions', label: 'Reload', kw: '刷新', icon: 'i-history', run: () => { loadNav(); loadCounts(); toast('已刷新'); } });
    out.push({
      group: 'Actions', label: 'Sign out', kw: '锁定 退出 验证', icon: 'i-lock', danger: true,
      run: () => sheet({
        title: '锁定 Team',
        desc: '需要重新输入验证码才能继续使用，已打开的文件不会被改动。',
        danger: true, okText: '锁定',
        onOk: async () => { await jpost('/api/team/auth/logout'); location.reload(); },
      }),
    });
    return out;
  }

  function goNav(nav) {
    switchNav(nav);
    loadNav();
  }

  let cmdkQueued = '';
  let cmdkReturn = null;
  async function cmdkSearch(q) {
    if (!q) return;
    // 上一次搜索还在飞的时候输入又变了：先记下来，等它回来再补一次。
    // 原来直接 return，等于把这次输入丢掉，列表会停在旧查询的结果上。
    if (cmdk.loading) { cmdkQueued = q; return; }
    cmdk.loading = true;
    const found = [];
    const kw = q.toLowerCase();
    const scope = S.nav === 'personal' ? 'personal' : 'shared';
    try {
      const [t, f, sr] = await Promise.all([
        api('/api/team/tasks?filter=mine').catch(() => ({ items: [] })),
        api(`/api/team/list?scope=${scope}&view=files&q=${encodeURIComponent(q)}`).catch(() => ({ items: [] })),
        api(`/api/team/search?scope=all&q=${encodeURIComponent(q)}`).catch(() => ({ items: [] })),
      ]);
      (t.items || []).filter((x) => (x.title || '').toLowerCase().includes(kw)).slice(0, 5)
        .forEach((x) => found.push({
          group: 'Tasks', label: x.title, sub: boardLabel(x.status), icon: 'i-check-circle',
          run: () => taskDetail(x),
        }));
      (f.items || []).slice(0, 5).forEach((x) => found.push({
        group: 'Files', label: x.name, sub: x.is_dir ? 'Folder' : fmtSize(x.size), icon: kindIcon(x).id,
        run: async () => {
          goNav(scope === 'personal' ? 'personal' : 'shared');
          await loadNav();
          const it = S.items.find((y) => y.id === x.id);
          if (it) selectItem(it, false);
          else toast('文件在别的文件夹里', 'err');
        },
      }));
      // 正文命中：GitHub 式的代码搜索，直接给出命中行
      (sr.items || []).slice(0, 8).forEach((h) => {
        const file = h.file || {};
        const m0 = (h.matches || [])[0];
        found.push({
          group: 'Contents', label: file.name || '未命名', kw,
          sub: m0 ? `第 ${m0.line} 行` : (h.name_hit ? '文件名匹配' : ''),
          snippet: m0 ? m0.text : '', icon: kindIcon(file).id,
          run: async () => { await openFileById(file.id); },
        });
      });
    } catch (e) { /* 搜索是加分项，失败就只留命令 */ }
    cmdk.loading = false;
    if (q === ($('#cmdkInput').value || '').trim()) {
      cmdk.items = found.concat(cmdkStatic());
      cmdkRender();
    }
    if (cmdkQueued) { const next = cmdkQueued; cmdkQueued = ''; cmdkSearch(next); }
  }

  function cmdkOpen() {
    cmdk.open = true;
    cmdkReturn = document.activeElement;   // 关掉后要把焦点还回去，键盘用户才不会掉到页面顶部
    cmdk.items = cmdkStatic();
    cmdk.idx = 0;
    $('#cmdk').hidden = false;
    $('#cmdkInput').value = '';
    cmdkRender();
    syncInert();
    $('#cmdkInput').focus();
  }

  function cmdkClose() {
    clearTimeout(cmdk.timer);
    cmdk.open = false;
    $('#cmdk').hidden = true;
    $('#cmdkList').innerHTML = '';
    syncInert();
    // 用 ⌘K 打开时焦点本来就没落在任何元素上（activeElement 是 body），
    // 这时退回到搜索按钮，别让焦点凭空消失
    const back = (cmdkReturn && cmdkReturn.isConnected && cmdkReturn !== document.body) ? cmdkReturn : $('#btnSearch');
    if (back && back.isConnected) back.focus();
    cmdkReturn = null;
  }

  function cmdkRender() {
    const q = ($('#cmdkInput').value || '').trim().toLowerCase();
    const items = cmdk.items.filter((x) => !q
      || x.label.toLowerCase().includes(q)
      || (x.sub || '').toLowerCase().includes(q)
      || (x.kw || '').includes(q));
    cmdk.view = items;
    if (cmdk.idx >= items.length) cmdk.idx = Math.max(0, items.length - 1);
    const host = $('#cmdkList');
    if (!items.length) {
      host.innerHTML = '<div class="cmdk-empty">没有找到匹配的内容。</div>';
      return;
    }
    let html = '', group = '';
    items.forEach((it, i) => {
      if (it.group !== group) { group = it.group; html += `<div class="cmdk-group">${esc(group)}</div>`; }
      html += `<button class="cmdk-item${i === cmdk.idx ? ' is-on' : ''}${it.danger ? ' is-danger' : ''}${it.snippet ? ' is-code' : ''}" data-i="${i}">
        ${it.icon ? icon(it.icon, 'icon icon-13') : ''}<span>${esc(it.label)}</span>
        ${it.sub ? `<span class="sub">${esc(it.sub)}</span>` : ''}${it.snippet ? `<span class="snip">${esc(it.snippet)}</span>` : ''}</button>`;
    });
    host.innerHTML = html;
    $$('.cmdk-item', host).forEach((b) => {
      const i = Number(b.dataset.i);
      b.onmouseenter = () => { cmdk.idx = i; cmdkPaint(); };
      b.onclick = () => cmdkRun(i);
    });
  }

  function cmdkPaint() {
    $$('.cmdk-item').forEach((b) => b.classList.toggle('is-on', Number(b.dataset.i) === cmdk.idx));
    const on = $('.cmdk-item.is-on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }

  function cmdkRun(i) {
    const it = (cmdk.view || [])[i];
    if (!it) return;
    cmdkClose();
    it.run();
  }

  $('#cmdkVeil').onclick = cmdkClose;
  $('#btnSearch').onclick = cmdkOpen;
  $('#cmdkInput').oninput = (e) => {
    cmdk.idx = 0;
    cmdkRender();
    const q = e.target.value.trim();
    clearTimeout(cmdk.timer);
    if (q.length >= 1) cmdk.timer = setTimeout(() => cmdkSearch(q), 220);
  };
  $('#cmdkInput').onkeydown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = (cmdk.view || []).length;
      if (!n) return;
      cmdk.idx = (cmdk.idx + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
      cmdkPaint();
      const on = $('.cmdk-item.is-on');
      if (on) on.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); cmdkRun(cmdk.idx); }
  };

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdk.open) cmdkClose(); else cmdkOpen();
    }
  }, true);

  /* ===================== 工具行与账户 ===================== */
  $('#btnSort').onclick = (e) => {
    openMenu(e.currentTarget, Object.keys(SORT_LABEL).map((k) => ({
      label: SORT_LABEL[k], check: S.sort === k,
      onClick: () => { setSort(k); loadNav(); },
    })).concat([{ sep: true }, {
      label: S.order === 'asc' ? '升序' : '降序', icon: 'i-swap',
      onClick: () => { S.order = S.order === 'asc' ? 'desc' : 'asc'; loadNav(); },
    }]));
  };
  $('#segView').onclick = (e) => {
    const b = e.target.closest('button[data-view]');
    if (!b) return;
    S.view = b.dataset.view;
    $$('#segView button').forEach((x) => x.classList.toggle('is-on', x === b));
    paintList();
  };
  const wantSel = (fn, need, verb) => () => {
    const it = selectedItem();
    if (!it) { toast('请先选择一个项目', 'err'); return; }
    // 只读访客也看得到这几个按钮，别等点下去才由服务端 403 —— 在这里就拦掉
    if (need && !it[need]) { toast(`你没有${verb}这个项目的权限`, 'err'); return; }
    fn(it);
  };
  $('#btnDownload').onclick = wantSel(downloadItem);
  $('#btnSend').onclick = wantSel(sendItem, 'can_write', '发送');
  $('#btnShare').onclick = wantSel(shareItem, 'can_modify', '共享');
  $('#btnRename').onclick = wantSel(renameItem, 'can_modify', '重命名');
  $('#btnDelete').onclick = wantSel(deleteItem, 'can_delete', '删除');
  $('#btnReload').onclick = () => { loadNav(); loadCounts(); toast('已刷新'); };

  $('#btnSelect').onclick = () => { if (S.multi) exitMulti(); else enterMulti(); };
  $('#mbCancel').onclick = () => exitMulti();
  $('#mbAll').onclick = () => checkAll();
  $('#mbDownload').onclick = () => batchDownload();
  $('#mbMove').onclick = () => batchMove();
  $('#mbSend').onclick = () => batchSend();

  let searchTimer = null;
  $('#searchInput').oninput = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { S.q = e.target.value.trim(); loadNav(); }, 240);
  };
  /* ===================== 键盘 ===================== */
  document.addEventListener('keydown', (e) => {
    if ($('#viewer').classList.contains('on')) {
      if (e.key === 'Escape') { closeViewer(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (S.viewer.save) S.viewer.save();
      }
      return;
    }
    const inField = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === 'Escape') {
      if (cmdk.open) { cmdkClose(); return; }
      if ($('#veil').classList.contains('on')) { closeSheet(); return; }
      if ($('#menu').classList.contains('on')) { closeMenu(); return; }
      if (!$('#acctPanel').hidden) { closeAcct(); return; }
      if (document.body.classList.contains('nav-open')) { setNav(false); return; }
      if (S.multi) { exitMulti(); return; }
      if (!inField) closeInspector();
      return;
    }
    if (inField) return;
    if (!FILE_NAVS.has(S.nav)) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && multiEnabled()) {
      e.preventDefault();
      if (!S.multi) enterMulti();
      checkAll();
      return;
    }
    if (e.key === ' ' && S.multi) {
      const r = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.row') : null;
      if (r) { e.preventDefault(); toggleCheck(r.dataset.id); }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const rows = $$('.row');
      if (!rows.length) return;
      e.preventDefault();
      const cur = rows.findIndex((r) => r.dataset.id === S.sel);
      const next = cur < 0
        ? (e.key === 'ArrowDown' ? 0 : rows.length - 1)
        : Math.max(0, Math.min(rows.length - 1, cur + (e.key === 'ArrowDown' ? 1 : -1)));
      rows[next].focus();
      rows[next].scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      const it = selectedItem();
      if (it) { if (it.is_dir) { S.folder = it.id; loadNav(); } else openViewer(it); }
      return;
    }
    if (e.key === ' ') {
      const it = selectedItem();
      if (it && !it.is_dir) { e.preventDefault(); openViewer(it); }
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const it = selectedItem();
      if (it) { e.preventDefault(); deleteItem(it); }
    }
  });

  syncInert();   // 初始状态：#app 还 hidden、侧栏未开，两者都该挡键盘
  boot();
})();

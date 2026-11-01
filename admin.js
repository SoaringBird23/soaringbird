/* ===== SoaringBird 论坛 - 管理后台 JS ===== */

const CATEGORIES = {
  tech: { name: '技术', color: '#0071E3' },
  design: { name: '设计', color: '#BF5AF2' },
  product: { name: '产品', color: '#FF9F0A' },
  career: { name: '职场', color: '#30D158' },
  resource: { name: '资源', color: '#64D2FF' },
  casual: { name: '闲聊', color: '#FF375F' },
};

let currentTab = 'dashboard';
let userPage = 1, postPage = 1, replyPage = 1;
let videoPage = 1, videoStatusFilter = '';
let liveChannelPage = 1, liveChannelStatusFilter = '';
let selectedPosts = new Set();

/* ===== API ===== */
async function api(path, options = {}) {
  const opts = { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...options };
  if (opts.body && typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

/* ===== 初始化 ===== */
async function init() {
  // 深色模式
  const savedTheme = localStorage.getItem('bird_theme');
  if (savedTheme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  try {
    const data = await api('/api/me');
    if (!data.user) {
      showToast('请先登录', 'error');
      setTimeout(() => window.location.href = '/', 1200);
      return;
    }
    // 检查是否管理员
    try {
      const check = await api('/api/admin/check');
      if (!check.is_admin) {
        showToast('无管理员权限', 'error');
        setTimeout(() => window.location.href = '/', 1500);
        return;
      }
      window.__isSuperAdmin = check.is_super_admin;
      // 普通管理员隐藏超管专属 Tab（公告管理、AI 配置）
      if (!check.is_super_admin) {
        document.querySelectorAll('.nav-item[data-tab="announcements"], .nav-item[data-tab="aiconfig"], .nav-item[data-tab="closing"]').forEach(el => el.style.display = 'none');
      }
    } catch (e) {
      if (e.message === '未登录') {
        showToast('请先登录', 'error');
        setTimeout(() => window.location.href = '/', 1200);
      } else {
        showToast(e.message || '无管理员权限', 'error');
        setTimeout(() => window.location.href = '/', 1500);
      }
      return;
    }
    document.getElementById('adminAvatar').textContent = data.user.username.charAt(0).toUpperCase();
    loadDashboard();
  } catch (e) {
    showToast('请先登录', 'error');
    setTimeout(() => window.location.href = '/', 1200);
  }
}

/* ===== Tab 切换 ===== */
function switchTab(tab) {
  currentTab = tab;
  closeSidebar();
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));

  const titles = { dashboard: '仪表盘', users: '用户管理', posts: '帖子管理', replies: '回复管理', bugs: 'Bug 反馈', announcements: '消息 / 公告', closing: '关站通知', ipbans: 'IP 封禁', bannedwords: '违禁词管理', aiconfig: 'AI 配置', video: '视频管理', live: '直播审核', reports: '举报留存', appeals: '申诉管理' };
  document.getElementById('pageTitle').textContent = titles[tab] || '';

  switch (tab) {
    case 'dashboard': loadDashboard(); break;
    case 'users': loadUsers(); break;
    case 'posts': loadPosts(); break;
    case 'replies': loadReplies(); break;
    case 'bugs': loadBugReports(); break;
    case 'announcements': loadAnnouncements(); break;
    case 'closing': loadClosing(); break;
    case 'ipbans': loadIpBans(); break;
    case 'bannedwords': loadBannedWords(); break;
    case 'aiconfig': loadAiConfig(); break;
    case 'video': loadVideoReviews(); break;
    case 'live': loadLiveChannels(); break;
    case 'reports': loadReports(); break;
    case 'appeals': loadAppeals(1); break;
  }
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  sb.classList.toggle('open');
  bd.classList.toggle('show', sb.classList.contains('open'));
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');
}

/* ===== 仪表盘 ===== */
async function loadDashboard() {
  try {
    const data = await api('/api/admin/stats');
    document.getElementById('statUsers').textContent = data.user_count;
    document.getElementById('statPosts').textContent = data.post_count;
    document.getElementById('statReplies').textContent = data.reply_count;
    document.getElementById('statToday').textContent = `${data.new_users_today} 用户 / ${data.new_posts_today} 帖子`;
    // 渲染扩展统计
    const extStats = document.getElementById('extStats');
    if (extStats) {
      extStats.innerHTML = `
        <div class="stat-mini"><span class="stat-mini-num" style="color:var(--green)">${data.new_replies_today}</span><span class="stat-mini-label">今日回复</span></div>
        <div class="stat-mini"><span class="stat-mini-num" style="color:var(--red)">${data.banned_count}</span><span class="stat-mini-label">已封号</span></div>
        <div class="stat-mini"><span class="stat-mini-num" style="color:var(--orange)">${data.muted_count}</span><span class="stat-mini-label">已禁言</span></div>
        <div class="stat-mini"><span class="stat-mini-num" style="color:var(--purple)">${data.pending_bugs}</span><span class="stat-mini-label">待处理Bug</span></div>
      `;
    }
    // 渲染最近活动
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
      const postsHtml = (data.recent_posts || []).map(p => {
        const cat = CATEGORIES[p.category] || { name: p.category, color: '#8e8e93' };
        return `<div class="activity-item" onclick="window.open('/?post='+'${p.id}','_blank')">
          <div class="activity-dot" style="background:${cat.color}"></div>
          <div class="activity-body">
            <div class="activity-title">${esc(p.title)}</div>
            <div class="activity-meta"><span class="cat-tag" style="background:${cat.color}15;color:${cat.color}">${cat.name}</span> · ${esc(p.author)} · ${timeAgo(p.created_at)}</div>
          </div>
        </div>`;
      }).join('');
      const usersHtml = (data.recent_users || []).map(u => `
        <div class="activity-item">
          <div class="avatar" style="width:28px;height:28px;font-size:11px">${esc(u.username.charAt(0).toUpperCase())}</div>
          <div class="activity-body">
            <div class="activity-title">${esc(u.username)}</div>
            <div class="activity-meta">${u.email_verified ? '<span class="role-tag active">已验证</span>' : '<span class="role-tag muted">未验证</span>'} · ${timeAgo(u.created_at)}</div>
          </div>
        </div>
      `).join('');
      recentActivity.innerHTML = `
        <div class="activity-col">
          <div class="activity-head">最新帖子</div>
          ${postsHtml || '<div class="activity-empty">暂无帖子</div>'}
        </div>
        <div class="activity-col">
          <div class="activity-head">新注册用户</div>
          ${usersHtml || '<div class="activity-empty">暂无用户</div>'}
        </div>
      `;
    }
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 用户管理 ===== */
async function loadUsers() {
  const search = document.getElementById('userSearch').value.trim();
  const statusFilter = document.getElementById('userStatusFilter') ? document.getElementById('userStatusFilter').value : '';
  try {
    const params = new URLSearchParams({ page: userPage });
    if (search) params.set('search', search);
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/users?' + params.toString());
    let users = data.users;
    // 客户端状态筛选
    // 注意：后端 /api/admin/users 目前仅支持 page/search 参数，不支持 status 服务端筛选，
    // 因此此处只能在当前页数据上做客户端过滤。这会导致分页场景下筛选结果的总数/页数
    // 仍以全量为基准（可能存在筛选后某页为空的情况）。如需精确分页，需后端新增 status 参数支持。
    if (statusFilter) {
      users = users.filter(u => {
        const isBanned = u.status === 'banned';
        const isMuted = (u.muted_until || 0) > Date.now() / 1000;
        if (statusFilter === 'banned') return isBanned;
        if (statusFilter === 'muted') return isMuted && !isBanned;
        if (statusFilter === 'active') return !isBanned && !isMuted;
        if (statusFilter === 'admin') return u.is_admin || u.is_super_admin;
        if (statusFilter === 'unverified') return !u.email_verified;
        return true;
      });
    }
    renderUserTable(users);
    renderPagination('userPagination', data.total, data.per_page, data.page, (p) => { userPage = p; loadUsers(); });
  } catch (e) { showToast(e.message, 'error'); }
}

function fmtTs(ts) { const d = new Date(ts * 1000); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

function renderUserTable(users) {
  const tbody = document.getElementById('userTableBody');
  if (!users.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">暂无用户</td></tr>'; return; }
  tbody.innerHTML = users.map(u => {
    const isSuper = u.is_super_admin;
    const isBanned = u.status === 'banned';
    const isMuted = (u.muted_until || 0) > Date.now() / 1000;
    const roleTag = isSuper ? '<span class="role-tag super">超管</span>' :
                    u.is_admin ? '<span class="role-tag admin">管理员</span>' :
                    '<span class="role-tag user">用户</span>';
    const statusTag = isBanned ? '<span class="role-tag banned">已封号</span>' :
                      isMuted ? '<span class="role-tag muted">已禁言</span>' :
                      '<span class="role-tag active">正常</span>';
    let subLines = [];
    if (isBanned) {
      const until = (u.ban_until && u.ban_until < 9999999999) ? ('至 ' + fmtTs(u.ban_until)) : '永久';
      subLines.push(until + (u.ban_reason ? ' · ' + esc(u.ban_reason) : ''));
    } else if (isMuted) {
      const until = (u.muted_until && u.muted_until < 9999999999) ? ('至 ' + fmtTs(u.muted_until)) : '永久';
      subLines.push(until + (u.mute_reason ? ' · ' + esc(u.mute_reason) : ''));
    }
    if (u.follow_disabled) subLines.push('禁止被关注');
    const punishInfo = subLines.map(s => `<div class="td-sub">${s}</div>`).join('');
    // 安全栏：邮箱验证状态 + 官方认证
    const emailTag = u.email_verified ? '<span class="role-tag active">邮箱已验证</span>' :
                     (u.email ? '<span class="role-tag muted">邮箱未验证</span>' : '<span class="role-tag muted">无邮箱</span>');
    const verifiedTag = u.verified ? `<span class="role-tag verified">${esc(u.verified_text || '已认证')}</span>` : '';
    const qualityTag = u.is_quality ? '<span class="role-tag" style="background:rgba(255,179,64,0.15);color:#FFB340">优质主播</span>' : '';
    const publisherTag = u.can_publish_news ? '<span class="role-tag publisher">新闻发布</span>' : '';
    const securityCell = `<div class="td-security">${emailTag}${verifiedTag ? '<br>' + verifiedTag : ''}${qualityTag ? '<br>' + qualityTag : ''}${publisherTag ? '<br>' + publisherTag : ''}</div>`;
    // 主操作（最多2个）+ 次要操作收进"更多"菜单
    // 权限划分：超级管理员可执行所有操作；普通管理员只能禁言/封号/解封/解禁
    const isSuperAdmin = !!window.__isSuperAdmin;
    let primaryActions = '';
    let moreActions = [];
    if (!isSuper) {
      if (isBanned) {
        primaryActions += `<button class="btn-sm" onclick="unbanUser('${u.id}')">解封</button>`;
      } else {
        moreActions.push(`<button class="btn-sm warn" onclick="openMuteModal('${u.id}')">${isMuted ? '改禁言' : '禁言'}</button>`);
        if (isMuted) moreActions.push(`<button class="btn-sm" onclick="unmuteUser('${u.id}')">解禁</button>`);
        moreActions.push(`<button class="btn-sm danger" onclick="openBanModal('${u.id}','${escAttr(u.username)}')">封号</button>`);
      }
      // 以下操作仅超级管理员可用
      if (isSuperAdmin) {
        primaryActions = `<button class="btn-sm" onclick="toggleAdmin('${u.id}')">${u.is_admin ? '取消管理员' : '设为管理员'}</button>` + primaryActions;
        moreActions.push(`<button class="btn-sm" onclick="openResetPw('${u.id}')">重置密码</button>`);
        moreActions.push(`<button class="btn-sm" onclick="openVerifyModal('${u.id}','${escAttr(u.username)}', ${u.verified ? 1 : 0}, '${escAttr(u.verified_text || '')}', ${u.is_quality ? 1 : 0})">认证设置</button>`);
        moreActions.push(`<button class="btn-sm" onclick="openAiQuotaModal('${u.id}','${escAttr(u.username)}')">AI额度</button>`);
        moreActions.push(`<button class="btn-sm" onclick="openBoostModal('${u.id}','${escAttr(u.username)}',${u.admin_follower_boost || 0},${u.admin_like_boost || 0})">点赞 / 粉丝调整</button>`);
        moreActions.push(`<button class="btn-sm" onclick="toggleFollowDisabled('${u.id}', ${u.follow_disabled ? 0 : 1})">${u.follow_disabled ? '允许被关注' : '禁止被关注'}</button>`);
        moreActions.push(`<button class="btn-sm" onclick="resetUserAvatar('${u.id}','${escAttr(u.username)}')">重置头像</button>`);
        moreActions.push(`<button class="btn-sm" onclick="resetUserUsername('${u.id}','${escAttr(u.username)}')">重置昵称</button>`);
        moreActions.push(`<label class="permission-toggle-row" onclick="event.stopPropagation()"><span>新闻发布</span><span class="permission-switch"><input type="checkbox" ${u.can_publish_news ? 'checked' : ''} onchange="toggleNewsPublisher('${u.id}', this)"><span class="permission-switch-track"></span></span></label>`);
        if (!u.is_admin) {
          moreActions.push(`<button class="btn-sm danger" onclick="deleteUser('${u.id}','${escAttr(u.username)}')">删除用户</button>`);
        }
      }
    }
    const moreBtn = moreActions.length ? `<div class="more-menu"><button class="btn-sm more-trigger" onclick="toggleMoreMenu(this)">更多 ▾</button><div class="more-dropdown">${moreActions.join('')}</div></div>` : '';
    return `<tr>
    <td class="td-user"><strong>${esc(u.username)}</strong><span class="td-sub">${esc(u.id)}</span></td>
    <td class="td-email">${esc(u.email || '-')}</td>
    <td class="td-num">${u.post_count}</td>
    <td class="td-tags">${roleTag}${statusTag}${punishInfo}</td>
    <td class="td-security">${securityCell}</td>
    <td class="td-time">${timeAgo(u.created_at)}</td>
    <td class="td-time">${u.last_online ? timeAgo(u.last_online) : '-'}</td>
    <td class="td-actions">${primaryActions}${moreBtn}</td>
  </tr>`;
  }).join('');
}

// 更多菜单切换
function toggleMoreMenu(btn) {
  const menu = btn.parentElement;
  // 关闭其他打开的菜单
  document.querySelectorAll('.more-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
  menu.classList.toggle('open');
}

// 点击外部关闭更多菜单
document.addEventListener('click', (e) => {
  if (!e.target.closest('.more-menu')) {
    document.querySelectorAll('.more-menu.open').forEach(m => m.classList.remove('open'));
  }
});

// 打开认证设置弹窗（蓝色认证 + 黄色优质主播标识）
function openVerifyModal(uid, uname, verified, verifiedText, isQuality) {
  document.getElementById('verifyUserId').value = uid;
  document.getElementById('verifyUserName').textContent = uname;
  document.getElementById('verifyCheckbox').checked = !!verified;
  document.getElementById('verifyTextInput').value = verifiedText || '';
  document.getElementById('verifyQualityCheckbox').checked = !!isQuality;
  document.getElementById('verifyModal').classList.add('show');
}

function closeVerifyModal() {
  document.getElementById('verifyModal').classList.remove('show');
}

async function saveVerify() {
  const uid = document.getElementById('verifyUserId').value;
  const verified = document.getElementById('verifyCheckbox').checked;
  const verifiedText = document.getElementById('verifyTextInput').value.trim();
  const isQuality = document.getElementById('verifyQualityCheckbox').checked;
  try {
    await api('/api/admin/users/' + uid + '/verify', {
      method: 'POST',
      body: { verified, verified_text: verifiedText, is_quality: isQuality }
    });
    showToast('认证设置已保存', 'success');
    closeVerifyModal();
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteUser(uid, uname) {
  if (!confirm(`确定删除用户 "${uname}"？其所有帖子和回复也会被删除。`)) return;
  try {
    await api('/api/admin/users/' + uid, { method: 'DELETE' });
    showToast('用户已删除', 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleAdmin(uid) {
  try {
    const data = await api('/api/admin/users/' + uid + '/toggle_admin', { method: 'POST' });
    showToast(data.is_admin ? '已设为管理员' : '已取消管理员', 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleNewsPublisher(uid, input) {
  input.disabled = true;
  try {
    const data = await api('/api/admin/users/' + uid + '/toggle_news_publisher', { method: 'POST' });
    input.checked = !!data.can_publish_news;
    showToast(data.can_publish_news ? '已授予新闻发布权限' : '已撤销新闻发布权限', 'success');
    loadUsers();
  } catch (e) {
    input.checked = !input.checked;
    input.disabled = false;
    showToast(e.message, 'error');
  }
}

function openResetPw(uid) {
  document.getElementById('resetPwUserId').value = uid;
  document.getElementById('resetPwValue').value = '';
  document.getElementById('resetPwModal').classList.add('show');
}

function closeResetPwModal() {
  document.getElementById('resetPwModal').classList.remove('show');
}

async function saveResetPw() {
  const uid = document.getElementById('resetPwUserId').value;
  const pw = document.getElementById('resetPwValue').value;
  if (pw.length < 4) { showToast('密码至少4位', 'error'); return; }
  try {
    await api('/api/admin/users/' + uid + '/reset_password', { method: 'POST', body: { password: pw } });
    showToast('密码已重置', 'success');
    closeResetPwModal();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 帖子管理 ===== */
async function loadPosts() {
  const search = document.getElementById('postSearch').value.trim();
  const category = document.getElementById('postCategoryFilter').value;
  try {
    const params = new URLSearchParams({ page: postPage });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const tbody = document.getElementById('postTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/posts?' + params.toString());
    selectedPosts.clear();
    renderPostTable(data.posts);
    renderPagination('postPagination', data.total, data.per_page, data.page, (p) => { postPage = p; loadPosts(); });
  } catch (e) { showToast(e.message, 'error'); }
}

function renderPostTable(posts) {
  const tbody = document.getElementById('postTableBody');
  if (!posts.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">暂无帖子</td></tr>'; return; }
  tbody.innerHTML = posts.map(p => {
    const cat = CATEGORIES[p.category] || { name: p.category, color: '#8e8e93' };
    const checked = selectedPosts.has(p.id) ? 'checked' : '';
    return `<tr>
      <td style="width:36px;text-align:center"><input type="checkbox" class="row-check" data-pid="${p.id}" ${checked} onchange="togglePostSelection('${p.id}', this.checked)"></td>
      <td><strong>${esc(p.title)}</strong><br><span style="font-size:11px;color:var(--text3)">${esc(p.id)}</span></td>
      <td>${esc(p.author_name)}</td>
      <td><span class="cat-tag" style="background:${cat.color}15;color:${cat.color}">${cat.name}</span></td>
      <td>${p.likes} / ${p.reply_count}</td>
      <td>${timeAgo(p.created_at)}</td>
      <td><div class="td-actions">
        <button class="btn-sm" onclick="openPostBoostModal('${p.id}','${escAttr(p.title)}',${p.likes},${p.admin_like_boost || 0})">点赞调整</button>
        <button class="btn-sm" onclick="openEditPost('${p.id}','${escAttr(p.title)}','${p.category}',decodeURIComponent('${encodeURIComponent(p.content || '')}'))">编辑</button>
        <button class="btn-sm danger" onclick="deletePost('${p.id}','${escAttr(p.title)}')">删除</button>
      </div></td>
    </tr>`;
  }).join('');
  updateBatchBar();
}

function togglePostSelection(pid, checked) {
  if (checked) selectedPosts.add(pid); else selectedPosts.delete(pid);
  updateBatchBar();
}

function selectAllPosts(btn) {
  const checks = document.querySelectorAll('.row-check');
  if (btn.checked) {
    checks.forEach(c => { c.checked = true; selectedPosts.add(c.dataset.pid || ''); });
  } else {
    checks.forEach(c => { c.checked = false; });
    selectedPosts.clear();
  }
  updateBatchBar();
}

function updateBatchBar() {
  const bar = document.getElementById('batchBar');
  if (!bar) return;
  const count = selectedPosts.size;
  bar.style.display = count > 0 ? 'flex' : 'none';
  document.getElementById('batchCount').textContent = count;
}

async function batchDeletePosts() {
  if (selectedPosts.size === 0) return;
  if (!confirm(`确定批量删除 ${selectedPosts.size} 篇帖子？`)) return;
  try {
    const data = await api('/api/admin/posts/batch', { method: 'DELETE', body: { ids: Array.from(selectedPosts) } });
    showToast(`已删除 ${data.deleted} 篇帖子`, 'success');
    selectedPosts.clear();
    loadPosts();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deletePost(pid, title) {
  if (!confirm(`确定删除帖子 "${title}"？`)) return;
  try {
    await api('/api/admin/posts/' + pid, { method: 'DELETE' });
    showToast('帖子已删除', 'success');
    loadPosts();
  } catch (e) { showToast(e.message, 'error'); }
}

function openEditPost(pid, title, category, content) {
  document.getElementById('editPostId').value = pid;
  document.getElementById('editPostTitle').value = title;
  document.getElementById('editPostCategory').value = category;
  document.getElementById('editPostContent').value = content;
  document.getElementById('editPostModal').classList.add('show');
}

function closeEditPostModal() {
  document.getElementById('editPostModal').classList.remove('show');
}

async function saveEditPost() {
  const pid = document.getElementById('editPostId').value;
  const title = document.getElementById('editPostTitle').value.trim();
  const category = document.getElementById('editPostCategory').value;
  const content = document.getElementById('editPostContent').value.trim();
  try {
    await api('/api/admin/posts/' + pid, { method: 'PUT', body: { title, category, content } });
    showToast('帖子已更新', 'success');
    closeEditPostModal();
    loadPosts();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 回复管理 ===== */
async function loadReplies() {
  const postId = document.getElementById('replyPostId').value.trim();
  const search = document.getElementById('replySearch') ? document.getElementById('replySearch').value.trim() : '';
  try {
    const params = new URLSearchParams({ page: replyPage });
    if (postId) params.set('post_id', postId);
    if (search) params.set('search', search);
    document.getElementById('replyTableBody').innerHTML = '<tr><td colspan="6" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/replies?' + params.toString());
    renderReplyTable(data.replies);
    renderPagination('replyPagination', data.total, data.per_page, data.page, (p) => { replyPage = p; loadReplies(); });
  } catch (e) { showToast(e.message, 'error'); }
}

function renderReplyTable(replies) {
  const tbody = document.getElementById('replyTableBody');
  if (!replies.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">暂无回复</td></tr>'; return; }
  tbody.innerHTML = replies.map(r => `<tr>
    <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.content)}</td>
    <td>${esc(r.author_name)}</td>
    <td><span style="font-size:11px;color:var(--text3)">${esc(r.post_title || r.post_id)}</span></td>
    <td>${r.likes}</td>
    <td>${timeAgo(r.created_at)}</td>
    <td><button class="btn-sm danger" onclick="deleteReply('${r.id}')">删除</button></td>
  </tr>`).join('');
}

async function deleteReply(rid) {
  if (!confirm('确定删除该回复？')) return;
  try {
    await api('/api/admin/replies/' + rid, { method: 'DELETE' });
    showToast('回复已删除', 'success');
    loadReplies();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 分页 ===== */
function renderPagination(containerId, total, perPage, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  html += `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage - 1})">‹</button>`;

  const range = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) range.push(i);

  if (range[0] > 1) { html += `<button class="page-btn" onclick="(${onPageChange})(1)">1</button>`; if (range[0] > 2) html += `<span style="color:var(--text3);padding:0 4px">…</span>`; }
  range.forEach(i => { html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>`; });
  if (range[range.length - 1] < totalPages) { if (range[range.length - 1] < totalPages - 1) html += `<span style="color:var(--text3);padding:0 4px">…</span>`; html += `<button class="page-btn" onclick="(${onPageChange})(${totalPages})">${totalPages}</button>`; }

  html += `<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage + 1})">›</button>`;
  container.innerHTML = html;
}

/* ===== 主题切换 ===== */
function toggleAdminTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('bird_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('bird_theme', 'dark');
  }
}

/* ===== 退出 ===== */
async function handleLogout() {
  try { await api('/api/logout', { method: 'POST' }); } catch {}
  window.location.href = '/';
}

/* ===== 工具 ===== */
function esc(str) { const d = document.createElement('div'); d.textContent = str == null ? '' : String(str); return d.innerHTML; }
// 用于 onclick 属性上下文的转义（额外转义引号，防属性逃逸）
function escAttr(str) { return esc(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() / 1000 - ts;
  const s = Math.floor(diff);
  if (s < 60) return '刚刚';
  const m = Math.floor(s / 60);
  if (m < 60) return m + '分钟前';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '小时前';
  const d = Math.floor(h / 24);
  if (d < 30) return d + '天前';
  return new Date(ts * 1000).toLocaleDateString('zh-CN');
}

function debounce(fn, delay) {
  let timer;
  return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
}

function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'toastOut .2s forwards'; setTimeout(() => toast.remove(), 200); }, 2500);
}

/* ===== 举报留存 ===== */
async function loadReports() {
  try {
    const data = await api('/api/admin/reports');
    const threshold = data.threshold || 5;
    const th = document.getElementById('reportThreshold');
    if (th) th.textContent = threshold;
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    if (!data.reports || !data.reports.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">暂无举报记录</td></tr>';
      return;
    }
    tbody.innerHTML = data.reports.map(r => {
      const status = r.removed
        ? '<span class="role-tag banned">已自动下架</span>'
        : '<span class="role-tag active">正常</span>';
      const action =
        `<button class="btn-ghost btn-sm" onclick="viewReport('${r.target_type}','${r.target_id}')">查看/判断</button>` +
        (r.removed ? `<button class="btn-ghost btn-sm" style="color:var(--green)" onclick="restoreReport('${r.target_type}','${r.target_id}')">恢复</button>` : '');
      const countTag = r.count >= threshold
        ? `<span style="color:var(--red);font-weight:600">${r.count}</span>`
        : `<span>${r.count}</span>`;
      return `<tr>
        <td>${esc(r.target_type_label || r.target_type)}</td>
        <td class="ellipsis" title="${esc(r.title || '')}">${esc(r.title || '（内容已被删除）')}</td>
        <td>${esc(r.author || '-')}</td>
        <td class="report-reasons ellipsis" title="${esc(r.content || '')}">${esc(r.content ? (r.content.length > 60 ? r.content.slice(0, 60) + '…' : r.content) : '-')}</td>
        <td class="report-reasons">${esc(r.reasons || '-')}</td>
        <td>${countTag}</td>
        <td>${timeAgo(r.last_at)}</td>
        <td>${status}</td>
        <td>${action}</td>
      </tr>`;
    }).join('');
  } catch (e) {
    showToast(e.message || '加载失败', 'error');
  }
}

function restoreReport(targetType, targetId) {
  if (!confirm('判定该内容无违规？恢复后将重新公开显示，并清除其全部举报记录。')) return;
  api('/api/admin/reports/restore', { method: 'POST', body: { target_type: targetType, target_id: targetId } })
    .then(() => { showToast('已恢复该内容', 'success'); closeReportView(); loadReports(); })
    .catch(e => showToast(e.message || '操作失败', 'error'));
}

let _reportView = null; // { target_type, target_id, removed }

async function viewReport(targetType, targetId) {
  _reportView = { target_type: targetType, target_id: targetId };
  const modal = document.getElementById('reportViewModal');
  const titleEl = document.getElementById('reportViewTitle');
  const metaEl = document.getElementById('reportViewMeta');
  const bodyEl = document.getElementById('reportViewBody');
  const reasonEl = document.getElementById('reportViewReasons');
  const btnRestore = document.getElementById('reportViewRestore');
  const btnRemove = document.getElementById('reportViewRemove');
  if (!modal || !titleEl || !bodyEl) return;
  titleEl.textContent = '加载中…';
  bodyEl.textContent = '';
  btnRemove.disabled = true; btnRestore.disabled = true;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  try {
    const d = await api(`/api/admin/reports/detail?target_type=${encodeURIComponent(targetType)}&target_id=${encodeURIComponent(targetId)}`);
    _reportView.removed = d.removed;
    titleEl.textContent = `${d.target_type_label}：${d.title || '（无标题）'}`;
    metaEl.textContent = `作者：${d.author || '-'}${d.removed ? ' · 已自动下架' : ''}`;
    bodyEl.textContent = d.content || '（无正文内容）';
    reasonEl.innerHTML = (d.reasons && d.reasons.length)
      ? d.reasons.map(r => `<div class="report-reason-item">${esc(r || '(未填写理由)')}</div>`).join('')
      : '<div class="text-muted">无具体理由</div>';
    btnRestore.textContent = d.removed ? '判定无违规 · 恢复' : '判定无违规 · 清除记录并保留';
    btnRestore.disabled = false;
    btnRemove.disabled = false;
  } catch (e) {
    titleEl.textContent = '加载失败';
    bodyEl.textContent = e.message || '无法获取详情';
  }
}

function judgeRemove() {
  if (!_reportView) return;
  if (!confirm('判定该内容确实违规？将彻底删除该内容及其全部举报记录，且不可恢复。')) return;
  const btn = document.getElementById('reportViewRemove');
  btn.disabled = true;
  api('/api/admin/reports/remove-content', { method: 'POST', body: { target_type: _reportView.target_type, target_id: _reportView.target_id } })
    .then(() => { showToast('已删除该内容', 'success'); closeReportView(); loadReports(); })
    .catch(e => { showToast(e.message || '操作失败', 'error'); btn.disabled = false; });
}

function closeReportView() {
  const modal = document.getElementById('reportViewModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
  _reportView = null;
}

/* ===== Bug 反馈 ===== */
async function loadBugReports() {
  try {
    document.getElementById('bugTableBody').innerHTML = '<tr><td colspan="5" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/bug-reports');
    renderBugTable(data.reports || []);
  } catch (e) { showToast(e.message, 'error'); }
}

function renderBugTable(reports) {
  const tbody = document.getElementById('bugTableBody');
  if (!reports.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无反馈</td></tr>'; return; }
  tbody.innerHTML = reports.map(r => {
    const statusTag = r.status === 'resolved' ? '<span class="role-tag resolved">已解决</span>' :
                      r.status === 'ignored' ? '<span class="role-tag ignored">已忽略</span>' :
                      '<span class="role-tag pending">待处理</span>';
    return `<tr>
      <td style="max-width:400px;white-space:pre-wrap;word-break:break-word">${esc(r.content)}</td>
      <td>${esc(r.username)}</td>
      <td>${statusTag}</td>
      <td>${timeAgo(r.created_at)}</td>
      <td><div class="td-actions">
        ${r.status === 'open' ? `<button class="btn-sm" onclick="updateBugStatus('${r.id}','resolved')">已解决</button><button class="btn-sm" onclick="updateBugStatus('${r.id}','ignored')">忽略</button>` : `<button class="btn-sm" onclick="updateBugStatus('${r.id}','open')">重新打开</button>`}
      </div></td>
    </tr>`;
  }).join('');
}

async function updateBugStatus(rid, status) {
  try {
    await api('/api/admin/bug-reports/' + rid, { method: 'PUT', body: { status } });
    loadBugReports();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 禁言/封号 ===== */
function openMuteModal(uid) {
  document.getElementById('muteUserId').value = uid;
  document.getElementById('muteDuration').value = '3600';
  document.getElementById('muteReason').value = '';
  document.getElementById('muteModal').classList.add('show');
}

function closeMuteModal() {
  document.getElementById('muteModal').classList.remove('show');
}

async function confirmMute() {
  const uid = document.getElementById('muteUserId').value;
  const duration = parseInt(document.getElementById('muteDuration').value);
  const reason = document.getElementById('muteReason').value.trim();
  try {
    await api('/api/admin/users/' + uid + '/mute', { method: 'POST', body: { duration, reason } });
    showToast('已禁言', 'success');
    closeMuteModal();
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function unmuteUser(uid) {
  try {
    await api('/api/admin/users/' + uid + '/unmute', { method: 'POST' });
    showToast('已解除禁言', 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

function openBanModal(uid, uname) {
  document.getElementById('banUserId').value = uid;
  document.getElementById('banUserName').textContent = uname || '';
  document.getElementById('banDuration').value = '604800';
  document.getElementById('banReason').value = '';
  document.getElementById('banModal').classList.add('show');
}

function closeBanModal() {
  document.getElementById('banModal').classList.remove('show');
}

async function confirmBan() {
  const uid = document.getElementById('banUserId').value;
  const duration = parseInt(document.getElementById('banDuration').value);
  const reason = document.getElementById('banReason').value.trim();
  try {
    await api('/api/admin/users/' + uid + '/ban', { method: 'POST', body: { duration, reason } });
    showToast('已封号', 'success');
    closeBanModal();
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function unbanUser(uid) {
  try {
    await api('/api/admin/users/' + uid + '/unban', { method: 'POST' });
    showToast('已解封', 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 申诉管理 ===== */
let appealPage = 1;
async function loadAppeals(page) {
  if (page) appealPage = page;
  const status = document.getElementById('appealStatusFilter').value;
  const tbody = document.getElementById('appealTableBody');
  tbody.innerHTML = '<tr><td colspan="7" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
  try {
    const params = new URLSearchParams({ page: appealPage });
    if (status) params.set('status', status);
    const data = await api('/api/admin/appeals?' + params.toString());
    renderAppeals(data.appeals);
    renderPagination('appealPagination', data.total, data.per_page, data.page, p => loadAppeals(p));
  } catch (e) { showToast(e.message, 'error'); }
}

function renderAppeals(list) {
  const tbody = document.getElementById('appealTableBody');
  if (!list || !list.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">暂无申诉</td></tr>'; return; }
  const typeTag = t => t === 'ban' ? '<span class="role-tag banned">封号</span>' : '<span class="role-tag muted">禁言</span>';
  const statusTag = s => s === 'pending' ? '<span class="role-tag" style="background:rgba(255,179,64,0.15);color:#FFB340">待处理</span>' :
                        s === 'accepted' ? '<span class="role-tag active">已通过</span>' :
                        '<span class="role-tag muted">已驳回</span>';
  tbody.innerHTML = list.map(a => {
    const actions = a.status === 'pending'
      ? `<button class="btn-sm" onclick="handleAppeal('${a.id}','accept')">接受</button>
         <button class="btn-sm danger" onclick="handleAppeal('${a.id}','reject')">驳回</button>`
      : '<span class="td-sub">—</span>';
    const handled = a.handled_at ? `${esc(a.handled_by || '')} · ${fmtTs(a.handled_at)}${a.reply ? '<br>' + esc(a.reply) : ''}` : '<span class="td-sub">—</span>';
    return `<tr>
      <td class="td-user"><strong>${esc(a.username || '')}</strong><span class="td-sub">${esc(a.user_id || '')}</span></td>
      <td class="td-tags">${typeTag(a.type)}</td>
      <td>${esc(a.reason || '')}</td>
      <td class="td-time">${a.created_at ? fmtTs(a.created_at) : '-'}</td>
      <td class="td-tags">${statusTag(a.status)}</td>
      <td>${handled}</td>
      <td class="td-actions">${actions}</td>
    </tr>`;
  }).join('');
}

async function handleAppeal(aid, action) {
  let reply = '';
  if (action === 'reject') reply = prompt('驳回理由（会通知用户，可留空）：', '') || '';
  else reply = prompt('通过并可附言（可留空）：', '') || '';
  try {
    await api('/api/admin/appeals/' + aid + '/handle', { method: 'POST', body: { action, reply } });
    showToast(action === 'accept' ? '已接受申诉' : '已驳回申诉', 'success');
    loadAppeals();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 消息 / 公告 ===== */
let _annType = 'notice';
let _annTarget = 'all';
let _annSelected = new Set();
let _annCache = [];

async function loadAnnouncements() {
  try {
    document.getElementById('announcementTableBody').innerHTML = '<tr><td colspan="7" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/announcements');
    _annCache = data.announcements || [];
    renderAnnouncementTable(_annCache);
  } catch (e) { showToast(e.message, 'error'); }
}

function _annPlace(a) {
  const p = [];
  if (a.show_splash) p.push('开屏');
  if (a.show_home) p.push('首页');
  return p.join(' / ') || '—';
}

function _annValid(a) {
  if (!a.expires_at) return '<span style="color:var(--text3)">永久</span>';
  if (a.expires_at * 1000 < Date.now()) return '<span style="color:var(--text3)">已过期</span>';
  return '至 ' + fmtTs(a.expires_at);
}

function renderAnnouncementTable(announcements) {
  const tbody = document.getElementById('announcementTableBody');
  if (!announcements.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">暂无消息</td></tr>'; return; }
  tbody.innerHTML = announcements.map(a => {
    const typePill = a.type === 'important' ? '<span class="ann-pill important">重要</span>' : '<span class="ann-pill">通知</span>';
    const pinPill = a.pinned ? '<span class="ann-pill pinned">置顶</span>' : '';
    const audience = a.target === 'users' ? ('指定 ' + (a.target_count || 0) + ' 人') : '全体用户';
    const pinBtn = a.pinned
      ? `<button class="btn-sm" onclick="toggleAnnPinned('${a.id}',0)">取消置顶</button>`
      : `<button class="btn-sm" onclick="toggleAnnPinned('${a.id}',1)">置顶</button>`;
    return `<tr>
      <td><strong>${esc(a.title)}</strong>${pinPill}</td>
      <td>${typePill}</td>
      <td>${_annPlace(a)}</td>
      <td>${esc(audience)}</td>
      <td>${_annValid(a)}</td>
      <td>${timeAgo(a.created_at)}</td>
      <td>${pinBtn} <button class="btn-sm" onclick="editAnnouncement('${a.id}')">编辑</button> <button class="btn-sm danger" onclick="deleteAnnouncement('${a.id}','${escAttr(a.title)}')">删除</button></td>
    </tr>`;
  }).join('');
}

function _segSet(id, val) {
  document.querySelectorAll('#' + id + ' .seg-item').forEach(b => b.classList.toggle('active', b.dataset.v === val));
}

function annPick(kind, val) {
  if (kind === 'type') {
    _annType = val;
    _segSet('annTypeSeg', val);
  } else if (kind === 'target') {
    _annTarget = val;
    _segSet('annTargetSeg', val);
    const box = document.getElementById('annUserBox');
    if (box) box.style.display = val === 'users' ? '' : 'none';
    if (val === 'users' && !document.getElementById('annUserList').dataset.loaded) annSearchUsers('');
  }
}

function _annUpdateCount() {
  const el = document.getElementById('annUserCount');
  if (el) el.textContent = '已选 ' + _annSelected.size;
}

async function annSearchUsers(q) {
  const list = document.getElementById('annUserList');
  list.dataset.loaded = '1';
  list.innerHTML = '<div class="ann-user-empty"><span class="loading-dot"></span> 加载中…</div>';
  try {
    const data = await api('/api/admin/users?search=' + encodeURIComponent(q || ''));
    const users = data.users || [];
    if (!users.length) { list.innerHTML = '<div class="ann-user-empty">没有匹配的用户</div>'; return; }
    list.innerHTML = users.map(u => `<label class="ann-user-item">
        <input type="checkbox" value="${u.id}" ${_annSelected.has(u.id) ? 'checked' : ''} onchange="annToggleUser('${u.id}', this.checked)">
        <span class="au-name">${esc(u.username)}</span>
        <span class="au-mail">${esc(u.email || '')}</span>
      </label>`).join('');
    _annUpdateCount();
  } catch (e) { list.innerHTML = '<div class="ann-user-empty">加载失败</div>'; }
}

function annToggleUser(id, on) { if (on) _annSelected.add(id); else _annSelected.delete(id); _annUpdateCount(); }

function openAnnouncementModal(a) {
  a = a || null;
  _annSelected = new Set();
  document.getElementById('annEditId').value = a ? a.id : '';
  document.getElementById('annModalTitle').textContent = a ? '编辑消息' : '发布消息';
  document.getElementById('annTitle').value = a ? (a.title || '') : '';
  document.getElementById('annContent').value = a ? (a.content || '') : '';
  document.getElementById('annSplash').checked = a ? !!a.show_splash : true;
  document.getElementById('annHome').checked = a ? !!a.show_home : true;
  document.getElementById('annPinned').checked = a ? !!a.pinned : false;
  document.getElementById('annExpires').value = '0';
  _annType = a ? (a.type || 'notice') : 'notice';
  _annTarget = a ? (a.target || 'all') : 'all';
  _segSet('annTypeSeg', _annType);
  _segSet('annTargetSeg', _annTarget);
  document.getElementById('annUserBox').style.display = _annTarget === 'users' ? '' : 'none';
  const list = document.getElementById('annUserList');
  list.dataset.loaded = '';
  list.innerHTML = '<div class="ann-user-empty">输入关键词搜索用户</div>';
  document.getElementById('annUserSearch').value = '';
  if (a && a.target === 'users' && a.targets) {
    a.targets.split(',').filter(Boolean).forEach(x => _annSelected.add(x));
  }
  _annUpdateCount();
  if (_annTarget === 'users') annSearchUsers('');
  document.getElementById('announcementModal').classList.add('show');
}

function editAnnouncement(aid) {
  const a = _annCache.find(x => x.id === aid);
  if (a) openAnnouncementModal(a);
}

function closeAnnouncementModal() {
  document.getElementById('announcementModal').classList.remove('show');
}

async function createAnnouncement() {
  const editId = document.getElementById('annEditId').value;
  const title = document.getElementById('annTitle').value.trim();
  const content = document.getElementById('annContent').value.trim();
  if (!title || !content) { showToast('标题和内容不能为空', 'error'); return; }
  const show_splash = document.getElementById('annSplash').checked;
  const show_home = document.getElementById('annHome').checked;
  if (!show_splash && !show_home) { showToast('请至少选择「开屏」或「首页」之一', 'error'); return; }
  const targets = Array.from(_annSelected);
  if (_annTarget === 'users' && !targets.length) { showToast('请选择接收消息的用户', 'error'); return; }
  const body = {
    title, content,
    type: _annType,
    pinned: document.getElementById('annPinned').checked,
    show_splash, show_home,
    target: _annTarget,
    targets,
    expires_hours: parseInt(document.getElementById('annExpires').value, 10) || 0,
  };
  try {
    if (editId) {
      await api('/api/admin/announcements/' + editId, { method: 'PATCH', body });
      showToast('消息已更新', 'success');
    } else {
      await api('/api/admin/announcements', { method: 'POST', body });
      showToast('消息已发布', 'success');
    }
    closeAnnouncementModal();
    loadAnnouncements();
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleAnnPinned(aid, pinned) {
  try {
    await api('/api/admin/announcements/' + aid + '/pin', { method: 'POST', body: { pinned: !!pinned } });
    loadAnnouncements();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteAnnouncement(aid, title) {
  if (!confirm(`确定删除消息 "${title}"？`)) return;
  try {
    await api('/api/admin/announcements/' + aid, { method: 'DELETE' });
    showToast('消息已删除', 'success');
    loadAnnouncements();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== IP 封禁 ===== */
async function loadIpBans() {
  try {
    document.getElementById('ipBanTableBody').innerHTML = '<tr><td colspan="5" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/ip-bans');
    renderIpBanTable(data.bans || []);
  } catch (e) { showToast(e.message, 'error'); }
}

function renderIpBanTable(bans) {
  const tbody = document.getElementById('ipBanTableBody');
  if (!bans.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无封禁 IP</td></tr>'; return; }
  tbody.innerHTML = bans.map(b => `<tr>
    <td><strong>${esc(b.ip)}</strong></td>
    <td>${esc(b.reason || '-')}</td>
    <td>${esc(b.created_by_name || '-')}</td>
    <td>${timeAgo(b.created_at)}</td>
    <td><button class="btn-sm danger" onclick="unbanIp('${escAttr(b.ip)}')">解封</button></td>
  </tr>`).join('');
}

function openBanIpModal(ip) {
  document.getElementById('banIpValue').value = ip || '';
  document.getElementById('banIpReason').value = '';
  document.getElementById('banIpModal').classList.add('show');
}

function closeBanIpModal() {
  document.getElementById('banIpModal').classList.remove('show');
}

async function confirmBanIp() {
  const ip = document.getElementById('banIpValue').value.trim();
  const reason = document.getElementById('banIpReason').value.trim();
  if (!ip) { showToast('IP 不能为空', 'error'); return; }
  try {
    await api('/api/admin/ip-bans', { method: 'POST', body: { ip, reason } });
    showToast('IP 已封禁', 'success');
    closeBanIpModal();
    loadIpBans();
  } catch (e) { showToast(e.message, 'error'); }
}

async function unbanIp(ip) {
  if (!confirm(`确定解封 IP "${ip}"？`)) return;
  try {
    await api('/api/admin/ip-bans/' + encodeURIComponent(ip), { method: 'DELETE' });
    showToast('IP 已解封', 'success');
    loadIpBans();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 违禁词管理 ===== */
async function loadBannedWords() {
  try {
    document.getElementById('bannedWordTableBody').innerHTML = '<tr><td colspan="4" class="empty-cell"><span class="loading-dot"></span> 加载中…</td></tr>';
    const data = await api('/api/admin/banned-words');
    renderBannedWordTable(data.words || []);
  } catch (e) { showToast(e.message, 'error'); }
}

function renderBannedWordTable(words) {
  const tbody = document.getElementById('bannedWordTableBody');
  if (!words.length) { tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">暂无违禁词（使用默认词库）</td></tr>'; return; }
  tbody.innerHTML = words.map(w => `<tr>
    <td><strong>${esc(w.word)}</strong></td>
    <td>${esc(w.created_by_name || '-')}</td>
    <td>${timeAgo(w.created_at)}</td>
    <td><button class="btn-sm danger" onclick="deleteBannedWord('${w.id}','${escAttr(w.word)}')">删除</button></td>
  </tr>`).join('');
}

function openAddBannedWordModal() {
  document.getElementById('bannedWordInput').value = '';
  document.getElementById('addBannedWordModal').classList.add('show');
}

function closeAddBannedWordModal() {
  document.getElementById('addBannedWordModal').classList.remove('show');
}

async function confirmAddBannedWord() {
  const word = document.getElementById('bannedWordInput').value.trim();
  if (!word) { showToast('违禁词不能为空', 'error'); return; }
  try {
    await api('/api/admin/banned-words', { method: 'POST', body: { word } });
    showToast('违禁词已添加', 'success');
    closeAddBannedWordModal();
    loadBannedWords();
  } catch (e) { showToast(e.message, 'error'); }
}

function openBatchAddBannedWordModal() {
  document.getElementById('batchBannedWordInput').value = '';
  document.getElementById('batchBannedWordModal').classList.add('show');
}

function closeBatchBannedWordModal() {
  document.getElementById('batchBannedWordModal').classList.remove('show');
}

async function confirmBatchAddBannedWord() {
  const text = document.getElementById('batchBannedWordInput').value.trim();
  if (!text) { showToast('违禁词列表不能为空', 'error'); return; }
  const words = text.split('\n').map(w => w.trim()).filter(w => w);
  if (!words.length) { showToast('未输入有效违禁词', 'error'); return; }
  try {
    const data = await api('/api/admin/banned-words/batch', { method: 'POST', body: { words } });
    showToast(`已添加 ${data.added} 个违禁词`, 'success');
    closeBatchBannedWordModal();
    loadBannedWords();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteBannedWord(id, word) {
  if (!confirm(`确定删除违禁词 "${word}"？`)) return;
  try {
    await api('/api/admin/banned-words/' + id, { method: 'DELETE' });
    showToast('违禁词已删除', 'success');
    loadBannedWords();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== AI 配置（仅审核开关；接口地址/模型/密钥由服务器环境变量配置） ===== */
async function loadAiConfig() {
  try {
    const cfg = await api('/api/admin/ai-config');
    document.getElementById('aiModerationEnabled').checked = !!cfg.moderation_enabled;
    document.getElementById('aiConfigMsg').textContent = '';
  } catch (e) {
    document.getElementById('aiConfigMsg').textContent = '加载失败：' + e.message;
    document.getElementById('aiConfigMsg').style.color = 'var(--red)';
  }
}

async function saveAiConfig() {
  const moderation_enabled = document.getElementById('aiModerationEnabled').checked;
  try {
    await api('/api/admin/ai-config', { method: 'POST', body: { moderation_enabled } });
    showToast('AI 配置已保存', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 用户 AI 额度 ===== */
async function openAiQuotaModal(uid, uname) {
  document.getElementById('aiQuotaUserId').value = uid;
  document.getElementById('aiQuotaUserName').textContent = uname;
  try {
    const q = await api('/api/admin/ai-quota/' + uid);
    document.getElementById('aiQuotaDaily').value = q.daily_limit;
    document.getElementById('aiQuotaMonthly').value = q.monthly_limit;
  } catch (e) {
    document.getElementById('aiQuotaDaily').value = 50;
    document.getElementById('aiQuotaMonthly').value = 500;
  }
  document.getElementById('aiQuotaModal').classList.add('show');
}

function closeAiQuotaModal() {
  document.getElementById('aiQuotaModal').classList.remove('show');
}

async function confirmAiQuota() {
  const uid = document.getElementById('aiQuotaUserId').value;
  const daily_limit = parseInt(document.getElementById('aiQuotaDaily').value) || 0;
  const monthly_limit = parseInt(document.getElementById('aiQuotaMonthly').value) || 0;
  try {
    await api('/api/admin/ai-quota/' + uid, { method: 'POST', body: { daily_limit, monthly_limit } });
    showToast('AI 额度已更新', 'success');
    closeAiQuotaModal();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 声望编辑 ===== */
function openBoostModal(uid, uname, fb, lb) {
  document.getElementById('boostUserId').value = uid;
  document.getElementById('boostUserName').textContent = uname;
  document.getElementById('boostFollower').value = fb || 0;
  document.getElementById('boostLike').value = lb || 0;
  document.getElementById('boostModal').classList.add('show');
}
function closeBoostModal() {
  document.getElementById('boostModal').classList.remove('show');
}
async function confirmBoost() {
  const uid = document.getElementById('boostUserId').value;
  const fb = parseInt(document.getElementById('boostFollower').value) || 0;
  const lb = parseInt(document.getElementById('boostLike').value) || 0;
  try {
    await api('/api/admin/users/' + uid + '/boost', { method: 'POST', body: { follower_boost: fb, like_boost: lb } });
    showToast('声望已更新', 'success');
    closeBoostModal();
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}
function openResetBoostModal() {
  if (!confirm('确定将该用户的声望增幅全部归零？')) return;
  const uid = document.getElementById('boostUserId').value;
  document.getElementById('boostFollower').value = 0;
  document.getElementById('boostLike').value = 0;
  confirmBoost();
}

/* ===== 处罚：禁止被关注 / 重置头像 / 重置昵称 ===== */
async function toggleFollowDisabled(uid, disabled) {
  if (!confirm(disabled ? '确定禁止该用户被他人关注？' : '确定恢复该用户可被关注？')) return;
  try {
    await api('/api/admin/users/' + uid + '/follow-disabled', { method: 'POST', body: { disabled: !!disabled } });
    showToast(disabled ? '已禁止被关注' : '已允许被关注', 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function resetUserAvatar(uid, uname) {
  if (!confirm(`确定将「${uname}」的头像重置为初始状态？`)) return;
  try {
    await api('/api/admin/users/' + uid + '/reset-avatar', { method: 'POST' });
    showToast('头像已重置', 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

async function resetUserUsername(uid, uname) {
  if (!confirm(`确定将「${uname}」的昵称重置为初始昵称？注意：昵称同时是登录名。`)) return;
  try {
    const d = await api('/api/admin/users/' + uid + '/reset-username', { method: 'POST' });
    showToast('昵称已重置为 ' + ((d && d.username) || ''), 'success');
    loadUsers();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 点赞调整 ===== */
function openPostBoostModal(pid, title, current, boost) {
  document.getElementById('postBoostPostId').value = pid;
  document.getElementById('postBoostPostTitle').textContent = title;
  document.getElementById('postBoostCurrent').value = current;
  document.getElementById('postBoostAdd').value = boost || 0;
  document.getElementById('postBoostModal').classList.add('show');
}
function closePostBoostModal() {
  document.getElementById('postBoostModal').classList.remove('show');
}
async function confirmPostBoost() {
  const pid = document.getElementById('postBoostPostId').value;
  const add = parseInt(document.getElementById('postBoostAdd').value) || 0;
  try {
    await api('/api/admin/posts/' + pid + '/likes', { method: 'POST', body: { like_boost: add } });
    showToast('点赞调整已更新', 'success');
    closePostBoostModal();
    loadPosts();
  } catch (e) { showToast(e.message, 'error'); }
}
function openResetPostBoostModal() {
  if (!confirm('确定将该帖子的点赞增幅归零？')) return;
  document.getElementById('postBoostAdd').value = 0;
  confirmPostBoost();
}

/* ===== 视频审核 ===== */
function filterVideos(status) {
  videoStatusFilter = status;
  videoPage = 1;
  // 更新分段控件高亮
  document.querySelectorAll('#videoStatusSeg .seg-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  loadVideoReviews();
}

async function loadVideoReviews() {
  const grid = document.getElementById('videoCardGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="video-empty-state"><span class="loading-dot"></span> 加载中…</div>';
  try {
    const params = new URLSearchParams({ page: videoPage });
    if (videoStatusFilter) params.set('status', videoStatusFilter);
    const data = await api('/api/admin/videos?' + params.toString());
    renderVideoCards(data.videos || []);
    renderPagination('videoPagination', data.total || 0, data.per_page || 20, data.page || 1, (p) => { videoPage = p; loadVideoReviews(); });
  } catch (e) {
    grid.innerHTML = '<div class="video-empty-state">加载失败：' + esc(e.message) + '</div>';
  }
}

function renderVideoCards(videos) {
  const grid = document.getElementById('videoCardGrid');
  if (!videos.length) {
    grid.innerHTML = '<div class="video-empty-state">暂无视频</div>';
    return;
  }
  const statusMap = {
    pending: { label: '待审核', cls: 'pending' },
    approved: { label: '已通过', cls: 'approved' },
    rejected: { label: '已拒绝', cls: 'rejected' },
  };
  grid.innerHTML = videos.map(v => {
    const st = statusMap[v.status] || { label: v.status, cls: '' };
    const duration = v.duration ? formatDuration(v.duration) : '';
    // 操作按钮：根据状态显示不同按钮
    let actions = '';
    if (v.status === 'pending') {
      actions = `<button class="video-btn video-btn-approve" onclick="reviewVideo('${v.id}','approve')">通过</button><button class="video-btn video-btn-reject" onclick="reviewVideo('${v.id}','reject')">拒绝</button>`;
    } else if (v.status === 'approved') {
      actions = `<button class="video-btn video-btn-reject" onclick="reviewVideo('${v.id}','reject')">拒绝</button><button class="video-btn video-btn-delete" onclick="deleteVideoReview('${v.id}')">删除</button>`;
    } else if (v.status === 'rejected') {
      actions = `<button class="video-btn video-btn-approve" onclick="reviewVideo('${v.id}','approve')">通过</button><button class="video-btn video-btn-delete" onclick="deleteVideoReview('${v.id}')">删除</button>`;
    }
    return `<div class="video-card">
      <div class="video-thumb">
        <img src="${esc(v.thumbnail || '')}" alt="" loading="lazy" onerror="this.style.display='none'">
        ${duration ? `<span class="video-duration">${duration}</span>` : ''}
      </div>
      <div class="video-card-body">
        <div class="video-card-top">
          <div class="video-card-title">${esc(v.title || '无标题')}</div>
          <span class="video-status-pill ${st.cls}">${st.label}</span>
        </div>
        <div class="video-card-meta">
          <span class="video-card-author">${esc(v.author_name || '未知')}</span>
          <span>·</span>
          <span>${timeAgo(v.created_at)}</span>
        </div>
        <div class="video-card-actions">${actions}</div>
      </div>
    </div>`;
  }).join('');
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return m + ':' + String(s).padStart(2, '0');
}

async function reviewVideo(id, action) {
  try {
    await api('/api/admin/video/' + id + '/review', { method: 'PUT', body: { action } });
    showToast(action === 'approve' ? '视频已通过' : '视频已拒绝', 'success');
    loadVideoReviews();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteVideoReview(id) {
  if (!confirm('确定删除这个视频？此操作不可恢复。')) return;
  try {
    await api('/api/admin/video/' + id, { method: 'DELETE' });
    showToast('视频已删除', 'success');
    loadVideoReviews();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 直播权限审核 ===== */
function filterLiveChannels(status) {
  liveChannelStatusFilter = status;
  liveChannelPage = 1;
  document.querySelectorAll('#liveStatusSeg .seg-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  loadLiveChannels();
}

async function loadLiveChannels() {
  const grid = document.getElementById('liveChannelGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="video-empty-state"><span class="loading-dot"></span> 加载中…</div>';
  try {
    const params = new URLSearchParams({ page: liveChannelPage });
    if (liveChannelStatusFilter) params.set('status', liveChannelStatusFilter);
    const data = await api('/api/admin/live-channels?' + params.toString());
    renderLiveChannelCards(data.channels || []);
    renderPagination('liveChannelPagination', data.total || 0, data.per_page || 20, data.page || 1, (p) => { liveChannelPage = p; loadLiveChannels(); });
  } catch (e) {
    grid.innerHTML = '<div class="video-empty-state">加载失败：' + esc(e.message) + '</div>';
  }
}

function renderLiveChannelCards(channels) {
  const grid = document.getElementById('liveChannelGrid');
  if (!channels.length) {
    grid.innerHTML = '<div class="video-empty-state">暂无直播申请</div>';
    return;
  }
  const statusMap = {
    pending: { label: '待审核', cls: 'pending' },
    approved: { label: '已通过', cls: 'approved' },
    rejected: { label: '已拒绝', cls: 'rejected' },
  };
  grid.innerHTML = channels.map(c => {
    const st = statusMap[c.status] || { label: c.status, cls: '' };
    let actions = '';
    if (c.status === 'pending') {
      actions = `<button class="video-btn video-btn-approve" onclick="approveLiveChannel('${c.id}')">通过</button><button class="video-btn video-btn-reject" onclick="openRejectLiveChannel('${c.id}')">拒绝</button>`;
    } else if (c.status === 'approved') {
      actions = `<button class="video-btn video-btn-reject" onclick="openRejectLiveChannel('${c.id}')">撤销</button><button class="video-btn video-btn-delete" onclick="deleteLiveChannel('${c.id}')">删除</button>`;
    } else if (c.status === 'rejected') {
      actions = `<button class="video-btn video-btn-approve" onclick="approveLiveChannel('${c.id}')">通过</button><button class="video-btn video-btn-delete" onclick="deleteLiveChannel('${c.id}')">删除</button>`;
    }
    // 精选标记按钮（任何状态都可标记，仅 approved 状态会在首页精选区展示）
    const featuredBtn = `<button class="video-btn ${c.featured ? 'video-btn-approve' : ''}" style="${c.featured ? '' : 'background:rgba(255,255,255,0.06);color:var(--text2)'}" onclick="toggleLiveChannelFeatured('${c.id}')">${c.featured ? '✓ 已精选' : '标为精选'}</button>`;
    const banBtn = c.banned
      ? `<button class="video-btn video-btn-approve" onclick="toggleBanLiveChannel('${c.id}', false)">解封</button>`
      : `<button class="video-btn video-btn-reject" onclick="toggleBanLiveChannel('${c.id}', true)">封禁</button>`;
    actions = featuredBtn + banBtn + actions;
    const reason = c.reject_reason ? `<div class="video-card-meta" style="color:#FF9F0A">原因：${esc(c.reject_reason)}</div>` : '';
    return `<div class="video-card">
      <div class="video-thumb">
        ${c.cover ? `<img src="${escAttr(c.cover)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '<div class="video-empty-state" style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--text3)">无封面</div>'}
      </div>
      <div class="video-card-body">
        <div class="video-card-top">
          <div class="video-card-title">${esc(c.name || '未命名')}</div>
          <span class="video-status-pill ${st.cls}">${st.label}</span>
        </div>
        <div class="video-card-meta">
          <span class="video-card-author">${esc(c.username || '已注销')}</span>
          <span>·</span>
          <span>${timeAgo(c.created_at)}申请</span>
        </div>
        ${reason}
        <div class="video-card-actions">${actions}</div>
      </div>
    </div>`;
  }).join('');
}

async function approveLiveChannel(id) {
  try {
    await api('/api/admin/live-channel/' + id + '/review', { method: 'PUT', body: { action: 'approve' } });
    showToast('已通过直播申请', 'success');
    loadLiveChannels();
  } catch (e) { showToast(e.message, 'error'); }
}

function openRejectLiveChannel(id) {
  document.getElementById('liveRejectId').value = id;
  document.getElementById('liveRejectReason').value = '';
  document.getElementById('liveRejectModal').classList.add('show');
}

function closeLiveRejectModal() {
  document.getElementById('liveRejectModal').classList.remove('show');
}

async function confirmRejectLiveChannel() {
  const id = document.getElementById('liveRejectId').value;
  const reason = document.getElementById('liveRejectReason').value.trim();
  try {
    await api('/api/admin/live-channel/' + id + '/review', { method: 'PUT', body: { action: 'reject', reject_reason: reason } });
    showToast('已拒绝直播申请', 'success');
    closeLiveRejectModal();
    loadLiveChannels();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteLiveChannel(id) {
  if (!confirm('确定删除这个直播申请？此操作不可恢复。')) return;
  try {
    await api('/api/admin/live-channel/' + id, { method: 'DELETE' });
    showToast('已删除', 'success');
    loadLiveChannels();
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleLiveChannelFeatured(id) {
  try {
    const data = await api('/api/admin/live-channel/' + id + '/featured', { method: 'PUT' });
    showToast(data.featured ? '已标记为精选直播间' : '已取消精选', 'success');
    loadLiveChannels();
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleBanLiveChannel(id, banned) {
  try {
    await api('/api/admin/live-channel/' + id + '/ban', { method: 'PUT', body: { banned: banned } });
    showToast(banned ? '已封禁直播间' : '已解封直播间', 'success');
    loadLiveChannels();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 关站通知邮件 ===== */
let closingData = null;
let closingConfirmStep = 0;

async function loadClosing() {
  try {
    const data = await api('/api/admin/closing/preview');
    closingData = data;
    document.getElementById('closingTotal').textContent = data.total;
    document.getElementById('closingSent').textContent = data.already_sent;
    document.getElementById('closingSubject').textContent = data.subject;

    const frame = document.getElementById('closingPreviewFrame');
    if (frame && frame.srcdoc !== data.html) frame.srcdoc = data.html;
    const tp = document.getElementById('closingTextPreview');
    if (tp) tp.textContent = data.text || '';

    // 收件人清单
    const sentEmails = new Set((data.sent || []).map(x => x.email));
    const tbody = document.getElementById('closingRecipientBody');
    if (!data.recipients || !data.recipients.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">没有已验证邮箱的用户</td></tr>';
    } else {
      tbody.innerHTML = data.recipients.map((r, i) => {
        const done = sentEmails.has(r.email);
        return `<tr>
          <td>${i + 1}</td>
          <td>${esc(r.username || '')}</td>
          <td>${esc(r.email || '')}</td>
          <td>${done ? '<span class="role-tag active">已发送</span>' : '<span class="role-tag">待发送</span>'}</td>
        </tr>`;
      }).join('');
    }

    renderClosingLog();
  } catch (e) {
    showToast(e.message || '加载失败', 'error');
  }
}

function renderClosingLog() {
  const box = document.getElementById('closingLog');
  if (!box) return;
  const data = closingData;
  if (!data) return;
  const last = data.last_run || null;
  if (!last) { box.textContent = '暂无记录'; return; }
  box.innerHTML =
    `<div>开始：${esc(String(last.started_at || '').replace('T', ' '))}</div>` +
    `<div>结束：${esc(String(last.finished_at || '').replace('T', ' '))}</div>` +
    `<div>成功 <strong>${last.sent || 0}</strong> · 失败 <strong>${last.failed || 0}</strong> · 跳过 ${last.skipped || 0}</div>`;
  document.getElementById('closingFail').textContent = last.failed || 0;
}

function toggleClosingText() {
  const tp = document.getElementById('closingTextPreview');
  const wrap = document.querySelector('.closing-preview-frame-wrap');
  if (!tp || !wrap) return;
  const show = tp.hasAttribute('hidden');
  if (show) { tp.removeAttribute('hidden'); wrap.style.display = 'none'; }
  else { tp.setAttribute('hidden', ''); wrap.style.display = ''; }
}

async function sendClosingTest() {
  const email = (document.getElementById('closingTestEmail').value || '').trim();
  if (!email || email.indexOf('@') < 0) { showToast('请填写有效的邮箱', 'error'); return; }
  const btn = document.getElementById('closingTestBtn');
  btn.disabled = true; btn.textContent = '发送中…';
  try {
    await api('/api/admin/closing/test', { method: 'POST', body: { email } });
    showToast('测试邮件已发送，请查收', 'success');
  } catch (e) {
    showToast(e.message || '发送失败', 'error');
  } finally {
    btn.disabled = false; btn.textContent = '发送测试';
  }
}

function openClosingConfirm(step) {
  if (!closingData) { showToast('请先加载预览', 'error'); return; }
  closingConfirmStep = step;
  const title = document.getElementById('closingConfirmTitle');
  const body = document.getElementById('closingConfirmBody');
  const next = document.getElementById('closingConfirmNextBtn');
  const modal = document.getElementById('closingConfirmModal');

  if (step === 1) {
    title.textContent = '第一次确认';
    body.innerHTML =
      `<p class="closing-confirm-text">即将向 <strong>${closingData.total}</strong> 位已验证邮箱用户发送关站通知。</p>` +
      `<p class="closing-confirm-text">请确认你已经收到并检查过测试邮件的排版与下载链接。</p>` +
      `<div class="fg" style="margin-top:12px"><label>输入 CONFIRM 继续</label><input type="text" id="closingConfirmInput" placeholder="CONFIRM" autocomplete="off"></div>`;
    next.textContent = '下一步';
    next.className = 'btn-primary';
  } else {
    title.textContent = '第二次确认 · 最终';
    body.innerHTML =
      `<p class="closing-confirm-text">最后确认：向 <strong>${closingData.total}</strong> 位用户正式发送。</p>` +
      `<p class="closing-confirm-text" style="color:var(--red)">发送后无法撤回。已成功发送过的地址会自动跳过。</p>`;
    next.textContent = '确认发送';
    next.className = 'btn-danger';
  }
  modal.classList.add('show');
}

function closeClosingConfirm() {
  closingConfirmStep = 0;
  document.getElementById('closingConfirmModal').classList.remove('show');
}

async function closingConfirmNext() {
  if (closingConfirmStep === 1) {
    const v = (document.getElementById('closingConfirmInput').value || '').trim();
    if (v !== 'CONFIRM') { showToast('请输入 CONFIRM 确认', 'error'); return; }
    openClosingConfirm(2);
    return;
  }
  if (closingConfirmStep === 2) {
    const btn = document.getElementById('closingConfirmNextBtn');
    btn.disabled = true; btn.textContent = '发送中…';
    try {
      const res = await api('/api/admin/closing/send', { method: 'POST', body: { confirm: 'CONFIRM' } });
      const s = res.summary || {};
      showToast(`发送完成：成功 ${s.sent || 0}，失败 ${s.failed || 0}，跳过 ${s.skipped || 0}`, 'success');
      closeClosingConfirm();
      loadClosing();
    } catch (e) {
      showToast(e.message || '发送失败', 'error');
    } finally {
      btn.disabled = false; btn.textContent = '确认发送';
    }
  }
}

/* ===== 启动 ===== */
init();

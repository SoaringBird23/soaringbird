/* Live 前端 — WebRTC P2P + SocketIO 信令 · v20260802-5 (懒加载麦克风 + 摄像头小窗开关) */

const state = {
  user: null, socket: null, streams: [], isHosting: false, isViewing: false,
  localStream: null, hostPCs: new Map(), viewerPC: null,
  currentHostId: null, myHostId: null, sourceType: 'camera',
  hostTimer: null, hostStartTime: 0, peakViewers: 0,
  viewerCap: 10, pendingJoinHostId: null,
  myChannel: null, myChannels: [], coverFile: null,
  featuredChannels: [], likeCount: 0,
  quality: 'auto', // 720p / 1080p / auto
  selectedChannelId: '', // 开播时选中的频道
  camStream: null, camOverlayEl: null, // 屏幕共享时的摄像头小窗
  latencyTimer: null, viewerStatsTimer: null, viewerDisconnectTimer: null,
  hostLatencySamples: [], // 主播端收集的观众延迟
  allChannels: [], allChannelsLoaded: 0,
  editChannelId: '', editCoverFile: null,
  lang: 'zh-CN', // 当前界面语言 zh-CN / zh-TW / en / ja
};

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// 画质参数表
const QUALITY_PRESETS = {
  '720p':  { width: 1280, height: 720, frameRate: 30, maxBitrate: 1500000 },
  '1080p': { width: 1920, height: 1080, frameRate: 30, maxBitrate: 3500000 },
  'auto':  { width: 1280, height: 720, frameRate: 30, maxBitrate: 2500000 },
};

/* ===== 国际化 (i18n) ===== */
// 繁中未覆盖的 key 回退到简中
const I18N = {
  'zh-CN': {
    nav_back: '返回论坛', nav_login: '登录', nav_faq: '常见问题',
    nav_my_channels: '我的直播间', nav_settings: '直播设置', nav_go_live: '开播',
    section_featured: '精选直播', section_featured_sub: '优质主播 · 优先围观',
    section_live: '正在直播', section_all_channels: '全部直播间',
    empty_live: '当前没有直播', empty_live_sub: '点击右上角「开播」开始你的直播',
    badge_live: '正在直播', btn_watch: '观看',
    player_direct: '直连',
    player_direct_status: 'P2P 低延迟',
    modal_go_live: '开始直播', field_source: '直播来源',
    source_camera: '摄像头', source_screen: '屏幕共享',
    field_title: '直播标题', placeholder_title: '给直播起个名字（选填）',
    field_quality: '画质', hint_quality: '720p 1.5Mbps · 1080p 3.5Mbps · Auto 自适应 2.5Mbps。屏幕共享默认 1080p。',
    hint_p2p: '直播基于 P2P，视频流来自你的电脑，观众多时取决于你的上传带宽。',
    btn_cancel: '取消', btn_preview_start: '预览并开播',
    modal_preview: '预览确认', status_getting_preview: '正在获取预览…',
    btn_reselect: '重新选择', btn_confirm_start: '确认开播',
    end_title: '直播已结束', end_sub: '感谢你的直播',
    end_duration: '直播时长', end_peak: '峰值观看',
    btn_done: '完成', btn_again: '再次开播',
    modal_edit_title: '修改直播标题', placeholder_title_short: '给直播起个名字',
    btn_save: '保存', btn_end_live: '结束直播',
    chat_title: '聊天', chat_empty: '暂无消息',
    placeholder_host_chat: '和观众聊天…', placeholder_viewer_chat: '发送消息…',
    status_connecting: '正在连接直播…',
    rail_share: '分享', rail_pip: '画中画', rail_snapshot: '截图',
    dock_mic: '麦克风', dock_cam: '摄像头', dock_title: '修改标题',
    dock_cam_overlay: '摄像头小窗',
    dock_pip: '画中画', dock_snapshot: '截图', dock_fullscreen: '全屏',
    modal_faq: '常见问题',
    modal_settings: '直播设置', modal_my_channels: '我的直播间',
    btn_close: '关闭', btn_apply_channel: '申请新直播间',
    modal_edit_channel: '编辑直播间', field_channel_cover: '直播间封面',
    btn_change: '更换', cover_click_upload: '点击上传封面',
    cover_hint: '建议 16:9 · 最大 7MB', field_channel_name: '直播间名字',
    placeholder_channel_name: '给你的直播间起个名字',
    modal_pick_channel: '选择直播间', btn_next: '下一步',
    btn_disagree: '不同意', btn_agree_continue: '同意并继续',
    settings_language: '语言', settings_quality: '默认画质',
    settings_notif: '直播通知', settings_notif_sub: '关注的主播开播时提醒',
    settings_lowlatency: '低延迟模式', settings_lowlatency_sub: '降低延迟，但可能增加卡顿',
    // 动态文本（toast / 运行时）
    t_login_first: '请先登录', t_lowlatency_on: '已开启低延迟模式',
    t_lowlatency_off: '已关闭低延迟模式', t_video_not_ready: '视频未就绪',
    t_snapshot_saved: '截图已保存', t_lang_changed: '语言已切换',
    t_offline: '离线', t_viewers: '观看', t_peak: '峰值',
    t_count_channels: '个直播间', t_select_channel: '请选择一个直播间',
    t_people_watching: '人观看',
    btn_delete: '删除', t_delete_confirm: '确定删除这个直播间吗？此操作不可撤销。',
    t_delete_ok: '已删除', t_delete_fail: '删除失败', t_delete_live: '正在直播中，无法删除',
  },
  'zh-TW': {
    nav_back: '返回論壇', nav_login: '登入', nav_faq: '常見問題',
    nav_my_channels: '我的直播間', nav_settings: '直播設定', nav_go_live: '開播',
    section_featured: '精選直播', section_featured_sub: '優質主播 · 優先圍觀',
    section_live: '正在直播', section_all_channels: '全部直播間',
    empty_live: '目前沒有直播', empty_live_sub: '點擊右上角「開播」開始你的直播',
    badge_live: '正在直播', btn_watch: '觀看',
    player_direct: '直連',
    player_direct_status: 'P2P 低延遲',
    modal_go_live: '開始直播', field_source: '直播來源',
    source_camera: '攝像頭', source_screen: '螢幕共享',
    field_title: '直播標題', placeholder_title: '給直播起個名字（選填）',
    field_quality: '畫質', hint_quality: '720p 1.5Mbps · 1080p 3.5Mbps · Auto 自適應 2.5Mbps。螢幕共享預設 1080p。',
    hint_p2p: '直播基於 P2P，視訊流來自你的電腦，觀眾多時取決於你的上傳頻寬。',
    btn_cancel: '取消', btn_preview_start: '預覽並開播',
    modal_preview: '預覽確認', status_getting_preview: '正在取得預覽…',
    btn_reselect: '重新選擇', btn_confirm_start: '確認開播',
    end_title: '直播已結束', end_sub: '感謝你的直播',
    end_duration: '直播時長', end_peak: '峰值觀看',
    btn_done: '完成', btn_again: '再次開播',
    modal_edit_title: '修改直播標題', placeholder_title_short: '給直播起個名字',
    btn_save: '儲存', btn_end_live: '結束直播',
    chat_title: '聊天', chat_empty: '暫無訊息',
    placeholder_host_chat: '和觀眾聊天…', placeholder_viewer_chat: '發送訊息…',
    status_connecting: '正在連接直播…',
    rail_share: '分享', rail_pip: '子母畫面', rail_snapshot: '截圖',
    dock_mic: '麥克風', dock_cam: '攝像頭', dock_title: '修改標題',
    dock_cam_overlay: '攝像頭小窗',
    dock_pip: '子母畫面', dock_snapshot: '截圖', dock_fullscreen: '全螢幕',
    modal_faq: '常見問題',
    modal_settings: '直播設定', modal_my_channels: '我的直播間',
    btn_close: '關閉', btn_apply_channel: '申請新直播間',
    modal_edit_channel: '編輯直播間', field_channel_cover: '直播間封面',
    btn_change: '更換', cover_click_upload: '點擊上傳封面',
    cover_hint: '建議 16:9 · 最大 7MB', field_channel_name: '直播間名字',
    placeholder_channel_name: '給你的直播間起個名字',
    modal_pick_channel: '選擇直播間', btn_next: '下一步',
    btn_disagree: '不同意', btn_agree_continue: '同意並繼續',
    settings_language: '語言', settings_quality: '預設畫質',
    settings_notif: '直播通知', settings_notif_sub: '關注的主播開播時提醒',
    settings_lowlatency: '低延遲模式', settings_lowlatency_sub: '降低延遲，但可能增加卡頓',
    t_login_first: '請先登入', t_lowlatency_on: '已開啟低延遲模式',
    t_lowlatency_off: '已關閉低延遲模式', t_video_not_ready: '視訊未就緒',
    t_snapshot_saved: '截圖已儲存', t_lang_changed: '語言已切換',
    t_offline: '離線', t_viewers: '觀看', t_peak: '峰值',
    t_count_channels: '個直播間', t_select_channel: '請選擇一個直播間',
    t_people_watching: '人觀看',
    btn_delete: '刪除', t_delete_confirm: '確定刪除這個直播間嗎？此操作不可撤銷。',
    t_delete_ok: '已刪除', t_delete_fail: '刪除失敗', t_delete_live: '正在直播中，無法刪除',
  },
  'en': {
    nav_back: 'Back to forum', nav_login: 'Sign in', nav_faq: 'FAQ',
    nav_my_channels: 'My Channels', nav_settings: 'Live Settings', nav_go_live: 'Go Live',
    section_featured: 'Featured', section_featured_sub: 'Top streamers · get in early',
    section_live: 'Live Now', section_all_channels: 'All Channels',
    empty_live: 'No live streams', empty_live_sub: 'Tap Go Live at the top right to start streaming',
    badge_live: 'LIVE', btn_watch: 'Watch',
    player_direct: 'Direct',
    player_direct_status: 'P2P Low Latency',
    modal_go_live: 'Start Live', field_source: 'Source',
    source_camera: 'Camera', source_screen: 'Screen Share',
    field_title: 'Stream Title', placeholder_title: 'Name your stream (optional)',
    field_quality: 'Quality', hint_quality: '720p 1.5Mbps · 1080p 3.5Mbps · Auto adaptive 2.5Mbps. Screen share defaults to 1080p.',
    hint_p2p: 'Live streaming is P2P. Bandwidth depends on your upload speed with more viewers.',
    btn_cancel: 'Cancel', btn_preview_start: 'Preview & Start',
    modal_preview: 'Preview', status_getting_preview: 'Getting preview…',
    btn_reselect: 'Reselect', btn_confirm_start: 'Confirm & Start',
    end_title: 'Stream Ended', end_sub: 'Thanks for streaming',
    end_duration: 'Duration', end_peak: 'Peak Viewers',
    btn_done: 'Done', btn_again: 'Stream Again',
    modal_edit_title: 'Edit Stream Title', placeholder_title_short: 'Name your stream',
    btn_save: 'Save', btn_end_live: 'End Stream',
    chat_title: 'Chat', chat_empty: 'No messages yet',
    placeholder_host_chat: 'Chat with viewers…', placeholder_viewer_chat: 'Send a message…',
    status_connecting: 'Connecting to stream…',
    rail_share: 'Share', rail_pip: 'PiP', rail_snapshot: 'Snapshot',
    dock_mic: 'Microphone', dock_cam: 'Camera', dock_title: 'Edit Title',
    dock_cam_overlay: 'Camera Overlay',
    dock_pip: 'Picture in Picture', dock_snapshot: 'Snapshot', dock_fullscreen: 'Fullscreen',
    modal_faq: 'FAQ',
    modal_settings: 'Live Settings', modal_my_channels: 'My Channels',
    btn_close: 'Close', btn_apply_channel: 'Apply for New Channel',
    modal_edit_channel: 'Edit Channel', field_channel_cover: 'Channel Cover',
    btn_change: 'Change', cover_click_upload: 'Click to upload cover',
    cover_hint: 'Recommended 16:9 · Max 7MB', field_channel_name: 'Channel Name',
    placeholder_channel_name: 'Name your channel',
    modal_pick_channel: 'Select Channel', btn_next: 'Next',
    btn_disagree: 'Disagree', btn_agree_continue: 'Agree & Continue',
    settings_language: 'Language', settings_quality: 'Default Quality',
    settings_notif: 'Live Notifications', settings_notif_sub: 'Notify when followed streamers go live',
    settings_lowlatency: 'Low Latency Mode', settings_lowlatency_sub: 'Lower latency, but may increase stutter',
    t_login_first: 'Please sign in first', t_lowlatency_on: 'Low latency mode enabled',
    t_lowlatency_off: 'Low latency mode disabled', t_video_not_ready: 'Video not ready',
    t_snapshot_saved: 'Snapshot saved', t_lang_changed: 'Language switched',
    t_offline: 'Offline', t_viewers: 'watching', t_peak: 'peak',
    t_count_channels: 'channels', t_select_channel: 'Please select a channel',
    t_people_watching: 'watching',
    btn_delete: 'Delete', t_delete_confirm: 'Are you sure you want to delete this channel? This cannot be undone.',
    t_delete_ok: 'Deleted', t_delete_fail: 'Delete failed', t_delete_live: 'Currently live, cannot delete',
  },
  'ja': {
    nav_back: 'フォーラムに戻る', nav_login: 'ログイン', nav_faq: 'よくある質問',
    nav_my_channels: 'マイチャンネル', nav_settings: 'ライブ設定', nav_go_live: '配信する',
    section_featured: '注目のライブ', section_featured_sub: '人気配信者 · 早めにチェック',
    section_live: 'ライブ配信中', section_all_channels: 'すべてのチャンネル',
    empty_live: '現在ライブ配信はありません', empty_live_sub: '右上の「配信する」から配信を始めましょう',
    badge_live: 'ライブ配信中', btn_watch: '視聴',
    player_direct: '直接接続',
    player_direct_status: 'P2P 低遅延',
    modal_go_live: 'ライブ配信を開始', field_source: '配信ソース',
    source_camera: 'カメラ', source_screen: '画面共有',
    field_title: '配信タイトル', placeholder_title: '配信のタイトルを入力（任意）',
    field_quality: '画質', hint_quality: '720p 1.5Mbps · 1080p 3.5Mbps · Auto 自動調整 2.5Mbps。画面共有は既定で 1080p。',
    hint_p2p: '配信は P2P 方式で、映像はあなたの端末から送信されます。視聴者が多い場合はアップロード帯域に依存します。',
    btn_cancel: 'キャンセル', btn_preview_start: 'プレビューして配信',
    modal_preview: 'プレビュー確認', status_getting_preview: 'プレビューを取得中…',
    btn_reselect: '選び直す', btn_confirm_start: '配信を開始',
    end_title: '配信が終了しました', end_sub: '配信ありがとうございました',
    end_duration: '配信時間', end_peak: '最大視聴者数',
    btn_done: '完了', btn_again: 'もう一度配信',
    modal_edit_title: '配信タイトルを変更', placeholder_title_short: '配信のタイトルを入力',
    btn_save: '保存', btn_end_live: '配信を終了',
    chat_title: 'チャット', chat_empty: 'メッセージはありません',
    placeholder_host_chat: '視聴者とチャット…', placeholder_viewer_chat: 'メッセージを送信…',
    status_connecting: 'ライブに接続中…',
    rail_share: '共有', rail_pip: 'ピクチャ・イン・ピクチャ', rail_snapshot: 'スクリーンショット',
    dock_mic: 'マイク', dock_cam: 'カメラ', dock_title: 'タイトルを変更',
    dock_cam_overlay: 'カメラ小窓',
    dock_pip: 'ピクチャ・イン・ピクチャ', dock_snapshot: 'スクリーンショット', dock_fullscreen: '全画面',
    modal_faq: 'よくある質問',
    modal_settings: 'ライブ設定', modal_my_channels: 'マイチャンネル',
    btn_close: '閉じる', btn_apply_channel: '新しいチャンネルを申請',
    modal_edit_channel: 'チャンネルを編集', field_channel_cover: 'チャンネルカバー',
    btn_change: '変更', cover_click_upload: 'クリックしてカバーをアップロード',
    cover_hint: '推奨 16:9 · 最大 7MB', field_channel_name: 'チャンネル名',
    placeholder_channel_name: 'チャンネルの名前を入力',
    modal_pick_channel: 'チャンネルを選択', btn_next: '次へ',
    btn_disagree: '同意しない', btn_agree_continue: '同意して続ける',
    settings_language: '言語', settings_quality: 'デフォルト画質',
    settings_notif: 'ライブ通知', settings_notif_sub: 'フォロー中の配信者が配信を開始したら通知',
    settings_lowlatency: '低遅延モード', settings_lowlatency_sub: '遅延を抑えますが、映像が乱れる場合があります',
    // 动态文本（toast / 运行时）
    t_login_first: '先にログインしてください', t_lowlatency_on: '低遅延モードをオンにしました',
    t_lowlatency_off: '低遅延モードをオフにしました', t_video_not_ready: '映像の準備ができていません',
    t_snapshot_saved: 'スクリーンショットを保存しました', t_lang_changed: '言語を切り替えました',
    t_offline: 'オフライン', t_viewers: '視聴', t_peak: 'ピーク',
    t_count_channels: 'チャンネル', t_select_channel: 'チャンネルを選択してください',
    t_people_watching: '人が視聴中',
    btn_delete: '削除', t_delete_confirm: 'このチャンネルを削除してもよろしいですか？この操作は取り消せません。',
    t_delete_ok: '削除しました', t_delete_fail: '削除に失敗しました', t_delete_live: '配信中は削除できません',
  },
};

function getLang() { return state.lang || 'zh-CN'; }
function setLang(lang) {
  if (!I18N[lang]) lang = 'zh-CN';
  state.lang = lang;
  localStorage.setItem('live_lang', lang);
  applyI18n();
  syncLangSeg();
}

// 翻译运行时文本
function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N['zh-CN'][key] || key;
}

// 同步设置模态里的语言分段控件
function syncLangSeg() {
  const seg = document.getElementById('langSeg');
  if (!seg) return;
  seg.querySelectorAll('.lv-seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === getLang());
  });
}

// 应用所有 data-i18n 标记的元素
function applyI18n() {
  const lang = getLang();
  const dict = I18N[lang] || I18N['zh-CN'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = dict[key] || I18N['zh-CN'][key] || key;
    el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = dict[key] || I18N['zh-CN'][key] || key;
    el.setAttribute('title', val);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const val = dict[key] || I18N['zh-CN'][key] || key;
    el.setAttribute('aria-label', val);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = dict[key] || I18N['zh-CN'][key] || key;
    el.setAttribute('placeholder', val);
  });
  // 更新 <html lang> 以辅助无障碍/输入法
  document.documentElement.setAttribute('lang', lang);
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('live_settings') || '{}');
    if (s.quality && QUALITY_PRESETS[s.quality]) state.quality = s.quality;
    return Object.assign({ quality: 'auto', notif: false, lowLatency: false }, s);
  } catch (e) { return { quality: 'auto', notif: false, lowLatency: false }; }
}
function saveSettings(s) { localStorage.setItem('live_settings', JSON.stringify(s)); }

function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'lv-toast show ' + type;
  setTimeout(() => { t.className = 'lv-toast'; }, 2600);
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return '刚刚';
  const m = Math.floor(s / 60); if (m < 60) return m + '分钟';
  const h = Math.floor(m / 60); if (h < 24) return h + '小时';
  return Math.floor(h / 24) + '天';
}

function fmtN(n) { if (!n) return '0'; if (n >= 10000) return (n/10000).toFixed(1)+'万'; return String(n); }

function requireLogin() { toast(t('t_login_first'), 'error'); setTimeout(() => { window.location.href = '/signin?redirect=/live'; }, 1000); }

/* ===== 初始化 ===== */
async function init() {
  const settings = loadSettings();
  state.quality = settings.quality;
  // 加载语言偏好并应用 i18n（在渲染列表前完成，避免闪烁）
  const savedLang = localStorage.getItem('live_lang');
  if (savedLang && I18N[savedLang]) state.lang = savedLang;
  applyI18n();
  // 同步设置 UI（在模态打开时也会同步）
  try { const d = await fetch('/api/me').then(r => r.json()); state.user = d.user || null; } catch (e) { state.user = null; }
  if (state.user) {
    document.getElementById('navLoginBtn').style.display = 'none';
    document.getElementById('navUser').style.display = 'flex';
    if (state.user.avatar) document.getElementById('navAvatar').src = state.user.avatar;
    // 拉取我的所有直播频道
    try {
      const cd = await fetch('/api/live/my-channels').then(r => r.json());
      state.myChannels = cd.channels || [];
      // myChannel 保留向后兼容：取最近一个 approved 的
      state.myChannel = state.myChannels.find(c => c.status === 'approved') || state.myChannels[0] || null;
    } catch (e) { state.myChannels = []; state.myChannel = null; }
    updateGoLiveButton();
  }
  // 拉取精选直播频道（含离线，管理页标记的精选）
  loadFeaturedChannels();
  // 拉取全部直播间
  loadAllChannels();
  // 绑定事件（容错：单个元素缺失不中断初始化）
  try { bindEvents(); } catch (e) { console.error('[live] bindEvents error:', e); }
  // 同步默认画质到开播模态分段控件
  syncQualitySeg();
  syncLangSeg();
  if (localStorage.getItem('live_agreed') === '1') {
    startLiveApp();
  } else {
    document.getElementById('liveConsent').classList.add('show');
  }
}

// 同步开播模态里的画质分段控件
function syncQualitySeg() {
  const seg = document.getElementById('qualitySeg');
  if (!seg) return;
  seg.querySelectorAll('.lv-seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.quality === state.quality);
  });
}

// 拉取精选直播频道（管理页标记的精选，含离线状态）
async function loadFeaturedChannels() {
  try {
    const d = await fetch('/api/live/featured-channels').then(r => r.json());
    state.featuredChannels = d.channels || [];
    renderFeaturedSection();
  } catch (e) { /* 静默失败 */ }
}

async function loadAllChannels() {
  try {
    const d = await fetch('/api/live/channels?page=1').then(r => r.json());
    state.allChannels = d.channels || [];
    state.allChannelsLoaded = Date.now();
    renderAllChannels();
  } catch (e) { /* 静默失败 */ }
}

function renderAllChannels() {
  const grid = document.getElementById('allChannelsGrid');
  const section = document.getElementById('allChannelsSection');
  const countEl = document.getElementById('allChannelsCount');
  if (!grid) return;
  grid.textContent = '';
  if (!state.allChannels.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  countEl.textContent = state.allChannels.length + ' ' + t('t_count_channels');
  // 同步在线状态
  for (const ch of state.allChannels) {
    const s = state.streams.find(x => x.host_id === ch.host_id);
    if (s) {
      ch.is_live = true; ch.viewer_count = s.viewer_count; ch.title = s.title; ch.started_at = s.started_at;
    } else if (ch.started_at === 0) {
      ch.is_live = false;
    }
  }
  for (const ch of state.allChannels) grid.appendChild(buildChannelCard(ch));
}

function buildChannelCard(ch) {
  const card = el('div', 'lv-channel-card' + (ch.is_live ? '' : ' offline'));
  const thumb = el('div', 'lv-channel-thumb');
  const thumbImg = ch.cover || ch.avatar;
  if (thumbImg) thumb.style.backgroundImage = `url(${thumbImg})`;
  const status = el('div', 'lv-channel-status ' + (ch.is_live ? 'live' : 'offline'));
  status.innerHTML = '<span class="lv-status-dot"></span>' + (ch.is_live ? 'LIVE' : t('t_offline'));
  thumb.appendChild(status);
  if (ch.is_live) {
    const viewers = el('div', 'lv-featured-viewers');
    viewers.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' + fmtN(ch.viewer_count);
    thumb.appendChild(viewers);
  }
  if (ch.is_quality) thumb.insertAdjacentHTML('beforeend', qualityBadgeHTML('lv-card-quality'));
  card.appendChild(thumb);
  const body = el('div', 'lv-channel-body');
  body.appendChild(el('div', 'lv-channel-title', ch.title || ch.name));
  const author = el('div', 'lv-channel-author');
  const av = el('img', 'lv-card-avatar'); if (ch.avatar) av.src = ch.avatar;
  av.onclick = (e) => { e.stopPropagation(); openHostCard(ch); };
  author.appendChild(av);
  author.appendChild(el('span', 'lv-channel-name', ch.username));
  body.appendChild(author);
  const rep = el('button', 'lv-report-btn');
  rep.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4c3-1 6.5-1 9 0v9c-2.5-1-6-1-9 0"/></svg>';
  rep.title = '举报';
  rep.setAttribute('aria-label', '举报');
  rep.onclick = (e) => { e.stopPropagation(); openReportSheet('live', ch.id, ch.title || ch.name); };
  body.appendChild(rep);
  card.appendChild(body);
  card.onclick = () => { if (ch.is_live) joinView(ch.host_id); else toast(t('t_offline'), 'error'); };
  return card;
}

function renderFeaturedSection() {
  const featuredGrid = document.getElementById('featuredGrid');
  const featuredSection = document.getElementById('featuredSection');
  if (!featuredGrid) return;
  featuredGrid.textContent = '';
  if (!state.featuredChannels.length) { featuredSection.style.display = 'none'; return; }
  featuredSection.style.display = '';
  for (const ch of state.featuredChannels) featuredGrid.appendChild(buildFeaturedChannelCard(ch));
}

function buildFeaturedChannelCard(ch) {
  const card = el('div', 'lv-featured-card' + (ch.is_live ? '' : ' offline'));
  const thumb = el('div', 'lv-featured-thumb');
  const thumbImg = ch.cover || ch.avatar;
  if (thumbImg) thumb.style.backgroundImage = `url(${thumbImg})`;
  if (ch.is_live) {
    const live = el('div', 'lv-featured-live');
    live.innerHTML = '<span class="lv-live-badge lg"><span class="lv-live-dot"></span>' + t('badge_live') + '</span>';
    thumb.appendChild(live);
    const viewers = el('div', 'lv-featured-viewers');
    viewers.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' + fmtN(ch.viewer_count) + ' ' + t('t_viewers');
    thumb.appendChild(viewers);
  } else {
    thumb.appendChild(el('div', 'lv-featured-offline', t('t_offline')));
  }
  if (ch.is_quality) thumb.insertAdjacentHTML('beforeend', qualityBadgeHTML('lv-card-quality'));
  card.appendChild(thumb);
  const body = el('div', 'lv-featured-body');
  body.appendChild(el('div', 'lv-featured-title', ch.title || ch.name));
  const author = el('div', 'lv-featured-author');
  const av = el('img', 'lv-card-avatar'); if (ch.avatar) av.src = ch.avatar;
  av.onclick = (e) => { e.stopPropagation(); openHostCard(ch); };
  author.appendChild(av);
  author.appendChild(el('span', 'lv-featured-name', ch.username));
  if (ch.is_quality) author.insertAdjacentHTML('beforeend', qualityBadgeHTML());
  body.appendChild(author);
  const rep2 = el('button', 'lv-report-btn');
  rep2.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4c3-1 6.5-1 9 0v9c-2.5-1-6-1-9 0"/></svg>';
  rep2.title = '举报';
  rep2.setAttribute('aria-label', '举报');
  rep2.onclick = (e) => { e.stopPropagation(); openReportSheet('live', ch.id, ch.title || ch.name); };
  body.appendChild(rep2);
  card.appendChild(body);
  card.onclick = () => { if (ch.is_live) joinView(ch.host_id); else toast(t('t_offline'), 'error'); };
  return card;
}

// 根据 myChannels 状态更新开播按钮文案
function updateGoLiveButton() {
  const btn = document.getElementById('goLiveBtn');
  const channels = state.myChannels || [];
  const approved = channels.filter(c => c.status === 'approved');
  const pending = channels.find(c => c.status === 'pending');
  const rejected = channels.find(c => c.status === 'rejected');
  if (!channels.length || (!approved.length && !pending && !rejected)) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>申请直播';
    btn.dataset.mode = 'apply';
    return;
  }
  if (pending && !approved.length) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>审核中';
    btn.dataset.mode = 'pending';
  } else if (approved.length) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M6.34 6.34a8 8 0 0 0 0 11.32M17.66 17.66a8 8 0 0 0 0-11.32M3.51 3.51a12 12 0 0 0 0 16.97M20.49 20.49a12 12 0 0 0 0-16.97"/></svg>开播';
    btn.dataset.mode = 'live';
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>重新申请';
    btn.dataset.mode = 'apply';
  }
}

function startLiveApp() {
  try { connectSocket(); } catch (e) { console.error('Socket 连接失败:', e); toast('实时连接失败，请刷新重试', 'error'); }
}

function connectSocket() {
  const socket = io({ transports: ['polling'], withCredentials: true });
  state.socket = socket;
  socket.on('connect', () => {
    console.log('[live] socket 已连接, sid=', socket.id);
    socket.emit('live_lobby_join');
    if (state.isHosting && state.localStream) socket.emit('live_resume');
    if (state.isViewing && state.currentHostId) socket.emit('live_join', { host_id: state.currentHostId });
  });
  socket.on('connect_error', (e) => { console.error('[live] 连接错误', e); toast('连接失败: ' + (e.message || e), 'error'); });
  socket.on('disconnect', () => { console.log('[live] 连接断开'); if (state.isHosting || state.isViewing) toast('连接已断开', 'error'); });
  socket.on('live_list', (data) => { state.streams = data.streams || []; renderList(); });
  socket.on('live_started', (s) => {
    if (!state.streams.find(x => x.host_id === s.host_id)) { state.streams.push(s); renderList(); }
  });
  socket.on('live_ended', (d) => {
    state.streams = state.streams.filter(x => x.host_id !== d.host_id);
    renderList();
    if (state.isViewing && state.currentHostId === d.host_id) {
      toast('直播已结束', 'error');
      leaveView(true);
    }
  });
  // 主播事件
  socket.on('live_started_ack', (d) => { state.myHostId = d.host_id; enterHostView(); });
  socket.on('live_resumed', (d) => {
    state.myHostId = d.host_id;
    // 旧 P2P 连接已随信令断开，等待观众重连后重新协商。
    state.hostPCs.forEach(pc => { try { pc.close(); } catch (e) {} });
    state.hostPCs.clear();
    toast('直播连接已恢复');
  });
  socket.on('live_resume_failed', () => {
    if (state.isHosting) {
      toast('直播恢复失败，请重新开播', 'error');
      cleanupHost();
    }
  });
  socket.on('viewer_joined', (d) => onViewerJoined(d));
  socket.on('viewer_left', (d) => onViewerLeft(d));
  socket.on('live_answer', (d) => onHostAnswer(d));
  socket.on('live_ice', (d) => onHostIce(d));
  socket.on('viewer_count', (d) => {
    if (state.isHosting) {
      document.getElementById('hostViewerCount').textContent = d.count;
      if (d.count > state.peakViewers) state.peakViewers = d.count;
      document.getElementById('hostPeakCount').textContent = state.peakViewers;
    }
    if (state.isViewing) document.getElementById('viewerCount').textContent = d.count;
  });
  socket.on('viewer_stats', (d) => onViewerStats(d));
  socket.on('live_error', (d) => {
    const err = d.error || '错误';
    if (err.includes('已满') && state.pendingJoinHostId) {
      state.pendingJoinHostId = null;
      state.isViewing = false;
      document.getElementById('viewerView').style.display = 'none';
      document.getElementById('listView').style.display = '';
      showFullModal(err);
      return;
    }
    toast(err, 'error');
    if (!state.isHosting && !state.isViewing && state.localStream) {
      cleanupLocalStream();
      document.getElementById('listView').style.display = '';
    }
    if (state.isViewing && !state.localStream) {
      state.isViewing = false;
      document.getElementById('viewerView').style.display = 'none';
      document.getElementById('listView').style.display = '';
    }
  });
  // 观众事件
  socket.on('live_joined', (d) => onLiveJoined(d));
  socket.on('live_offer', (d) => onViewerOffer(d));
  socket.on('live_ice', (d) => onViewerIce(d));
  socket.on('live_chat', (d) => appendChat(d));
  socket.on('live_title_updated', (d) => {
    if (state.isViewing && state.currentHostId === d.host_id) {
      document.getElementById('vTitle').textContent = d.title;
    }
    const fc = state.featuredChannels.find(c => c.host_id === d.host_id);
    if (fc) { fc.title = d.title; fc.is_live = true; renderFeaturedSection(); }
    // 同步全部直播间
    const ac = state.allChannels.find(c => c.host_id === d.host_id);
    if (ac) { ac.title = d.title; ac.is_live = true; renderAllChannels(); }
  });
}

/* ===== 列表渲染 ===== */
function renderList() {
  const grid = document.getElementById('liveGrid');
  const empty = document.getElementById('liveEmpty');
  const hero = document.getElementById('heroSection');
  grid.textContent = '';
  const streams = state.streams;
  if (!streams.length) {
    empty.style.display = '';
    hero.style.display = 'none';
    for (const ch of state.featuredChannels) ch.is_live = false;
    renderFeaturedSection();
    // 同步全部直播间在线状态
    for (const ch of state.allChannels) ch.is_live = false;
    renderAllChannels();
    return;
  }
  empty.style.display = 'none';
  const featured = [...streams].sort((a,b) => b.viewer_count - a.viewer_count)[0];
  hero.style.display = '';
  const heroImg = featured.cover || featured.avatar;
  document.getElementById('heroBg').style.backgroundImage = heroImg ? `url(${heroImg})` : '';
  document.getElementById('heroTitle').textContent = featured.title;
  document.getElementById('heroMeta').textContent = `${featured.username} · ${fmtN(featured.viewer_count)} ${t('t_people_watching')} · ${timeAgo(featured.started_at)}`;
  document.getElementById('heroWatch').onclick = () => joinView(featured.host_id);
  hero.onclick = (e) => { if (e.target.id !== 'heroWatch') joinView(featured.host_id); };
  for (const ch of state.featuredChannels) {
    const s = streams.find(x => x.host_id === ch.host_id);
    ch.is_live = !!s;
    if (s) { ch.viewer_count = s.viewer_count; ch.title = s.title; ch.started_at = s.started_at; }
  }
  renderFeaturedSection();
  // 同步全部直播间
  for (const ch of state.allChannels) {
    const s = streams.find(x => x.host_id === ch.host_id);
    ch.is_live = !!s;
    if (s) { ch.viewer_count = s.viewer_count; ch.title = s.title; ch.started_at = s.started_at; }
  }
  renderAllChannels();
  for (const s of streams) grid.appendChild(buildCard(s));
}

function buildCard(s) {
  const card = el('div', 'lv-card');
  const thumb = el('div', 'lv-card-thumb');
  const thumbImg = s.cover || s.avatar;
  if (thumbImg) thumb.style.backgroundImage = `url(${thumbImg})`;
  else {
    const ph = el('div', 'lv-card-thumb-ph');
    ph.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="3"/><path d="M6.34 6.34a8 8 0 0 0 0 11.32M17.66 17.66a8 8 0 0 0 0-11.32"/></svg>';
    thumb.appendChild(ph);
  }
  const live = el('div', 'lv-card-live');
  live.innerHTML = '<span class="lv-live-badge"><span class="lv-live-dot"></span>LIVE</span>';
  thumb.appendChild(live);
  const viewers = el('div', 'lv-card-viewers');
  viewers.innerHTML = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' + fmtN(s.viewer_count);
  thumb.appendChild(viewers);
  if (s.is_quality) thumb.insertAdjacentHTML('beforeend', qualityBadgeHTML('lv-card-quality'));
  card.appendChild(thumb);
  const body = el('div', 'lv-card-body');
  body.appendChild(el('div', 'lv-card-title', s.title));
  const author = el('div', 'lv-card-author');
  const av = el('img', 'lv-card-avatar'); if (s.avatar) av.src = s.avatar;
  av.onclick = (e) => { e.stopPropagation(); openHostCard(s); };
  author.appendChild(av);
  author.appendChild(el('span', 'lv-card-name', s.username));
  if (s.is_quality) author.insertAdjacentHTML('beforeend', qualityBadgeHTML());
  body.appendChild(author);
  card.appendChild(body);
  card.onclick = () => joinView(s.host_id);
  return card;
}

// 黄色优质主播标识（锯齿状 burst 印章 + 内嵌白色 checkmark）
// containerCls 可选：'lv-card-quality'（卡片角标大尺寸）/ ''（行内小图标）
function qualityBadgeHTML(containerCls) {
  if (containerCls === 'lv-card-quality') {
    return '<div class="lv-card-quality" title="优质主播"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.68 3.72 3.96-1.56-.48 4.26 4.26.48-1.56 3.96L23.5 14l-3.64 1.14 1.56 3.96-4.26-.48.48 4.26-3.96-1.56L12 24l-1.68-3.72-3.96 1.56.48-4.26-4.26-.48 1.56-3.96L.5 14l3.64-1.14-1.56-3.96 4.26.48-.48-4.26 3.96 1.56L12 2z"/><path class="lv-quality-check" d="M9.5 12.2l1.8 1.8 3.5-3.6" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>';
  }
  return '<svg class="lv-quality-badge" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" title="优质主播"><path d="M12 2l1.68 3.72 3.96-1.56-.48 4.26 4.26.48-1.56 3.96L23.5 14l-3.64 1.14 1.56 3.96-4.26-.48.48 4.26-3.96-1.56L12 24l-1.68-3.72-3.96 1.56.48-4.26-4.26-.48 1.56-3.96L.5 14l3.64-1.14-1.56-3.96 4.26.48-.48-4.26 3.96 1.56L12 2z"/><path class="lv-quality-check" d="M9.5 12.2l1.8 1.8 3.5-3.6" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
}

/* ===== 开播（预览确认流程） ===== */
async function openGoLive() {
  if (!state.user) return requireLogin();
  const mode = document.getElementById('goLiveBtn').dataset.mode || 'apply';
  if (mode !== 'live') { openApplyModal(); return; }
  // 开播前重新拉取我的频道（避免使用初始化时的缓存）
  try {
    const cd = await fetch('/api/live/my-channels').then(r => r.json());
    state.myChannels = cd.channels || [];
    state.myChannel = state.myChannels.find(c => c.status === 'approved') || state.myChannels[0] || null;
  } catch (e) { /* 降级使用缓存 */ }
  // 多个 approved 频道 → 先选频道
  const approved = state.myChannels.filter(c => c.status === 'approved');
  if (approved.length > 1) {
    openPickChannelModal(approved);
    return;
  }
  // 单个 approved 频道 → 直接用
  state.selectedChannelId = approved[0] ? approved[0].id : '';
  document.getElementById('goLiveModal').classList.add('show');
  const titleInput = document.getElementById('liveTitleInput');
  titleInput.value = '';
  const ch = approved[0];
  titleInput.placeholder = ch && ch.name ? `如：${ch.name} · 第一场` : '给直播起个名字（选填）';
  titleInput.focus();
}

function closeGoLive() { document.getElementById('goLiveModal').classList.remove('show'); }

/* 频道选择（多频道用户开播） */
function openPickChannelModal(approved) {
  const list = document.getElementById('pickChannelList');
  list.textContent = '';
  state.selectedChannelId = '';
  approved.forEach((ch, idx) => {
    const item = el('button', 'lv-pick-channel' + (idx === 0 ? ' selected' : ''));
    item.type = 'button';
    item.dataset.id = ch.id;
    if (ch.cover) {
      const img = el('img'); img.src = ch.cover; item.appendChild(img);
    } else {
      const ph = el('div', 'lv-pick-info'); item.appendChild(ph);
    }
    const info = el('div', 'lv-pick-info');
    info.appendChild(el('div', 'lv-pick-name', ch.name));
    info.appendChild(el('div', 'lv-pick-meta', ch.featured ? '精选频道' : '已通过审核'));
    item.appendChild(info);
    item.appendChild(el('div', 'lv-pick-radio'));
    item.onclick = () => {
      list.querySelectorAll('.lv-pick-channel').forEach(x => x.classList.remove('selected'));
      item.classList.add('selected');
      state.selectedChannelId = ch.id;
      document.getElementById('pickChannelConfirm').disabled = false;
    };
    list.appendChild(item);
  });
  if (approved[0]) state.selectedChannelId = approved[0].id;
  document.getElementById('pickChannelConfirm').disabled = false;
  document.getElementById('pickChannelModal').classList.add('show');
}

function closePickChannel() { document.getElementById('pickChannelModal').classList.remove('show'); }
async function confirmPickChannel() {
  if (!state.selectedChannelId) { toast(t('t_select_channel'), 'error'); return; }
  closePickChannel();
  document.getElementById('goLiveModal').classList.add('show');
  const ch = state.myChannels.find(c => c.id === state.selectedChannelId);
  const titleInput = document.getElementById('liveTitleInput');
  titleInput.value = '';
  titleInput.placeholder = ch && ch.name ? `如：${ch.name} · 第一场` : '给直播起个名字（选填）';
  titleInput.focus();
}

/* ===== 申请直播权限 ===== */
function openApplyModal() {
  const ch = state.myChannel;
  state.coverFile = null;
  document.getElementById('coverInput').value = '';
  document.getElementById('channelNameInput').value = ch ? ch.name : '';
  const st = document.getElementById('applyStatus');
  if (ch && ch.status === 'pending') {
    st.style.display = '';
    st.className = 'lv-apply-status pending';
    st.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>正在审核中，修改后将重新进入审核';
  } else if (ch && ch.status === 'rejected') {
    st.style.display = '';
    st.className = 'lv-apply-status rejected';
    st.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>上次申请未通过' + (ch.reject_reason ? `：${ch.reject_reason}` : '');
  } else {
    st.style.display = 'none';
  }
  const preview = document.getElementById('coverPreview');
  const placeholder = document.getElementById('coverPlaceholder');
  if (ch && ch.cover) {
    preview.style.display = '';
    placeholder.style.display = 'none';
    document.getElementById('coverPreviewImg').src = ch.cover;
  } else {
    preview.style.display = 'none';
    placeholder.style.display = '';
  }
  document.getElementById('applyModal').classList.add('show');
}

function closeApplyModal() { document.getElementById('applyModal').classList.remove('show'); }

function onCoverPicked(file) {
  if (!file) return;
  if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) { toast('只支持 jpg/png/gif/webp', 'error'); return; }
  if (file.size > 7 * 1024 * 1024) { toast('封面不能超过 7MB', 'error'); return; }
  state.coverFile = file;
  const url = URL.createObjectURL(file);
  document.getElementById('coverPreviewImg').src = url;
  document.getElementById('coverPreview').style.display = '';
  document.getElementById('coverPlaceholder').style.display = 'none';
}

async function submitApply() {
  const name = document.getElementById('channelNameInput').value.trim();
  if (!name) { toast('请填写直播间名字', 'error'); return; }
  if (!document.getElementById('applyAgreeCheck').checked) {
    toast('请先阅读并同意用户协议与隐私政策', 'error');
    return;
  }
  const fd = new FormData();
  fd.append('name', name);
  if (state.coverFile) fd.append('cover', state.coverFile);
  const btn = document.getElementById('applySubmit');
  btn.disabled = true; btn.textContent = '提交中…';
  try {
    const res = await fetch('/api/live/apply', { method: 'POST', body: fd, credentials: 'same-origin' });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || '提交失败');
    // 刷新我的频道列表
    try {
      const cd = await fetch('/api/live/my-channels').then(r => r.json());
      state.myChannels = cd.channels || [];
      state.myChannel = state.myChannels.find(c => c.status === 'approved') || state.myChannels[0] || null;
    } catch (e) { /* ignore */ }
    state.coverFile = null;
    updateGoLiveButton();
    closeApplyModal();
    toast('申请已提交，请等待管理员审核');
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '提交申请';
  }
}

/* ===== 我的频道管理 ===== */
async function openMyChannelsModal() {
  if (!state.user) return requireLogin();
  try {
    const cd = await fetch('/api/live/my-channels').then(r => r.json());
    state.myChannels = cd.channels || [];
    state.myChannel = state.myChannels.find(c => c.status === 'approved') || state.myChannels[0] || null;
  } catch (e) { toast('加载失败', 'error'); return; }
  renderMyChannelsList();
  // 更新「申请新直播间」按钮可用性
  const remaining = 3 - state.myChannels.length;
  const applyBtn = document.getElementById('myChannelsApply');
  applyBtn.disabled = remaining <= 0;
  applyBtn.textContent = remaining <= 0 ? '已达上限（3 个）' : (state.myChannels.length === 0 ? '申请直播权限' : '申请新直播间');
  document.getElementById('myChannelsModal').classList.add('show');
}

function renderMyChannelsList() {
  const list = document.getElementById('myChannelsList');
  list.textContent = '';
  if (!state.myChannels.length) {
    list.appendChild(el('div', 'lv-chat-empty', '还没有直播间，点击下方申请新直播间。'));
    return;
  }
  for (const ch of state.myChannels) {
    const item = el('div', 'lv-my-channel-item');
    if (ch.cover) {
      const img = el('img'); img.src = ch.cover; item.appendChild(img);
    } else {
      const ph = el('div'); ph.style.cssText = 'width:80px;height:45px;border-radius:8px;background:var(--bg-fill);flex-shrink:0;'; item.appendChild(ph);
    }
    const info = el('div', 'lv-mc-info');
    info.appendChild(el('div', 'lv-mc-name', ch.name));
    const meta = el('div', 'lv-mc-meta');
    const tag = el('span', 'lv-tag ' + (ch.status || 'pending'), ch.status === 'approved' ? '已通过' : (ch.status === 'rejected' ? '未通过' : '审核中'));
    meta.appendChild(tag);
    if (ch.status === 'rejected' && ch.reject_reason) meta.appendChild(el('span', '', ' · ' + ch.reject_reason));
    if (ch.featured) meta.appendChild(el('span', '', ' · 精选'));
    info.appendChild(meta);
    item.appendChild(info);
    const actions = el('div', 'lv-mc-actions');
    if (ch.status === 'approved') {
      const editBtn = el('button', 'lv-mc-btn', '编辑');
      editBtn.onclick = () => openEditChannelModal(ch);
      actions.appendChild(editBtn);
      const goLiveBtn = el('button', 'lv-mc-btn primary', '开播');
      goLiveBtn.onclick = () => {
        document.getElementById('myChannelsModal').classList.remove('show');
        state.selectedChannelId = ch.id;
        document.getElementById('goLiveModal').classList.add('show');
        const titleInput = document.getElementById('liveTitleInput');
        titleInput.value = '';
        titleInput.placeholder = `如：${ch.name} · 第一场`;
        titleInput.focus();
      };
      actions.appendChild(goLiveBtn);
      const delBtn = el('button', 'lv-mc-btn danger', t('btn_delete'));
      delBtn.onclick = () => deleteMyChannel(ch);
      actions.appendChild(delBtn);
    } else {
      const editBtn = el('button', 'lv-mc-btn', '修改');
      editBtn.onclick = () => { document.getElementById('myChannelsModal').classList.remove('show'); openApplyModal(); };
      actions.appendChild(editBtn);
      const delBtn = el('button', 'lv-mc-btn danger', t('btn_delete'));
      delBtn.onclick = () => deleteMyChannel(ch);
      actions.appendChild(delBtn);
    }
    item.appendChild(actions);
    list.appendChild(item);
  }
}

function closeMyChannelsModal() { document.getElementById('myChannelsModal').classList.remove('show'); }

/* 删除自己的直播间 */
async function deleteMyChannel(ch) {
  if (!ch || !ch.id) return;
  showConfirmModal(t('btn_delete'), t('t_delete_confirm'), async () => {
    try {
      const resp = await fetch('/api/live/channel/' + ch.id, { method: 'DELETE' });
      const data = await resp.json();
      if (!resp.ok) {
        toast(data.error || t('t_delete_fail'), 'error');
        return;
      }
      toast(t('t_delete_ok'), 'success');
      // 从本地列表移除并重新渲染
      state.myChannels = state.myChannels.filter(c => c.id !== ch.id);
      state.myChannel = state.myChannels.find(c => c.status === 'approved') || state.myChannels[0] || null;
      renderMyChannelsList();
      // 更新「申请新直播间」按钮
      const remaining = 3 - state.myChannels.length;
      const applyBtn = document.getElementById('myChannelsApply');
      applyBtn.disabled = remaining <= 0;
      applyBtn.textContent = remaining <= 0 ? '已达上限（3 个）' : (state.myChannels.length === 0 ? '申请直播权限' : '申请新直播间');
      updateGoLiveButton();
    } catch (e) {
      toast(t('t_delete_fail'), 'error');
    }
  });
}

/* ===== 编辑直播间 ===== */
function openEditChannelModal(ch) {
  state.editChannelId = ch.id;
  state.editCoverFile = null;
  document.getElementById('editChannelNameInput').value = ch.name || '';
  document.getElementById('editCoverInput').value = '';
  const preview = document.getElementById('editCoverPreview');
  const placeholder = document.getElementById('editCoverPlaceholder');
  if (ch.cover) {
    preview.style.display = '';
    placeholder.style.display = 'none';
    document.getElementById('editCoverPreviewImg').src = ch.cover;
  } else {
    preview.style.display = 'none';
    placeholder.style.display = '';
  }
  document.getElementById('myChannelsModal').classList.remove('show');
  document.getElementById('editChannelModal').classList.add('show');
}

function closeEditChannelModal() { document.getElementById('editChannelModal').classList.remove('show'); }

function onEditCoverPicked(file) {
  if (!file) return;
  if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) { toast('只支持 jpg/png/gif/webp', 'error'); return; }
  if (file.size > 7 * 1024 * 1024) { toast('封面不能超过 7MB', 'error'); return; }
  state.editCoverFile = file;
  const url = URL.createObjectURL(file);
  document.getElementById('editCoverPreviewImg').src = url;
  document.getElementById('editCoverPreview').style.display = '';
  document.getElementById('editCoverPlaceholder').style.display = 'none';
}

async function submitEditChannel() {
  if (!state.editChannelId) { toast('未选择直播间', 'error'); return; }
  const name = document.getElementById('editChannelNameInput').value.trim();
  if (!name) { toast('请填写直播间名字', 'error'); return; }
  const fd = new FormData();
  fd.append('name', name);
  if (state.editCoverFile) fd.append('cover', state.editCoverFile);
  const btn = document.getElementById('editChannelSave');
  btn.disabled = true; btn.textContent = '保存中…';
  try {
    const res = await fetch('/api/live/channel/' + encodeURIComponent(state.editChannelId) + '/edit', {
      method: 'POST', body: fd, credentials: 'same-origin'
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || '保存失败');
    // 刷新我的频道列表
    try {
      const cd = await fetch('/api/live/my-channels').then(r => r.json());
      state.myChannels = cd.channels || [];
      state.myChannel = state.myChannels.find(c => c.status === 'approved') || state.myChannels[0] || null;
    } catch (e) { /* ignore */ }
    state.editCoverFile = null;
    updateGoLiveButton();
    closeEditChannelModal();
    toast('已保存');
    openMyChannelsModal();
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '保存';
  }
}

/* ===== 第一步：获取预览流（带画质约束 + 麦克风默认关闭 + 屏幕共享摄像头小窗） ===== */
async function startLive() {
  let stream;
  const q = QUALITY_PRESETS[state.quality] || QUALITY_PRESETS.auto;
  try {
    if (state.sourceType === 'screen') {
      // 屏幕共享：强制 1080p 以保证清晰度
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: true
      });
      // 给视频轨道加 contentHint，帮助编码器优化
      const vt = stream.getVideoTracks()[0];
      if (vt && 'contentHint' in vt) {
        try { vt.contentHint = 'detail'; } catch (e) {}
      }
    } else {
      // 只请求视频，避免同时弹出摄像头+麦克风两次权限确认；麦克风改为首次开启时懒加载
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: q.width }, height: { ideal: q.height }, frameRate: { ideal: q.frameRate } },
        audio: false
      });
    }
  } catch (e) {
    toast('无法获取摄像头/屏幕：' + (e.message || e.name), 'error');
    return;
  }
  state.localStream = stream;
  // 主播麦克风默认关闭（屏幕共享的系统音频也默认静音，避免回声）
  stream.getAudioTracks().forEach(t => { t.enabled = false; });
  stream.getVideoTracks()[0].onended = () => { if (state.isHosting) endLive(); else closePreview(); };
  // 应用最大码率
  applyBitrateLimit(stream, q.maxBitrate);
  // 屏幕共享时的摄像头小窗改为开播后由主播手动开启（避免开播时二次授权确认）
  closeGoLive();
  document.getElementById('previewModal').classList.add('show');
  const pv = document.getElementById('previewVideo');
  pv.srcObject = stream;
  document.getElementById('previewStatus').textContent = '正在获取预览…';
  document.getElementById('previewStatus').classList.add('loading');
  document.getElementById('previewConfirm').disabled = true;
  pv.onloadedmetadata = () => {
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    const w = settings.width || pv.videoWidth || 0;
    const h = settings.height || pv.videoHeight || 0;
    const fps = settings.frameRate ? Math.round(settings.frameRate) : 30;
    const audioTracks = stream.getAudioTracks();
    const audioInfo = audioTracks.length ? ' · 系统音频已就绪（默认关闭）' : ' · 麦克风默认关闭（点击麦克风按钮开启）';
    const info = `${w}×${h} · ${fps}fps · ${state.quality.toUpperCase()}` + audioInfo;
    const ps = document.getElementById('previewStatus');
    ps.textContent = '预览就绪 · ' + info;
    ps.classList.remove('loading');
    document.getElementById('previewConfirm').disabled = false;
  };
}

// 用 RTCRtpSender.setParameters 限制最大码率/帧率（兼容老浏览器降级）
function applyBitrateLimit(stream, maxBitrate) {
  try {
    // 这里仅设置 track 级别的提示；真正的 sender 参数在 PC 建立后应用
    stream._maxBitrate = maxBitrate;
  } catch (e) {}
}

// 在 PC 上应用 maxBitrate / maxFramerate
function applySenderParameters(pc, maxBitrate, maxFramerate) {
  try {
    const senders = pc.getSenders();
    return Promise.all(senders.map(async (sender) => {
      if (!sender.track) return;
      const params = sender.getParameters();
      if (!params.encodings || !params.encodings.length) {
        params.encodings = [{}];
      }
      if (maxBitrate) params.encodings[0].maxBitrate = maxBitrate;
      if (maxFramerate && 'maxFramerate' in params.encodings[0]) {
        params.encodings[0].maxFramerate = maxFramerate;
      }
      try { await sender.setParameters(params); } catch (e) { /* 部分浏览器不支持 maxFramerate，忽略 */ }
    }));
  } catch (e) { return Promise.resolve(); }
}

function cleanupLocalStream() {
  if (state.localStream) { state.localStream.getTracks().forEach(t => t.stop()); state.localStream = null; }
  if (state.camStream) { state.camStream.getTracks().forEach(t => t.stop()); state.camStream = null; }
}

function closePreview() {
  document.getElementById('previewModal').classList.remove('show');
  document.getElementById('previewVideo').srcObject = null;
  cleanupLocalStream();
}

// 第二步：确认开播
function confirmStartLive() {
  if (!state.localStream) { toast('预览流已失效，请重新选择', 'error'); closePreview(); return; }
  const title = document.getElementById('liveTitleInput').value.trim();
  document.getElementById('previewModal').classList.remove('show');
  const payload = {
    title,
    source_type: state.sourceType,
    quality: state.sourceType === 'screen' ? '1080p' : state.quality,
  };
  if (state.selectedChannelId) payload.channel_id = state.selectedChannelId;
  state.socket.emit('live_start', payload);
  setTimeout(() => { if (!state.isHosting) toast('直播启动超时，请看控制台报错', 'error'); }, 3000);
}

function enterHostView() {
  state.isHosting = true;
  state.peakViewers = 0;
  state.hostLatencySamples = [];
  document.getElementById('listView').style.display = 'none';
  document.getElementById('hostView').style.display = '';
  document.getElementById('hostPreview').srcObject = state.localStream;
  document.getElementById('hostTitle').textContent = document.getElementById('liveTitleInput').value.trim() || (state.user.username + ' 的直播');
  document.getElementById('hostViewerCount').textContent = '0';
  document.getElementById('hostPeakCount').textContent = '0';
  // 麦克风默认关闭 → micToggleBtn 加 .off, micPill 显示 OFF
  document.getElementById('micToggleBtn').classList.add('off');
  document.getElementById('camToggleBtn').classList.remove('off');
  updateHostStatusPills(true, true); // micOff=true, camOn=true
  // 摄像头模式下显示摄像头按钮，屏幕共享模式下隐藏（屏幕共享时主画面是屏幕）
  document.getElementById('camToggleBtn').style.display = state.sourceType === 'camera' ? '' : 'none';
  // 屏幕共享时显示「摄像头小窗」开关按钮（主播手动开启，避免开播时二次授权）
  document.getElementById('camOverlayBtn').style.display = state.sourceType === 'screen' ? '' : 'none';
  // 显示推流画质
  updateHostQuality();
  // 屏幕共享时不再自动创建摄像头小窗（由主播手动开关）
  // 隐藏主播延迟 pill（等观众上报后显示）
  document.getElementById('hostLatencyPill').style.display = 'none';
  clearChat(true);
  startHostTimer();
}

// 主播：更新画质指示
function updateHostQuality() {
  const el = document.getElementById('hostQualityText');
  if (!el || !state.localStream) return;
  const track = state.localStream.getVideoTracks()[0];
  if (!track) { el.textContent = '—'; return; }
  const s = track.getSettings();
  const w = s.width || 0, h = s.height || 0, fps = s.frameRate ? Math.round(s.frameRate) : 0;
  el.textContent = (w && h) ? `${w}×${h}` + (fps ? `·${fps}` : '') : '—';
}

// 主播：更新状态指示 pill
function updateHostStatusPills(micOff, camOn) {
  const micPill = document.getElementById('hostMicPill');
  const camPill = document.getElementById('hostCamPill');
  if (micPill) {
    micPill.classList.toggle('off', micOff);
    micPill.innerHTML = '<span class="lv-status-dot"></span>' + (micOff ? 'MIC OFF' : 'MIC ON');
  }
  if (camPill) {
    camPill.classList.toggle('off', !camOn);
    camPill.innerHTML = '<span class="lv-status-dot"></span>' + (camOn ? 'CAM ON' : 'CAM OFF');
  }
}

// 主播：切换麦克风（首次开启时懒加载请求麦克风权限，避免开播时弹两次权限确认）
async function toggleMic() {
  if (!state.localStream) return;
  let tracks = state.localStream.getAudioTracks();
  // 无音频轨道 → 首次开启：懒加载请求麦克风
  if (!tracks.length) {
    const micToggleBtn = document.getElementById('micToggleBtn');
    // 当前按钮处于 off 状态（默认关闭），点击表示要开启
    const wantOn = micToggleBtn.classList.contains('off');
    if (!wantOn) return; // 已经开启且无轨道，不做处理
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const audioTrack = audioStream.getAudioTracks()[0];
      if (!audioTrack) { toast('未获取到麦克风', 'error'); return; }
      audioTrack.enabled = true; // 首次开启时启用
      state.localStream.addTrack(audioTrack);
      // 将音频轨道替换到已有 peer connection 的空 audio sender 上（无需 renegotiation）
      state.hostPCs.forEach(pc => {
        const senders = pc.getSenders();
        const audioSender = senders.find(s => !s.track || s.track.kind === 'audio');
        if (audioSender) { try { audioSender.replaceTrack(audioTrack); } catch (e) {} }
      });
      micToggleBtn.classList.remove('off');
      updateHostStatusPills(false, !document.getElementById('camToggleBtn').classList.contains('off'));
      toast('麦克风已开启');
    } catch (e) {
      toast('无法获取麦克风：' + (e.message || e.name), 'error');
    }
    return;
  }
  // 有音频轨道 → 正常切换 enabled
  const enabled = !tracks[0].enabled;
  tracks.forEach(t => t.enabled = enabled);
  document.getElementById('micToggleBtn').classList.toggle('off', !enabled);
  updateHostStatusPills(!enabled, !document.getElementById('camToggleBtn').classList.contains('off'));
  toast(enabled ? '麦克风已开启' : '麦克风已静音');
}

// 主播：切换摄像头
function toggleCamera() {
  if (!state.localStream) return;
  const tracks = state.localStream.getVideoTracks();
  if (!tracks.length) return;
  const enabled = !tracks[0].enabled;
  tracks.forEach(t => t.enabled = enabled);
  document.getElementById('camToggleBtn').classList.toggle('off', !enabled);
  updateHostStatusPills(!document.getElementById('micToggleBtn').classList.contains('off'), enabled);
  toast(enabled ? '摄像头已开启' : '摄像头已关闭');
}

// 屏幕共享时的摄像头小窗（PiP overlay）
function createCamOverlay() {
  if (!state.camStream) return;
  const screen = document.getElementById('hostScreen');
  if (!screen) return;
  // 移除已有
  removeCamOverlay();
  const overlay = el('div', 'lv-host-cam-overlay');
  const video = el('video'); video.autoplay = true; video.muted = true; video.playsInline = true;
  video.srcObject = state.camStream;
  overlay.appendChild(video);
  const label = el('div', 'lv-cam-label', 'CAM');
  overlay.appendChild(label);
  const closeBtn = el('button', 'lv-cam-close', '');
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    removeCamOverlay();
    if (state.camStream) { state.camStream.getTracks().forEach(t => t.stop()); state.camStream = null; }
    const ob = document.getElementById('camOverlayBtn'); if (ob) ob.classList.remove('active');
  };
  overlay.appendChild(closeBtn);
  screen.appendChild(overlay);
  state.camOverlayEl = overlay;
  // 简单拖动支持
  let dragging = false, ox = 0, oy = 0;
  overlay.addEventListener('pointerdown', (ev) => {
    if (ev.target === closeBtn || closeBtn.contains(ev.target)) return;
    dragging = true;
    overlay.setPointerCapture(ev.pointerId);
    const rect = overlay.getBoundingClientRect();
    ox = ev.clientX - rect.left; oy = ev.clientY - rect.top;
    overlay.style.right = 'auto'; overlay.style.bottom = 'auto';
  });
  overlay.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    const screenRect = screen.getBoundingClientRect();
    let x = ev.clientX - screenRect.left - ox;
    let y = ev.clientY - screenRect.top - oy;
    x = Math.max(8, Math.min(x, screenRect.width - overlay.offsetWidth - 8));
    y = Math.max(8, Math.min(y, screenRect.height - overlay.offsetHeight - 8));
    overlay.style.left = x + 'px'; overlay.style.top = y + 'px';
  });
  overlay.addEventListener('pointerup', (ev) => { dragging = false; try { overlay.releasePointerCapture(ev.pointerId); } catch(e){} });
}

function removeCamOverlay() {
  if (state.camOverlayEl) { state.camOverlayEl.remove(); state.camOverlayEl = null; }
}

/* 主播：屏幕共享时切换摄像头小窗（首次开启会请求摄像头授权，关闭后停止 track） */
async function toggleCamOverlay() {
  const btn = document.getElementById('camOverlayBtn');
  // 已有小窗 → 关闭
  if (state.camOverlayEl) {
    removeCamOverlay();
    if (state.camStream) { state.camStream.getTracks().forEach(t => t.stop()); state.camStream = null; }
    if (btn) btn.classList.remove('active');
    return;
  }
  // 开启小窗：拉取摄像头
  try {
    const camStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
      audio: false
    });
    state.camStream = camStream;
    createCamOverlay();
    if (btn) btn.classList.add('active');
  } catch (e) {
    toast('无法获取摄像头：' + (e.message || e.name), 'error');
  }
}

// 主播：画中画
async function toggleHostPiP() {
  const pv = document.getElementById('hostPreview');
  if (!pv) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await pv.requestPictureInPicture();
    }
  } catch(e) { toast('画中画不可用: ' + e.message, 'error'); }
}

// 主播：截图
function takeSnapshot() {
  const pv = document.getElementById('hostPreview');
  if (!pv || !pv.videoWidth) { toast(t('t_video_not_ready'), 'error'); return; }
  const c = document.createElement('canvas');
  c.width = pv.videoWidth; c.height = pv.videoHeight;
  c.getContext('2d').drawImage(pv, 0, 0);
  c.toBlob(b => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'live-' + Date.now() + '.png';
    a.click(); URL.revokeObjectURL(a.href);
    toast(t('t_snapshot_saved'), 'success');
  });
}

// 主播：全屏切换
function toggleFullscreen() {
  const screen = document.getElementById('hostScreen');
  if (!document.fullscreenElement) {
    (screen.requestFullscreen || screen.webkitRequestFullscreen || function(){}).call(screen);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
  }
}

// 主播：修改标题
function openTitleEdit() {
  document.getElementById('titleEditInput').value = document.getElementById('hostTitle').textContent;
  document.getElementById('titleEditModal').classList.add('show');
  setTimeout(() => document.getElementById('titleEditInput').focus(), 50);
}
function closeTitleEdit() { document.getElementById('titleEditModal').classList.remove('show'); }
function saveTitleEdit() {
  const v = document.getElementById('titleEditInput').value.trim();
  if (!v) { toast('标题不能为空', 'error'); return; }
  document.getElementById('hostTitle').textContent = v;
  if (state.myHostId) state.socket.emit('live_update_title', { host_id: state.myHostId, title: v });
  closeTitleEdit();
  toast('标题已更新');
}

/* 主播：新观众加入 → 创建 PC 推流 + 应用码率限制 */
function onViewerJoined(d) {
  const viewerSid = d.sid;
  if (d.username) appendSystemChat(true, d.username + ' 加入了直播');
  if (!state.localStream) return;
  // 若该观众已有 PC，先清理（防止重复 join 导致 offer 错乱）
  const oldPc = state.hostPCs.get(viewerSid);
  if (oldPc) { try { oldPc.close(); } catch (e) {} state.hostPCs.delete(viewerSid); }
  const pc = new RTCPeerConnection(ICE_SERVERS);
  state.hostPCs.set(viewerSid, pc);
  // 缓冲早到的 ICE candidate
  state._pendingHostIce = state._pendingHostIce || {};
  state._pendingHostIce[viewerSid] = [];
  for (const track of state.localStream.getTracks()) pc.addTrack(track, state.localStream);
  // 无音频轨道时预添加 audio transceiver，使 SDP 包含音频 m-line，
  // 后续 toggleMic 懒加载麦克风时只需 replaceTrack，无需 renegotiation
  if (!state.localStream.getAudioTracks().length) {
    try { pc.addTransceiver('audio', { direction: 'sendrecv' }); } catch (e) {}
  }
  // 应用 maxBitrate/maxFramerate
  const q = QUALITY_PRESETS[state.sourceType === 'screen' ? '1080p' : state.quality] || QUALITY_PRESETS.auto;
  applySenderParameters(pc, q.maxBitrate, q.frameRate);
  pc.onicecandidate = (e) => {
    if (e.candidate) state.socket.emit('live_ice', { to: viewerSid, candidate: e.candidate });
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      pc.close(); state.hostPCs.delete(viewerSid);
    }
  };
  pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => {
    state.socket.emit('live_offer', { to: viewerSid, sdp: pc.localDescription });
  }).catch(e => console.error('offer 失败', e));
}

function onViewerLeft(d) {
  if (d.username) appendSystemChat(true, d.username + ' 离开了直播');
  const pc = state.hostPCs.get(d.sid);
  if (pc) { pc.close(); state.hostPCs.delete(d.sid); }
  if (state._pendingHostIce) delete state._pendingHostIce[d.sid];
  // 移除该观众的延迟样本
  state.hostLatencySamples = state.hostLatencySamples.filter(s => s.sid !== d.sid);
  updateHostLatencyPill();
}

function onHostAnswer(d) {
  const pc = state.hostPCs.get(d.from);
  if (!pc || !d.sdp) return;
  pc.setRemoteDescription(d.sdp).then(() => {
    // flush 早到的 ICE candidate
    const pending = state._pendingHostIce && state._pendingHostIce[d.from];
    if (pending && pending.length) {
      for (const c of pending) pc.addIceCandidate(c).catch(() => {});
      state._pendingHostIce[d.from] = [];
    }
  }).catch(e => console.error('setAnswer', e));
}

function onHostIce(d) {
  if (!d.candidate) return;
  const pc = state.hostPCs.get(d.from);
  if (!pc) return;
  // remoteDescription 未设置时缓冲
  if (!pc.remoteDescription) {
    if (!state._pendingHostIce) state._pendingHostIce = {};
    if (!state._pendingHostIce[d.from]) state._pendingHostIce[d.from] = [];
    state._pendingHostIce[d.from].push(d.candidate);
    return;
  }
  pc.addIceCandidate(d.candidate).catch(() => {});
}

/* 主播：收到观众上报的延迟统计 → 计算平均延迟显示 */
function onViewerStats(d) {
  if (!state.isHosting) return;
  // 更新或插入样本
  const idx = state.hostLatencySamples.findIndex(s => s.sid === d.sid);
  if (idx >= 0) state.hostLatencySamples[idx] = d;
  else state.hostLatencySamples.push(d);
  updateHostLatencyPill();
}

function updateHostLatencyPill() {
  const pill = document.getElementById('hostLatencyPill');
  const txt = document.getElementById('hostLatencyText');
  if (!pill || !txt) return;
  if (!state.hostLatencySamples.length) { pill.style.display = 'none'; return; }
  const avg = state.hostLatencySamples.reduce((a, s) => a + (s.latency || 0), 0) / state.hostLatencySamples.length;
  pill.style.display = '';
  txt.textContent = Math.round(avg) + 'ms';
  pill.classList.remove('warn', 'bad');
  if (avg > 1500) pill.classList.add('bad');
  else if (avg > 800) pill.classList.add('warn');
}

function endLive() {
  if (!state.isHosting) return;
  showConfirmModal('结束直播', '确定要结束当前直播吗？', () => {
    state.socket.emit('live_end');
    const t = document.getElementById('hostTimer');
    const duration = t ? t.textContent : '00:00';
    const peak = state.peakViewers || 0;
    document.getElementById('endDuration').textContent = duration;
    document.getElementById('endPeak').textContent = peak;
    document.getElementById('endModal').classList.add('show');
    cleanupHost();
  });
}

function cleanupHost() {
  state.isHosting = false;
  stopHostTimer();
  stopLatencyTimers();
  state.hostPCs.forEach(pc => pc.close());
  state.hostPCs.clear();
  state.hostLatencySamples = [];
  removeCamOverlay();
  cleanupLocalStream();
  document.getElementById('hostView').style.display = 'none';
  document.getElementById('listView').style.display = '';
  // 刷新全部直播间（自己下播后状态同步）
  loadAllChannels();
}

/* ===== 观看 ===== */
function joinView(hostId) {
  if (!state.user) return requireLogin();
  state.currentHostId = hostId;
  state.pendingJoinHostId = hostId;
  state.isViewing = true;
  state.viewerPC = null;
  document.getElementById('listView').style.display = 'none';
  document.getElementById('viewerView').style.display = '';
  document.getElementById('viewerPlayer').srcObject = null;
  document.getElementById('viewerLoading').style.display = '';
  document.getElementById('viewerCount').textContent = '0';
  document.getElementById('viewerLatencyPill').style.display = 'none';
  state.socket.emit('live_join', { host_id: hostId });
}

function onLiveJoined(d) {
  document.getElementById('vTitle').textContent = d.title;
  const nameEl = document.getElementById('vName');
  nameEl.textContent = d.username;
  nameEl.classList.toggle('has-badge', !!d.is_quality);
  const oldBadge = nameEl.querySelector('.lv-quality-badge');
  if (oldBadge) oldBadge.remove();
  if (d.is_quality) nameEl.insertAdjacentHTML('beforeend', qualityBadgeHTML());
  const av = document.getElementById('vAvatar');
  if (d.avatar) av.src = d.avatar; else av.removeAttribute('src');
  av.style.cursor = 'pointer';
  av.onclick = () => openHostCard({ username: d.username, avatar: d.avatar, host_id: state.currentHostId, viewer_count: +document.getElementById('viewerCount').textContent || 0, started_at: d.started_at });
}

function onViewerOffer(d) {
  // 清理旧的 PC（防止重复 offer 导致黑屏）
  if (state.viewerPC) { try { state.viewerPC.close(); } catch (e) {} state.viewerPC = null; }
  const pc = new RTCPeerConnection(ICE_SERVERS);
  state.viewerPC = pc;
  // 缓冲早到的 ICE candidate（在 setRemoteDescription 之前到达的）
  state._pendingViewerIce = [];
  let streamReady = false;
  pc.ontrack = (e) => {
    const v = document.getElementById('viewerPlayer');
    // 优先用 event.streams[0]，为空则自己组装 MediaStream
    const stream = (e.streams && e.streams[0]) ? e.streams[0] : new MediaStream([e.track]);
    v.srcObject = stream;
    document.getElementById('viewerLoading').style.display = 'none';
    // Safari 要求初始 muted 才能 autoplay，先静音播放成功后再尝试开启音频
    v.muted = true;
    const tryPlay = () => v.play().then(() => {
      streamReady = true;
      startViewerStatsTimer();
      // 尝试恢复音频（部分浏览器允许成功后 unmute）
      v.muted = false;
      v.play().catch(() => {
        // Safari 不允许自动 unmute，保持静音并显示静音按钮
        v.muted = true;
        const mb = document.getElementById('muteBtnStatic'); mb.style.display = '';
        mb.onclick = () => { v.muted = false; mb.style.display = 'none'; document.getElementById('volumeCtrl').style.display = ''; };
      });
    }).catch(() => {
      // 首次播放失败，保持静音重试
      v.muted = true;
      v.play().then(() => {
        streamReady = true;
        startViewerStatsTimer();
        const mb = document.getElementById('muteBtnStatic'); mb.style.display = '';
        mb.onclick = () => { v.muted = false; mb.style.display = 'none'; document.getElementById('volumeCtrl').style.display = ''; };
      }).catch(() => {});
    });
    tryPlay();
    // 检测视频无帧（OBS 断流时 duration 不更新）
    let lastVideoTime = 0;
    v.addEventListener('timeupdate', () => {
      if (v.currentTime === lastVideoTime) {
        // 视频卡住，检查是否是 OBS 断流
        if (Date.now() - (v._stalledAt || Date.now()) > 8000) {
          toast('直播已中断，正在重连…', 'error');
          v.removeAttribute('srcObject');
          v.srcObject = null;
          if (state.isViewing && state.currentHostId) {
            state.socket.emit('live_leave', { host_id: state.currentHostId });
            setTimeout(() => {
              if (state.isViewing && state.currentHostId) state.socket.emit('live_join', { host_id: state.currentHostId });
            }, 500);
          }
        }
      } else {
        lastVideoTime = v.currentTime;
        v._stalledAt = Date.now();
      }
    });
    v.addEventListener('waiting', () => { v._stalledAt = Date.now(); });
    // track 结束/移除时清理
    e.track.onended = () => {
      if (v.srcObject === stream) { v.srcObject = null; }
      // 观众端 track 断开时主动重连
      if (state.isViewing && state.currentHostId) {
        toast('主播已断开，正在重连…', 'error');
        setTimeout(() => {
          if (state.isViewing && state.currentHostId) {
            state.socket.emit('live_leave', { host_id: state.currentHostId });
            setTimeout(() => {
              if (state.isViewing && state.currentHostId) state.socket.emit('live_join', { host_id: state.currentHostId });
            }, 500);
          }
        }, 1000);
      }
    };
  };
  pc.onicecandidate = (e) => {
    if (e.candidate) state.socket.emit('live_ice', { to: d.from, candidate: e.candidate });
  };
  pc.onconnectionstatechange = () => {
    const s = pc.connectionState;
    if (s === 'failed' || s === 'disconnected' || s === 'closed') {
      toast(s === 'disconnected' ? '连接已断开，正在重试…' : '连接失败，正在重试…', 'error');
      // 尝试 ICE restart：重新发起 join 触发主播重新 offer
      if (state.currentHostId) {
        setTimeout(() => {
          if (state.isViewing && state.currentHostId) {
            state.socket.emit('live_leave', { host_id: state.currentHostId });
            setTimeout(() => {
              if (state.isViewing && state.currentHostId) state.socket.emit('live_join', { host_id: state.currentHostId });
            }, 300);
          }
        }, 500);
      }
    }
  };
  // 先 setRemoteDescription，完成后 flush 缓冲的 ICE，再 createAnswer
  pc.setRemoteDescription(d.sdp).then(() => {
    // flush 早到的 ICE candidate
    if (state._pendingViewerIce && state._pendingViewerIce.length) {
      for (const c of state._pendingViewerIce) {
        pc.addIceCandidate(c).catch(() => {});
      }
      state._pendingViewerIce = [];
    }
    return pc.createAnswer();
  }).then(ans => pc.setLocalDescription(ans)).then(() => {
    state.socket.emit('live_answer', { to: d.from, sdp: pc.localDescription });
  }).catch(e => console.error('answer 失败', e));
}

/* 观众：每 5s 用 getStats() 算 inbound 延迟，更新 pill + emit live_report_stats */
function startViewerStatsTimer() {
  stopLatencyTimers();
  state._noDataCount = 0;
  state.viewerStatsTimer = setInterval(async () => {
    const pc = state.viewerPC;
    if (!pc) return;
    let latency = 0, jitter = 0, packetsLost = 0, bitrate = 0;
    try {
      const stats = await pc.getStats();
      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          // 优先用 currentRoundTripTime（如可用）
          if (typeof report.currentRoundTripTime === 'number' && report.currentRoundTripTime > 0) {
            latency = Math.round(report.currentRoundTripTime * 1000);
          }
          if (typeof report.jitter === 'number') jitter = Math.round(report.jitter * 1000);
          if (typeof report.packetsLost === 'number') packetsLost = report.packetsLost;
          // 码率估算
          if (typeof report.bytesReceived === 'number' && report._lastBytes !== undefined && report.timestamp && report._lastTs) {
            const dt = (report.timestamp - report._lastTs) / 1000;
            if (dt > 0) bitrate = Math.round(((report.bytesReceived - report._lastBytes) * 8) / dt);
          }
          // 保存上一帧样本用于码率计算
          stats.forEach((r) => {
            if (r === report) { r._lastBytes = report.bytesReceived; r._lastTs = report.timestamp; }
          });
        }
      });
    } catch (e) { /* 静默 */ }
    // 检测持续无数据（OBS 断流）
    if (bitrate === 0 && packetsLost > 50) {
      state._noDataCount++;
      if (state._noDataCount >= 3) {
        toast('直播已中断，正在重连…', 'error');
        if (state.isViewing && state.currentHostId) {
          state.socket.emit('live_leave', { host_id: state.currentHostId });
          setTimeout(() => {
            if (state.isViewing && state.currentHostId) state.socket.emit('live_join', { host_id: state.currentHostId });
          }, 500);
        }
        state._noDataCount = 0;
        return;
      }
    } else {
      state._noDataCount = 0;
    }
    // 更新 UI
    const pill = document.getElementById('viewerLatencyPill');
    const txt = document.getElementById('viewerLatencyText');
    if (latency > 0) {
      pill.style.display = '';
      txt.textContent = latency + 'ms';
      pill.classList.remove('warn', 'bad');
      if (latency > 1500) pill.classList.add('bad');
      else if (latency > 800) pill.classList.add('warn');
    }
    // 上报给主播
    if (state.currentHostId) {
      state.socket.emit('live_report_stats', {
        host_id: state.currentHostId,
        latency, jitter, packets_lost: packetsLost, bitrate,
      });
    }
  }, 5000);
}

function stopLatencyTimers() {
  if (state.viewerStatsTimer) { clearInterval(state.viewerStatsTimer); state.viewerStatsTimer = null; }
  state._noDataCount = 0;
}

// 观众：静音切换
function toggleMute() {
  const v = document.getElementById('viewerPlayer');
  v.muted = !v.muted;
  const slider = document.getElementById('volumeSlider');
  if (!v.muted && +slider.value === 0) { slider.value = 100; v.volume = 1; }
}

// 观众：音量滑块
function onVolumeChange(val) {
  const v = document.getElementById('viewerPlayer');
  v.volume = val / 100;
  v.muted = val === 0;
}

// 观众：点赞 + 飘心动画
function sendLike() {
  state.likeCount++;
  document.getElementById('likeCount').textContent = fmtN(state.likeCount);
  const btn = document.getElementById('likeBtn');
  btn.classList.add('liked');
  setTimeout(() => btn.classList.remove('liked'), 400);
  spawnHeart();
}

function spawnHeart() {
  const layer = document.getElementById('heartsLayer');
  if (!layer) return;
  const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heart.setAttribute('class', 'lv-heart-fly');
  heart.setAttribute('viewBox', '0 0 24 24');
  heart.innerHTML = '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>';
  const x = 20 + Math.random() * 40;
  const drift = (Math.random() - 0.5) * 80;
  heart.style.right = x + 'px';
  heart.style.setProperty('--drift', drift + 'px');
  layer.appendChild(heart);
  setTimeout(() => heart.remove(), 2300);
}

// 观众：画中画
async function togglePiP() {
  const v = document.getElementById('viewerPlayer');
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (v.requestPictureInPicture) {
      await v.requestPictureInPicture();
    } else {
      toast('浏览器不支持画中画', 'error');
    }
  } catch (e) { toast('画中画失败', 'error'); }
}

// 观众：分享
async function shareLive() {
  const url = window.location.href.split('#')[0] + '?live=' + (state.currentHostId || '');
  try {
    if (navigator.share) {
      await navigator.share({ title: document.getElementById('vTitle').textContent, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast('链接已复制');
    }
  } catch (e) { /* 用户取消，静默 */ }
}

function onViewerIce(d) {
  if (!d.candidate) return;
  const pc = state.viewerPC;
  if (!pc) return;
  // 如果 remoteDescription 还没设置，缓冲起来等 setRemoteDescription 后 flush
  if (!pc.remoteDescription) {
    if (!state._pendingViewerIce) state._pendingViewerIce = [];
    state._pendingViewerIce.push(d.candidate);
    return;
  }
  pc.addIceCandidate(d.candidate).catch(() => {});
}

function leaveView(forced) {
  if (!state.isViewing) return;
  state.socket.emit('live_leave', { host_id: state.currentHostId });
  if (state.viewerPC) { state.viewerPC.close(); state.viewerPC = null; }
  state.isViewing = false;
  state.currentHostId = null;
  stopLatencyTimers();
  document.getElementById('viewerPlayer').srcObject = null;
  document.getElementById('muteBtnStatic').style.display = 'none';
  document.getElementById('volumeCtrl').style.display = '';
  document.getElementById('viewerLatencyPill').style.display = 'none';
  state.likeCount = 0;
  const lc = document.getElementById('likeCount'); if (lc) lc.textContent = '0';
  clearChat(false);
  document.getElementById('viewerView').style.display = 'none';
  document.getElementById('listView').style.display = '';
  if (!forced) state.socket.emit('live_lobby_join');
}

/* ===== 直播聊天 ===== */
function appendChat(d) {
  const list = state.isHosting ? document.getElementById('hostChatList') : (state.isViewing ? document.getElementById('viewerChatList') : null);
  if (!list) return;
  const empty = list.querySelector('.lv-chat-empty');
  if (empty) empty.remove();
  const isSelf = state.user && d.user_id === state.user.id;
  const msg = el('div', 'lv-chat-msg' + (isSelf ? ' self' : ''));
  if (d.avatar) {
    const av = el('img', 'lv-chat-msg-avatar'); av.src = d.avatar; msg.appendChild(av);
  } else {
    const ph = el('div', 'lv-chat-msg-avatar-ph', (d.username || '?').charAt(0).toUpperCase());
    msg.appendChild(ph);
  }
  const body = el('div', 'lv-chat-msg-body');
  const name = el('div', 'lv-chat-msg-name');
  name.textContent = d.username;
  if (d.is_quality) name.insertAdjacentHTML('beforeend', qualityBadgeHTML());
  body.appendChild(name);
  body.appendChild(el('div', 'lv-chat-msg-text', d.content));
  msg.appendChild(body);
  list.appendChild(msg);
  list.scrollTop = list.scrollHeight;
}

function sendChat(isHost) {
  const input = document.getElementById(isHost ? 'hostChatInput' : 'viewerChatInput');
  const content = input.value.trim();
  if (!content) return;
  const hostId = isHost ? state.myHostId : state.currentHostId;
  if (!hostId) return;
  state.socket.emit('live_chat', { host_id: hostId, content });
  input.value = '';
}

function toggleChat(isHost, collapse) {
  const chat = document.getElementById(isHost ? 'hostChat' : 'viewerChat');
  const openBtn = document.getElementById(isHost ? 'hostChatOpen' : 'viewerChatOpen');
  const willCollapse = collapse !== undefined ? collapse : !chat.classList.contains('collapsed');
  chat.classList.toggle('collapsed', willCollapse);
  openBtn.style.display = willCollapse ? 'flex' : 'none';
  const screen = document.getElementById(isHost ? 'hostScreen' : 'viewerScreen');
  if (screen) screen.classList.toggle('chat-open', !willCollapse);
}

function clearChat(isHost) {
  const list = document.getElementById(isHost ? 'hostChatList' : 'viewerChatList');
  if (list) list.innerHTML = '<div class="lv-chat-empty">暂无消息</div>';
  const chat = document.getElementById(isHost ? 'hostChat' : 'viewerChat');
  if (chat) chat.classList.remove('collapsed');
  const openBtn = document.getElementById(isHost ? 'hostChatOpen' : 'viewerChatOpen');
  if (openBtn) openBtn.style.display = 'none';
  const screen = document.getElementById(isHost ? 'hostScreen' : 'viewerScreen');
  if (screen) screen.classList.add('chat-open');
}

function openHostCard(s) {
  document.getElementById('hcName').textContent = s.username || '主播';
  const av = document.getElementById('hcAvatar');
  if (s.avatar) av.src = s.avatar; else av.removeAttribute('src');
  const parts = [];
  if (s.viewer_count !== undefined) parts.push(fmtN(s.viewer_count) + ' ' + t('t_people_watching'));
  parts.push(timeAgo(s.started_at) + '前开播');
  document.getElementById('hcMeta').textContent = parts.join(' · ');
  document.getElementById('hcProfile').href = '/?user=' + encodeURIComponent(s.username || '');
  loadHostStats(s.host_id);
  document.getElementById('hostCardModal').classList.add('show');
}

async function loadHostStats(hostId) {
  const elStats = document.getElementById('hcStats');
  if (!elStats) return;
  elStats.style.display = 'none';
  try {
    const d = await fetch('/api/live/stats/' + encodeURIComponent(hostId)).then(r => r.json());
    if (d.total_streams !== undefined) {
      elStats.style.display = '';
      document.getElementById('hcStatTotal').textContent = d.total_streams;
      document.getElementById('hcStatTotalLabel').textContent = '历史直播';
      const dur = d.total_duration || 0;
      let durText;
      if (dur >= 3600) durText = (dur / 3600).toFixed(1) + 'h';
      else if (dur >= 60) durText = Math.floor(dur / 60) + 'min';
      else durText = dur + 's';
      document.getElementById('hcStatDur').textContent = durText;
      document.getElementById('hcStatDurLabel').textContent = '累计时长';
    }
  } catch (e) { /* 静默失败 */ }
}

/* ===== 自定义确认弹窗 ===== */
function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = message;
  document.getElementById('confirmOk').onclick = () => {
    modal.classList.remove('show');
    if (onConfirm) onConfirm();
  };
  document.getElementById('confirmCancel').onclick = () => modal.classList.remove('show');
  modal.classList.add('show');
}

/* ===== 直播间已满提示 ===== */
function showFullModal(msg) {
  const modal = document.getElementById('fullModal');
  document.getElementById('fullMsg').textContent = msg;
  document.getElementById('fullClose').onclick = () => modal.classList.remove('show');
  modal.classList.add('show');
}

function appendSystemChat(isHost, text) {
  const list = document.getElementById(isHost ? 'hostChatList' : 'viewerChatList');
  if (!list) return;
  const empty = list.querySelector('.lv-chat-empty');
  if (empty) empty.remove();
  const msg = el('div', 'lv-chat-msg system');
  const body = el('div', 'lv-chat-msg-body');
  body.appendChild(el('div', 'lv-chat-msg-text', text));
  msg.appendChild(body);
  list.appendChild(msg);
  list.scrollTop = list.scrollHeight;
}

function startHostTimer() {
  state.hostStartTime = Date.now();
  stopHostTimer();
  state.hostTimer = setInterval(() => {
    const t = document.getElementById('hostTimer');
    if (!t) return;
    const s = Math.floor((Date.now() - state.hostStartTime) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    t.textContent = (h > 0 ? String(h).padStart(2,'0') + ':' : '') + String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }, 1000);
}

function stopHostTimer() {
  if (state.hostTimer) { clearInterval(state.hostTimer); state.hostTimer = null; }
}

/* ===== FAQ / Settings 模态 ===== */
function openFaqModal() { document.getElementById('faqModal').classList.add('show'); }
function closeFaqModal() { document.getElementById('faqModal').classList.remove('show'); }

function openSettingsModal() {
  const s = loadSettings();
  // 同步默认画质分段
  const seg = document.getElementById('defaultQualitySeg');
  if (seg) {
    seg.querySelectorAll('.lv-seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.quality === s.quality);
    });
  }
  document.getElementById('notifSwitch').classList.toggle('on', !!s.notif);
  document.getElementById('notifSwitch').setAttribute('aria-checked', !!s.notif);
  document.getElementById('lowLatencySwitch').classList.toggle('on', !!s.lowLatency);
  document.getElementById('lowLatencySwitch').setAttribute('aria-checked', !!s.lowLatency);
  document.getElementById('settingsModal').classList.add('show');
}
function closeSettingsModal() { document.getElementById('settingsModal').classList.remove('show'); }

function settingsApplyQuality(quality) {
  const s = loadSettings();
  s.quality = quality;
  saveSettings(s);
  state.quality = quality;
  syncQualitySeg();
}

function toggleNotifSwitch() {
  const s = loadSettings();
  s.notif = !s.notif;
  saveSettings(s);
  const sw = document.getElementById('notifSwitch');
  sw.classList.toggle('on', s.notif);
  sw.setAttribute('aria-checked', s.notif);
  if (s.notif && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

function toggleLowLatencySwitch() {
  const s = loadSettings();
  s.lowLatency = !s.lowLatency;
  saveSettings(s);
  const sw = document.getElementById('lowLatencySwitch');
  sw.classList.toggle('on', s.lowLatency);
  sw.setAttribute('aria-checked', s.lowLatency);
  toast(s.lowLatency ? t('t_lowlatency_on') : t('t_lowlatency_off'));
}

/* ===== 事件绑定 ===== */
function bindEvents() {
  const $on = (id, prop, fn) => { const el = document.getElementById(id); if (el) el[prop] = fn; else console.warn('[live] missing DOM:', id); };
  document.getElementById('goLiveBtn').onclick = openGoLive;
  document.getElementById('goLiveCancel').onclick = closeGoLive;
  document.getElementById('goLiveCancel2').onclick = closeGoLive;
  document.getElementById('goLiveModal').onclick = (e) => { if (e.target.id === 'goLiveModal') closeGoLive(); };
  document.getElementById('startLiveBtn').onclick = startLive;
  // 申请直播权限
  document.getElementById('applyCancel').onclick = closeApplyModal;
  document.getElementById('applyCancel2').onclick = closeApplyModal;
  document.getElementById('applyModal').onclick = (e) => { if (e.target.id === 'applyModal') closeApplyModal(); };
  document.getElementById('applySubmit').onclick = submitApply;
  document.getElementById('coverPlaceholder').onclick = () => document.getElementById('coverInput').click();
  document.getElementById('coverChangeBtn').onclick = (e) => { e.stopPropagation(); document.getElementById('coverInput').click(); };
  document.getElementById('coverPreview').onclick = () => document.getElementById('coverInput').click();
  document.getElementById('coverInput').onchange = (e) => onCoverPicked(e.target.files[0]);
  document.getElementById('channelNameInput').onkeydown = (e) => { if (e.key === 'Enter') submitApply(); };
  // 预览
  document.getElementById('previewCancel').onclick = closePreview;
  document.getElementById('previewReselect').onclick = () => { closePreview(); openGoLive(); };
  document.getElementById('previewConfirm').onclick = confirmStartLive;
  document.getElementById('previewModal').onclick = (e) => { if (e.target.id === 'previewModal') closePreview(); };
  // 结束
  document.getElementById('endLiveBtn').onclick = endLive;
  document.getElementById('endCloseBtn').onclick = () => { document.getElementById('endModal').classList.remove('show'); };
  document.getElementById('endAgainBtn').onclick = () => { document.getElementById('endModal').classList.remove('show'); openGoLive(); };
  document.getElementById('endModal').onclick = (e) => { if (e.target.id === 'endModal') e.currentTarget.classList.remove('show'); };
  // 主播控制坞
  document.getElementById('micToggleBtn').onclick = toggleMic;
  document.getElementById('camToggleBtn').onclick = toggleCamera;
  document.getElementById('camOverlayBtn').onclick = toggleCamOverlay;
  document.getElementById('pipToggleBtn').onclick = toggleHostPiP;
  document.getElementById('snapshotBtn').onclick = takeSnapshot;
  document.getElementById('fullscreenBtn').onclick = toggleFullscreen;
  document.getElementById('titleEditBtn').onclick = openTitleEdit;
  document.getElementById('titleEditCancel').onclick = closeTitleEdit;
  document.getElementById('titleEditCancel2').onclick = closeTitleEdit;
  document.getElementById('titleEditSave').onclick = saveTitleEdit;
  document.getElementById('titleEditModal').onclick = (e) => { if (e.target.id === 'titleEditModal') closeTitleEdit(); };
  document.getElementById('titleEditInput').onkeydown = (e) => { if (e.key === 'Enter') saveTitleEdit(); };
  // 主播信息卡
  document.getElementById('hostCardClose').onclick = () => { document.getElementById('hostCardModal').classList.remove('show'); };
  document.getElementById('hostCardModal').onclick = (e) => { if (e.target.id === 'hostCardModal') e.currentTarget.classList.remove('show'); };
  // 观众视图
  document.getElementById('leaveBtn').onclick = () => leaveView(false);
  document.getElementById('muteBtn').onclick = toggleMute;
  document.getElementById('volumeSlider').oninput = (e) => onVolumeChange(+e.target.value);
  document.getElementById('likeBtn').onclick = sendLike;
  document.getElementById('shareBtn').onclick = shareLive;
  document.getElementById('pipBtn').onclick = togglePiP;
  document.getElementById('viewerSnapBtn').onclick = () => {
    const vp = document.getElementById('viewerPlayer');
    if (!vp || !vp.videoWidth) { toast(t('t_video_not_ready'), 'error'); return; }
    const c = document.createElement('canvas');
    c.width = vp.videoWidth; c.height = vp.videoHeight;
    c.getContext('2d').drawImage(vp, 0, 0);
    c.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'live-snap-' + Date.now() + '.png';
      a.click(); URL.revokeObjectURL(a.href);
      toast(t('t_snapshot_saved'), 'success');
    });
  };
  document.getElementById('refreshBtn').onclick = () => state.socket.emit('live_lobby_join');
  // 播放器选择器
  const playerSelectBtn = document.getElementById('playerSelectBtn');
  const playerDropdown = document.getElementById('playerDropdown');
  if (playerSelectBtn && playerDropdown) {
    playerSelectBtn.onclick = (e) => { e.stopPropagation(); playerDropdown.style.display = playerDropdown.style.display === 'none' ? '' : 'none'; };
    document.querySelectorAll('.lv-player-option').forEach(opt => {
      opt.onclick = () => {
        document.querySelectorAll('.lv-player-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        document.getElementById('playerSelectLabel').textContent = opt.querySelector('span:nth-child(2)').textContent;
        playerDropdown.style.display = 'none';
        toast(t('player_direct'), 'success');
      };
    });
    document.addEventListener('click', () => { playerDropdown.style.display = 'none'; });
    playerDropdown.addEventListener('click', e => e.stopPropagation());
  }
  // 同意
  document.getElementById('consentAgree').onclick = () => {
    localStorage.setItem('live_agreed', '1');
    document.getElementById('liveConsent').classList.remove('show');
    startLiveApp();
  };
  document.getElementById('consentDeny').onclick = () => { window.location.href = '/'; };
  // 聊天
  document.getElementById('hostChatSend').onclick = () => sendChat(true);
  document.getElementById('viewerChatSend').onclick = () => sendChat(false);
  document.getElementById('hostChatInput').onkeydown = (e) => { if (e.key === 'Enter') sendChat(true); };
  document.getElementById('viewerChatInput').onkeydown = (e) => { if (e.key === 'Enter') sendChat(false); };
  document.getElementById('hostChatToggle').onclick = () => toggleChat(true);
  document.getElementById('viewerChatToggle').onclick = () => toggleChat(false);
  document.getElementById('hostChatOpen').onclick = () => toggleChat(true, false);
  document.getElementById('viewerChatOpen').onclick = () => toggleChat(false, false);
  // 选源 + 画质分段
  document.querySelectorAll('.lv-source-card').forEach(card => {
    card.onclick = () => {
      document.querySelectorAll('.lv-source-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.sourceType = card.dataset.source;
    };
  });
  document.querySelectorAll('#qualitySeg .lv-seg-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#qualitySeg .lv-seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.quality = btn.dataset.quality;
      const s = loadSettings(); s.quality = state.quality; saveSettings(s);
    };
  });
  // FAQ / Settings / MyChannels 导航按钮
  document.getElementById('faqNavBtn').onclick = openFaqModal;
  document.getElementById('faqClose').onclick = closeFaqModal;
  document.getElementById('faqDone').onclick = closeFaqModal;
  document.getElementById('faqModal').onclick = (e) => { if (e.target.id === 'faqModal') closeFaqModal(); };
  document.getElementById('settingsNavBtn').onclick = openSettingsModal;
  document.getElementById('settingsClose').onclick = closeSettingsModal;
  document.getElementById('settingsDone').onclick = closeSettingsModal;
  document.getElementById('settingsModal').onclick = (e) => { if (e.target.id === 'settingsModal') closeSettingsModal(); };
  document.querySelectorAll('#defaultQualitySeg .lv-seg-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#defaultQualitySeg .lv-seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settingsApplyQuality(btn.dataset.quality);
    };
  });
  document.getElementById('notifSwitch').onclick = toggleNotifSwitch;
  document.getElementById('lowLatencySwitch').onclick = toggleLowLatencySwitch;
  // 语言分段控件
  document.querySelectorAll('#langSeg .lv-seg-btn').forEach(btn => {
    btn.onclick = () => {
      const lang = btn.dataset.lang;
      if (lang === getLang()) return;
      setLang(lang);
      toast(t('t_lang_changed'));
    };
  });
  // 我的频道
  $on('myChannelsNavBtn', 'onclick', openMyChannelsModal);
  $on('myChannelsClose', 'onclick', closeMyChannelsModal);
  $on('myChannelsClose2', 'onclick', closeMyChannelsModal);
  $on('myChannelsModal', 'onclick', (e) => { if (e.target.id === 'myChannelsModal') closeMyChannelsModal(); });
  $on('myChannelsApply', 'onclick', () => {
    closeMyChannelsModal();
    state.coverFile = null;
    const ci = document.getElementById('coverInput'); if (ci) ci.value = '';
    const cni = document.getElementById('channelNameInput'); if (cni) cni.value = '';
    const as = document.getElementById('applyStatus'); if (as) as.style.display = 'none';
    const cp = document.getElementById('coverPreview'); if (cp) cp.style.display = 'none';
    const cph = document.getElementById('coverPlaceholder'); if (cph) cph.style.display = '';
    const am = document.getElementById('applyModal'); if (am) am.classList.add('show');
  });
  // 编辑直播间
  $on('editChannelClose', 'onclick', closeEditChannelModal);
  $on('editChannelCancel', 'onclick', closeEditChannelModal);
  $on('editChannelSave', 'onclick', submitEditChannel);
  $on('editChannelModal', 'onclick', (e) => { if (e.target.id === 'editChannelModal') closeEditChannelModal(); });
  $on('editCoverPlaceholder', 'onclick', () => { const eci = document.getElementById('editCoverInput'); if (eci) eci.click(); });
  $on('editCoverChangeBtn', 'onclick', (e) => { e.stopPropagation(); const eci = document.getElementById('editCoverInput'); if (eci) eci.click(); });
  $on('editCoverPreview', 'onclick', () => { const eci = document.getElementById('editCoverInput'); if (eci) eci.click(); });
  $on('editCoverInput', 'onchange', (e) => onEditCoverPicked(e.target.files[0]));
  $on('editChannelNameInput', 'onkeydown', (e) => { if (e.key === 'Enter') submitEditChannel(); });
  // 频道选择
  $on('pickChannelClose', 'onclick', closePickChannel);
  $on('pickChannelCancel', 'onclick', closePickChannel);
  $on('pickChannelConfirm', 'onclick', confirmPickChannel);
  $on('pickChannelModal', 'onclick', (e) => { if (e.target.id === 'pickChannelModal') closePickChannel(); });
  // 卸载
  window.addEventListener('beforeunload', () => {
    if (state.isViewing) { state.socket.emit('live_leave', { host_id: state.currentHostId }); }
  });
}

init();

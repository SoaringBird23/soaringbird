/* ===== SoaringBird 论坛 - 前端逻辑（API 版） ===== */

const API = '';
const CATEGORIES = [
  { id: 'tech', name: '技术', color: '#0071E3' },
  { id: 'design', name: '设计', color: '#BF5AF2' },
  { id: 'product', name: '产品', color: '#FF9F0A' },
  { id: 'career', name: '职场', color: '#30D158' },
  { id: 'resource', name: '资源', color: '#64D2FF' },
  { id: 'casual', name: '闲聊', color: '#FF375F' }
];

/* ===== 多语言翻译 ===== */
const I18N = {
  'zh-CN': {
    nav_home: '首页', nav_live: '直播', nav_news: '新闻', nav_msg: '消息', nav_bookmarks: '收藏', login: '登录', register: '注册',
    profile: '个人主页', my_bookmarks: '我的收藏', settings: '设置', logout: '退出登录', sbAccount: '翱翔鸟账户',
    notifications: '通知', mark_all_read: '全部已读', no_notifications: '暂无通知',
    hero_title: '翱翔鸟', hero_sub: '探索，交流，分享见解。',
    search_placeholder: '搜索帖子、话题…', latest_posts: '最新帖子',
    hot_posts: '最热帖子', unanswered_posts: '待回复帖子',
    new_post: '发帖', latest: '最新', hot: '最热', unanswered: '待回复',
    back: '返回', replies: '回复', reply_placeholder: '写下你的回复…',
    submit_reply: '发布回复', bookmark: '收藏', delete: '删除',
    title: '标题', category: '分类', tags: '标签', content: '内容',
    create_post: '发布新帖', cancel: '取消', publish: '发布',
    enter_title: '输入帖子标题…', tags_separator: '逗号分隔',
    write_thoughts: '写下你的想法…',
    username: '用户名', password: '密码', email: '邮箱',
    confirm_password: '确认密码', enter_username: '输入用户名',
    enter_password: '输入密码', enter_email: '输入邮箱',
    confirm_password_again: '再次输入密码',
    personal_info: '个人信息', bio: '个性签名',
    enter_username_short: '输入用户名', write_something: '写点什么…',
    appearance: '外观', dark_mode: '深色模式', save_settings: '保存设置',
    search_results: '搜索结果', no_posts: '暂无帖子', publish_first: '发布第一个帖子吧',
    no_bookmarks: '暂无收藏', bookmarks_hint: '收藏的帖子会出现在这里',
    no_replies: '暂无回复', reply_hint: '来说点什么吧',
    just_now: '刚刚', minutes_ago: '分钟前', hours_ago: '小时前',
    days_ago: '天前', loading: '加载中…', load_failed: '加载失败',
    login_required: '请先登录', post_success: '发布成功',
    reply_success: '回复成功', bookmarked: '已收藏',
    unbookmarked: '已取消收藏', deleted: '帖子已删除',
    fill_complete: '请填写完整', password_min: '密码至少4位',
    password_mismatch: '两次密码不一致', username_exists: '用户名已存在',
    register_success: '注册成功', login_success: '登录成功',
    logged_out: '已退出登录', settings_saved: '设置已保存',
    username_empty: '用户名不能为空', reply_empty: '请输入回复内容',
    title_empty: '请输入标题', content_empty: '请输入内容',
    wrong_password: '用户名或密码错误',
    no_search_results: '未找到结果', try_other: '试试其他关键词',
    copyright: '© 2026 SoaringBird 论坛 版权所有',
    tech: '技术', design: '设计', product: '产品',
    career: '职场', resource: '资源', casual: '闲聊',
    posts: '帖子', likes: '获赞', no_bio: '这个人很懒，什么都没写',
    their_posts: 'TA的帖子', search_label: '搜索：',
    language: '语言',
    terms: '用户协议', privacy: '隐私政策', values: '价值观',
    openSource: '开源', openSourceDesc: '翱翔鸟的全部代码已公开，可以自行部署。', openSourceLink: '在 GitHub 查看',
    unlogged: '未登录', verified: '已验证', unverified: '未验证', report: '举报', unknown: '未知',
    follower: '粉丝', following: '关注', following_yes: '已关注', dm: '私聊', followHint: '关注后可私聊', follow_disabled: '禁止关注', never_online: '从未上线', my_posts: '我的帖子',
    settingsEmailMgmt: '邮箱管理', currentEmail: '当前邮箱', changeEmail: '修改邮箱',
    newEmailPlaceholder: '输入新邮箱', changeBtn: '修改', verifyEmailTitle: '验证邮箱（需先获取验证码）',
    emailCodePlaceholder: '输入验证码', getCode: '获取验证码', verifyBtn: '验证',
    bgImage: '背景图片', customBg: '自定义背景', chooseImage: '选择图片', remove: '移除',
    security: '安全设置', loginCodeToggle: '登录验证码', loginCodeHint: '开启后,登录时需要输入邮箱验证码',
    dangerZone: '危险操作', deleteAccountBtn: '注销账号', deleteAccountDesc: '注销后，你的账号及其发布的帖子、评论、私信等全部数据将被永久删除，且无法恢复。请谨慎操作。',
    delAccConfirmTitle: '确认注销账号', delAccConfirmDesc: '此操作不可撤销。你的账号、帖子、评论、私信等全部数据将被永久删除。请输入密码以确认注销。',
    delAccPasswordPlaceholder: '输入当前密码', confirmDeleteBtn: '确认注销', delAccNeedPassword: '请输入当前密码', delAccDone: '账号已注销',
    detecting: '检测中…', addPasskey: '添加安全密钥',
    developer: '开发者', devPlatform: '翱翔鸟开发者平台', gotoDevPlatform: '进入开发者平台',
    devProtocolHint: '为你的应用接入翱翔鸟登录，OAuth 2.0 标准协议', bugFeedback: 'Bug 反馈',
    bugPlaceholder: '描述你遇到的 Bug...', submitFeedback: '提交反馈',
    share: '分享', copyLink: '复制链接', systemShare: '系统分享', saveAsImage: '分享为图片',
    sharePostTitle: '分享帖子', shareProfileTitle: '分享个人主页',
    darkCard: '深色卡片', lightCard: '浅色卡片', preview: '预览',
    previewHint: '效果即为分享图', saveImage: '保存图片', systemShareImage: '系统分享图片',
    shareImgSaved: '已保存图片', chooseLoginMethod: '选择登录方式', sbAccountLogin: '翱翔鸟账号登录',
    dlAppName: '翱翔鸟论坛客户端', dlDesc: '随时随地与社区保持连接，通知、私聊、直播一触即达。',
    dlGoDownload: '前往下载页', dlLater: '稍后再说',
    happyBirthday: '生日快乐', bdaySub: '愿你的每一天都闪闪发光', continue: '继续',
    needAction: '需要操作', emailUnverified: '邮箱未验证', verifySplashSub: '你的邮箱尚未验证，请尽快完成验证',
    willDelete: '3 天内未验证将删除账号', willDeleteDesc: '为防止虚假注册，未验证账号将被自动清理',
    goVerify: '前往设置验证邮箱', goVerifyDesc: '设置 → 邮箱管理 → 获取验证码 → 验证',
    verifyNow: '前往验证', bdayBanner: '今天是 %s 的生日，祝 TA 生日快乐',
    cardPostEyebrow: '来自翱翔鸟论坛的帖子分享', cardPostFooter: '在翱翔鸟论坛阅读全文',
    cardProfileEyebrow: '翱翔鸟论坛 · 个人主页', cardProfileFooter: '在翱翔鸟论坛浏览TA的主页',
    shareGenFail: '生成失败，请重试',
    // 个人资料设置
    birthday: '生日',
    age: '年龄', ageOptional: '(可选)', ageHiddenHint: '不填则隐藏',
    region: '地区', regionPlaceholder: '如：中国 · 上海',
    gender: '性别', genderSecret: '保密', genderMale: '男', genderFemale: '女', genderOther: '其他',
    avatar: '头像', uploadAvatar: '上传头像',
    m_default: '月', d_default: '日',
    m1: '1月', m2: '2月', m3: '3月', m4: '4月', m5: '5月', m6: '6月', m7: '7月', m8: '8月', m9: '9月', m10: '10月', m11: '11月', m12: '12月',
    emailVerifyWarning: '请尽快验证邮箱，3 天内未验证的账号将被自动删除',
    themeLight: '浅色', themeDark: '深色', themeGeek: '极客',
    liquidGlass: '液态玻璃', liquidGlassHint: '部分浏览器可能不适配，请尽量使用 Edge 或 Chrome',
    perfMode: '性能优化', perfModeHint: '禁用动画、模糊、阴影等特效，老设备不发烫不卡顿',
    passkey: '安全密钥', fullscreen: '全屏编辑',
    messages: '消息', download: '下载客户端', menu: '菜单',
    dismissLater: '稍后提醒', splashVersion: '翱翔鸟论坛',
    chat: '聊天', notif: '通知', chatGroup: '群聊', chatDm: '私聊', chatFullscreen: '全屏',
    chatInputHint: '发送消息...', chatOnlineCount: '%s 人在线',
    translate: '翻译', showOriginal: '原文', transFail: '翻译失败，请稍后再试', trLoginFirst: '请先登录后再翻译', trQuotaOut: '今日翻译额度已用完，请明天再试', trEmpty: '该内容没有可翻译的文本', trNetwork: '网络连接失败，请稍后再试',
  },
  'zh-TW': {
    nav_home: '首頁', nav_live: '直播', nav_news: '新聞', nav_msg: '訊息', nav_bookmarks: '收藏', login: '登入', register: '註冊',
    profile: '個人主頁', my_bookmarks: '我的收藏', settings: '設定', logout: '登出', sbAccount: '翱翔鳥帳戶',
    notifications: '通知', mark_all_read: '全部已讀', no_notifications: '暫無通知',
    hero_title: '翱翔鳥', hero_sub: '探索，交流，分享見解。',
    search_placeholder: '搜尋帖子、話題…', latest_posts: '最新帖子',
    hot_posts: '最熱帖子', unanswered_posts: '待回覆帖子',
    new_post: '發帖', latest: '最新', hot: '最熱', unanswered: '待回覆',
    back: '返回', replies: '回覆', reply_placeholder: '寫下你的回覆…',
    submit_reply: '發佈回覆', bookmark: '收藏', delete: '刪除',
    title: '標題', category: '分類', tags: '標籤', content: '內容',
    create_post: '發佈新帖', cancel: '取消', publish: '發佈',
    enter_title: '輸入帖子標題…', tags_separator: '逗號分隔',
    write_thoughts: '寫下你的想法…',
    username: '使用者名稱', password: '密碼', email: '電子郵件',
    confirm_password: '確認密碼', enter_username: '輸入使用者名稱',
    enter_password: '輸入密碼', enter_email: '輸入電子郵件',
    confirm_password_again: '再次輸入密碼',
    personal_info: '個人資訊', bio: '個性簽名',
    enter_username_short: '輸入使用者名稱', write_something: '寫點什麼…',
    appearance: '外觀', dark_mode: '深色模式', save_settings: '儲存設定',
    search_results: '搜尋結果', no_posts: '暫無帖子', publish_first: '發佈第一個帖子吧',
    no_bookmarks: '暫無收藏', bookmarks_hint: '收藏的帖子會出現在這裡',
    no_replies: '暫無回覆', reply_hint: '來說點什麼吧',
    just_now: '剛剛', minutes_ago: '分鐘前', hours_ago: '小時前',
    days_ago: '天前', loading: '載入中…', load_failed: '載入失敗',
    login_required: '請先登入', post_success: '發佈成功',
    reply_success: '回覆成功', bookmarked: '已收藏',
    unbookmarked: '已取消收藏', deleted: '帖子已刪除',
    fill_complete: '請填寫完整', password_min: '密碼至少4位',
    password_mismatch: '兩次密碼不一致', username_exists: '使用者名稱已存在',
    register_success: '註冊成功', login_success: '登入成功',
    logged_out: '已登出', settings_saved: '設定已儲存',
    username_empty: '使用者名稱不能為空', reply_empty: '請輸入回覆內容',
    title_empty: '請輸入標題', content_empty: '請輸入內容',
    wrong_password: '使用者名稱或密碼錯誤',
    no_search_results: '未找到結果', try_other: '試試其他關鍵詞',
    copyright: '© 2026 Bird 論壇 版權所有',
    tech: '技術', design: '設計', product: '產品',
    career: '職場', resource: '資源', casual: '閒聊',
    posts: '帖子', likes: '獲讚', no_bio: '這個人很懶，什麼都沒寫',
    their_posts: 'TA的帖子', search_label: '搜尋：',
    language: '語言',
    terms: '用戶協議', privacy: '隱私政策', values: '價值觀',
    openSource: '開源', openSourceDesc: '翱翔鳥的全部程式碼已公開，可以自行部署。', openSourceLink: '在 GitHub 查看',
    unlogged: '未登入', verified: '已驗證', unverified: '未驗證', report: '檢舉', unknown: '未知',
    follower: '粉絲', following: '關注', following_yes: '已關注', dm: '私訊', followHint: '關注後可私訊', follow_disabled: '禁止關注', never_online: '從未上線', my_posts: '我的帖子',
    settingsEmailMgmt: '郵箱管理', currentEmail: '目前郵箱', changeEmail: '修改郵箱',
    newEmailPlaceholder: '輸入新郵箱', changeBtn: '修改', verifyEmailTitle: '驗證郵箱（需先取得驗證碼）',
    emailCodePlaceholder: '輸入驗證碼', getCode: '取得驗證碼', verifyBtn: '驗證',
    bgImage: '背景圖片', customBg: '自訂背景', chooseImage: '選擇圖片', remove: '移除',
    security: '安全設定', loginCodeToggle: '登入驗證碼', loginCodeHint: '啟用後，登入時需要輸入郵箱驗證碼',
    dangerZone: '危險操作', deleteAccountBtn: '註銷帳號', deleteAccountDesc: '註銷後，你的帳號及其發佈的帖子、評論、私信等全部資料將被永久刪除，且無法恢復。請謹慎操作。',
    delAccConfirmTitle: '確認註銷帳號', delAccConfirmDesc: '此操作不可撤銷。你的帳號、帖子、評論、私信等全部資料將被永久刪除。請輸入密碼以確認註銷。',
    delAccPasswordPlaceholder: '輸入目前密碼', confirmDeleteBtn: '確認註銷', delAccNeedPassword: '請輸入目前密碼', delAccDone: '帳號已註銷',
    detecting: '檢測中…', addPasskey: '新增安全金鑰',
    developer: '開發者', devPlatform: '翱翔鳥開發者平台', gotoDevPlatform: '進入開發者平台',
    devProtocolHint: '為你的應用程式接入翱翔鳥登入，OAuth 2.0 標準協定', bugFeedback: 'Bug 回饋',
    bugPlaceholder: '描述你遇到的 Bug...', submitFeedback: '提交回饋',
    share: '分享', copyLink: '複製連結', systemShare: '系統分享', saveAsImage: '分享為圖片',
    sharePostTitle: '分享帖子', shareProfileTitle: '分享個人主頁',
    darkCard: '深色卡片', lightCard: '淺色卡片', preview: '預覽',
    previewHint: '效果即為分享圖', saveImage: '儲存圖片', systemShareImage: '系統分享圖片',
    shareImgSaved: '已儲存圖片', chooseLoginMethod: '選擇登入方式', sbAccountLogin: '翱翔鳥帳號登入',
    dlAppName: '翱翔鳥論壇用戶端', dlDesc: '隨時隨地與社群保持連線，通知、私訊、直播一觸即達。',
    dlGoDownload: '前往下載頁', dlLater: '稍後再說',
    happyBirthday: '生日快樂', bdaySub: '願你的每一天都閃閃發光', continue: '繼續',
    needAction: '需要操作', emailUnverified: '郵箱未驗證', verifySplashSub: '你的郵箱尚未驗證，請盡快完成驗證',
    willDelete: '3 天內未驗證將刪除帳號', willDeleteDesc: '為防止虛假註冊，未驗證帳號將被自動清理',
    goVerify: '前往設定驗證郵箱', goVerifyDesc: '設定 → 郵箱管理 → 取得驗證碼 → 驗證',
    verifyNow: '前往驗證', bdayBanner: '今天是 %s 的生日，祝 TA 生日快樂',
    cardPostEyebrow: '來自翱翔鳥論壇的帖子分享', cardPostFooter: '在翱翔鳥論壇閱讀全文',
    cardProfileEyebrow: '翱翔鳥論壇 · 個人主頁', cardProfileFooter: '在翱翔鳥論壇瀏覽TA的主頁',
    shareGenFail: '生成失敗，請重試',
    birthday: '生日',
    age: '年齡', ageOptional: '(可選)', ageHiddenHint: '不填則隱藏',
    region: '地區', regionPlaceholder: '如：中國 · 上海',
    gender: '性別', genderSecret: '保密', genderMale: '男', genderFemale: '女', genderOther: '其他',
    avatar: '頭像', uploadAvatar: '上傳頭像',
    m_default: '月', d_default: '日',
    m1: '1月', m2: '2月', m3: '3月', m4: '4月', m5: '5月', m6: '6月', m7: '7月', m8: '8月', m9: '9月', m10: '10月', m11: '11月', m12: '12月',
    emailVerifyWarning: '請盡快驗證郵箱，3 天內未驗證的帳號將被自動刪除',
    themeLight: '淺色', themeDark: '深色', themeGeek: '極客',
    liquidGlass: '液態玻璃', liquidGlassHint: '部分瀏覽器可能不適配，請盡量使用 Edge 或 Chrome',
    perfMode: '效能優化', perfModeHint: '禁用動畫、模糊、陰影等特效，舊裝置不發燙不卡頓',
    passkey: '安全金鑰', fullscreen: '全螢幕編輯',
    messages: '訊息', download: '下載用戶端', menu: '選單',
    dismissLater: '稍後提醒', splashVersion: '翱翔鳥論壇',
    chat: '聊天', notif: '通知', chatGroup: '群聊', chatDm: '私訊', chatFullscreen: '全螢幕',
    chatInputHint: '發送訊息...', chatOnlineCount: '%s 人在線',
    translate: '翻譯', showOriginal: '原文', transFail: '翻譯失敗，請稍後再試', trLoginFirst: '請先登入後再翻譯', trQuotaOut: '今日翻譯額度已用完，請明天再試', trEmpty: '該內容沒有可翻譯的文本', trNetwork: '網路連線失敗，請稍後再試',
  },
  'en': {
    nav_home: 'Home', nav_live: 'Live', nav_news: 'News', nav_msg: 'Messages', nav_bookmarks: 'Bookmarks', login: 'Log In', register: 'Sign Up',
    profile: 'Profile', my_bookmarks: 'My Bookmarks', settings: 'Settings', logout: 'Log Out', sbAccount: 'SoaringBird Account',
    notifications: 'Notifications', mark_all_read: 'Mark All Read', no_notifications: 'No notifications',
    hero_title: 'SoaringBird', hero_sub: 'Explore, discuss, share insights.',
    search_placeholder: 'Search posts, topics…', latest_posts: 'Latest Posts',
    hot_posts: 'Hot Posts', unanswered_posts: 'Unanswered Posts',
    new_post: 'New Post', latest: 'Latest', hot: 'Hot', unanswered: 'Unanswered',
    back: 'Back', replies: 'Replies', reply_placeholder: 'Write your reply…',
    submit_reply: 'Reply', bookmark: 'Bookmark', delete: 'Delete',
    title: 'Title', category: 'Category', tags: 'Tags', content: 'Content',
    create_post: 'Create Post', cancel: 'Cancel', publish: 'Publish',
    enter_title: 'Enter post title…', tags_separator: 'Comma separated',
    write_thoughts: 'Write your thoughts…',
    username: 'Username', password: 'Password', email: 'Email',
    confirm_password: 'Confirm Password', enter_username: 'Enter username',
    enter_password: 'Enter password', enter_email: 'Enter email',
    confirm_password_again: 'Enter password again',
    personal_info: 'Personal Info', bio: 'Bio',
    enter_username_short: 'Enter username', write_something: 'Write something…',
    appearance: 'Appearance', dark_mode: 'Dark Mode', save_settings: 'Save Settings',
    search_results: 'Search Results', no_posts: 'No posts yet', publish_first: 'Be the first to post',
    no_bookmarks: 'No bookmarks', bookmarks_hint: 'Bookmarked posts will appear here',
    no_replies: 'No replies', reply_hint: 'Be the first to reply',
    just_now: 'just now', minutes_ago: 'min ago', hours_ago: 'hr ago',
    days_ago: 'd ago', loading: 'Loading…', load_failed: 'Load failed',
    login_required: 'Please log in first', post_success: 'Published',
    reply_success: 'Reply posted', bookmarked: 'Bookmarked',
    unbookmarked: 'Bookmark removed', deleted: 'Post deleted',
    fill_complete: 'Please fill in all fields', password_min: 'Password must be at least 4 characters',
    password_mismatch: 'Passwords do not match', username_exists: 'Username already taken',
    register_success: 'Signed up successfully', login_success: 'Logged in',
    logged_out: 'Logged out', settings_saved: 'Settings saved',
    username_empty: 'Username cannot be empty', reply_empty: 'Please enter reply',
    title_empty: 'Please enter a title', content_empty: 'Please enter content',
    wrong_password: 'Invalid username or password',
    no_search_results: 'No results found', try_other: 'Try different keywords',
    copyright: '© 2026 SoaringBird Forum. All rights reserved.',
    tech: 'Tech', design: 'Design', product: 'Product',
    career: 'Career', resource: 'Resources', casual: 'Casual',
    posts: 'Posts', likes: 'Likes', no_bio: 'This user hasn\'t written a bio yet',
    their_posts: 'Their Posts', search_label: 'Search: ',
    language: 'Language',
    terms: 'Terms', privacy: 'Privacy', values: 'Values',
    openSource: 'Open Source', openSourceDesc: 'The complete source is published — you can run it yourself.', openSourceLink: 'View on GitHub',
    unlogged: 'Not signed in', verified: 'Verified', unverified: 'Unverified', report: 'Report', unknown: 'Unknown',
    follower: 'Fans', following: 'Following', following_yes: 'Following', dm: 'Message', followHint: 'Follow first to chat', follow_disabled: 'Following disabled', never_online: 'Never online', my_posts: 'My Posts',
    settingsEmailMgmt: 'Email Management', currentEmail: 'Current Email', changeEmail: 'Change Email',
    newEmailPlaceholder: 'Enter new email', changeBtn: 'Change', verifyEmailTitle: 'Verify Email (get a code first)',
    emailCodePlaceholder: 'Enter code', getCode: 'Get Code', verifyBtn: 'Verify',
    bgImage: 'Background', customBg: 'Custom Background', chooseImage: 'Choose Image', remove: 'Remove',
    security: 'Security', loginCodeToggle: 'Login Security Code', loginCodeHint: 'When enabled, an email code is required to log in.',
    dangerZone: 'Danger Zone', deleteAccountBtn: 'Delete Account', deleteAccountDesc: 'Deleting your account permanently removes your profile, posts, comments, and messages. This cannot be undone.',
    delAccConfirmTitle: 'Delete Account?', delAccConfirmDesc: 'This cannot be undone. Your account, posts, comments, and messages will be permanently deleted. Enter your password to confirm.',
    delAccPasswordPlaceholder: 'Enter current password', confirmDeleteBtn: 'Delete Account', delAccNeedPassword: 'Enter your current password', delAccDone: 'Account deleted',
    detecting: 'Checking…', addPasskey: 'Add Security Key',
    developer: 'Developer', devPlatform: 'SoaringBird Developer Platform', gotoDevPlatform: 'Open Developer Platform',
    devProtocolHint: 'Integrate SoaringBird sign-in into your app. OAuth 2.0.', bugFeedback: 'Bug Report',
    bugPlaceholder: 'Describe the bug you encountered...', submitFeedback: 'Submit Feedback',
    share: 'Share', copyLink: 'Copy Link', systemShare: 'System Share', saveAsImage: 'Share as Image',
    sharePostTitle: 'Share Post', shareProfileTitle: 'Share Profile',
    darkCard: 'Dark Card', lightCard: 'Light Card', preview: 'Preview',
    previewHint: 'This is what will be shared', saveImage: 'Save Image', systemShareImage: 'Share Image',
    shareImgSaved: 'Image saved', chooseLoginMethod: 'Choose how to log in', sbAccountLogin: 'Sign in with SoaringBird',
    dlAppName: 'SoaringBird Forum Client', dlDesc: 'Stay connected to the community anywhere — notifications, DMs and live streams, one tap away.',
    dlGoDownload: 'Go to Download', dlLater: 'Not Now',
    happyBirthday: 'Happy Birthday', bdaySub: 'Wishing you a wonderful day', continue: 'Continue',
    needAction: 'Action Needed', emailUnverified: 'Email Unverified', verifySplashSub: 'Your email has not been verified. Please verify it soon.',
    willDelete: 'Accounts unverified for 3 days will be deleted', willDeleteDesc: 'To prevent fake sign-ups, unverified accounts are automatically removed.',
    goVerify: 'Verify your email in Settings', goVerifyDesc: 'Settings → Email Management → Get Code → Verify',
    verifyNow: 'Verify Now', bdayBanner: 'Today is %s\'s birthday. Happy birthday!',
    cardPostEyebrow: 'Shared from SoaringBird Forum', cardPostFooter: 'Read the full post on SoaringBird Forum',
    cardProfileEyebrow: 'SoaringBird Forum · Profile', cardProfileFooter: 'View this profile on SoaringBird Forum',
    shareGenFail: 'Failed to generate. Please retry.',
    birthday: 'Birthday',
    age: 'Age', ageOptional: '(optional)', ageHiddenHint: 'Leave blank to hide',
    region: 'Region', regionPlaceholder: 'e.g. China · Shanghai',
    gender: 'Gender', genderSecret: 'Private', genderMale: 'Male', genderFemale: 'Female', genderOther: 'Other',
    avatar: 'Avatar', uploadAvatar: 'Upload Avatar',
    m_default: 'Month', d_default: 'Day',
    m1: 'Jan', m2: 'Feb', m3: 'Mar', m4: 'Apr', m5: 'May', m6: 'Jun', m7: 'Jul', m8: 'Aug', m9: 'Sep', m10: 'Oct', m11: 'Nov', m12: 'Dec',
    emailVerifyWarning: 'Please verify your email soon. Accounts unverified for 3 days will be automatically deleted.',
    themeLight: 'Light', themeDark: 'Dark', themeGeek: 'Geek',
    liquidGlass: 'Liquid Glass', liquidGlassHint: 'May not work in all browsers. Please use Edge or Chrome.',
    perfMode: 'Performance Mode', perfModeHint: 'Disable animations, blur and shadows so older devices run cooler and smoother.',
    passkey: 'Security Keys', fullscreen: 'Fullscreen',
    messages: 'Messages', download: 'Download Client', menu: 'Menu',
    dismissLater: 'Remind Me Later', splashVersion: 'SoaringBird Forum',
    chat: 'Chat', notif: 'Notifications', chatGroup: 'Group', chatDm: 'Message', chatFullscreen: 'Fullscreen',
    chatInputHint: 'Send a message...', chatOnlineCount: '%s online',
    translate: 'Translate', showOriginal: 'Original', transFail: 'Translation failed, please try again', trLoginFirst: 'Please log in first to translate', trQuotaOut: 'Daily translation quota reached — please try again tomorrow', trEmpty: 'There is no text to translate here', trNetwork: 'Network connection failed, please try again',
  },
  'ja': {
    nav_home: 'ホーム', nav_live: 'ライブ', nav_news: 'ニュース', nav_msg: 'メッセージ', nav_bookmarks: 'ブックマーク', login: 'ログイン', register: '新規登録',
    profile: 'プロフィール', my_bookmarks: 'マイブックマーク', settings: '設定', logout: 'ログアウト', sbAccount: 'SoaringBird アカウント',
    notifications: '通知', mark_all_read: 'すべて既読', no_notifications: '通知はありません',
    hero_title: 'SoaringBird', hero_sub: '探求し、語り合い、知見を分かち合う。',
    search_placeholder: '投稿やトピックを検索…', latest_posts: '最新の投稿',
    hot_posts: '人気の投稿', unanswered_posts: '未返信の投稿',
    new_post: '投稿する', latest: '最新', hot: '人気', unanswered: '未返信',
    back: '戻る', replies: '返信', reply_placeholder: '返信を入力…',
    submit_reply: '返信を投稿', bookmark: 'ブックマーク', delete: '削除',
    title: 'タイトル', category: 'カテゴリ', tags: 'タグ', content: '本文',
    create_post: '新しい投稿', cancel: 'キャンセル', publish: '投稿',
    enter_title: '投稿のタイトルを入力…', tags_separator: 'カンマ区切り',
    write_thoughts: '考えを書いてみましょう…',
    username: 'ユーザー名', password: 'パスワード', email: 'メールアドレス',
    confirm_password: 'パスワードの確認', enter_username: 'ユーザー名を入力',
    enter_password: 'パスワードを入力', enter_email: 'メールアドレスを入力',
    confirm_password_again: 'パスワードをもう一度入力',
    personal_info: 'プロフィール情報', bio: '自己紹介',
    enter_username_short: 'ユーザー名を入力', write_something: '何か書いてみましょう…',
    appearance: '外観', dark_mode: 'ダークモード', save_settings: '設定を保存',
    search_results: '検索結果', no_posts: '投稿はまだありません', publish_first: '最初の投稿をしてみましょう',
    no_bookmarks: 'ブックマークはありません', bookmarks_hint: 'ブックマークした投稿がここに表示されます',
    no_replies: '返信はまだありません', reply_hint: '最初の返信をしてみましょう',
    just_now: 'たった今', minutes_ago: '分前', hours_ago: '時間前',
    days_ago: '日前', loading: '読み込み中…', load_failed: '読み込みに失敗しました',
    login_required: '先にログインしてください', post_success: '投稿しました',
    reply_success: '返信しました', bookmarked: 'ブックマークしました',
    unbookmarked: 'ブックマークを解除しました', deleted: '投稿を削除しました',
    fill_complete: 'すべての項目を入力してください', password_min: 'パスワードは4文字以上必要です',
    password_mismatch: 'パスワードが一致しません', username_exists: 'このユーザー名は既に使われています',
    register_success: '登録が完了しました', login_success: 'ログインしました',
    logged_out: 'ログアウトしました', settings_saved: '設定を保存しました',
    username_empty: 'ユーザー名を入力してください', reply_empty: '返信内容を入力してください',
    title_empty: 'タイトルを入力してください', content_empty: '本文を入力してください',
    wrong_password: 'ユーザー名またはパスワードが正しくありません',
    no_search_results: '結果が見つかりません', try_other: '別のキーワードをお試しください',
    copyright: '© 2026 SoaringBird フォーラム. All rights reserved.',
    tech: '技術', design: 'デザイン', product: 'プロダクト',
    career: 'キャリア', resource: 'リソース', casual: '雑談',
    posts: '投稿', likes: 'いいね', no_bio: 'このユーザーはまだ自己紹介を書いていません',
    their_posts: 'この人の投稿', search_label: '検索：',
    language: '言語',
    terms: '利用規約', privacy: 'プライバシーポリシー', values: 'バリュー',
    openSource: 'オープンソース', openSourceDesc: '全ソースコードを公開しています。自分でデプロイできます。', openSourceLink: 'GitHub で見る',
    unlogged: '未ログイン', verified: '認証済み', unverified: '未認証', report: '通報', unknown: '不明',
    follower: 'フォロワー', following: 'フォロー中', following_yes: 'フォロー中', dm: 'メッセージ', followHint: 'フォローするとメッセージを送れます', follow_disabled: 'フォロー不可', never_online: 'オンライン履歴なし', my_posts: 'マイ投稿',
    settingsEmailMgmt: 'メール管理', currentEmail: '現在のメールアドレス', changeEmail: 'メールアドレスを変更',
    newEmailPlaceholder: '新しいメールアドレスを入力', changeBtn: '変更', verifyEmailTitle: 'メール認証（先にコードを取得）',
    emailCodePlaceholder: '認証コードを入力', getCode: 'コードを取得', verifyBtn: '認証',
    bgImage: '背景画像', customBg: 'カスタム背景', chooseImage: '画像を選択', remove: '削除',
    security: 'セキュリティ', loginCodeToggle: 'ログイン認証コード', loginCodeHint: '有効にすると、ログイン時にメール認証コードが必要になります',
    dangerZone: '危険な操作', deleteAccountBtn: 'アカウント削除', deleteAccountDesc: '削除すると、アカウントおよび投稿・コメント・メッセージなどのすべてのデータが完全に削除され、復元できません。慎重に操作してください。',
    delAccConfirmTitle: 'アカウントを削除しますか', delAccConfirmDesc: 'この操作は取り消せません。アカウント、投稿、コメント、メッセージなどのすべてのデータが完全に削除されます。確認のためパスワードを入力してください。',
    delAccPasswordPlaceholder: '現在のパスワードを入力', confirmDeleteBtn: '削除する', delAccNeedPassword: '現在のパスワードを入力してください', delAccDone: 'アカウントを削除しました',
    detecting: '確認中…', addPasskey: 'セキュリティキーを追加',
    developer: '開発者', devPlatform: 'SoaringBird 開発者プラットフォーム', gotoDevPlatform: '開発者プラットフォームを開く',
    devProtocolHint: 'OAuth 2.0 でアプリに SoaringBird ログインを導入', bugFeedback: 'バグ報告',
    bugPlaceholder: '発生したバグを説明してください...', submitFeedback: 'フィードバックを送信',
    share: '共有', copyLink: 'リンクをコピー', systemShare: 'システム共有', saveAsImage: '画像として共有',
    sharePostTitle: '投稿を共有', shareProfileTitle: 'プロフィールを共有',
    darkCard: 'ダークカード', lightCard: 'ライトカード', preview: 'プレビュー',
    previewHint: 'この表示が共有画像になります', saveImage: '画像を保存', systemShareImage: '画像を共有',
    shareImgSaved: '画像を保存しました', chooseLoginMethod: 'ログイン方法を選択', sbAccountLogin: 'SoaringBird アカウントでログイン',
    dlAppName: 'SoaringBird フォーラムアプリ', dlDesc: 'いつでもどこでもコミュニティとつながる。通知もメッセージもライブもワンタップで。',
    dlGoDownload: 'ダウンロードページへ', dlLater: '後で',
    happyBirthday: 'お誕生日おめでとう', bdaySub: '毎日が輝きますように', continue: '続ける',
    needAction: '対応が必要です', emailUnverified: 'メール未認証', verifySplashSub: 'メールアドレスが未認証です。早めに認証を完了してください',
    willDelete: '3日以内に認証しないとアカウントが削除されます', willDeleteDesc: '不正な登録を防ぐため、未認証のアカウントは自動的に削除されます',
    goVerify: '設定からメールを認証', goVerifyDesc: '設定 → メール管理 → コードを取得 → 認証',
    verifyNow: '今すぐ認証', bdayBanner: '今日は %s さんの誕生日です。おめでとうございます',
    cardPostEyebrow: 'SoaringBird フォーラムの投稿', cardPostFooter: 'SoaringBird フォーラムで全文を読む',
    cardProfileEyebrow: 'SoaringBird フォーラム · プロフィール', cardProfileFooter: 'SoaringBird フォーラムでこのプロフィールを見る',
    shareGenFail: '生成に失敗しました。もう一度お試しください',
    // 个人资料设置
    birthday: '誕生日',
    age: '年齢', ageOptional: '（任意）', ageHiddenHint: '未入力の場合は非表示',
    region: '地域', regionPlaceholder: '例：日本 · 東京',
    gender: '性別', genderSecret: '非公開', genderMale: '男性', genderFemale: '女性', genderOther: 'その他',
    avatar: 'アイコン', uploadAvatar: 'アイコンをアップロード',
    m_default: '月', d_default: '日',
    m1: '1月', m2: '2月', m3: '3月', m4: '4月', m5: '5月', m6: '6月', m7: '7月', m8: '8月', m9: '9月', m10: '10月', m11: '11月', m12: '12月',
    emailVerifyWarning: 'メールアドレスを早めに認証してください。3日以内に認証されないアカウントは自動的に削除されます',
    themeLight: 'ライト', themeDark: 'ダーク', themeGeek: 'ギーク',
    liquidGlass: 'リキッドグラス', liquidGlassHint: '一部のブラウザでは動作しない場合があります。Edge または Chrome をご利用ください',
    perfMode: 'パフォーマンスモード', perfModeHint: 'アニメーション・ぼかし・影などの効果を無効にし、古い端末でも快適に動作します',
    passkey: 'セキュリティキー', fullscreen: '全画面編集',
    messages: 'メッセージ', download: 'アプリをダウンロード', menu: 'メニュー',
    dismissLater: '後で通知', splashVersion: 'SoaringBird フォーラム',
    chat: 'チャット', notif: '通知', chatGroup: 'グループ', chatDm: 'メッセージ', chatFullscreen: '全画面',
    chatInputHint: 'メッセージを送信...', chatOnlineCount: '%s 人がオンライン',
    translate: '翻訳', showOriginal: '原文', transFail: '翻訳に失敗しました。しばらくしてからお試しください', trLoginFirst: '翻訳するには先にログインしてください', trQuotaOut: '本日の翻訳上限に達しました。明日またお試しください', trEmpty: '翻訳できるテキストがありません', trNetwork: 'ネットワーク接続に失敗しました。しばらくしてからお試しください',
  }
};

let currentLang = localStorage.getItem('bird_lang') || 'zh-CN';

function t(key) { return (I18N[currentLang] && I18N[currentLang][key]) || I18N['zh-CN'][key] || key; }

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('bird_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-seg-btn').forEach(i => i.classList.toggle('active', i.dataset.lang === lang));
  applyTranslations();
  renderCategoryFilter();
  renderCategorySelect();
  if (state.currentPage === 'home') renderPosts();
  else if (state.currentPage === 'post') renderPostDetail();
  else if (state.currentPage === 'bookmarks') renderBookmarks();
  else if (state.currentPage === 'search') renderSearch();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t(key)) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t(key)) el.placeholder = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t(key)) el.title = t(key);
  });
  // 未登录文案（保持已登录用户名不被覆盖）
  const dd = document.getElementById('dropdownName');
  if (dd) {
    const cur = dd.textContent.trim();
    if (cur === '未登录' || cur === '未登入' || cur === 'Not signed in') dd.textContent = t('unlogged');
  }
  // 邮箱验证状态徽标
  const vb = document.getElementById('emailVerifiedBadge');
  if (vb && vb.style.display !== 'none') vb.textContent = t('verified');
  const ub = document.getElementById('emailUnverifiedBadge');
  if (ub && ub.style.display !== 'none') ub.textContent = t('unverified');
  // 分享副标题（保留英文角标）
  const ss = document.getElementById('shareSub');
  if (ss) {
    const l = ss.querySelector('[data-i18n]');
    if (l && t('saveAsImage')) l.textContent = t('saveAsImage');
  }
  // Update section title based on current tab
  const titles = { latest: t('latest_posts'), hot: t('hot_posts'), unanswered: t('unanswered_posts') };
  const st = document.getElementById('sectionTitle');
  if (st) st.textContent = titles[state.feedTab] || t('latest_posts');
  // Copyright
  const cp = document.getElementById('copyrightText');
  if (cp) cp.textContent = t('copyright');
  // Auth modal
  if (state.authTab === 'login') {
    const amt = document.getElementById('authModalTitle');
    if (amt) amt.textContent = t('login');
    const asb = document.getElementById('authSubmitBtn');
    if (asb) asb.textContent = t('login');
  } else {
    const amt = document.getElementById('authModalTitle');
    if (amt) amt.textContent = t('register');
    const asb = document.getElementById('authSubmitBtn');
    if (asb) asb.textContent = t('register');
  }
  // 生日月份/日期下拉
  const bm = document.getElementById('profileBirthdayMonth');
  if (bm) {
    bm.querySelectorAll('option').forEach(o => {
      if (o.value === '0') o.textContent = t('m_default');
      else o.textContent = t('m' + parseInt(o.value, 10));
    });
  }
  const bd = document.getElementById('profileBirthdayDay');
  if (bd) {
    bd.querySelectorAll('option').forEach(o => {
      if (o.value === '0') o.textContent = t('d_default');
    });
  }
  // 性别下拉
  const gd = document.getElementById('profileGender');
  if (gd) {
    const gmap = { '': 'genderSecret', '男': 'genderMale', '女': 'genderFemale', '其他': 'genderOther' };
    gd.querySelectorAll('option').forEach(o => { if (gmap[o.value]) o.textContent = t(gmap[o.value]); });
  }
  // 聊天在线人数
  const coc = document.getElementById('chatOnlineCount');
  if (coc) {
    const n = (coc.textContent.match(/^\d+/) || ['0'])[0];
    coc.textContent = t('chatOnlineCount').replace('%s', n);
  }
}

function toggleLangMenu() {
  document.getElementById('langMenu').classList.toggle('show');
}

function getCategoryName(id) { return t(id) || id; }

const state = {
  currentUser: null,
  currentPage: 'home',
  feedTab: 'latest',
  categoryFilter: null,
  searchQuery: '',
  authTab: 'login',
  currentPostId: null,
  currentProfileId: null
};

/* ===== API 请求封装 ===== */
async function api(path, options = {}) {
  const { raw, ...opts } = { credentials: 'same-origin', ...options };
  if (!raw) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (opts.body && typeof opts.body === 'object') {
      opts.body = JSON.stringify(opts.body);
    }
  }
  // raw mode: keep credentials, don't set Content-Type (browser sets multipart boundary)
  const res = await fetch(API + path, opts);
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
    throw err;
  }
  return data;
}

/* ===== 管理员消息 / 公告 ===== */
function _annBody(t) { return esc(t || '').replace(/\n/g, '<br>'); }

function _shortTime(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function loadAnnouncements() {
  let list = [];
  try {
    const data = await api('/api/announcements');
    list = data.announcements || [];
  } catch (e) { list = []; }
  renderAnnouncementBar(list.filter(a => a.show_home));
  const splash = list.filter(a => a.show_splash);
  if (splash.length) setTimeout(() => showAnnounceSplash(splash), 950);
}

function renderAnnouncementBar(list) {
  const container = document.getElementById('announcementBar');
  if (!container) return;
  let shown = list;
  try { shown = list.filter(a => sessionStorage.getItem('annDismissed_' + a.id) !== '1'); } catch (e) {}
  if (!shown.length) { container.style.display = 'none'; container.innerHTML = ''; return; }
  container.style.display = '';
  container.innerHTML = shown.map(a => {
    const imp = a.type === 'important';
    const clickable = a.id === 'verify_reminder';
    return `<article class="ann-card${imp ? ' important' : ''}${clickable ? ' is-clickable' : ''}" data-id="${escAttr(a.id)}"${clickable ? ' onclick="navigateTo(\'settings\')"' : ''}>
        <div class="ann-card-top">
          <span class="ann-card-tag">${imp ? '重要消息' : '公告'}</span>
          <button class="ann-card-x" onclick="event.stopPropagation();dismissAnnCard('${escAttr(a.id)}')" aria-label="关闭">✕</button>
        </div>
        <h3 class="ann-card-title">${esc(a.title)}</h3>
        <div class="ann-card-body">${_annBody(a.content)}</div>
        <div class="ann-card-foot">${esc(a.author || '管理员')}${a.created_at ? ' · ' + _shortTime(a.created_at) : ''}</div>
      </article>`;
  }).join('');
}

function dismissAnnCard(id) {
  try { sessionStorage.setItem('annDismissed_' + id, '1'); } catch (e) {}
  const el = document.querySelector('.ann-card[data-id="' + id + '"]');
  if (el) el.remove();
  const c = document.getElementById('announcementBar');
  if (c && !c.querySelector('.ann-card')) { c.style.display = 'none'; }
}

function showAnnounceSplash(list) {
  const overlay = document.getElementById('announceSplash');
  const box = document.getElementById('annSplashList');
  if (!overlay || !box) return;
  // 关站全屏通知优先级最高，避免两层弹窗叠在一起
  const cn = document.getElementById('closeNotice');
  if (cn && cn.classList.contains('show')) return;
  const kicker = document.getElementById('annSplashKicker');
  if (kicker) kicker.textContent = list.some(a => a.type === 'important') ? '重要消息' : '公告';
  box.innerHTML = list.map(a => `<div class="announce-item${a.type === 'important' ? ' important' : ''}">
      <h3 class="announce-title">${esc(a.title)}</h3>
      <div class="announce-body">${_annBody(a.content)}</div>
      <div class="announce-by">${esc(a.author || '管理员')}${a.created_at ? ' · ' + _shortTime(a.created_at) : ''}</div>
    </div>`).join('');
  overlay.style.display = '';
  requestAnimationFrame(() => overlay.classList.add('show'));
}

function closeAnnounceSplash() {
  const overlay = document.getElementById('announceSplash');
  if (!overlay) return;
  overlay.classList.remove('show');
  setTimeout(() => { overlay.style.display = 'none'; }, 220);
}

/* ===== 关站全屏通知（每次打开都会出现） ===== */
function showCloseNotice() {
  const el = document.getElementById('closeNotice');
  if (!el) return;
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('cn-lock');
}

function closeCloseNotice() {
  const el = document.getElementById('closeNotice');
  if (!el) return;
  el.classList.remove('show');
  el.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('cn-lock');
}

function downloadMyData() {
  if (!state.currentUser) {
    closeCloseNotice();
    showLoginModal();
    showToast('登录后重新打开首页，即可在通知里下载你的内容');
    return;
  }
  window.location.href = '/api/export';
}

/* ===== 纪念徽章（Canvas 生成后可下载） ===== */
function _badgeLoadImg(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

let _badgeBusy = false;
async function downloadBadge() {
  if (_badgeBusy) return;
  _badgeBusy = true;
  let info = null;
  try {
    const r = await fetch('/api/badge/stats', { credentials: 'same-origin' });
    info = (await r.json()).user || null;
  } catch (e) {}

  try {
    const W = 720, S = 2;
    const cv = document.createElement('canvas');
    cv.width = W * S; cv.height = W * S;
    const ctx = cv.getContext('2d');
    ctx.scale(S, S);

    // 天空
    const stops = [
      [0, '#060302'], [0.045, '#0b0503'], [0.07, '#201006'], [0.078, '#431c05'], [0.085, '#6b3c0e'],
      [0.094, '#83501a'], [0.105, '#8c6220'], [0.118, '#8e6e27'], [0.132, '#8d722b'], [0.15, '#8a7431'],
      [0.178, '#7f7239'], [0.215, '#6c6b40'], [0.26, '#5c6048'], [0.31, '#505a4f'], [0.37, '#475351'],
      [0.44, '#404c50'], [0.52, '#3a4951'], [0.61, '#34434c'], [0.71, '#2f3d48'], [0.81, '#2c3944'],
      [0.90, '#2b3742'], [1, '#293440']
    ];
    const sky = ctx.createLinearGradient(0, W, 0, 0);
    stops.forEach(([p, c]) => sky.addColorStop(p, c));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, W);

    // 落日
    const sx = W * 0.84, sy = W * 0.885;
    const halo = (radius, c0, c1, c2) => {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
      g.addColorStop(0, c0); g.addColorStop(0.32, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    };
    halo(300, 'rgba(255,208,104,0.34)', 'rgba(250,174,64,0.16)', 'rgba(240,142,40,0)');
    halo(190, 'rgba(255,248,212,0.95)', 'rgba(252,228,142,0.58)', 'rgba(240,196,80,0)');
    const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20);
    core.addColorStop(0, '#fffef8'); core.addColorStop(0.55, '#fffae4');
    core.addColorStop(1, 'rgba(255,242,190,0)');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2); ctx.fill();

    // 地平线以下
    const gh = W * 0.10;
    const gr = ctx.createLinearGradient(0, W - gh, 0, W);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.4, 'rgba(6,3,2,0.72)');
    gr.addColorStop(0.65, '#070302'); gr.addColorStop(1, '#000');
    ctx.fillStyle = gr;
    ctx.fillRect(0, W - gh, W, gh);

    // 细边框
    ctx.strokeStyle = 'rgba(246,241,232,0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(26.5, 26.5, W - 53, W - 53);

    const serif = '"New York", Georgia, "Songti SC", serif';
    const mono = '"SF Mono", Menlo, monospace';
    const sans = '-apple-system, "PingFang SC", sans-serif';
    const say = (t, y, font, color) => {
      ctx.font = font; ctx.fillStyle = color;
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(t, W / 2, y);
    };
    const dates = '2026.6.5 — 2026.12.1';
    // 顶部角标：让徽章像一枚有编号的纪念章
    const corner = (left, right) => {
      ctx.font = `10px ${mono}`;
      ctx.fillStyle = 'rgba(242,236,225,0.4)';
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left'; ctx.fillText(left, 46, 62);
      ctx.textAlign = 'right'; ctx.fillText(right, W - 46, 62);
      ctx.textAlign = 'center';
    };

    if (info) {
      // 登录用户：头像 + 鸟标 + 加入序号 + 发帖 / 粉丝
      const avatarSrc = info.avatar
        ? (info.avatar.startsWith('http') || info.avatar.startsWith('/') ? info.avatar : '/' + info.avatar)
        : '';
      const [img, brand] = await Promise.all([
        _badgeLoadImg(avatarSrc), _badgeLoadImg('logo-dark.png')
      ]);
      const cx = W / 2, cy = 196, r = 62;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
      ctx.clip();
      if (img) {
        const k = Math.max((r * 2) / img.width, (r * 2) / img.height);
        const dw = img.width * k, dh = img.height * k;
        ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.fillStyle = '#f7f2e7';
        ctx.font = `600 34px ${sans}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((info.username || '?').charAt(0).toUpperCase(), cx, cy + 2);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(246,241,232,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

      // 鸟标 + SoaringBird 一起居中
      const tFont = `600 34px ${serif}`;
      ctx.font = tFont;
      const tw = ctx.measureText('SoaringBird').width;
      const lg = 34, gap = 11, bx = W / 2 - (lg + gap + tw) / 2;
      if (brand) ctx.drawImage(brand, bx, 272, lg, lg);
      ctx.fillStyle = '#f8f3e9';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('SoaringBird', bx + lg + gap, 306);
      ctx.textAlign = 'center';

      say(`第 ${info.rank} 位 · 纪念徽章`, 336, `11.5px ${mono}`, 'rgba(242,236,225,0.55)');
      ctx.fillStyle = 'rgba(246,241,232,0.26)';
      ctx.fillRect(W / 2 - 32, 360, 64, 1);
      say(`发帖 ${info.posts} · 粉丝 ${info.followers}`, 406, `17px ${sans}`, 'rgba(243,238,229,0.82)');
      say(dates, 444, `11.5px ${mono}`, 'rgba(242,236,225,0.62)');
      corner('NO.' + String(info.rank).padStart(3, '0'), '2026');
      say('翱翔鸟 · 纪念', W - 46, `11.5px ${mono}`, 'rgba(242,236,225,0.5)');
    } else {
      // 未登录：鸟标 + 品牌 + 功能列表
      const bird = await _badgeLoadImg('logo-dark.png');
      const bw = 84;
      if (bird) ctx.drawImage(bird, W / 2 - bw / 2, 150, bw, bw);
      say('SoaringBird', 306, `600 40px ${serif}`, '#f8f3e9');
      say('纪念徽章', 336, `12px ${mono}`, 'rgba(242,236,225,0.55)');
      ctx.fillStyle = 'rgba(246,241,232,0.26)';
      ctx.fillRect(W / 2 - 32, 360, 64, 1);
      say(dates, 400, `12px ${mono}`, 'rgba(242,236,225,0.62)');
      corner('COMMEMORATIVE', '2026');
      say('Music · Forum · News · Chat', W - 46, `12px ${mono}`, 'rgba(242,236,225,0.55)');
    }

    cv.toBlob(blob => {
      if (!blob) { showToast('徽章生成失败'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SoaringBird-Badge.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast('纪念徽章已保存');
    }, 'image/png');
  } catch (e) {
    console.error(e);
    showToast('徽章生成失败');
  } finally {
    setTimeout(() => { _badgeBusy = false; }, 800);
  }
}

/* ===== 初始化 ===== */
async function init() {
  // 方格纸外观是全站外壳（6 个页面共用一个 index.html）
  document.body.classList.add('app-home');
  renderCategoryFilter();
  renderCategorySelect();
  // 优先加载帖子列表（含骨架屏），不被登录接口阻塞，避免页面空白
  renderPosts();
  try { await checkLogin(); } catch (e) {}
  if (state.currentUser) initChat();
  applyTheme();
  applyTranslations();
  renderGreeting();
  applyLiquidGlassSetting();
  applyPerfModeSetting();
  startGeekTyping();
  // Set initial lang menu active state
  document.querySelectorAll('.lang-seg-btn').forEach(i => i.classList.toggle('active', i.dataset.lang === currentLang));
  document.documentElement.lang = currentLang;
  loadAnnouncements();
  // 关站通知：每次打开都出现，不记录「已关闭」
  setTimeout(showCloseNotice, 260);
  const savedBg = localStorage.getItem('bird_bg');
  if (savedBg) {
    let bgLayer = document.getElementById('bgLayer');
    if (!bgLayer) {
      bgLayer = document.createElement('div');
      bgLayer.id = 'bgLayer';
      document.body.prepend(bgLayer);
    }
    bgLayer.style.backgroundImage = `url(${savedBg})`;
    detectBgBrightness(savedBg, applyBgBrightness);
  }
  // 处理表单登录成功后的参数
  const urlParams = new URLSearchParams(location.search);
  // 支持从新闻页面跳转到个人主页
  const profileId = urlParams.get('profile');
  if (profileId) {
    navigateTo('profile', profileId);
    window.history.replaceState({}, '', '/');
    return;
  }
  // 支持分享帖子直达（?post=xxx）
  const sharePostId = urlParams.get('post');
  if (sharePostId) {
    navigateTo('post', sharePostId);
    window.history.replaceState({}, '', '/');
    return;
  }
  // 从直播/新闻页九宫格菜单跳转：打开消息面板 / 个人主页 / 设置
  const openTarget = urlParams.get('open');
  if (openTarget) {
    window.history.replaceState({}, '', '/');
    if (openTarget === 'msg') {
      setTimeout(() => toggleMsgPanel(), 400);
    } else if (openTarget === 'me') {
      if (state.currentUser) navigateTo('profile');
      else showLoginModal();
    } else if (openTarget === 'settings') {
      navigateTo('settings');
    }
  }
  if (urlParams.get('login') === 'success') {
    showToast(t('login_success'), 'success');
    const bg = urlParams.get('bg');
    if (bg) {
      localStorage.setItem('bird_bg', bg);
      let bgLayer = document.getElementById('bgLayer');
      if (!bgLayer) {
        bgLayer = document.createElement('div');
        bgLayer.id = 'bgLayer';
        document.body.prepend(bgLayer);
      }
      bgLayer.style.backgroundImage = `url(${bg})`;
      detectBgBrightness(bg, applyBgBrightness);
    }
    // 清理 URL 参数
    window.history.replaceState({}, '', '/');
  }
  showSplash();
  // 首屏进入动画（参数直达页面时 navigateTo 已重放）
  if ((state.currentPage || 'home') === 'home') replayPageEnter(document.getElementById('homePage'));
  // 生日当天自动弹窗（在启动动画之后展示）
  setTimeout(maybeShowBirthdayPopup, 700);

  // 点击外部关闭 @提及下拉框
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mention-dropdown') && !e.target.closest('#replyTextarea')) {
      _mentionActive = false;
      const dd = document.getElementById('mentionDropdown');
      if (dd) dd.style.display = 'none';
    }
  });
}

async function checkLogin() {
  try {
    const data = await api('/api/me');
    state.currentUser = data.user;
    // 登录后从服务端恢复背景
    if (data.user && data.user.background) {
      localStorage.setItem('bird_bg', data.user.background);
      let bgLayer = document.getElementById('bgLayer');
      if (!bgLayer) {
        bgLayer = document.createElement('div');
        bgLayer.id = 'bgLayer';
        document.body.prepend(bgLayer);
      }
      bgLayer.style.backgroundImage = `url(${data.user.background})`;
    }
  } catch (e) {
    state.currentUser = null;
    // 被封禁：会话已被吊销，用错误体里的原因/时间在首页展示状态卡
    if (e && e.data && e.data.banned) {
      updateNavUI();
      renderAccountStatus({ banned: true, ban_reason: e.data.ban_reason, ban_until: e.data.ban_until, username: e.data.username });
      return;
    }
  }
  updateNavUI();
  renderAccountStatus(state.currentUser);
}

/* ===== 账号状态卡（禁言 / 封禁：原因 + 时间 + 申诉） ===== */
let _accountStatus = null;

function _fmtUntil(ts) {
  if (!ts || ts >= 9999999999) return '永久';
  const d = new Date(ts * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderAccountStatus(u) {
  const host = document.getElementById('accountStatusCard');
  if (!host) return;
  const nowSec = Date.now() / 1000;
  let mode = null, reason = '', until = 0, username = '';
  if (u && u.banned) {
    mode = 'ban'; reason = u.ban_reason || ''; until = u.ban_until || 0; username = u.username || '';
  } else if (u && u.muted_until && u.muted_until > nowSec) {
    mode = 'mute'; reason = u.mute_reason || ''; until = u.muted_until || 0; username = u.username || '';
  }
  _accountStatus = mode ? { mode, reason, until, username } : null;
  if (!mode) { host.style.display = 'none'; host.innerHTML = ''; return; }
  const isBan = mode === 'ban';
  const title = isBan ? '账号已被封禁' : '账号已被禁言';
  const icon = isBan
    ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/></svg>'
    : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><line x1="6" y1="10" x2="18" y2="10"/><line x1="6" y1="14" x2="18" y2="14"/></svg>';
  const reasonLine = `<div class="acct-status-reason"><span class="acct-status-k">原因</span>${esc(reason || '未填写')}</div>`;
  const meta = isBan
    ? (until && until < 9999999999 ? `${_fmtUntil(until)} 自动解封` : '永久封禁')
    : (until && until < 9999999999 ? `${_fmtUntil(until)} 自动解除` : '永久禁言');
  host.className = 'acct-status ' + (isBan ? 'is-ban' : 'is-mute');
  host.innerHTML = `<div class="acct-status-inner">
      <span class="acct-status-icon">${icon}</span>
      <div class="acct-status-body">
        <div class="acct-status-title">${title}</div>
        ${reasonLine}
        <div class="acct-status-meta">${meta}</div>
      </div>
      <button class="acct-status-act" onclick="openAppealModal()">申诉</button>
    </div>`;
  host.style.display = '';
}

/* ===== 申诉弹窗（禁言 / 封号通用） ===== */
function openAppealModal() {
  const s = _accountStatus;
  if (!s) return;
  const isBan = s.mode === 'ban';
  document.getElementById('appealTitle').textContent = isBan ? '账号解封申诉' : '解除禁言申诉';
  document.getElementById('appealDesc').textContent = isBan
    ? '提交后管理员会尽快复核你的账号。请确认为本人操作。'
    : '提交后管理员会尽快复核你的禁言。';
  const userRow = document.getElementById('appealUserRow');
  const passRow = document.getElementById('appealPassRow');
  if (isBan) {
    userRow.style.display = '';
    passRow.style.display = '';
    document.getElementById('appealUser').value = s.username || '';
    document.getElementById('appealPass').value = '';
  } else {
    userRow.style.display = 'none';
    passRow.style.display = 'none';
  }
  document.getElementById('appealText').value = '';
  document.getElementById('appealModal').classList.add('show');
}

function closeAppealModal() {
  document.getElementById('appealModal').classList.remove('show');
}

async function submitAppeal() {
  const s = _accountStatus;
  if (!s) return;
  const text = (document.getElementById('appealText').value || '').trim();
  if (text.length < 5) { showToast('请把情况说明白一点（至少 5 个字）', 'error'); return; }
  const body = { content: text };
  if (s.mode === 'ban') {
    const username = (document.getElementById('appealUser').value || '').trim();
    const password = document.getElementById('appealPass').value || '';
    if (!username || !password) { showToast('请填写账号和密码以验证身份', 'error'); return; }
    body.username = username;
    body.password = password;
  }
  const btn = document.getElementById('appealSubmit');
  if (btn) btn.disabled = true;
  try {
    await api('/api/appeal', { method: 'POST', body });
    closeAppealModal();
    showToast('申诉已提交，我们会尽快处理', 'success');
  } catch (e) {
    showToast((e && e.message) || '提交失败，请稍后重试', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ===== 导航 ===== */
/* 页面 → 侧栏高亮项 */
const RAIL_FOR_PAGE = { home: 'home', post: 'home', search: 'home', bookmarks: 'me', profile: 'me', settings: 'settings' };

/* 重放「整页模糊淡入」进入动画 */
function replayPageEnter(el) {
  if (!el) return;
  el.classList.remove('page-in');
  void el.offsetWidth; /* 强制回流以重放动画 */
  el.classList.add('page-in');
}

function navigateTo(page, data) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  closeDropdowns();
  state.currentPage = page;

  // 侧栏是全站外壳：高亮项跟随当前页面
  const railKey = RAIL_FOR_PAGE[page] || 'home';
  document.querySelectorAll('.sb-item[data-rail]').forEach(b => {
    b.classList.toggle('is-on', b.dataset.rail === railKey);
  });

  const el = document.getElementById(page + 'Page');
  if (el) { el.style.display = ''; replayPageEnter(el); }

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  switch (page) {
    case 'home': renderPosts(); break;
    case 'post': state.currentPostId = data; renderPostDetail(); break;
    case 'profile': state.currentProfileId = data; renderProfile(); break;
    case 'bookmarks': renderBookmarks(); break;
    case 'settings': loadSettings(); break;
    case 'search': renderSearch(); break;
  }

  window.scrollTo(0, 0);
}

/* ===== 九宫格菜单（版块 + 设置） ===== */
function toggleSectionMenu(e) {
  if (e) { e.stopPropagation(); }
  const menu = document.getElementById('sectionMenu');
  if (!menu) return;
  const willOpen = !menu.classList.contains('open');
  closeSectionMenu();
  if (willOpen) {
    menu.classList.add('open');
    setTimeout(() => document.addEventListener('click', closeSectionMenu), 0);
  }
}

function closeSectionMenu() {
  const menu = document.getElementById('sectionMenu');
  if (menu) menu.classList.remove('open');
  document.removeEventListener('click', closeSectionMenu);
}

function smNavigate(page) {
  closeSectionMenu();
  if (page === 'home') {
    navigateTo('home');
  } else if (page === 'live') {
    window.location.href = '/live';
  } else if (page === 'podcast') {
    window.location.href = '/podcast';
  } else if (page === 'news') {
    window.location.href = '/peacenews';
  } else if (page === 'ai') {
    window.location.href = '/ai';
  } else if (page === 'msg') {
    toggleMsgPanel();
  } else if (page === 'me') {
    if (state.currentUser) navigateTo('profile');
    else showLoginModal();
  } else if (page === 'settings') {
    navigateTo('settings');
  }
}

/* ===== 统一消息面板 ===== */
function toggleMsgPanel() {
  const panel = document.getElementById('chatPanel');
  const overlay = document.getElementById('chatOverlay');
  if (!panel) return;

  if (!_chatOpen) {
    panel.classList.add('open');
    overlay.classList.add('show');
    _chatOpen = true;
    // 如果当前在通知 tab，切换到聊天
    const msgBodyChat = document.getElementById('msgBodyChat');
    const msgBodyNotif = document.getElementById('msgBodyNotif');
    if (msgBodyNotif && msgBodyNotif.style.display !== 'none') {
      switchMsgTab('chat');
    }
    initChat();
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 300);
  } else {
    panel.classList.remove('open');
    panel.classList.remove('fullscreen');
    overlay.classList.remove('show');
    _chatOpen = false;
    _chatFullscreen = false;
  }
}

function switchMsgTab(tab) {
  document.querySelectorAll('.msg-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.msgtab === tab);
  });
  const chatBody = document.getElementById('msgBodyChat');
  const notifBody = document.getElementById('msgBodyNotif');
  if (tab === 'chat') {
    chatBody.style.display = '';
    notifBody.style.display = 'none';
    initChat();
  } else {
    chatBody.style.display = 'none';
    notifBody.style.display = '';
    renderNotifications();
  }
}

/* ===== 下载客户端弹窗 ===== */
function showDlModal() {
  document.getElementById('dlModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeDlModal() {
  const modal = document.getElementById('dlModal');
  modal.classList.add('closing');
  document.body.style.overflow = '';
  setTimeout(() => { modal.classList.remove('show', 'closing'); }, 150);
}

/* ===== 帖子渲染 ===== */
let _postsReqSeq = 0; // 帖子列表请求序号：丢弃过期响应，避免切换页面回来后列表被旧请求覆盖/清空
let _homePage = 1, _homeTotal = 0, _homeLoading = false, _homeParams = null; // 首页帖子分页
let _searchPage = 1, _searchTotal = 0, _searchLoading = false;             // 搜索帖子分页

/* 生成/复用一个固定在网格容器下方的「加载更多」/「已全部加载」块 */
function ensureHomeMore() {
  const container = document.getElementById('postList');
  if (!container || container.parentNode.querySelector('.load-more')) return;
  const div = document.createElement('div');
  div.className = 'load-more';
  div.innerHTML = '<button class="load-more-btn" onclick="loadMorePosts()">加载更多</button><span class="load-more-end" style="display:none">已全部加载</span>';
  container.parentNode.appendChild(div);
}
function setHomeMore(seen, total) {
  const container = document.getElementById('postList');
  if (!container) return;
  const wrap = container.parentNode.querySelector('.load-more');
  if (!wrap) return;
  const btn = wrap.querySelector('.load-more-btn');
  const end = wrap.querySelector('.load-more-end');
  if (total > 0 && seen < total) {
    wrap.style.display = 'flex';
    btn.style.display = 'inline-block';
    end.style.display = 'none';
    btn.disabled = false;
    btn.textContent = '加载更多';
  } else if (total > 0 && seen >= total) {
    wrap.style.display = 'flex';
    btn.style.display = 'none';
    end.style.display = 'inline';
  } else {
    wrap.style.display = 'none';
  }
}

/* 首页头部：按时段问候 + 品牌与日期副标题 */
function renderGreeting() {
  const el = document.getElementById('sbGreet');
  if (!el) return;
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : (h < 18 ? 'Good afternoon' : 'Good evening');
  el.textContent = state.currentUser ? part + ', ' + state.currentUser.username : part;
  const sub = document.getElementById('sbSub');
  if (sub) {
    const d = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    sub.textContent = '翱翔鸟 · ' + d;
  }
}

async function renderPosts() {
  const container = document.getElementById('postList');
  if (!container) return;
  const seq = ++_postsReqSeq;
  _homePage = 1; _homeTotal = 0; _homeLoading = false;
  // 显示骨架屏
  container.innerHTML = Array(6).fill('').map(() =>
    '<div class="sb-cell is-skel"><div class="sk sk-cat"></div><div class="sk sk-title"></div><div class="sk sk-title2"></div><div class="sb-cell-foot"><span class="sb-authline"><div class="sk sk-avatar"></div><div class="sk sk-author"></div></span></div></div>'
  ).join('');
  const homeMore = container.parentNode.querySelector('.load-more');
  if (homeMore) homeMore.style.display = 'none';

  try {
    const params = new URLSearchParams({ tab: state.feedTab });
    if (state.categoryFilter) params.set('category', state.categoryFilter);
    const data = await api('/api/posts?' + params.toString());
    if (seq !== _postsReqSeq) return; // 过期请求丢弃
    const posts = data.posts || [];
    _homeParams = params; _homeTotal = data.total || 0;

    if (posts.length === 0) {
      container.innerHTML = `<div class="empty-state"><h3>${t('no_posts')}</h3><p>${t('publish_first')}</p></div>`;
      const hm = container.parentNode.querySelector('.load-more');
      if (hm) hm.style.display = 'none';
      return;
    }
    container.innerHTML = posts.map((p, i) => renderHomeCell(p, i)).join('');
    // 交错动画延迟
    container.querySelectorAll('.sb-cell').forEach((card, i) => {
      card.style.animationDelay = (i * 0.04) + 's';
    });
    ensureHomeMore();
    setHomeMore(posts.length, _homeTotal);
  } catch (e) {
    if (seq !== _postsReqSeq) return; // 过期请求失败不影响新请求
    container.innerHTML = '<div class="empty-state"><p>' + t('load_failed') + '</p></div>';
  }
}

/* 首页「加载更多」：请求下一页并追加到现有网格 */
async function loadMorePosts() {
  if (_homeLoading) return;
  const container = document.getElementById('postList');
  if (!container || !_homeParams) return;
  _homeLoading = true;
  const wrap = container.parentNode.querySelector('.load-more');
  const btn = wrap && wrap.querySelector('.load-more-btn');
  if (btn) { btn.disabled = true; btn.textContent = '加载中…'; }
  _homePage++;
  const p = new URLSearchParams(_homeParams);
  p.set('page', String(_homePage));
  const seq = _postsReqSeq;
  try {
    const data = await api('/api/posts?' + p.toString());
    if (seq !== _postsReqSeq) return;
    const posts = data.posts || [];
    if (posts.length) {
      container.insertAdjacentHTML('beforeend', posts.map((post, i) => renderHomeCell(post, i)).join(''));
    }
    const seen = container.querySelectorAll('.sb-cell').length;
    ensureHomeMore();
    setHomeMore(seen, data.total || _homeTotal);
  } catch (e) {
    if (seq !== _postsReqSeq) return;
    // 失败时回退一页并恢复按钮
    _homePage--;
    const w2 = container.parentNode.querySelector('.load-more');
    const b2 = w2 && w2.querySelector('.load-more-btn');
    if (b2) { b2.disabled = false; b2.textContent = '加载更多'; }
  } finally {
    _homeLoading = false;
  }
}

function renderPostCard(post) {
  const catName = getCategoryName(post.category);
  const cat = CATEGORIES.find(c => c.id === post.category);
  const catColor = cat ? cat.color : '#8e8e93';
  const timeStr = timeAgo(post.created_at);
  const preview = (post.content || '').substring(0, 100);
  const tags = (post.tags || []).map(t => `<span class="post-card-tag">${esc(t)}</span>`).join('');
  const liked = post.liked;
  const bookmarked = post.bookmarked;
  const replyCount = post.reply_count || 0;

  return `<div class="post-card" onclick="navigateTo('post','${post.id}')">
    <div class="post-card-header">
      ${avatarHtml(post.author_avatar, post.author_name)}
      <div class="post-card-meta">
        <span class="post-card-author">${esc(post.author_name || '未知')}${verifiedBadge(post.author_verified)}${birthdayBadge(post.author_birthday)}</span>
        <span class="post-card-time">${timeStr}</span>
      </div>
      <span class="post-card-category" style="background:${catColor}15;color:${catColor}">${catName}</span>
    </div>
    <div class="post-card-title">${esc(post.title)}</div>
    <div class="post-card-preview">${esc(preview)}</div>
    ${tags ? `<div class="post-card-tags">${tags}</div>` : ''}
    <div class="post-card-footer">
      <button class="post-stat ${liked ? 'liked' : ''}" onclick="event.stopPropagation();toggleLike('${post.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        ${post.likes || 0}
      </button>
      <button class="post-stat" onclick="event.stopPropagation();navigateTo('post','${post.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${replyCount}
      </button>
      <button class="post-stat ${bookmarked ? 'bookmarked' : ''}" onclick="event.stopPropagation();toggleBookmark('${post.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
      <button class="post-stat post-report" title="举报" onclick="event.stopPropagation();openReportSheet('post','${post.id}','${escAttr(post.title)}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4c3-1 6.5-1 9 0v9c-2.5-1-6-1-9 0"/></svg>
      </button>
    </div>
  </div>`;
}

/* 首页方格单元格（仅 body.app-home 作用域内生效，其它页面仍用 renderPostCard） */
function renderHomeCell(post) {
  const catName = getCategoryName(post.category);
  const timeStr = timeAgo(post.created_at);
  const replyCount = post.reply_count || 0;

  return `<div class="sb-cell" onclick="navigateTo('post','${post.id}')">
    <div class="sb-cell-head">
      <span class="sb-cat">${esc(catName)}</span>
      <span class="sb-when">${timeStr}</span>
    </div>
    <h3 class="sb-title">${esc(post.title)}</h3>
    <div class="sb-cell-foot">
      <span class="sb-authline">
        ${avatarHtml(post.author_avatar, post.author_name, 'sb-avatar')}
        <span class="sb-author">${esc(post.author_name || '未知')}${verifiedBadge(post.author_verified)}${birthdayBadge(post.author_birthday)}</span>
      </span>
      <span class="sb-meta">${replyCount > 0 ? replyCount + ' 回复' : ''}</span>
    </div>
  </div>`;
}

/* ===== 半调世界地图 =====
   陆地掩码来自 Natural Earth 110m 陆地数据，光栅化为 180×72
   （裁掉南极、保留 84°N–60°S，保持 2.5:1），按 6bit/字符打包成 72 行。
   运行时：解包 → 双线性采样 → 点阵；海岸线叠加一层缓慢行波，
   点径随时间起伏，像潮汐一样呼吸。
   绘制按半径分桶、每桶一条 Path 批量填充，单帧仅十余次 fill。 */
const HT_W = 180;
const HT_H = 72;
const HT_ROWS = [
  'AAAAAAAAf4AP/AAAAAAAAAAAAAAAAA',
  'AAAAAAAX/z///+AAAAAAAABAAAAAAA',
  'AAAAAAYd8P///wAA+AAAAAA8AAAAAA',
  'AAAAAwAnw////4AAIAAAAAAGAAAAAA',
  'AAAAADivwAf//wAAAAADAAf/wAHYAA',
  'AAAADoi3sAP//gAAAAAMAD///sAAAA',
  'gBgACfwz/AD/+gAAAwAEHf8AABADf+',
  'AP4EAY2icP8AB///4A//EgAAAAAAAg',
  'HwAAAAAAeD4Af///gAFAAgAAAAAAAA',
  'zgAAAAAC4H8D/h//BhQAAAAAAAAAAA',
  'AP/////4A0B4AAAD5/////////////',
  'Af3////gHgA4AAAH5///////////Lw',
  'AHgH///gHkAAAAAH4/////////+CIA',
  'ABAB///4D+AAAAGCx/////////4A8A',
  'AIAAf///n/gAAAOCD/////////wA4A',
  'AAAAf///n/wAAAbP///////////AgA',
  'AAAAP/////wAAADf//////////9AAA',
  'AAAAF////0YAAAB///////////9AAA',
  'AAAAD////8EAAAB///////////5AAA',
  'AAAAD////2AAAAB/f5fP//////wAAA',
  'AAAAD////gAAAAfxnwPP//////jAAA',
  'AAAAD////AAAAAPCb3/n/////+CAAA',
  'AAAAD///8AAAAAfALf/n////+ECAAA',
  'AAAAB///8AAAAAGHQP/n/////mMAAA',
  'AAAAA///8AAAAAH+Ai///////E8AAA',
  'AAAAAf//wAAAAAP/AA///////BgAAA',
  'AAAAAP//gAAAAAf/73///////gAAAA',
  'AAAAAD/AQAAAAAf////f/////gAAAA',
  'AAAAAF+AQAAAAB///+/n/////AAAAA',
  'AAAAAC+AAAAAAB///+f0H////AAAAA',
  'AAAAAAeAwAAAAD////f/B///8gAAAA',
  'AAAAAAeGEAAAAH////v+B/z/AAAAAA',
  'AAAAAAPMAgAAAD////n+A/B+gAAAAA',
  'AAAAAAD8AAAAAD////n4AeB/AgAAAA',
  'AAAAAAAPAAAAAH////3gAcAfAgAAAA',
  'AAAAAAADAAAAAD////6AAcAfggAAAA',
  'AAAAAAABDwAAAD////8wAMATAIAAAA',
  'AAAAAAAAr/AAAB/////gAKASAAAAAA',
  'AAAAAAAAH/gAAA/////gACAAAIAAAA',
  'AAAAAAAAH/8AAAaH///AAAAsGAAAAA',
  'AAAAAAAAH/+AAAAB//+AAAAUOAAAAA',
  'AAAAAAAAP/+AAAAB//8AAAAYegAAAA',
  'AAAAAAAAP//gAAAD//4AAAAMeBgAAA',
  'AAAAAAAAP//8AAAB//wAAAAGdiuAAA',
  'AAAAAAAAf///AAAA//wAAAACAQHgAA',
  'AAAAAAAAP///gAAA//wAAAABwAHwgA',
  'AAAAAAAAH///AAAA//wAAAAACIDQIA',
  'AAAAAAAAH//+AAAAf/wAAAAAAAAAAA',
  'AAAAAAAAD//+AAAA//wgAAAAABxAAA',
  'AAAAAAAAD//+AAAA//wgAAAAAPxgBA',
  'AAAAAAAAA//8AAAA//jgAAAAAf5gAA',
  'AAAAAAAAAf/8AAAA//DgAAAAAf/gAA',
  'AAAAAAAAAf/8AAAAf/DAAAAAD//4CA',
  'AAAAAAAAAf/wAAAAf/DAAAAAH//4AA',
  'AAAAAAAAAf/AAAAAf+CAAAAAH//8AA',
  'AAAAAAAAAf/AAAAAP8AAAAAAH//+AA',
  'AAAAAAAAA/+AAAAAP8AAAAAAH//+AA',
  'AAAAAAAAA/+AAAAAH4AAAAAAD//+AA',
  'AAAAAAAAA/8AAAAAHwAAAAAADwf8AA',
  'AAAAAAAAA/gAAAAAAAAAAAAACAH4AI',
  'AAAAAAAAB/wAAAAAAAAAAAAAAAD4AE',
  'AAAAAAAAB+AAAAAAAAAAAAAAAAAAAG',
  'AAAAAAAAB6AAAAAAAAAAAAAAAAAwAM',
  'AAAAAAAAA8AAAAAAAAAAAAAAAAAQAY',
  'AAAAAAAAB4AAAAAAAAAAAAAAAAAAAw',
  'AAAAAAAAB4AAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAADwAAAAAAAAAACAAAAAAAAA',
  'AAAAAAAADgAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAABwAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAwAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
];

const HT_ALPHA = 0.2;
const HT_TAU = Math.PI * 2;
const _worldReduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const HT_LAND = (function () {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lut = new Int16Array(128);
  for (let i = 0; i < 64; i++) lut[A.charCodeAt(i)] = i;
  const g = new Uint8Array(HT_W * HT_H);
  for (let r = 0; r < HT_H; r++) {
    const row = HT_ROWS[r] || '';
    for (let c = 0; c < HT_W; c++) {
      const v = lut[row.charCodeAt((c / 6) | 0)] || 0;
      g[r * HT_W + c] = (v >> (5 - (c % 6))) & 1;
    }
  }
  return g;
})();

let _worldEl = null, _worldCtx = null, _worldDots = null;
let _worldW = 0, _worldH = 0, _worldDpr = 1, _worldInk = '0,0,0';
let _worldRaf = 0, _worldResizeTimer = 0, _worldLast = 0, _worldSig = '';
let _worldPending = false, _worldInView = true;
let _worldLensR = 90;
/* 鼠标悬停「透镜」：缓动跟随，靠近指针的点径被放大；k 为整体强度，进出平滑 */
const _worldPtr = { x: 0, y: 0, tx: 0, ty: 0, active: false, k: 0 };

function _worldCanvas() { if (!_worldEl) _worldEl = document.getElementById('worldHalftone'); return _worldEl; }
function _worldClamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

/* 归一化坐标 (u,v) → 陆地密度 0..1（双线性） */
function _worldLandAt(u, v) {
  const gx = u * HT_W - 0.5, gy = v * HT_H - 0.5;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = _worldClamp01(gx - x0), fy = _worldClamp01(gy - y0);
  const at = function (x, y) {
    if (x < 0 || y < 0 || x >= HT_W || y >= HT_H) return 0;
    return HT_LAND[y * HT_W + x];
  };
  const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
  const bot = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
  return top + (bot - top) * fy;
}

/* 按画布盒尺寸预生成点阵（尺寸 / 主题变化时才重做） */
function _worldBuild() {
  const cv = _worldCanvas();
  if (!cv) return false;
  const cw = cv.clientWidth, ch = cv.clientHeight;
  if (!cw || !ch) { _worldPending = true; return false; }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ink = (getComputedStyle(document.body).getPropertyValue('--sb-ink') || '0,0,0').trim() || '0,0,0';
  const sig = cw + 'x' + ch + '@' + dpr + ':' + ink;
  if (sig === _worldSig && _worldDots) return true;
  _worldSig = sig; _worldPending = false;
  _worldDpr = dpr; _worldW = cw; _worldH = ch; _worldInk = ink;

  cv.width = Math.round(cw * dpr);
  cv.height = Math.round(ch * dpr);
  _worldCtx = cv.getContext('2d');
  _worldCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let mw = cw * 0.98, mh = mw * HT_H / HT_W;
  const maxH = ch * 0.94;
  if (mh > maxH) { mh = maxH; mw = mh * HT_W / HT_H; }
  const gap = Math.max(3.2, mw / HT_W * 0.92);
  const maxR = gap * 0.36;
  _worldLensR = Math.max(64, mw * 0.26);
  const ox = (cw - mw) / 2, oy = (ch - mh) / 2;

  const cols = Math.round(mw / gap), rows = Math.round(mh / gap);
  const sx = ox + (mw - cols * gap) / 2, sy = oy + (mh - rows * gap) / 2;
  /* 上下边缘渐隐：避免极区岛屿在顶部聚成一条生硬的横线 */
  const EDGE = 0.1;
  const dots = [];
  for (let r = 0; r <= rows; r++) {
    const y = sy + r * gap;
    const v = (y - oy) / mh;
    let fade = 1;
    if (v < EDGE) fade = v / EDGE;
    else if (v > 1 - EDGE) fade = (1 - v) / EDGE;
    if (fade <= 0) continue;
    for (let k = 0; k <= cols; k++) {
      const x = sx + k * gap;
      const d = _worldLandAt((x - ox) / mw, v);
      if (d <= 0.08) continue;
      const r0 = maxR * Math.pow(d, 0.6) * fade;
      if (r0 < 0.3) continue;
      /* rp：每个点独立的相位，用于无方向性的轻微起伏 */
      dots.push({ x: x, y: y, r0: r0, rp: Math.random() * 6.2832 });
    }
  }
  _worldDots = dots;
  return true;
}

const HT_BUCKET = 0.2;

/* 绘制一帧：点径 = 基础 ×（全幅呼吸 × 每点轻微起伏 × 悬停透镜），
   按半径分桶批量填充；悬停用单档柔和放大，避免出现硬边圆环。 */
function _worldDraw(t) {
  if (!_worldCtx || !_worldDots) return;
  const ctx = _worldCtx;
  const tsec = t * 0.001;
  /* 全幅极缓的整体呼吸：幅度很小，只是一层气息 */
  const breathe = 1 + 0.03 * Math.sin(tsec * 0.35);
  /* 指针缓动跟随 */
  const p = _worldPtr;
  p.x += (p.tx - p.x) * 0.18;
  p.y += (p.ty - p.y) * 0.18;
  p.k += ((p.active ? 1 : 0) - p.k) * 0.12;
  const lensOn = p.k > 0.02;
  const LR = _worldLensR, LR2 = LR * LR;

  ctx.setTransform(_worldDpr, 0, 0, _worldDpr, 0, 0);
  ctx.clearRect(0, 0, _worldW, _worldH);

  const buckets = new Map();
  for (let i = 0; i < _worldDots.length; i++) {
    const d = _worldDots[i];
    /* 每点独立相位：整幅轻微起伏，避免出现方向性的两种颜色斜线 */
    const w = Math.sin(tsec * 0.55 + d.rp);
    let scale = breathe * (1 + 0.035 * w);
    if (lensOn) {
      const dx = d.x - p.x, dy = d.y - p.y;
      const dd = dx * dx + dy * dy;
      if (dd < LR2) {
        let k = 1 - Math.sqrt(dd) / LR;
        k = k * k * (3 - 2 * k) * p.k; /* smoothstep 柔化衰减，无硬边 */
        scale *= 1 + 0.6 * k; /* 克制的放大，点不会并连成块 */
      }
    }
    const rr = d.r0 * scale;
    if (rr < 0.34) continue;
    const rq = Math.round(rr / HT_BUCKET) * HT_BUCKET;
    let arr = buckets.get(rq);
    if (!arr) { arr = []; buckets.set(rq, arr); }
    arr.push(d);
  }
  _worldFill(ctx, buckets, HT_ALPHA);
}

function _worldFill(ctx, buckets, alpha) {
  ctx.fillStyle = 'rgba(' + _worldInk + ',' + alpha + ')';
  buckets.forEach(function (arr, r) {
    ctx.beginPath();
    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      ctx.moveTo(d.x + r, d.y);
      ctx.arc(d.x, d.y, r, 0, HT_TAU);
    }
    ctx.fill();
  });
}

function _worldTick(t) {
  _worldRaf = requestAnimationFrame(_worldTick);
  if (t - _worldLast < 32) return; /* ≈30fps */
  _worldLast = t;
  _worldDraw(t);
}
function _worldStart() {
  if (_worldReduce || _worldRaf) return;
  _worldLast = 0;
  _worldRaf = requestAnimationFrame(_worldTick);
}
function _worldStop() { if (_worldRaf) { cancelAnimationFrame(_worldRaf); _worldRaf = 0; } }

function _worldSync() {
  const on = _worldInView && document.visibilityState !== 'hidden';
  if (_worldReduce || !on || !_worldDots) _worldStop();
  else _worldStart();
}

/* 主题 / 尺寸变化 → 重建点阵；同步可见性 → 起停动画 */
function _worldRasterize() {
  if (_worldBuild()) _worldDraw(_worldReduce ? 0 : performance.now());
  _worldSync();
}

window.addEventListener('resize', function () {
  if (_worldResizeTimer) clearTimeout(_worldResizeTimer);
  _worldResizeTimer = setTimeout(_worldRasterize, 160);
});
document.addEventListener('visibilitychange', _worldSync);
(function () {
  function boot() {
    const cv = document.getElementById('worldHalftone');
    if (!cv) return;
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () { _worldRasterize(); }).observe(cv);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (es) {
        _worldInView = es[0].isIntersecting;
        _worldSync();
      }, { threshold: 0 }).observe(cv);
    }
    /* 悬停透镜：把指针位置换算到画布 CSS 坐标（与点阵同一坐标系） */
    cv.addEventListener('pointermove', function (e) {
      const r = cv.getBoundingClientRect();
      _worldPtr.tx = e.clientX - r.left;
      _worldPtr.ty = e.clientY - r.top;
      _worldPtr.active = true;
    });
    cv.addEventListener('pointerdown', function (e) {
      const r = cv.getBoundingClientRect();
      _worldPtr.tx = e.clientX - r.left;
      _worldPtr.ty = e.clientY - r.top;
      _worldPtr.active = true;
    });
    cv.addEventListener('pointerleave', function () { _worldPtr.active = false; });
    requestAnimationFrame(_worldRasterize);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();


/* ===== 帖子详情 ===== */
let _postDetailReqSeq = 0; // 帖子详情请求序号：丢弃过期响应，防止旧请求覆盖新帖子/清空内容
async function renderPostDetail() {
  const postId = state.currentPostId;
  if (!postId) return;
  const seq = ++_postDetailReqSeq;

  const detail = document.getElementById('postDetail');
  detail.innerHTML = '<div class="empty-state"><p>' + t('loading') + '</p></div>';

  try {
    const data = await api('/api/posts/' + postId);
    // 防止过期请求覆盖最新帖子（快速切换 / ai_reply 并发触发）
    if (state.currentPostId !== postId || seq !== _postDetailReqSeq) return;
    const post = data.post;
    const cat = CATEGORIES.find(c => c.id === post.category);
    const catName = cat ? cat.name : '';
    const catColor = cat ? cat.color : '#8e8e93';
    const isAuthor = state.currentUser && state.currentUser.id === post.author_id;

    const _pk = 'post:' + post.id;
    if (!_trMemory[_pk] || _trMemory[_pk].text !== post.content) {
      _trMemory[_pk] = { text: post.content, target: null, translated: null, showing: false };
    }

    detail.innerHTML = `
      <div class="detail-header">
        ${avatarHtml(post.author_avatar, post.author_name, 'avatar-md')}
        <div class="detail-meta">
          <span class="detail-author" onclick="navigateTo('profile','${post.author_id}')">${esc(post.author_name || t('unknown'))}${verifiedBadge(post.author_verified)}${birthdayBadge(post.author_birthday)}</span>
          <span class="detail-time">${timeAgo(post.created_at)} · <span style="color:${catColor}">${catName}</span></span>
        </div>
      </div>
      <h1 class="detail-title">${esc(post.title)}</h1>
      <div class="detail-tr-row"><button class="reply-action tr-btn" onclick="toggleTranslate('post','${post.id}',this,'postBody')">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h11M4 11h8M4 17h11"/><path d="M14 21l4-9 4 9M16 17h4"/></svg>
        ${t('translate')}</button></div>
      <div class="detail-body markdown-body" id="postBody">${formatContent(post.content)}</div>
      <div class="detail-actions">
        <button class="post-stat ${post.liked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          ${post.likes || 0}
        </button>
        <button class="post-stat ${post.bookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('${post.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${post.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ${t('bookmark')}
        </button>
        <button class="post-stat" onclick="openShareSheet('post','${post.id}','${escAttr(post.title)}')" title="${t('share')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          ${t('share')}
        </button>
        <button class="post-stat post-report" onclick="openReportSheet('post','${post.id}','${escAttr(post.title)}')" title="${t('report')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4c3-1 6.5-1 9 0v9c-2.5-1-6-1-9 0"/></svg>
          ${t('report')}
        </button>
        ${isAuthor ? `<button class="btn-delete" onclick="deletePost('${post.id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          ${t('delete')}
        </button>` : ''}
      </div>`;

    document.getElementById('replyCount').textContent = (post.replies || []).length;
    updateReplyAvatar();
    renderReplies(post.replies || []);
  } catch (e) {
    // 仅当仍停留在该帖子时才显示错误，避免旧请求失败覆盖新帖子
    if (state.currentPostId === postId && seq === _postDetailReqSeq) {
      detail.innerHTML = '<div class="empty-state"><p>' + t('load_failed') + '</p></div>';
    }
  }
}

function renderReplies(replies) {
  const list = document.getElementById('replyList');
  if (!replies || replies.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>${t('no_replies')}</p></div>`;
    return;
  }

  // Build nested structure
  const byParent = {};
  const roots = [];
  replies.forEach(r => {
    const pid = r.parent_id || '';
    if (!pid) {
      roots.push(r);
    } else {
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(r);
    }
  });

  function renderReply(r, depth) {
    const liked = r.liked;
    const indent = depth > 0 ? 'reply-nested' : '';
    const imageHtml = r.image ? `<div class="reply-image"><img src="${r.image}" onclick="window.open('${r.image}','_blank')" loading="lazy"></div>` : '';
    const children = (byParent[r.id] || []).map(c => renderReply(c, depth + 1)).join('');
    const isAI = r.author_id === 'ai_bot';
    const aiBadge = isAI ? '<span class="ai-badge">AI</span>' : '';
    const avatarMarkup = isAI
      ? '<div class="avatar ai-avatar">AI</div>'
      : avatarHtml(r.author_avatar, r.author_name);
    const canDelete = state.currentUser && r.author_id === state.currentUser.id;
    const deleteBtn = canDelete ? `<button class="reply-action reply-delete" onclick="deleteReply('${r.id}')" title="删除"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>` : '';
    const _rk = 'reply:' + r.id;
    if (!_trMemory[_rk] || _trMemory[_rk].text !== r.content) {
      _trMemory[_rk] = { text: r.content, target: null, translated: null, showing: false };
    }

    return `<div class="reply-card ${indent} ${isAI ? 'ai-reply' : ''}" data-id="${r.id}">
      ${avatarMarkup}
      <div class="reply-card-body">
        <div class="reply-card-header">
          <span class="reply-card-author ${isAI ? 'ai-author' : ''}" onclick="navigateTo('profile','${r.author_id}')">${esc(r.author_name || '未知')}${verifiedBadge(r.author_verified)}${birthdayBadge(r.author_birthday)}</span>
          ${aiBadge}
          <span class="reply-card-time">${timeAgo(r.created_at)}</span>
        </div>
        <div class="reply-card-content markdown-body" id="replyBody_${r.id}">${formatContent(r.content)}</div>
        ${imageHtml}
        <div class="reply-card-actions">
          <button class="reply-action" onclick="toggleReplyLike('${r.id}')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${r.likes || 0}
          </button>
          <button class="reply-action" onclick="startReplyTo('${r.id}','${esc(r.author_name || '未知')}')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            回复
          </button>
          <button class="reply-action tr-mini" onclick="toggleTranslate('reply','${r.id}',this,'replyBody_${r.id}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h11M4 11h8M4 17h11"/><path d="M14 21l4-9 4 9M16 17h4"/></svg>
            ${t('translate')}
          </button>
          ${deleteBtn}
        </div>
        ${children}
      </div>
    </div>`;
  }

  list.innerHTML = roots.map(r => renderReply(r, 0)).join('');
}

/* ===== 翻译帖子 / 评论 ===== */
const _trMemory = {}; // 'post:ID' | 'reply:ID' -> { text, originalHTML, target, translated, showing }
function _trTarget() {
  // 日语界面下把正文译为日语；界面为英文时译为简中；其余情况译为英文
  if (currentLang === 'ja') return 'ja';
  return currentLang === 'en' ? 'zh-CN' : 'en';
}

function _trHasAnyText(el) {
  // 是否有可翻译的实质内容：innerText 非空 或 存在 <img alt> / 图片不算，但列表/标题/表格里的文字算
  if (!el) return false;
  if ((el.innerText || '').trim()) return true;
  // 有内容的 HTML 片段（markdown 渲染过的）里可能只剩不可见标签，算空
  return false;
}

/* 翻译请求封装：区分“网络瞬断”与“业务错误”，网络错误由调用方决定重试 */
async function _trFetchTranslation(source, target) {
  try {
    const data = await api('/api/translate', { method: 'POST', body: { text: source, target } });
    return { ok: true, data };
  } catch (e) {
    const msg = (((e && e.message) || '').toString());
    const isNet = /Failed to fetch|fetch failed|network|TypeError|Connection|network error|ECONN/i.test(msg);
    return { ok: false, netErr: isNet, err: msg };
  }
}

async function toggleTranslate(kind, id, btn, bodySel) {
  // 请求前先做登录预检，避免 401 浪费一次请求
  if (!state.currentUser) {
    showToast(t('trLoginFirst'), '');
    if (typeof showLoginModal === 'function') showLoginModal();
    return;
  }
  const key = kind + ':' + id;
  const target = _trTarget();
  let rec = _trMemory[key];
  const body = bodySel ? document.getElementById(bodySel) : null;
  if (!body) return;
  if (!rec) {
    // 存两份：originalHTML（切回原文完整还原格式）+ text（给翻译 API 喂文本）
    rec = {
      originalHTML: body.innerHTML,
      text: (body.innerText || '').trim(),
      target: null, translated: null, showing: false,
    };
    _trMemory[key] = rec;
  } else if (!rec.originalHTML) {
    // 兼容：渲染时预置的种子条目只含 text，未带 originalHTML；
    // 这里从当前 DOM 补捕获一次，避免“切回原文”时 innerHTML=undefined 显示 "undefined"
    rec.originalHTML = body.innerHTML;
  }
  // 正文没有任何可翻译文本
  if (!rec.text) {
    showToast(t('trEmpty'), 'error');
    return;
  }
  // 需要译文且当前非译文状态时，拉取翻译（服务端缓存 + 配额）
  if (!rec.showing && (rec.translated === null || rec.target !== target)) {
    const source = rec.text;
    btn.disabled = true;
    btn.innerHTML = t('loading');
    let res = await _trFetchTranslation(source, target);
    // 网络瞬断（如服务重启空窗）：自动重试一次
    if (res && !res.ok && res.netErr) {
      await new Promise(r => setTimeout(r, 700));
      res = await _trFetchTranslation(source, target);
    }
    if (res && res.ok && res.data) {
      rec.target = target;
      rec.translated = res.data.translated || '';
      if (!rec.translated || res.data.ok === false) {
        const detail = (res.data && res.data.error) || 'fail';
        res = { ok: false, netErr: false, err: detail };
      } else {
        btn.disabled = false;
        res = null; // 成功：跳到下面的切换逻辑
      }
    }
    if (res) {
      // 失败：恢复按钮并给出对应提示
      btn.disabled = false;
      btn.innerHTML = t('translate');
      const msg = ((res && res.err) || '').toString();
      if (res && res.netErr) {
        showToast(t('trNetwork'), 'error');
      } else if (/未登录|登录|unauthor|login|401/i.test(msg)) {
        showToast(t('trLoginFirst'), '');
        if (typeof showLoginModal === 'function') showLoginModal();
      } else if (/额度|quota|429|用完/i.test(msg)) {
        showToast(t('trQuotaOut'), 'error');
      } else if (/缺少文本|empty|no text/i.test(msg)) {
        showToast(t('trEmpty'), 'error');
      } else {
        const suffix = msg && msg !== 'fail' ? `：${msg}` : '';
        showToast(t('transFail') + suffix, 'error');
      }
      return;
    }
  }
  // 切换 原文 / 译文：原文严格用 originalHTML 恢复 markdown 渲染格式
  if (rec.showing) {
    body.innerHTML = rec.originalHTML;
    btn.innerHTML = t('translate');
  } else {
    body.innerHTML = formatContent(rec.translated || rec.text);
    btn.innerHTML = t('showOriginal');
  }
  rec.showing = !rec.showing;
}

/* ===== 删除帖子 ===== */
async function deletePost(postId) {
  if (!confirm(t('delete') + '?')) return;
  try {
    await api('/api/posts/' + postId, { method: 'DELETE' });
    showToast(t('deleted'), 'success');
    navigateTo('home');
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 删除回复 ===== */
async function deleteReply(replyId) {
  if (!confirm('确定删除这条回复？')) return;
  try {
    await api('/api/replies/' + replyId, { method: 'DELETE' });
    showToast('已删除', 'success');
    renderPostDetail();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== @提及功能 ===== */
let _mentionActive = false;
let _mentionQuery = '';
let _mentionStart = 0;
let _mentionResults = [];

function handleMentionInput(e) {
  const ta = e.target;
  const val = ta.value;
  const pos = ta.selectionStart;
  // 查找光标前最近的 @
  const before = val.substring(0, pos);
  const atMatch = before.match(/@([^\s@]*)$/);
  const dropdown = document.getElementById('mentionDropdown');
  if (!atMatch) {
    _mentionActive = false;
    if (dropdown) dropdown.style.display = 'none';
    return;
  }
  _mentionActive = true;
  _mentionQuery = atMatch[1];
  _mentionStart = pos - atMatch[0].length;
  // AI 始终在列表首位
  const aiItem = { id: 'ai_bot', username: 'AI', isAI: true };
  if (!_mentionQuery || 'ai'.startsWith(_mentionQuery.toLowerCase())) {
    _mentionResults = [aiItem];
  } else {
    _mentionResults = [];
  }
  // 搜索用户
  if (_mentionQuery.length > 0) {
    api('/api/users/search?q=' + encodeURIComponent(_mentionQuery)).then(data => {
      if (!_mentionActive) return;
      _mentionResults = (data.users || []).map(u => ({ ...u, isAI: false }));
      if ('ai'.startsWith(_mentionQuery.toLowerCase())) {
        _mentionResults.unshift(aiItem);
      }
      renderMentionDropdown();
    }).catch(() => renderMentionDropdown());
  } else {
    _mentionResults = [aiItem];
  }
  renderMentionDropdown();
}

function renderMentionDropdown() {
  const dropdown = document.getElementById('mentionDropdown');
  if (!dropdown) return;
  if (!_mentionActive || _mentionResults.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  dropdown.innerHTML = _mentionResults.map((u, i) => {
    const icon = u.isAI
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M8 12h8M12 8v8" stroke-linecap="round"/></svg>'
      : `<div class="mention-avatar">${(u.username || '?').charAt(0).toUpperCase()}</div>`;
    return `<div class="mention-item ${u.isAI ? 'mention-ai' : ''}" onclick="insertMention(${i})">${icon}<span>${esc(u.username)}</span>${u.isAI ? '<span class="mention-tag">AI</span>' : ''}</div>`;
  }).join('');
  dropdown.style.display = 'block';
}

function insertMention(idx) {
  const u = _mentionResults[idx];
  if (!u) return;
  const ta = document.getElementById('replyTextarea');
  const val = ta.value;
  const insertText = '@' + u.username + ' ';
  ta.value = val.substring(0, _mentionStart) + insertText + val.substring(ta.selectionStart);
  _mentionActive = false;
  const dropdown = document.getElementById('mentionDropdown');
  if (dropdown) dropdown.style.display = 'none';
  ta.focus();
  const newPos = _mentionStart + insertText.length;
  ta.setSelectionRange(newPos, newPos);
}

/* ===== 点赞 ===== */
async function toggleLike(postId) {
  if (!state.currentUser) { showLoginModal(); return; }
  try {
    const data = await api('/api/posts/' + postId + '/like', { method: 'POST' });
    // 局部更新，不重新渲染整个列表
    updateLikeUI(postId, data.liked, data.likes);
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleReplyLike(replyId) {
  if (!state.currentUser) { showLoginModal(); return; }
  try {
    const data = await api('/api/replies/' + replyId + '/like', { method: 'POST' });
    // 局部更新回复点赞
    updateReplyLikeUI(replyId, data.liked, data.likes);
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 收藏 ===== */
async function toggleBookmark(postId) {
  if (!state.currentUser) { showLoginModal(); return; }
  try {
    const data = await api('/api/posts/' + postId + '/bookmark', { method: 'POST' });
    showToast(data.bookmarked ? t('bookmarked') : t('unbookmarked'));
    // 局部更新收藏状态
    updateBookmarkUI(postId, data.bookmarked);
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 局部 UI 更新 ===== */
function updateLikeUI(postId, liked, likes) {
  // 首页帖子卡片
  document.querySelectorAll('.post-card').forEach(card => {
    if (card.getAttribute('onclick')?.includes(postId)) {
      const btn = card.querySelector('.post-stat');
      if (btn) {
        btn.classList.toggle('liked', liked);
        btn.querySelector('svg')?.setAttribute('fill', liked ? 'currentColor' : 'none');
        // 更新数字
        const textNode = btn.childNodes[btn.childNodes.length - 1];
        if (textNode) textNode.textContent = ' ' + (likes || 0);
        // 触发心跳动画
        if (liked) {
          const svg = btn.querySelector('svg');
          if (svg) { svg.style.animation = 'none'; svg.offsetHeight; svg.style.animation = 'heartPop .35s var(--spring)'; }
        }
      }
    }
  });
  // 详情页
  const detailActions = document.querySelector('.detail-actions');
  if (detailActions) {
    const btn = detailActions.querySelector('.post-stat');
    if (btn) {
      btn.classList.toggle('liked', liked);
      btn.querySelector('svg')?.setAttribute('fill', liked ? 'currentColor' : 'none');
      const textNode = btn.childNodes[btn.childNodes.length - 1];
      if (textNode) textNode.textContent = ' ' + (likes || 0);
      if (liked) {
        const svg = btn.querySelector('svg');
        if (svg) { svg.style.animation = 'none'; svg.offsetHeight; svg.style.animation = 'heartPop .35s var(--spring)'; }
      }
    }
  }
}

function updateReplyLikeUI(replyId, liked, likes) {
  document.querySelectorAll('.reply-card').forEach(card => {
    const btn = card.querySelector('.reply-action');
    if (btn) {
      btn.classList.toggle('liked', liked);
      btn.querySelector('svg')?.setAttribute('fill', liked ? 'currentColor' : 'none');
      const textNode = btn.childNodes[btn.childNodes.length - 1];
      if (textNode) textNode.textContent = ' ' + (likes || 0);
      if (liked) {
        const svg = btn.querySelector('svg');
        if (svg) { svg.style.animation = 'none'; svg.offsetHeight; svg.style.animation = 'heartPop .35s var(--spring)'; }
      }
    }
  });
}

function updateBookmarkUI(postId, bookmarked) {
  document.querySelectorAll('.post-card').forEach(card => {
    if (card.getAttribute('onclick')?.includes(postId)) {
      const btns = card.querySelectorAll('.post-stat');
      btns.forEach(btn => {
        if (btn.querySelector('svg path[d*="19 21"]')) {
          btn.classList.toggle('bookmarked', bookmarked);
          btn.querySelector('svg')?.setAttribute('fill', bookmarked ? 'currentColor' : 'none');
        }
      });
    }
  });
  // 详情页
  const detailActions = document.querySelector('.detail-actions');
  if (detailActions) {
    const btns = detailActions.querySelectorAll('.post-stat');
    btns.forEach(btn => {
      if (btn.querySelector('svg path[d*="19 21"]')) {
        btn.classList.toggle('bookmarked', bookmarked);
        btn.querySelector('svg')?.setAttribute('fill', bookmarked ? 'currentColor' : 'none');
      }
    });
  }
}

/* ===== 回复 ===== */
let replyParentId = '';
let replyImageUrl = '';

function startReplyTo(replyId, authorName) {
  if (!state.currentUser) { showLoginModal(); return; }
  replyParentId = replyId;
  const textarea = document.getElementById('replyTextarea');
  textarea.placeholder = `回复 ${authorName}...`;
  textarea.focus();
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const cancelBtn = document.getElementById('cancelReplyToBtn');
  if (cancelBtn) cancelBtn.style.display = '';
}

function cancelReplyTo() {
  replyParentId = '';
  const textarea = document.getElementById('replyTextarea');
  textarea.placeholder = t('reply_placeholder') || '写下你的回复...';
  const cancelBtn = document.getElementById('cancelReplyToBtn');
  if (cancelBtn) cancelBtn.style.display = 'none';
}

async function uploadReplyImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 7 * 1024 * 1024) { showToast('图片不能超过7MB', 'error'); return; }
  const formData = new FormData();
  formData.append('file', file);
  try {
    const data = await api('/api/upload/reply-image', { method: 'POST', body: formData, raw: true });
    replyImageUrl = data.url;
    const preview = document.getElementById('replyImagePreview');
    if (preview) {
      preview.innerHTML = `<img src="/${data.url}"><button class="reply-img-remove" onclick="removeReplyImage()">×</button>`;
      preview.style.display = '';
    }
  } catch (e) { showToast(e.message, 'error'); }
}

function removeReplyImage() {
  replyImageUrl = '';
  const preview = document.getElementById('replyImagePreview');
  if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
  const input = document.getElementById('replyImageInput');
  if (input) input.value = '';
}

async function submitReply() {
  if (!state.currentUser) { showLoginModal(); return; }
  const textarea = document.getElementById('replyTextarea');
  const content = textarea.value.trim();
  if (!content && !replyImageUrl) { showToast(t('reply_empty'), 'error'); return; }

  const mentionsAI = /@(?:AI|ai|Ai|aI|AI助手|ai助手|AI\s*Bird|ai\s*bird)/.test(content);

  try {
    await api('/api/posts/' + state.currentPostId + '/replies', {
      method: 'POST',
      body: { content, parent_id: replyParentId, image: replyImageUrl }
    });
    textarea.value = '';
    replyParentId = '';
    textarea.placeholder = t('reply_placeholder') || '写下你的回复...';
    removeReplyImage();
    renderPostDetail();
    showToast(t('reply_success'), 'success');

    // 如果 @AI，显示思考中提示
    if (mentionsAI) {
      showToast('AI 正在思考...', 'info');
    }
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 发帖 ===== */
function showNewPostModal() {
  if (!state.currentUser) { showLoginModal(); return; }
  const modal = document.getElementById('newPostModal');
  modal.classList.add('show');
  // 移动端防止背景滚动
  document.body.style.overflow = 'hidden';
  if (window.reapplyLiquidGlass) setTimeout(window.reapplyLiquidGlass, 50);
  bindPostComposer();
  restorePostDraft();
  setPostMode('write', false);
  updatePostComposer();
  // 延迟聚焦标题，避免键盘弹起时布局错乱
  setTimeout(() => {
    const titleInput = document.getElementById('postTitle');
    if (titleInput && window.innerWidth > 768) titleInput.focus();
  }, 300);
}

function closeNewPostModal() {
  const modal = document.getElementById('newPostModal');
  modal.classList.add('closing');
  document.body.style.overflow = '';
  setTimeout(() => { modal.classList.remove('show', 'closing'); }, 150);
}

// 发帖编辑器：全屏 / 窗口切换
const _expandSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
const _collapseSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
function togglePostFullscreen() {
  const modal = document.getElementById('postModal');
  if (!modal) return;
  const on = modal.classList.toggle('fullscreen');
  const btn = document.getElementById('postExpandBtn');
  if (btn) btn.innerHTML = on ? _collapseSvg : _expandSvg;
  // 进入全屏后直接聚焦正文，便于长文输入
  document.getElementById('postContent').focus();
}

let _submittingPost = false;
async function submitNewPost() {
  if (_submittingPost) return;
  const title = document.getElementById('postTitle').value.trim();
  const category = document.getElementById('postCategory').value;
  const tagsStr = document.getElementById('postTags').value.trim();
  const content = document.getElementById('postContent').value.trim();

  if (!title) { showToast(t('title_empty'), 'error'); return; }
  if (!content) { showToast(t('content_empty'), 'error'); return; }

  const tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
  const btn = document.getElementById('submitPostBtn');
  _submittingPost = true;
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await api('/api/posts', {
      method: 'POST',
      body: { title, category, content, tags }
    });
    clearPostDraftStorage();
    closeNewPostModal();
    document.getElementById('postTitle').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postContent').value = '';
    const _pv = document.getElementById('postPreview'); if (_pv) _pv.hidden = true;
    setPostMode('write', false);
    updatePostComposer();
    showToast(t('post_success'), 'success');
    navigateTo('home');
  } catch (e) { showToast(e.message, 'error'); }
  finally {
    _submittingPost = false;
    if (btn) { btn.disabled = false; btn.textContent = t('publish'); }
  }
}

/* ===== 发帖编辑器：Markdown 预览 · 字数 · 表情 · 草稿 ===== */
const POST_DRAFT_KEY = 'sb_post_draft_v1';
const POST_EMOJIS = ['😀','😄','😁','😊','🙂','😉','😍','🥰','😎','🤔','😅','😴','😭','😤','🥺','😳','🤯','😱','🤗','🙃','😌','🤩','👍','👎','👏','🙏','💪','🤝','✌️','👌','🔥','✨','⭐','💡','🚀','🎉','🎯','📌','📎','✅','❌','⚡','❤️','🧡','💙','💜','🖤','☕','🌱','🌊','🍃','🎵','📷','💬'];

let _postComposerBound = false;
let _draftTimer = null;

function sbEscape(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function sbInlineMd(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
function sbMarkdown(src) {
  const lines = sbEscape(src).split(/\r?\n/);
  let html = '', inUl = false, inOl = false, inQuote = false, inCode = false;
  const closeLists = () => { if (inUl) { html += '</ul>'; inUl = false; } if (inOl) { html += '</ol>'; inOl = false; } };
  const closeQuote = () => { if (inQuote) { html += '</blockquote>'; inQuote = false; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      closeLists(); closeQuote();
      if (!inCode) { html += '<pre><code>'; inCode = true; } else { html += '</code></pre>'; inCode = false; }
      continue;
    }
    if (inCode) { html += line + '\n'; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { closeLists(); closeQuote(); const lv = h[1].length; html += '<h' + lv + '>' + sbInlineMd(h[2]) + '</h' + lv + '>'; continue; }
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) { closeLists(); closeQuote(); html += '<hr>'; continue; }
    if (/^\s*(?:>|&gt;)\s?/.test(line)) { closeLists(); if (!inQuote) { html += '<blockquote>'; inQuote = true; } html += '<p>' + sbInlineMd(line.replace(/^\s*(?:>|&gt;)\s?/, '')) + '</p>'; continue; }
    closeQuote();
    if (/^\s*[-*+]\s+/.test(line)) { if (inOl) { html += '</ol>'; inOl = false; } if (!inUl) { html += '<ul>'; inUl = true; } html += '<li>' + sbInlineMd(line.replace(/^\s*[-*+]\s+/, '')) + '</li>'; continue; }
    if (/^\s*\d+\.\s+/.test(line)) { if (inUl) { html += '</ul>'; inUl = false; } if (!inOl) { html += '<ol>'; inOl = true; } html += '<li>' + sbInlineMd(line.replace(/^\s*\d+\.\s+/, '')) + '</li>'; continue; }
    closeLists();
    if (line.trim() === '') continue;
    html += '<p>' + sbInlineMd(line) + '</p>';
  }
  closeLists(); closeQuote();
  if (inCode) html += '</code></pre>';
  return html;
}

function buildPostEmojiPop() {
  const pop = document.getElementById('postEmojiPop');
  if (!pop || pop.dataset.built) return;
  pop.innerHTML = POST_EMOJIS.map(e => '<button type="button">' + e + '</button>').join('');
  pop.dataset.built = '1';
}
function insertAtCursorPost(text) {
  const el = document.getElementById('postContent');
  if (!el) return;
  const s = el.selectionStart == null ? el.value.length : el.selectionStart;
  const e = el.selectionEnd == null ? el.value.length : el.selectionEnd;
  el.value = el.value.slice(0, s) + text + el.value.slice(e);
  el.selectionStart = el.selectionEnd = s + text.length;
  el.focus();
  updatePostComposer();
}
function setPostMode(mode, focus) {
  const ta = document.getElementById('postContent');
  const pv = document.getElementById('postPreview');
  document.querySelectorAll('#postModes .pm-mode').forEach(function (b) {
    b.classList.toggle('is-on', b.dataset.mode === mode);
  });
  if (mode === 'preview') {
    if (ta) ta.hidden = true;
    if (pv) { pv.hidden = false; pv.innerHTML = sbMarkdown(ta ? ta.value : ''); }
  } else {
    if (pv) pv.hidden = true;
    if (ta) { ta.hidden = false; if (focus !== false) ta.focus(); }
  }
}
function updatePostComposer() {
  const ta = document.getElementById('postContent');
  const cnt = document.getElementById('postCount');
  if (!ta || !cnt) return;
  const v = ta.value;
  const chars = v.replace(/\s+/g, '').length;
  const lines = v.length ? v.split(/\r?\n/).length : 0;
  cnt.textContent = chars + ' 字 · ' + lines + ' 行';
  const pv = document.getElementById('postPreview');
  if (pv && !pv.hidden) pv.innerHTML = sbMarkdown(v);
  schedulePostDraftSave();
}
function readPostDraft() {
  try { return JSON.parse(localStorage.getItem(POST_DRAFT_KEY) || 'null'); } catch (e) { return null; }
}
function writePostDraft() {
  const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const d = { title: get('postTitle'), category: get('postCategory'), tags: get('postTags'), content: get('postContent'), ts: Date.now() };
  try {
    if (!d.title && !d.tags && !d.content) localStorage.removeItem(POST_DRAFT_KEY);
    else localStorage.setItem(POST_DRAFT_KEY, JSON.stringify(d));
  } catch (e) {}
}
function schedulePostDraftSave() {
  clearTimeout(_draftTimer);
  _draftTimer = setTimeout(writePostDraft, 600);
}
function clearPostDraftStorage() {
  try { localStorage.removeItem(POST_DRAFT_KEY); } catch (e) {}
  const bar = document.getElementById('postDraftBar');
  if (bar) bar.hidden = true;
}
function restorePostDraft() {
  const d = readPostDraft();
  const bar = document.getElementById('postDraftBar');
  if (!d || (!d.title && !d.tags && !d.content)) { if (bar) bar.hidden = true; return; }
  const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
  set('postTitle', d.title); set('postTags', d.tags); set('postContent', d.content);
  const cat = document.getElementById('postCategory');
  if (cat && d.category) cat.value = d.category;
  if (bar) bar.hidden = false;
}
function discardPostDraft() {
  ['postTitle', 'postTags', 'postContent'].forEach(function (id) {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  setPostMode('write', false);
  clearPostDraftStorage();
  updatePostComposer();
  showToast('已丢弃草稿', 'success');
}
function bindPostComposer() {
  if (_postComposerBound) return;
  _postComposerBound = true;
  ['postContent', 'postTitle', 'postTags'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.oninput = updatePostComposer;
  });
  const cat = document.getElementById('postCategory');
  if (cat) cat.onchange = updatePostComposer;

  const modes = document.getElementById('postModes');
  if (modes) modes.onclick = function (ev) {
    const b = ev.target.closest('.pm-mode');
    if (b) setPostMode(b.dataset.mode);
  };

  buildPostEmojiPop();
  const pop = document.getElementById('postEmojiPop');
  const ebtn = document.getElementById('postEmojiBtn');
  if (ebtn && pop) {
    ebtn.onclick = function (ev) {
      ev.stopPropagation();
      const willOpen = pop.hidden;
      pop.hidden = !willOpen;
      ebtn.classList.toggle('is-on', willOpen);
    };
    pop.onclick = function (ev) {
      const b = ev.target.closest('button');
      if (b) insertAtCursorPost(b.textContent);
    };
    document.addEventListener('click', function (ev) {
      if (pop.hidden) return;
      if (ev.target.closest('#postEmojiPop') || ev.target.closest('#postEmojiBtn')) return;
      pop.hidden = true; ebtn.classList.remove('is-on');
    });
  }

  const discard = document.getElementById('postDraftDiscard');
  if (discard) discard.onclick = discardPostDraft;
}

/* ===== 搜索 ===== */
function handleSearch(query) {
  state.searchQuery = query.trim();
  if (state.searchQuery) {
    document.getElementById('searchTitle').textContent = t('search_label') + state.searchQuery;
    navigateTo('search');
  }
}

async function renderSearch() {
  const container = document.getElementById('searchResults');
  container.innerHTML = '<div class="empty-state"><p>' + t('loading') + '</p></div>';

  try {
    // 并行搜索帖子和用户
    const postParams = new URLSearchParams({ tab: 'latest', search: state.searchQuery });
    const [postData, userData] = await Promise.all([
      api('/api/posts?' + postParams.toString()),
      api('/api/search/users?q=' + encodeURIComponent(state.searchQuery))
    ]);

    const posts = postData.posts || [];
    const users = userData.users || [];
    _searchPage = 1; _searchTotal = postData.total || 0;

    if (posts.length === 0 && users.length === 0) {
      container.innerHTML = `<div class="empty-state"><h3>${t('no_search_results')}</h3><p>${t('try_other')}</p></div>`;
      return;
    }

    let html = '';
    // 用户区块
    if (users.length > 0) {
      html += '<div class="search-section"><h3 class="search-section-title">用户</h3><div class="user-search-list">';
      html += users.map(u => {
        const avatar = u.avatar
          ? `<img src="${u.avatar}" class="user-search-avatar">`
          : `<div class="user-search-avatar user-search-avatar-fallback">${(u.username || '?').charAt(0).toUpperCase()}</div>`;
        const verified = u.verified ? verifiedBadge(u.verified) : '';
        const verifiedText = u.verified && u.verified_text ? `<span class="user-search-verified-text">${esc(u.verified_text)}</span>` : '';
        const bio = u.bio ? `<div class="user-search-bio">${esc(u.bio)}</div>` : '';
        return `<div class="user-search-card" onclick="navigateTo('profile','${u.id}')">
          ${avatar}
          <div class="user-search-info">
            <div class="user-search-name">${esc(u.username)}${verified}${verifiedText}</div>
            ${bio}
            <div class="user-search-meta">${u.post_count} 篇帖子</div>
          </div>
        </div>`;
      }).join('');
      html += '</div></div>';
    }
    // 帖子区块
    if (posts.length > 0) {
      html += '<div class="search-section"><h3 class="search-section-title">帖子</h3><div class="post-grid" id="searchPostGrid">';
      html += posts.map(p => renderPostCard(p)).join('');
      html += '</div>';
      if (_searchTotal > posts.length) {
        html += '<div class="load-more"><button class="load-more-btn" onclick="loadMoreSearchPosts()">加载更多</button></div>';
      }
      html += '</div>';
    }
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<div class="empty-state"><p>' + t('load_failed') + '</p></div>';
  }
}

/* 搜索帖子「加载更多」：请求下一页帖子并追加 */
async function loadMoreSearchPosts() {
  if (_searchLoading) return;
  const grid = document.getElementById('searchPostGrid');
  if (!grid) return;
  _searchLoading = true;
  const btn = grid.parentNode.querySelector('.load-more-btn');
  if (btn) { btn.disabled = true; btn.textContent = '加载中…'; }
  _searchPage++;
  const p = new URLSearchParams({ tab: 'latest', search: state.searchQuery, page: String(_searchPage) });
  try {
    const data = await api('/api/posts?' + p.toString());
    const posts = data.posts || [];
    if (posts.length) {
      grid.insertAdjacentHTML('beforeend', posts.map(p2 => renderPostCard(p2)).join(''));
    }
    updateSearchMore(grid, data.total || _searchTotal);
  } catch (e) {
    _searchPage--;
  } finally {
    _searchLoading = false;
  }
}
function updateSearchMore(grid, total) {
  const section = grid.parentNode;
  let lm = section.querySelector('.load-more');
  const seen = grid.querySelectorAll('.post-card').length;
  if (total > seen) {
    if (!lm) {
      lm = document.createElement('div');
      lm.className = 'load-more';
      lm.innerHTML = '<button class="load-more-btn" onclick="loadMoreSearchPosts()">加载更多</button>';
      section.appendChild(lm);
    } else {
      lm.innerHTML = '<button class="load-more-btn" onclick="loadMoreSearchPosts()">加载更多</button>';
    }
  } else if (lm) {
    lm.innerHTML = '<span class="load-more-end">已全部加载</span>';
  }
}

/* ===== 筛选 ===== */
function toggleFilterMenu() {
  const menu = document.getElementById('filterMenu');
  const btn = document.getElementById('hamburgerBtn');
  if (!menu || !btn) return;
  menu.classList.toggle('show');
  btn.classList.toggle('active');
}

function switchFeedTab(tab) {
  state.feedTab = tab;
  document.querySelectorAll('.seg-item').forEach(i => {
    i.classList.toggle('active', i.dataset.filter === tab);
  });
  renderPosts();
}

function filterByCategory(catId) {
  state.categoryFilter = state.categoryFilter === catId ? null : catId;
  document.querySelectorAll('.filter-cat-item').forEach(i => {
    i.classList.toggle('active', i.dataset.cat === state.categoryFilter);
  });
  renderPosts();
}

function renderCategoryFilter() {
  const list = document.getElementById('categoryFilterList');
  if (!list) return;
  list.innerHTML = CATEGORIES.map(c =>
    `<button class="filter-cat-item" data-cat="${c.id}" onclick="filterByCategory('${c.id}')">
      <span class="filter-dot" style="background:${c.color}"></span>${getCategoryName(c.id)}
    </button>`
  ).join('');
}

function renderCategorySelect() {
  const sel = document.getElementById('postCategory');
  if (!sel) return;
  sel.innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${getCategoryName(c.id)}</option>`).join('');
}

/* ===== 用户系统 ===== */
function showLoginModal() {
  document.getElementById('loginModal').classList.add('show');
  if (window.reapplyLiquidGlass) setTimeout(window.reapplyLiquidGlass, 50);
  detectHuanshuangClient();
  detectHsOAuth();
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.classList.add('closing');
  setTimeout(() => { modal.classList.remove('show', 'closing'); }, 150);
}

async function handleLogout() {
  try {
    await api('/api/logout', { method: 'POST' });
  } catch {}
  state.currentUser = null;
  disconnectChat();
  updateNavUI();
  closeDropdowns();
  navigateTo('home');
  showToast(t('logged_out'));
}

// ===== 注销账号 =====
function openDeleteAccountModal() {
  const ov = document.getElementById('deleteAccountModal');
  const err = document.getElementById('delAccError');
  const pw = document.getElementById('delAccPassword');
  if (err) err.style.display = 'none';
  if (pw) pw.value = '';
  if (ov) ov.classList.add('show');
  if (pw) setTimeout(() => pw.focus(), 60);
}
function closeDeleteAccountModal() {
  const ov = document.getElementById('deleteAccountModal');
  if (ov) ov.classList.remove('show');
}
async function confirmDeleteAccount() {
  const pw = document.getElementById('delAccPassword');
  const err = document.getElementById('delAccError');
  const btn = document.getElementById('delAccConfirmBtn');
  const password = (pw && pw.value) || '';
  if (err) err.style.display = 'none';
  if (!password) {
    if (err) { err.textContent = t('delAccNeedPassword'); err.style.display = ''; }
    if (pw) pw.focus();
    return;
  }
  if (btn) btn.disabled = true;
  if (btn) btn.innerHTML = t('loading');
  try {
    await api('/api/account', { method: 'DELETE', body: { password } });
    state.currentUser = null;
    try { disconnectChat(); } catch {}
    updateNavUI();
    closeDropdowns();
    closeDeleteAccountModal();
    navigateTo('home');
    showToast(t('delAccDone'));
  } catch (e) {
    if (btn) { btn.disabled = false; btn.innerHTML = t('confirmDeleteBtn'); }
    const msg = ((e && e.message) || '注销失败，请稍后再试').toString();
    if (err) { err.textContent = msg; err.style.display = ''; }
  }
}

function updateNavUI() {
  const loginBtn = document.getElementById('navLoginBtn');
  const avatarBtn = document.getElementById('navAvatarBtn');
  const avatar = document.getElementById('navAvatar');

  // 首页侧栏账户区（顶栏在首页已隐藏，需独立同步）
  const sbUser = document.getElementById('sbUser');
  const sbLogin = document.getElementById('sbLogin');
  const sbAvatar = document.getElementById('sbAvatar');
  const sbName = document.getElementById('sbName');
  if (sbLogin) sbLogin.style.display = state.currentUser ? 'none' : '';
  if (sbUser) sbUser.style.display = state.currentUser ? '' : 'none';
  if (state.currentUser) {
    if (sbName) sbName.textContent = state.currentUser.username;
    if (sbAvatar) {
      if (state.currentUser.avatar) {
        sbAvatar.style.backgroundImage = `url(${state.currentUser.avatar})`;
        sbAvatar.textContent = '';
      } else {
        sbAvatar.style.backgroundImage = '';
        sbAvatar.textContent = state.currentUser.username.charAt(0).toUpperCase();
      }
    }
  }

  renderGreeting();

  if (!loginBtn || !avatarBtn || !avatar) return;

  if (state.currentUser) {
    loginBtn.style.display = 'none';
    avatarBtn.style.display = '';
    if (state.currentUser.avatar) {
      avatar.style.backgroundImage = `url(${state.currentUser.avatar})`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    } else {
      avatar.style.backgroundImage = '';
      avatar.style.backgroundSize = '';
      avatar.style.backgroundPosition = '';
      avatar.textContent = state.currentUser.username.charAt(0).toUpperCase();
    }

    const ddAvatar = document.getElementById('dropdownAvatar');
    const ddName = document.getElementById('dropdownName');
    const ddEmail = document.getElementById('dropdownEmail');
    if (ddAvatar) {
      if (state.currentUser.avatar) {
        ddAvatar.style.backgroundImage = `url(${state.currentUser.avatar})`;
        ddAvatar.style.backgroundSize = 'cover';
        ddAvatar.style.backgroundPosition = 'center';
        ddAvatar.textContent = '';
      } else {
        ddAvatar.style.backgroundImage = '';
        ddAvatar.style.backgroundSize = '';
        ddAvatar.style.backgroundPosition = '';
        ddAvatar.textContent = state.currentUser.username.charAt(0).toUpperCase();
      }
    }
    if (ddName) ddName.textContent = state.currentUser.username;
    if (ddEmail) ddEmail.textContent = state.currentUser.email || '';
  } else {
    loginBtn.style.display = '';
    avatarBtn.style.display = 'none';
  }

  updateReplyAvatar();
  updateNotifBadge();

  // 通知轮询
  if (state.currentUser && !window._notifPollTimer) {
    const notifMs = _perfMode ? 60000 : 30000;
    window._notifPollTimer = setInterval(updateNotifBadge, notifMs);
  } else if (!state.currentUser && window._notifPollTimer) {
    clearInterval(window._notifPollTimer);
    window._notifPollTimer = null;
  }
}

function updateReplyAvatar() {
  const el = document.getElementById('replyAvatar');
  if (!el) return;
  if (state.currentUser) {
    el.textContent = state.currentUser.username.charAt(0).toUpperCase();
    el.style.background = 'var(--avatar-bg)';
  } else {
    el.textContent = '?';
    el.style.background = 'var(--avatar-bg)';
  }
}

/* ===== 个人主页 ===== */
async function renderProfile(userId) {
  const uid = userId || state.currentProfileId || (state.currentUser ? state.currentUser.id : null);
  if (!uid) { navigateTo('home'); return; }

  const container = document.getElementById('profileContent');
  container.innerHTML = '<div class="empty-state"><p>' + t('loading') + '</p></div>';

  try {
    const data = await api('/api/users/' + uid);
    const user = data.user;
    const isMe = state.currentUser && uid === state.currentUser.id;
    const isFollowing = user.is_following || false;

    // 关注/私聊按钮
    let actionBtns = '';
    if (!isMe && state.currentUser) {
      const followBlocked = !!user.follow_disabled && !isFollowing;
      const followBtn = followBlocked
        ? `<button class="btn-follow" id="followBtn" disabled title="${escAttr(t('follow_disabled'))}">${t('follow_disabled')}</button>`
        : `<button class="btn-follow ${isFollowing ? 'following' : ''}" id="followBtn" onclick="toggleFollow('${uid}', ${isFollowing})">${isFollowing ? t('following_yes') : t('following')}</button>`;
      actionBtns = `
        <div class="profile-actions">
          ${followBtn}
          <button class="btn-dm" id="dmBtn" onclick="startDmFromProfile('${uid}', '${escAttr(user.username)}')" ${!isFollowing ? 'disabled title="' + t('followHint') + '"' : ''}>
            ${t('dm')}
          </button>
        </div>`;
    }

    // 处罚状态徽章（禁言 / 封禁 / 禁止被关注）
    const punishBadges = [];
    if (user.status === 'banned') {
      punishBadges.push('<span class="profile-punish-badge ban">已封禁</span>');
    } else if (user.is_muted) {
      const untilTxt = (user.muted_until && user.muted_until < 9999999999) ? ('至 ' + _fmtUntil(user.muted_until)) : '永久';
      punishBadges.push('<span class="profile-punish-badge mute">已被禁言 · ' + esc(untilTxt) + '</span>');
    }
    if (user.follow_disabled) punishBadges.push('<span class="profile-punish-badge nofollow">禁止被关注</span>');
    const punishReason = (user.status === 'banned' ? user.ban_reason : (user.is_muted ? user.mute_reason : '')) || '';
    const punishHtml = punishBadges.length
      ? '<div class="profile-punish"><div class="profile-punish-badges">' + punishBadges.join('') + '</div>' + (punishReason ? '<div class="profile-punish-reason">原因 · ' + esc(punishReason) + '</div>' : '') + '</div>'
      : '';

    container.innerHTML = `
      <div class="profile-header">
        <button class="profile-share-btn" onclick="openShareSheet('profile','${uid}','${escAttr(user.username)}')" title="${t('share')}" aria-label="${t('shareProfileTitle')}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
        <div class="profile-avatar"${(user.avatar && user.avatar.startsWith('/uploads/')) ? ` style="background-image:url('${user.avatar.replace(/['"\\]/g, '')}');background-size:cover;background-position:center"` : ''}>${(user.avatar && user.avatar.startsWith('/uploads/')) ? '' : (user.username || '?').charAt(0).toUpperCase()}</div>
        <div class="profile-name">${esc(user.username)}${verifiedBadge(user.verified)}${birthdayBadge(user.is_birthday)}</div>
        ${user.verified && user.verified_text ? `<div class="profile-verified-text">${verifiedBadge(user.verified)}${esc(user.verified_text)}</div>` : ''}
        ${punishHtml}
        <div class="profile-bio">${esc(user.bio || t('no_bio'))}</div>
        ${bioMetaHtml(user)}
        <!-- 生日当天显示祝福横幅 -->
        ${user.is_birthday ? '<div class="profile-birthday-banner"><span class="bday-banner-icon">🥳</span><span class="bday-banner-text">' + t('bdayBanner').replace('%s', esc(user.username)) + '</span></div>' : ''}
        <div class="profile-last-online">${user.last_online ? timeAgo(user.last_online) : t('never_online')}</div>
        ${actionBtns}
        <div class="profile-stats-row">
          <div class="profile-stat-item"><div class="profile-stat-num">${user.post_count || 0}</div><div class="profile-stat-label">${t('posts')}</div></div>
          <div class="profile-stat-item"><div class="profile-stat-num">${user.follower_count || 0}</div><div class="profile-stat-label">${t('follower')}</div></div>
          <div class="profile-stat-item"><div class="profile-stat-num">${user.following_count || 0}</div><div class="profile-stat-label">${t('following')}</div></div>
          <div class="profile-stat-item"><div class="profile-stat-num">${user.like_count || 0}</div><div class="profile-stat-label">${t('likes')}</div></div>
        </div>
      </div>
      <h2 class="page-title">${isMe ? t('my_posts') : t('their_posts')}</h2>
      <div class="post-grid">${(user.posts || []).length ? user.posts.map(p => renderPostCard(p)).join('') : `<div class="empty-state"><p>${t('no_posts')}</p></div>`}</div>`;
  } catch (e) {
    container.innerHTML = '<div class="empty-state"><p>' + t('load_failed') + '</p></div>';
  }
}

async function toggleFollow(targetId, currentlyFollowing) {
  try {
    await api(currentlyFollowing ? '/api/unfollow' : '/api/follow', {
      method: 'POST',
      body: { userId: targetId }
    });
    renderProfile(targetId);
  } catch (e) {
    showToast(e.message || '操作失败', 'error');
  }
}

async function startDmFromProfile(userId, username) {
  try {
    const data = await api('/api/dm/start', {
      method: 'POST',
      body: { userId }
    });
    if (!_chatOpen) toggleChat();
    switchChatTab('dm');
    openDmChat(data.conversationId, { id: userId, username, avatar: '' });
  } catch (e) {
    showToast('无法开始私聊: ' + e.message, 'error');
  }
}

/* ===== 收藏页 ===== */
async function renderBookmarks() {
  if (!state.currentUser) { navigateTo('home'); return; }
  const container = document.getElementById('bookmarkList');
  container.innerHTML = '<div class="empty-state"><p>' + t('loading') + '</p></div>';

  try {
    const data = await api('/api/bookmarks');
    const posts = data.posts || [];
    if (posts.length === 0) {
      container.innerHTML = `<div class="empty-state"><h3>${t('no_bookmarks')}</h3><p>${t('bookmarks_hint')}</p></div>`;
    } else {
      container.innerHTML = posts.map(p => renderPostCard(p)).join('');
    }
  } catch (e) {
    container.innerHTML = '<div class="empty-state"><p>' + t('load_failed') + '</p></div>';
  }
}

/* ===== 设置 ===== */
async function loadSettings() {
  if (!state.currentUser) {
    await checkLogin();
    if (!state.currentUser) { showLoginModal(); return; }
  }
  document.getElementById('settingUsername').value = state.currentUser.username || '';
  document.getElementById('settingBio').value = state.currentUser.bio || '';
  // 生日 / 地区 / 性别
  const bm = document.getElementById('profileBirthdayMonth');
  const bd = document.getElementById('profileBirthdayDay');
  const ba = document.getElementById('profileBirthdayAge');
  const rg = document.getElementById('profileRegion');
  const gd = document.getElementById('profileGender');
  if (bm) bm.value = String(state.currentUser.birthday_month || 0);
  if (bd) bd.value = String(state.currentUser.birthday_day || 0);
  if (ba) ba.value = state.currentUser.birthday_age || '';
  if (rg) rg.value = state.currentUser.region || '';
  if (gd) gd.value = state.currentUser.gender || '';
  // 邮箱显示与验证状态
  const emailDisplay = document.getElementById('settingEmailDisplay');
  const emailInput = document.getElementById('settingEmailInput');
  const verifiedBadge = document.getElementById('emailVerifiedBadge');
  const unverifiedBadge = document.getElementById('emailUnverifiedBadge');
  const verifyWarning = document.getElementById('emailVerifyWarning');
  const email = state.currentUser.email || '';
  if (emailDisplay) emailDisplay.textContent = email || '未设置';
  if (emailInput) emailInput.value = '';
  const isVerified = !!state.currentUser.email_verified;
  if (verifiedBadge) verifiedBadge.style.display = isVerified ? '' : 'none';
  if (unverifiedBadge) unverifiedBadge.style.display = isVerified ? 'none' : '';
  if (verifyWarning) verifyWarning.style.display = isVerified ? 'none' : '';
  // 同步主题按钮状态
  const currentTheme = localStorage.getItem('bird_theme') || 'light';
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.themeVal === currentTheme));
  document.getElementById('liquidGlassToggle').checked = localStorage.getItem('bird_liquid_glass') === '1';
  // 同步语言选择按钮状态
  document.querySelectorAll('.lang-seg-btn').forEach(i => i.classList.toggle('active', i.dataset.lang === currentLang));
  // Load avatar in settings
  const settingAvatar = document.getElementById('settingAvatar');
  if (settingAvatar && state.currentUser.avatar) {
    settingAvatar.style.backgroundImage = `url(${state.currentUser.avatar})`;
    settingAvatar.style.backgroundSize = 'cover';
    settingAvatar.style.backgroundPosition = 'center';
    settingAvatar.textContent = '';
  }
  // Load background remove button state
  const removeBgBtn = document.getElementById('removeBgBtn');
  if (removeBgBtn && localStorage.getItem('bird_bg')) {
    removeBgBtn.style.display = '';
  }
  loadPasskeys();
  loadSecuritySettings();
}

async function loadSecuritySettings() {
  try {
    const res = await api('/api/user/security');
    const toggle = document.getElementById('requireLoginCodeToggle');
    if (toggle) toggle.checked = res.require_login_code;
  } catch (e) { console.error('加载安全设置失败', e); }
}

async function toggleLoginCode() {
  const toggle = document.getElementById('requireLoginCodeToggle');
  const val = toggle.checked;
  try {
    await api('/api/user/security', { method: 'POST', body: JSON.stringify({ require_login_code: val }) });
    showToast(val ? '已开启登录验证码' : '已关闭登录验证码', 'success');
  } catch (e) {
    toggle.checked = !val;
    showToast(e.message, 'error');
  }
}

// ===== 邮箱管理 =====
async function changeEmail() {
  const newEmail = (document.getElementById('settingEmailInput').value || '').trim();
  if (!newEmail) { showToast('请输入新邮箱', 'error'); return; }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newEmail)) {
    showToast('邮箱格式不正确', 'error'); return;
  }
  try {
    await api('/api/user/change-email', { method: 'POST', body: { email: newEmail } });
    showToast('邮箱已修改，请尽快验证', 'success');
    await checkLogin();
    loadSettings();
  } catch (e) { showToast(e.message, 'error'); }
}

async function sendVerifyCodeForSettings() {
  const email = state.currentUser.email || '';
  if (!email) { showToast('账号未设置邮箱', 'error'); return; }
  const btn = document.getElementById('settingSendCodeBtn');
  btn.disabled = true;

  // 人机验证（Turnstile）
  let turnstileToken = '';
  try {
    const keyResp = await fetch('/api/turnstile-site-key');
    const keyData = await keyResp.json();
    const siteKey = keyData.site_key || '';
    if (siteKey) {
      const container = document.getElementById('turnstileContainerSettings');
      container.style.display = '';
      let widgetId = container.dataset.widgetId || '';
      if (!widgetId) {
        widgetId = turnstile.render(container, { sitekey: siteKey, theme: 'auto' });
        container.dataset.widgetId = widgetId;
      }
      // 等待 token（最多 3 秒）
      let waited = 0;
      while (!(turnstile.getResponse(widgetId)) && waited < 3000) {
        await new Promise(r => setTimeout(r, 200));
        waited += 200;
      }
      turnstileToken = turnstile.getResponse(widgetId);
      if (!turnstileToken) {
        showToast('请先完成人机验证', 'error');
        btn.disabled = false;
        return;
      }
    }
  } catch (e) { /* Turnstile 未加载，跳过 */ }

  try {
    await api('/api/send-verify-code', { method: 'POST', body: { email, turnstile_token: turnstileToken } });
    showToast('验证码已发送', 'success');
    let cd = 120;
    btn.textContent = `${cd}s`;
    const timer = setInterval(() => {
      cd--;
      if (cd <= 0) {
        clearInterval(timer);
        btn.textContent = '获取验证码';
        btn.disabled = false;
        // 重置人机验证
        const container = document.getElementById('turnstileContainerSettings');
        const wid = container && container.dataset.widgetId;
        if (wid) turnstile.reset(wid);
      } else btn.textContent = `${cd}s`;
    }, 1000);
  } catch (e) {
    showToast(e.message, 'error');
    btn.textContent = '获取验证码';
    btn.disabled = false;
    // 重置人机验证
    const container = document.getElementById('turnstileContainerSettings');
    const wid = container && container.dataset.widgetId;
    if (wid) turnstile.reset(wid);
  }
}

async function verifyEmail() {
  const code = (document.getElementById('settingEmailCode').value || '').trim();
  if (!code) { showToast('请输入验证码', 'error'); return; }
  try {
    await api('/api/user/verify-email', { method: 'POST', body: { code } });
    showToast('邮箱验证成功', 'success');
    document.getElementById('settingEmailCode').value = '';
    await checkLogin();
    loadSettings();
  } catch (e) { showToast(e.message, 'error'); }
}

async function saveSettings() {
  if (!state.currentUser) return;
  const username = document.getElementById('settingUsername').value.trim();
  const bio = document.getElementById('settingBio').value.trim();
  const birthday_month = parseInt(document.getElementById('profileBirthdayMonth').value || '0', 10);
  const birthday_day = parseInt(document.getElementById('profileBirthdayDay').value || '0', 10);
  const birthday_age = parseInt(document.getElementById('profileBirthdayAge').value || '0', 10) || 0;
  const region = (document.getElementById('profileRegion').value || '').trim();
  const gender = (document.getElementById('profileGender').value || '').trim();

  if (!username) { showToast(t('username_empty'), 'error'); return; }
  if (birthday_month > 0 && (birthday_day < 1 || birthday_day > 31)) {
    showToast('请选择正确的日期', 'error'); return;
  }

  try {
    const data = await api('/api/users/' + state.currentUser.id, {
      method: 'PUT',
      body: { username, bio, birthday_month, birthday_day, birthday_age, region, gender }
    });
    state.currentUser = Object.assign({}, state.currentUser, data.user);
    updateNavUI();
    showToast(t('settings_saved'), 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

function setTheme(theme) {
  if (theme === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  // 方格纸外观只有 light / dark 两档，geek 归入 light
  document.body.setAttribute('data-app-theme', theme === 'dark' ? 'dark' : 'light');
  _worldRasterize(); // 主题切换后半调地图换色重排
  localStorage.setItem('bird_theme', theme);
  // 标记用户已手动选择主题，背景亮度自动检测不再覆盖
  localStorage.setItem('bird_theme_manual', '1');
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.themeVal === theme));
  toggleCodeRain(theme === 'geek');
  if (theme === 'geek') {
    startGeekTyping();
  } else {
    // 切换离开 geek 主题时，停止打字动画并恢复标题
    if (_geekTypingTimer) { clearInterval(_geekTypingTimer); _geekTypingTimer = null; }
    const el = document.querySelector('.hero-title');
    if (el) el.textContent = t('hero_title');
  }
}

function applyTheme() {
  const t = localStorage.getItem('bird_theme') || 'light';
  if (t === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  document.body.setAttribute('data-app-theme', t === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.themeVal === t));
  toggleCodeRain(t === 'geek');
  _worldRasterize();
}

/* 首页图标栏的明暗切换：在 light / dark 两档间往返 */
function toggleAppTheme() {
  const cur = localStorage.getItem('bird_theme') || 'light';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ===== 代码雨 ===== */
let _codeRainId = null;
function toggleCodeRain(on) {
  const canvas = document.getElementById('geekCodeRain');
  if (!canvas) return;
  if (!on) { if (_codeRainId) { cancelAnimationFrame(_codeRainId); _codeRainId = null; } const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); return; }
  const ctx = canvas.getContext('2d');
  const chars = 'const→async⇒function*yield⟨⟩import{}export[]class=>()::;01λΩ∞∅!#@$fn→Result!>git npm curl ssh docker pip SELECT FROM WHERE if else return while for let var new this true false null undefined'.split('');
  const fontSize = 14;
  let columns, drops;
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; columns = Math.floor(canvas.width / fontSize); drops = Array(columns).fill(0).map(() => Math.random() * -50); }
  resize(); window.addEventListener('resize', resize);
  function draw() {
    ctx.fillStyle = 'rgba(10,14,23,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px JetBrains Mono, Fira Code, SF Mono, Menlo, monospace';
    for (let i = 0; i < columns; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const alpha = 0.5 + Math.random() * 0.5;
      ctx.fillStyle = `rgba(52,211,153,${alpha})`;
      ctx.fillText(ch, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    _codeRainId = requestAnimationFrame(draw);
  }
  draw();
}

/* ===== 极客标题打字动画 ===== */
const _geekTitles = ['翱翔鸟 论坛', 'SoaringBird論壇', 'SoaringBird Forum'];
let _geekTypingTimer = null;
function startGeekTyping() {
  if (_geekTypingTimer) clearInterval(_geekTypingTimer);
  const el = document.querySelector('.hero-title');
  if (!el || document.documentElement.getAttribute('data-theme') !== 'geek') return;
  let ti = 0, ci = 0, deleting = false, pause = 0;
  function tick() {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme !== 'geek') { if (_geekTypingTimer) { clearInterval(_geekTypingTimer); _geekTypingTimer = null; } return; }
    if (pause > 0) { pause--; return; }
    const target = _geekTitles[ti];
    if (!deleting) {
      ci++;
      el.textContent = target.substring(0, ci);
      if (ci >= target.length) { deleting = true; pause = 30; }
    } else {
      ci--;
      el.textContent = target.substring(0, ci);
      if (ci <= 0) { deleting = false; ti = (ti + 1) % _geekTitles.length; pause = 6; }
    }
  }
  _geekTypingTimer = setInterval(tick, 80);
}

/* ===== 通知 ===== */
async function toggleNotifications() {
  // 打开统一消息面板并切到通知 tab
  const panel = document.getElementById('chatPanel');
  if (!_chatOpen) {
    panel.classList.add('open');
    document.getElementById('chatOverlay').classList.add('show');
    _chatOpen = true;
  }
  switchMsgTab('notif');
  if (state.currentUser) {
    try {
      await api('/api/notifications/read', { method: 'POST' });
    } catch {}
    renderNotifications();
    updateNotifBadge();
  }
}

async function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!state.currentUser) {
    list.innerHTML = '<div class="np-empty">请先登录</div>';
    return;
  }

  try {
    const data = await api('/api/notifications');
    const notifs = data.notifications || [];
    if (notifs.length === 0) {
      list.innerHTML = '<div class="np-empty">' + t('no_notifications') + '</div>';
    } else {
      list.innerHTML = notifs.map(n =>
        `<div class="notif-item ${n.read ? '' : 'unread'}">
          <div><div class="notif-text">${esc(n.text)}</div><div class="notif-time">${timeAgo(n.created_at)}</div></div>
        </div>`
      ).join('');
    }
  } catch {
    list.innerHTML = '<div class="np-empty">' + t('load_failed') + '</div>';
  }
}

async function clearNotifications() {
  if (!state.currentUser) return;
  try {
    await api('/api/notifications', { method: 'DELETE' });
    renderNotifications();
    updateNotifBadge();
  } catch {}
}

async function updateNotifBadge() {
  if (!state.currentUser) return;
  try {
    const data = await api('/api/notifications');
    const notifs = data.notifications || [];
    const unread = notifs.filter(n => !n.read).length;
    const smBadge = document.getElementById('smMsgBadge');
    const msgBadge = document.getElementById('msgBadge');
    const tabBadge = document.getElementById('msgTabNotifBadge');
    const sbBadge = document.getElementById('sbMsgBadge');
    const show = unread > 0;
    if (smBadge) smBadge.hidden = !show;
    if (msgBadge) msgBadge.hidden = !show;
    if (tabBadge) tabBadge.hidden = !show;
    if (sbBadge) sbBadge.hidden = !show;
  } catch {}
}

/* ===== 下拉菜单 ===== */
function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('show');
}

function closeDropdowns() {
  document.getElementById('userDropdown').classList.remove('show');
  const sm = document.getElementById('sectionMenu');
  if (sm) sm.classList.remove('open');
  const fm = document.getElementById('filterMenu');
  if (fm) fm.classList.remove('show');
  const hb = document.getElementById('hamburgerBtn');
  if (hb) hb.classList.remove('active');
}

/* ===== 弹窗外部点击关闭 ===== */
function closeModalOutside(e) {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('show')) {
    e.target.classList.add('closing');
    document.body.style.overflow = '';
    setTimeout(() => { e.target.classList.remove('show', 'closing'); }, 150);
  }
}

/* ===== Toast ===== */
function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .2s forwards';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

/* ===== 举报（苹果风格底部弹层）===== */
const REPORT_REASONS = ['垃圾广告', '色情低俗', '人身攻击', '违规/违法信息', '其他'];
let _reportState = null;   // { type, id, label }

function _reportEnsureMarkup() {
  if (document.getElementById('reportOverlay')) return;
  const wrap = document.createElement('div');
  wrap.id = 'reportOverlay';
  wrap.innerHTML = `
    <div class="rep-scrim" onclick="closeReportSheet()"></div>
    <div class="rep-panel" role="dialog" aria-modal="true">
      <div class="rep-grab"></div>
      <div class="rep-title">举报</div>
      <div class="rep-sub" id="reportTargetLabel"></div>
      <div class="rep-options" id="reportOptions"></div>
      <div class="rep-custom-wrap"><textarea class="rep-custom" id="reportCustom" placeholder="补充举报原因（选填）" rows="2" maxlength="120"></textarea></div>
      <button class="rep-submit" id="reportSubmit" onclick="submitReport()">提交举报</button>
      <button class="rep-cancel" onclick="closeReportSheet()">取消</button>
      <div class="rep-success" id="reportSuccess">
        <div class="rep-spark"></div>
        <div class="rep-success-title">已收到举报</div>
        <div class="rep-success-sub">感谢你的反馈，我们会尽快审核处理。</div>
        <button class="rep-done" onclick="closeReportSheet()">好</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
}

function openReportSheet(type, id, label) {
  _reportEnsureMarkup();
  if (!state.currentUser) { showLoginModal(); return; }
  _reportState = { type, id, label };
  const overlay = document.getElementById('reportOverlay');
  const sub = document.getElementById('reportTargetLabel');
  sub.textContent = label ? ('“' + (label.length > 22 ? label.slice(0, 22) + '…' : label) + '”') : '';
  // 构建原因选项（单选）
  const opts = document.getElementById('reportOptions');
  opts.innerHTML = REPORT_REASONS.map((r, i) =>
    `<button class="rep-opt" data-i="${i}" onclick="event.stopPropagation();selectReportReason(${i})">
       <span class="rep-opt-text">${esc(r)}</span>
       <span class="rep-opt-check">✓</span>
     </button>`).join('');
  // 重置状态
  overlay.classList.remove('success');
  opts.querySelectorAll('.rep-opt').forEach(b => b.classList.remove('selected'));
  const cEl = document.getElementById('reportCustom'); if (cEl) cEl.value = '';
  document.getElementById('reportSubmit').disabled = false;
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', _onReportEsc);
}

function selectReportReason(i) {
  const overlay = document.getElementById('reportOverlay');
  overlay.querySelectorAll('.rep-opt').forEach((b, idx) => b.classList.toggle('selected', idx === i));
}

function closeReportSheet() {
  const overlay = document.getElementById('reportOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _onReportEsc);
  _reportState = null;
}

function _onReportEsc(e) { if (e.key === 'Escape') closeReportSheet(); }

async function submitReport() {
  const overlay = document.getElementById('reportOverlay');
  const sel = overlay.querySelector('.rep-opt.selected');
  if (!sel) { showToast('请选择举报原因', 'error'); return; }
  const reason = REPORT_REASONS[parseInt(sel.dataset.i, 10)] || '其他';
  const cEl = document.getElementById('reportCustom');
  const custom = cEl ? cEl.value.trim() : '';
  const fullReason = custom ? (reason === '其他' ? custom : reason + '：' + custom) : reason;
  const s = _reportState;
  if (!s) return;
  const btn = document.getElementById('reportSubmit');
  btn.disabled = true;
  try {
    const res = await api('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ target_type: s.type, target_id: s.id, reason: fullReason }),
    });
    if (res && (res.error)) {
      if (res.error === '未登录') { closeReportSheet(); showLoginModal(); return; }
      if (res.auto_removed === false && res.ok === undefined) {
        showToast(res.error || '举报失败', 'error');
        closeReportSheet();
        return;
      }
    }
    // 成功 → 进入苹果风格确认态
    overlay.classList.add('success');
    if (res && res.auto_removed) {
      const sub = document.getElementById('reportSuccess');
      const ss = sub.querySelector('.rep-success-sub');
      ss.textContent = '该内容已被自动下架，我们会留存记录供管理员复核。';
    }
  } catch (e) {
    showToast('网络异常，请稍后再试', 'error');
    closeReportSheet();
  } finally {
    const b2 = document.getElementById('reportSubmit'); if (b2) b2.disabled = false;
  }
}

/* ===== 分享功能（帖子 / 个人主页 → 链接或图片） ===== */
let _shareState = null;      // { type: 'post'|'profile', id, label }
let _shareImg = null;        // dataURL 生成的分享图片
let _shareLogos = null;      // 预加载的翱翔鸟 logo

function getShareLogos() {
  if (_shareLogos) return Promise.resolve(_shareLogos);
  const light = new Image(), dark = new Image();
  light.src = 'logo-light.png';
  dark.src = 'logo-dark.png';
  const once = (img) => new Promise(r => { img.onload = () => r(img); img.onerror = () => r(null); });
  return Promise.all([once(light), once(dark)]).then(([l, d]) => { _shareLogos = { light: l, dark: d }; return _shareLogos; });
}

function buildShareUrl(type, id) {
  const base = window.location.origin + window.location.pathname;
  return type === 'post' ? base + '?post=' + encodeURIComponent(id)
                          : base + '?profile=' + encodeURIComponent(id);
}

function showShareSheet() {
  const scrim = document.getElementById('shareScrim');
  const sheet = document.getElementById('shareSheet');
  scrim.classList.add('show');
  sheet.classList.add('show');
  sheet.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function hideSharePreview() {
  _shareImg = null;
  const prev = document.getElementById('sharePreview');
  if (prev) prev.style.display = 'none';
}

function closeShareSheet() {
  const scrim = document.getElementById('shareScrim');
  const sheet = document.getElementById('shareSheet');
  scrim.classList.remove('show');
  sheet.classList.remove('show');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _onShareEsc);
  hideSharePreview();
  _shareState = null;
}

function openShareSheet(type, id, label) {
  _shareState = { type, id, label };
  const title = document.getElementById('shareSheetTitle');
  if (title) title.textContent = type === 'post' ? t('sharePostTitle') : t('shareProfileTitle');
  hideSharePreview();
  showShareSheet();
  // Esc 关闭
  document.addEventListener('keydown', _onShareEsc);
}

function _onShareEsc(e) {
  if (e.key === 'Escape') closeShareSheet();
}

function copyShareLink() {
  if (!_shareState) return;
  const url = buildShareUrl(_shareState.type, _shareState.id);
  const done = () => { showToast('链接已复制', 'success'); closeShareSheet(); };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
  } else fallbackCopy(url, done);
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); }
  catch (e) { showToast('复制失败，请手动复制', 'error'); }
  ta.remove();
}

function shareLinkNative() {
  if (!_shareState) return;
  const url = buildShareUrl(_shareState.type, _shareState.id);
  const title = _shareState.label || 'SoaringBird';
  if (navigator.share) {
    navigator.share({ title, url }).then(() => closeShareSheet()).catch(() => {});
  } else copyShareLink();
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const chars = Array.from(String(text || ''));
  const lines = [];
  let line = '';
  const flush = () => {
    lines.push(line); line = '';
  };
  for (const ch of chars) {
    const test = line + ch;
    if (line && ctx.measureText(test).width > maxWidth) flush();
    line += ch;
  }
  if (line) flush();
  if (lines.length > maxLines) {
    let last = lines.slice(0, maxLines).join('');
    while (ctx.measureText(last + '…').width > maxWidth && last.length > 1) last = last.slice(0, -1);
    return [...lines.slice(0, maxLines - 1), last + '…'];
  }
  return lines;
}

function loadImage(src) {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

function plainText(md) {
  return String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~`|\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function drawQR(ctx, url, x, y, size) {
  if (typeof qrcode !== 'function' || !url) return;
  try {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const pad = Math.round(size * 0.04);
    const cell = (size - pad * 2) / count;
    // 二维码必须浅底，统一白底黑块
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#111111';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(x + pad + c * cell, y + pad + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  } catch (e) { /* 忽略二维码绘制失败 */ }
}

/* 分享图底纹：极淡的纸张噪点，与站内材质一致 */
function drawShareGrain(ctx, S, isBlack) {
  const n = document.createElement('canvas');
  n.width = n.height = 72;
  const nc = n.getContext('2d');
  const id = nc.createImageData(72, 72);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = isBlack ? 30 : 20;
  }
  nc.putImageData(id, 0, 0);
  const pat = ctx.createPattern(n, 'repeat');
  if (!pat) return;
  ctx.save();
  ctx.globalCompositeOperation = isBlack ? 'screen' : 'multiply';
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();
}

async function drawShareCard(style, info) {
  const S = 720, pad = 44;
  const isBlack = style === 'black';
  const bg = isBlack ? '#0a0a0a' : '#ffffff';
  const fg = isBlack ? '#ffffff' : '#111111';
  const sec = isBlack ? '#98989d' : '#8e8e93';
  const line = isBlack ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
  const fontStack = '-apple-system,"SF Pro Text","Helvetica Neue",Arial,sans-serif';
  const serif = '"New York","Songti SC",Georgia,"Times New Roman",serif';
  const mono = '"SF Mono",ui-monospace,Menlo,Consolas,monospace';

  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  drawShareGrain(ctx, S, isBlack);

  const logos = await getShareLogos();
  const logo = isBlack ? logos.dark : logos.light;
  const avatar = info.avatar ? await loadImage(info.avatar) : null;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // 顶部：翱翔鸟图标 + 品牌
  if (logo) ctx.drawImage(logo, pad, pad, 38, 38);
  ctx.font = '600 20px ' + fontStack;
  ctx.fillStyle = fg;
  ctx.fillText('翱翔鸟论坛', pad + (logo ? 52 : 0), pad + 19);

  // 眉题（类型说明）
  ctx.font = '500 13px ' + mono;
  ctx.fillStyle = sec;
  ctx.fillText(info.eyebrow, pad, pad + 150);

  if (info.type === 'profile') {
    // 头像（圆形）
    const cx = S / 2, cy = pad + 262, r = 52;
    if (avatar) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = line; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = '#C7C7CC';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 60px ' + fontStack; ctx.textAlign = 'center';
      ctx.fillText((info.title || '?').charAt(0).toUpperCase(), cx, cy + 4);
      ctx.textAlign = 'left';
    }
    // 用户名
    ctx.textAlign = 'center';
    ctx.font = '600 44px ' + serif; ctx.fillStyle = fg;
    ctx.fillText(info.title, S / 2, cy + r + 46);
    ctx.textAlign = 'left';
    // 简介
    ctx.font = '500 18px ' + fontStack; ctx.fillStyle = sec;
    let by = cy + r + 86;
    wrapText(ctx, info.body, S - pad * 2, 2).forEach(l => { ctx.fillText(l, pad, by); by += 27; });
    // 数据
    ctx.font = '500 13px ' + mono;
    ctx.fillText(info.meta, pad, by + 20);
  } else {
    // 帖子：标题
    ctx.font = '600 44px ' + serif; ctx.fillStyle = fg;
    let ty = pad + 224;
    wrapText(ctx, info.title, S - pad * 2, 2).forEach(l => { ctx.fillText(l, pad, ty); ty += 56; });
    // 正文摘要
    ctx.font = '500 19px ' + fontStack; ctx.fillStyle = sec;
    let by = ty + 14;
    wrapText(ctx, info.body, S - pad * 2, 3).forEach(l => { ctx.fillText(l, pad, by); by += 29; });
    // 作者 · 版块
    ctx.font = '500 13px ' + mono;
    ctx.fillText(info.author, pad, by + 22);
  }

  // 底部：分隔线
  const fLineY = S - pad - 82;
  ctx.strokeStyle = line; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, fLineY); ctx.lineTo(S - pad, fLineY); ctx.stroke();

  // 底部左侧：引导语 + 链接
  ctx.font = '500 14px ' + mono; ctx.fillStyle = fg; ctx.textAlign = 'left';
  ctx.fillText(info.footerTxt || '在翱翔鸟论坛查看原内容', pad, fLineY + 30);
  ctx.font = '400 13px ' + mono; ctx.fillStyle = sec;
  const maxLinkW = (S - pad * 2) - (118 + 16 + 20);
  wrapText(ctx, info.link, maxLinkW, 1).forEach(l => { ctx.fillText(l, pad, fLineY + 58); });

  // 右下角二维码
  const qrSize = 118, qrPad = 12;
  drawQR(ctx, info.link, S - pad - qrSize - qrPad, S - pad - qrSize - qrPad, qrSize);

  _shareImg = canvas.toDataURL('image/png');
  const imgEl = document.getElementById('sharePreviewImg');
  const prev = document.getElementById('sharePreview');
  if (imgEl && prev) {
    imgEl.src = _shareImg;
    prev.style.display = 'block';
    prev.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

async function shareAsImage(style) {
  if (!_shareState) return;
  try {
    const link = buildShareUrl(_shareState.type, _shareState.id);
    let info;
    if (_shareState.type === 'post') {
      const d = await api('/api/posts/' + _shareState.id);
      const p = d.post;
      info = {
        type: 'post',
        eyebrow: t('cardPostEyebrow'),
        title: p.title || '',
        body: plainText(p.content),
        author: ((p.author_name || '') + (p.category ? ' · ' + p.category : '')),
        footerTxt: t('cardPostFooter'),
        link
      };
    } else {
      const d = await api('/api/users/' + _shareState.id);
      const u = d.user;
      info = {
        type: 'profile',
        eyebrow: t('cardProfileEyebrow'),
        title: u.username || '',
        body: (u.bio || ''),
        meta: (u.post_count || 0) + ' ' + t('posts') + ' · ' + (u.follower_count || 0) + ' ' + t('follower') + ' · ' + (u.following_count || 0) + ' ' + t('following'),
        footerTxt: t('cardProfileFooter'),
        avatar: (u.avatar && u.avatar.startsWith('/uploads/')) ? u.avatar : '',
        link
      };
    }
    await drawShareCard(style, info);
  } catch (e) {
    showToast(t('shareGenFail'), 'error');
  }
}

function saveShareImage() {
  if (!_shareImg) return;
  const a = document.createElement('a');
  a.href = _shareImg;
  const name = (_shareState && _shareState.type === 'post' ? 'post' : 'profile') + '-soaringbird.png';
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('已保存图片', 'success');
}

function shareImageNative() {
  if (!_shareImg) return;
  if (navigator.share) {
    const blob = dataURLToBlob(_shareImg);
    const file = new File([blob], 'soaringbird-share.png', { type: 'image/png' });
    navigator.share({ files: [file], title: 'SoaringBird' }).catch(() => {});
  } else saveShareImage();
}

function dataURLToBlob(dataUrl) {
  const [head, body] = dataUrl.split(',');
  const mime = head.match(/:(.*?);/)[1];
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ===== 工具函数 ===== */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

// 用于 onclick 等属性上下文的转义（额外转义引号，防属性逃逸）
function escAttr(str) {
  return esc(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 认证徽章（类似 X 蓝V）— 标准 Material Design verified 图标
function verifiedBadge(flag) {
  if (!flag) return '';
  return '<svg class="verified-badge" viewBox="0 0 24 24" width="14" height="14" aria-label="已认证"><path fill="currentColor" d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"/><path fill="#fff" d="M10.09 16.18l-3.54-3.54 1.41-1.41 2.12 2.12 5.3-5.3 1.41 1.41z"/></svg>';
}

// 生日专属徽章（当日生日的用户获得的认证类徽章）
function birthdayBadge(flag) {
  if (!flag) return '';
  return '<span class="birthday-badge" title="生日快乐" aria-label="生日快乐">🎂</span>';
}

// 生日弹窗：仅在登录且当天生日时展示
function maybeShowBirthdayPopup() {
  const u = state.currentUser;
  if (!u || !u.is_birthday) return;
  const sub = document.getElementById('bdaySub');
  if (sub && u.username) sub.textContent = '今天是你的好日子，' + u.username + '，愿新的一岁闪闪发光 ✨';
  const modal = document.getElementById('birthdayModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  // 阻止背景滚动
  document.body.style.overflow = 'hidden';
}

function closeBirthdayModal() {
  const modal = document.getElementById('birthdayModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
}

// 个人资料附加信息点（生日 / 年龄 / 地区 / 性别），文本标签式布局，不使用 Emoji
function bioMetaHtml(user) {
  const rows = [];
  const bm = user.birthday ? ('生日 · ' + esc(user.birthday) + (user.birthday_age ? '（' + esc(String(user.birthday_age)) + ' 岁）' : '')) : '';
  if (bm) rows.push(bm);
  if (user.region) rows.push('地区 · ' + esc(String(user.region)));
  if (user.gender) rows.push('性别 · ' + esc(String(user.gender)));
  if (!rows.length) return '';
  return '<div class="profile-meta-list">' + rows.map(r => '<span class="profile-meta-item">' + r + '</span>').join('') + '</div>';
}

// 头像渲染辅助：有图片显示图片，否则显示首字母
function avatarHtml(avatarUrl, name, extraClass) {
  const initial = (name || '?').charAt(0).toUpperCase();
  // 仅允许 /uploads/ 或 /static/ 开头的相对路径头像，防 CSS 注入
  if (avatarUrl && typeof avatarUrl === 'string' && (avatarUrl.startsWith('/uploads/') || avatarUrl.startsWith('/static/'))) {
    const safeUrl = avatarUrl.replace(/['"\\]/g, '');
    return `<div class="avatar${extraClass ? ' ' + extraClass : ''}" style="background-image:url('${safeUrl}');background-size:cover;background-position:center"></div>`;
  }
  return `<div class="avatar${extraClass ? ' ' + extraClass : ''}">${initial}</div>`;
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() / 1000 - ts;
  const s = Math.floor(diff);
  if (s < 60) return t('just_now');
  const m = Math.floor(s / 60);
  if (m < 60) return m + t('minutes_ago');
  const h = Math.floor(m / 60);
  if (h < 24) return h + t('hours_ago');
  const d = Math.floor(h / 24);
  if (d < 30) return d + t('days_ago');
  const locale = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'en': 'en-US', 'ja': 'ja-JP' }[currentLang] || 'zh-CN';
  return new Date(ts * 1000).toLocaleDateString(locale);
}

function formatContent(text) {
  if (!text) return '';
  try {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      const raw = marked.parse(text);
      // 用 DOMPurify 清洗，防止存储型 XSS
      if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['p','br','strong','em','code','pre','blockquote','ul','ol','li','a','img','h1','h2','h3','h4','h5','h6','hr','del','ins','sub','sup','table','thead','tbody','tr','th','td','span','div'], ALLOWED_ATTR: ['href','src','alt','title','class','target','rel'], ALLOW_DATA_ATTR: false });
      }
      // DOMPurify 不可用时降级为纯文本转义，禁止渲染原始 HTML
      return esc(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    }
  } catch (e) {}
  // fallback — 纯文本转义后做简单格式化
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

/* ===== 全局事件 ===== */
document.addEventListener('click', (e) => {
  const dd = document.getElementById('userDropdown');
  const msgPanel = document.getElementById('chatPanel');
  const avatarBtn = document.getElementById('navAvatarBtn');
  const msgBtn = document.getElementById('msgBtn');

  const sbAcctBtn = document.getElementById('sbUser'); // 侧栏头像也是下拉的触发器
  if (dd.classList.contains('show') && !dd.contains(e.target) && !avatarBtn.contains(e.target) && !(sbAcctBtn && sbAcctBtn.contains(e.target))) {
    dd.classList.remove('show');
  }
  // 点击消息面板外部关闭
  if (msgPanel && msgPanel.classList.contains('open') && !msgPanel.contains(e.target) && !msgBtn.contains(e.target) && !e.target.closest('.sm-item')) {
    msgPanel.classList.remove('open');
    msgPanel.classList.remove('fullscreen');
    document.getElementById('chatOverlay').classList.remove('show');
    _chatOpen = false;
    _chatFullscreen = false;
  }
});

/* ===== 液态玻璃 ===== */
function toggleLiquidGlass() {
  const enabled = document.getElementById('liquidGlassToggle').checked;
  localStorage.setItem('bird_liquid_glass', enabled ? '1' : '0');
  if (enabled) {
    document.body.classList.add('lg-enabled');
    if (window.initLiquidGlass) window.initLiquidGlass();
  } else {
    document.body.classList.remove('lg-enabled');
    disableLiquidGlass();
  }
}

function applyLiquidGlassSetting() {
  const enabled = localStorage.getItem('bird_liquid_glass') === '1';
  if (enabled) {
    document.body.classList.add('lg-enabled');
    if (window.initLiquidGlass) window.initLiquidGlass();
  } else {
    document.body.classList.remove('lg-enabled');
  }
}

function disableLiquidGlass() {
  // Remove lg class and restore normal backdrop-filter
  document.querySelectorAll('.lg').forEach(el => {
    el.classList.remove('lg');
    el._lgApplied = false;
    el.style.backdropFilter = '';
    el.style.webkitBackdropFilter = '';
  });
  // Remove SVG filters
  const svg = document.querySelector('svg[aria-hidden="true"]');
  if (svg) svg.remove();
  // Apply normal glass style
  document.querySelectorAll('.nav-bar,.dropdown,.notif-panel,.filter-menu,.modal').forEach(el => {
    el.style.backdropFilter = 'blur(8px) saturate(180%)';
    el.style.webkitBackdropFilter = 'blur(8px) saturate(180%)';
  });
}

/* ===== 性能优化模式 ===== */
let _perfMode = false;

function togglePerfMode() {
  const enabled = document.getElementById('perfModeToggle').checked;
  localStorage.setItem('bird_perf_mode', enabled ? '1' : '0');
  _perfMode = enabled;
  if (enabled) {
    document.body.classList.add('perf-mode');
    // 强制关闭液态玻璃
    const lgToggle = document.getElementById('liquidGlassToggle');
    if (lgToggle && lgToggle.checked) {
      lgToggle.checked = false;
      toggleLiquidGlass();
    }
  } else {
    document.body.classList.remove('perf-mode');
  }
}

function applyPerfModeSetting() {
  const enabled = localStorage.getItem('bird_perf_mode') === '1';
  _perfMode = enabled;
  const toggle = document.getElementById('perfModeToggle');
  if (toggle) toggle.checked = enabled;
  if (enabled) {
    document.body.classList.add('perf-mode');
  }
}

/* ===== 头像上传 ===== */
async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 7 * 1024 * 1024) { showToast('文件大小不能超过7MB', 'error'); return; }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const data = await api('/api/upload/avatar', {
      method: 'POST',
      body: formData,
      raw: true
    });
    state.currentUser.avatar = data.avatar;
    updateNavUI();
    const settingAvatar = document.getElementById('settingAvatar');
    if (settingAvatar) {
      settingAvatar.style.backgroundImage = `url(${data.avatar})`;
      settingAvatar.style.backgroundSize = 'cover';
      settingAvatar.style.backgroundPosition = 'center';
      settingAvatar.textContent = '';
    }
    showToast('头像已更新', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 背景亮度检测 ===== */
function detectBgBrightness(url, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
    const brightness = (r / count * 0.299 + g / count * 0.587 + b / count * 0.114);
    callback(brightness);
  };
  img.onerror = function () { callback(128); };
  img.src = url;
}

function applyBgBrightness(brightness) {
  // 如果用户已手动选择主题，不再自动覆盖
  if (localStorage.getItem('bird_theme_manual')) return;
  const isDark = brightness < 140;
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('bird_theme', 'dark');
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.themeVal === 'dark'));
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('bird_theme', 'light');
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.themeVal === 'light'));
  }
}

/* ===== 背景上传 ===== */
async function uploadBackground(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('文件大小不能超过10MB', 'error'); return; }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const data = await api('/api/upload/background', {
      method: 'POST',
      body: formData,
      raw: true
    });
    let bgLayer = document.getElementById('bgLayer');
    if (!bgLayer) {
      bgLayer = document.createElement('div');
      bgLayer.id = 'bgLayer';
      document.body.prepend(bgLayer);
    }
    bgLayer.style.backgroundImage = `url(${data.background})`;
    document.getElementById('removeBgBtn').style.display = '';
    localStorage.setItem('bird_bg', data.background);
    detectBgBrightness(data.background, applyBgBrightness);
    showToast('背景已更新', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

async function removeBackground() {
  try {
    await api('/api/user/background', { method: 'DELETE' });
  } catch (e) { /* 忽略错误，继续清理前端 */ }
  const bgLayer = document.getElementById('bgLayer');
  if (bgLayer) bgLayer.style.backgroundImage = '';
  document.getElementById('removeBgBtn').style.display = 'none';
  localStorage.removeItem('bird_bg');
  showToast('背景已移除', 'success');
}

/* ===== 邮箱验证提醒弹窗 ===== */
function showSplash() {
  // 仅未验证用户显示
  if (!state.currentUser) return;
  if (state.currentUser.email_verified) return;
  // 当天已点击"稍后提醒"则不再弹
  const dismissed = localStorage.getItem('bird_verify_splash_dismissed');
  if (dismissed) {
    const today = new Date().toDateString();
    if (dismissed === today) return;
  }
  const overlay = document.getElementById('verifySplashOverlay');
  if (overlay) overlay.style.display = '';
}

function closeVerifySplash() {
  const overlay = document.getElementById('verifySplashOverlay');
  if (overlay) overlay.style.display = 'none';
  // 跳转到设置页
  navigateTo('settings');
}

function dismissVerifySplash() {
  const overlay = document.getElementById('verifySplashOverlay');
  if (overlay) overlay.style.display = 'none';
  // 记录今天已忽略，今天不再弹
  localStorage.setItem('bird_verify_splash_dismissed', new Date().toDateString());
}

function closeSplash() {}

/* ===== 幻霜一键登录 ===== */
const HS_AUTH_SERVER = 'http://localhost:19421';

async function detectHuanshuangClient() {
  const btn = document.getElementById('huanshuangLoginBtn');
  if (!btn) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${HS_AUTH_SERVER}/auth/status`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      btn.disabled = true;
      btn.title = '未检测到幻霜客户端';
      btn.style.opacity = '0.5';
      return;
    }
    const data = await res.json();
    if (data.loggedIn) {
      btn.disabled = false;
      btn.title = '';
      btn.style.opacity = '';
    } else {
      btn.disabled = true;
      btn.title = '幻霜客户端未登录';
      btn.style.opacity = '0.5';
    }
  } catch {
    btn.disabled = true;
    btn.title = '未检测到幻霜客户端';
    btn.style.opacity = '0.5';
  }
}

async function huanshuangOneClickLogin() {
  const btn = document.getElementById('huanshuangLoginBtn');
  if (!btn) return;

  btn.disabled = true;
  btn.classList.add('loading');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>请在幻霜客户端确认…';

  try {
    // 1. 探测客户端
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const statusRes = await fetch(`${HS_AUTH_SERVER}/auth/status`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    const statusData = await statusRes.json();
    if (!statusData.loggedIn) {
      showToast('请先在幻霜客户端中登录', 'error');
      return;
    }

    // 2. 发起授权请求
    const authRes = await fetch(`${HS_AUTH_SERVER}/auth/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'SoaringBird 论坛',
        scopes: ['user:name', 'user:avatar', 'user:email'],
      }),
    });

    if (!authRes.ok) {
      const errData = await authRes.json().catch(() => ({}));
      throw new Error(errData.message || '授权请求失败');
    }

    const { ticketId } = await authRes.json();

    // 3. 轮询结果
    const userInfo = await new Promise((resolve, reject) => {
      const startTime = Date.now();
      const maxWait = 120000;
      const poll = async () => {
        if (Date.now() - startTime >= maxWait) {
          reject(new Error('授权等待超时'));
          return;
        }
        try {
          const res = await fetch(`${HS_AUTH_SERVER}/auth/poll/${ticketId}`);
          const data = await res.json();
          if (data.status === 'approved') return resolve(data);
          if (data.status === 'rejected') return reject(new Error('用户拒绝了授权'));
          if (data.status === 'expired') return reject(new Error('授权请求已超时'));
          setTimeout(poll, 1000);
        } catch (err) { reject(err); }
      };
      poll();
    });

    // 4. 用幻霜用户信息登录/注册
    const loginData = await api('/api/auth/huanshuang', {
      method: 'POST',
      body: {
        hsUserId: userInfo.userId,
        username: userInfo.username,
        avatar: userInfo.avatar,
        email: userInfo.email,
      }
    });

    state.currentUser = loginData.user;
    updateNavUI();
    closeLoginModal();
    showToast('登录成功', 'success');
    initChat();
    renderPosts();

  } catch (e) {
    showToast(e.message || '幻霜登录失败', 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>幻霜账号一键登录';
  }
}

/* ===== 幻霜 OAuth 2.0 网页授权 ===== */
let _hsOAuthConfig = null;

async function loadHsOAuthConfig() {
  if (_hsOAuthConfig) return _hsOAuthConfig;
  try {
    const res = await fetch('/api/auth/huanshuang/oauth-config', { cache: 'no-store' });
    _hsOAuthConfig = await res.json();
  } catch {
    _hsOAuthConfig = { enabled: false };
  }
  return _hsOAuthConfig;
}

async function huanshuangOAuthLogin() {
  const config = await loadHsOAuthConfig();
  if (!config.enabled) {
    showToast('OAuth 未配置，请先设置 appId 和 appSecret', 'error');
    return;
  }

  // 从服务端获取 state（防 CSRF）
  let state;
  try {
    const stateRes = await fetch('/api/auth/huanshuang/init-state', { method: 'POST', credentials: 'include' });
    const stateData = await stateRes.json();
    state = stateData.state;
    if (!state) throw new Error('state 无效');
  } catch {
    showToast('授权初始化失败，请重试', 'error');
    return;
  }

  const redirectUri = encodeURIComponent(location.origin + '/api/auth/huanshuang/callback');
  const scopes = 'user:name+user:avatar+user:email';
  const authUrl = `${config.baseUrl}/api/oauth/authorize?client_id=${config.appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${state}`;

  // 直接跳转到幻霜授权页面（不再用 popup）
  location.href = authUrl;
}

async function detectHsOAuth() {
  // 幻霜 OAuth 登录按钮始终可见
}

/* ===== 私聊 ===== */

let _chatTab = 'group'; // 'group' or 'dm'

function switchChatTab(tab) {
    if (_dmConvId) closeDmChat();
    _chatTab = tab;
    const groupBtn = document.getElementById('chatTabGroup');
    const dmBtn = document.getElementById('chatTabDm');
    const onlineRow = document.getElementById('chatOnlineRow');
    const onlineUsers = document.getElementById('chatOnlineUsers');
    const inputArea = document.getElementById('chatInputArea');
    const input = document.getElementById('chatInput');

    if (tab === 'dm') {
        if (groupBtn) groupBtn.style.opacity = '0.4';
        if (dmBtn) dmBtn.style.opacity = '1';
        if (onlineRow) onlineRow.style.display = 'none';
        if (onlineUsers) onlineUsers.style.display = 'none';
        if (inputArea) inputArea.style.display = 'none';
        loadDmConversations();
    } else {
        if (groupBtn) groupBtn.style.opacity = '1';
        if (dmBtn) dmBtn.style.opacity = '0.4';
        if (onlineRow) onlineRow.style.display = '';
        if (onlineUsers) onlineUsers.style.display = '';
        if (inputArea) inputArea.style.display = '';
        if (input) input.placeholder = '发送消息...';
        loadChatHistory();
    }
}

async function loadDmConversations() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    container.innerHTML = `
        <div class="skeleton-chat"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-bubble"></div></div>
        <div class="skeleton-chat skeleton-chat-me"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-bubble"></div></div>
        <div class="skeleton-chat"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-bubble"></div></div>
    `;
    try {
        const convs = await api('/api/dm/conversations');
        container.innerHTML = '';
        if (convs.length === 0) {
            container.innerHTML = '<div class="chat-system-msg">暂无私聊会话</div>';
            return;
        }
        convs.forEach(c => {
            const div = document.createElement('div');
            div.className = 'dm-conv-item';
            div.onclick = () => openDmChat(c.id, c.other);
            div.innerHTML = `
                <div class="dm-conv-avatar" style="${c.other.avatar ? 'background-image:url(' + c.other.avatar + ');background-size:cover;background-position:center' : ''}">${c.other.avatar ? '' : (c.other.username || '?').charAt(0).toUpperCase()}</div>
                <div class="dm-conv-info">
                    <div class="dm-conv-name">${escapeHtml(c.other.username)}</div>
                    <div class="dm-conv-preview">${escapeHtml(c.lastMessage || '')}</div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        container.innerHTML = '<div class="chat-system-msg">加载失败</div>';
    }
}

async function openDmChat(convId, otherUser) {
    _dmConvId = convId;
    _dmView = 'chat';
    const panel = document.getElementById('chatPanel');
    const header = panel.querySelector('.chat-header');
    // 更新头部
    header.querySelector('.chat-title').textContent = otherUser.username;
    header.querySelector('.chat-online-row').style.display = 'none';
    // 显示输入区
    const inputArea = document.getElementById('chatInputArea');
    if (inputArea) inputArea.style.display = '';
    // 添加返回按钮
    const actions = header.querySelector('.chat-header-actions');
    if (!document.getElementById('dmBackBtn')) {
        const backBtn = document.createElement('button');
        backBtn.className = 'chat-action-btn';
        backBtn.id = 'dmBackBtn';
        backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
        backBtn.onclick = closeDmChat;
        actions.insertBefore(backBtn, actions.firstChild);
    }
    document.getElementById('dmBackBtn').style.display = '';
    // 加载消息
    const container = document.getElementById('chatMessages');
    container.innerHTML = `
        <div class="skeleton-chat"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-bubble"></div></div>
        <div class="skeleton-chat skeleton-chat-me"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-bubble"></div></div>
    `;
    try {
        const messages = await api(`/api/dm/messages/${convId}`);
        container.innerHTML = '';
        messages.forEach(msg => appendDmMessage(msg));
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        container.innerHTML = '<div class="chat-system-msg">加载失败</div>';
    }
    // 修改发送按钮行为
    const input = document.getElementById('chatInput');
    if (input) input.placeholder = `发送给 ${otherUser.username}...`;
    // 加入 Socket.IO 房间
    if (_socket) {
        _socket.emit('join_dm', { conversationId: convId });
    }
}

function closeDmChat() {
    _dmConvId = null;
    _dmView = 'list';
    const panel = document.getElementById('chatPanel');
    const header = panel.querySelector('.chat-header');
    header.querySelector('.chat-title').textContent = '私聊';
    header.querySelector('.chat-online-row').style.display = 'none';
    const backBtn = document.getElementById('dmBackBtn');
    if (backBtn) backBtn.style.display = 'none';
    const input = document.getElementById('chatInput');
    if (input) input.placeholder = '发送消息...';
    // 私聊列表不需要输入区
    const inputArea = document.getElementById('chatInputArea');
    if (inputArea) inputArea.style.display = 'none';
    loadDmConversations();
}

function appendDmMessage(msg) {
    if (!_dmConvId) return;
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const isMe = state.currentUser && msg.sender_id === state.currentUser.id;
    const time = new Date(msg.created_at * 1000);
    const timeStr = time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0');
    const div = document.createElement('div');
    div.className = 'chat-msg' + (isMe ? ' chat-msg-me' : '');
    div.innerHTML = `
        <div class="chat-msg-avatar" style="${msg.avatar ? 'background-image:url(' + msg.avatar + ');background-size:cover;background-position:center' : ''}">${msg.avatar ? '' : (msg.username || '?').charAt(0).toUpperCase()}</div>
        <div class="chat-msg-body">
            <div class="chat-msg-header">
                <span class="chat-msg-name">${escapeHtml(msg.username || '未知')}</span>
                <span class="chat-msg-time">${timeStr}</span>
            </div>
            <div class="chat-msg-text">${escapeHtml(filterText(msg.content))}</div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendDmMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !_dmConvId) return;
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    try {
        const msg = await api('/api/dm/send', {
            method: 'POST',
            body: { conversationId: _dmConvId, content }
        });
        appendDmMessage(msg);
    } catch (e) {
        showToast('发送失败: ' + e.message, 'error');
    }
}

async function startDmWithUser(userId, username) {
    try {
        const data = await api('/api/dm/start', {
            method: 'POST',
            body: { userId }
        });
        // 打开聊天面板并进入私聊
        if (!_chatOpen) toggleChat();
        openDmChat(data.conversationId, { id: userId, username, avatar: '' });
    } catch (e) {
        showToast('无法开始私聊: ' + e.message, 'error');
    }
}

/* ===== 启动 ===== */
init();

/* ===== WebAuthn / 安全密钥 ===== */
let _webauthnPending = false;

function isWebAuthnSupported() {
    return !!(window.PublicKeyCredential);
}

function _b64urlToBuf(b64url) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const bin = atob(padded);
    const buf = new ArrayBuffer(bin.length);
    const arr = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return buf;
}

function _bufToB64url(buf) {
    const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* WebAuthn 诊断测试 — 在 Console 输入 testWebAuthn() 运行 */
async function testWebAuthn() {
    console.log('=== WebAuthn 诊断 ===');
    console.log('hostname:', location.hostname);
    console.log('origin:', location.origin);
    console.log('protocol:', location.protocol);
    console.log('isSecureContext:', window.isSecureContext);
    console.log('PublicKeyCredential:', !!window.PublicKeyCredential);
    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log('platformAuthenticator:', available);
    } catch(e) {
        console.log('platformAuthenticator: error', e.message);
    }
    try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        const result = await navigator.credentials.create({
            publicKey: {
                challenge: challenge,
                rp: { name: 'Test' },
                user: { id: new Uint8Array([1,2,3,4,5,6,7,8]), name: 'test', displayName: 'Test' },
                pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
                timeout: 60000
            }
        });
        console.log('测试注册: 成功!', result.id);
    } catch(e) {
        console.log('测试注册: 失败!', e.name, e.message, e);
    }
}

async function registerPasskey() {
    if (!isWebAuthnSupported()) { showToast('你的浏览器不支持安全密钥', 'error'); return; }
    if (_webauthnPending) { showToast('请等待当前操作完成', 'error'); return; }
    _webauthnPending = true;
    try {
        // 1. 从服务端获取注册选项（传递浏览器端的 origin 信息）
        const opts = await api('/api/passkeys/register-begin', {
            method: 'POST',
            body: {
                browserOrigin: location.origin,
                browserHostname: location.hostname
            }
        });

        // 2. 构建浏览器 API 所需的参数
        const challenge = new Uint8Array(_b64urlToBuf(opts.challenge));
        const userId = new Uint8Array(_b64urlToBuf(opts.user.id));

        const publicKey = {
            challenge: challenge,
            rp: {
                name: opts.rp.name,
                id: opts.rp.id || location.hostname
            },
            user: {
                id: userId,
                name: opts.user.name,
                displayName: opts.user.displayName
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 },
                { type: 'public-key', alg: -257 }
            ],
            timeout: 60000,
            authenticatorSelection: { userVerification: 'preferred' },
            attestation: 'none'
        };

        if (opts.excludeCredentials && opts.excludeCredentials.length > 0) {
            publicKey.excludeCredentials = opts.excludeCredentials.map(c => ({
                id: new Uint8Array(_b64urlToBuf(c.id)),
                type: 'public-key'
            }));
        }

        console.log('WebAuthn register:', {
            rpId: publicKey.rp.id,
            hostname: location.hostname,
            origin: location.origin,
            isSecureContext: window.isSecureContext,
            challengeLen: challenge.length,
            userIdLen: userId.length
        });

        // 3. 调用浏览器原生 WebAuthn API
        const credential = await navigator.credentials.create({ publicKey });

        console.log('WebAuthn credential created:', credential.id);

        // 4. 编码凭据数据发送到服务端
        const name = prompt('为安全密钥命名（如：iPhone、YubiKey）：') || '安全密钥';
        await api('/api/passkeys/register-finish', {
            method: 'POST',
            body: {
                credential: {
                    id: credential.id,
                    rawId: _bufToB64url(credential.rawId),
                    response: {
                        clientDataJSON: _bufToB64url(credential.response.clientDataJSON),
                        attestationObject: _bufToB64url(credential.response.attestationObject)
                    },
                    type: credential.type
                },
                name: name,
                browserOrigin: location.origin,
                browserHostname: location.hostname
            }
        });

        showToast('安全密钥已添加', 'success');
        loadPasskeys();
    } catch (e) {
        console.error('WebAuthn register error:', e);
        if (e.data && e.data.debug) console.error('WebAuthn debug:', e.data.debug);
        if (e.name === 'NotAllowedError') {
            showToast('操作已取消', 'error');
        } else if (e.name === 'InvalidStateError') {
            showToast('该密钥已注册', 'error');
        } else {
            showToast('添加安全密钥失败: ' + (e.message || e.name), 'error');
        }
    } finally {
        _webauthnPending = false;
    }
}

async function passkeyLogin() {
    if (!isWebAuthnSupported()) { showToast('你的浏览器不支持安全密钥', 'error'); return; }
    if (_webauthnPending) { showToast('请等待当前操作完成', 'error'); return; }
    const btn = document.getElementById('passkeyLoginBtn');
    if (!btn) return;

    _webauthnPending = true;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        // 1. 从服务端获取认证选项（传递浏览器端的 origin 信息）
        const opts = await api('/api/passkeys/authenticate-begin', {
            method: 'POST',
            body: {
                browserOrigin: location.origin,
                browserHostname: location.hostname
            }
        });

        // 2. 构建浏览器 API 所需的参数
        const challenge = new Uint8Array(_b64urlToBuf(opts.challenge));

        const publicKey = {
            challenge: challenge,
            rpId: opts.rpId || location.hostname,
            timeout: opts.timeout || 60000,
            userVerification: opts.userVerification || 'preferred'
        };

        if (opts.allowCredentials && opts.allowCredentials.length > 0) {
            publicKey.allowCredentials = opts.allowCredentials.map(c => ({
                id: new Uint8Array(_b64urlToBuf(c.id)),
                type: 'public-key'
            }));
        }

        console.log('WebAuthn auth:', {
            rpId: publicKey.rpId,
            hostname: location.hostname,
            origin: location.origin,
            challengeLen: challenge.length
        });

        // 3. 调用浏览器原生 WebAuthn API
        const assertion = await navigator.credentials.get({ publicKey });

        console.log('WebAuthn assertion received:', assertion.id);

        // 4. 编码断言数据发送到服务端
        const loginData = await api('/api/passkeys/authenticate-finish', {
            method: 'POST',
            body: {
                credential: {
                    id: assertion.id,
                    rawId: _bufToB64url(assertion.rawId),
                    response: {
                        clientDataJSON: _bufToB64url(assertion.response.clientDataJSON),
                        authenticatorData: _bufToB64url(assertion.response.authenticatorData),
                        signature: _bufToB64url(assertion.response.signature)
                    },
                    type: assertion.type
                },
                browserOrigin: location.origin,
                browserHostname: location.hostname
            }
        });

        state.currentUser = loginData.user;
        updateNavUI();
        closeLoginModal();
        showToast('登录成功', 'success');
        initChat();
        renderPosts();
    } catch (e) {
        console.error('WebAuthn auth error:', e);
        if (e.name === 'NotAllowedError') {
            showToast('操作已取消', 'error');
        } else {
            showToast('安全密钥登录失败: ' + (e.message || e.name), 'error');
        }
    } finally {
        _webauthnPending = false;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

async function loadPasskeys() {
    if (!state.currentUser) return;
    const listEl = document.getElementById('passkeyList');
    const supportText = document.getElementById('passkeySupportText');
    const addBtn = document.getElementById('addPasskeyBtn');

    if (!isWebAuthnSupported()) {
        if (supportText) supportText.textContent = '浏览器不支持';
        if (addBtn) addBtn.style.display = 'none';
        return;
    }

    if (supportText) supportText.textContent = '已支持';
    if (addBtn) addBtn.style.display = '';

    try {
        const data = await api('/api/passkeys/list');
        const passkeys = data.passkeys || [];
        if (listEl) {
            if (passkeys.length === 0) {
                listEl.innerHTML = '<div class="sg-row"><span style="font-size:13px;color:var(--text3)">尚未添加安全密钥</span></div>';
            } else {
                listEl.innerHTML = passkeys.map(pk => `
                    <div class="sg-row passkey-row">
                        <div class="passkey-info">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="12" height="12" rx="2"/><path d="M18 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><line x1="6" y1="10" x2="6" y2="10.01"/></svg>
                            <span class="passkey-name">${esc(pk.name || '安全密钥')}</span>
                            <span class="passkey-date">${timeAgo(pk.created_at)}</span>
                        </div>
                        <button class="btn-ghost btn-sm" style="color:var(--red);padding:4px 10px" onclick="deletePasskey('${pk.id}')">删除</button>
                    </div>
                    <div class="sg-sep"></div>
                `).join('');
            }
        }
    } catch (e) {
        if (listEl) listEl.innerHTML = '<div class="sg-row"><span style="font-size:13px;color:var(--red)">加载失败</span></div>';
    }
}

async function deletePasskey(passkeyId) {
    if (!confirm('确定删除此安全密钥？')) return;
    try {
        await api('/api/passkeys/' + passkeyId, { method: 'DELETE' });
        showToast('安全密钥已删除', 'success');
        loadPasskeys();
    } catch (e) { showToast(e.message, 'error'); }
}

/* ===== 内容过滤 ===== */
const _BAD_WORDS = [
  '傻逼','煞笔','沙比','sb','SB','草泥马','操你','艹你',
  '妈逼','马逼','妈比','干你','日你','靠你','去你妈','滚你妈',
  '狗日','狗娘','王八蛋','混蛋','混账','畜生','杂种',
  '贱人','婊子','表子','骚货','荡妇','绿茶婊',
  '白痴','弱智','脑残','智障','废物','人渣',
  '滚蛋','闭嘴','去死','死开','滚开','滚犊子',
  '他妈','她妈','你妈','尼玛','泥马',
  'fuck','Fuck','shit','Shit','bitch','Bitch','asshole','damn','crap','dick',
  '习近平','xijinping','Xijinping','XiJinping',
  '共产党','中共','反共','反华','台独','藏独','疆独',
  '法轮功','法轮','falungong','六四','6四','六4','64事件','8964',
  '天安门事件','天安门屠杀','民运','翻墙','VPN','vpn',
  '做爱','性交','口交','肛交','手淫','自慰','撸管','打飞机',
  '约炮','一夜情','援交','卖淫','嫖娼','嫖客',
  '色情','黄色视频','黄片','AV女优','裸体','裸照',
  '阴茎','阴道','生殖器','乳房','胸部',
  'porn','Porn','sex','Sex','nude','Nude','naked','Naked','hentai','Hentai',
];
const _BAD_WORDS_SORTED = [..._BAD_WORDS].sort((a, b) => b.length - a.length);

function filterText(text) {
  if (!text) return text;
  let result = text;
  for (const word of _BAD_WORDS_SORTED) {
    if (result.includes(word)) {
      result = result.split(word).join('*'.repeat(word.length));
    }
  }
  return result;
}

/* ===== 实时聊天 ===== */
let _chatOpen = false;
let _socket = null;
let _chatConnected = false;
let _chatMode = 'none'; // 'socket' | 'poll' | 'none'
let _pollTimer = null;
let _lastMsgTime = 0;
let _chatAgreed = false;
let _dmConvId = null; // 当前私聊会话ID
let _dmView = 'list'; // 'list' or 'chat'

const CHAT_RULES_KEY = 'bird_chat_agreed';

function showChatRules() {
    return new Promise((resolve) => {
        if (localStorage.getItem(CHAT_RULES_KEY) === 'v1') {
            _chatAgreed = true;
            resolve(true);
            return;
        }
        const overlay = document.createElement('div');
        overlay.className = 'chat-rules-overlay';
        overlay.innerHTML = `
            <div class="chat-rules-modal lg">
                <div class="chat-rules-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    <h3>聊天室用户须知</h3>
                </div>
                <div class="chat-rules-body">
                    <p class="chat-rules-intro">欢迎来到 SoaringBird 论坛聊天室。为营造良好的交流环境，请遵守以下规定：</p>
                    <ul class="chat-rules-list">
                        <li><span class="chat-rules-num">1</span>文明发言，禁止使用侮辱性、歧视性或攻击性语言</li>
                        <li><span class="chat-rules-num">2</span>禁止讨论涉及政治敏感、违法违规的内容</li>
                        <li><span class="chat-rules-num">3</span>禁止发布色情、暴力、恐怖等不良信息</li>
                        <li><span class="chat-rules-num">4</span>禁止发布广告、垃圾信息或恶意链接</li>
                        <li><span class="chat-rules-num">5</span>禁止冒充他人或散布虚假信息</li>
                        <li><span class="chat-rules-num">6</span>尊重他人隐私，禁止泄露他人个人信息</li>
                        <li><span class="chat-rules-num">7</span>管理员有权删除违规消息，严重违规者将被封禁</li>
                    </ul>
                    <p class="chat-rules-note">违反以上规定，管理员有权对消息进行删除，情节严重者将受到账号处罚。</p>
                </div>
                <div class="chat-rules-footer">
                    <button class="chat-rules-btn" id="chatAgreeBtn">我已阅读并同意</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('chatAgreeBtn').onclick = () => {
            localStorage.setItem(CHAT_RULES_KEY, 'v1');
            _chatAgreed = true;
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 200);
            resolve(true);
        };
    });
}

function initChat() {
    if (!state.currentUser) return;
    if (_chatMode !== 'none') return; // 已初始化

    // 加载历史消息
    loadChatHistory();

    // 尝试 Socket.IO 连接
    if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = '/socket.io/socket.io.js';
        script.onload = () => connectSocket();
        script.onerror = () => {
            console.log('Socket.IO 客户端加载失败，切换到 HTTP 轮询模式');
            startPolling();
        };
        document.head.appendChild(script);
    } else {
        connectSocket();
    }
}

function connectSocket() {
    if (!state.currentUser || _socket) return;
    try {
        _socket = io({
            transports: ['polling', 'websocket'],
            query: { uid: state.currentUser.id },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        _socket.on('connect', () => {
            _chatConnected = true;
            _chatMode = 'socket';
            stopPolling();
            console.log('Chat connected (Socket.IO), sid:', _socket.id);
            updateChatStatus('connected');
            _socket.emit('get_online');
        });

        _socket.on('connect_error', (err) => {
            _chatConnected = false;
            console.error('Chat connect error:', err.message);
            // 不立即切换到轮询，让 Socket.IO 自己重试
        });

        _socket.on('disconnect', () => {
            _chatConnected = false;
            updateChatStatus('disconnected');
        });

        _socket.on('new_message', (msg) => {
            // 只在群聊模式下追加消息
            if (_chatTab === 'group' && !_dmConvId) {
                appendChatMessage(msg, true);
            }
        });

        _socket.on('message_deleted', (data) => {
            const el = document.querySelector(`.chat-msg[data-id="${data.id}"]`);
            if (el) {
                el.style.transition = 'opacity .2s, transform .2s';
                el.style.opacity = '0';
                el.style.transform = 'scale(0.9)';
                setTimeout(() => el.remove(), 200);
            }
        });

        _socket.on('user_joined', (data) => {
            updateChatOnline(data.online_count);
            appendSystemMessage(data.user.username + ' 加入了聊天');
        });

        _socket.on('user_left', (data) => {
            updateChatOnline(data.online_count);
            appendSystemMessage(data.user.username + ' 离开了聊天');
        });

        _socket.on('online_update', (data) => {
            updateChatOnline(data.count);
            renderOnlineUsers(data.users);
        });

        _socket.on('dm_message', (msg) => {
            // 校验：只处理发给自己的消息
            if (msg.recipient_id && msg.recipient_id !== state.currentUser?.id) return;
            if (_dmConvId === msg.conversation_id) {
                // 只显示对方发的消息（自己发的已通过 HTTP 响应显示）
                if (msg.sender_id !== state.currentUser?.id) {
                    appendDmMessage(msg);
                }
            } else if (msg.sender_id !== state.currentUser?.id) {
                // 不在当前私聊窗口，发通知
                showToast(`${msg.username} 发来一条私聊消息`, 'info');
                // 浏览器通知
                if (Notification.permission === 'granted') {
                    new Notification('SoaringBird 论坛 - 私聊', { body: `${msg.username}: ${msg.content.substring(0, 50)}` });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
            }
        });

        // 通知推送
        _socket.on('notification', () => {
            updateNotifBadge();
        });

        // AI 回复推送：自动刷新帖子详情
        _socket.on('ai_reply', (data) => {
            if (state.currentPage === 'post' && state.currentPostId === data.post_id) {
                renderPostDetail();
            }
        });

        // 10 秒后如果还没连上，切换到轮询
        setTimeout(() => {
            if (!_chatConnected && _chatMode !== 'poll') {
                console.log('Socket.IO 连接超时，切换到 HTTP 轮询模式');
                if (_socket) { _socket.disconnect(); _socket = null; }
                startPolling();
            }
        }, 10000);

    } catch (e) {
        console.error('Socket connect error:', e);
        startPolling();
    }
}

function startPolling() {
    if (_chatMode === 'poll') return;
    _chatMode = 'poll';
    _chatConnected = true;
    updateChatStatus('polling');
    console.log('Chat mode: HTTP polling');
    // 优化模式下10秒轮询，正常3秒
    const pollMs = _perfMode ? 10000 : 3000;
    pollNewMessages();
    _pollTimer = setInterval(pollNewMessages, pollMs);
}

function stopPolling() {
    if (_pollTimer) {
        clearInterval(_pollTimer);
        _pollTimer = null;
    }
}

async function pollNewMessages() {
    try {
        const [msgData, onlineData] = await Promise.all([
            api('/api/chat/history'),
            api('/api/chat/online')
        ]);
        // 更新在线用户
        if (onlineData) {
            updateChatOnline(onlineData.count || 0);
            renderOnlineUsers(onlineData.users || []);
        }
        const container = document.getElementById('chatMessages');
        if (!container) return;
        // 只追加新消息（仅群聊模式）
        if (_chatTab !== 'group' || _dmConvId) return;
        const existingIds = new Set();
        container.querySelectorAll('.chat-msg').forEach(el => existingIds.add(el.dataset.id));
        let hasNew = false;
        for (const msg of msgData.messages) {
            if (!existingIds.has(msg.id)) {
                appendChatMessage(msg, true);
                hasNew = true;
            }
        }
        if (hasNew) {
            const wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            if (wasAtBottom) container.scrollTop = container.scrollHeight;
        }
    } catch (e) {
        console.error('Poll messages error:', e);
    }
}

function updateChatStatus(status) {
    const row = document.getElementById('chatOnlineRow');
    if (!row) return;
    const dot = row.querySelector('.chat-online-dot');
    const label = row.querySelector('.chat-online-label');
    if (status === 'connected') {
        if (dot) dot.style.background = 'var(--green)';
        if (label) label.textContent = label.textContent.replace(/ \(.*\)$/, '');
    } else if (status === 'polling') {
        if (dot) dot.style.background = 'var(--green)';
        if (label) label.textContent = label.textContent.replace(/ \(.*\)$/, '') + ' (轮询)';
    } else if (status === 'disconnected') {
        if (dot) dot.style.background = 'var(--text3)';
        if (label) label.textContent = label.textContent.replace(/ \(.*\)$/, '') + ' (断开)';
    }
}

function disconnectChat() {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
    stopPolling();
    _chatConnected = false;
    _chatMode = 'none';
}

async function loadChatHistory() {
    try {
        const data = await api('/api/chat/history');
        const container = document.getElementById('chatMessages');
        if (!container) return;
        container.innerHTML = '';
        data.messages.forEach(msg => appendChatMessage(msg));
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        console.error('Load chat history error:', e);
    }
}

function appendChatMessage(msg, animate) {
    // 只在群聊模式下显示群聊消息
    if (_chatTab !== 'group' || _dmConvId) return;
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const isMe = state.currentUser && msg.user_id === state.currentUser.id;
    const isAI = msg.user_id === 'ai_bot';
    const time = new Date(msg.created_at * 1000);
    const timeStr = time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0');

    const div = document.createElement('div');
    div.className = 'chat-msg' + (isMe ? ' chat-msg-me' : '') + (isAI ? ' chat-msg-ai' : '');
    div.dataset.id = msg.id || '';
    div.innerHTML = `
        <div class="chat-msg-avatar${isAI ? ' chat-ai-avatar' : ''}" style="${!isAI && msg.avatar ? 'background-image:url(' + msg.avatar + ');background-size:cover;background-position:center' : ''}">${isAI ? 'AI' : (msg.avatar ? '' : (msg.username || '?').charAt(0).toUpperCase())}</div>
        <div class="chat-msg-body">
            <div class="chat-msg-header">
                <span class="chat-msg-name${isAI ? ' chat-ai-name' : ''}">${escapeHtml(msg.username || '未知')}</span>
                <span class="chat-msg-time">${timeStr}</span>
            </div>
            <div class="chat-msg-text${isAI ? ' chat-ai-text' : ''}">${escapeHtml(filterText(msg.content))}</div>
        </div>
    `;
    container.appendChild(div);

    // 先强制布局，确保 getBoundingClientRect 准确
    container.offsetHeight;

    if (animate && isMe) {
        // iMessage 风格：蓝色气泡从输入框飞入消息列表
        const bubble = div.querySelector('.chat-msg-text');
        const inputArea = document.querySelector('.chat-input-area');
        if (bubble && inputArea) {
            const inputRect = inputArea.getBoundingClientRect();
            const bubbleRect = bubble.getBoundingClientRect();
            // 计算气泡需要从输入框位置移动的距离
            const offsetY = inputRect.top - bubbleRect.top + 10;

            // 初始：在输入框位置，缩小，透明
            bubble.style.willChange = 'transform, opacity';
            bubble.style.transition = 'none';
            bubble.style.transform = `translateY(${offsetY}px) scale(0.8)`;
            bubble.style.opacity = '0';
            bubble.style.borderRadius = '20px';

            // 等一帧再启动动画
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // iMessage 弹性曲线
                    bubble.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 0.2s ease-out';
                    bubble.style.transform = 'translateY(0) scale(1)';
                    bubble.style.opacity = '1';
                });
            });

            bubble.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'transform') return;
                bubble.style.willChange = '';
                bubble.style.transition = '';
                bubble.style.transform = '';
                bubble.style.opacity = '';
                bubble.removeEventListener('transitionend', handler);
            });
        }
    } else if (animate) {
        // 他人消息：从下方弹入
        const bubble = div.querySelector('.chat-msg-text');
        if (bubble) {
            bubble.style.willChange = 'transform, opacity';
            bubble.style.transition = 'none';
            bubble.style.transform = 'translateY(16px) scale(0.95)';
            bubble.style.opacity = '0';

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bubble.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.075), opacity 0.2s ease-out';
                    bubble.style.transform = 'translateY(0) scale(1)';
                    bubble.style.opacity = '1';
                });
            });

            bubble.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'transform') return;
                bubble.style.willChange = '';
                bubble.style.transition = '';
                bubble.style.transform = '';
                bubble.style.opacity = '';
                bubble.removeEventListener('transitionend', handler);
            });
        }
    }

    // 自动滚动到底部
    const wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (wasAtBottom || isMe) {
        container.scrollTop = container.scrollHeight;
    }

    // 右键/长按菜单
    const bubble = div.querySelector('.chat-msg-text');
    if (bubble) {
        bubble.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showChatMsgMenu(e, msg, isMe);
        });
        // 移动端长按
        let longPressTimer = null;
        bubble.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                e.preventDefault();
                showChatMsgMenu(e, msg, isMe);
            }, 500);
        }, { passive: false });
        bubble.addEventListener('touchend', () => clearTimeout(longPressTimer));
        bubble.addEventListener('touchmove', () => clearTimeout(longPressTimer));
    }
}

function showChatMsgMenu(e, msg, isMe) {
    // 移除已有菜单
    document.querySelectorAll('.chat-ctx-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'chat-ctx-menu';

    const isAdmin = state.currentUser && state.currentUser.is_admin;
    const items = [];

    if (isMe) {
        items.push({ label: '撤回', action: () => deleteChatMsg(msg.id, '撤回') });
    }
    if (isAdmin && !isMe) {
        items.push({ label: '删除消息', action: () => deleteChatMsg(msg.id, '删除'), danger: true });
    }
    if (items.length === 0) return;

    items.forEach(item => {
        const btn = document.createElement('div');
        btn.className = 'chat-ctx-item' + (item.danger ? ' chat-ctx-danger' : '');
        btn.textContent = item.label;
        btn.onclick = () => { menu.remove(); item.action(); };
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // 定位
    const rect = (e.target || e.touches?.[0]?.target)?.getBoundingClientRect();
    let x = (e.clientX || e.touches?.[0]?.clientX || 100);
    let y = (e.clientY || e.touches?.[0]?.clientY || 100);
    // 确保不超出屏幕
    const menuRect = menu.getBoundingClientRect();
    if (x + 120 > window.innerWidth) x = window.innerWidth - 130;
    if (y + menu.offsetHeight > window.innerHeight) y = y - menu.offsetHeight;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    // 点击其他地方关闭
    setTimeout(() => {
        const close = (ev) => { menu.remove(); document.removeEventListener('click', close); document.removeEventListener('touchstart', close); };
        document.addEventListener('click', close);
        document.addEventListener('touchstart', close);
    }, 10);
}

async function deleteChatMsg(msgId, type) {
    try {
        await api('/api/chat/delete/' + msgId, { method: 'DELETE' });
        const el = document.querySelector(`.chat-msg[data-id="${msgId}"]`);
        if (el) {
            el.style.transition = 'opacity .2s, transform .2s';
            el.style.opacity = '0';
            el.style.transform = 'scale(0.9)';
            setTimeout(() => el.remove(), 200);
        }
        if (type === '撤回') {
            appendSystemMessage('你撤回了一条消息');
        }
    } catch (e) {
        showToast('操作失败: ' + e.message, 'error');
    }
}

function appendSystemMessage(text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-system-msg';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    if (_dmConvId) { sendDmMessage(); return; }
    const input = document.getElementById('chatInput');
    if (!input) return;
    const content = input.value.trim();
    if (!content) return;

    // 如果包含@AI，先检查额度
    if (/@(?:AI|ai|Ai|aI|AI助手|ai助手|AI\s*Bird|ai\s*bird)/i.test(content)) {
        try {
            const quota = await api('/api/chat/ai-quota');
            if (!quota.ok) {
                showToast(`今日@AI次数已用完（${quota.limit}次/天）`, 'error');
                return;
            }
        } catch (e) { /* 忽略，继续发送 */ }
    }

    if (_chatMode === 'socket' && _socket && _chatConnected) {
        // WebSocket 模式：先本地显示带动画，再发送
        const tempMsg = {
            id: 'temp_' + Date.now(),
            user_id: state.currentUser.id,
            username: state.currentUser.username,
            avatar: state.currentUser.avatar || '',
            content: content,
            created_at: Date.now() / 1000
        };
        try { appendChatMessage(tempMsg, true); } catch (e) {}
        _socket.emit('send_message', { content });
        input.value = '';
        input.focus();
    } else if (_chatMode === 'poll' || _chatMode === 'none') {
        // HTTP 轮询/兜底发送：即使 socket 未建立连接，登录用户也可直接通过 HTTP 发送
        if (!state.currentUser) {
            showToast(t('login_required'), 'error');
            return;
        }
        // 若聊天仍未连接，自动进入轮询模式，保证后续能收到新消息
        if (_chatMode === 'none') {
            _chatMode = 'poll';
            _chatConnected = true;
            updateChatStatus('polling');
        }
        try {
            const msg = await api('/api/chat/send', {
                method: 'POST',
                body: { content }
            });
            appendChatMessage(msg, true);
            input.value = '';
            input.focus();
            const container = document.getElementById('chatMessages');
            if (container) container.scrollTop = container.scrollHeight;

            // 如果包含@AI，轮询等待AI回复
            if (/@(?:AI|ai)/i.test(content)) {
                _pollForAIReply(msg.id);
            }
        } catch (e) {
            showToast('发送失败: ' + e.message, 'error');
        }
    } else {
        showToast('聊天未连接，请稍后重试', 'error');
    }
}

// 轮询等待AI回复
function _pollForAIReply(afterMsgId) {
    let attempts = 0;
    const maxAttempts = 30; // 最多等30秒
    const interval = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
            clearInterval(interval);
            return;
        }
        try {
            const data = await api('/api/chat/history');
            const msgs = data.messages || [];
            // 找到AI回复（在用户消息之后、user_id为ai_bot的消息）
            const afterIdx = msgs.findIndex(m => m.id === afterMsgId);
            const aiMsg = msgs.find((m, i) => m.user_id === 'ai_bot' && (afterIdx === -1 || i > afterIdx));
            if (aiMsg) {
                // 检查是否已经显示过这条AI消息
                const existing = document.querySelector(`.chat-msg[data-id="${aiMsg.id}"]`);
                if (!existing) {
                    appendChatMessage(aiMsg, false);
                    const container = document.getElementById('chatMessages');
                    if (container) container.scrollTop = container.scrollHeight;
                }
                clearInterval(interval);
            }
        } catch (e) { /* 忽略 */ }
    }, 1000);
}

let _chatFullscreen = false;
function toggleChatFullscreen() {
    const panel = document.getElementById('chatPanel');
    const btn = document.getElementById('chatFullscreenBtn');
    if (!panel) return;
    _chatFullscreen = !_chatFullscreen;
    panel.classList.toggle('fullscreen', _chatFullscreen);
    if (btn) {
        btn.innerHTML = _chatFullscreen
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 14 4 20 10 20"/><polyline points="20 10 20 4 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    }
}

function toggleChat() {
    // 统一消息面板：兼容旧的 toggleChat 调用（私聊流程等）
    toggleMsgPanel();
}

function openChatPanel(panel, overlay, btn) {
    _chatOpen = true;
    panel.classList.add('open');
    overlay.classList.add('show');
    // 滚动到底部
    const container = document.getElementById('chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
    // 聚焦输入框
    setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) input.focus();
    }, 300);
}

function updateChatOnline(count) {
    const label = document.querySelector('.chat-online-label');
    if (label) label.textContent = count + ' 人在线' + (label.textContent.includes('(轮询)') ? ' (轮询)' : '');
}

function renderOnlineUsers(users) {
    const container = document.getElementById('chatOnlineUsers');
    if (!container) return;
    if (!users || users.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = '';
    container.innerHTML = users.map(u =>
        `<span class="chat-online-user" title="${escapeHtml(u.username)}">${u.avatar ? '<span class="chat-online-avatar" style="background-image:url(' + u.avatar + ');background-size:cover"></span>' : '<span class="chat-online-avatar">' + (u.username||'?').charAt(0).toUpperCase() + '</span>'}${escapeHtml(u.username)}</span>`
    ).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

/* ===== Bug 反馈 ===== */
async function submitBugReport() {
    const input = document.getElementById('bugReportInput');
    if (!input) return;
    const content = input.value.trim();
    if (!content) { showToast('请描述你遇到的 Bug', 'error'); return; }
    try {
        await api('/api/bug-reports', { method: 'POST', body: { content } });
        input.value = '';
        showToast('反馈已提交，感谢！', 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

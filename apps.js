/* ==========================================================================
   翱翔鸟 · 应用页交互
   · 滚动进场
   · 下载弹层：iOS 直链 / Android 走 Turnstile 验证
   · 导航 Tabs 随滚动高亮
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 滚动进场 ---------------- */
  function initReveal() {
    var items = document.querySelectorAll('.build-in');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('ready'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ready');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---------------- 导航项高亮（侧栏 + 移动端 Tabs 随滚动联动） ---------------- */
  function initTabs() {
    var links = document.querySelectorAll('.mobilenav__tabs a, .sidebar__item > a[href^="#"], .sidebar__item > a[href*="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    Array.prototype.forEach.call(links, function (a) {
      var id = (a.getAttribute('href') || '').split('#')[1];
      var sec = id && document.getElementById(id);
      if (sec) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var active = map[entry.target.id];
        if (!active) return;
        Array.prototype.forEach.call(links, function (a) {
          a.classList.remove('is-active');
          var li = a.parentElement;
          if (li && li.classList.contains('sidebar__item')) li.classList.remove('is-active');
        });
        active.classList.add('is-active');
        var li2 = active.parentElement;
        if (li2 && li2.classList.contains('sidebar__item')) li2.classList.add('is-active');
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      io.observe(document.getElementById(id));
    });
  }

  /* ---------------- 下载弹层 ---------------- */
  var sheet, tsRendered = false, tsToken = '', submitting = false;

  function openSheet(kind) {
    if (!sheet) return;
    sheet.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var target = kind === 'android'
      ? document.getElementById('dlAndroidBtn')
      : document.getElementById('dlIosBtn');
    if (target) target.scrollIntoView({ block: 'center' });
    if (kind === 'android') renderTurnstile();
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* Android：复用站点既有的人机验证 + 下载令牌接口 */
  function renderTurnstile() {
    if (tsRendered) return;
    var box = document.getElementById('tsBox');
    if (!box) return;
    fetch('/api/turnstile-site-key')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var key = d && d.site_key ? d.site_key : '';
        if (!key) { enableAndroid('下载 Android 包'); return; }
        waitTurnstile(function () {
          try {
            turnstile.render(box, {
              sitekey: key,
              theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'auto',
              callback: function (t) { tsToken = t || ''; enableAndroid('下载 Android 包'); }
            });
            tsRendered = true;
          } catch (e) {
            enableAndroid('下载 Android 包');
          }
        });
      })
      .catch(function () { enableAndroid('下载 Android 包'); });
  }

  function waitTurnstile(cb) {
    if (window.turnstile) { cb(); return; }
    var n = 0, t = setInterval(function () {
      n++;
      if (window.turnstile) { clearInterval(t); cb(); }
      else if (n > 60) { clearInterval(t); enableAndroid('下载 Android 包'); }
    }, 500);
  }

  function enableAndroid(label) {
    var b = document.getElementById('dlAndroidBtn');
    if (!b) return;
    b.disabled = false;
    b.textContent = label;
  }

  function setMsg(text, isError) {
    var el = document.getElementById('dlMsg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'dl-sheet__msg' + (isError ? ' is-error' : '');
  }

  function downloadAndroid() {
    if (submitting) return;
    submitting = true;
    var b = document.getElementById('dlAndroidBtn');
    b.disabled = true;
    b.textContent = '验证中…';
    setMsg('正在校验…');
    fetch('/api/download/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnstile_token: tsToken })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        submitting = false;
        b.disabled = false;
        b.textContent = '下载 Android 包';
        if (!res.ok || !res.data.download_url) {
          setMsg((res.data && res.data.error) || '验证失败，请重试', true);
          return;
        }
        setMsg('开始下载…');
        window.location.href = res.data.download_url;
      })
      .catch(function () {
        submitting = false;
        b.disabled = false;
        b.textContent = '下载 Android 包';
        setMsg('网络异常，请稍后重试', true);
      });
  }

  /* ---------------- Android 安装包信息（版本 / 大小，取自服务端版本接口） ---------------- */
  function initApkInfo() {
    var sizeEls = document.querySelectorAll('[data-apk-size]');
    var verEls = document.querySelectorAll('[data-apk-version]');
    if (!sizeEls.length && !verEls.length) return;
    fetch('/api/app/latest-version')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d) return;
        if (d.size) {
          var mb = (d.size / 1048576).toFixed(1) + ' MB';
          Array.prototype.forEach.call(sizeEls, function (el) { el.textContent = mb; });
        }
        if (d.version) {
          Array.prototype.forEach.call(verEls, function (el) { el.textContent = d.version; });
        }
      })
      .catch(function () {});
  }

  /* ---------------- 绑定 ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    sheet = document.getElementById('dlSheet');

    initReveal();
    initTabs();
    initApkInfo();

    document.addEventListener('click', function (e) {
      var dl = e.target.closest ? e.target.closest('[data-dl]') : null;
      if (dl) {
        e.preventDefault();
        openSheet(dl.getAttribute('data-dl'));
        return;
      }
      if (e.target.closest && e.target.closest('[data-close]')) closeSheet();
    });

    var androidBtn = document.getElementById('dlAndroidBtn');
    if (androidBtn) androidBtn.addEventListener('click', downloadAndroid);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
    });
  });
})();

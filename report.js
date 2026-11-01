/* ===== 举报功能（底部弹层） =====
 * 独立公共模块：供 live.html / peacenews.html 等不加载 app29.js 的页面使用。
 * 若页面已提供 window.openReportSheet（如 app29.js），本文件自动跳过，避免重复定义。
 */
(function () {
  if (typeof window.openReportSheet === 'function') return; // 已存在，跳过

  var REPORT_REASONS = ['垃圾广告', '色情低俗', '人身攻击', '违规/违法信息', '其他'];
  var _reportState = null; // { type, id, label }

  function _repEsc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function _repEnsureMarkup() {
    if (document.getElementById('reportOverlay')) return;
    var wrap = document.createElement('div');
    wrap.id = 'reportOverlay';
    wrap.innerHTML =
      '<div class="rep-scrim" onclick="closeReportSheet()"></div>' +
      '<div class="rep-panel" role="dialog" aria-modal="true">' +
        '<div class="rep-grab"></div>' +
        '<div class="rep-title">举报</div>' +
        '<div class="rep-sub" id="reportTargetLabel"></div>' +
        '<div class="rep-options" id="reportOptions"></div>' +
        '<div class="rep-custom-wrap"><textarea class="rep-custom" id="reportCustom" placeholder="补充举报原因（选填）" rows="2" maxlength="120"></textarea></div>' +
        '<button class="rep-submit" id="reportSubmit" onclick="submitReport()">提交举报</button>' +
        '<button class="rep-cancel" onclick="closeReportSheet()">取消</button>' +
        '<div class="rep-success" id="reportSuccess">' +
          '<div class="rep-spark"></div>' +
          '<div class="rep-success-title">已收到举报</div>' +
          '<div class="rep-success-sub">感谢你的反馈，我们会尽快审核处理。</div>' +
          '<button class="rep-done" onclick="closeReportSheet()">好</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
  }

  window.openReportSheet = function (type, id, label) {
    _repEnsureMarkup();
    _reportState = { type: type, id: id, label: label };
    var overlay = document.getElementById('reportOverlay');
    var sub = document.getElementById('reportTargetLabel');
    sub.textContent = label ? ('“' + (label.length > 22 ? label.slice(0, 22) + '…' : label) + '”') : '';
    var opts = document.getElementById('reportOptions');
    opts.innerHTML = REPORT_REASONS.map(function (r, i) {
      return '<button class="rep-opt" data-i="' + i + '" onclick="event.stopPropagation();selectReportReason(' + i + ')">' +
             '<span class="rep-opt-text">' + _repEsc(r) + '</span>' +
             '<span class="rep-opt-check">✓</span></button>';
    }).join('');
    overlay.classList.remove('success');
    Array.prototype.forEach.call(opts.querySelectorAll('.rep-opt'), function (b) { b.classList.remove('selected'); });
    var cEl = document.getElementById('reportCustom'); if (cEl) cEl.value = '';
    document.getElementById('reportSubmit').disabled = false;
    requestAnimationFrame(function () { overlay.classList.add('show'); });
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', _onRepEsc);
  };

  window.selectReportReason = function (i) {
    var overlay = document.getElementById('reportOverlay');
    Array.prototype.forEach.call(overlay.querySelectorAll('.rep-opt'), function (b, idx) {
      b.classList.toggle('selected', idx === i);
    });
  };

  function _close() {
    var overlay = document.getElementById('reportOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', _onRepEsc);
    _reportState = null;
  }
  window.closeReportSheet = _close;

  function _onRepEsc(e) { if (e.key === 'Escape') _close(); }

  function _repToast(msg, type) {
    if (typeof window.showToast === 'function') return window.showToast(msg, type);
    if (typeof window.toast === 'function') return window.toast(msg, type);
    // 兜底：简单 alert
    window.alert(msg);
  }

  window.submitReport = async function () {
    var overlay = document.getElementById('reportOverlay');
    var sel = overlay.querySelector('.rep-opt.selected');
    if (!sel) { _repToast('请选择举报原因', 'error'); return; }
    var reason = REPORT_REASONS[parseInt(sel.dataset.i, 10)] || '其他';
    var cEl = document.getElementById('reportCustom');
    var custom = cEl ? cEl.value.trim() : '';
    var fullReason = custom ? (reason === '其他' ? custom : reason + '：' + custom) : reason;
    var s = _reportState;
    if (!s) return;
    var btn = document.getElementById('reportSubmit');
    btn.disabled = true;
    try {
      var res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_type: s.type, target_id: s.id, reason: fullReason }),
      });
      var data = null;
      try { data = await res.json(); } catch (e) { /* ignore */ }
      if (!data || data.error) {
        if (data && data.error === '未登录') {
          _close();
          if (typeof window.requireLogin === 'function') { window.requireLogin(); return; }
          _repToast('请先登录', 'error');
          return;
        }
        _repToast((data && data.error) || '举报失败', 'error');
        _close();
        return;
      }
      // 成功 → 确认态
      overlay.classList.add('success');
      if (data.auto_removed) {
        var ss = document.getElementById('reportSuccess').querySelector('.rep-success-sub');
        ss.textContent = '该内容已被自动下架，我们会留存记录供管理员复核。';
      }
    } catch (e) {
      _repToast('网络异常，请稍后再试', 'error');
      _close();
    } finally {
      var b2 = document.getElementById('reportSubmit'); if (b2) b2.disabled = false;
    }
  };
})();
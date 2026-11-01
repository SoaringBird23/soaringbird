// SoaringBird 论坛 - 液态玻璃效果
// 基于 Snell's Law 折射 + SVG displacement map
// 高光由 CSS inset box-shadow 实现
(function () {
  'use strict';

  const svgNS = 'http://www.w3.org/2000/svg';

  /* ===== SDF 工具函数 ===== */
  function smoothStep(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function roundedRectSDF(x, y, halfW, halfH, r) {
    const qx = Math.abs(x) - halfW + r;
    const qy = Math.abs(y) - halfH + r;
    return Math.min(Math.max(qx, qy), 0) + len(Math.max(qx, 0), Math.max(qy, 0)) - r;
  }

  /* ===== 生成折射位移贴图 ===== */
  function generateDisplacementMap(width, height, cornerOverride) {
    const scale = Math.min(1, 512 / Math.max(width, height));
    const W = Math.round(width * scale) || 256;
    const H = Math.round(height * scale) || 256;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    const IOR = 1.8;
    const cornerR = (cornerOverride !== undefined ? cornerOverride : 16) / Math.min(width, height);
    const halfW = 0.5 - 1 / width;
    const halfH = 0.5 - 1 / height;

    // 宽高比极端的元素（如导航栏 width>>height），只做上下边缘折射
    const isWideBar = width / height > 6;

    // 边缘宽度：根据元素尺寸自适应，确保折射区域足够宽
    const minDim = Math.min(width, height);
    const edgeWidth = Math.max(0.08, Math.min(0.25, 20 / minDim));

    let maxScale = 0;
    const raw = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = x / W - 0.5;
        const v = y / H - 0.5;

        let offsetX, offsetY;

        if (isWideBar) {
          // 宽条元素：只用垂直 SDF 做上下边缘折射
          const dTop = v + halfH;
          const dBot = halfH - v;
          const edgeTop = smoothStep(edgeWidth, 0, dTop);
          const edgeBot = smoothStep(edgeWidth, 0, dBot);
          const refractTop = edgeTop * (IOR - 1) * 0.5;
          const refractBot = edgeBot * (IOR - 1) * 0.5;
          offsetX = 0;
          offsetY = refractTop - refractBot;
        } else {
          // 普通元素：分离水平/垂直边缘折射
          const d = roundedRectSDF(u, v, halfW, halfH, cornerR);
          const edgeDist = smoothStep(edgeWidth, 0, d);

          // 水平边缘（上下）：只在垂直方向折射
          const dTop = v + halfH;
          const dBot = halfH - v;
          const edgeTop = smoothStep(edgeWidth, 0, dTop);
          const edgeBot = smoothStep(edgeWidth, 0, dBot);
          const refractY = (edgeTop - edgeBot) * (IOR - 1) * 0.8;

          // 垂直边缘（左右）：只在水平方向折射
          const dLeft = u + halfW;
          const dRight = halfW - u;
          const edgeLeft = smoothStep(edgeWidth, 0, dLeft);
          const edgeRight = smoothStep(edgeWidth, 0, dRight);
          const refractX = (edgeLeft - edgeRight) * (IOR - 1) * 0.8;

          // 只在边缘区域折射，内部不折射
          offsetX = refractX * edgeDist;
          offsetY = refractY * edgeDist;
        }

        maxScale = Math.max(maxScale, Math.abs(offsetX), Math.abs(offsetY));
        raw.push(offsetX, offsetY);
      }
    }

    maxScale = Math.max(maxScale, 0.001);
    let idx = 0;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = (raw[idx++] / maxScale * 0.5 + 0.5) * 255;
      data[i + 1] = (raw[idx++] / maxScale * 0.5 + 0.5) * 255;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /* ===== SVG 滤镜管理 ===== */
  let filterCount = 0;
  let svgDefs = null;

  function createRefractionFilter(w, h, cornerOverride, dispScale) {
    const id = 'lgf-' + (filterCount++);
    const mapURL = generateDisplacementMap(w, h, cornerOverride);

    // 位移余量：边缘折射采样可能越界，filter区域需要比元素大
    // 底部和右侧需要更多余量
    const ds = dispScale || 24;
    const padL = Math.ceil(ds * 0.6);
    const padR = Math.ceil(ds * 0.8);
    const padT = Math.ceil(ds * 0.6);
    const padB = Math.ceil(ds * 1.2);

    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('colorInterpolationFilters', 'sRGB');
    filter.setAttribute('x', String(-padL));
    filter.setAttribute('y', String(-padT));
    filter.setAttribute('width', String(w + padL + padR));
    filter.setAttribute('height', String(h + padT + padB));

    const feImage = document.createElementNS(svgNS, 'feImage');
    feImage.setAttribute('x', String(-padL));
    feImage.setAttribute('y', String(-padT));
    feImage.setAttribute('width', String(w + padL + padR));
    feImage.setAttribute('height', String(h + padT + padB));
    feImage.setAttribute('preserveAspectRatio', 'none');
    feImage.setAttribute('result', 'dispMap');
    feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', mapURL);

    const feDisplace = document.createElementNS(svgNS, 'feDisplacementMap');
    feDisplace.setAttribute('in', 'SourceGraphic');
    feDisplace.setAttribute('in2', 'dispMap');
    feDisplace.setAttribute('xChannelSelector', 'R');
    feDisplace.setAttribute('yChannelSelector', 'G');
    feDisplace.setAttribute('scale', String(ds));

    filter.appendChild(feImage);
    filter.appendChild(feDisplace);
    svgDefs.appendChild(filter);
    return id;
  }

  /* ===== 应用液态玻璃 ===== */
  function applyLiquidGlass() {
    if (!document.body.classList.contains('lg-enabled')) return;

    applyItems([
      { sel: '.nav-bar', blur: 2, cornerR: 4 },
      { sel: '.dropdown', blur: 2, cornerR: 20 },
      { sel: '.filter-menu', blur: 2, cornerR: 20 },
      { sel: '.modal', blur: 2, cornerR: 32 },
      { sel: '.toast', blur: 2, cornerR: 20 },
      { sel: '.post-card', blur: 3, cornerR: 26 },
      { sel: '.reply-card', blur: 3, cornerR: 20 },
      { sel: '.detail-card', blur: 3, cornerR: 26 },
      { sel: '.sg', blur: 2, cornerR: 20 },
      { sel: '.profile-header', blur: 3, cornerR: 26 },
      { sel: '.reply-compose', blur: 3, cornerR: 20 },
      { sel: '.hero-search', blur: 2, cornerR: 980 },
      { sel: '.lang-seg-btn', blur: 1, cornerR: 980 },
      { sel: '.hamburger', blur: 1, cornerR: 14 },
      { sel: '.back-btn', blur: 1, cornerR: 14 },
      { sel: '.empty-state', blur: 1, cornerR: 26 },
      // 全局元素
      { sel: '.chat-panel', blur: 2, cornerR: 0 },
      { sel: '.chat-header', blur: 2, cornerR: 0 },
      { sel: '.chat-input-area', blur: 2, cornerR: 0 },
      { sel: '.chat-ctx-menu', blur: 2, cornerR: 14 },
      { sel: '.notif-panel', blur: 2, cornerR: 32 },
      { sel: '.splash-card', blur: 2, cornerR: 32 },
      { sel: '.chat-rules-modal', blur: 2, cornerR: 32 },
      { sel: '.dm-conv-item', blur: 1, cornerR: 14 },
      { sel: '.skeleton-card', blur: 1, cornerR: 20 },
      { sel: '.btn-primary', blur: 1, cornerR: 980 },
      { sel: '.btn-ghost', blur: 1, cornerR: 980 },
      { sel: '.btn-follow', blur: 1, cornerR: 980 },
      { sel: '.btn-dm', blur: 1, cornerR: 980 },
      { sel: '.post-card-category', blur: 1, cornerR: 14 },
      { sel: '.post-card-tag', blur: 1, cornerR: 14 },
    ]);

    applyItems(items);
  }

  /* ===== 批量应用折射 ===== */
  function applyItems(items) {
    try {
      items.forEach(({ sel, blur, cornerR }) => {
        document.querySelectorAll(sel).forEach(el => {
          if (el._lgApplied) return;

          const rect = el.getBoundingClientRect();
          const w = Math.ceil(rect.width);
          const h = Math.ceil(rect.height);
          // 跳过不可见元素（display:none 或尺寸为0）
          if (!w || !h) return;

          el._lgApplied = true;

          const minDim = Math.min(w, h);
          const dynamicScale = Math.max(20, Math.min(40, Math.round(28 * minDim / 150)));
          const filterId = createRefractionFilter(w, h, cornerR, dynamicScale);

          const blurStr = blur > 0 ? `blur(${blur}px) ` : '';
          const filterStr = `url(#${filterId}) ${blurStr}saturate(140%) brightness(1.01)`;
          el.style.backdropFilter = filterStr;
          el.style.webkitBackdropFilter = filterStr;
          el.classList.add('lg');
        });
      });
    } catch (e) {
      console.warn('LiquidGlass:', e);
    }
  }

  /* ===== 初始化 ===== */
  function init() {
    window.initLiquidGlass = init;
    window.reapplyLiquidGlass = applyLiquidGlass;

    // SVG defs 始终创建（AI窗口折射需要）
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-1';
    svgDefs = document.createElementNS(svgNS, 'defs');
    svg.appendChild(svgDefs);
    document.body.appendChild(svg);

    // MutationObserver 始终监听（AI窗口动态出现时需要应用折射）
    let pending = false;
    const observer = new MutationObserver(() => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          applyLiquidGlass();
          pending = false;
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    // 始终初始应用一次（确保AI窗口折射生效）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyLiquidGlass();
      });
    });

    if (localStorage.getItem('bird_liquid_glass') !== '1') return;

    document.body.classList.add('lg-enabled');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

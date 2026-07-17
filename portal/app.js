// Portal application logic. Plain JS, no build step, no framework.
//
// Data flow: fetch portal/prototypes.generated.json (produced by
// scripts/generate-portal.mjs) and render everything client-side. Filter
// state lives in the URL hash so views are shareable and survive a reload
// without needing any server-side routing (important on GitHub Pages).

import { resolveRepoInfo } from './repo-info.js';

(function () {
  'use strict';

  // Only used when the page is not served from *.github.io (e.g. local
  // preview via `npm run serve`, or a custom domain). On github.io this is
  // derived automatically from location — see resolveRepoInfo().
  const FALLBACK_REPO = { owner: 'HyperBDR', name: 'product-prototypes', branch: 'main' };

  const STATUS_LABELS = { draft: 'Draft', review: 'In Review', approved: 'Approved', archived: 'Archived' };
  const DEFAULT_STATUSES = ['draft', 'review', 'approved'];
  const ALL_STATUSES = ['draft', 'review', 'approved', 'archived'];
  const PLACEHOLDER_COLORS = ['#2f5fdc', '#7c3aed', '#0891b2', '#c2410c', '#be123c', '#15803d'];

  const state = {
    products: [],
    prototypes: [],
    generatedAt: null,
    filters: {
      product: null,
      statuses: new Set(DEFAULT_STATUSES),
      query: '',
    },
  };

  const els = {
    productGrid: document.getElementById('product-grid'),
    prototypeGrid: document.getElementById('prototype-grid'),
    prototypeHeading: document.getElementById('prototype-heading'),
    prototypeCountLabel: document.getElementById('prototype-count-label'),
    emptyState: document.getElementById('empty-state'),
    searchInput: document.getElementById('search-input'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    loadError: document.getElementById('load-error'),
    loadErrorDetail: document.getElementById('load-error-detail'),
    githubLink: document.getElementById('github-link'),
    generatedAt: document.getElementById('generated-at'),
    chips: Array.from(document.querySelectorAll('.chip')),
  };

  // ---------- Repo info (drives "View source" links; see section VIII.3) ----------

  const repoInfo = resolveRepoInfo(location.hostname, location.pathname, FALLBACK_REPO);
  const repoUrl = `https://github.com/${repoInfo.owner}/${repoInfo.name}`;
  els.githubLink.href = repoUrl;

  function sourceUrlFor(sourcePath) {
    return `${repoUrl}/tree/${repoInfo.branch}/${sourcePath}`;
  }

  // ---------- URL hash <-> filter state ----------
  // Hash format: #product=<id>&status=draft,review&q=term
  // Chosen over the History API because it needs no server fallback route,
  // which keeps a reload/direct-link working on plain GitHub Pages hosting.

  function readHash() {
    const raw = location.hash.replace(/^#/, '');
    const params = new URLSearchParams(raw);
    const product = params.get('product') || null;
    const statusParam = params.get('status');
    const statuses = statusParam ? new Set(statusParam.split(',').filter(Boolean)) : new Set(DEFAULT_STATUSES);
    const query = params.get('q') || '';
    return { product, statuses, query };
  }

  function writeHash() {
    const params = new URLSearchParams();
    if (state.filters.product) params.set('product', state.filters.product);
    const statuses = Array.from(state.filters.statuses);
    if (statuses.length && statuses.join(',') !== DEFAULT_STATUSES.join(',')) {
      params.set('status', statuses.join(','));
    }
    if (state.filters.query) params.set('q', state.filters.query);
    const next = params.toString();
    const newHash = next ? `#${next}` : '';
    if (location.hash !== newHash) {
      history.replaceState(null, '', newHash || location.pathname + location.search);
    }
  }

  window.addEventListener('hashchange', () => {
    const parsed = readHash();
    state.filters.product = parsed.product;
    state.filters.statuses = parsed.statuses;
    state.filters.query = parsed.query;
    els.searchInput.value = parsed.query;
    syncChips();
    render();
  });

  // ---------- Placeholder thumbnails ----------

  function colorForId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
  }

  function initialsFor(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  function buildThumbnailEl(prototype) {
    if (prototype.thumbnail) {
      const img = document.createElement('img');
      img.className = 'thumb';
      img.src = prototype.thumbnail;
      img.alt = `${prototype.name} thumbnail`;
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.replaceWith(buildPlaceholderEl(prototype));
      });
      return img;
    }
    return buildPlaceholderEl(prototype);
  }

  function buildPlaceholderEl(prototype) {
    const div = document.createElement('div');
    div.className = 'thumb-placeholder';
    div.style.background = colorForId(prototype.productId + '/' + prototype.id);
    const initials = document.createElement('div');
    initials.className = 'initials';
    initials.textContent = initialsFor(prototype.name);
    const name = document.createElement('div');
    name.className = 'ph-name';
    name.textContent = prototype.productName;
    div.append(initials, name);
    return div;
  }

  // ---------- Rendering ----------

  function formatDate(iso) {
    if (!iso) return 'Unknown';
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  function matchesFilters(prototype) {
    if (state.filters.product && prototype.productId !== state.filters.product) return false;
    if (!state.filters.statuses.has(prototype.status)) return false;
    const q = state.filters.query.trim().toLowerCase();
    if (q) {
      const haystack = [prototype.name, prototype.description, ...(prototype.tags || [])]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }

  function renderProducts() {
    els.productGrid.innerHTML = '';
    const visibleProducts = state.products.filter((p) => p.visible !== false);

    if (visibleProducts.length === 0) {
      els.productGrid.innerHTML = '<p class="section-sub">No products found.</p>';
      return;
    }

    for (const product of visibleProducts) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'product-card' + (state.filters.product === product.id ? ' is-active' : '');
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-pressed', String(state.filters.product === product.id));

      const counts = product.statusCounts || {};
      card.innerHTML = `
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description || '')}</p>
        <div class="product-stats">
          <span class="stat-pill">${product.prototypeCount || 0} total</span>
          <span class="stat-pill">${counts.draft || 0} draft</span>
          <span class="stat-pill">${counts.review || 0} review</span>
          <span class="stat-pill">${counts.approved || 0} approved</span>
        </div>
        <div class="product-meta">
          <span>Updated ${escapeHtml(formatDate(product.latestUpdatedAt))}</span>
          <span class="view-link">View prototypes →</span>
        </div>
      `;
      card.addEventListener('click', () => {
        state.filters.product = state.filters.product === product.id ? null : product.id;
        writeHash();
        render();
        document.getElementById('prototype-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      els.productGrid.appendChild(card);
    }
  }

  function renderPrototypeCard(prototype) {
    const card = document.createElement('div');
    card.className = 'prototype-card';
    card.setAttribute('role', 'listitem');

    const body = document.createElement('div');
    body.className = 'prototype-body';
    body.innerHTML = `
      <div class="prototype-top-row">
        <div>
          <div class="product-tag">${escapeHtml(prototype.productName)}</div>
          <h3>${escapeHtml(prototype.name)}</h3>
        </div>
        <span class="status-badge status-${prototype.status}">${STATUS_LABELS[prototype.status] || prototype.status}</span>
      </div>
      <p class="prototype-desc">${escapeHtml(prototype.description || '')}</p>
      <div class="tag-list">${(prototype.tags || []).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="prototype-meta-row">
        <span>${escapeHtml(prototype.owner || 'Unassigned')}</span>
        <span>${escapeHtml(formatDate(prototype.updatedAt))}</span>
      </div>
      <div class="prototype-actions">
        <a class="action-open" href="${encodeURI(prototype.url)}" target="_blank" rel="noopener noreferrer">Open prototype</a>
        <a class="action-source" href="${sourceUrlFor(prototype.sourcePath)}" target="_blank" rel="noopener noreferrer">View source</a>
      </div>
    `;

    card.appendChild(buildThumbnailEl(prototype));
    card.appendChild(body);
    return card;
  }

  function renderPrototypes() {
    const filtered = state.prototypes
      .filter((p) => p.visible !== false)
      .filter(matchesFilters)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    els.prototypeGrid.innerHTML = '';

    const activeProduct = state.filters.product
      ? state.products.find((p) => p.id === state.filters.product)
      : null;
    els.prototypeHeading.textContent = activeProduct ? `${activeProduct.name} Prototypes` : 'All Prototypes';
    els.prototypeCountLabel.textContent = `${filtered.length} prototype${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      els.emptyState.hidden = false;
      els.prototypeGrid.hidden = true;
      const hasAnyForProduct = activeProduct ? activeProduct.prototypeCount > 0 : state.prototypes.length > 0;
      if (!hasAnyForProduct) {
        els.emptyState.innerHTML = `
          <h3>No prototypes yet</h3>
          <p>Add one with <code>npm run create -- --product ${escapeHtml(state.filters.product || '&lt;product-id&gt;')} --id my-prototype --name "My Prototype"</code>, then run <code>npm run validate &amp;&amp; npm run generate</code>.</p>
        `;
      } else {
        els.emptyState.innerHTML = `
          <h3>No prototypes match your filters</h3>
          <p>Try clearing the search box or enabling more statuses.</p>
        `;
      }
      return;
    }

    els.emptyState.hidden = true;
    els.prototypeGrid.hidden = false;
    for (const prototype of filtered) {
      els.prototypeGrid.appendChild(renderPrototypeCard(prototype));
    }
  }

  function render() {
    renderProducts();
    renderPrototypes();
  }

  function syncChips() {
    for (const chip of els.chips) {
      const status = chip.dataset.status;
      const active = state.filters.statuses.has(status);
      chip.setAttribute('aria-pressed', String(active));
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  // ---------- Wiring ----------

  els.searchInput.addEventListener('input', () => {
    state.filters.query = els.searchInput.value;
    writeHash();
    renderPrototypes();
  });

  for (const chip of els.chips) {
    chip.addEventListener('click', () => {
      const status = chip.dataset.status;
      if (state.filters.statuses.has(status)) {
        state.filters.statuses.delete(status);
      } else {
        state.filters.statuses.add(status);
      }
      syncChips();
      writeHash();
      renderPrototypes();
    });
  }

  els.clearFiltersBtn.addEventListener('click', () => {
    state.filters.product = null;
    state.filters.statuses = new Set(DEFAULT_STATUSES);
    state.filters.query = '';
    els.searchInput.value = '';
    syncChips();
    writeHash();
    render();
  });

  // ---------- Boot ----------

  async function boot() {
    const initial = readHash();
    state.filters.product = initial.product;
    state.filters.statuses = initial.statuses;
    state.filters.query = initial.query;
    els.searchInput.value = initial.query;
    syncChips();

    try {
      const res = await fetch('portal/prototypes.generated.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const manifest = await res.json();
      state.products = Array.isArray(manifest.products) ? manifest.products : [];
      state.prototypes = Array.isArray(manifest.prototypes) ? manifest.prototypes : [];
      state.generatedAt = manifest.generatedAt || null;
      els.generatedAt.textContent = formatDate(state.generatedAt);
      render();
    } catch (err) {
      console.error('[portal] failed to load portal/prototypes.generated.json:', err);
      els.loadError.hidden = false;
      els.loadErrorDetail.textContent = String(err.message || err);
      els.prototypeGrid.hidden = true;
      els.emptyState.hidden = true;
    }
  }

  boot();
})();

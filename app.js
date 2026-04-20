const CATS = ['All','Router','Gateway','Switch','Energy Meter','Other'];
const PAGE_SIZE = 12;
let PRODUCTS = [];
let viewMode = 'grid';
let activeCat = 'All';
let compareSet = new Set();
let currentPage = 1;

function catBadgeClass(c) {
  return {Router:'b-router',Gateway:'b-gateway',Switch:'b-switch','Energy Meter':'b-energy',Other:'b-other'}[c]||'b-other';
}

function wifiLabel(w) {
  return {WiFi6:'Wi-Fi 6',WiFi5:'Wi-Fi 5',WiFi24:'Wi-Fi 2.4 GHz',none:'—'}[w]||w;
}

function getFiltered() {
  const q = (document.getElementById('search').value||'').toLowerCase().trim();
  const fCell = document.getElementById('fCell').value;
  const fWifi = document.getElementById('fWifi').value;
  const fPorts = document.getElementById('fPorts').value;
  const fSerial = document.getElementById('fSerial').value;
  return PRODUCTS.filter(p => {
    if (activeCat !== 'All' && p.cat !== activeCat) return false;
    if (q && !p.name.toLowerCase().includes(q) && !p.desc.toLowerCase().includes(q) && !p.cat.toLowerCase().includes(q) && !p.cpu.toLowerCase().includes(q)) return false;
    if (fCell === '5G' && p.cellular_gen !== '5G') return false;
    if (fCell === '4G' && p.cellular_gen !== '4G') return false;
    if (fCell === 'none' && p.cellular_gen !== 'none') return false;
    if (fWifi === 'WiFi6' && p.wifi !== 'WiFi6') return false;
    if (fWifi === 'WiFi5' && p.wifi !== 'WiFi5') return false;
    if (fWifi === 'WiFi24' && p.wifi !== 'WiFi24') return false;
    if (fWifi === 'none' && p.wifi !== 'none') return false;
    if (fPorts === '2' && p.ports > 2) return false;
    if (fPorts === '5' && (p.ports < 3 || p.ports > 5)) return false;
    if (fPorts === '8' && (p.ports < 6 || p.ports > 8)) return false;
    if (fPorts === '10' && p.ports < 9) return false;
    if (fSerial === 'rs485' && !p.rs485) return false;
    if (fSerial === 'rs232' && !p.rs232) return false;
    if (fSerial === 'both' && !(p.rs485 && p.rs232)) return false;
    return true;
  });
}

function hasActiveFilters() {
  return document.getElementById('search').value || document.getElementById('fCell').value ||
    document.getElementById('fWifi').value || document.getElementById('fPorts').value ||
    document.getElementById('fSerial').value || activeCat !== 'All';
}

function buildCatTabs() {
  const tabs = document.getElementById('catTabs');
  const counts = {};
  CATS.forEach(c => { counts[c] = c === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c).length; });
  tabs.innerHTML = CATS.map(c => `
    <button class="cat-tab ${activeCat===c?'active':''}" onclick="setCat('${c}')">
      ${c} <span class="count">${counts[c]}</span>
    </button>
  `).join('');
}

function setCat(c) { activeCat = c; currentPage = 1; render(); }

function render() {
  const list = getFiltered();
  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  document.getElementById('statFiltered').textContent = list.length;
  const rc = document.getElementById('resultsCount');
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, list.length);
  rc.innerHTML = list.length
    ? `Showing <strong>${start}–${end}</strong> of <strong>${list.length}</strong> products`
    : `<strong>0</strong> products found`;
  document.getElementById('clearBtn').style.display = hasActiveFilters() ? 'inline' : 'none';
  buildCatTabs();
  ['fCell','fWifi','fPorts','fSerial'].forEach(id => {
    const el = document.getElementById(id);
    el.className = el.value ? 'active-filter' : '';
  });
  const r = document.getElementById('results');
  if (!list.length) {
    r.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6"/></svg>
      <h3>No products found</h3>
      <p>Try adjusting your search or filters above.</p>
    </div>`;
    renderPagination(0, 0);
    return;
  }
  const page = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  if (viewMode === 'grid') renderGrid(page, r);
  else renderList(page, r);
  renderPagination(totalPages, list.length);
  updateCompareTray();
}

function renderPagination(totalPages, total) {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const maxVisible = 5;
  let pages = [];
  if (totalPages <= maxVisible + 2) {
    pages = Array.from({length: totalPages}, (_, i) => i + 1);
  } else {
    pages = [1];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 3) { start = 2; end = Math.min(totalPages - 1, maxVisible); }
    if (currentPage >= totalPages - 2) { start = Math.max(2, totalPages - maxVisible + 1); end = totalPages - 1; }
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
  }

  el.innerHTML = `
    <div class="pagination">
      <button class="pg-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      ${pages.map(p => p === '…'
        ? `<span class="pg-ellipsis">…</span>`
        : `<button class="pg-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`
      ).join('')}
      <button class="pg-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  `;
}

function goPage(p) {
  currentPage = p;
  render();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderGrid(list, r) {
  r.className = 'grid-view';
  r.innerHTML = list.map(p => `
    <div class="card ${compareSet.has(p.id)?'compare-selected':''}">
      <span class="badge ${catBadgeClass(p.cat)}">${p.cat}</span>
      <div class="card-name">${p.name}</div>
      <div class="card-desc">${p.desc}</div>
      <div class="card-specs">
        ${p.cellular_gen!=='none'?`<span class="spec-pill highlight">${p.cellular_gen}</span>`:''}
        ${p.wifi!=='none'?`<span class="spec-pill highlight">${wifiLabel(p.wifi)}</span>`:''}
        ${p.rs485?'<span class="spec-pill warn">RS485</span>':''}
        ${p.rs232?'<span class="spec-pill warn">RS232</span>':''}
        ${p.ports>0?`<span class="spec-pill">${p.ports} ports</span>`:''}
        ${p.ip?`<span class="spec-pill">${p.ip}</span>`:''}
      </div>
      <div class="card-footer">
        <label class="compare-check" onclick="event.stopPropagation()">
          <input type="checkbox" ${compareSet.has(p.id)?'checked':''} onchange="toggleCompare('${p.id}',this.checked)"> Compare
        </label>
        <span class="details-link" onclick="openDetail('${p.id}')">Details →</span>
      </div>
    </div>
  `).join('');
}

function renderList(list, r) {
  r.className = 'list-view';
  r.innerHTML = `<div class="list-head">
    <span>Model</span><span>Description</span>
    <span style="text-align:center">Cellular</span>
    <span style="text-align:center">Wi-Fi</span>
    <span style="text-align:center">RS485</span>
    <span style="text-align:center">Ports</span>
    <span style="text-align:center">Compare</span>
  </div>` + list.map(p => `
    <div class="list-row ${compareSet.has(p.id)?'compare-selected':''}" onclick="openDetail('${p.id}')">
      <div>
        <div class="list-name">${p.name}</div>
        <div class="list-cat"><span class="badge ${catBadgeClass(p.cat)}">${p.cat}</span></div>
      </div>
      <div class="list-desc">${p.desc}</div>
      <div class="list-cell">${p.cellular_gen!=='none'?`<span class="yes-pill">${p.cellular_gen}</span>`:'<span class="no-pill">—</span>'}</div>
      <div class="list-cell">${p.wifi!=='none'?`<span class="yes-pill">${wifiLabel(p.wifi)}</span>`:'<span class="no-pill">—</span>'}</div>
      <div class="list-cell">${p.rs485?'<span class="yes-pill">Yes</span>':'<span class="no-pill">—</span>'}</div>
      <div class="list-cell">${p.ports>0?p.ports:'—'}</div>
      <div class="list-cell" onclick="event.stopPropagation()">
        <input type="checkbox" style="width:14px;height:14px;accent-color:#1A6FC4;cursor:pointer" ${compareSet.has(p.id)?'checked':''} onchange="toggleCompare('${p.id}',this.checked)">
      </div>
    </div>
  `).join('');
}

function setView(v) {
  viewMode = v;
  document.getElementById('btnGrid').classList.toggle('active', v==='grid');
  document.getElementById('btnList').classList.toggle('active', v==='list');
  render();
}

function clearFilters() {
  document.getElementById('search').value = '';
  document.getElementById('fCell').value = '';
  document.getElementById('fWifi').value = '';
  document.getElementById('fPorts').value = '';
  document.getElementById('fSerial').value = '';
  activeCat = 'All';
  currentPage = 1;
  render();
}

function toggleCompare(id, checked) {
  if (checked) {
    if (compareSet.size >= 3) { alert('You can compare up to 3 products at a time.'); return; }
    compareSet.add(id);
  } else {
    compareSet.delete(id);
  }
  render();
}

function updateCompareTray() {
  const tray = document.getElementById('compareTray');
  const chips = document.getElementById('trayChips');
  if (compareSet.size === 0) { tray.classList.remove('visible'); return; }
  tray.classList.add('visible');
  const sel = PRODUCTS.filter(p => compareSet.has(p.id));
  chips.innerHTML = sel.map(p => `
    <div class="compare-chip">${p.name}
      <button onclick="toggleCompare('${p.id}',false)" title="Remove">×</button>
    </div>
  `).join('');
}

function clearCompare() { compareSet.clear(); render(); }

function buildVariantsTable(v) {
  if (!v || !v.headers || !v.rows) return '';
  const noteHtml = v.note ? `<div class="variants-note">${v.note}</div>` : '';
  const lastIdx = v.headers.length - 1;
  const thead = `<tr>${v.headers.map((h, i) => `<th${i === lastIdx ? ' class="col-partno"' : ''}>${h}</th>`).join('')}</tr>`;
  const tbody = v.rows.map(row =>
    `<tr>${row.map((cell, i) => {
      const cls = i === lastIdx ? ' class="cell-partno"' : cell === '✓' ? ' class="cell-yes"' : cell === '—' ? ' class="cell-no"' : '';
      return `<td${cls}>${cell}</td>`;
    }).join('')}</tr>`
  ).join('');
  return `
    <div class="spec-section variants-section">
      <div class="spec-section-title">Product Variants</div>
      ${noteHtml}
      <div class="variants-table-wrap">
        <table class="variants-table">
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    </div>`;
}

function openDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-close-bar">
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-header">
          <span class="badge ${catBadgeClass(p.cat)}">${p.cat}</span>
          <div class="modal-title">${p.name}</div>
          <div class="modal-desc">${p.desc}</div>
        </div>
        <div class="modal-body">
          <div class="spec-section">
            <div class="spec-section-title">Connectivity</div>
            ${srow('Cellular',p.cellular_gen==='none'?'None':p.cell)}
            ${srow('Wi-Fi',wifiLabel(p.wifi))}
            ${srow('Ethernet ports',p.ports>0?p.ports+' ports':'N/A')}
            ${srow('RS485',p.rs485?'Yes':'No')}
            ${srow('RS232',p.rs232?'Yes':'No')}
          </div>
          <div class="spec-section">
            <div class="spec-section-title">Hardware</div>
            ${srow('CPU',p.cpu)}
            ${srow('RAM',p.ram||'—')}
            ${srow('Storage',p.storage||'—')}
            ${srow('Power input',p.power)}
            ${srow('IP / Housing',p.ip||'Not specified')}
            ${srow('Enclosure',p.housing)}
            ${srow('Dimensions',p.dims||'—')}
            ${srow('Weight',p.weight||'—')}
            ${srow('Operating temp',p.op_temp||'—')}
          </div>
          ${p.os&&p.os!=='—'?`<div class="spec-section"><div class="spec-section-title">Software</div>${srow('Operating system',p.os)}</div>`:''}
          ${buildVariantsTable(p.variants)}
        </div>
        <div class="modal-actions">
          <a class="btn-enquire" href="mailto:sales@invendis.com?subject=Enquiry: ${encodeURIComponent(p.name)}&body=Hi Invendis team,%0A%0AI would like to enquire about the ${encodeURIComponent(p.name)}.%0A%0APlease send me more details.%0A%0AThank you.">Enquire about this product</a>
          <button class="btn-add-compare" onclick="toggleCompare('${p.id}',${!compareSet.has(p.id)});this.textContent=compareSet.has('${p.id}')?'Added to compare':'+ Compare'">
            ${compareSet.has(p.id)?'Added to compare':'+ Compare'}
          </button>
        </div>
      </div>
    </div>`;
}

function srow(k,v) {
  return `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`;
}

function openCompareModal() {
  const sel = PRODUCTS.filter(p => compareSet.has(p.id));
  if (sel.length < 2) { alert('Please select at least 2 products to compare.'); return; }
  const fields = [
    ['Category','cat'],['CPU','cpu'],['RAM','ram'],['Cellular','cellular_gen'],
    ['Wi-Fi',null],['Ethernet ports',null],['Power input','power'],
    ['RS485','rs485'],['RS232','rs232'],['IP rating','ip'],['Enclosure','housing'],
    ['Dimensions','dims'],['Weight','weight'],['Operating temp','op_temp'],['OS','os']
  ];
  function val(p, key) {
    if (!key) return '—';
    if (key==='rs485'||key==='rs232') return p[key]?'Yes':'No';
    return p[key]||'—';
  }
  const rows = fields.map(([label,key]) => {
    const vals = sel.map(p => {
      if (!key) {
        if (label==='Wi-Fi') return wifiLabel(p.wifi);
        if (label==='Ethernet ports') return p.ports>0?p.ports+' ports':'N/A';
      }
      return val(p, key);
    });
    const allSame = vals.every(v => v === vals[0]);
    return `<tr class="${!allSame?'diff-row':''}">
      <td>${label}</td>
      ${sel.map((_,i) => `<td>${vals[i]}</td>`).join('')}
    </tr>`;
  }).join('');

  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal compare-modal">
        <div class="modal-close-bar">
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-header">
          <div class="modal-title">Product comparison</div>
          <div class="modal-desc">Rows highlighted in yellow have differing values between products.</div>
        </div>
        <div class="modal-body" style="padding:0;overflow-x:auto">
          <table class="compare-table">
            <thead><tr>
              <th>Specification</th>
              ${sel.map(p=>`<th><span class="badge ${catBadgeClass(p.cat)}" style="margin-bottom:4px;display:inline-block">${p.cat}</span><br>${p.name}</th>`).join('')}
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="modal-actions">
          <a class="btn-enquire" href="mailto:sales@invendis.com?subject=Enquiry: ${encodeURIComponent(sel.map(p=>p.name).join(', '))}">Enquire about these products</a>
          <button class="btn-add-compare" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>`;
}

function closeModal() { document.getElementById('modalRoot').innerHTML = ''; }

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

PRODUCTS = PRODUCTS_DATA;
document.getElementById('statTotal').textContent = PRODUCTS.length;
render();

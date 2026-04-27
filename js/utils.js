function catBadgeClass(c) {
  return {Router:'b-router',Gateway:'b-gateway',Switch:'b-switch','Energy Meter':'b-energy',Other:'b-other'}[c]||'b-other';
}

function wifiLabel(w) {
  return {WiFi6:'Wi-Fi 6',WiFi5:'Wi-Fi 5',WiFi24:'Wi-Fi 2.4 GHz',none:'—'}[w]||w;
}

function srow(k, v) {
  return `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`;
}

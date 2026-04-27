document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

PRODUCTS = PRODUCTS_DATA;
document.getElementById('statTotal').textContent = PRODUCTS.length;
render();

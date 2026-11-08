'use strict';

const catalog = [
  { id: 'avocado', name: 'Rollo Avocado', category: 'Rollos', price: 105, featured: true, description: 'Rollo cubierto de láminas de aguacate. La especialidad que inspira esta portada.' },
  { id: 'tlc', name: 'Rollo TLC', category: 'Rollos', price: 91, description: 'Rollo de camarón y salmón con aguacate, masago, queso crema y pepino.' },
  { id: 'nevado', name: 'Rollo Nevado', category: 'Rollos', price: 120, description: 'Rollo cubierto de queso crema, con pepino, aguacate y salsa de anguila.' },
  { id: 'fresh', name: 'Fresh Roll', category: 'Rollos', price: 92, description: 'Camarón, pasta de Tampico, queso crema y pepino en hoja de lechuga.' },
  { id: 'gohan', name: 'Gohan', category: 'Arroces', description: 'Arroz blanco cocido al vapor. Elige el tamaño de tu porción.', optionLabel: 'Tamaño', options: [{ label: 'Mediano', price: 43 }, { label: 'Grande', price: 50 }] },
  { id: 'gohan-especial', name: 'Gohan Especial', category: 'Arroces', description: 'Arroz con pasta de cangrejo y furikake. Puede ser picante.', optionLabel: 'Tamaño', options: [{ label: 'Mediano', price: 62 }, { label: 'Grande', price: 76 }] },
  { id: 'tempura', name: 'Camarones Tempura', category: 'Entradas', price: 141, description: 'Camarones grandes con verduras en tempura.' },
  { id: 'sunomono', name: 'Sunomono', category: 'Entradas', description: 'Pepino en tiras, limón, vinagre y furikake, con la proteína de tu elección.', optionLabel: 'Proteína', options: ['Cangrejo', 'Pulpo', 'Camarón', 'Salmón', 'Atún'].map(label => ({ label, price: 129 })) },
];
const extras = [{ id: 'soya', label: 'Soya extra', price: 10 }, { id: 'anguila', label: 'Salsa de anguila extra', price: 15 }];
const categories = ['Todo', 'Rollos', 'Arroces', 'Entradas'];
const storageKey = 'to-sushi-cumbres-demo-v1';
const quantityLimit = 20;
const byId = id => document.getElementById(id);
const lookup = id => catalog.find(item => item.id === id);
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const mxn = value => money.format(value);
const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const selectedExtras = line => extras.filter(extra => line.extras.includes(extra.id));
const basePrice = (item, option = 0) => item.options ? item.options[option].price : item.price;
const unitPrice = line => basePrice(lookup(line.product), line.option) + selectedExtras(line).reduce((sum, extra) => sum + extra.price, 0);
const countItems = () => cart.reduce((sum, line) => sum + line.quantity, 0);
const totalPrice = () => cart.reduce((sum, line) => sum + unitPrice(line) * line.quantity, 0);

const search = byId('menu-search');
const grid = byId('menu-grid');
const filters = byId('categories');
const productDialog = byId('product-dialog');
const cartDialog = byId('cart-dialog');
const productForm = byId('product-form');
const productOptions = byId('product-options');
const cartContent = byId('cart-content');
const simulation = byId('simulation');
const messagePreview = byId('message-preview');
const itemNote = byId('item-note');
let activeCategory = 'Todo';
let cart = loadCart();
let draft = null;
let returnTo = null;
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(line => {
      if (!line || typeof line.id !== 'string' || typeof line.note !== 'string' || !Array.isArray(line.extras)) return false;
      const product = lookup(line.product);
      return product && Number.isInteger(line.option) && line.option >= 0 && line.option < (product.options?.length ?? 1)
        && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= quantityLimit;
    });
  } catch {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* Cart still works in memory. */ }
  document.querySelector('[data-count]').textContent = countItems();
}

function renderMenu() {
  const term = normalize(search.value);
  const matches = catalog.filter(item => (activeCategory === 'Todo' || item.category === activeCategory)
    && normalize([item.name, item.description, item.category, ...(item.options?.map(option => option.label) ?? [])].join(' ')).includes(term));
  byId('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'platillo' : 'platillos'}`;
  for (const button of filters.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.category === activeCategory));
  grid.innerHTML = matches.map(item => {
    const prices = item.options?.map(option => option.price) ?? [item.price];
    const price = Math.min(...prices);
    return `<article class="menu-card${item.featured ? ' featured' : ''}">
      <div><p class="card-label">${item.featured ? '✦ En portada' : item.category}</p><h3>${item.name}</h3><p class="card-description">${item.description}</p></div>
      <div class="card-bottom"><p class="card-price">${prices.some(value => value > price) ? '<small>Desde</small> ' : ''}${mxn(price)}</p>
      <button type="button" class="button card-action" data-product="${item.id}" aria-label="Elegir ${item.name}">Elegir <span aria-hidden="true">+</span></button></div></article>`;
  }).join('') || '<div class="empty-results"><p>No encontramos platillos con esa búsqueda.</p><button class="button outline" type="button" data-reset-search>Ver toda la carta</button></div>';
}

function renderProduct() {
  const product = lookup(draft.product);
  byId('product-title').textContent = product.name;
  byId('product-description').textContent = product.description;
  const options = product.options ? `<fieldset><legend>${product.optionLabel}</legend><div class="choices">${product.options.map((option, index) => `
    <label class="choice"><input type="radio" name="option" value="${index}" ${index === draft.option ? 'checked' : ''}><span>${option.label}${product.optionLabel === 'Tamaño' ? ` <small>${mxn(option.price)}</small>` : ''}</span></label>`).join('')}</div></fieldset>` : '';
  productOptions.innerHTML = options + `<fieldset><legend>Extras de muestra</legend><div class="choices">${extras.map(extra => `
    <label class="choice"><input type="checkbox" name="extra" value="${extra.id}" ${draft.extras.includes(extra.id) ? 'checked' : ''}><span>${extra.label} <small>+${mxn(extra.price)}</small></span></label>`).join('')}</div></fieldset>`;
  itemNote.value = draft.note;
  updateProductTotal();
}

function updateProductTotal() {
  byId('product-quantity').value = draft.quantity;
  productForm.querySelector('[data-quantity="-1"]').disabled = draft.quantity <= 1;
  productForm.querySelector('[data-quantity="1"]').disabled = draft.quantity >= quantityLimit;
  byId('product-add').textContent = `${draft.id ? 'Guardar' : 'Agregar'} · ${mxn(unitPrice(draft) * draft.quantity)}`;
}

function openProduct(product, line) {
  returnTo = line ? (simulation.hidden ? 'cart' : 'review') : null;
  if (line) cartDialog.close();
  draft = line ? { ...line, extras: [...line.extras] } : { product, option: 0, extras: [], quantity: 1, note: '' };
  renderProduct();
  productDialog.showModal();
  productDialog.querySelector('.dialog-body').scrollTop = 0;
}

function detailsFor(line) {
  const product = lookup(line.product);
  return [product.options?.[line.option].label, ...selectedExtras(line).map(extra => extra.label)].filter(Boolean);
}

function renderOrderLine(line, review = false) {
  const name = escapeHtml(lookup(line.product).name);
  const id = escapeHtml(line.id);
  const details = detailsFor(line).join(' · ');
  const edit = `<button type="button" data-line="${id}" data-action="edit" class="text-button">Editar<span class="sr-only"> ${name}</span></button>`;
  const actions = review ? edit : `<div class="stepper" role="group" aria-label="Cantidad de ${name}">
    <button type="button" data-line="${id}" data-action="less" aria-label="Restar ${name}" ${line.quantity === 1 ? 'disabled' : ''}>−</button><span class="number">${line.quantity}</span>
    <button type="button" data-line="${id}" data-action="more" aria-label="Sumar ${name}" ${line.quantity === quantityLimit ? 'disabled' : ''}>+</button></div>
    ${edit}<button type="button" data-line="${id}" data-action="remove" class="text-button">Quitar<span class="sr-only"> ${name}</span></button>`;
  return `<article class="cart-item${review ? ' review-item' : ''}"><div class="cart-item-title"><h3>${review ? `${line.quantity} × ` : ''}${name}</h3><strong>${mxn(unitPrice(line) * line.quantity)}</strong></div>
    ${details ? `<p class="item-meta">${details}</p>` : ''}${line.note ? `<p class="item-meta">Nota: ${escapeHtml(line.note)}</p>` : ''}
    <div class="cart-item-actions">${actions}</div></article>`;
}

function renderCart() {
  const lines = cart.map(line => renderOrderLine(line)).join('');
  cartContent.innerHTML = `<div class="dialog-body">${lines || '<div class="cart-empty"><p>Tu pedido está vacío.</p><button class="button outline" type="button" data-action="browse">Explorar la carta</button></div>'}</div>
    <div class="cart-summary"><p class="cart-total"><span>Subtotal de muestra</span><span>${mxn(totalPrice())} MXN</span></p>
    <p class="cart-disclaimer">Demo con precios de muestra.</p><button type="button" class="button dark" data-action="simulate" ${cart.length ? '' : 'disabled'}>Simular pedido por WhatsApp <span aria-hidden="true">↗</span></button></div>`;
}

function showCart() {
  byId('cart-title').textContent = 'Mi pedido';
  simulation.hidden = true;
  cartContent.hidden = false;
  renderCart();
  if (!cartDialog.open) cartDialog.showModal();
}

function buildMessage() {
  const lines = cart.map(line => {
    const details = detailsFor(line);
    const heading = `• ${line.quantity} × ${lookup(line.product).name} — ${mxn(unitPrice(line) * line.quantity)} MXN`;
    return [heading, details.length && `  ${details.join(' · ')}`, line.note && `  Nota: ${line.note}`].filter(Boolean).join('\n');
  });
  return ['[SIMULACIÓN · NO ES UN PEDIDO REAL]', 'Hola, To Sushi Cumbres. Este sería mi pedido:', '', ...lines, '', `Subtotal de muestra: ${mxn(totalPrice())} MXN`].join('\n');
}

function openSimulation() {
  if (!cart.length) return;
  byId('cart-title').textContent = 'Revisar pedido';
  byId('review-items').innerHTML = cart.map(line => renderOrderLine(line, true)).join('');
  byId('review-total').textContent = `${mxn(totalPrice())} MXN`;
  messagePreview.value = buildMessage();
  byId('message-box').open = false;
  byId('copy-status').textContent = '';
  cartContent.hidden = true;
  simulation.hidden = false;
  if (!cartDialog.open) cartDialog.showModal();
  simulation.querySelector('.dialog-body').scrollTop = 0;
  byId('cart-title').focus();
}

function announce(message) {
  clearTimeout(toastTimer);
  byId('toast').textContent = message;
  toastTimer = setTimeout(() => { byId('toast').textContent = ''; }, 2900);
}

filters.innerHTML = categories.map(category => `<button type="button" class="category" data-category="${category}" aria-pressed="false">${category}</button>`).join('');
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderMenu();
});
search.addEventListener('input', renderMenu);
byId('inicio').addEventListener('click', event => {
  const button = event.target.closest('button[data-product], button[data-reset-search]');
  if (button?.dataset.product) openProduct(button.dataset.product);
  if (button?.hasAttribute('data-reset-search')) {
    activeCategory = 'Todo';
    search.value = '';
    renderMenu();
    search.focus();
  }
});

productOptions.addEventListener('change', () => {
  const values = new FormData(productForm);
  draft.option = Number(values.get('option') ?? 0);
  draft.extras = values.getAll('extra');
  updateProductTotal();
});
productForm.addEventListener('click', event => {
  const control = event.target.closest('[data-quantity]');
  if (!control) return;
  draft.quantity = Math.min(quantityLimit, Math.max(1, draft.quantity + Number(control.dataset.quantity)));
  updateProductTotal();
});
productForm.addEventListener('submit', event => {
  event.preventDefault();
  const line = { ...draft, note: itemNote.value.trim() };
  if (line.id) {
    cart = cart.map(item => item.id === line.id ? line : item);
  } else {
    line.id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cart.push(line);
  }
  saveCart();
  productDialog.close();
  announce(`${lookup(line.product).name} ${returnTo ? 'actualizado' : 'agregado al pedido'}`);
});
productDialog.addEventListener('close', () => {
  if (returnTo === 'cart') showCart();
  if (returnTo === 'review') openSimulation();
  returnTo = null;
  draft = null;
});

document.querySelector('[data-open-cart]').addEventListener('click', showCart);
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => byId(button.dataset.close).close());
cartDialog.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, line: id } = button.dataset;
  if (action === 'browse') {
    cartDialog.close();
    byId('carta').scrollIntoView();
    search.focus({ preventScroll: true });
    return;
  }
  if (action === 'simulate') { openSimulation(); return; }
  const line = cart.find(item => item.id === id);
  if (!line) return;
  if (action === 'edit') { openProduct(line.product, line); return; }
  if (action === 'remove') cart = cart.filter(item => item.id !== id);
  if (action === 'less' || action === 'more') line.quantity = Math.min(quantityLimit, Math.max(1, line.quantity + (action === 'less' ? -1 : 1)));
  saveCart();
  renderCart();
  const replacement = [...cartContent.querySelectorAll('[data-line]')].find(candidate => candidate.dataset.line === id && candidate.dataset.action === action && !candidate.disabled);
  (replacement ?? cartDialog.querySelector('[data-close]')).focus();
});
byId('back-to-cart').addEventListener('click', () => {
  showCart();
  cartContent.querySelector('[data-action="simulate"]').focus();
});
byId('copy-message').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(messagePreview.value);
    byId('copy-status').textContent = 'Mensaje copiado.';
  } catch {
    byId('message-box').open = true;
    messagePreview.focus();
    messagePreview.select();
    byId('copy-status').textContent = 'Mensaje seleccionado. Usa la opción Copiar de tu navegador.';
  }
});

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = byId('motion-toggle');
let motionRequested = new URLSearchParams(location.search).get('movimiento') !== '0';
function updateMotion() {
  const enabled = motionRequested && !motionPreference.matches;
  document.documentElement.dataset.motion = enabled ? 'on' : 'off';
  motionToggle.setAttribute('aria-pressed', String(enabled));
  motionToggle.disabled = motionPreference.matches;
  byId('motion-state').textContent = motionPreference.matches ? 'reducido' : enabled ? 'activo' : 'pausado';
}
const motionAreas = document.querySelectorAll('[data-motion-area]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting)));
  motionAreas.forEach(area => observer.observe(area));
} else {
  motionAreas.forEach(area => area.classList.add('in-view'));
}
motionToggle.addEventListener('click', () => { motionRequested = !motionRequested; updateMotion(); });
motionPreference.addEventListener('change', updateMotion);
requestAnimationFrame(() => setTimeout(updateMotion, 450));

renderMenu();
document.querySelector('[data-count]').textContent = countItems();

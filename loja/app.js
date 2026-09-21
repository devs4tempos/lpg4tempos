(function () {
  "use strict";

  const config = window.LOJA_CONFIG;
  const products = window.PRODUCTS.filter((product) => product.active !== false);
  const root = document.querySelector("main");
  const cartDrawer = document.querySelector("[data-cart-drawer]");
  const cartBackdrop = document.querySelector("[data-cart-backdrop]");
  const toast = document.querySelector("[data-toast]");
  const money = new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency });
  const isFilePreview = window.location.protocol === "file:";

  const state = {
    query: "",
    category: "Todos",
    sort: "default",
    cart: loadCart(),
    detailQuantity: 1,
    activeImage: 0,
  };

  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
  }

  function productUrl(product) {
    return isFilePreview
      ? `#produto/${encodeURIComponent(product.slug)}`
      : `${config.basePath}${product.slug}`;
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem("m4t-cart"));
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem("m4t-cart", JSON.stringify(state.cart));
    updateCartUI();
  }

  function getProduct(slug) {
    return products.find((product) => product.slug === slug);
  }

  function getCurrentSlug() {
    const hashMatch = window.location.hash.match(/^#produto\/(.+)$/);
    if (hashMatch) return decodeURIComponent(hashMatch[1]);
    if (isFilePreview) return null;

    const path = window.location.pathname.replace(/\/+$/, "");
    const base = config.basePath.replace(/\/+$/, "");
    if (path === base || path === `${base}/index.html` || path === "") return null;
    if (path.startsWith(`${base}/`)) return decodeURIComponent(path.slice(base.length + 1));
    return null;
  }

  function navigate(url) {
    history.pushState({}, "", isFilePreview ? (url.startsWith("#") ? url : "#") : url);
    state.detailQuantity = 1;
    state.activeImage = 0;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function productCard(product, index = 0) {
    return `
      <article class="product-card" style="--delay:${Math.min(index * 45, 250)}ms">
        <a class="product-image-link" href="${productUrl(product)}" data-product-link="${escapeHtml(product.slug)}" aria-label="Ver ${escapeHtml(product.name)}">
          <img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy" />
          ${product.featured ? '<span class="feature-badge">Destaque</span>' : ""}
        </a>
        <div class="product-card-body">
          <span class="product-category">${escapeHtml(product.category)}</span>
          <h3><a href="${productUrl(product)}" data-product-link="${escapeHtml(product.slug)}">${escapeHtml(product.name)}</a></h3>
          <span class="product-code">Cód. ${escapeHtml(product.code)}</span>
          <strong class="product-price">${money.format(product.price)}</strong>
          <div class="card-actions">
            <a class="details-button" href="${productUrl(product)}" data-product-link="${escapeHtml(product.slug)}" aria-label="Ver detalhes de ${escapeHtml(product.name)}">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <button class="add-button" type="button" data-add-product="${escapeHtml(product.slug)}">Adicionar</button>
          </div>
        </div>
      </article>`;
  }

  function catalogTemplate() {
    const categories = ["Todos", ...new Set(products.map((product) => product.category))];
    return `
      <section class="catalog-hero">
        <div class="catalog-hero-inner">
          <div>
            <span class="eyebrow">Loja Mecânica 4 Tempos</span>
            <h1>Peças e máquinas para sua operação</h1>
            <p>Encontre o que precisa, monte o carrinho e envie o pedido direto para nossa equipe pelo WhatsApp.</p>
          </div>
          <div class="hero-points" aria-label="Vantagens">
            <div class="hero-point"><span>✓</span> Atendimento especializado</div>
            <div class="hero-point"><span>✓</span> Compatibilidade sob consulta</div>
            <div class="hero-point"><span>✓</span> Pedido rápido pelo WhatsApp</div>
          </div>
        </div>
      </section>
      <section class="catalog-section" id="produtos" aria-labelledby="catalog-title">
        <div class="catalog-toolbar">
          <label class="search-box">
            <span class="sr-only">Pesquisar produtos</span>
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            <input type="search" placeholder="Pesquisar produto ou código..." data-search value="${escapeHtml(state.query)}" />
          </label>
          <select class="sort-select" data-sort aria-label="Ordenar produtos">
            <option value="default" ${state.sort === "default" ? "selected" : ""}>Ordenar: destaques</option>
            <option value="name-asc" ${state.sort === "name-asc" ? "selected" : ""}>Nome (A–Z)</option>
            <option value="price-asc" ${state.sort === "price-asc" ? "selected" : ""}>Menor preço</option>
            <option value="price-desc" ${state.sort === "price-desc" ? "selected" : ""}>Maior preço</option>
          </select>
        </div>
        <div class="category-row" aria-label="Categorias">
          ${categories.map((category) => `<button class="category-chip ${state.category === category ? "is-active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}
        </div>
        <div class="catalog-meta">
          <h2 id="catalog-title">Catálogo</h2>
          <span data-result-count></span>
        </div>
        <div class="product-grid" data-product-grid></div>
      </section>`;
  }

  function renderCatalogProducts() {
    const grid = document.querySelector("[data-product-grid]");
    if (!grid) return;
    const query = state.query.trim().toLocaleLowerCase("pt-BR");
    let filtered = products.filter((product) => {
      const categoryMatch = state.category === "Todos" || product.category === state.category;
      const searchMatch = !query || `${product.name} ${product.code} ${product.category}`.toLocaleLowerCase("pt-BR").includes(query);
      return categoryMatch && searchMatch;
    });

    filtered = [...filtered].sort((a, b) => {
      if (state.sort === "name-asc") return a.name.localeCompare(b.name, "pt-BR");
      if (state.sort === "price-asc") return a.price - b.price;
      if (state.sort === "price-desc") return b.price - a.price;
      return Number(b.featured) - Number(a.featured);
    });

    document.querySelector("[data-result-count]").textContent = `${filtered.length} ${filtered.length === 1 ? "produto" : "produtos"}`;
    grid.innerHTML = filtered.length
      ? filtered.map(productCard).join("")
      : `<div class="empty-state"><h3>Nenhum produto encontrado</h3><p>Tente outro termo ou limpe os filtros.</p><button class="primary-button" type="button" data-clear-filters>Limpar filtros</button></div>`;
  }

  function productDetailTemplate(product) {
    const related = products.filter((item) => item.slug !== product.slug && item.category === product.category).slice(0, 3);
    const image = product.images[state.activeImage] || product.images[0];
    return `
      <section class="product-page">
        <nav class="breadcrumb" aria-label="Navegação estrutural">
          <a href="${config.basePath}" data-home-link>Loja</a><span>/</span><span>${escapeHtml(product.name)}</span>
        </nav>
        <div class="product-detail">
          <div class="product-gallery">
            <button class="main-image-button" type="button" data-open-lightbox="${escapeHtml(image)}" aria-label="Ampliar imagem de ${escapeHtml(product.name)}">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" />
            </button>
            ${product.images.length > 1 ? `<div class="thumbnail-row" aria-label="Imagens do produto">${product.images.map((src, index) => `<button class="thumbnail ${index === state.activeImage ? "is-active" : ""}" type="button" data-image-index="${index}" aria-label="Ver imagem ${index + 1}"><img src="${escapeHtml(src)}" alt="" /></button>`).join("")}</div>` : ""}
          </div>
          <div class="product-info">
            <span class="product-category">${escapeHtml(product.category)}</span>
            <h1>${escapeHtml(product.name)}</h1>
            <span class="detail-code">Código: ${escapeHtml(product.code)}</span>
            <div class="detail-price">${money.format(product.price)}</div>
            <p class="detail-payment">Valor unitário · confirme disponibilidade</p>
            <p class="detail-description">${escapeHtml(product.description)}</p>
            <ul class="detail-list">${product.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
            <div class="quantity-add">
              <div class="quantity-control" aria-label="Quantidade">
                <button type="button" data-detail-quantity="-1" aria-label="Diminuir quantidade">−</button>
                <span data-detail-quantity-value>${state.detailQuantity}</span>
                <button type="button" data-detail-quantity="1" aria-label="Aumentar quantidade">+</button>
              </div>
              <button class="primary-button" type="button" data-add-product="${escapeHtml(product.slug)}" data-detail-add>Adicionar ao carrinho</button>
            </div>
            <a class="back-link" href="${config.basePath}" data-home-link>← Voltar ao catálogo</a>
          </div>
        </div>
        ${related.length ? `<section class="related-section" aria-labelledby="related-title"><div class="section-heading"><div><span class="eyebrow">Continue procurando</span><h2 id="related-title">Produtos relacionados</h2></div></div><div class="product-grid">${related.map(productCard).join("")}</div></section>` : ""}
      </section>`;
  }

  function notFoundTemplate() {
    return `<section class="product-page"><div class="empty-state"><span class="eyebrow">Produto não encontrado</span><h1>Este endereço não existe no catálogo.</h1><p>O produto pode ter sido removido ou o link está incorreto.</p><a class="primary-button" style="display:inline-flex;align-items:center;padding:0 22px" href="${config.basePath}" data-home-link>Voltar para a loja</a></div></section>`;
  }

  function renderPage() {
    const slug = getCurrentSlug();
    if (!slug) {
      document.title = "Loja | Mecânica 4 Tempos";
      root.innerHTML = catalogTemplate();
      renderCatalogProducts();
      return;
    }
    const product = getProduct(slug);
    if (!product) {
      document.title = "Produto não encontrado | Mecânica 4 Tempos";
      root.innerHTML = notFoundTemplate();
      return;
    }
    document.title = `${product.name} | Mecânica 4 Tempos`;
    root.innerHTML = productDetailTemplate(product);
  }

  function addToCart(slug, quantity = 1) {
    const product = getProduct(slug);
    if (!product) return;
    const existing = state.cart.find((item) => item.slug === slug);
    if (existing) existing.quantity += quantity;
    else state.cart.push({ slug, quantity });
    saveCart();
    showToast(`${product.name} adicionado ao carrinho`);
  }

  function updateCartQuantity(slug, delta) {
    const item = state.cart.find((entry) => entry.slug === slug);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) state.cart = state.cart.filter((entry) => entry.slug !== slug);
    saveCart();
  }

  function cartTotal() {
    return state.cart.reduce((total, item) => {
      const product = getProduct(item.slug);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  function updateCartUI() {
    const validCart = state.cart.filter((item) => getProduct(item.slug));
    const count = validCart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector("[data-cart-count]").textContent = count;
    document.querySelector("[data-cart-total]").textContent = money.format(cartTotal());
    const cartItems = document.querySelector("[data-cart-items]");
    const checkout = document.querySelector("[data-checkout]");
    checkout.disabled = !validCart.length;
    cartItems.innerHTML = validCart.length
      ? validCart.map((item) => {
          const product = getProduct(item.slug);
          return `<article class="cart-item"><img src="${escapeHtml(product.images[0])}" alt="" /><div><h3>${escapeHtml(product.name)}</h3><small>Cód. ${escapeHtml(product.code)}</small><div class="cart-item-price">${money.format(product.price * item.quantity)}</div><div class="mini-quantity"><button type="button" data-cart-delta="-1" data-cart-slug="${escapeHtml(item.slug)}" aria-label="Diminuir ${escapeHtml(product.name)}">−</button><span>${item.quantity}</span><button type="button" data-cart-delta="1" data-cart-slug="${escapeHtml(item.slug)}" aria-label="Aumentar ${escapeHtml(product.name)}">+</button></div></div><button class="remove-item" type="button" data-remove-item="${escapeHtml(item.slug)}">Excluir</button></article>`;
        }).join("")
      : `<div class="cart-empty"><div><strong>Seu carrinho está vazio</strong><span>Adicione produtos para montar o pedido.</span></div></div>`;
  }

  function openCart() {
    cartBackdrop.hidden = false;
    requestAnimationFrame(() => {
      cartBackdrop.classList.add("is-open");
      cartDrawer.classList.add("is-open");
    });
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    cartDrawer.querySelector("[data-close-cart]").focus();
  }

  function closeCart() {
    cartBackdrop.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    setTimeout(() => { cartBackdrop.hidden = true; }, 260);
  }

  function checkoutWhatsApp() {
    if (!state.cart.length) return;
    const lines = state.cart.flatMap((item) => {
      const product = getProduct(item.slug);
      if (!product) return [];
      return [
        `${product.name} - ${product.code}`,
        `${item.quantity}x ${product.name}`,
        `Valor unitário: ${money.format(product.price)}`,
        "",
      ];
    });
    lines.push(`Total: ${money.format(cartTotal())}`);
    const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  }

  function openLightbox(src, alt) {
    const modal = document.querySelector("[data-lightbox]");
    const image = document.querySelector("[data-lightbox-image]");
    image.src = src;
    image.alt = alt;
    modal.hidden = false;
    document.body.classList.add("drawer-open");
    modal.querySelector("[data-close-lightbox]").focus();
  }

  function closeLightbox() {
    document.querySelector("[data-lightbox]").hidden = true;
    document.body.classList.remove("drawer-open");
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  document.addEventListener("click", (event) => {
    const productLink = event.target.closest("[data-product-link]");
    if (productLink) {
      event.preventDefault();
      navigate(productUrl(getProduct(productLink.dataset.productLink)));
      return;
    }

    const homeLink = event.target.closest("[data-home-link]");
    if (homeLink) {
      event.preventDefault();
      navigate(config.basePath);
      return;
    }

    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
      addToCart(addButton.dataset.addProduct, addButton.hasAttribute("data-detail-add") ? state.detailQuantity : 1);
      return;
    }

    const category = event.target.closest("[data-category]");
    if (category) {
      state.category = category.dataset.category;
      document.querySelectorAll("[data-category]").forEach((button) => button.classList.toggle("is-active", button === category));
      renderCatalogProducts();
      return;
    }

    const quantityButton = event.target.closest("[data-detail-quantity]");
    if (quantityButton) {
      state.detailQuantity = Math.max(1, state.detailQuantity + Number(quantityButton.dataset.detailQuantity));
      document.querySelector("[data-detail-quantity-value]").textContent = state.detailQuantity;
      return;
    }

    const thumbnail = event.target.closest("[data-image-index]");
    if (thumbnail) {
      state.activeImage = Number(thumbnail.dataset.imageIndex);
      renderPage();
      return;
    }

    const lightboxButton = event.target.closest("[data-open-lightbox]");
    if (lightboxButton) {
      const slug = getCurrentSlug();
      openLightbox(lightboxButton.dataset.openLightbox, getProduct(slug)?.name || "Imagem do produto");
      return;
    }

    const deltaButton = event.target.closest("[data-cart-delta]");
    if (deltaButton) {
      updateCartQuantity(deltaButton.dataset.cartSlug, Number(deltaButton.dataset.cartDelta));
      return;
    }

    const removeButton = event.target.closest("[data-remove-item]");
    if (removeButton) {
      state.cart = state.cart.filter((item) => item.slug !== removeButton.dataset.removeItem);
      saveCart();
      return;
    }

    if (event.target.closest("[data-open-cart]")) openCart();
    if (event.target.closest("[data-close-cart]") || event.target.closest("[data-cart-backdrop]")) closeCart();
    if (event.target.closest("[data-checkout]")) checkoutWhatsApp();
    if (event.target.closest("[data-close-lightbox]")) closeLightbox();

    if (event.target.closest("[data-clear-filters]")) {
      state.query = "";
      state.category = "Todos";
      state.sort = "default";
      renderPage();
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-search]")) {
      state.query = event.target.value;
      renderCatalogProducts();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-sort]")) {
      state.sort = event.target.value;
      renderCatalogProducts();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!document.querySelector("[data-lightbox]").hidden) closeLightbox();
      else if (cartDrawer.classList.contains("is-open")) closeCart();
    }
  });

  window.addEventListener("popstate", renderPage);

  renderPage();
  updateCartUI();
})();

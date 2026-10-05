(async () => {
  "use strict";

  try {
    window.history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
    window.addEventListener("pageshow", () => {
      if (!window.location.hash) window.scrollTo(0, 0);
    }, { once: true });
  } catch { /* alguns navegadores bloqueiam o controle de rolagem */ }

  const WHATSAPP_NUMBER = "553798700630";
  const STORAGE_KEY = "mecanica4tempos:loja:carrinho:v1";


  

  // Cada produto possui sua própria propriedade image. Troque o valor individualmente quando inserir uma foto real.
  // { name: "AGULHA 13CV", price: 25, image: "img/products/agulha-13cv.jpg" },



  const PRODUCT_IMAGE = "img/products/produto-sem-imagem.svg";
  const rawProducts = [
    { name: "AGULHA 13CV", price: 25, image: PRODUCT_IMAGE },
    { name: "AGULHA 5.5CV", price: 25, image: PRODUCT_IMAGE },
    { name: "AGULHA BAILARINA 13CV", price: 35, image: PRODUCT_IMAGE },
    { name: "AGULHA GXR120", price: 35, image: PRODUCT_IMAGE },
    { name: "AVR GRANDE 8KVA", price: 245, image: PRODUCT_IMAGE },
    { name: "AVR PEQUENO MEIA LUA", price: 115, image: PRODUCT_IMAGE },
    { name: "AVR PEQUENO QUADRADO", price: 165, image: PRODUCT_IMAGE },
    { name: "BASE DO FILTRO DE AR GXR120 - ORIGINAL", price: 185, image: PRODUCT_IMAGE },
    { name: "BIELA GXR120", price: 150, image: PRODUCT_IMAGE },
    { name: "BLOCO GXR120", price: 985, image: PRODUCT_IMAGE },
    { name: "BOTOEIRA CPL COM EMERGENCIA PARA GUINCHO", price: 185, image: PRODUCT_IMAGE },
    { name: "BOTOEIRA CPL SIMPLES PARA GUINCHO", price: 95, image: PRODUCT_IMAGE },
    { name: "CACHIMBO DA VELA UNIVERSAL", price: 20, image: PRODUCT_IMAGE },
    { name: "CAIXA TERMOPLASTICA PARA GUINCHO", price: 195, image: PRODUCT_IMAGE },
    { name: "CARBURADOR 2.8CV", price: 145, image: PRODUCT_IMAGE },
    { name: "CARBURADOR 950", price: 145, image: PRODUCT_IMAGE },
    { name: "CARBURADOR GXR120", price: 565, image: PRODUCT_IMAGE },
    { name: "CARBURADOR PARA GERADOR 13CV", price: 275, image: PRODUCT_IMAGE },
    { name: "CARBURADOR PARA GERADOR 5.5CV", price: 225, image: PRODUCT_IMAGE },
    { name: "CARBURADOR PARA MOTOR 13CV", price: 275, image: PRODUCT_IMAGE },
    { name: "CARBURADOR PARA MOTOR 5.5CV", price: 185, image: PRODUCT_IMAGE },
    { name: "CHAVE LIGA/DESLIGA QUADRADA", price: 45, image: PRODUCT_IMAGE },
    { name: "CHAVE LIGA/DESLIGA REDONDA", price: 35, image: PRODUCT_IMAGE },
    { name: "CILINDRO GUIA WACKER BS50", price: 2190, image: PRODUCT_IMAGE },
    { name: "CILINDRO GUIA WEBER SRV 620", price: 2190, image: PRODUCT_IMAGE },
    { name: "CONJUNTO FILTRO DE AR 13CV", price: 245, image: PRODUCT_IMAGE },
    { name: "CONJUNTO FILTRO DE AR 5.5CV", price: 150, image: PRODUCT_IMAGE },
    { name: "COXIM DA BASE DA PLACA CF2 / VK85", price: 160, image: PRODUCT_IMAGE },
    { name: "COXIM DO BRACO WACKER", price: 385, image: PRODUCT_IMAGE },
    { name: "COXIM DO BRACO WEBER", price: 375, image: PRODUCT_IMAGE },
    { name: "COXIM HUSQVARNA", price: 215, image: PRODUCT_IMAGE },
    { name: "COXIM PARA GERADOR 1.2 - 2.5KVA", price: 30, image: PRODUCT_IMAGE },
    { name: "EMBREAGEM FURO 19MM", price: 535, image: PRODUCT_IMAGE },
    { name: "EMBREAGEM FURO HUSQ RETO", price: 790, image: PRODUCT_IMAGE },
    { name: "EMBREAGEM HUSQVARNA FURO CONICO", price: 810, image: PRODUCT_IMAGE },
    { name: "EMBREAGEM ORIGINAL WACKER", price: 1735, image: PRODUCT_IMAGE },
    { name: "EMBREAGEM SRV550/SW550", price: 1475, image: PRODUCT_IMAGE },
    { name: "ESCAPAMENTO PARA GERADOR 2.5KVA", price: 275, image: PRODUCT_IMAGE },
    { name: "ESCAPAMENTO PARA GERADOR 6.5KVA", price: 385, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR  SUPERIOR HUSQVARNA", price: 192, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR  WACKER SAIDA LATERAL", price: 135, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR 13CV", price: 55, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR 5.5CV", price: 45, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR CYCLONE", price: 114, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR GXR120 - ORIGINAL", price: 69, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR HONDA IMPORTADO", price: 25, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR SUPERIOR WEBER/WOLKAN", price: 245, image: PRODUCT_IMAGE },
    { name: "FILTRO DE AR WACKER SAIDA CENTRAL", price: 195, image: PRODUCT_IMAGE },
    { name: "FILTRO DE COMBUSTIVEL FRAM", price: 35, image: PRODUCT_IMAGE },
    { name: "JOGO DE ANEIS GXR120", price: 135, image: PRODUCT_IMAGE },
    { name: "JOGO DE JUNTAS 13CV", price: 95, image: PRODUCT_IMAGE },
    { name: "JOGO DE JUNTAS 5.5CV", price: 95, image: PRODUCT_IMAGE },
    { name: "JUNTA ABERTA V02", price: 45, image: PRODUCT_IMAGE },
    { name: "JUNTA DA TAMPA DE VALVULAS 13/15", price: 35, image: PRODUCT_IMAGE },
    { name: "JUNTA DA TAMPA DE VALVULAS 5.5CV", price: 25, image: PRODUCT_IMAGE },
    { name: "JUNTA DO BLOCO 13CV", price: 45, image: PRODUCT_IMAGE },
    { name: "JUNTA DO BLOCO 15CV MASTER", price: 135, image: PRODUCT_IMAGE },
    { name: "JUNTA DO BLOCO 5.5CV", price: 45, image: PRODUCT_IMAGE },
    { name: "JUNTA DO BLOCO GX120", price: 85, image: PRODUCT_IMAGE },
    { name: "JUNTA DO BLOCO GX270", price: 75, image: PRODUCT_IMAGE },
    { name: "JUNTA DO CABECOTE 15CV", price: 57, image: PRODUCT_IMAGE },
    { name: "JUNTA DO CARBURADOR 13CV", price: 15, image: PRODUCT_IMAGE },
    { name: "JUNTA DO CARBURADOR 5.5", price: 15, image: PRODUCT_IMAGE },
    { name: "JUNTA DO COLETOR 13CV", price: 15, image: PRODUCT_IMAGE },
    { name: "JUNTA DO COLETOR 5.5CV", price: 20, image: PRODUCT_IMAGE },
    { name: "MOLA DA PARTIDA 13CV", price: 55, image: PRODUCT_IMAGE },
    { name: "MOLA DA PARTIDA 5.5CV", price: 45, image: PRODUCT_IMAGE },
    { name: "MOLA DA PARTIDA GXR120", price: 55, image: PRODUCT_IMAGE },
    { name: "MOLA DO GOVERNADOR 13CV", price: 25, image: PRODUCT_IMAGE },
    { name: "MOLA DO GOVERNADOR GXR120", price: 25, image: PRODUCT_IMAGE },
    { name: "MOLA PULSEIRA", price: 35, image: PRODUCT_IMAGE },
    { name: "MOLAS DO PATIM DA EMBREAGEM SRV620", price: 20, image: PRODUCT_IMAGE },
    { name: "PATIM DA EMBREAGEM SRV620", price: 195, image: PRODUCT_IMAGE },
    { name: "PISTAO GXR120", price: 150, image: PRODUCT_IMAGE },
    { name: "PONTE RETIFICADORA GUINCHO", price: 65, image: PRODUCT_IMAGE },
    { name: "REPARO DO CARBURADOR 5.5CV BAILARINA", price: 35, image: PRODUCT_IMAGE },
    { name: "SANFONA BOMAG BT 65/68", price: 885, image: PRODUCT_IMAGE },
    { name: "SANFONA BOMAG BT60/80", price: 895, image: PRODUCT_IMAGE },
    { name: "SANFONA CSM CS68/73", price: 885, image: PRODUCT_IMAGE },
    { name: "SANFONA HUSQ LT6005 IMP", price: 845, image: PRODUCT_IMAGE },
    { name: "SANFONA HUSQVARNA LT5005", price: 725, image: PRODUCT_IMAGE },
    { name: "SANFONA MENEGOTTI RAM 68 70 72 75", price: 845, image: PRODUCT_IMAGE },
    { name: "SANFONA WACKER BS50", price: 765, image: PRODUCT_IMAGE },
    { name: "SANFONA WACKER BS60/600", price: 860, image: PRODUCT_IMAGE },
    { name: "SANFONA WEBER / WOLCAN SRV / SW550", price: 765, image: PRODUCT_IMAGE },
    { name: "SANFONA WEBER 620", price: 785, image: PRODUCT_IMAGE },
    { name: "SAPATA BOMAG BT", price: 935, image: PRODUCT_IMAGE },
    { name: "SAPATA HUSQ LT 5005", price: 790, image: PRODUCT_IMAGE },
    { name: "SAPATA WACKER BS50", price: 860, image: PRODUCT_IMAGE },
    { name: "SAPATA WACKER BS60", price: 860, image: PRODUCT_IMAGE },
    { name: "SAPATA WEBER", price: 860, image: PRODUCT_IMAGE },
    { name: "SUPORTE DO FILTRO DE AR COMPLETO GERADOR 2.5KVA - 3.5KVA", price: 135, image: PRODUCT_IMAGE },
    { name: "SUPORTE FILTRO DE AR COMPLETO GERADOR 5.5KVA - 8KVA", price: 265, image: PRODUCT_IMAGE },
    { name: "TAMPA DE PARTIDA 13 CV", price: 225, image: PRODUCT_IMAGE },
    { name: "TAMPA DE PARTIDA 5.5 CV", price: 135, image: PRODUCT_IMAGE },
    { name: "TAMPA DE PARTIDA EH12", price: 165, image: PRODUCT_IMAGE },
    { name: "TAMPA DE PARTIDA GXR120 IMP", price: 150, image: PRODUCT_IMAGE },
    { name: "TAMPA DE PARTIDA STARK / 165", price: 165, image: PRODUCT_IMAGE },
    { name: "TAMPA DE PARTIDA VONDER (RATO)", price: 165, image: PRODUCT_IMAGE },
    { name: "TANQUE COMB COMP - UNIV", price: 385, image: PRODUCT_IMAGE },
    { name: "TANQUE DE COMBUSTIVEL 13CV", price: 325, image: PRODUCT_IMAGE },
    { name: "TANQUE DE COMBUSTIVEL 5.5CV", price: 185, image: PRODUCT_IMAGE },
    { name: "VELA 5.5/15 BFF", price: 35, image: PRODUCT_IMAGE },
    { name: "VELA GXR120", price: 45, image: PRODUCT_IMAGE },
    { name: "VELA WACKER 2T", price: 40, image: PRODUCT_IMAGE },
    { name: "VOLTIMETRO GRANDE", price: 165, image: PRODUCT_IMAGE },
    { name: "VOLTIMETRO PEQUENO", price: 79, image: PRODUCT_IMAGE }
  ];

  const normalizeCatalogText = value => String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("pt-BR")
    .trim();

  const getProductCategory = name => {
    const text = normalizeCatalogText(name);
    if (/FILTRO|BASE DO FILTRO|SUPORTE.*FILTRO/.test(text)) return "Filtros";
    if (/AGULHA|CARBURADOR|REPARO DO CARBURADOR/.test(text)) return "Carburação";
    if (/VELA|CACHIMBO/.test(text)) return "Ignição";
    if (/JUNTA|JOGO DE JUNTAS/.test(text)) return "Juntas e vedações";
    if (/AVR|BOTOEIRA|PONTE RETIFICADORA|VOLTIMETRO|CHAVE LIGA\/DESLIGA|CAIXA TERMOPLASTICA/.test(text)) return "Elétrica";
    if (/CILINDRO GUIA|COXIM|SANFONA|SAPATA|PATIM|MOLAS DO PATIM/.test(text)) return "Compactação";
    if (/BIELA|BLOCO|EMBREAGEM|ESCAPAMENTO|JOGO DE ANEIS|PISTAO|MOLA DA PARTIDA|MOLA DO GOVERNADOR|MOLA PULSEIRA|TAMPA DE PARTIDA|TANQUE/.test(text)) return "Componentes de motor";
    return "Peças e componentes";
  };

  const slugify = value => normalizeCatalogText(value)
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const createProducts = records => records.map(({ id, name, price, category, description, icon, image }, index) => ({
    id: id || `${slugify(name)}-${index + 1}`,
    name: String(name || "Produto sem nome"),
    category: String(category || getProductCategory(name)),
    description: String(description || "Peça de reposição para manutenção de máquinas e equipamentos. Confirme modelo e aplicação antes da compra."),
    icon: String(icon || "fa-gears"),
    image: String(image || PRODUCT_IMAGE),
    price: Number(price) || 0
  }));

  const fallbackProducts = createProducts(rawProducts);
  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/products?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Catálogo online indisponível.");
      const payload = await response.json();
      if (!Array.isArray(payload.products)) throw new Error("Catálogo online inválido.");
      return createProducts(payload.products);
    } catch (error) {
      console.warn("Usando catálogo publicado como fallback.", error.message);
      return fallbackProducts;
    }
  };

  const products = await loadProducts();

  const storeRoot = new URL("./", window.location.href);
  const productUrl = product => new URL(encodeURIComponent(product.id), storeRoot).pathname;
  const requestedProductSlug = (() => {
    const pathname = window.location.pathname.replace(/\/+$/, "");
    const marker = pathname.toLocaleLowerCase().lastIndexOf("/loja/");
    if (marker < 0) return "";
    const remainder = pathname.slice(marker + 6).split("/").filter(Boolean);
    if (remainder.length !== 1 || remainder[0].toLocaleLowerCase() === "index.html") return "";
    try { return decodeURIComponent(remainder[0]); } catch { return remainder[0]; }
  })();

  const productMap = new Map(products.map(product => [product.id, product]));
  const productGrid = document.getElementById("productGrid");
  const productDetail = document.querySelector("[data-product-detail]");
  const productDetailImage = document.querySelector("[data-product-detail-image]");
  const productDetailName = document.querySelector("[data-product-detail-name]");
  const productDetailCategory = document.querySelector("[data-product-detail-category]");
  const productDetailDescription = document.querySelector("[data-product-detail-description]");
  const productDetailPrice = document.querySelector("[data-product-detail-price]");
  const productDetailAdd = document.querySelector("[data-product-detail-add]");
  const productDetailShare = document.querySelector("[data-product-detail-share]");
  const productDetailBack = document.querySelector("[data-product-detail-back]");
  const drawer = document.querySelector("[data-cart-drawer]");
  const panel = drawer?.querySelector(".cart-panel");
  const cartList = document.querySelector("[data-cart-list]");
  const cartEmpty = document.querySelector("[data-cart-empty]");
  const cartSummary = document.querySelector("[data-cart-summary]");
  const cartCountElements = document.querySelectorAll("[data-cart-count]");
  const cartItemsElement = document.querySelector("[data-cart-items]");
  const cartSubtotalElement = document.querySelector("[data-cart-subtotal]");
  const notesElement = document.getElementById("orderNotes");
  const toast = document.querySelector("[data-toast]");
  const searchInput = document.querySelector("[data-product-search]");
  const categorySelect = document.querySelector("[data-product-category]");
  const clearFiltersButton = document.querySelector("[data-clear-filters]");
  const resultsStatus = document.getElementById("productResultsStatus");
  const pagination = document.querySelector("[data-catalog-pagination]");
  const pageTabs = document.querySelector("[data-page-tabs]");
  const pageStatus = document.querySelector("[data-page-status]");
  const previousPageButton = document.querySelector('[data-page-action="previous"]');
  const nextPageButton = document.querySelector('[data-page-action="next"]');
  const PRODUCTS_PER_PAGE = 9;

  if (!productGrid || !drawer || !panel || !cartList || !cartEmpty || !cartSummary) return;

  let lastFocusedElement = null;
  let toastTimer = 0;
  let currentPage = 1;

  const escapeHTML = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const renderProductDetail = () => {
    if (!productDetail) return;
    const catalogSections = document.querySelectorAll("[data-store-catalog-section]");
    const product = products.find(item => item.id.toLocaleLowerCase() === requestedProductSlug.toLocaleLowerCase());
    const isDetailPage = Boolean(requestedProductSlug);
    catalogSections.forEach(section => { section.hidden = isDetailPage; });
    productDetail.hidden = !isDetailPage;
    productDetailBack.href = storeRoot.pathname;
    if (!isDetailPage) {
      document.title = "Loja | Mecânica 4 Tempos";
      return;
    }

    if (!product) {
      productDetailName.textContent = "Produto não encontrado";
      productDetailCategory.textContent = "Catálogo da loja";
      productDetailDescription.textContent = "Esse produto não está mais disponível no catálogo. Volte para a loja e escolha outro item.";
      productDetailPrice.textContent = "";
      productDetailImage.src = PRODUCT_IMAGE;
      productDetailImage.alt = "Produto sem imagem";
      productDetailAdd.hidden = true;
      productDetailShare.hidden = true;
      document.title = "Produto não encontrado | Loja";
      return;
    }

    productDetailName.textContent = product.name;
    productDetailCategory.textContent = product.category;
    productDetailDescription.textContent = product.description;
    productDetailPrice.textContent = formatCurrency(product.price);
    productDetailImage.src = product.image;
    productDetailImage.alt = `Foto ilustrativa de ${product.name}`;
    productDetailImage.onerror = () => { productDetailImage.onerror = null; productDetailImage.src = PRODUCT_IMAGE; };
    productDetailAdd.hidden = false;
    productDetailAdd.dataset.addProduct = product.id;
    const shareUrl = new URL(productUrl(product), window.location.href).href;
    productDetailShare.hidden = false;
    productDetailShare.href = `https://wa.me/?text=${encodeURIComponent(`Confira este produto da Mecânica 4 Tempos: ${product.name} - ${shareUrl}`)}`;
    productDetailShare.target = "_blank";
    productDetailShare.rel = "noopener noreferrer";
    document.title = `${product.name} | Mecânica 4 Tempos`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${product.name}: ${product.description}`);
  };

  const loadCart = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(item => productMap.has(item?.id))
        .map(item => ({ id: item.id, quantity: normalizeQuantity(item.quantity) }))
        .filter(item => item.quantity > 0);
    } catch {
      return [];
    }
  };

  const normalizeQuantity = quantity => {
    const parsed = Number.parseInt(quantity, 10);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 99) : 1;
  };

  let cart = loadCart();

  const saveCart = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      showToast("Não foi possível salvar o carrinho neste navegador.", true);
    }
  };

  const totalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const formatCurrency = value => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

  const subtotal = () => cart.reduce((total, item) => {
    const product = productMap.get(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const normalizeSearchText = value => String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

  const getFilteredProducts = () => {
    const searchTerm = normalizeSearchText(searchInput?.value || "");
    const category = categorySelect?.value || "";

    return products.filter(product => {
      const matchesSearch = !searchTerm || [product.name, product.category]
        .some(value => normalizeSearchText(value).includes(searchTerm));
      const matchesCategory = !category || product.category === category;
      return matchesSearch && matchesCategory;
    });
  };

  const updateFilterState = () => {
    const hasFilters = Boolean(searchInput?.value.trim() || categorySelect?.value);
    if (clearFiltersButton) clearFiltersButton.disabled = !hasFilters;
  };

  const updateCartCount = () => {
    const count = totalItems();
    cartCountElements.forEach(element => {
      element.textContent = String(count);
      element.setAttribute("aria-label", `${count} ${count === 1 ? "item" : "itens"}`);
    });
    document.querySelectorAll("[data-open-cart]").forEach(button => {
      button.setAttribute("aria-label", `Abrir carrinho, ${count} ${count === 1 ? "item" : "itens"}`);
    });
  };

  const renderPagination = pageCount => {
    if (!pagination || !pageTabs || !previousPageButton || !nextPageButton) return;

    pagination.hidden = pageCount <= 1;
    pageTabs.innerHTML = pageCount <= 1 ? "" : Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      const isCurrent = page === currentPage;
      return `<button class="catalog-pagination__page" type="button" data-page-number="${page}" aria-label="Ir para a página ${page}" aria-current="${isCurrent ? "page" : "false"}">${page}</button>`;
    }).join("");
    pageTabs.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });

    previousPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= pageCount;
    previousPageButton.setAttribute("aria-label", currentPage <= 1 ? "Você está na primeira página" : "Ver 9 produtos anteriores");
    nextPageButton.setAttribute("aria-label", currentPage >= pageCount ? "Você está na última página" : "Ver 9 próximos produtos");
    if (pageStatus) pageStatus.textContent = `Página ${currentPage} de ${pageCount} · até 9 produtos por página`;
  };

  const renderProducts = () => {
    const filteredProducts = getFilteredProducts();
    if (resultsStatus) {
      const count = filteredProducts.length;
      resultsStatus.textContent = `${count} ${count === 1 ? "produto encontrado" : "produtos encontrados"}`;
    }

    if (!filteredProducts.length) {
      currentPage = 1;
      productGrid.innerHTML = `
        <div class="catalog-empty">
          <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outro nome ou selecione outra categoria.</p>
        </div>`;
      renderPagination(0);
      updateFilterState();
      return;
    }

    const pageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    currentPage = Math.min(currentPage, pageCount);
    const firstProductIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = filteredProducts.slice(firstProductIndex, firstProductIndex + PRODUCTS_PER_PAGE);

    productGrid.innerHTML = pageProducts.map(product => `
      <article class="card card--interactive product-card">
        <a class="product-card__link" href="${escapeHTML(productUrl(product))}" aria-label="Ver detalhes de ${escapeHTML(product.name)}">
          <div class="product-card__visual"><img src="${escapeHTML(product.image)}" alt="Foto ilustrativa de ${escapeHTML(product.name)}" width="720" height="720" loading="lazy" decoding="async"></div>
          <div class="product-card__body">
            <span class="product-card__category">${escapeHTML(product.category)}</span>
            <h3>${escapeHTML(product.name)}</h3>
            <p class="product-card__description">${escapeHTML(product.description)}</p>
          </div>
        </a>
        <div class="product-card__footer">
          <span class="product-card__price"><small>Valor de referência</small><strong>${formatCurrency(product.price)}</strong></span>
          <button class="btn" type="button" data-add-product="${escapeHTML(product.id)}"><i class="fas fa-cart-plus" aria-hidden="true"></i> Comprar</button>
        </div>
      </article>`).join("");
    renderPagination(pageCount);
    updateFilterState();
  };

  const populateCategories = () => {
    if (!categorySelect) return;
    const categories = [...new Set(products.map(product => product.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    categorySelect.insertAdjacentHTML("beforeend", categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join(""));
  };

  const renderCart = () => {
    const hasItems = cart.length > 0;
    cartEmpty.hidden = hasItems;
    cartSummary.hidden = !hasItems;

    if (!hasItems) {
      cartList.innerHTML = "";
    } else {
      cartList.innerHTML = cart.map(item => {
        const product = productMap.get(item.id);
        return `
          <article class="cart-item">
            <span class="cart-item__icon" aria-hidden="true"><i class="fas ${escapeHTML(product.icon)}"></i></span>
            <div>
              <h3>${escapeHTML(product.name)}</h3>
              <p>${escapeHTML(product.category)} · ${formatCurrency(product.price)} / unidade</p>
              <span class="quantity-control" aria-label="Quantidade de ${escapeHTML(product.name)}">
                <button type="button" data-decrease="${escapeHTML(product.id)}" aria-label="Diminuir quantidade">−</button>
                <output>${item.quantity}</output>
                <button type="button" data-increase="${escapeHTML(product.id)}" aria-label="Aumentar quantidade">+</button>
              </span>
            </div>
            <button class="cart-item__remove" type="button" data-remove-product="${escapeHTML(product.id)}">Remover</button>
          </article>`;
      }).join("");
    }

    cartItemsElement.textContent = String(totalItems());
    cartSubtotalElement.textContent = formatCurrency(subtotal());
    updateCartCount();
  };

  const addToCart = id => {
    const product = productMap.get(id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity = Math.min(existing.quantity + 1, 99);
    else cart.push({ id, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${product.name} adicionado ao carrinho.`);
  };

  const changeQuantity = (id, amount) => {
    const item = cart.find(entry => entry.id === id);
    if (!item) return;
    item.quantity = Math.min(Math.max(item.quantity + amount, 0), 99);
    if (item.quantity === 0) cart = cart.filter(entry => entry.id !== id);
    saveCart();
    renderCart();
  };

  const removeFromCart = id => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  };

  const openCart = trigger => {
    lastFocusedElement = trigger || document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => panel.focus(), 0);
  };

  const closeCart = () => {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocusedElement && document.contains(lastFocusedElement)) lastFocusedElement.focus();
  };

  const showToast = (message, isError = false) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.style.background = isError ? "#b42318" : "#1a7f46";
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  const createOrderMessage = () => {
    const lines = [
      "Olá! Quero fazer um pedido pela Loja Mecânica 4 Tempos.",
      "",
      "ITENS DO PEDIDO:"
    ];

    cart.forEach((item, index) => {
      const product = productMap.get(item.id);
      const lineTotal = product.price * item.quantity;
      lines.push(`${index + 1}. ${product.name} — quantidade: ${item.quantity} — unitário: ${formatCurrency(product.price)} — parcial: ${formatCurrency(lineTotal)}`);
    });

    lines.push("", `Total de itens: ${totalItems()}`, `Subtotal estimado: ${formatCurrency(subtotal())}`, "Frete e valor final: confirmar com a equipe");
    const notes = notesElement?.value.trim();
    lines.push("", `Observações: ${notes || "Nenhuma"}`, "", "Pode confirmar disponibilidade, compatibilidade e valor final, por favor?");
    return lines.join("\n");
  };

  const checkout = () => {
    if (!cart.length) {
      showToast("Adicione pelo menos um produto ao carrinho.", true);
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(createOrderMessage())}`;
    const whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!whatsappWindow) window.location.assign(url);
  };

  productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add-product]");
    if (button) {
      addToCart(button.dataset.addProduct);
      openCart(button);
    }
  });

  productDetail?.addEventListener("click", event => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;
    addToCart(button.dataset.addProduct);
    openCart(button);
  });

  searchInput?.addEventListener("input", () => {
    currentPage = 1;
    renderProducts();
  });
  categorySelect?.addEventListener("change", () => {
    currentPage = 1;
    renderProducts();
  });
  clearFiltersButton?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "";
    currentPage = 1;
    renderProducts();
    searchInput?.focus();
  });

  pagination?.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page-number]");
    const actionButton = event.target.closest("[data-page-action]");
    const filteredProducts = getFilteredProducts();
    const pageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    let targetPage = currentPage;

    if (pageButton) targetPage = Number.parseInt(pageButton.dataset.pageNumber, 10);
    if (actionButton?.dataset.pageAction === "previous") targetPage = currentPage - 1;
    if (actionButton?.dataset.pageAction === "next") targetPage = currentPage + 1;
    if (!Number.isInteger(targetPage) || targetPage < 1 || targetPage > pageCount || targetPage === currentPage) return;

    currentPage = targetPage;
    renderProducts();
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.addEventListener("click", event => {
    const openButton = event.target.closest("[data-open-cart]");
    if (openButton) openCart(openButton);
    if (event.target.closest("[data-close-cart]")) closeCart();
    const increase = event.target.closest("[data-increase]");
    if (increase) changeQuantity(increase.dataset.increase, 1);
    const decrease = event.target.closest("[data-decrease]");
    if (decrease) changeQuantity(decrease.dataset.decrease, -1);
    const remove = event.target.closest("[data-remove-product]");
    if (remove) removeFromCart(remove.dataset.removeProduct);
    if (event.target.closest("[data-checkout]")) checkout();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) closeCart();
    if (event.key !== "Tab" || !drawer.classList.contains("is-open")) return;
    const focusable = [...drawer.querySelectorAll("button:not([disabled]), textarea, [href]")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    cart = loadCart();
    renderCart();
  });

  populateCategories();
  renderProducts();
  renderProductDetail();
  renderCart();
})();

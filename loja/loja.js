(() => {
  "use strict";

  const WHATSAPP_NUMBER = "553798700630";
  const STORAGE_KEY = "mecanica4tempos:loja:carrinho:v1";

  // Edite apenas esta lista para incluir ou alterar os produtos da loja.
  const products = [
    {
      id: "oleo-4-tempos",
      name: "Óleo para motor 4 tempos (1 L)",
      category: "Lubrificantes",
      description: "Óleo para manutenção de motores e equipamentos. Informe o modelo para confirmar a especificação.",
      icon: "fa-oil-can",
      image: "img/products/oleo-4-tempos.jpg",
      price: 39.90
    },
    {
      id: "filtro-de-ar",
      name: "Filtro de ar",
      category: "Filtros",
      description: "Filtro para reposição e manutenção preventiva. A aplicação é confirmada pela marca e modelo da máquina.",
      icon: "fa-wind",
      image: "img/products/filtro-de-ar.jpg",
      price: 34.90
    },
    {
      id: "vela-de-ignicao",
      name: "Vela de ignição",
      category: "Ignição",
      description: "Componente para motores de equipamentos. Envie o modelo do motor para validar a compatibilidade.",
      icon: "fa-bolt",
      image: "img/products/vela-de-ignicao.jpg",
      price: 29.90
    },
    {
      id: "pecas-originais",
      name: "Peças originais",
      category: "Peças e componentes",
      description: "Consulte peças originais para máquinas e equipamentos da construção civil.",
      icon: "fa-gears",
      image: "img/products/pecas-originais.jpg",
      price: 189.90
    },
    {
      id: "pecas-compativeis",
      name: "Peças compatíveis",
      category: "Peças e componentes",
      description: "Alternativas compatíveis avaliadas conforme o equipamento e a necessidade do serviço.",
      icon: "fa-puzzle-piece",
      image: "img/products/pecas-compativeis.jpg",
      price: 89.90
    },
    {
      id: "ferramentas-oficina",
      name: "Ferramentas para oficina",
      category: "Ferramentas",
      description: "Ferramentas e acessórios para apoiar a rotina de manutenção. Consulte os modelos disponíveis.",
      icon: "fa-screwdriver-wrench",
      image: "img/products/ferramentas-oficina.jpg",
      price: 249.90
    }
  ];

  const productMap = new Map(products.map(product => [product.id, product]));
  const productGrid = document.getElementById("productGrid");
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

  if (!productGrid || !drawer || !panel || !cartList || !cartEmpty || !cartSummary) return;

  let lastFocusedElement = null;
  let toastTimer = 0;

  const escapeHTML = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

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

  const renderProducts = () => {
    productGrid.innerHTML = products.map(product => `
      <article class="card card--interactive product-card">
        <div class="product-card__visual"><img src="${escapeHTML(product.image)}" alt="Foto ilustrativa de ${escapeHTML(product.name)}" width="720" height="720" loading="lazy" decoding="async"></div>
        <div class="product-card__body">
          <span class="product-card__category">${escapeHTML(product.category)}</span>
          <h3>${escapeHTML(product.name)}</h3>
          <p class="product-card__description">${escapeHTML(product.description)}</p>
          <div class="product-card__footer">
            <span class="product-card__price"><small>Valor de referência</small><strong>${formatCurrency(product.price)}</strong></span>
            <button class="btn" type="button" data-add-product="${escapeHTML(product.id)}"><i class="fas fa-cart-plus" aria-hidden="true"></i> Comprar</button>
          </div>
        </div>
      </article>`).join("");
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

  renderProducts();
  renderCart();
})();

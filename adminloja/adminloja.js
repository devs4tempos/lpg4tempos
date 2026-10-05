(() => {
  "use strict";

  const PLACEHOLDER_IMAGE = "../loja/img/products/produto-sem-imagem.svg";
  const state = { products: [], categories: [], revision: "", categoriesRevision: "", currentId: "", csrfToken: "", dirty: false, toastTimer: 0 };
  const $ = selector => document.querySelector(selector);
  const loginView = $("#loginView");
  const dashboardView = $("#dashboardView");
  const loginForm = $("[data-login-form]");
  const loginError = $("[data-login-error]");
  const productList = $("[data-product-list]");
  const productCount = $("[data-product-count]");
  const editor = $("[data-product-editor]");
  const editorEmpty = $("[data-editor-empty]");
  const pageSearch = $("[data-admin-search]");
  const categoryFilter = $("[data-admin-category]");
  const categoryOptions = $("#categoryOptions");
  const categoryForm = $("[data-category-form]");
  const newCategory = $("[data-new-category]");
  const categoryList = $("[data-category-list]");
  const categoryCount = $("[data-category-count]");
  const saveStatus = $("[data-save-status]");
  const draftBadge = $("[data-draft-badge]");
  const toast = $("[data-admin-toast]");
  const field = name => editor?.querySelector(`[data-field="${name}"]`);

  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const showToast = (message, isError = false) => {
    if (!toast) return;
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
  };

  const setLoginError = message => {
    loginError.textContent = message || "";
    loginError.hidden = !message;
  };

  const api = async (url, options = {}) => {
    const response = await fetch(url, { credentials: "same-origin", cache: "no-store", ...options });
    let payload = {};
    try { payload = await response.json(); } catch { /* resposta sem JSON */ }
    if (!response.ok) throw new Error(payload.error || `Falha na comunicação (${response.status}).`);
    return payload;
  };

  const currentProduct = () => state.products.find(product => product.id === state.currentId) || null;

  const imageSource = value => {
    if (!value) return PLACEHOLDER_IMAGE;
    return value.startsWith("img/") ? `../loja/${value}` : value;
  };

  const renderCategories = () => {
    const categories = [...new Set([...state.categories, ...state.products.map(product => product.category).filter(Boolean)])].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const selected = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">Todas as categorias</option>' + categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
    categoryFilter.value = categories.includes(selected) ? selected : "";
    categoryOptions.innerHTML = categories.map(category => `<option value="${escapeHTML(category)}"></option>`).join("");
  };

  const renderCategoryManager = () => {
    if (!categoryList || !categoryCount) return;
    const categories = [...state.categories].sort((a, b) => a.localeCompare(b, "pt-BR"));
    categoryCount.textContent = String(categories.length);
    categoryList.classList.toggle("category-list--empty", !categories.length);
    categoryList.innerHTML = categories.length
      ? categories.map(category => `
          <span class="category-chip">
            <span>${escapeHTML(category)}</span>
            <button type="button" data-delete-category="${escapeHTML(category)}" aria-label="Excluir categoria ${escapeHTML(category)}">&times;</button>
          </span>`).join("")
      : "Nenhuma categoria cadastrada.";
  };

  const filteredProducts = () => {
    const term = pageSearch.value.trim().toLocaleLowerCase("pt-BR");
    const category = categoryFilter.value;
    return state.products.filter(product => {
      const matchesText = !term || `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesText && (!category || product.category === category);
    });
  };

  const renderList = () => {
    const visible = filteredProducts();
    productCount.textContent = String(state.products.length);
    if (!visible.length) {
      productList.innerHTML = '<p class="list-empty">Nenhum produto corresponde aos filtros.</p>';
      return;
    }
    productList.innerHTML = visible.map(product => `
      <button class="product-row${product.id === state.currentId ? " is-selected" : ""}" type="button" data-select-product="${escapeHTML(product.id)}">
        <img src="${escapeHTML(imageSource(product.image))}" alt="" loading="lazy">
        <span><strong class="product-row__name">${escapeHTML(product.name)}</strong><small class="product-row__meta">${escapeHTML(product.category)} · R$ ${Number(product.price).toFixed(2).replace(".", ",")}</small></span>
      </button>`).join("");
  };

  const setPreview = product => {
    const preview = $("[data-image-preview]");
    if (!preview) return;
    preview.onerror = () => { preview.onerror = null; preview.src = PLACEHOLDER_IMAGE; };
    preview.src = imageSource(product?.image);
  };

  const populateEditor = () => {
    const product = currentProduct();
    editor.hidden = !product;
    editorEmpty.hidden = Boolean(product);
    if (!product) return;
    ["id", "name", "price", "category", "description", "image", "icon"].forEach(name => {
      const input = field(name);
      if (input) input.value = product[name] ?? "";
    });
    setPreview(product);
    draftBadge.hidden = !state.dirty;
  };

  const syncCurrentProduct = () => {
    const product = currentProduct();
    if (!product) return;
    product.name = field("name").value.trim();
    product.price = Number(field("price").value);
    product.category = field("category").value.trim();
    product.description = field("description").value.trim();
    product.image = field("image").value.trim();
    product.icon = field("icon").value.trim() || "fa-gears";
    if (product.category && !state.categories.some(item => item.toLocaleLowerCase("pt-BR") === product.category.toLocaleLowerCase("pt-BR"))) {
      state.categories.push(product.category);
    }
  };

  const markDirty = () => {
    state.dirty = true;
    draftBadge.hidden = false;
    saveStatus.textContent = "Há alterações no rascunho. Salve para publicar.";
  };

  const render = () => {
    renderCategories();
    renderCategoryManager();
    renderList();
    populateEditor();
  };

  const loadCatalog = async () => {
    const payload = await api("../api/admin/products");
    state.products = Array.isArray(payload.products) ? payload.products : [];
    state.categories = Array.isArray(payload.categories) ? payload.categories : [...new Set(state.products.map(product => product.category).filter(Boolean))];
    state.revision = payload.revision || "";
    state.categoriesRevision = payload.categoriesRevision || "";
    state.currentId = state.products[0]?.id || "";
    state.dirty = false;
    saveStatus.textContent = `${state.products.length} produtos carregados.`;
    render();
  };

  const openDashboard = async payload => {
    state.csrfToken = payload.csrfToken || state.csrfToken;
    $("[data-session-user]").textContent = payload.username ? `Olá, ${payload.username}` : "Sessão ativa";
    loginView.hidden = true;
    dashboardView.hidden = false;
    try { await loadCatalog(); } catch (error) { showToast(error.message, true); }
  };

  const handleLogin = async event => {
    event.preventDefault();
    setLoginError("");
    const submitButton = loginForm.querySelector("button[type=submit]");
    submitButton.disabled = true;
    try {
      const formData = new FormData(loginForm);
      await openDashboard(await api("../api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") })
      }));
      loginForm.reset();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      submitButton.disabled = false;
    }
  };

  const saveCatalog = async () => {
    syncCurrentProduct();
    const payload = await api("../api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": state.csrfToken },
      body: JSON.stringify({
        products: state.products,
        categories: state.categories,
        revision: state.revision,
        categoriesRevision: state.categoriesRevision
      })
    });
    state.products = payload.products;
    state.categories = payload.categories;
    state.revision = payload.revision;
    state.categoriesRevision = payload.categoriesRevision;
    state.dirty = false;
    saveStatus.textContent = `Salvo com sucesso às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`;
    render();
    showToast("Alterações publicadas para a loja.");
  };

  const createProduct = () => {
    syncCurrentProduct();
    const product = {
      id: `produto-${Date.now()}`,
      name: "Novo produto",
      price: 0,
      category: state.categories[0] || "Peças e componentes",
      description: "Descreva o produto e confirme a aplicação antes da compra.",
      icon: "fa-gears",
      image: "/loja/img/products/produto-sem-imagem.svg"
    };
    state.products.unshift(product);
    state.currentId = product.id;
    markDirty();
    render();
    field("name")?.focus();
  };

  const deleteCurrentProduct = () => {
    const product = currentProduct();
    if (!product) return;
    if (!window.confirm(`Excluir “${product.name}” do rascunho?`)) return;
    state.products = state.products.filter(item => item.id !== product.id);
    state.currentId = state.products[0]?.id || "";
    markDirty();
    render();
  };

  const resizeImage = file => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 1200;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", .82));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Não foi possível ler essa imagem.")); };
    image.src = objectUrl;
  });

  loginForm.addEventListener("submit", handleLogin);
  pageSearch.addEventListener("input", renderList);
  categoryFilter.addEventListener("change", renderList);
  categoryForm.addEventListener("submit", event => {
    event.preventDefault();
    const category = newCategory.value.trim();
    if (!category) return;
    if (state.categories.some(item => item.toLocaleLowerCase("pt-BR") === category.toLocaleLowerCase("pt-BR"))) {
      showToast("Essa categoria já existe.", true);
      return;
    }
    state.categories.push(category);
    state.categories.sort((left, right) => left.localeCompare(right, "pt-BR"));
    newCategory.value = "";
    markDirty();
    render();
    newCategory.focus();
  });
  categoryList.addEventListener("click", event => {
    const button = event.target.closest("[data-delete-category]");
    if (!button) return;
    const category = button.dataset.deleteCategory;
    if (state.products.some(product => product.category === category)) {
      showToast("Altere primeiro os produtos que usam essa categoria.", true);
      return;
    }
    if (!window.confirm(`Excluir a categoria “${category}”?`)) return;
    state.categories = state.categories.filter(item => item !== category);
    if (categoryFilter.value === category) categoryFilter.value = "";
    markDirty();
    render();
  });
  $("[data-new-product]").addEventListener("click", createProduct);
  $("[data-save-all]").addEventListener("click", async () => {
    try { await saveCatalog(); } catch (error) { showToast(error.message, true); }
  });
  $("[data-delete-product]").addEventListener("click", deleteCurrentProduct);
  $("[data-logout]").addEventListener("click", async () => {
    try {
      await api("../api/admin/logout", { method: "POST", headers: { "X-CSRF-Token": state.csrfToken } });
    } finally {
      window.location.reload();
    }
  });
  productList.addEventListener("click", event => {
    const button = event.target.closest("[data-select-product]");
    if (!button) return;
    syncCurrentProduct();
    state.currentId = button.dataset.selectProduct;
    renderList();
    populateEditor();
  });
  editor.addEventListener("input", event => {
    const product = currentProduct();
    if (!product || !event.target.dataset.field) return;
    if (event.target.dataset.field === "image") setPreview({ image: event.target.value });
    markDirty();
  });
  editor.addEventListener("submit", event => {
    event.preventDefault();
    syncCurrentProduct();
    const product = currentProduct();
    if (!product.name || !product.category || !Number.isFinite(product.price) || product.price < 0) {
      showToast("Preencha nome, categoria e preço corretamente.", true);
      return;
    }
    markDirty();
    renderList();
    showToast("Alteração aplicada ao rascunho.");
  });
  $("[data-image-file]").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      field("image").value = await resizeImage(file);
      setPreview({ image: field("image").value });
      markDirty();
      showToast("Imagem preparada. Clique em salvar para publicar.");
    } catch (error) { showToast(error.message, true); }
  });

  window.addEventListener("beforeunload", event => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  (async () => {
    try {
      await openDashboard(await api("../api/admin/session"));
    } catch {
      loginView.hidden = false;
      dashboardView.hidden = true;
    }
  })();
})();

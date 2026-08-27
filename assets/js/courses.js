(() => {
  const courses = [
    {
      id: 1,
      code: "KIT",
      number: "01",
      category: "Kit completo",
      title: "KIT Manutenção Completa: Percussão + GXR120",
      lead: "Dois treinamentos técnicos reunidos em uma formação completa.",
      description: "Um kit pensado para profissionais que desejam dominar a manutenção de equipamentos de percussão e do motor GXR120 em uma jornada integrada.",
      modules: ["Conteúdo programático em definição", "Certificado de conclusão incluso", "Suporte via WhatsApp durante o treinamento"],
      moduleLabel: "Programa em definição",
      price: "R$ 1.090,00",
      checkout: "https://pay.kiwify.com.br/Ob59J7V",
      payment: "Compra segura pela Kiwify"
    },
    {
      id: 2,
      code: "120",
      number: "02",
      category: "Motores compactos",
      title: "Manutenção Completa em Motores GXR120",
      lead: "Conheça o motor GXR120 e revise seus principais sistemas.",
      description: "Treinamento direcionado ao diagnóstico, desmontagem, inspeção e manutenção do motor GXR120 usado em equipamentos profissionais.",
      modules: ["Conteúdo programático em definição", "Certificado de conclusão incluso", "Suporte via WhatsApp durante o treinamento"],
      moduleLabel: "Programa em definição",
      price: "R$ 698,00",
      checkout: "https://pay.kiwify.com.br/xVkjNIP",
      payment: "Compra segura pela Kiwify"
    },
    {
      id: 3,
      code: "4T",
      number: "03",
      category: "Formação técnica",
      title: "Manutenção Completa em Motores Estacionários",
      lead: "Aprenda uma sequência clara para diagnosticar e revisar motores estacionários.",
      description: "Uma formação prática para compreender o funcionamento, identificar falhas e executar a manutenção de motores estacionários com mais método e segurança.",
      modules: ["Fundamentos do motor quatro tempos", "Sistemas de alimentação e ignição", "Diagnóstico e medições", "Desmontagem e inspeção", "Montagem, regulagem e testes"],
      moduleLabel: "5 módulos",
      price: "R$ 497,00",
      checkout: "https://pay.kiwify.com.br/YPJV4mT",
      payment: "Compra segura pela Kiwify"
    },
    {
      id: 4,
      code: "P",
      number: "04",
      category: "Equipamentos de obra",
      title: "Manutenção Completa em Percussões",
      lead: "Entenda os sistemas e a rotina de manutenção dos compactadores de percussão.",
      description: "Treinamento voltado à inspeção, diagnóstico e manutenção de equipamentos de percussão usados na compactação de solo.",
      modules: ["Conteúdo programático em definição", "Certificado de conclusão incluso", "Suporte via WhatsApp durante o treinamento"],
      moduleLabel: "Programa em definição",
      price: "R$ 698,00",
      checkout: "https://pay.kiwify.com.br/iG7gsJJ",
      payment: "Compra segura pela Kiwify"
    },
    {
      id: 5,
      code: "C",
      number: "05",
      category: "Revisão essencial",
      title: "Revisão Completa em Carburadores",
      lead: "Domine a inspeção, limpeza e validação de carburadores de pequenos motores.",
      description: "Conteúdo objetivo para reconhecer componentes, identificar sintomas e executar uma rotina de revisão de carburadores com organização.",
      modules: ["Funcionamento, desmontagem e inspeção", "Limpeza, montagem, regulagem e testes"],
      moduleLabel: "2 módulos",
      price: "R$ 59,00",
      checkout: "https://pay.kiwify.com.br/hoavDmm",
      payment: "Compra segura pela Kiwify"
    },
    {
      id: 6,
      code: "G",
      number: "06",
      category: "Equipamentos de elevação",
      title: "Manutenção Completa em Guincho de Coluna",
      lead: "Aprenda a revisar o guincho de coluna com método, segurança e confiança.",
      description: "Formação completa para profissionais e locadores que desejam compreender os principais sistemas, identificar falhas e executar a manutenção de guinchos.",
      modules: ["Fundamentos e segurança", "Inspeção e diagnóstico", "Sistema elétrico e componentes", "Manutenção preventiva", "Testes finais e entrega"],
      moduleLabel: "5 módulos",
      price: "R$ 799,00",
      checkout: "https://pay.kiwify.com.br/BKXvtD7",
      payment: "Compra segura pela Kiwify"
    },
    {
      id: 7,
      code: "GEN",
      number: "07",
      category: "Energia",
      title: "Manutenção Completa em Geradores",
      lead: "Formação dedicada aos sistemas de geração, diagnóstico e manutenção.",
      description: "Treinamento para profissionais que desejam atuar com inspeção, diagnóstico e manutenção de geradores portáteis.",
      modules: ["Conteúdo programático em definição", "Certificado de conclusão incluso", "Suporte via WhatsApp durante o treinamento"],
      moduleLabel: "Programa em definição",
      price: "Consulte",
      checkout: "https://wa.me/5537998060444?text=Olá%2C%20quero%20me%20inscrever%20no%20treinamento%20de%20Geradores.",
      payment: "Inscrição disponível pelo atendimento da 4 Tempos"
    }
  ];

  const track = document.getElementById("courseTrack");
  const modal = document.getElementById("courseModal");
  if (!track || !modal) return;

  const dialog = modal.querySelector(".course-dialog");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocused = null;
  let closeTimer = null;

  const renderCard = course => `
    <button class="course-card" type="button" aria-label="Ver detalhes de ${course.title}" data-course-id="${course.id}">
      <span class="course-card__top">
        <span class="course-card__status">Disponível</span>
        <span class="course-card__code">${course.code}</span>
        <span class="course-card__number" aria-hidden="true">${course.number}</span>
      </span>
      <span class="course-card__body">
        <span class="course-card__category">${course.category}</span>
        <span role="heading" aria-level="3">${course.title}</span>
        <span class="course-card__summary">${course.moduleLabel}</span>
        <span class="course-benefits"><span>Certificado de conclusão</span><span>Suporte via WhatsApp</span></span>
        <span class="course-card__footer">
          <span class="course-price"><small>Investimento</small><strong>${course.price}</strong></span>
          <span class="course-details">Ver detalhes →</span>
        </span>
      </span>
    </button>`;

  track.innerHTML = courses.map(renderCard).join("");

  const openCourse = id => {
    const course = courses.find(item => item.id === Number(id));
    if (!course) return;

    window.clearTimeout(closeTimer);
    lastFocused = document.activeElement;
    document.getElementById("modalCode").textContent = course.number;
    document.getElementById("modalTitle").textContent = course.title;
    document.getElementById("modalLead").textContent = course.lead;
    document.getElementById("modalDescription").textContent = course.description;
    document.getElementById("modalModules").innerHTML = course.modules.map(item => `<li>${item}</li>`).join("");
    document.getElementById("modalPrice").textContent = course.price;
    document.getElementById("modalPayment").textContent = course.payment;
    document.getElementById("modalAction").innerHTML = `<a class="btn" href="${course.checkout}" target="_blank" rel="noopener noreferrer">${course.id === 7 ? "Solicitar inscrição" : "Comprar treinamento"} →</a>`;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    window.setTimeout(() => dialog.focus(), reduceMotion ? 0 : 30);
  };

  const closeModal = () => {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    closeTimer = window.setTimeout(() => {
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }, reduceMotion ? 0 : 240);
  };

  document.addEventListener("click", event => {
    const card = event.target.closest("[data-course-id]");
    if (card) openCourse(card.dataset.courseId);
    if (event.target.closest("[data-close-modal]")) closeModal();

    const control = event.target.closest("[data-scroll]");
    if (!control) return;
    const direction = control.dataset.scroll === "next" ? 1 : -1;
    track.scrollBy({ left: Math.min(track.clientWidth * 0.86, 760) * direction, behavior: reduceMotion ? "auto" : "smooth" });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    if (event.key !== "Tab" || !modal.classList.contains("is-open")) return;

    const focusable = [...modal.querySelectorAll("button:not([disabled]), a[href]")];
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
})();

/*
  CATÁLOGO DA LOJA
  ----------------
  Para adicionar um produto: copie um bloco entre { ... }, cole antes do ]; e altere os dados.
  Para retirar um produto: apague o bloco inteiro ou troque "active: true" por "active: false".
  Para adicionar imagens: coloque os arquivos em assets/produtos e inclua os caminhos em "images".
  Exemplo: images: ["./assets/produtos/frente.webp", "./assets/produtos/lado.webp"]

  Preço deve ser número, sem R$ e usando ponto para centavos. Exemplo: price: 149.90
  O slug vira a URL do produto: /loja/meu-produto
*/

window.LOJA_CONFIG = {
  whatsapp: "5537998060444",
  basePath: "/loja/",
  currency: "BRL",
  locale: "pt-BR",
};

window.PRODUCTS = [
  {
    slug: "bulbo-injetor",
    name: "Bulbo injetor",
    code: "M4T-001",
    category: "Peças",
    price: 10,
    active: true,
    featured: false,
    shortDescription: "Bulbo de combustível para roçadeiras.",
    description: "Bulbo injetor para auxiliar a alimentação de combustível em roçadeiras. Peça compacta e de substituição simples.",
    details: ["Aplicação: roçadeiras", "Consulte compatibilidade antes da compra", "Venda por unidade"],
    images: ["./assets/produtos/bulbo-injetor.webp"],
  },
  {
    slug: "carburador-26",
    name: "Carburador 26",
    code: "M4T-026",
    category: "Peças",
    price: 150,
    active: true,
    featured: true,
    shortDescription: "Carburador para motores e equipamentos compatíveis.",
    description: "Carburador modelo 26 para reposição. Entre em contato para confirmar a aplicação correta no seu equipamento.",
    details: ["Modelo: 26", "Produto novo", "Compatibilidade sob consulta"],
    images: ["./assets/produtos/carburador-26.webp"],
  },
  {
    slug: "carburador-43",
    name: "Carburador 43",
    code: "M4T-043",
    category: "Peças",
    price: 150,
    active: true,
    featured: false,
    shortDescription: "Carburador para roçadeiras de 43 cc.",
    description: "Carburador de reposição para roçadeiras e equipamentos 43 cc compatíveis. Confirme o modelo com nossa equipe.",
    details: ["Aplicação: equipamentos 43 cc", "Produto novo", "Venda por unidade"],
    images: ["./assets/produtos/carburador-43.webp"],
  },
  {
    slug: "compactador-de-solo-vibromak",
    name: "Compactador de solo Vibromak",
    code: "M4T-VBK01",
    category: "Máquinas",
    price: 15980,
    active: true,
    featured: true,
    shortDescription: "Compactador robusto para obras e preparação de solo.",
    description: "Equipamento indicado para compactação de solo em obras, valas e reparos. Consulte disponibilidade e condições de entrega.",
    details: ["Marca: Vibromak", "Aplicação profissional", "Entrega e garantia sob consulta"],
    images: ["./assets/produtos/compactador-vibromak.webp"],
  },
  {
    slug: "rocadeira-kws-43cc-serie-e",
    name: "Roçadeira KWS 43cc Série E",
    code: "M4T-KWS43",
    category: "Máquinas",
    price: 1150,
    active: true,
    featured: true,
    shortDescription: "Roçadeira a gasolina para uso profissional.",
    description: "Roçadeira KWS 43 cc Série E, indicada para limpeza de terrenos e manutenção de áreas verdes.",
    details: ["Motor: 43 cc", "Uso profissional", "Consulte itens inclusos"],
    images: ["./assets/produtos/rocadeira-kws-43cc.webp"],
  },
  {
    slug: "vela-de-rocadeira",
    name: "Vela de roçadeira",
    code: "M4T-VR035",
    category: "Peças",
    price: 35,
    active: true,
    featured: false,
    shortDescription: "Vela de ignição para roçadeiras compatíveis.",
    description: "Vela de ignição para manutenção e reposição em roçadeiras. Confirme o modelo indicado para seu equipamento.",
    details: ["Aplicação: roçadeiras", "Peça de reposição", "Compatibilidade sob consulta"],
    images: ["./assets/produtos/vela-rocadeira.webp"],
  },
];

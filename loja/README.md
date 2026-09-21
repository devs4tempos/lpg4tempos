# Loja Mecânica 4 Tempos

Esta pasta foi preparada para ser publicada inteira em `https://mecanica4tempos.com/loja/`.

## Editar produtos

Abra `data/products.js`. Cada produto é um bloco com nome, código, categoria, preço, descrições e lista de imagens. O próprio arquivo contém instruções e um exemplo no início.

- Adicionar: copie um bloco de produto e altere os dados.
- Ocultar: altere `active: true` para `active: false`.
- Excluir: apague o bloco completo.
- Adicionar imagens: copie os arquivos para `assets/produtos/` e inclua os caminhos dentro de `images`.
- Alterar o WhatsApp: edite `whatsapp` dentro de `LOJA_CONFIG`.

## Publicar

Envie esta pasta completa, mantendo o nome `loja`, para a raiz pública do site. O arquivo `.htaccess` permite URLs amigáveis como `/loja/bulbo-injetor` em hospedagens Apache/cPanel.

Se a hospedagem usar Nginx, peça ao suporte para direcionar qualquer URL `/loja/*` que não seja um arquivo real para `/loja/index.html`.

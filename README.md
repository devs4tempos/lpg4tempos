# Mecânica 4 Tempos

Site institucional com páginas de serviços, treinamentos, blog e cartão digital.

## Painel administrativo

O painel permite editar com segurança os arquivos de conteúdo, estilo e comportamento do site. Ele usa autenticação no servidor, sessão protegida, bloqueio de tentativas repetidas, proteção CSRF, validação de caminhos, cópias automáticas antes de cada alteração e registro de auditoria.

1. Mantenha o arquivo `.env` apenas no servidor e nunca o envie ao repositório.
2. Execute `npm start`.
3. Abra `http://localhost:3000/admin`.

Para publicar na Vercel com alterações persistentes em qualquer dispositivo, siga o arquivo `GUIA-VERCEL.md`. A versão em produção usa Vercel Functions e Upstash Redis; nenhuma senha é enviada no código do navegador.

Antes de publicar, troque `NODE_ENV` para `production`, use `HOST=0.0.0.0`, gere um novo `SESSION_SECRET` com alta entropia e confira `ALLOWED_HOSTS`. Não use o servidor diretamente na internet sem HTTPS e sem um proxy reverso configurado corretamente.

## Verificação

Execute `npm run check` para validar a sintaxe do servidor e do painel.

# Configuração da Admin Loja na Vercel

O painel em `/adminloja/` salva o catálogo no Redis. Depois da configuração inicial, as alterações feitas no painel aparecem para todos os visitantes sem novo deploy.

## Configuração única

1. Na Vercel, importe ou abra o projeto `Mecânica 4 Tempos`.
2. Abra **Storage → Create Database → Upstash Redis** e conecte a base ao projeto.
3. Em **Settings → Environment Variables**, configure para Production e Preview:

```text
ADMIN_USER=AdmAdmin
ADMIN_PASSWORD=coloque-a-senha-definida-por-voce
SESSION_SECRET=gere-uma-chave-aleatoria-com-pelo-menos-32-caracteres
ALLOWED_HOSTS=seu-projeto.vercel.app,seu-dominio.com
```

As variáveis do Redis são criadas pela integração. O código aceita `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`, além dos nomes `KV_REST_API_URL` e `KV_REST_API_TOKEN`.

4. Faça um redeploy uma única vez para aplicar as variáveis.
5. Acesse `https://seu-dominio.vercel.app/adminloja/`.

## Uso diário

- Entre com o usuário e a senha configurados.
- Selecione um produto ou clique em **Adicionar produto**.
- Edite nome, preço, categoria, descrição e imagem.
- Use o bloco **Categorias** para adicionar categorias novas ou excluir categorias que não estejam em uso.
- Para imagens, informe um caminho/URL ou selecione um arquivo no próprio painel.
- Clique em **Aplicar no rascunho** e depois em **Salvar alterações**.

Cada produto abre em um endereço próprio, por exemplo:
`https://seu-dominio.vercel.app/loja/agulha-13cv-1`

O arquivo `vercel.json` já contém a regra para a Vercel entregar a página de detalhes sem alterar o endereço compartilhado.

O painel usa sessão no servidor, proteção CSRF e controle de conflito para impedir que uma edição sobrescreva outra silenciosamente. A senha não fica exposta no JavaScript da loja.

## Observação importante

Não remova o Redis da Vercel. Sem ele, a loja continuará usando o catálogo publicado e o painel não conseguirá persistir alterações para todos os visitantes.

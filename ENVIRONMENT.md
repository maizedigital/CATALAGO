# Variáveis de Ambiente — MB

Este documento lista todas as variáveis de ambiente utilizadas pelo projeto.

## Variáveis do Frontend (Vite)

Estas variáveis são expostas publicamente no bundle do navegador (prefixo `VITE_`).
**Não** coloque segredos privados (service role keys, senhas) com o prefixo `VITE_`.

| Variável | Descrição | Pública? |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxx.supabase.co`) | Sim — visível no frontend |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (anon key) do Supabase para leitura pública do catálogo e escrita de leads/eventos | Sim — visível no frontend, projetada para exposição |

### Arquivo `.env`

O arquivo `.env` contém as duas variáveis acima e **estão no .gitignore** — não devem ser comitadas.
Para recriar o `.env` em um novo ambiente:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Variáveis do Backend (Edge Functions — Deno)

Estas variáveis são configuradas no painel do Supabase (Edge Functions > Secrets).
**Nunca** devem aparecer no código-fonte ou no `.env` do frontend.

| Variável | Descrição | Pública? |
|---|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (mesma do frontend, mas usada no servidor) | Privada — apenas no runtime das Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key do Supabase — acesso total ao banco e storage. Usada pelas Edge Functions `admin-api` e `admin-login` | **PRIVADA — nunca expor no frontend** |

## Notas

- O projeto **não possui** autenticação Supabase nativa (Auth). A autenticação do admin é feita via Edge Function customizada (`admin-login`) que valida credenciais contra a tabela `admin_users` usando bcrypt (`pgcrypto`).
- O projeto **não usa** Stripe, payment gateways, ou outras integrações de terceiros que requeiram chaves de API.
- O checkout é feito via WhatsApp — não há processamento de pagamento no código.

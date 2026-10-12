/*
# Cadastro público com telefone e CPF

1. Alterações na tabela `customers`
- Adiciona `auth_user_id` para vincular o cliente do CRM à conta autenticada correspondente.
- Mantém as colunas existentes `name`, `whatsapp` e `cpf` como fonte dos dados solicitados no cadastro.
- Cria um índice para localizar rapidamente o cliente autenticado por catálogo e telefone.

2. Segurança
- Cria a função protegida `register_public_customer`.
- A função usa `auth.uid()` para definir o vínculo da conta e executa com permissões do banco.
- O navegador não recebe permissão de INSERT ou UPDATE amplo no CRM para realizar o cadastro.
- Apenas usuários autenticados podem executar a função; o papel anônimo não pode chamá-la.

3. Compatibilidade e dados existentes
- Nenhuma coluna existente é removida ou renomeada.
- Nenhum cliente existente é apagado.
- Clientes já cadastrados continuam disponíveis no painel administrativo.
*/

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_auth_catalog_phone
  ON public.customers (auth_user_id, catalog_id, whatsapp);

CREATE OR REPLACE FUNCTION public.register_public_customer(
  p_name text,
  p_whatsapp text,
  p_cpf text,
  p_catalog_id uuid
)
RETURNS public.customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer public.customers;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF length(trim(coalesce(p_name, ''))) < 3
     OR length(regexp_replace(coalesce(p_whatsapp, ''), '\\D', '', 'g')) NOT BETWEEN 10 AND 11
     OR length(regexp_replace(coalesce(p_cpf, ''), '\\D', '', 'g')) <> 11 THEN
    RAISE EXCEPTION 'Invalid customer data';
  END IF;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE catalog_id = p_catalog_id
    AND whatsapp = regexp_replace(p_whatsapp, '\\D', '', 'g')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_customer.id IS NULL THEN
    INSERT INTO public.customers (
      name, whatsapp, cpf, origin, status, auth_user_id, catalog_id,
      first_contact, last_contact, updated_at
    ) VALUES (
      trim(p_name),
      regexp_replace(p_whatsapp, '\\D', '', 'g'),
      regexp_replace(p_cpf, '\\D', '', 'g'),
      'site', 'novo', v_user_id, p_catalog_id,
      now(), now(), now()
    )
    RETURNING * INTO v_customer;
  ELSE
    UPDATE public.customers
    SET name = trim(p_name),
        cpf = regexp_replace(p_cpf, '\\D', '', 'g'),
        auth_user_id = v_user_id,
        last_contact = now(),
        updated_at = now()
    WHERE id = v_customer.id
    RETURNING * INTO v_customer;
  END IF;

  RETURN v_customer;
END;
$$;

REVOKE ALL ON FUNCTION public.register_public_customer(text, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_public_customer(text, text, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.register_public_customer(text, text, text, uuid) TO authenticated;

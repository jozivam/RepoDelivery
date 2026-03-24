# Supabase

Estrutura reservada para as próximas etapas:

- `migrations/`: schema incremental do banco
- `seed.sql`: dados opcionais de desenvolvimento
- `policies.sql`: políticas RLS quando a modelagem estiver fechada

Regra: produção deve funcionar com banco limpo. Qualquer seed precisa ser opcional e removível.

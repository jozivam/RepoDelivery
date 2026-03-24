# Publicar no GitHub usando apenas navegador (sem Linux local)

Data: 2026-03-24

## Situação real deste ambiente

Na sessão atual do Codex, a tentativa de `git push` para `https://github.com/jozivam/RepoDelivery.git` falhou com:

`CONNECT tunnel failed, response 403`

Isso significa bloqueio de rede/proxy do ambiente da sessão, não erro do seu projeto.

## Como publicar sem usar terminal local

### Opção A (mais rápida): Upload direto pelo site do GitHub

1. Abra `https://github.com/jozivam/RepoDelivery`.
2. Clique em **Add file** > **Upload files**.
3. Envie estes arquivos/pastas deste projeto:
   - `app/main.py`
   - `tests/test_api.py`
   - `requirements.txt`
   - `README.md`
   - `scripts/publicar_github.sh`
4. Commit no próprio GitHub com mensagem: `feat: mvp inicial api`.

### Opção B: Criar arquivos manualmente no GitHub

1. **Add file** > **Create new file**.
2. Crie os mesmos caminhos acima e cole o conteúdo.
3. Commit direto na branch principal.

## O que já está pronto para publicar

- API FastAPI mínima (`app/main.py`)
- testes (`tests/test_api.py`)
- dependências (`requirements.txt`)
- documentação (`README.md`)

## Resumo

Você não está errado: com bloqueio 403 neste ambiente, eu não consigo empurrar para seu GitHub daqui.
Mas o projeto está pronto e pode ser publicado 100% via interface web do GitHub, sem Linux local.

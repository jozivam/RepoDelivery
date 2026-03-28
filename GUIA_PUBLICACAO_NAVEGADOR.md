# Instruções para GitHub Web (GitWeb) — sem terminal

Data: 2026-03-24

## Situação real deste ambiente

Na sessão atual do Codex, `git push` para `https://github.com/jozivam/RepoDelivery.git` falha com:

`CONNECT tunnel failed, response 403`

Então a publicação precisa ser feita via interface web do GitHub.

## Passo a passo no GitHub Web (GitWeb)

### 1) Abrir o repositório no navegador

Acesse: `https://github.com/jozivam/RepoDelivery`

### 2) Subir os arquivos pelo botão Upload

1. Clique em **Add file**.
2. Clique em **Upload files**.
3. Arraste/seleciona os arquivos:
   - `app/main.py`
   - `tests/test_api.py`
   - `requirements.txt`
   - `README.md`
   - `scripts/publicar_github.sh`
4. Em mensagem de commit, use: `feat: mvp inicial api`.
5. Clique em **Commit changes**.

### 3) Alternativa: criar arquivo por arquivo

1. **Add file** > **Create new file**.
2. Crie o caminho completo (ex.: `app/main.py`).
3. Cole conteúdo.
4. **Commit changes**.
5. Repita para os demais arquivos.

## Conferência final no GitHub Web

Após publicar, verifique se aparecem:

- pasta `app/` com `main.py`
- pasta `tests/` com `test_api.py`
- `requirements.txt`
- `README.md`

Se quiser, na próxima mensagem eu te mando o conteúdo de cada arquivo em blocos prontos para copiar/colar direto no GitHub Web.

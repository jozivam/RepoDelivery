# RepoDelivery

Você pediu entrega real de projeto — então este repositório **já tem código** de um MVP de API.

## O que já foi criado

- `app/main.py`: API FastAPI com endpoints
  - `GET /health`
  - `GET /tasks`
  - `POST /tasks`
  - `PATCH /tasks/{task_id}`
- `tests/test_api.py`: testes do fluxo principal
- `requirements.txt`: dependências

## Publicar no GitHub (corrigindo erro de `origin` no seu PC)

Se `git remote add origin ...` falhou, normalmente é porque `origin` já existe.

### Diagnóstico rápido

```bash
git remote -v
```

### Opção 1 (recomendada): corrigir URL do origin existente

```bash
git remote set-url origin https://github.com/jozivam/RepoDelivery.git
git push -u origin work
```

### Opção 2: remover e adicionar de novo

```bash
git remote remove origin
git remote add origin https://github.com/jozivam/RepoDelivery.git
git push -u origin work
```

### Opção 3: usar script pronto

```bash
./scripts/publicar_github.sh jozivam work
```

## Erros comuns no push

- `Repository not found`: URL errada ou repo não criado na conta.
- `Authentication failed`: precisa autenticar com token/credential manager.
- `src refspec work does not match any`: sua branch local tem outro nome (use `git branch`).

## Rodar localmente no Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Testes

```bash
pytest -q
```

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

## Importante: por que seu GitHub ainda pode estar vazio

Eu consigo criar/commitar código aqui na sessão, mas **não consigo publicar no seu GitHub sem `origin` + autenticação da sua conta**.

Para aparecer no seu GitHub, rode estes comandos neste repositório:

```bash
git remote add origin https://github.com/<seu-usuario>/RepoDelivery.git
git push -u origin work
```

Se sua branch padrão for `main`:

```bash
git branch -M main
git push -u origin main
```

## Rodar localmente no Linux

Depois que estiver no GitHub (ou se você já tiver os arquivos locais):

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

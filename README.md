# RepoDelivery

MVP de API já implementado neste workspace:

- `app/main.py` (`/health`, `/tasks` GET/POST, `/tasks/{task_id}` PATCH)
- `tests/test_api.py`
- `requirements.txt`

## Publicação no GitHub quando usar apenas navegador

Se você usa só navegador, siga o guia:

- `GUIA_PUBLICACAO_NAVEGADOR.md`

Esse guia explica o erro `CONNECT tunnel failed, response 403` e como publicar direto pelo site do GitHub sem usar Linux local.

## Rodar API

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

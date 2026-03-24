# RepoDelivery

Você está certo em cobrar entrega. Então já deixei um **MVP funcional** no repositório.

## O que foi entregue

- API FastAPI com endpoints:
  - `GET /health`
  - `GET /tasks`
  - `POST /tasks`
  - `PATCH /tasks/{task_id}`
- Testes automatizados com `pytest`.

## Como rodar localmente (no seu PC)

1. Clone o repositório no seu computador:

```bash
git clone https://github.com/<seu-usuario>/RepoDelivery.git
cd RepoDelivery
```

2. Crie e ative ambiente virtual:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Instale dependências:

```bash
pip install -r requirements.txt
```

4. Rode a API:

```bash
uvicorn app.main:app --reload
```

5. Abra a documentação interativa:

- http://127.0.0.1:8000/docs

## Rodar testes

```bash
pytest -q
```

## Próximo passo

Se você colar aqui novamente o PDR/API/plano detalhado, eu evoluo esse MVP para o escopo exato que você definiu.

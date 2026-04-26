# Handoff Backend: Criacao de Agentes Admin

## Estado actual

- Frontend chama `POST /api/admin/agentes` a partir de `Api.adminAgentes.create(payload)`.
- Backend publico responde `404` com payload:

```json
{ "erro": "Rota nao encontrada." }
```

- `GET /api/admin/agentes` existe e responde `401` sem token, o que confirma que a area admin de agentes existe mas a rota de criacao nao.

## Endpoint a implementar

**Metodo:** `POST`
**Rota:** `/api/admin/agentes`
**Autenticacao:** Bearer token de administrador
**Content-Type:** `application/json`

### Request body

```json
{
  "nome": "Joao Silva",
  "email": "joao@acheidoc.ao",
  "telefone": "+244 923 000 000",
  "ponto_id": "uuid-opcional"
}
```

### Regras minimas de validacao

- `nome`: obrigatorio, string nao vazia
- `email`: obrigatorio, email valido, idealmente unico
- `telefone`: obrigatorio, string nao vazia
- `ponto_id`: opcional, quando presente deve referenciar um ponto de entrega valido
- Rejeitar pedido sem token admin valido com `401`
- Rejeitar payload invalido com `400` ou `422`
- Rejeitar email duplicado com `409` se essa regra existir no dominio

### Response de sucesso esperada pelo frontend

```json
{
  "agente": {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@acheidoc.ao",
    "telefone": "+244 923 000 000",
    "status": "ATIVO",
    "pontos": 0,
    "ponto_id": "uuid-opcional",
    "ponto_nome": "Ponto Viana Centro",
    "criado_em": "2026-04-26T15:00:00.000Z"
  }
}
```

## Compatibilidade com o frontend actual

O frontend em `js/admin-agentes.js` usa os seguintes campos da resposta:

- `agente.id`
- `agente.nome`
- `agente.email`
- `agente.telefone`
- `agente.status`
- `agente.pontos`
- `agente.criado_em`
- `agente.ponto_id` ou `agente.pontoId`
- `agente.ponto_nome` ou `agente.pontoNome`

## Teste manual sugerido

Exemplo com curl:

```bash
curl -X POST 'https://acheidoc-api.onrender.com/api/admin/agentes' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "nome":"Joao Silva",
    "email":"joao@acheidoc.ao",
    "telefone":"+244 923 000 000"
  }'
```

## Observacao

Sem esta rota, o painel admin consegue listar e gerir agentes existentes, mas nao consegue criar novos agentes a partir da interface.

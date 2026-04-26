# AcheiDoc

**Sistema de recuperação de documentos perdidos em Angola.**  
Liga quem encontrou um documento a quem o perdeu, com pagamento seguro via Multicaixa Express ou Unitel Money e rede de Pontos de Entrega certificados.

---

## Estrutura do Projecto

```
acheidoc-main/
├── index.html              # Página principal (home)
├── buscar.html             # Pesquisa de documentos (pública)
├── detalhes.html           # Detalhes de um documento
├── publicar.html           # Publicar documento encontrado (requer login)
├── pagamento.html          # Pagamento da taxa de resgate
├── ponto-entrega.html      # Mapa e instruções do ponto de entrega
├── meus-achados.html       # Histórico do utilizador (requer login)
├── recompensas.html        # Sistema de pontos e recompensas (requer login)
├── login.html              # Login de utilizador
├── cadastro.html           # Registo de novo utilizador
├── recuperar-password.html # Recuperação de palavra-passe
├── termos.html             # Termos e Condições de Utilização
├── admin/                  # Painel de administração
│   ├── login.html
│   ├── dashboard.html      # Revisão de documentos
│   ├── revisar.html        # Aprovar/rejeitar documento
│   ├── pagamentos.html     # Gerir pagamentos
│   ├── utilizadores.html   # Gerir utilizadores
│   └── agentes.html        # Gerir agentes
├── agente/                 # Portal do agente
│   ├── login.html
│   ├── dashboard.html      # Lista de documentos no ponto
│   ├── validar.html        # Validar recepção / entrega
│   └── historico.html      # Histórico de entregas
├── css/                    # Folhas de estilo
│   ├── style.css
│   ├── navbar.css
│   ├── footer.css
│   └── components.css
├── js/                     # Scripts JavaScript
│   ├── api.js              # Cliente HTTP para o backend
│   ├── auth.js             # Gestão de sessão
│   ├── ui-utils.js         # Utilitários partilhados
│   └── ...                 # Um ficheiro JS por página
└── img/                    # Imagens estáticas
    ├── pna.png
    └── angola.png
```

---

## Backend (API)

- **URL base:** `https://acheidoc-api.onrender.com`
- **Documentação dos endpoints:** definida em `js/api.js`
- Autenticação via **Bearer Token** (JWT) guardado em `localStorage`
- Admins e Agentes usam `sessionStorage` para maior segurança

### Principais rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login de utilizador |
| POST | `/api/auth/register` | Registo de utilizador |
| GET | `/api/documentos` | Listar documentos (público) |
| GET | `/api/documentos/:id` | Detalhe de um documento |
| POST | `/api/documentos` | Publicar novo documento |
| POST | `/api/pagamentos` | Registar pagamento |
| GET | `/api/recompensas` | Resumo de pontos do utilizador |
| GET | `/api/pontos-entrega` | Listar pontos de entrega |
| POST | `/api/admin/auth/login` | Login de admin |
| POST | `/api/agente/auth/login` | Login de agente |

### Rotas em falta confirmadas

- `POST /api/admin/agentes` ainda não está implementada no backend público.
- Actualmente o frontend trata este caso com mensagem de indisponibilidade e bloqueio do botão de criação após resposta `404` ou `501`.

---

## Tecnologias Usadas

- **HTML5 / CSS3 / JavaScript** (vanilla, sem frameworks)
- **Leaflet.js + OpenStreetMap** — mapa interactivo no ponto de entrega
- **Nominatim** (OpenStreetMap) — geocodificação do endereço do ponto
- **Fetch API** — comunicação com o backend
- **localStorage / sessionStorage** — persistência de sessão

---

## Como Correr Localmente

Basta abrir `index.html` num browser. Como o projecto é HTML/CSS/JS puro, não precisa de servidor Node.js.

```bash
# Opção simples com Python
python3 -m http.server 8080
# Abrir: http://localhost:8080

# Ou com VS Code: instalar a extensão "Live Server" e clicar em "Go Live"
```

---

## Fluxo Principal

1. **Encontrador** regista-se → publica documento encontrado com foto
2. **Admin** revisa e aprova a publicação
3. **Proprietário** pesquisa o documento → paga a taxa (500 Kz) → recebe código de resgate
4. **Agente** recebe o documento fisicamente → valida entrega com o código
5. **Encontrador** acumula pontos de recompensa após entrega concluída

---

## Contacto

- Email: info@acheidoc.ao  
- Telefone: +244 923 000 000  
- Luanda, República de Angola

# MarketShare - Plataforma Agro

Uma plataforma completa de gerenciamento agrícola com dashboard inteligente, gestão de leads, propriedades rurais e distribuição de mapas geográficos.

## ⚡ Guia Rápido (Primeiro Acesso)

1. **Clonar o repositório e instalar dependências**
  ```bash
  git clone https://github.com/alyssonlcss/marketShare.git
  cd marketShare

  cd backend && npm install
  cd ../frontend && npm install
  ```

2. **Configurar o banco PostgreSQL e o .env do backend**
  - Criar o banco `marketshare_db` e o usuário `marketshare_user` (ver seção "Configuração do Banco de Dados PostgreSQL").
  - Criar o arquivo `backend/.env` conforme o exemplo daquela seção.

3. **Carregar dados de teste**
  ```bash
  cd marketShare   # pasta raiz, se ainda não estiver nela
  psql -U marketshare_user -d marketshare_db -f dados-para-testes-insert/test-data.sql
  ```

4. **Subir o backend (NestJS)**
  ```bash
  cd backend
  npm run start:dev
  ```

5. **Subir o frontend (Angular)**
  ```bash
  cd frontend
  npm start
  ```

6. **Logar no sistema**
  - Acesse `http://localhost:4200`.
  - Use o usuário de teste (ver seção "Usuário de Teste (Login)").

---

## 🌟 Funcionalidades Principais

- **Dashboard operacional**
  - Visão geral de leads ativos, status e distribuição por área produtiva.
  - Painel "Cartografia agro" com mapa geográfico das propriedades (Google Maps).
  - Painel "Concentração territorial" com leads por município e detalhes de propriedades/leads.
- **Gestão de Leads**
  - Listagem, filtros por nome e status, criação de novos leads via modal.
  - Associação entre lead e propriedade rural.
- **Gestão de Propriedades Rurais**
  - Listagem com cultura, hectares, município e link com o lead responsável.
  - Drawer lateral com detalhes do lead associado à propriedade.
- **Gestão de Produtos e Aderência**
  - Lista de produtos com filtros.
  - Tabela de "Propriedades com match de cultura" mostrando aderência entre cultura da propriedade e categoria do produto.
  - Drawer de lead associado à propriedade selecionada.
- **Autenticação e Atribuição por Distribuidor**
  - Login com JWT, proteção de rotas e interceptação de chamadas HTTP.
  - Filtros por atribuição (atribuído / não atribuído ao distribuidor atual) refletidos no dashboard, leads, propriedades e produtos.

## 🧱 Tecnologias Utilizadas

- **Backend**
  - NestJS 11 (TypeScript), arquitetura modular por domínio (auth, lead, propriedade-rural, produto, distribuidor).
  - TypeORM com PostgreSQL.
  - Validação com class-validator e autenticação com Passport (local + JWT).
- **Frontend**
  - Angular 21 (standalone components).
  - PrimeNG (tabelas, selects, layout) + PrimeFlex + PrimeIcons.
  - Google Maps via @angular/google-maps.
  - Estilização com SCSS e design focado em painel operacional agro.
- **Qualidade e Testes**
  - Backend: Jest para testes unitários e e2e de API.
  - Frontend: Karma/jasmine para unit tests e Playwright para testes e2e de interface.
- **Ferramentas de apoio**
  - Node.js + npm para scripts de build/test.
  - VS Code com extensões recomendadas para NestJS, Angular e banco de dados.

## 📋 Requisitos do Sistema

### Pré-requisitos Globais
- **Node.js**: v20.0.0 ou superior
- **npm**: v11.6.0 ou superior (incluído no Node.js)
- **PostgreSQL**: v14 ou superior
- **Git**: para versionamento

### Verificar Instalação
```bash
node --version    # deve retornar v20.x.x ou superior
npm --version     # deve retornar 11.x.x ou superior
psql --version    # deve retornar PostgreSQL 14.x ou superior
```

---

## 🗄️ Configuração do Banco de Dados PostgreSQL

### 1. Instalar PostgreSQL

#### Windows
- Baixe em: https://www.postgresql.org/download/windows/
- Siga o instalador
- **Importante**: Anote a senha do usuário `postgres`

#### macOS (via Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Criar o Banco de Dados e Usuário

```bash
# Conectar como superusuário
psql -U postgres

# Dentro do psql, executar:
CREATE USER marketshare_user WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE marketshare_db OWNER marketshare_user;

# Conceder privilégios completos
GRANT ALL PRIVILEGES ON DATABASE marketshare_db TO marketshare_user;

# Sair
\q
```

### 3. Configurar Variáveis de Ambiente (Backend)

Criar arquivo `backend/.env`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=marketshare_user
DATABASE_PASSWORD=sua_senha_segura
DATABASE_NAME=marketshare_db

# JWT Secret
JWT_SECRET=sua_chave_jwt_super_secreta_com_minimo_32_caracteres
JWT_EXPIRATION=7d

# API
API_PORT=3000
NODE_ENV=development
```

---

## 👤 Usuário de Teste (Login)

O script de dados de teste em [dados-para-testes-insert/test-data.sql](dados-para-testes-insert/test-data.sql) cria um usuário padrão para acessar o sistema em ambiente de desenvolvimento.

Após executar o script SQL no banco (veja a seção "Dados de Teste (SQL)"), utilize as credenciais abaixo na tela de login do frontend:

- **E-mail**: `alyssonlcss@gmail.com`
- **Senha**: `minhaSenha123`

Essas credenciais são apenas para uso local/de desenvolvimento e **não devem ser usadas em produção**.

---

## 📊 Dados de Teste (SQL)

Para acelerar os testes locais, o repositório inclui um script SQL com dados de exemplo em [dados-para-testes-insert/test-data.sql](dados-para-testes-insert/test-data.sql).

Esse script cria:

- Distribuidores e usuários de exemplo com credenciais de acesso.
- Leads (atribuídos e não atribuídos) com CPFs, telefones e e-mails válidos.
- Propriedades rurais em municípios de MG, com culturas e hectares.
- Produtos com categorias usadas para cálculo de "match de cultura".

### Como carregar os dados de teste

No diretório raiz do projeto:

```bash
psql -U marketshare_user -d marketshare_db -f dados-para-testes-insert/test-data.sql
```

- Ajuste o usuário (`-U`) e o banco (`-d`) se tiver usado outros nomes na criação do banco.
- Após rodar o script, você terá um usuário de teste para login (veja o próprio arquivo SQL para e-mail/senha) e dados suficientes para explorar todas as telas do sistema.

---

## 🛠️ Extensões Recomendadas do VS Code

### Backend (NestJS)
- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **Nest Snippets** (fivepointseven.nest-snippets)
- **Thunder Client** (rangav.vscode-thunder-client) - para testar APIs
- **Postman** (Postman.postman-for-vscode)

### Frontend (Angular)
- **Angular Language Service** (Angular.ng-template)
- **Angular Snippets** (johnpapa.Angular2)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **Thunder Client** (rangav.vscode-thunder-client)
- **CSS Peek** (pranaygp.vscode-css-peek)

### Geral
- **GitLens** (eamodio.gitlens)
- **Git Graph** (mhutchie.git-graph)
- **Todo Tree** (Gruntfuggly.todo-tree)
- **Thunder Client** (rangav.vscode-thunder-client)

### Banco de Dados
- **pgAdmin** ou **DBeaver** (aplicativos desktop) para administrar o PostgreSQL, inspecionar tabelas e rodar SQL manualmente.
- **SQLTools** (mtxr.sqltools) ou **Database Client** (cweijan.vscode-database-client2) para gerenciar o banco diretamente pelo VS Code.
- Recomenda-se configurar uma conexão para o banco `marketshare_db` para visualizar facilmente as tabelas geradas pelo TypeORM e os dados inseridos pelo script de testes.

**Instalar tudo de uma vez:**
```bash
code --install-extension dsznajder.es7-react-js-snippets \
  dbaeumer.vscode-eslint \
  esbenp.prettier-vscode \
  fivepointseven.nest-snippets \
  rangav.vscode-thunder-client \
  Postman.postman-for-vscode \
  Angular.ng-template \
  johnpapa.Angular2 \
  pranaygp.vscode-css-peek \
  eamodio.gitlens \
  mhutchie.git-graph \
  Gruntfuggly.todo-tree
```

---

## 🚀 Como Rodar o Projeto

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/alyssonlcss/marketShare.git
cd marketShare
```

### Passo 2: Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

#### Backend
Criar `backend/.env` com as variáveis do PostgreSQL (veja seção acima).

#### Frontend (Opcional)
Criar `frontend/.env` se necessário (geralmente não é obrigatório para desenvolvimento local).

### Passo 4: Executar o Projeto

#### Opção A: Terminais Separados (Recomendado)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Será acessível em: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Será acessível em: `http://localhost:4200`

#### Opção B: Um Único Terminal
```bash
# Terminal principal
npm run start:dev:all  # Se configurado em scripts de raiz
```

---

## 📦 Dependências Principais

### Backend (NestJS)
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.2",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/typeorm": "^11.0.0",
  "bcryptjs": "^3.0.3",
  "class-validator": "^0.14.3",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "pg": "^8.16.3",
  "typeorm": "^0.3.28"
}
```

### Frontend (Angular 21)
```json
{
  "@angular/core": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@angular/google-maps": "^21.0.6",
  "@angular/router": "^21.0.0",
  "primeng": "^21.0.2",
  "primeicons": "^7.0.0",
  "rxjs": "~7.8.0"
}
```

---

## 📁 Estrutura do Projeto

```
marketShare/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── lead/           # Módulo de Leads
│   │   ├── propriedade-rural/  # Módulo de Propriedades
│   │   ├── produto/        # Módulo de Produtos
│   │   ├── distribuidor/   # Módulo de Distribuidores
│   │   └── ...
│   ├── .env                # Variáveis de ambiente
│   └── package.json
│
├── frontend/               # App Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/
│   │   │   │   ├── dashboard/      # Dashboard principal
│   │   │   │   ├── leads/          # Gerenciamento de leads
│   │   │   │   ├── propriedades/   # Gerenciamento de propriedades
│   │   │   │   ├── mapa-propriedades/  # Mapa Google Maps
│   │   │   │   └── ...
│   │   │   ├── core/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   └── ...
│   │   └── styles/         # Estilos globais
│   ├── .env                # Variáveis de ambiente (opcional)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔧 Scripts Úteis

### Backend
```bash
npm start                 # Rodar em produção
npm run start:dev        # Modo desenvolvimento com watch
npm run start:debug      # Modo debug
npm run build            # Build para produção
npm run test             # Executar testes
npm run test:cov         # Testes com cobertura
npm run lint             # ESLint
npm run format           # Prettier
```

### Frontend
```bash
npm start                # Modo desenvolvimento (port 4200)
npm run build            # Build para produção
npm run watch            # Watch mode
npm test                 # Testes unitários
npm run e2e              # Testes end-to-end (Playwright)
npm run serve:ssr:marketshare-frontend  # SSR
```

---

## 🧪 Testes Automatizados

O projeto possui testes automatizados tanto no backend quanto no frontend.

### Backend (NestJS)

No diretório `backend`:

```bash
cd backend

# Testes unitários (services, controllers, etc.)
npm test

# Testes e2e da API (rotas reais subindo um app Nest em memória)
npm run test:e2e
```

Os arquivos de teste ficam em `src/**/*.spec.ts` (unitários) e em `test/**/*.e2e-spec.ts` (e2e, conforme configuração do Jest).

### Frontend (Angular)

No diretório `frontend`:

```bash
cd frontend

# Testes unitários (componentes, serviços)
npm test

# Primeiro uso do Playwright: instalar browsers
npx playwright install

# Testes end-to-end (login, dashboard, leads, propriedades, produtos)
npm run e2e
```

- Os testes unitários ficam em `src/app/**/*.spec.ts`.
- Os testes e2e estão em [frontend/e2e](frontend/e2e), cobrindo:
  - Autenticação e acesso ao dashboard.
  - Fluxos de lista e filtro de leads.
  - Listagem e detalhes de propriedades e drawer de "Lead associado".
  - Tela de produtos com aderência por cultura e drawer de lead.

> Dica: execute primeiro o script de dados de teste para garantir que as telas tenham conteúdo suficiente e que os cenários e2e encontrem os registros esperados.

---

## 🔗 Principais Endpoints da API

URL base em desenvolvimento: `http://localhost:3000`

### Autenticação

- `POST /auth/login`
  - Corpo: `{ "email": string, "password": string }`.
  - Retorna um `access_token` (JWT) e os dados básicos do usuário.
  - Deve ser usado pelo frontend para autenticar e armazenar o token.

### Leads

- `GET /lead`
  - Lista leads visíveis para o distribuidor do usuário autenticado.
  - Aceita filtros via query string (por exemplo, status, atribuição, etc.).
- `GET /lead/:id`
  - Detalhes de um lead específico.
- `POST /lead`
  - Cria um novo lead (usa `CreateLeadDto` para validação de campos obrigatórios).
- `PATCH /lead/:id`
  - Atualiza parcialmente um lead existente.
- `DELETE /lead/:id`
  - Remove um lead (retorna `204 No Content` em caso de sucesso).

### Propriedades Rurais

- `GET /propriedade-rural`
  - Lista propriedades rurais vinculadas ao distribuidor/usuário autenticado, com filtros opcionais.
- `GET /propriedade-rural/:id`
  - Detalhes de uma propriedade específica (incluindo relação com lead/distribuidor).
- `POST /propriedade-rural`
  - Cria uma nova propriedade rural.
- `PATCH /propriedade-rural/:id`
  - Atualiza dados da propriedade.
- `DELETE /propriedade-rural/:id`
  - Remove uma propriedade (retorna `204 No Content`).

### Produtos

- `GET /produto`
  - Lista produtos do distribuidor atual, com suporte a filtros (por categoria, etc.).
- `GET /produto/:id`
  - Detalhes de um produto.
- `POST /produto`
  - Cria novo produto vinculado ao distribuidor do usuário autenticado.
- `PATCH /produto/:id`
  - Atualiza dados do produto.
- `DELETE /produto/:id`
  - Remove um produto (retorna `204 No Content`).

### Distribuidores

- `GET /distribuidor`
  - Lista distribuidores cadastrados (útil para administração ou telas de configuração).

> Todos os endpoints (exceto `/auth/login`) exigem cabeçalho `Authorization: Bearer <token>` com o JWT obtido no login.

---

## 🗺️ Google Maps API

O projeto utiliza **Google Maps API** para exibir propriedades rurais geograficamente.

### Configurar API Key

1. Ir para [Google Cloud Console](https://console.cloud.google.com/)
2. Criar novo projeto
3. Ativar **Maps JavaScript API** e **Places API**
4. Gerar uma chave API
5. Adicionar no `frontend/index.html`:

```html
<script async
  src="https://maps.googleapis.com/maps/api/js?key=SUA_API_KEY&libraries=maps,marker">
</script>
```

---

## 🔐 Autenticação

O projeto usa **JWT (JSON Web Tokens)** para autenticação.

### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

Resposta:
```json
{
  "access_token": "eyJhbGc...",
  "user": { "id": 1, "email": "usuario@example.com" }
}
```

---

## 🐛 Troubleshooting

### Erro: "Port 3000 is already in use"
```bash
# Matar processo na porta 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### Erro: "Cannot connect to database"
- Verificar se PostgreSQL está rodando
- Confirmar variáveis de ambiente em `backend/.env`
- Testar conexão: `psql -U marketshare_user -d marketshare_db -h localhost`

### Erro: "Cannot find module '@angular/google-maps'"
```bash
cd frontend
npm install
npm run build
```

### Frontend não carrega dados
- Verificar se backend está rodando em `http://localhost:3000`
- Verificar CORS em `backend/src/main.ts`
- Abrir DevTools (F12) e verificar aba Network

---

## 📞 Contato & Suporte

Para dúvidas ou problemas:
- Criar issue no repositório
- Revisar logs do backend/frontend
- Consultar documentação: [NestJS Docs](https://docs.nestjs.com), [Angular Docs](https://angular.io/docs)

---

## 📄 Licença

UNLICENSED - Projeto privado

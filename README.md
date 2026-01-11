# MarketShare - Plataforma Agro

Uma plataforma completa de gerenciamento agrícola com dashboard inteligente, gestão de leads, propriedades rurais e distribuição de mapas geográficos.

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
npm run serve:ssr:marketshare-frontend  # SSR
```

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

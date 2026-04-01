# 🤖 Orbix-AI - Chatbot Backend

Este é o repositório do back-end para o **Orbix-AI**, uma aplicação de chatbot alimentada pela API do Groq. Ele gerencia autenticação de usuários, persistência de mensagens no banco de dados e comunicação com o modelo de IA.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído com as seguintes tecnologias de ponta:

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Runtime:** [Node.js](https://nodejs.org/en/)
- **Framework Web:** [Express.js](https://expressjs.com/)
- **Banco de Dados (ORM):** [Prisma ORM](https://www.prisma.io/)
- **Banco de Dados:** PostgreSQL (Hospedado no [Neon](https://neon.tech/))
- **IA SDK:** [Groq Cloud SDK](https://console.groq.com/)
- **Segurança:** [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
- **Validação de Schemas:** [Zod](https://zod.dev/)
- **Configuração:** [Dotenv](https://github.com/motdotla/dotenv)

---

## ✨ Funcionalidades Principais

- **Autenticação JWT:** Registro e Login com senhas criptografadas.
- **Histórico de Chat:** Todas as mensagens são salvas de forma persistente e vinculadas ao usuário.
- **Integração com Groq:** Respostas dinâmicas utilizando o modelo de IA da Groq.
- **Middleware de Autenticação:** Proteção de rotas sensíveis que exigem login.
- **Validação Robusta:** Garantia de integridade dos dados via Zod.

---

## 🛠️ Pré-requisitos

Antes de começar, você precisará ter instalado:
- **Node.js** (v18+)
- **NPM** ou **Yarn**
- Um banco de dados **PostgreSQL** ou uma conta no **Neon.tech**

---

## 📂 Estrutura do Projeto

```text
├── prisma              # Configurações do Banco de Dados e Schemas
├── src
│   ├── DTOs            # Data Transfer Objects
│   ├── middlewares     # Middlewares de Express (Auth, etc.)
│   ├── modules         # Lógica de negócio dividida por módulos (Auth, Chat)
│   ├── routes          # Definição das rotas da API
│   ├── schemas         # Validações Zod
│   ├── utils           # Funções utilitárias
│   ├── app.ts          # Configuração inicial do Express
│   └── server.ts       # Ponto de entrada do servidor
├── .env                # Variáveis de ambiente
├── package.json        # Dependências e scripts
└── tsconfig.json       # Configuração do TypeScript
```

---

## 🔧 Configuração e Instalação

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd chatbot-ai
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto e preencha com as seguintes chaves (use o exemplo abaixo):

```env
PORT=3000
JWT_SECRET=seu_segredo_jwt_aqui
GROQ_API_KEY=sua_chave_groq_aqui
DATABASE_URL="postgresql://usuario:senha@host:porta/banco?sslmode=require"
```

### 4. Preparar o Banco de Dados
Sincronize o schema com o banco de dados e gere o Prisma Client:

```bash
npx prisma generate
npx prisma db push
```

---

## 🏃 Executando o Projeto

Para rodar em ambiente de desenvolvimento:
```bash
# Se você tiver ts-node-dev configurado (recomendado)
npm run dev

# Se for rodar a build
npm run build
npm start
```

---

## 📡 Documentação da API (Endpoints)

Todas as rotas possuem o prefixo base `/api`.

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Corpo da Requisição |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Cria um novo usuário | `{ name, email, password }` |
| **POST** | `/login` | Autentica e retorna o JWT Token | `{ email, password }` |

### Chat (`/api/groq`)

| Método | Rota | Descrição | Autorização | Corpo da Requisição |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/chat` | Envia mensagem para a IA | **Bearer Token** | `{ message }` |

---

## 🗄️ Modelagem de Dados (Prisma)

O banco de dados conta com dois modelos principais:

- **User:** Gerencia os dados cadastrais e as credenciais.
- **Mensagem:** Armazena o conteúdo das conversas, vinculado ao usuário (`userId`) e identifica o autor (`USER` ou `ASSISTANT`).

---

## 📄 Licença

Este projeto está sob a licença ISC.

---

*Desenvolvido por Alonso Nogueira - Orbix AI*

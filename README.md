# 🛒 Pisante ATM — Plataforma de E-commerce

Plataforma completa de e-commerce para loja de calçados e roupas, desenvolvida com **React 19 + Vite** no frontend e **ASP.NET Core 9** no backend, seguindo Clean Architecture.

---

## 🏗️ Arquitetura

```
Pisante Atm/
├── backend/                    # ASP.NET Core 9 Web API
│   └── src/
│       ├── PisanteAtm.Domain/         # Entidades, Interfaces, Enums
│       ├── PisanteAtm.Application/    # DTOs, Services, Interfaces, Validators
│       ├── PisanteAtm.Infrastructure/ # DbContext, Repositories, EF Migrations
│       └── PisanteAtm.API/            # Controllers, Middleware, Program.cs
├── frontend/                   # React 19 + Vite + TypeScript
│   └── src/
│       ├── components/        # UI e Layout
│       ├── pages/             # Páginas (shop, admin, auth)
│       ├── services/          # Chamadas à API (Axios)
│       ├── store/             # Estado global (Zustand)
│       ├── types/             # Tipos TypeScript
│       └── utils/             # Helpers
└── uploads/                   # Arquivos de upload (fora do public)
```

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Versão |
|---|---|
| ASP.NET Core | 9.0 |
| Entity Framework Core | 9.0 |
| MySQL (Pomelo) | 9.0 |
| ASP.NET Identity | 9.0 |
| JWT Bearer | 9.0 |
| Serilog | 9.0 |
| Swagger/OpenAPI | 7.x |

### Frontend
| Tecnologia | Versão |
|---|---|
| React | 19 |
| Vite | 6 |
| TypeScript | 5.6 |
| Tailwind CSS | 3.4 |
| React Router | 7 |
| Axios | 1.7 |
| Zustand | 5 |
| React Hook Form + Zod | 7.x |

---

## ⚙️ Instalação e Execução

### Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [MySQL 8+](https://dev.mysql.com/downloads/)

### Backend

```bash
# 1. Configure o banco no appsettings.Development.json
#    Altere: Server, User, Password

# 2. Instale o EF Core Tools (uma vez)
dotnet tool install --global dotnet-ef

# 3. Entre no projeto da API
cd backend/src/PisanteAtm.API

# 4. Gere a migration inicial
dotnet ef migrations add InitialCreate --project ../PisanteAtm.Infrastructure --startup-project .

# 5. Execute (auto-migra e cria admin)
dotnet run
```

A API estará em: `http://localhost:5000`  
Swagger: `http://localhost:5000/swagger`

**Credenciais padrão do Admin:**
- Email: `admin@pisanteatm.com.br`
- Senha: `Admin@123456`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🔐 Segurança

| Proteção | Implementação |
|---|---|
| Autenticação | JWT + Refresh Token com rotação |
| Senhas | Hash BCrypt via ASP.NET Identity |
| Autorização | Role-based (Admin, Employee, Customer) |
| SQL Injection | Entity Framework parametrizado |
| XSS | Output sanitization + CSP headers |
| Brute Force | Account lockout (5 tentativas, 15min) |
| Rate Limiting | 10 req/min (auth), 100 req/min (api) |
| CORS | Apenas origens configuradas |
| Upload | Extensão + MIME + tamanho validados |
| Headers | X-Frame-Options, X-Content-Type-Options, HSTS, CSP |

---

## 📡 Endpoints da API

### Auth
```
POST /api/v1/auth/register      Cadastro de usuário
POST /api/v1/auth/login         Login
POST /api/v1/auth/refresh-token Renovar token
POST /api/v1/auth/revoke-token  Revogar token [Auth]
POST /api/v1/auth/change-password Alterar senha [Auth]
```

### Produtos
```
GET    /api/v1/products          Listar (paginado, filtros)
GET    /api/v1/products/featured Destaques
GET    /api/v1/products/{id}     Detalhes
GET    /api/v1/products/slug/{slug}
POST   /api/v1/products          Criar [Admin/Employee]
PUT    /api/v1/products/{id}     Editar [Admin/Employee]
DELETE /api/v1/products/{id}     Excluir [Admin]
POST   /api/v1/products/{id}/images  Upload imagem [Admin/Employee]
DELETE /api/v1/products/images/{id}  Remover imagem [Admin/Employee]
GET    /api/v1/products/low-stock    Estoque baixo [Admin/Employee]
```

### Categorias
```
GET    /api/v1/categories        Listar
POST   /api/v1/categories        Criar [Admin]
PUT    /api/v1/categories/{id}   Editar [Admin]
DELETE /api/v1/categories/{id}   Excluir [Admin]
POST   /api/v1/categories/{id}/image Upload [Admin]
```

### Carrinho
```
GET    /api/v1/cart              Ver carrinho [Auth]
POST   /api/v1/cart/items        Adicionar item [Auth]
PUT    /api/v1/cart/items/{id}   Atualizar quantidade [Auth]
DELETE /api/v1/cart/items/{id}   Remover item [Auth]
DELETE /api/v1/cart              Limpar carrinho [Auth]
```

### Pedidos
```
GET    /api/v1/orders            Listar todos [Admin/Employee]
GET    /api/v1/orders/my         Meus pedidos [Auth]
GET    /api/v1/orders/{id}       Detalhar pedido [Auth]
POST   /api/v1/orders            Criar pedido [Auth]
PATCH  /api/v1/orders/{id}/status Atualizar status [Admin/Employee]
```

### Dashboard
```
GET    /api/v1/dashboard/stats   Estatísticas [Admin/Employee]
```

---

## 🗄️ Banco de Dados

### Diagrama de Entidades

```
Users ─────────────────┐
  ├── RefreshTokens    │
  ├── Addresses        │
  ├── Cart ────────── CartItems ──── Products
  ├── Orders ─────── OrderItems ──── |
  └── ProductReviews ───────────────┘
                            │
                       Categories
                            │
                         Products
                            ├── ProductImages
                            └── ProductVariants
```

---

## 🚀 Deploy (Produção)

### Backend
```bash
# Publicar
cd backend/src/PisanteAtm.API
dotnet publish -c Release -o ./publish

# Configurar appsettings.Production.json com:
# - ConnectionString real
# - JWT Secret forte (min 32 chars)
# - Cors com domínio real
# - Storage BaseUrl com domínio real
```

### Frontend
```bash
cd frontend
npm run build
# Pasta dist/ → serve com Nginx ou CDN
```

### Nginx (exemplo)
```nginx
server {
    listen 443 ssl;
    server_name pisanteatm.com.br;

    # Frontend (SPA)
    location / {
        root /var/www/pisante-atm;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 📁 Estrutura de Arquivos Importantes

```
backend/src/PisanteAtm.API/
├── appsettings.json           # Config base
├── appsettings.Development.json # Config dev (não commitar secrets!)
└── Program.cs                 # DI, middleware, seeds

frontend/src/
├── App.tsx                    # Rotas
├── main.tsx                   # Entry point
├── store/
│   ├── authStore.ts           # Zustand: auth + persist
│   └── cartStore.ts           # Zustand: carrinho
├── services/api.ts            # Axios + interceptors JWT
└── types/index.ts             # Todos os tipos TypeScript
```

---

## 🔮 Próximas Integrações

- [ ] **Gateway de Pagamento**: Mercado Pago / Stripe
- [ ] **Serviço de Frete**: Correios / Frenet API
- [ ] **E-mail Transacional**: SendGrid / AWS SES
- [ ] **CDN para imagens**: AWS S3 / Cloudflare R2
- [ ] **Push Notifications**: Firebase FCM
- [ ] **Analytics**: Google Analytics 4

---

## 👤 Admin Padrão

```
Email: admin@pisanteatm.com.br
Senha: Admin@123456
```

⚠️ **Altere a senha do admin em produção!**

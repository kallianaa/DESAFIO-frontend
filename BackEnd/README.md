# Sistema Acadêmico API

API REST para gerenciamento acadêmico com Node.js, Express, TypeScript e MySQL.

**Stack:** Node.js • Express • TypeScript • MySQL • JWT • bcryptjs

## 🚀 Setup

```bash
npm install
```

Configure `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=DesafioFront
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_jwt_secret
PORT=3000
```

```bash
npm run dev
```

## 📋 API Routes

All routes require `Authorization: Bearer <token>` header except where noted.

### 🔐 Auth `/api/auth`

| Method | Endpoint    | Body                                           | Auth |
| ------ | ----------- | ---------------------------------------------- | ---- |
| POST   | `/register` | `{ nome, email, senha, roles[], siape?, ra? }` | No   |
| POST   | `/login`    | `{ email, senha }`                             | No   |
| POST   | `/validate` | `{ token }`                                    | No   |

### 👥 Users `/api/users`

| Method | Endpoint | Params      | Access |
| ------ | -------- | ----------- | ------ |
| GET    | `/`      | -           | Admin  |
| GET    | `/:id`   | `id` (uuid) | Auth   |
| PUT    | `/:id`   | `id` (uuid) | Auth   |
| DELETE | `/:id`   | `id` (uuid) | Admin  |

### 👨‍🏫 Professors `/api/professors`

| Method | Endpoint      | Params      | Access |
| ------ | ------------- | ----------- | ------ |
| GET    | `/`           | -           | Auth   |
| GET    | `/:id`        | `id` (uuid) | Auth   |
| PUT    | `/:id`        | `id` (uuid) | Admin  |
| DELETE | `/:id`        | `id` (uuid) | Admin  |
| GET    | `/:id/turmas` | `id` (uuid) | Auth   |

### 👨‍🎓 Students `/api/students`

| Method | Endpoint          | Params      | Access |
| ------ | ----------------- | ----------- | ------ |
| GET    | `/`               | -           | Auth   |
| GET    | `/:id`            | `id` (uuid) | Auth   |
| PUT    | `/:id`            | `id` (uuid) | Auth   |
| DELETE | `/:id`            | `id` (uuid) | Admin  |
| GET    | `/:id/matriculas` | `id` (uuid) | Auth   |

### 📚 Disciplines `/api/disciplines`

| Method | Endpoint      | Params                                        | Access |
| ------ | ------------- | --------------------------------------------- | ------ |
| GET    | `/`           | -                                             | Auth   |
| GET    | `/:id`        | `id` (uuid)                                   | Auth   |
| POST   | `/`           | `{ codigo, nome, creditos, prerequisitos[] }` | Admin  |
| PUT    | `/:id`        | `id` (uuid)                                   | Admin  |
| DELETE | `/:id`        | `id` (uuid)                                   | Admin  |
| GET    | `/:id/turmas` | `id` (uuid)                                   | Auth   |

### 🏛️ Turmas `/api/turmas`

| Method | Endpoint      | Query/Params                                              | Access |
| ------ | ------------- | --------------------------------------------------------- | ------ |
| GET    | `/`           | `?disciplina_id&professor_id&dia&turno&vagas_disponiveis` | Auth   |
| GET    | `/:id`        | `id` (uuid)                                               | Auth   |
| POST   | `/`           | `{ disciplina_id, professor_id, vagas, dia, turno }`      | Admin  |
| PUT    | `/:id`        | `id` (uuid)                                               | Admin  |
| DELETE | `/:id`        | `id` (uuid)                                               | Admin  |
| GET    | `/:id/alunos` | `id` (uuid)                                               | Auth   |

### 📝 Matriculas `/api/matriculas`

| Method | Endpoint                      | Params           | Access |
| ------ | ----------------------------- | ---------------- | ------ |
| GET    | `/`                           | -                | Auth   |
| GET    | `/:id`                        | `id` (uuid)      | Auth   |
| GET    | `/aluno/:alunoId/disponiveis` | `alunoId` (uuid) | Auth   |

## 🔑 Roles

- **ADMIN** - Full access
- **PROFESSOR** - Manage own turmas
- **ALUNO** - View and enroll

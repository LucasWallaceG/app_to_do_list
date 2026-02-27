# TaskMaster - Gerenciador de Tarefas

Aplicação Full Stack para gerenciamento de tarefas, desenvolvida como parte de um desafio técnico. Permite a criação, edição, compartilhamento e organização de tarefas por categorias.

## 🚀 Como Executar

O projeto está totalmente containerizado com Docker para facilitar a execução.

### Pré-requisitos
- Docker
- Docker Compose

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd app_to_do_list
   ```

2. **Suba os containers:**
   ```bash
   docker compose up --build
   ```

3. **Acesse as aplicações:**
   - **Frontend**: `http://localhost:5173`
   - **Backend (API)**: `http://localhost:8000`
   - **Admin Django**: `http://localhost:8000/admin`

---

## 🏗️ Arquitetura e Tecnologias

O projeto segue uma arquitetura separada entre Cliente (Frontend) e Servidor (Backend API).

### Backend (Django REST Framework)
- **Modelos**: `User`, `Task` e `Category`.
- **Autenticação**: JWT (JSON Web Tokens) para uma comunicação stateless e segura.
- **Relacionamentos**:
  - `Task` possui um `owner` (User).
  - `Task` possui um campo `shared_with` (ManyToManyField) para permitir que múltiplos usuários visualizem e participem de uma tarefa.
- **Filtros e Ordenação**: Implementado `django-filter` para busca dinâmica e ordenação inteligente (pendentes primeiro, seguidas pelas mais recentes).

### Frontend (React + Vite)
- **Estado Global**: Utilização de `Context API` para gerenciar o estado de autenticação.
- **Estilização**: CSS Puro (Vanilla CSS), priorizando uma interface moderna, responsiva e com modo escuro nativo.
- **Ícones**: Bibliotecas `lucide-react` para uma identidade visual limpa.
- **Integração de API**: `Axios` para comunicação com o backend e `AdviceSlip API` para frases motivacionais dinâmicas.

---

## 💡 Decisões de Design

1. **User Experience (UX)**:
   - **Ordenação**: Definida para colocar o que é importante (pendente) no topo.
   - **Contexto Visual**: Uso de cores dinâmicas para categorias e avatares para usuários envolvidos.
   - **Feedback Imediato**: Modais de edição e confirmações de exclusão para evitar erros do usuário.

2. **Segurança**:
   - Senhas são armazenadas utilizando o sistema de hashing do Django (`Pbkdf2`).
   - Rotas no frontend são protegidas; apenas usuários autenticados acessam o Dashboard.

3. **Escalabilidade**:
   - O uso de Docker garante que o ambiente de desenvolvimento seja idêntico ao de produção.
   - A estrutura de serializers do DRF facilita a expansão da API para suportar novos recursos.

---

## 🛠️ Funcionalidades Implementadas

- [x] CRUD completo de Tarefas.
- [x] CRUD completo de Categorias.
- [x] Autenticação de usuários (Registro/Login).
- [x] Sistema de compartilhamento Many-to-Many.
- [x] Filtros por status, categoria e busca textual.
- [x] Integração com API Externa de conselhos.
- [x] Dashboard responsiva e moderna.
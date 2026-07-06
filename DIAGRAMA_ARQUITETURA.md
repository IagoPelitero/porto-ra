# 🏗️ DIAGRAMA ARQUITETURA - PORTO RA v1.0

## Fluxo Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         PORTO RA v1.0                            │
│                     Sistema de Atendimentos                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA FRONTEND                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Index.html (SPA - Única página)               │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐  │ │
│  │  │   Sidebar    │  │          Conteúdo                │  │ │
│  │  │              │  │                                  │  │ │
│  │  │  📈 Dashboard│  │ ┌────────────────────────────┐   │  │ │
│  │  │  ➕ Novo     │  │ │ 5 Páginas (uma de cada     │   │  │ │
│  │  │  📋 Meus     │  │ │ Renderizadas em JS         │   │  │ │
│  │  │  📊 Indica   │  │ │ - Dashboard (KPIs)         │   │  │ │
│  │  │  ⚙️ Config   │  │ │ - Novo Atendimento (Form)  │   │  │ │
│  │  │              │  │ │ - Meus Atendimentos (Tabela)   │  │ │
│  │  │              │  │ │ - Indicadores (Gráficos)   │   │  │ │
│  │  │              │  │ │ - Configurações (Admin)    │   │  │ │
│  │  └──────────────┘  │ └────────────────────────────┘   │  │ │
│  │                    │                                  │  │ │
│  │                    │  Calls: google.script.run        │  │ │
│  │                    │  (Async, Non-blocking)           │  │ │
│  └────────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────────┘
  │
  │ google.script.run.
  │ apiCriarAtendimento()
  │ apiObterMeusAtendimentos()
  │ apiObterIndicadores()
  │ etc...
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA BACKEND                              │
│                  Google Apps Script (V8 Runtime)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Code.gs                               │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  • doGet()                  [Entrada Web App]            │   │
│  │  • getCurrentUser()         [Autenticação Google]        │   │
│  │  • setup()                  [Inicialização DB]           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                         │                                 │  │
│  │  ┌──────────────┐  ┌───┴──────────┐  ┌──────────────┐   │  │
│  │  │  Config.gs   │  │ Services.gs  │  │ Database.gs  │   │  │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤   │  │
│  │  │• Headers     │  │• apiCriar    │  │• CRUD Ops    │   │  │
│  │  │• Constantes  │  │• apiObter    │  │• Validações  │   │  │
│  │  │• Configuração│  │• apiIndicador│  │• Locks       │   │  │
│  │  │• Perfis      │  │• apiValidar  │  │• Cache       │   │  │
│  │  │• Status      │  │  CPF/Proto   │  │• Histórico   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │             Utils.gs                              │   │  │
│  │  │  ID Generation, Date Formatting, Validation       │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Fluxo de Autorização: Session.getEffectiveUser() → Email      │
│  Fluxo de Cache: CacheService (1h TTL)                         │
│  Fluxo de Lock: LockService (30s para protocolo único)          │
└─────────────────────────────────────────────────────────────────┘
  │
  │ SpreadsheetApp.openById(ID)
  │ sheet.appendRow()
  │ sheet.getRange()
  │ sheet.getValues()
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DATABASE                             │
│                   Google Sheets (Cloud Storage)                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           PORTO RA - Banco de Dados                     │    │
│  │  ID: Armazenado em UserProperties (PropertiesService)  │    │
│  │                                                         │    │
│  ├─────────────┬──────────────┬──────────────┬───────────┤    │
│  │Atendimentos │ Histórico    │ Usuários     │ Config    │    │
│  ├─────────────┼──────────────┼──────────────┼───────────┤    │
│  │ ID          │ IDAtendimento│ Nome         │ Chave     │    │
│  │ Data        │ Protocolo    │ Email        │ Valor     │    │
│  │ Protocolo   │ Usuário      │ Perfil       │           │    │
│  │ Nome        │ Data         │ Ativo        │           │    │
│  │ CPF         │ Hora         │              │           │    │
│  │ Status      │ Ação         │              │           │    │
│  │ Observações │ StatusAnt    │              │           │    │
│  │ Analista    │ NovoStatus   │              │           │    │
│  │ DataCriação │ Observação   │              │           │    │
│  │ ÚltimaAtualiz                             │           │    │
│  │             │              │              │           │    │
│  │ 156 rows    │ 348 rows     │ 12 users     │ 5 configs │    │
│  └─────────────┴──────────────┴──────────────┴───────────┘    │
│                                                                 │
│  Permissões:                                                    │
│  ├─ Analista: Vê apenas próprios (Analista=CurrentUser)        │
│  ├─ Supervisor: Vê todos                                       │
│  ├─ Histórico: Imutável (append-only)                          │
│  └─ Lock: Protege Protocolo contra duplicação                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Novo Atendimento (Detalhado)

```
┌─────────────────┐
│ Usuário clica   │
│ "Novo Aten."    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend: Modal abre                    │
│ Foco em campo "Protocolo"               │
└────────┬────────────────────────────────┘
         │
         │ Usuário digita:
         │ Protocolo → Tab → Nome → Tab → CPF → Tab → Status
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend: Validações em Tempo Real      │
│ • CPF com dígitos verificadores         │
│ • Protocolo length >= 6                 │
│ • Sem campos vazios                     │
└────────┬────────────────────────────────┘
         │
         │ Se tudo válido, clica "Salvar"
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Frontend: Chama                                 │
│ google.script.run.apiCriarAtendimento(formData) │
│ Toast: "Processando..."                         │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Backend: Services.gs → apiCriarAtendimento()    │
│ • Validação de campos novamente                 │
│ • Verifica se usuário autenticado               │
│ • Chama Database.criarAtendimento()             │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Backend: Database.gs → criarAtendimento()       │
│ • Adquire LockService (espera até 30s)          │
│ • Verifica se protocolo já existe:              │
│   - Itera Atendimentos sheet coluna Protocolo   │
│   - Se encontra: ERRO "Protocolo duplicado"     │
│   - Se não encontra: Continua                   │
│ • Gera ID único: ATD_[timestamp]_[random]       │
│ • Cria linha em Atendimentos:                   │
│   - ID, Data, Protocolo, Nome, CPF, Status...   │
│ • Invalida Cache: clearCache()                  │
│ • Chama Database.adicionarHistórico()           │
│ • Libera Lock                                   │
│ • Retorna {sucesso: true, id: "ATD_..."}       │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Backend: Database.gs → adicionarHistórico()     │
│ • Insere linha em Histórico sheet:              │
│   - IDAtendimento, Protocolo, Usuário, Data,   │
│   - Hora, AçãoRealizada: "Criação", Etc       │
│ • Nunca deleta (IMUTÁVEL)                      │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Backend: Retorna resposta ao Frontend           │
│ {                                                │
│   sucesso: true,                                 │
│   id: "ATD_173013000123",                        │
│   mensagem: "Atendimento registrado com sucesso"│
│ }                                                │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Frontend: Recebe resposta                        │
│ • Se sucesso === true:                          │
│   - Toast verde: "✅ Atendimento registrado!"   │
│   - Limpa formulário                            │
│   - Aguarda 1.5s                                │
│   - Redireciona para "Meus Atendimentos"        │
│ • Se sucesso === false:                         │
│   - Toast vermelho: "❌ " + mensagem de erro    │
│   - Mantém formulário visível                   │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Frontend: Tabela Atualiza                        │
│ • Chama apiObterMeusAtendimentos()              │
│ • Novo atendimento aparece na tabela            │
│ • Usuário pode buscar, editar ou deletar        │
└──────────────────────────────────────────────────┘

TOTAL TIME: < 30 segundos ⚡
```

---

## Fluxo de Permissões

```
┌──────────────────────────────────┐
│ Usuário acessa aplicativo        │
│ Google autentica automaticamente  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Backend: Code.gs → doGet()                       │
│ • getCurrentUser() → Session.getEffectiveUser()  │
│ • Email extraído (ex: ana@porto.com)             │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Backend: Database.gs → getUserProfile(email)    │
│ • Procura na planilha "Usuários"                 │
│ • Coluna Email procura por "ana@porto.com"      │
│ • Se encontra:                                  │
│   return {                                       │
│     Nome: "Ana Silva",                           │
│     Email: "ana@porto.com",                      │
│     Perfil: "Analista",                          │
│     Ativo: "Sim"                                 │
│   }                                              │
│ • Se NÃO encontra:                              │
│   - Cria novo usuário automaticamente:          │
│   - addUser(nome, email, "Supervisor")          │
│   - (Primeiro usuário é sempre Supervisor)      │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ Frontend: Recebe perfil                          │
│ • Se perfil === "Supervisor":                    │
│   - Mostra menu "Configurações"                  │
│   - Permite ver todos atendimentos               │
│   - Permite editar qualquer atendimento          │
│ • Se perfil === "Analista":                      │
│   - NÃO mostra menu "Configurações"              │
│   - Vê apenas seus próprios atendimentos        │
│   - Pode editar apenas seus próprios             │
└──────────────────────────────────────────────────┘

┌────────────────────────────────────┐
│ Quando Analista chama:             │
│ apiObterMeusAtendimentos()         │
├────────────────────────────────────┤
│ Backend filtra:                    │
│ • Lê todas linhas de Atendimentos  │
│ • Compara coluna "Analista"        │
│ • Com perfil.Nome do usuário       │
│ • Retorna APENAS linhas que match  │
│                                    │
│ Ana vê: 12 atendimentos            │
│ (seus próprios)                    │
│                                    │
│ Supervisor vê: 156 atendimentos    │
│ (todos da célula)                  │
└────────────────────────────────────┘
```

---

## Cache & Performance

```
┌──────────────────────────────────┐
│ Primeira Requisição              │
└────────┬─────────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │ Cache vazio?        │
    │ (CacheService)      │
    └────────┬────────────┘
             │ Sim (primeiro acesso)
             ▼
    ┌────────────────────────┐
    │ Ler do Google Sheets   │
    │ (mais lento, ~500ms)   │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Guardar em Cache       │
    │ TTL = 3600 segundos    │
    │ (1 hora)               │
    └────────┬───────────────┘
             │
             ▼
         Retorna

┌──────────────────────────────────┐
│ Segunda Requisição (em 1h)       │
└────────┬─────────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │ Cache existe?       │
    │ (CacheService)      │
    └────────┬────────────┘
             │ Sim (ainda válido)
             ▼
    ┌────────────────────────┐
    │ Retornar do Cache      │
    │ (muito rápido, ~5ms)   │
    └────────────────────────┘

┌──────────────────────────────────┐
│ Quando Cache expira (1h depois)  │
└────────┬─────────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │ Cache existe?       │
    │ (CacheService)      │
    └────────┬────────────┘
             │ Não (expirou)
             ▼
    ┌────────────────────────┐
    │ Volta a ler do Sheets  │
    │ Re-popula cache        │
    └────────────────────────┘

┌─────────────────────────────────────┐
│ Quando dados são modificados:       │
├─────────────────────────────────────┤
│ • criarAtendimento()                │
│ • atualizarAtendimento()            │
│ • adicionarHistórico()              │
│                                     │
│ Imediatamente chama: clearCache()   │
│ Cache é invalidado ANTES de TTL     │
│ Próxima leitura vem fresco do Sheets│
└─────────────────────────────────────┘
```

---

## Segurança & Lock (Protocolo Único)

```
┌─────────────────────────────────────────────────────────┐
│ Análise A: Tenta salvar protocolo "TEST123"            │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Database.criarAtendimento()      │
    │ • Adquire Lock (LockService)     │
    │   Bloqueia recursos por 30s      │
    └────────┬─────────────────────────┘
             │
             ▼
        ┌────────────────────────────┐
        │ Verifica protocolo único:  │
        │ Itera Atendimentos coluna  │
        │ Protocolo procurando       │
        │ "TEST123"                  │
        │ Resultado: NÃO encontrada  │
        └────────┬───────────────────┘
                 │
                 ▼
            ┌─────────────────────┐
            │ Insere nova linha   │
            │ Protocol: "TEST123" │
            └────────┬────────────┘
                     │
                     ▼
            ┌──────────────────────────┐
            │ Libera Lock              │
            │ Outros podem acessar     │
            └──────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Cenário: 2 Analistas Tentam MESMO Protocolo SIMULTANEAMENTE│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Tempo 0ms: Ana tenta salvar "TEST123"                     │
│            Bruno tenta salvar "TEST123"                   │
│            (Exatamente no mesmo instante)                 │
│                                                            │
│ Tempo 1ms:  Ana adquire Lock (Bruno espera)               │
│                                                            │
│ Tempo 5ms:  Ana: Procura "TEST123"?                       │
│             Resultado: NÃO encontrado                     │
│             Ana: Insere "TEST123"                         │
│                                                            │
│ Tempo 10ms: Ana: Libera Lock                              │
│                                                            │
│ Tempo 11ms: Bruno adquire Lock                            │
│                                                            │
│ Tempo 12ms: Bruno: Procura "TEST123"?                     │
│             Resultado: ENCONTRADO (Ana acabou inserir)    │
│             Bruno: ❌ ERRO "Protocolo duplicado"          │
│                                                            │
│ Tempo 15ms: Bruno: Libera Lock                            │
│                                                            │
│ Resultado: Ana consegue, Bruno recebe erro clara          │
│ (Sem corrupção de dados, sem duplicação)                  │
└────────────────────────────────────────────────────────────┘
```

---

## Stack Técnico

```
┌─────────────────────────────────────────────────────────┐
│                 PORTO RA v1.0 Tech Stack                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Frontend                                                │
│ ├─ HTML5 (Semântico)                                   │
│ ├─ CSS3 (Gradientes, Flexbox, Grid)                    │
│ ├─ JavaScript (Vanilla, V8 Compatible)                 │
│ ├─ google.script.run (Async RPC)                       │
│ └─ Responsive Design (Mobile-first)                    │
│                                                         │
│ Backend                                                 │
│ ├─ Google Apps Script (V8 Runtime)                     │
│ ├─ Timezone: America/Sao_Paulo                         │
│ ├─ CacheService (In-memory cache, 1h TTL)              │
│ ├─ LockService (Concurrency control)                   │
│ ├─ Session (Google Auth)                               │
│ ├─ PropertiesService (Config store)                    │
│ └─ SpreadsheetApp (Google Sheets API)                  │
│                                                         │
│ Database                                                │
│ ├─ Google Sheets (Cloud Storage)                       │
│ ├─ 4 Abas (Atendimentos, Histórico, Usuários, Config)  │
│ ├─ Append-only Histórico (Immutable audit log)          │
│ └─ Row-level security (Filter by user)                 │
│                                                         │
│ OAuth Scopes                                            │
│ ├─ spreadsheets                                         │
│ ├─ script.container.ui                                 │
│ └─ userinfo.email                                      │
│                                                         │
│ Browser Requirements                                    │
│ ├─ ES6 JavaScript support                              │
│ ├─ CSS3 Grid & Flexbox                                 │
│ ├─ Fetch API                                           │
│ └─ Modern browser (Chrome 80+, Firefox 75+, Safari 13+)│
│                                                         │
│ Dependencies                                            │
│ └─ ZERO external dependencies! (Pure GAS + HTML)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Arquitetura moderna, escalável e produção-ready! 🚀**

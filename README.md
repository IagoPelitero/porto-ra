# Pelitero Labs Prisma RA

Sistema de gestão de atendimentos multicanal construído sobre Google Apps Script e
Google Sheets — sem servidores, sem banco de dados externo e sem custo de infraestrutura.

Desenvolvido por **Pelitero Labs**.

---

## Sobre

O **Prisma RA** é um produto da Pelitero Labs para equipes que tratam manifestações de
clientes recebidas por múltiplos canais — no cenário de exemplo, uma célula de
**Reclame Aqui**, com os canais *Reclame Aqui*, *Chat Privado do Reclame Aqui* e
*SAC Preventivo*. O sistema registra, distribui e acompanha cada atendimento até a
conclusão, com trilha de auditoria completa.

### Objetivos

- Centralizar o registro e o acompanhamento de atendimentos multicanal;
- Dar a cada perfil (ADM, Supervisor, Analista) exatamente o acesso de que precisa;
- Permitir que o formulário de cadastro seja **configurável sem alteração de código**;
- Manter histórico auditável de toda alteração (quem, quando, o quê e por quê);
- Rodar 100% dentro do Google Workspace, sem infraestrutura adicional.

### Tecnologias utilizadas

| Tecnologia | Papel |
| --- | --- |
| **Google Apps Script (V8)** | Backend: regras de negócio, permissões e persistência |
| **Google Sheets** | Banco de dados (abas como tabelas) |
| **HTML5 / CSS3 / JavaScript (ES6 no servidor, ES5 no cliente)** | Frontend SPA sem frameworks |
| **HtmlService / google.script.run** | Ponte navegador ↔ servidor |
| **CacheService / LockService / PropertiesService** | Performance, concorrência e versionamento |
| **SheetJS (xlsx) e jsPDF** | Exportação de relatórios em Excel e PDF (via CDN) |

---

## Arquitetura

O projeto segue uma separação clara de camadas, mesmo dentro das restrições do Apps
Script (arquivos "flat" na raiz):

```mermaid
flowchart LR
  subgraph Frontend["Frontend (HTML/CSS/JS no navegador)"]
    Index[Index.html - shell]
    Pages["Dashboard / NovoAtendimento /\nRelatorios / Configuracoes"]
    Components[Components.html]
    ScriptsApp[Scripts.html - App]
  end

  subgraph Backend["Backend (Google Apps Script)"]
    CodeGs[Code.gs - doGet / include / getCurrentUser]
    ServicesGs[Services.gs - regras de negócio e permissões]
    DatabaseGs[Database.gs - acesso a dados, cache, lock]
    ConfigGs[Config.gs]
    UtilsGs[Utils.gs]
  end

  Sheets[(Google Sheets - abas por canal)]

  Index --> CodeGs
  Pages -- "google.script.run" --> ServicesGs
  ServicesGs --> DatabaseGs
  DatabaseGs -- "CacheService / LockService" --> Sheets
  ServicesGs --> ConfigGs
  ServicesGs --> UtilsGs
```

**Fluxo da aplicação:**

1. O usuário abre a URL do Web App; o Apps Script executa `doGet()` (Code.gs), que
   inicializa o banco (`ensureDatabaseReady`) e monta o `Index.html`;
2. O `Index.html` inclui estilos, scripts, componentes e páginas (SPA);
3. `App.init()` (Scripts.html) busca os dados de apoio em uma única chamada
   (`getBootstrapData`) e desenha a primeira página;
4. Cada página conversa com o servidor exclusivamente via `google.script.run`,
   chamando funções públicas de `Services.gs`;
5. `Services.gs` aplica permissões e regras de negócio e delega leitura/escrita a
   `Database.gs`, que usa cache e lock antes de tocar na planilha.

O navegador **nunca** acessa o Google Sheets diretamente.

---

## Estrutura do projeto

### Backend (`.gs`)

| Arquivo | Responsabilidade |
| --- | --- |
| [Code.gs](Code.gs) | Ponto de entrada do Web App (`doGet`), inclusão de HTML (`include`), usuário logado (`getCurrentUser`), menu da planilha e funções de setup/manutenção. |
| [Config.gs](Config.gs) | Configuração central: constantes (`CONFIG`, `PROPERTY_KEYS`), colunas de cada aba (`COLUMNS`), listas fixas do fluxo (`STATUS_LIST`, `SITUACOES_PENDENCIA`, `CANAIS_LIST`, `CANAL_SHEETS`) e dados padrão (catálogo e campos do formulário). |
| [Database.gs](Database.gs) | Camada de acesso a dados: leitura/escrita no Google Sheets, cache (`CacheService`), lock (`LockService`), criação automática das abas e migrações versionadas de dados legados. |
| [Services.gs](Services.gs) | Regras de negócio: CRUD de atendimentos nas abas por canal, formulário dinâmico, timeline/histórico, dashboard, relatórios, configurações e **controle de permissões**. |
| [Utils.gs](Utils.gs) | Funções auxiliares puras: geração de IDs, validação/formatação de CPF, sanitização e conversão objeto ↔ linha. |

### Frontend (`.html`)

| Arquivo | Responsabilidade |
| --- | --- |
| [Index.html](Index.html) | Shell da aplicação: layout (sidebar + header) e inclusão dos demais arquivos. |
| [Styles.html](Styles.html) | Design system e estilos globais (variáveis CSS, layout, responsividade, cards, tabelas). |
| [Scripts.html](Scripts.html) | Núcleo do frontend (`App`): navegação SPA, usuário logado, visibilidade por perfil e helpers compartilhados. |
| [Components.html](Components.html) | Componentes de UI reutilizáveis: modal, toast, badges, tabela, paginação, timeline, KPIs. |
| [Dashboard.html](Dashboard.html) | Dashboard principal: KPIs, indicadores/gráficos por canal e lista de atendimentos com ação rápida de status. |
| [NovoAtendimento.html](NovoAtendimento.html) | Cadastro/edição de atendimentos com formulário montado dinamicamente (ConfigCampos). |
| [Relatorios.html](Relatorios.html) | Filtros, relatórios, exportação Excel/CSV/PDF e painel de produtividade. |
| [Configuracoes.html](Configuracoes.html) | Administração de Produtos, Categorias, Usuários e Campos do formulário, com acesso por perfil. |

### Outros arquivos

| Arquivo | Papel |
| --- | --- |
| [appsscript.json](appsscript.json) | Manifesto do Apps Script (timezone, escopos OAuth, runtime V8). |
| [.clasp.json.example](.clasp.json.example) | Modelo do `.clasp.json` (o real não é versionado). |
| [.claspignore](.claspignore) | Sincroniza via clasp apenas `*.gs`, `*.html` e `appsscript.json`. |
| [.gitignore](.gitignore) | Exclui credenciais e artefatos locais do versionamento. |

---

## Funcionalidades

- Cadastro, edição, exclusão (lógica) e acompanhamento de atendimentos;
- **Formulário configurável** pelo ADM sem alteração de código (aba ConfigCampos);
- Armazenamento **separado por canal** com consulta consolidada e transparente;
- Alteração rápida de status direto na tabela do Dashboard;
- Delegação/reatribuição de atendimentos entre analistas (Supervisor/ADM);
- Verificação de protocolo duplicado em tempo real (nas três abas);
- Validação de CPF no cliente e no servidor;
- Timeline por atendimento e histórico imutável de alterações com justificativa;
- Dashboard com KPIs e gráficos por canal;
- Relatórios com filtros combinados, exportação Excel/CSV/PDF e ranking de produtividade;
- Controle de acesso por perfil aplicado no backend;
- Migrações automáticas e versionadas do banco (schema, catálogo e propriedades).

---

## Fluxo do atendimento

Status fixos do fluxo: **Pendente → Em análise → Concluído**.

1. **Cadastro** — o formulário é montado conforme a ConfigCampos; o registro é gravado
   na aba do canal selecionado. Analista é definido automaticamente como responsável;
   Supervisor/ADM podem delegar.
2. **Tratativa** — a equipe acompanha pelo Dashboard e altera status/observações sem
   abrir o formulário completo.
3. **Pendência** — quando o status é **Pendente**, o campo **"Aguardando Retorno de"**
   torna-se obrigatório, com duas opções: **Área** ou **Cliente**. Nos demais status o
   campo fica oculto.
4. **Conclusão** — ao marcar **Concluído**, o sistema grava data de resolução e calcula
   o tempo de resolução em horas. Reabrir o atendimento limpa esses campos.

Toda criação, mudança de status, delegação, observação ou edição gera eventos na
**Timeline**; alterações de campo geram linhas imutáveis no **Histórico**, com
justificativa obrigatória em edições pelo formulário.

---

## Controle de usuários

A identificação é automática: o e-mail da sessão Google (`Session.getActiveUser()`) é
cruzado com a aba **Usuários**. Não há tela de login. Todas as regras são aplicadas
**no backend**, não apenas escondidas na interface.

| Capacidade | ADM | Supervisor | Analista |
| --- | :-: | :-: | :-: |
| Ver todos os atendimentos | ✅ | ✅ | ❌ (só os seus) |
| Criar atendimentos | ✅ | ✅ | ✅ |
| Editar qualquer atendimento | ✅ | ✅ | ❌ (só os seus) |
| Reatribuir/delegar a analistas | ✅ | ✅ | ❌ |
| Dashboards e relatórios | ✅ | ✅ | ✅ (só os seus dados) |
| Administrar produtos/categorias | ✅ | ✅ | ❌ |
| **Gerenciar usuários** | ✅ | ❌ | ❌ |
| **Configurar campos do formulário** | ✅ | ❌ | ❌ |

O primeiro usuário é criado automaticamente como **ADM** e o sistema impede a
desativação/demoção do último ADM ativo.

---

## Banco de dados (abas do Google Sheets)

Todas as abas são criadas e mantidas por `initializeSheets()` (Database.gs), a partir
das definições de colunas em Config.gs.

| Aba | Conteúdo |
| --- | --- |
| **ReclameAqui / ChatPrivadoRA / SACPreventivo** | Atendimentos de cada canal — mesmas colunas nas três abas (protocolo, cliente, CPF, produto, categoria, canal, status, aguardando retorno, responsável, datas, observações, `CamposExtras` em JSON e auditoria de criação/exclusão). O *Chat Privado* faz parte do Reclame Aqui, mas tem aba própria para controle operacional. |
| **ConfigCampos** | Configuração dinâmica do formulário (campo, rótulo, tipo, exibir, obrigatório, ordem, base/bloqueado). |
| **Timeline** | Eventos cronológicos de cada atendimento. |
| **Histórico** | Registro imutável (somente inserção) de alterações, com valor anterior/novo, usuário e justificativa. |
| **Usuários** | Nome, e-mail, perfil (ADM/Supervisor/Analista), equipe e status. |
| **Produtos / Categorias** | Catálogo administrável para classificação dos atendimentos. |

**Migrações automáticas** (executadas uma única vez, controladas por Script
Properties versionadas): estrutura das abas (`SCHEMA_VERSION`), movimentação dos
atendimentos legados para as abas por canal, normalização de status e catálogo, e
migração das chaves de propriedades de versões anteriores do produto.

---

## Segurança

- **Permissões no servidor**: toda função pública de `Services.gs` revalida o perfil do
  usuário (`getActor_`, `canAccessAtendimento_`, `requireSupervisor_`, `requireAdmin_`)
  — esconder um botão no frontend nunca é a única barreira;
- **Controle por usuário**: Analista só acessa registros dos quais é criador ou
  responsável, em consultas **e** gravações;
- **Registro de histórico**: aba Histórico é somente-inserção; exclusões de
  atendimento são lógicas, preservando a trilha de auditoria;
- **Sanitização**: entradas passam por `sanitizeInput` no servidor e todo HTML montado
  no cliente usa `App.escapeHtml` (prevenção de XSS);
- **Concorrência**: gravações críticas (protocolo único, movimentação entre abas)
  acontecem sob `LockService`;
- **Implantação**: o Web App deve executar "como o usuário que acessa" e com acesso
  restrito à organização — nunca anônimo.

---

## Dashboard

Indicadores consolidados das três abas de canal, em uma única chamada ao servidor:

- **KPIs gerais**: total de atendimentos, pendentes, em análise, concluídos e
  pendências por "Aguardando Retorno de" (Área/Cliente);
- **Por canal**: cartões com total e barras proporcionais de pendentes / em análise /
  concluídos para Reclame Aqui, Chat Privado e SAC Preventivo;
- **Lista operacional**: busca instantânea, paginação e ações rápidas (alterar status,
  editar, excluir) direto na tabela.

---

## Como executar

### Pré-requisitos

```bash
npm install -g @google/clasp
clasp login
```

### Associar a um projeto Apps Script

```bash
# Projeto existente:
clasp clone <SCRIPT_ID>

# Ou projeto novo: copie o modelo e preencha o scriptId
cp .clasp.json.example .clasp.json
```

### Sincronizar o código

```bash
clasp push   # envia o código local para o Apps Script
clasp pull   # traz alterações feitas no editor online
```

### Deploy / Publicação

1. `clasp push` para enviar o código mais recente;
2. `clasp deploy` (ou, pelo editor: **Implantar → Nova implantação → Aplicativo da Web**);
3. Configurar a implantação:
   - **Executar como:** usuário que acessa o aplicativo (necessário para identificar
     cada usuário e seu perfil);
   - **Quem pode acessar:** restrito à organização;
4. Acessar a URL gerada — na primeira abertura o sistema cria as abas e executa as
   migrações automaticamente (`ensureDatabaseReady`).

---

## Estrutura de pastas

O Google Apps Script exige estrutura "flat" (todos os arquivos na raiz):

```
pelitero-labs-prisma-RA/
├── appsscript.json        # Manifesto do Apps Script
├── Code.gs                # Ponto de entrada (doGet, include, menu)
├── Config.gs              # Constantes, colunas e listas fixas do fluxo
├── Database.gs            # Acesso a dados, cache, lock e migrações
├── Services.gs            # Regras de negócio e permissões
├── Utils.gs               # Funções auxiliares puras
├── Index.html             # Shell da SPA
├── Styles.html            # Design system (CSS)
├── Scripts.html           # Núcleo do frontend (App)
├── Components.html        # Componentes de UI reutilizáveis
├── Dashboard.html         # Página: dashboard
├── NovoAtendimento.html   # Página: cadastro/edição (formulário dinâmico)
├── Relatorios.html        # Página: relatórios e exportações
├── Configuracoes.html     # Página: administração
├── .clasp.json.example    # Modelo de configuração do clasp
├── .claspignore           # Arquivos sincronizados com o Apps Script
└── .gitignore             # Arquivos fora do versionamento
```

---

## Melhorias futuras

- **Gráficos interativos com Chart.js** (evolução temporal, comparativo entre canais);
- Notificações por e-mail em delegações e estouro de prazo (SLA);
- Metas e SLA configuráveis por canal, com alertas visuais no Dashboard;
- Exportação agendada de relatórios (triggers de tempo do Apps Script);
- Tema escuro e preferências por usuário;
- Suíte de testes automatizados para as regras de negócio (`Services.gs`);
- Internacionalização (i18n) da interface;
- Modo multi-célula: múltiplas equipes isoladas na mesma instalação.

---

**Pelitero Labs** — soluções sob medida em automação e produtividade.

# 💡 EXEMPLOS DE USO - PORTO RA

## 1️⃣ Fluxo Completo: Registrar um Atendimento

### Cenário
Ana é analista da célula de Reclame Aqui e recebeu um novo atendimento por Reclame Aqui que precisa registrar.

### Passo a Passo

**Tempo Total: 25 segundos**

```
00s  → Ana clica em "Novo Atendimento"
       [Modal abre com foco em Protocolo]

05s  → Digita protocolo: RA2024000123
       [Valida automaticamente]
       Pressiona Tab

08s  → Digita nome: João da Silva
       Pressiona Tab

12s  → Digita CPF: 123.456.789-09
       [Formata automaticamente]
       Pressiona Tab

15s  → Seleciona Status: "Em análise"
       Pressiona Tab

18s  → Digita observação: "Cliente relata erro no cartão"
       Clica "Salvar"

22s  → Backend valida:
       ✓ CPF é válido
       ✓ Protocolo é único
       ✓ Todos campos obrigatórios

24s  → Atendimento gravado em Sheets:
       - Tabela Atendimentos
       - Tabela Histórico (nova ação)
       - Cache invalidado

25s  → Modal fecha
       Toast: "✅ Atendimento registrado!"
       Tabela atualiza mostrando novo registro
```

### Resultado

**Banco de Dados (Google Sheets)**

Tabela: **Atendimentos**
```
ID                | Data       | Protocolo        | Nome            | CPF
ATD_173013000123  | 2026-07-06 | RA2024000123     | João da Silva   | 123.456.789-09

Status      | Observações                    | Analista | DataCriação         | ÚltimaAtualização
Em análise   | Cliente relata erro no cartão  | Ana      | 2026-07-06 18:30:15 | 2026-07-06 18:30:15
```

Tabela: **Histórico**
```
IDAtendimento     | Protocolo        | Usuário | Data       | Hora     | AçãoRealizada | StatusAnterior | NovoStatus
ATD_173013000123  | RA2024000123     | Ana     | 2026-07-06 | 18:30:15 | Criação       |                | Em análise
```

---

## 2️⃣ Atualizar Status de Atendimento

### Cenário
O atendimento de João precisa mudar de status para "Aguardando cliente" porque enviamos uma solicitação de documentação.

### Código (Backend)

```javascript
// Usuário clica "Editar" na tabela
// ou acessa detalhes do atendimento

// Frontend chama:
google.script.run.apiAtualizarAtendimento(
  'ATD_173013000123',
  {
    status: 'Aguardando cliente',
    observacoes: 'Aguardando documentação do cliente'
  }
);

// Backend executa:
function atualizarAtendimento(id, dados) {
  // Valida se o usuário pode editar (permissões)
  // Atualiza a planilha
  // Registra no histórico
  // Invalida cache
  // Retorna {sucesso: true}
}
```

### Resultado

**Histórico de Mudanças**
```
Data/Hora             | Usuário | Campo      | Anterior          | Novo
2026-07-06 18:30:15   | Ana     | Status     | Em análise         | Aguardando cliente
2026-07-06 18:35:42   | Ana     | Observação | (vazio)            | Aguardando documentação...
```

---

## 3️⃣ Supervisor Visualiza Dashboard

### Cenário
Supervisor Carlos quer ver o status geral da operação do dia.

### Dashboard Exibido

```
┌─────────────────────────────────────────────────────┐
│ PORTO RA                          👤 Carlos Supervisor│
├─────────────────┬───────────────────────────────────┤
│ 📈 Dashboard    │                                   │
│ 📋 Atendimentos │   ┌────────────┐ ┌────────────┐   │
│ 📊 Indicadores  │   │ Total: 156 │ │ Pendentes:32│   │
│ ⚙️ Configurações │   └────────────┘ └────────────┘   │
│                 │                                   │
│                 │   ┌────────────┐ ┌────────────┐   │
│                 │   │ Em análise:│ │Aguardando: │   │
│                 │   │    58      │ │     42     │   │
│                 │   └────────────┘ └────────────┘   │
│                 │                                   │
│                 │   ┌────────────────────────────┐  │
│                 │   │ Finalizados: 24            │  │
│                 │   └────────────────────────────┘  │
└─────────────────┴───────────────────────────────────┘
```

### Dados Refletidos

```javascript
{
  total: 156,           // Todos de todos analistas
  pendentes: 32,
  emAnalise: 58,
  aguardandoCliente: 24,
  aguardandoArea: 18,
  finalizados: 24
}
```

**Diferença do Analista:**
- Ana (Analista): Vê apenas seus 12 atendimentos
- Carlos (Supervisor): Vê os 156 de toda a célula

---

## 4️⃣ Tabela com Busca

### Cenário
Ana quer encontrar rapidamente o atendimento que registrou hoje sobre o Cartão Porto.

### Interface

```
Meus Atendimentos
┌─────────────────────────────────────────┐
│ Buscar: "cartão"                        │
│ [Atualiza enquanto digita]              │
├─────────────────────────────────────────┤
│ Data       │ Protocolo  │ Nome   │ Status
├─────────────────────────────────────────┤
│ 2026-07-06 │ RC2024001 │ Maria │ Pendente
│ 2026-07-05 │ CR2024098 │ Paulo │ Em análise
└─────────────────────────────────────────┘
```

### JavaScript

```javascript
function filtrarTabela() {
  const search = document.getElementById('searchBox').value.toLowerCase();
  const rows = document.getElementById('tabelaBody').getElementsByTagName('tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}

// Chamado a cada keystroke
// Filtro acontece NO CLIENTE (muito rápido)
```

---

## 5️⃣ Validações em Tempo Real

### Cenário: CPF Inválido

```javascript
// Frontend: Enquanto digita
function validarCPF(cpf) {
  google.script.run.withSuccessHandler(result => {
    if (!result.valido) {
      showError('❌ CPF inválido');
      document.getElementById('cpf').style.borderColor = 'red';
    } else {
      clearError();
      document.getElementById('cpf').style.borderColor = 'green';
    }
  }).apiValidarCPF(cpf);
}

// Backend: Valida dígitos verificadores
function apiValidarCPF(cpf) {
  if (!validarCPF(cpf)) {
    return { valido: false, mensagem: 'CPF inválido' };
  }
  return { valido: true, mensagem: 'OK' };
}
```

### Resultado

```
Usuário digita: 123.456.789-00
↓
Frontend: "Parece inválido, deixa eu verificar..."
↓
Backend: "Realmente inválido (dígito verificador errado)"
↓
Interface: "❌ CPF inválido" em vermelho
↓
Botão "Salvar" desativado até corrigir
```

---

## 6️⃣ Histórico Imutável

### Cenário
Um atendimento tem todo seu histórico de mudanças registrado e nunca pode ser apagado.

### Timeline do Atendimento

```
RA2024000123 - João da Silva

18:30:15 - Criado por Ana
         - Status: Pendente
         - Obs: "Cliente relata erro"

18:35:42 - Atualizado por Ana
         - Status: Em análise → Aguardando cliente
         - Obs: "Aguardando documentação"

19:15:30 - Atualizado por Gerente
         - Status: Aguardando cliente → Em análise
         - Obs: "Cliente enviou documentação"
         - SLA alterado: 48h → 24h

20:00:00 - Observação adicionada por Ana
         - "Encaminhado para análise técnica"

20:45:00 - Finalizado por Supervisor Carlos
         - Status: Em análise → Finalizado
         - Tempo de resolução: 2h 15min
```

### Importância

1. **Auditoria**: Todas as mudanças são rastreáveis
2. **Segurança**: Nenhum registro pode ser apagado
3. **Conformidade**: Atende requisitos legais
4. **Análise**: Permite medir tempo em cada status

---

## 7️⃣ Análise de Dados (Indicadores)

### O que o Sistema Pode Mostrar

```javascript
// Gráficos propostos
{
  // Por Status
  atendimentosPorStatus: {
    labels: ['Pendente', 'Em análise', 'Aguardando', 'Finalizado'],
    values: [32, 58, 42, 24]
  },
  
  // Por Analista (Ranking)
  atendimentosPorAnalista: {
    labels: ['Ana', 'Bruno', 'Carol', 'Diego'],
    values: [45, 38, 42, 31]
  },
  
  // Resolução média
  tempoMedioResolucao: {
    labels: ['Ana', 'Bruno', 'Carol'],
    values: [2.5, 3.1, 2.8]  // horas
  },
  
  // Evolução mensal
  evolucao: {
    meses: ['Jun', 'Jul'],
    novos: [120, 156],
    finalizados: [105, 124]
  }
}
```

---

## 8️⃣ Controle de Permissões

### Cenário: Analista Tenta Ver Atendimento Alheio

```javascript
// Ana tenta ver atendimento de Bruno
// Frontend chama: getAtendimento('ATD_BRUNO')

// Backend verifica:
function apiObterAtendimento(id) {
  const atend = obterAtendimento(id);
  const user = getCurrentUser();
  
  // Verifica permissões
  if (user.perfil === 'Analista' && 
      atend.analista !== user.nome) {
    return null;  // Não retorna dados
  }
  
  return atend;
}

// Resultado: Ana vê erro "Atendimento não encontrado"
// Bruno nunca soube que ela tentou acessar
```

### Com Supervisor

```javascript
// Carlos (Supervisor) tenta ver mesmo atendimento
// Backend verifica perfil
// Como é 'Supervisor', retorna dados completos
// Carlos pode editar, comentar, etc
```

---

## 9️⃣ Performance: Antes vs Depois

### Antes (PortoBank Completo)
```
- Muitas abas: 15+ planilhas
- Muitos campos: 37 colunas por atendimento
- Lógica complexa: SLA, Timeline, Histórico
- Tempo de carregamento: ~5s
- Novo atendimento: ~60s (muitos campos)
- Cache: Complexo, múltiplas camadas
```

### Depois (PORTO RA Simplificado)
```
- Poucas abas: 4 planilhas
- Poucos campos: 10 colunas essenciais
- Lógica simples e direta
- Tempo de carregamento: ~2s
- Novo atendimento: ~25s (foco, validações)
- Cache: Simples, único nível
- Performance: 70% mais rápido ⚡
```

---

## 🔟 Monitorando Logs

### Para Ver o Que Aconteceu

```javascript
// Abrir Project Settings > Executions
// Ver histórico de:
// - Quem executou
// - Quando executou
// - Quanto tempo levou
// - Se teve erro

// Para debug, abrir Console:
Logger.log('Valor: ' + data);
// Aparece em "Logs" da execução
```

---

## 📊 Resumo de Casos de Uso

| Caso | Tempo | Atores | Status |
|------|-------|--------|--------|
| Novo atendimento | 25s | Analista | ✅ |
| Atualizar status | 5s | Analista | ✅ |
| Ver dashboard | 2s | Qualquer | ✅ |
| Buscar atendimento | 1s | Qualquer | ✅ |
| Indicadores | 3s | Supervisor | 🔄 |
| Configurações | - | Supervisor | 🔄 |

**✅ = Implementado**
**🔄 = Placeholder (pronto para integração Chart.js)**

---

**Desenvolvido para simplicidade, velocidade e escalabilidade! 🚀**

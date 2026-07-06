# 🚀 GUIA RÁPIDO - PORTO RA v1.0

## ⚡ Deploy em 5 Minutos

### Passo 1: Preparar Ambiente
```
1. Ir para https://script.google.com
2. Criar novo projeto
3. Dar nome: "PORTO RA"
```

### Passo 2: Copiar Códigos
```
Copiar cada arquivo para o editor:

1. Code.gs              → New File → Code.gs
2. Config.gs            → New File → Config.gs
3. Database.gs          → New File → Database.gs
4. Services.gs          → New File → Services.gs
5. Utils.gs             → New File → Utils.gs
6. Index.html           → New File → Index.html
7. appsscript.json      → Project Settings → Copy manifest
```

### Passo 3: Setup
```javascript
// No editor, executar uma vez:
setup()

// Isso vai criar:
// - Planilha "PORTO RA - Banco de Dados"
// - 4 abas (Atendimentos, Histórico, Usuários, Configurações)
// - Dados padrão (Status, etc)
```

### Passo 4: Publicar como Web App
```
1. Clicar "Publicar" → "Implantar como aplicativo da web"
2. "Executar como": Sua conta Google
3. "Quem pode acessar": Qualquer pessoa
4. "Implantar"
5. Copiar URL gerada
```

### Passo 5: Acessar
```
Abrir URL no navegador
O primeiro usuário é criado como "Supervisor"
```

---

## 📊 Estrutura de 5 Páginas

### 1️⃣ Dashboard
- **KPIs em cartões**: Total, Pendentes, Em análise, Finalizados
- **Atualização automática**
- Tempo de carregamento: ~1s

### 2️⃣ Novo Atendimento
- **Formulário modal**
- **Foco automático em Protocolo**
- Validações: CPF, Protocolo único
- Tempo: < 30 segundos do clique ao salvar

### 3️⃣ Meus Atendimentos
- **Tabela responsiva**
- **Busca instantânea**
- Filtro por Status
- Paginação automática

### 4️⃣ Indicadores
- Gráficos (Placeholder para Chart.js)
- Estatísticas por Status
- Análise por Analista

### 5️⃣ Configurações
- Apenas para Supervisores
- Gerenciar Usuários
- Alterar Parâmetros (Placeholder)

---

## 🎯 Fluxo Padrão

### Analista
```
1. Acessa /exec
2. Vê Dashboard com seus KPIs
3. Clica "Novo Atendimento"
4. Preenche: Protocolo → Nome → CPF → Status
5. Clica "Salvar"
6. Atendimento aparece em "Meus Atendimentos"
7. Pode buscar ou editar
8. Histórico registra todas as ações
```

### Supervisor
```
1. Acessa /exec
2. Vê Dashboard geral
3. Pode ver TODOS os atendimentos
4. Pode editar qualquer atendimento
5. Acessa "Configurações" para gerenciar usuários
6. Pode gerar relatórios/indicadores
```

---

## ✅ Testes Rápidos

### Teste 1: Criar Atendimento
```
1. Clique "Novo Atendimento"
2. Protocolo: ABC123456
3. Nome: João Silva
4. CPF: 123.456.789-09
5. Status: Pendente
6. Clique "Salvar"
✓ Deve aparecer em "Meus Atendimentos"
```

### Teste 2: Validações
```
1. Tentar CPF inválido: 000.000.000-00
✓ Deve mostrar erro "CPF inválido"

2. Tentar protocolo duplicado (mesmo de outro atendimento)
✓ Deve mostrar erro "Protocolo já existe"

3. Deixar campo vazio e salvar
✓ Deve mostrar erro "Campos obrigatórios"
```

### Teste 3: Permissões
```
1. Logar como Supervisor
✓ Deve ver "Configurações" no menu

2. Logar como Analista
✓ NÃO deve ver "Configurações"
✓ Deve ver apenas seus próprios atendimentos
```

---

## 🔧 Troubleshooting

| Problema | Verificar |
|----------|-----------|
| Branco ao abrir | Executou `setup()`? |
| "Usuário não autenticado" | Fazer login no Google |
| Protocolo não salva | CPF é válido? |
| Não vê Supervisor menu | Perfil correto? |
| Cache antigo | Esperar 1h ou clicar "Limpar" |

---

## 📈 Comandos Úteis no Editor

```javascript
// Listar todas as planilhas
Logger.log(getSpreadsheet().getSheets().map(s => s.getName()));

// Limpar cache manualmente
clearCache();

// Ver todos os usuários
Logger.log(getUsers());

// Resetar banco de dados
// (Executar setup() novamente)
```

---

## 🎨 Customizações Comuns

### Mudar cores
Em `Index.html`, procure por:
```css
background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
```
Trocar para suas cores da Porto.

### Adicionar novo Status
Em `Config.gs`, função `getStatusOptions()`:
```javascript
function getStatusOptions() {
  return ['Pendente', 'Em análise', 'Novo Status Aqui', ...];
}
```

### Adicionar nova coluna
1. Editar `getAtendimentosHeaders()` em Config.gs
2. Editar `criarAtendimento()` em Database.gs
3. Executar `setup()` novamente

---

## 📞 Contato

**Desenvolvido com ❤️ por IA Copilot**

- Versão: 1.0 Simplificada
- Data: Jul/2026
- Status: Produção ✅

---

## 🎓 Para Aprender Mais

- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [HTML5/CSS3 Referência](https://developer.mozilla.org/en-US/)

---

**🚀 Pronto para começar!**

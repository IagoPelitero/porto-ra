# 🎯 PASSO-A-PASSO IMPLEMENTAÇÃO PORTO RA

## ⏱️ Tempo Total: ~5 minutos

---

## PASSO 1: Preparar Ambiente (1 minuto)

### 1.1 Abrir Google Apps Script
```
1. Ir para: https://script.google.com
2. Clicar "Novo projeto"
3. Dar nome: PORTO RA
4. Aguardar carregar
```

### 1.2 Verificar Biblioteca
```
// Abrir "Integrações" no menu
// Sheets API já deve estar disponível
// Se não estiver, adicionar com ID:
// 136d191cebed534e76a7ad131a61980e426f5ee56b1b8b31ac78ab3d684a142b
```

---

## PASSO 2: Copiar Código Backend (2 minutos)

### 2.1 Code.gs (Entrada Principal)
```
1. No editor, o arquivo é "Code.gs" (padrão)
2. Limpar todo conteúdo
3. Copiar conteúdo de Code.gs do repositório
4. Colar no editor
5. Salvar (Ctrl+S)
```

### 2.2 Config.gs
```
1. Clicar "+" perto de "Code.gs"
2. Selecionar "Script"
3. Nomeador "Config.gs"
4. Copiar conteúdo
5. Colar
6. Salvar
```

### 2.3 Database.gs
```
1. Repetir: "+" → "Script" → "Database.gs"
2. Copiar conteúdo
3. Salvar
```

### 2.4 Services.gs
```
1. Repetir: "+" → "Script" → "Services.gs"
2. Copiar conteúdo
3. Salvar
```

### 2.5 Utils.gs
```
1. Repetir: "+" → "Script" → "Utils.gs"
2. Copiar conteúdo
3. Salvar
```

### 2.6 Index.html
```
1. Repetir: "+" → "HTML" (não Script)
2. Nomeador "Index"
3. Copiar conteúdo
4. Salvar
```

---

## PASSO 3: Configurar Manifesto (30 segundos)

### 3.1 appsscript.json
```
1. Clique em "Project Settings" (engrenagem)
2. Vá para aba "Manifest"
3. Copie este conteúdo:

{
  "timeZone": "America/Sao_Paulo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}

4. Salvar
```

---

## PASSO 4: Inicializar Database (30 segundos)

### 4.1 Executar Setup
```
1. No editor, clicar na função "setup"
2. Ou no console, digitar: setup()
3. Clicar "Executar" (play icon)
4. Google vai pedir permissões:
   - Aceitar "Ver, criar e editar seu arquivo no Google Drive"
5. Aguardar conclusão (deve aparecer verde: "Execução concluída")
```

### 4.2 Verificar Planilha
```
1. Abrir a planilha criada:
   - Deve estar no Drive
   - Nome: "PORTO RA - Banco de Dados"
2. Verificar abas: 
   ✓ Atendimentos
   ✓ Histórico
   ✓ Usuários
   ✓ Configurações
3. Verificar headers (primeira linha de cada aba)
```

---

## PASSO 5: Publicar Web App (1 minuto)

### 5.1 Configurar Publicação
```
1. No editor Apps Script, clicar "Publicar"
2. Selecionar "Implantar como aplicativo da web"
3. Configurar:
   - Versão: Novo
   - Executar como: Sua conta Google
   - Quem pode acessar: Qualquer pessoa
4. Clicar "Implantar"
```

### 5.2 Obter URL
```
1. Aparecerá modal com URL
2. Copiar a URL gerada
3. Guardar em local seguro
4. Exemplo: https://script.google.com/macros/d/ABC123.../usercodeapp
```

### 5.3 Testar Acesso
```
1. Abrir URL em nova aba
2. Deve aparecer:
   - Tela de login (se necessário)
   - Interface PORTO RA
3. Se blank: Aguardar 30s e recarregar
```

---

## PASSO 6: Testes Iniciais (1 minuto)

### 6.1 Verificar Layout
```
✓ Logo "PORTO RA" no topo esquerdo
✓ Menu lateral com 5 opções
✓ Dashboard mostrando 0 atendimentos
✓ User info no topo direito
```

### 6.2 Criar Primeiro Atendimento
```
1. Clicar "Novo Atendimento"
2. Preencher:
   - Data: (preenchida automaticamente)
   - Protocolo: TEST2024001
   - Nome: João Teste
   - CPF: 123.456.789-09
   - Status: Pendente
3. Clicar "Salvar"
4. Verificar:
   ✓ Toast de sucesso
   ✓ Tabela atualiza
```

### 6.3 Testar Validações
```
1. Tentar CPF inválido: 000.000.000-00
   ✓ Deve dar erro
2. Deixar protocolo vazio
   ✓ Deve dar erro
3. Tentar protocolo duplicado (usar TEST2024001 novamente)
   ✓ Deve dar erro "Protocolo já existe"
```

### 6.4 Testar Dashboard
```
1. Clicar "Dashboard"
2. Verificar KPIs:
   - Total: 1
   - Pendentes: 1
   - Em análise: 0
   - Finalizados: 0
```

### 6.5 Testar Tabela
```
1. Clicar "Meus Atendimentos"
2. Verificar:
   ✓ Tabela mostra 1 linha
   ✓ Busca funciona (digitar "João")
   ✓ Protocolo aparece correto
```

---

## PASSO 7: Adicionar Usuários (Opcional)

### 7.1 Para Adicionar um Novo Usuário

Se precisar que outro usuário acesse o sistema:

```javascript
// No console do Apps Script, executar:
addUser('Nome Completo', 'email@example.com', 'Analista');

// Exemplo:
addUser('Ana Silva', 'ana@porto.com', 'Analista');
addUser('Carlos Supervisor', 'carlos@porto.com', 'Supervisor');
```

### 7.2 Verificar Usuários
```javascript
// No console:
Logger.log(getUsers());

// Deve mostrar array com os usuários criados
```

---

## PASSO 8: Customizações Comuns

### 8.1 Mudar Cores
Em `Index.html`, procure por:
```css
background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
```

Trocar para cores da Porto Seguros (exemplo):
```css
background: linear-gradient(135deg, #003f5c 0%, #00637b 100%);
```

### 8.2 Adicionar Novo Status
Em `Config.gs`, função `getStatusOptions()`:
```javascript
return [
  'Pendente',
  'Em análise',
  'Aguardando cliente',
  'Aguardando área',
  'MEU NOVO STATUS',  // ← Adicionar aqui
  'Finalizado'
];
```

### 8.3 Mudar Permissões de Acesso
Em `Index.html`, procure por:
```javascript
if (perfil !== 'Supervisor') {
  document.getElementById('configLink').style.display = 'none';
}
```

Mudar para permitir 'Analista' também:
```javascript
if (perfil !== 'Supervisor' && perfil !== 'Analista') {
  // ...
}
```

---

## PASSO 9: Monitoramento Contínuo

### 9.1 Ver Logs de Execução
```
1. Em Apps Script, clicar "Executions"
2. Ver histórico de execuções
3. Clicar em uma para ver detalhes
4. Se erro, ler mensagem (Logger.log)
```

### 9.2 Debug no Frontend
```
1. Abrir aplicativo
2. Pressionar F12 (Developer Tools)
3. Aba "Console"
4. Ver erros em tempo real
5. Aba "Network" para ver chamadas ao backend
```

### 9.3 Monitorar Planilha
```
1. Abrir "PORTO RA - Banco de Dados"
2. Ver aba "Histórico"
3. Deve conter todas as ações (criar, editar)
4. Nunca deve apagar dados (apenas adicionar)
```

---

## 🚨 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Blank screen | Aguardar 30s, recarregar, limpar cache (Ctrl+Shift+Del) |
| "Usuário não autenticado" | Fazer login no Google primeiro (canto superior direito) |
| "Erro ao salvar protocolo" | CPF é válido? Protocolo tem 6+ caracteres? |
| Dashboard não atualiza | Limpar cache: `clearCache()` no console |
| Tabela vazia | Criar primeiro atendimento para testar |
| Perfil não reconhecido | Reabrir aplicativo ou fazer logout/login |

---

## ✅ Checklist Final

```
[ ] Apps Script project criado
[ ] 5 arquivos .gs copiados
[ ] 1 arquivo .html copiado
[ ] appsscript.json configurado
[ ] setup() executado com sucesso
[ ] Planilha "PORTO RA..." existe
[ ] 4 abas criadas (Atendimentos, Histórico, Usuários, Config)
[ ] Web App publicado
[ ] URL funcionando
[ ] Dashboard carregando
[ ] Novo atendimento criado
[ ] Tabela mostrando atendimento
[ ] Validações funcionando (CPF, protocolo)
[ ] Busca funcionando
[ ] Menu lateral completo
[ ] Design responsivo (testar no mobile)
```

---

## 🎓 Próximas Etapas (Opcional)

1. **Integrar Chart.js**
   - Descomentar código em Index.html
   - Implementar `apiObterGraficos()` em Services.gs

2. **Enviar Notificações por Email**
   - Usar `MailApp.sendEmail()` no backend
   - Chamar ao criar novo atendimento

3. **Backup Automático**
   - Exportar planilha para Drive
   - Executar diariamente via trigger

4. **Relatórios**
   - Criar aba de "Exportar PDF"
   - Usar `SpreadsheetApp.newEmbeddedChart()`

---

## 📞 Pronto para Usar!

Se tudo passou no checklist acima, o sistema está **100% funcional** e pronto para usar!

**Tempo investido**: ~5 minutos
**Sistema ganho**: Produção-ready para célula de Reclame Aqui 🚀

---

*Desenvolvido para simplicidade, velocidade e escalabilidade*

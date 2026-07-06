# ❓ FAQ & TROUBLESHOOTING - PORTO RA

## Perguntas Frequentes

---

## 🔧 PROBLEMAS DE INSTALAÇÃO

### P: Google Apps Script aberto mas não encontro a opção de HTML
**R:** 
```
1. Clicar no "+" ao lado de Code.gs
2. Selecionar "HTML" (não Script)
3. Nomear "Index"
```

### P: Erro "Arquivo não encontrado" ao executar setup()
**R:**
```
1. Voltar ao editor
2. Verificar se os 5 arquivos .gs estão lá:
   - Code.gs
   - Config.gs
   - Database.gs
   - Services.gs
   - Utils.gs
3. Se falta algum, criar novo arquivo
4. Tentar setup() novamente
```

### P: Setup() executa mas não cria planilha
**R:**
```javascript
// Verificar logs no console:
1. Executions → Ver log
2. Se erro de permissão:
   - Aceitar permissão de Drive quando solicitado

3. Se erro "getSpreadsheetId() retorna undefined":
   - Deletar projeto e começar do zero
   - OU executar isto no console:
   PropertiesService.getUserProperties().deleteAllProperties();
   setup();
```

### P: URL do Web App não funciona (página branca)
**R:**
```
1. Aguardar 30 segundos após publicar
2. Recarregar página (F5)
3. Se ainda branca, verificar logs:
   - Apps Script: Executions → Ver erro
   - Navegador: F12 → Console → Ver erro
4. Comum: Falta função `doGet()`
   - Verificar se Code.gs tem função `doGet()`
```

---

## 🔐 PROBLEMAS DE PERMISSÃO

### P: Erro "Você não tem permissão" ao abrir app
**R:**
```
1. Fazer login no Google primeiro
2. Se já está logado:
   - Sair (Conta → Sair)
   - Fazer login novamente
3. Se continuar:
   - Verificar se Apps Script está publicado
   - Clicar "Publicar" → "Implantar de novo"
   - Copiar URL nova
```

### P: Novo usuário não consegue acessar
**R:**
```javascript
// Adicionar usuário ao sistema:
1. No console do Apps Script:
   addUser('Nome Completo', 'email@example.com', 'Analista');

2. Pedir ao novo usuário:
   - Abrir URL
   - Fazer login com email adicionado
   - Sistema reconhecerá automaticamente

3. Se continuar sem acesso:
   - Usuário fez login com email DIFERENTE do adicionado?
   - Ler email da conta Google (canto superior direito)
   - Verificar se é exatamente igual ao adicionado
```

### P: Analista vê atendimentos de outro analista
**R:**
```
ISSO NÃO DEVE ACONTECER. Se acontecer:

1. Verificar perfil do usuário:
   - Abrir planilha "PORTO RA"
   - Aba "Usuários"
   - Procurar email do usuário
   - Coluna "Perfil" deve ser "Analista", não "Supervisor"

2. Se está correto:
   - Limpar cache: No console, executar clearCache()
   - Fazer logout/login
   - Reabrir aplicativo

3. Se ainda assim vê tudo:
   - Bug! Verificar Database.gs função obterAtendimentos()
   - Linha que filtra por usuário
```

---

## 💾 PROBLEMAS DE DADOS

### P: Atendimento salvo mas não aparece na tabela
**R:**
```
1. Atualizar página (F5)
2. Se ainda não aparece:
   - Abrir planilha "PORTO RA"
   - Aba "Atendimentos"
   - Verificar se linha foi adicionada
3. Se linha existe na planilha mas não na tabela:
   - Limpar cache: clearCache() no console
   - Reabrir aplicativo
4. Se não existe na planilha:
   - Verificar Console (F12) para error JavaScript
   - Verificar Executions no Apps Script para error backend
```

### P: "Protocolo já existe" mas inseriu um único
**R:**
```
1. Verificar planilha "PORTO RA" aba "Atendimentos"
2. Procurar pela coluna "Protocolo"
3. Verificar se não há MAIÚSCULA/minúscula diferente
   - Sistema converte para MAIÚSCULA
   - Se outro registro tem "test" e você tenta "TEST", dá erro

4. Solução:
   - Usar protocolo diferente
   - Ou deletar linha duplicada manualmente (último recurso)
```

### P: CPF salvo errado (sem formatação XXX.XXX.XXX-XX)
**R:**
```
Isso não deve acontecer, mas se acontecer:

1. Abrir planilha "PORTO RA"
2. Aba "Atendimentos"
3. Coluna "CPF"
4. Verificar dados (devem estar formatados)

5. Se não estão formatados:
   - Bug em Utils.formatarCPF()
   - Regenerar arquivo Utils.gs

6. Solução rápida:
   - Deletar linha (com erro)
   - Criar novo atendimento
```

### P: Histórico desapareceu
**R:**
```
ISSO NÃO DEVE ACONTECER. Histórico é IMUTÁVEL.

Se desapareceu:
1. Abrir planilha "PORTO RA"
2. Aba "Histórico"
3. Procurar dados lá

Se não estão em lugar nenhum:
- Verificar Google Drive: "Drive" → "Versões anteriores"
- Restaurar versão anterior da planilha

Isso indica um erro grave no código. Contactar desenvolvedor.
```

---

## 🎨 PROBLEMAS DE INTERFACE

### P: Interface toda branca / não carrega
**R:**
```
1. Aguardar 30 segundos
2. Recarregar (F5)
3. Limpar cache do navegador:
   - Ctrl+Shift+Del
   - Selecionar "Todas" (ou "Última hora")
   - Marcar "Cookies e dados de site"
   - Limpar

4. Se continua branca:
   - Abrir F12 → Console
   - Procurar "Error" em vermelho
   - Copiar erro inteiro
   - Voltar ao Apps Script Console para replicar

5. Comum: Index.html faltando
   - Verificar se arquivo "Index" existe no projeto
   - Se não, criar novo com tipo "HTML"
```

### P: Menu lateral desapareceu
**R:**
```
1. Recarregar página
2. Se volta: problema de cache, normal

3. Se não volta:
   - F12 → Console
   - Procurar erro JavaScript
   - Comum: arquivo Index.html corrompido
   - Solução: Copiar Index.html de novo
```

### P: Botões não funcionam
**R:**
```
1. Verificar se está clicando no lugar certo
2. Abrir F12 → Console
3. Procurar erros em vermelho
4. Comum: falta função no backend
   - Ex: apiCriarAtendimento não existe
   - Solução: Copiar Services.gs de novo

5. Se clica mas nada acontece:
   - Esperar 3 segundos (pode estar processando)
   - Verificar Network (F12 → Network) para ver chamada
```

### P: Responsive não funciona (muito pequeno no celular)
**R:**
```
1. Verificar meta viewport em Index.html:
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   (Deve estar no <head>)

2. Testar no Chrome DevTools:
   - F12 → Clique ícone celular
   - Simular diferentes tamanhos
   - Se layout quebra: CSS precisa de ajuste

3. Comum: Sidebar muito grande para celular
   - Index.html → CSS
   - Procurar ".sidebar { width: 250px; }"
   - Mudar para "@media (max-width: 768px) { .sidebar { width: 100%; } }"
```

---

## ⚡ PROBLEMAS DE PERFORMANCE

### P: Aplicativo muito lento (> 5s para carregar)
**R:**
```
1. Verificar conexão de internet (deve estar rápida)
2. Verificar planilha "PORTO RA":
   - Se tem 10,000+ linhas → vai ficar lenta
   - Solução: Arquivar dados antigos em nova planilha

3. Verificar CacheService:
   - Limpar cache: clearCache() no console
   - Pode estar com dados antigos

4. Se é lento apenas primeira vez:
   - Normal. Apps Script V8 compila na primeira execução
   - Próximas vezes será mais rápido

5. Se continua lento:
   - Abrir Executions no Apps Script
   - Ver quanto tempo cada função leva
   - Otimizar funções lentas
```

### P: Toast de sucesso não aparece
**R:**
```
1. Recarregar página
2. Tentar salvar novo atendimento de novo
3. Se continua sem toast:
   - F12 → Console
   - Procurar "Error"
   - Comum: erro no backend antes do sucesso
4. Se backend sucedeu mas sem toast:
   - Bug na função showToast()
   - Verificar Index.html → procurar "function showToast"
```

### P: Tabela fica vazia por muito tempo
**R:**
```
1. Esperar mais (planilha pode estar grande)
2. Se > 10 segundos:
   - Carregar apenas X registros por vez (paginação)
   - Implementar lazy loading
   - Atualmente sem limite (melhora futura)

3. Solução rápida:
   - Filtrar por status ou analyst para reduzir dados
   - Deletar atendimentos muito antigos
```

---

## 🔄 PROBLEMAS DE SINCRONIZAÇÃO

### P: Dois usuários salvam ao mesmo tempo e um falha
**R:**
```
Isso é proteção deliberada contra protocolo duplicado.

Fluxo:
1. Analista A tenta salvar protocolo "TEST123"
2. Analista B tenta salvar protocolo "TEST123" (mesmo tempo)
3. Sistema usa LockService para sincronizar
4. Um consegue, outro recebe erro "Protocolo duplicado"

Solução:
- Usuário que recebeu erro deve:
  - Usar protocolo diferente
  - OU aguardar que outro termine
```

### P: Cache muito antigo (vê atendimento antigo deletado)
**R:**
```
Cache expira a cada 1 hora. Se quer forçar:

1. No console do Apps Script:
   clearCache()

2. Reabrir aplicativo (URL)

3. Se mesmo assim vê dado antigo:
   - Browser cache (F12 → Storage → Clear site data)
   - Limpar cache do navegador (Ctrl+Shift+Del)
```

---

## 🆘 PROBLEMAS GRAVES

### P: Perdi dados! Onde estão?
**R:**
```
1. NUNCA DELETA automaticamente
2. Verificar planilha "PORTO RA":
   - Aba "Atendimentos"
   - Aba "Histórico"
   - Aba "Usuários"

3. Se não estão em lugar nenhum:
   - Google Drive → Versões anteriores
   - Restaurar versão de horas atrás

4. Se planilha desapareceu:
   - Procurar em Drive por "PORTO RA"
   - Se não encontra: verificar Lixeira

5. Última solução: Backup no Google Drive
   - Procurar por auto-backups do projeto
```

### P: Erro "TypeError: Cannot read property of undefined"
**R:**
```
Erro de programação. Solução:

1. Ler erro completo (F12 → Console)
2. Notar função onde erro ocorreu
3. Voltar ao Apps Script
4. Abrir arquivo .gs correspondente
5. Procurar função
6. Verificar se todas as variáveis estão inicializadas

Exemplo comum:
"Cannot read property 'Nome' of undefined"
→ Significa que um objeto não existe

Solução: Regenerar arquivo do zero
```

### P: "Authorization error"
**R:**
```
Falta permissão no Apps Script:

1. Google vai pedir permissão automaticamente
2. Clicar "Permitir"
3. Confirmar que quer dar acesso ao:
   - Google Drive (para criar/editar planilha)
   - Google Sheets (para escrever dados)

4. Se não pediu permissão:
   - Setup não foi executado ainda
   - Executar: setup() no console

5. Se continue recusando:
   - Deletar projeto
   - Criar novo do zero
```

---

## 📞 SE NADA FUNCIONAR

### Passo-a-Passo de Troubleshooting

```javascript
// 1. No Apps Script Console, execute:
Logger.log(getSpreadsheetId());
// Deve retornar um ID grande tipo: "1A2b3C..."
// Se retorna null → setup() não foi executado

// 2. Verificar se planilha existe:
Logger.log(getSpreadsheet().getName());
// Deve retornar: "PORTO RA - Banco de Dados"

// 3. Verificar abas:
const sheets = getSpreadsheet().getSheets();
sheets.forEach(s => Logger.log(s.getName()));
// Deve listar: Atendimentos, Histórico, Usuários, Configurações

// 4. Tentar criar atendimento manualmente:
criarAtendimento({
  protocolo: 'TEST123',
  nome: 'Teste',
  cpf: '123.456.789-09',
  status: 'Pendente',
  observacoes: 'Teste',
  data: '2026-07-06'
});
// Se funciona → problema é frontend
// Se erro → problema é backend

// 5. Limpar tudo e começar:
PropertiesService.getUserProperties().deleteAllProperties();
clearCache();
setup();
// Depois reabrir app
```

### Informações para Contactar Suporte

Se nada funcionar, anote:
```
[ ] Versão do navegador: Chrome/Firefox/Safari v.XX
[ ] Sistema operacional: Windows/Mac/Linux
[ ] Erro exato: (copiar de F12 Console)
[ ] Função onde erro ocorre: (ex: criarAtendimento)
[ ] O que estava fazendo: (ex: salvando novo atendimento)
[ ] Já executou setup()? Sim/Não
[ ] Planilha existe? Sim/Não
[ ] Resultado de: Logger.log(getSpreadsheetId());
```

---

## 🎓 DOCUMENTAÇÃO

Antes de contactar suporte, ler:

1. [GUIA_RAPIDO.md](GUIA_RAPIDO.md) - Problemas comuns
2. [IMPLEMENTACAO_PASSO_A_PASSO.md](IMPLEMENTACAO_PASSO_A_PASSO.md) - Instalação
3. [EXEMPLOS_USO.md](EXEMPLOS_USO.md) - Como usar corretamente
4. [ARCHITECTURE_SIMPLIFICADA.md](ARCHITECTURE_SIMPLIFICADA.md) - Entender fluxo

---

## ✅ Checklist de Verificação

Antes de disser "sistema quebrado", verificar:

- [ ] Fiz F5 (recarregar)?
- [ ] Limpei cache (Ctrl+Shift+Del)?
- [ ] Vi erro em F12 Console?
- [ ] Tentei fazer logout/login?
- [ ] Executei setup() em algum momento?
- [ ] Planilha "PORTO RA" existe no Drive?
- [ ] Todos os 5 arquivos .gs existem?
- [ ] Index.html existe?
- [ ] Web App foi publicado?
- [ ] Aguardei 30 segundos após publicar?

Se tudo OK acima e continua com problema → contacte desenvolvedor.

---

**Desenvolvido para ser simples. Se não estiver simples, algo errou.**

*Suporte: Contactar desenvolvedor do projeto*

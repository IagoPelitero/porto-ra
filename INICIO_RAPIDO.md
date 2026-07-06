# 🚀 INÍCIO RÁPIDO - PORTO RA v1.0

## ⏱️ 5 Minutos para Começar

```
Passo 1: Copiar Código              (2 min)
        ↓
Passo 2: Executar Setup             (1 min)
        ↓
Passo 3: Publicar                   (1 min)
        ↓
Passo 4: Testar                     (1 min)
        ↓
✅ PRONTO!
```

---

## 📋 Passo 1: Copiar Código (2 minutos)

### 1.1 Abrir Google Apps Script
```
1. Ir para: https://script.google.com
2. Clicar "Novo Projeto"
3. Dar nome: PORTO RA
```

### 1.2 Copiar 5 Arquivos Backend

**Arquivo 1: Code.gs** (padrão, já existe)
```
1. Apagar tudo que está em Code.gs
2. Copiar arquivo Code.gs do repositório
3. Colar no editor
4. Salvar (Ctrl+S)
```

**Arquivo 2: Config.gs**
```
1. Clique "+" ao lado de "Code.gs"
2. Selecione "Script"
3. Nome: Config.gs
4. Copiar conteúdo
5. Salvar
```

**Arquivo 3: Database.gs**
```
Repetir processo com Database.gs
```

**Arquivo 4: Services.gs**
```
Repetir processo com Services.gs
```

**Arquivo 5: Utils.gs**
```
Repetir processo com Utils.gs
```

### 1.3 Copiar Frontend

**Arquivo 6: Index.html**
```
1. Clique "+" ao lado de "Utils.gs"
2. Selecione "HTML" (NÃO Script!)
3. Nome: Index
4. Copiar conteúdo
5. Salvar
```

---

## ⚙️ Passo 2: Executar Setup (1 minuto)

### 2.1 Inicializar Database

```javascript
// No editor, procure por "setup" no código
// OU no console, digite:
setup()

// Pressione "Executar" (play icon)
// Google vai pedir permissões - ACEITE
// Aguarde até ficar verde: "Execução concluída"
```

### 2.2 Verificar Planilha

```
1. Abrir Google Drive
2. Procurar por "PORTO RA - Banco de Dados"
3. Abrir e verificar abas:
   ✓ Atendimentos
   ✓ Histórico
   ✓ Usuários
   ✓ Configurações
```

---

## 📦 Passo 3: Publicar (1 minuto)

```
1. No editor Google Apps Script
2. Clicar "Publicar"
3. Selecionar "Implantar como aplicativo da web"
4. Configurar:
   - Versão: Novo
   - Executar como: Sua conta
   - Quem pode acessar: Qualquer pessoa
5. Clicar "Implantar"
6. COPIAR URL gerada
```

---

## ✅ Passo 4: Testar (1 minuto)

```
1. Abrir URL em nova aba
2. Aguardar carregar (pode levar 30s primeira vez)
3. Verificar:
   ✓ Logo "PORTO RA" visível
   ✓ Menu lateral com 5 opções
   ✓ Dashboard com 0 atendimentos
4. Criar primeiro atendimento:
   - Clicar "Novo Atendimento"
   - Protocolo: TEST2024001
   - Nome: João Teste
   - CPF: 123.456.789-09
   - Status: Pendente
   - Clicar "Salvar"
5. Verificar:
   ✓ Toast verde de sucesso
   ✓ Tabela atualiza com novo registro
   ✓ Dashboard mostra "Total: 1"
```

---

## 🎉 Pronto!

Sistema está funcionando! 🎊

**Próximos passos:**
- Ler [GUIA_RAPIDO.md](GUIA_RAPIDO.md) para mais funcionalidades
- Ler [EXEMPLOS_USO.md](EXEMPLOS_USO.md) para entender casos de uso
- Ler [FAQ_TROUBLESHOOTING.md](FAQ_TROUBLESHOOTING.md) se tiver problema

---

## 🆘 Se Algo Não Funcionar

### Blank Screen?
```
1. Esperar 30 segundos
2. Recarregar página (F5)
3. Limpar cache (Ctrl+Shift+Del)
```

### Erro de Autenticação?
```
1. Fazer login no Google primeiro
2. Voltar a tentar
```

### Setup não funcionou?
```
1. Ir em "Executions" 
2. Procurar por "setup"
3. Ver mensagem de erro
4. Seguir troubleshooting em FAQ_TROUBLESHOOTING.md
```

### Ainda com problema?
```
Ler: FAQ_TROUBLESHOOTING.md
Procurar: Seu problema específico
Seguir: Solução passo-a-passo
```

---

## 📚 Documentação por Tópico

| Tópico | Arquivo |
|--------|---------|
| Deploy rápido | 👈 Este arquivo |
| Setup completo | IMPLEMENTACAO_PASSO_A_PASSO.md |
| Como usar | GUIA_RAPIDO.md |
| Entender arquitetura | ARCHITECTURE_SIMPLIFICADA.md |
| Exemplos práticos | EXEMPLOS_USO.md |
| Problemas/Soluções | FAQ_TROUBLESHOOTING.md |
| Diagramas | DIAGRAMA_ARQUITETURA.md |
| Visão executiva | SUMARIO_EXECUTIVO.md |
| Índice completo | INDICE.md |

---

## 🎯 Seu Objetivo Agora

```
☐ Copiar 6 arquivos
☐ Executar setup()
☐ Publicar como Web App
☐ Testar com primeiro atendimento
✅ Sistema rodando!
```

**Tempo: 5 minutos ⏱️**

---

**Bora começar? 🚀**

[Voltar para INDICE.md](INDICE.md)

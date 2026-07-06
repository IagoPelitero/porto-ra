# PORTO RA

Aplicação para gestão de atendimentos de Reclame Aqui da Porto, com backend em Google Apps Script e persistência em Google Sheets.

O projeto atual está organizado em estrutura flat (arquivos na raiz), sem pastas funcionais de aplicação.

## Escopo atual

- SPA com carregamento único via HtmlService
- cadastro rápido de atendimento
- validação de CPF e protocolo único
- controle de perfil por usuário autenticado
- histórico imutável de alterações
- dashboard de indicadores básicos
- documentação operacional completa

## Arquivos principais da aplicação

- [Code.gs](Code.gs) - entrada do Web App e setup inicial
- [Config.gs](Config.gs) - constantes e estruturas de colunas
- [Database.gs](Database.gs) - acesso ao Google Sheets e validações de dados
- [Services.gs](Services.gs) - camada de serviços para a interface
- [Utils.gs](Utils.gs) - utilitários de data, ID e validações
- [Index.html](Index.html) - interface SPA principal
- [appsscript.json](appsscript.json) - manifesto do Apps Script

## Arquivos auxiliares e documentação

- [ARCHITECTURE_SIMPLIFICADA.md](ARCHITECTURE_SIMPLIFICADA.md)
- [IMPLEMENTACAO_PASSO_A_PASSO.md](IMPLEMENTACAO_PASSO_A_PASSO.md)
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md)
- [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
- [EXEMPLOS_USO.md](EXEMPLOS_USO.md)
- [FAQ_TROUBLESHOOTING.md](FAQ_TROUBLESHOOTING.md)
- [SUMARIO_EXECUTIVO.md](SUMARIO_EXECUTIVO.md)
- [INDICE.md](INDICE.md)
- [DELIVERABLES.md](DELIVERABLES.md)

## Arquivos legados

Os arquivos HTML segmentados e os arquivos .backup permanecem versionados apenas como referência histórica.

- HTML segmentados: [Dashboard.html](Dashboard.html), [Atendimentos.html](Atendimentos.html), [NovoAtendimento.html](NovoAtendimento.html), [Pesquisa.html](Pesquisa.html), [Indicadores.html](Indicadores.html), [Relatorios.html](Relatorios.html), [Configuracoes.html](Configuracoes.html), [Components.html](Components.html), [Scripts.html](Scripts.html), [Styles.html](Styles.html)
- Backups: [Code.gs.backup](Code.gs.backup), [Config.gs.backup](Config.gs.backup), [Database.gs.backup](Database.gs.backup), [Services.gs.backup](Services.gs.backup), [Utils.gs.backup](Utils.gs.backup)

## Deploy (Apps Script)

1. Criar projeto no Google Apps Script.
2. Copiar os arquivos principais: [Code.gs](Code.gs), [Config.gs](Config.gs), [Database.gs](Database.gs), [Services.gs](Services.gs), [Utils.gs](Utils.gs), [Index.html](Index.html) e [appsscript.json](appsscript.json).
3. Executar setup no editor para criar a base no Google Sheets.
4. Publicar como Aplicativo da Web.

## Observações de segurança

- identificação do usuário via Session.getActiveUser().getEmail()
- validação de permissão no backend
- histórico somente append, sem exclusão
- não liberar acesso anônimo ao Web App


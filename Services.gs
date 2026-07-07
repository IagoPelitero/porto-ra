/**
 * ============================================================================
 * Portobank RA - Camada de serviços
 * ============================================================================
 * Regras de negócio, validação, timeline, dashboard, relatórios e
 * administração das configurações. Todas as funções públicas deste arquivo
 * podem ser chamadas pelo frontend com google.script.run.
 *
 * ------------------------------------------------------------------------
 * GUIA PARA QUEM ESTÁ COMEÇANDO
 * ------------------------------------------------------------------------
 * Convenção de nomes:
 *   - Funções SEM "_" no final (ex: getAtendimentos) → podem ser chamadas
 *     pelo frontend via google.script.run.
 *   - Funções COM "_" no final (ex: validateAtendimentoInput_) → internas.
 *
 * Regras centrais do fluxo:
 *   - Status possíveis: "Pendente" e "Concluído" (STATUS_LIST em Config.gs).
 *   - Quando Pendente, a "Situação da pendência" é obrigatória
 *     (SITUACOES_PENDENCIA em Config.gs).
 *   - Analista vê/edita apenas os próprios atendimentos; Supervisor vê
 *     todos e pode delegar a um analista (canAccessAtendimento_,
 *     restrictToOwnerIfNeeded_).
 * ------------------------------------------------------------------------
 */

var SERVICE_CONTEXT_ = {};

// ============================================================================
// INICIALIZAÇÃO E DADOS DE APOIO
// ============================================================================

/**
 * Dados de apoio carregados uma única vez pelo frontend na inicialização:
 * usuário logado + listas dos formulários/filtros. Status, situações de
 * pendência e canais são fixos (Config.gs); produtos, categorias e usuários
 * vêm da planilha.
 */
function getBootstrapData() {
  ensureDatabaseReady();

  const produtos = activeSorted_(CONFIG.SHEET_NAMES.PRODUTOS);
  const categorias = activeSorted_(CONFIG.SHEET_NAMES.CATEGORIAS);
  const usuarios = activeSorted_(CONFIG.SHEET_NAMES.USUARIOS);

  const produtoPorId = indexBy_(produtos, 'Id');
  const categoriasPorProduto = {};
  categorias.forEach(function(categoria) {
    const produto = produtoPorId[String(categoria.ProdutoId || '')];
    const nomeProduto = produto ? produto.Nome : 'Geral';
    if (!categoriasPorProduto[nomeProduto]) categoriasPorProduto[nomeProduto] = [];
    categoriasPorProduto[nomeProduto].push(String(categoria.Nome || ''));
  });

  return {
    user: getActor_(),
    dropdownData: {
      produtos: pluck_(produtos, 'Nome'),
      categorias: pluck_(categorias, 'Nome'),
      categoriasPorProduto: categoriasPorProduto,
      status: STATUS_LIST.map(function(item) { return item.Nome; }),
      situacoesPendencia: SITUACOES_PENDENCIA.slice(),
      canais: CANAIS_LIST.slice(),
      responsaveis: pluck_(usuarios, 'Nome'),
      statusCores: getStatusColorMap_()
    }
  };
}

function activeSorted_(sheetName) {
  return getAll(sheetName)
    .filter(function(item) {
      return item.Ativo === '' || item.Ativo === null || item.Ativo === undefined || isTrue_(item.Ativo);
    })
    .sort(function(a, b) {
      return Number(a.Ordem || 9999) - Number(b.Ordem || 9999) ||
        String(a.Nome || '').localeCompare(String(b.Nome || ''), 'pt-BR');
    });
}

// ============================================================================
// ATENDIMENTOS - CONSULTAS
// ============================================================================

function getAtendimentos(filtros, pagina, ordenacao) {
  ensureDatabaseReady();
  const actor = getActor_();
  const records = applyAtendimentoFilters_(restrictToOwnerIfNeeded_(getActiveAtendimentos_(), actor), filtros || {});
  const clientRecords = decorateAtendimentos_(records);
  sortClientRecords_(clientRecords, ordenacao || {});

  return {
    dados: clientRecords,
    total: clientRecords.length,
    totalPaginas: Math.max(1, Math.ceil(clientRecords.length / CONFIG.PAGE_SIZE)),
    pagina: Math.max(1, Number(pagina || 1))
  };
}

function getAtendimento(id) {
  ensureDatabaseReady();
  const record = getById(CONFIG.SHEET_NAMES.ATENDIMENTOS, sanitizeInput(id));
  if (!record || isTrue_(record.Excluido)) return null;
  if (!canAccessAtendimento_(record, getActor_())) return null;

  return {
    atendimento: toClientAtendimento_(record, getStatusColorMap_()),
    timeline: getTimeline(id)
  };
}

/**
 * Verificação rápida de duplicidade do Protocolo Odin (usada pelo formulário
 * enquanto o usuário digita, sem carregar a lista inteira).
 */
function verificarProtocoloDuplicado(protocolo, ignorarId) {
  ensureDatabaseReady();
  const normalized = normalizeText_(protocolo);
  if (!normalized) return { duplicado: false };
  const safeId = sanitizeInput(ignorarId);
  const duplicado = getActiveAtendimentos_().some(function(record) {
    return String(record.Id) !== String(safeId || '') &&
      normalizeText_(record.NumeroRA) === normalized;
  });
  return { duplicado: duplicado };
}

function getActiveAtendimentos_() {
  return getAll(CONFIG.SHEET_NAMES.ATENDIMENTOS).filter(function(record) {
    return !isTrue_(record.Excluido);
  });
}

function applyAtendimentoFilters_(records, filtros) {
  const filters = filtros || {};
  const start = parseInputDate_(filters.dataInicio || filters.periodoInicio, false);
  const end = parseInputDate_(filters.dataFim || filters.periodoFim, true);
  const exactFields = {
    produto: 'Produto',
    categoria: 'Categoria',
    status: 'Status',
    situacao: 'MotivoPendencia',
    canal: 'Canal',
    analista: 'Responsavel',
    responsavel: 'Responsavel'
  };
  const containsFields = {
    numeroRA: 'NumeroRA',
    protocolo: 'NumeroRA',
    cliente: 'Cliente',
    cpf: 'CPF'
  };

  return records.filter(function(record) {
    const opened = asDate_(record.DataAbertura);
    if (start && (!opened || opened < start)) return false;
    if (end && (!opened || opened > end)) return false;

    const exactOk = Object.keys(exactFields).every(function(key) {
      const expected = filters[key];
      return !expected || normalizeText_(record[exactFields[key]]) === normalizeText_(expected);
    });
    if (!exactOk) return false;

    return Object.keys(containsFields).every(function(key) {
      const expected = filters[key];
      return !expected || normalizeText_(record[containsFields[key]]).indexOf(normalizeText_(expected)) !== -1;
    });
  });
}

function sortClientRecords_(records, order) {
  const field = sanitizeInput(order.campo || 'dataAbertura');
  const direction = String(order.direcao || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  records.sort(function(a, b) {
    const av = a[field] === undefined || a[field] === null ? '' : a[field];
    const bv = b[field] === undefined || b[field] === null ? '' : b[field];
    const ad = field.toLowerCase().indexOf('data') !== -1 ? asDate_(av) : null;
    const bd = field.toLowerCase().indexOf('data') !== -1 ? asDate_(bv) : null;
    if (ad && bd) return (ad.getTime() - bd.getTime()) * direction;
    return String(av).localeCompare(String(bv), 'pt-BR', { numeric: true }) * direction;
  });
}

// ============================================================================
// ATENDIMENTOS - ESCRITA E REGRAS
// ============================================================================

function salvarAtendimento(dados) {
  ensureDatabaseReady();
  const input = validateAtendimentoInput_(dados || {});

  const actor = getActor_();
  // Analista não escolhe responsável: o sistema identifica automaticamente
  // quem está criando o atendimento. Apenas o Supervisor pode delegar a
  // outro analista.
  if (!isSupervisorProfile_(actor.perfil) || !input.responsavel) {
    input.responsavel = actor.nome;
  }
  const now = new Date();
  const opening = parseInputDate_(input.dataAbertura, false) || now;
  const finalStatus = isFinalStatus_(input.status);

  const record = {
    Id: generateId('ATD'),
    NumeroRA: input.numeroRA,
    DataAbertura: opening,
    Canal: input.canal,
    Cliente: input.cliente,
    CPF: input.cpf,
    Produto: input.produto,
    Categoria: input.categoria,
    Status: input.status,
    MotivoPendencia: input.motivoPendencia,
    Responsavel: input.responsavel,
    DataResolucao: finalStatus ? now : '',
    TempoResolucaoHoras: finalStatus ? roundHours_(diffInHours(opening, now)) : '',
    Observacoes: input.observacoes,
    CriadoPor: actor.nome,
    DataCriacao: now,
    AtualizadoPor: actor.nome,
    DataAtualizacao: now,
    Excluido: false,
    ExcluidoPor: '',
    DataExclusao: ''
  };

  insertAtendimentoUnique_(record);
  insertTimeline_(record.Id, 'Criação', 'Atendimento criado.', '', input.status, actor.nome, '');
  if (input.responsavel !== actor.nome) {
    insertTimeline_(record.Id, 'Delegação', 'Atendimento delegado pelo supervisor.',
      '', input.responsavel, actor.nome, '');
  }

  return { success: true, id: record.Id };
}

function atualizarAtendimento(id, dados, justificativa) {
  ensureDatabaseReady();
  const safeId = sanitizeInput(id);
  const oldRecord = getById(CONFIG.SHEET_NAMES.ATENDIMENTOS, safeId);
  if (!oldRecord || isTrue_(oldRecord.Excluido)) throw new Error('Atendimento não encontrado.');

  const actor = getActor_();
  if (!canAccessAtendimento_(oldRecord, actor)) {
    throw new Error('Você não tem permissão para editar este atendimento.');
  }

  const input = validateAtendimentoInput_(dados || {});

  // Analista não escolhe responsável: mantém o responsável atual. Apenas o
  // Supervisor pode reatribuir o atendimento a outro analista.
  if (!isSupervisorProfile_(actor.perfil) || !input.responsavel) {
    input.responsavel = oldRecord.Responsavel || actor.nome;
  }
  const now = new Date();
  const opening = parseInputDate_(input.dataAbertura, false) || asDate_(oldRecord.DataAbertura) || now;
  const safeJustification = sanitizeInput(justificativa);
  const statusChanged = normalizeText_(oldRecord.Status) !== normalizeText_(input.status);

  const resolution = resolveResolution_(oldRecord, input.status, opening, now);

  const updates = {
    NumeroRA: input.numeroRA,
    DataAbertura: opening,
    Canal: input.canal,
    Cliente: input.cliente,
    CPF: input.cpf,
    Produto: input.produto,
    Categoria: input.categoria,
    Status: input.status,
    MotivoPendencia: input.motivoPendencia,
    Responsavel: input.responsavel,
    DataResolucao: resolution.date,
    TempoResolucaoHoras: resolution.hours,
    Observacoes: input.observacoes,
    AtualizadoPor: actor.nome,
    DataAtualizacao: now
  };

  const history = buildChangeHistory_(safeId, oldRecord, updates, actor.nome, safeJustification);
  updateAtendimentoUnique_(safeId, updates);

  if (history.length > 0) {
    batchInsert(CONFIG.SHEET_NAMES.HISTORICO, history);
    insertTimeline_(
      safeId,
      'Atualização',
      history.length + ' campo(s) alterado(s). ' + (safeJustification || ''),
      '', '', actor.nome, ''
    );
  }

  if (statusChanged) {
    insertTimeline_(safeId, isFinalStatus_(input.status) ? 'Encerramento' : 'Mudança de status',
      'Status alterado.', oldRecord.Status, statusLabel_(input.status, input.motivoPendencia),
      actor.nome, safeJustification);
  }
  if (String(oldRecord.Responsavel || '') !== String(input.responsavel || '')) {
    insertTimeline_(safeId, 'Alteração de responsável', 'Responsável alterado.',
      oldRecord.Responsavel, input.responsavel, actor.nome, safeJustification);
  }

  return { success: true, id: safeId };
}

/**
 * Alteração rápida de status feita diretamente pelo Dashboard (Analista ou
 * Supervisor). Não exige justificativa e altera apenas Status + Situação.
 */
function alterarStatusAtendimento(id, status, situacao) {
  ensureDatabaseReady();
  const safeId = sanitizeInput(id);
  const record = getById(CONFIG.SHEET_NAMES.ATENDIMENTOS, safeId);
  if (!record || isTrue_(record.Excluido)) throw new Error('Atendimento não encontrado.');

  const actor = getActor_();
  if (!canAccessAtendimento_(record, actor)) {
    throw new Error('Você não tem permissão para alterar este atendimento.');
  }

  const newStatus = sanitizeInput(status);
  const newSituacao = sanitizeInput(situacao);
  assertValidStatus_(newStatus, newSituacao);

  const now = new Date();
  const opening = asDate_(record.DataAbertura) || now;
  const resolution = resolveResolution_(record, newStatus, opening, now);
  const statusChanged = normalizeText_(record.Status) !== normalizeText_(newStatus);
  const situacaoChanged = normalizeText_(record.MotivoPendencia) !== normalizeText_(newSituacao);

  if (!statusChanged && !situacaoChanged) return { success: true, id: safeId };

  updateAtendimentoUnique_(safeId, {
    Status: newStatus,
    MotivoPendencia: isFinalStatus_(newStatus) ? '' : newSituacao,
    DataResolucao: resolution.date,
    TempoResolucaoHoras: resolution.hours,
    AtualizadoPor: actor.nome,
    DataAtualizacao: now
  });

  insertTimeline_(safeId, isFinalStatus_(newStatus) ? 'Encerramento' : 'Mudança de status',
    'Status alterado pelo dashboard.',
    statusLabel_(record.Status, record.MotivoPendencia),
    statusLabel_(newStatus, newSituacao),
    actor.nome, '');

  return { success: true, id: safeId };
}

function excluirAtendimento(id) {
  ensureDatabaseReady();
  const safeId = sanitizeInput(id);
  const record = getById(CONFIG.SHEET_NAMES.ATENDIMENTOS, safeId);
  if (!record || isTrue_(record.Excluido)) return { success: false, message: 'Atendimento não encontrado.' };

  const actor = getActor_();
  if (!canAccessAtendimento_(record, actor)) {
    throw new Error('Você não tem permissão para excluir este atendimento.');
  }
  const now = new Date();
  insertTimeline_(safeId, 'Exclusão', 'Atendimento excluído. A timeline foi preservada.',
    '', '', actor.nome, '');
  insert(CONFIG.SHEET_NAMES.HISTORICO, {
    Id: generateId('HIS'),
    AtendimentoId: safeId,
    Data: now,
    Acao: 'Exclusão',
    Campo: '',
    ValorAnterior: '',
    ValorNovo: '',
    Usuario: actor.nome,
    Justificativa: 'Exclusão solicitada pela interface.'
  });

  // Exclusão lógica mantém rastreabilidade e permite auditoria futura.
  update(CONFIG.SHEET_NAMES.ATENDIMENTOS, safeId, {
    Excluido: true,
    ExcluidoPor: actor.nome,
    DataExclusao: now,
    AtualizadoPor: actor.nome,
    DataAtualizacao: now
  });

  return { success: true };
}

function adicionarObservacao(atendimentoId, texto) {
  ensureDatabaseReady();
  const id = sanitizeInput(atendimentoId);
  const observation = sanitizeInput(texto);
  if (!observation) throw new Error('A observação não pode ficar vazia.');
  const record = getById(CONFIG.SHEET_NAMES.ATENDIMENTOS, id);
  if (!record || isTrue_(record.Excluido)) throw new Error('Atendimento não encontrado.');

  const actor = getActor_();
  if (!canAccessAtendimento_(record, actor)) {
    throw new Error('Você não tem permissão para alterar este atendimento.');
  }
  insertTimeline_(id, 'Observação', observation, '', '', actor.nome, '');
  update(CONFIG.SHEET_NAMES.ATENDIMENTOS, id, {
    AtualizadoPor: actor.nome,
    DataAtualizacao: new Date()
  });
  return { success: true };
}

function validateAtendimentoInput_(dados) {
  const input = {
    numeroRA: sanitizeInput(dados.numeroRA),
    cliente: sanitizeInput(dados.cliente),
    cpf: sanitizeInput(dados.cpf),
    produto: sanitizeInput(dados.produto),
    categoria: sanitizeInput(dados.categoria),
    canal: sanitizeInput(dados.canal),
    responsavel: sanitizeInput(dados.responsavel),
    status: sanitizeInput(dados.status),
    observacoes: sanitizeInput(dados.observacoes),
    dataAbertura: sanitizeInput(dados.dataAbertura),
    motivoPendencia: sanitizeInput(dados.motivoPendencia)
  };

  const required = {
    numeroRA: 'Protocolo Odin',
    cliente: 'Nome do cliente',
    cpf: 'CPF',
    dataAbertura: 'Data',
    produto: 'Produto',
    canal: 'Canal',
    status: 'Status'
  };
  Object.keys(required).forEach(function(key) {
    if (!input[key]) throw new Error(required[key] + ' é obrigatório.');
  });

  if (!validateCPF(input.cpf)) throw new Error('CPF inválido.');
  assertValidStatus_(input.status, input.motivoPendencia);
  if (isFinalStatus_(input.status)) input.motivoPendencia = '';

  input.cpf = formatCPF(input.cpf);
  return input;
}

/**
 * Garante que o status é um dos valores fixos e que a situação da
 * pendência foi informada (e é válida) quando o status é "Pendente".
 */
function assertValidStatus_(status, situacao) {
  const validStatus = STATUS_LIST.some(function(item) {
    return normalizeText_(item.Nome) === normalizeText_(status);
  });
  if (!validStatus) throw new Error('Status inválido. Utilize "Pendente" ou "Concluído".');

  if (isWaitingStatus_(status)) {
    const validSituacao = SITUACOES_PENDENCIA.some(function(item) {
      return normalizeText_(item) === normalizeText_(situacao);
    });
    if (!validSituacao) {
      throw new Error('Informe a situação da pendência quando o status for "Pendente".');
    }
  }
}

/**
 * Calcula DataResolucao/TempoResolucaoHoras conforme a transição de status.
 */
function resolveResolution_(oldRecord, newStatus, opening, now) {
  const wasFinal = isFinalStatus_(oldRecord.Status);
  const isFinal = isFinalStatus_(newStatus);
  if (isFinal && !wasFinal) {
    return { date: now, hours: roundHours_(diffInHours(opening, now)) };
  }
  if (!isFinal && wasFinal) {
    return { date: '', hours: '' };
  }
  return { date: oldRecord.DataResolucao, hours: oldRecord.TempoResolucaoHoras };
}

function statusLabel_(status, situacao) {
  return situacao && isWaitingStatus_(status)
    ? status + ' (' + situacao + ')'
    : String(status || '');
}

/**
 * Escritas atômicas do atendimento: a verificação de Protocolo Odin e a
 * gravação acontecem sob o mesmo lock para impedir duplicidades em
 * requisições paralelas.
 */
function insertAtendimentoUnique_(record) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(CONFIG.LOCK_TIMEOUT_MS);
    const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ATENDIMENTOS);
    assertUniqueNumeroRAInSheet_(sheet, record.NumeroRA, '');
    const row = toRowArray(record, COLUMNS.ATENDIMENTOS);
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
    invalidateCache(CONFIG.SHEET_NAMES.ATENDIMENTOS);
  } finally {
    try { lock.releaseLock(); } catch (e) { /* lock não adquirido */ }
  }
}

function updateAtendimentoUnique_(id, updates) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(CONFIG.LOCK_TIMEOUT_MS);
    const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ATENDIMENTOS);
    if (updates.NumeroRA !== undefined) {
      assertUniqueNumeroRAInSheet_(sheet, updates.NumeroRA, id);
    }
    const rowIndex = findRowById(sheet, id);
    if (rowIndex === -1) throw new Error('Atendimento não encontrado.');
    const currentRow = sheet.getRange(rowIndex, 1, 1, COLUMNS.ATENDIMENTOS.length).getValues()[0];
    const current = toObject(currentRow, COLUMNS.ATENDIMENTOS);
    Object.keys(updates).forEach(function(key) { current[key] = updates[key]; });
    sheet.getRange(rowIndex, 1, 1, COLUMNS.ATENDIMENTOS.length)
      .setValues([toRowArray(current, COLUMNS.ATENDIMENTOS)]);
    invalidateCache(CONFIG.SHEET_NAMES.ATENDIMENTOS);
  } finally {
    try { lock.releaseLock(); } catch (e) { /* lock não adquirido */ }
  }
}

function assertUniqueNumeroRAInSheet_(sheet, numeroRA, ignoredId) {
  if (!sheet || sheet.getLastRow() <= 1) return;
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, COLUMNS.ATENDIMENTOS.length).getValues();
  const idIndex = COLUMNS.ATENDIMENTOS.indexOf('Id');
  const raIndex = COLUMNS.ATENDIMENTOS.indexOf('NumeroRA');
  const deletedIndex = COLUMNS.ATENDIMENTOS.indexOf('Excluido');
  const normalized = normalizeText_(numeroRA);
  const duplicate = data.some(function(row) {
    return String(row[idIndex]) !== String(ignoredId || '') &&
      !isTrue_(row[deletedIndex]) &&
      normalizeText_(row[raIndex]) === normalized;
  });
  if (duplicate) throw new Error('Já existe um atendimento com este Protocolo Odin.');
}

// ============================================================================
// STATUS (regras fixas do fluxo)
// ============================================================================

function isWaitingStatus_(statusName) {
  return normalizeText_(statusName) === 'pendente';
}

function isFinalStatus_(statusName) {
  return normalizeText_(statusName) === 'concluido';
}

function getStatusColorMap_() {
  const map = {};
  STATUS_LIST.forEach(function(item) { map[item.Nome] = item.Cor; });
  return map;
}

// ============================================================================
// TIMELINE E HISTÓRICO
// ============================================================================

function getTimeline(atendimentoId) {
  ensureDatabaseReady();
  const id = sanitizeInput(atendimentoId);
  return getByField(CONFIG.SHEET_NAMES.TIMELINE, 'AtendimentoId', id)
    .sort(function(a, b) {
      return (asDate_(b.Data) || new Date(0)) - (asDate_(a.Data) || new Date(0));
    })
    .map(function(item) {
      return {
        id: String(item.Id || ''),
        atendimentoId: String(item.AtendimentoId || ''),
        dataHora: toIso_(item.Data),
        tipo: String(item.Tipo || ''),
        descricao: String(item.Descricao || ''),
        valorAntigo: String(item.De || ''),
        valorNovo: String(item.Para || ''),
        usuario: String(item.Usuario || ''),
        detalhes: String(item.Detalhes || '')
      };
    });
}

function insertTimeline_(atendimentoId, tipo, descricao, de, para, usuario, detalhes, eventDate) {
  return insert(CONFIG.SHEET_NAMES.TIMELINE, {
    Id: generateId('TL'),
    AtendimentoId: atendimentoId,
    Data: eventDate || new Date(),
    Tipo: sanitizeInput(tipo),
    Descricao: sanitizeInput(descricao),
    De: sanitizeInput(de),
    Para: sanitizeInput(para),
    Usuario: sanitizeInput(usuario),
    Detalhes: detalhes || ''
  });
}

function buildChangeHistory_(atendimentoId, oldRecord, updates, userName, justification) {
  const ignored = ['AtualizadoPor', 'DataAtualizacao', 'DataResolucao', 'TempoResolucaoHoras'];
  const entries = [];
  Object.keys(updates).forEach(function(field) {
    if (ignored.indexOf(field) !== -1) return;
    const oldValue = comparableValue_(oldRecord[field]);
    const newValue = comparableValue_(updates[field]);
    if (oldValue === newValue) return;
    entries.push({
      Id: generateId('HIS'),
      AtendimentoId: atendimentoId,
      Data: new Date(),
      Acao: 'Alteração',
      Campo: field,
      ValorAnterior: oldValue,
      ValorNovo: newValue,
      Usuario: userName,
      Justificativa: justification
    });
  });
  return entries;
}

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Retorna, em UMA única chamada, tudo o que o Dashboard precisa:
 * cartões de resumo + lista de atendimentos do usuário (Analista vê só os
 * seus; Supervisor vê todos). Evita múltiplas idas ao servidor e telas de
 * carregamento em sequência.
 */
function getDashboardData() {
  ensureDatabaseReady();
  const actor = getActor_();
  const raw = restrictToOwnerIfNeeded_(getActiveAtendimentos_(), actor);
  const records = decorateAtendimentos_(raw);
  sortClientRecords_(records, { campo: 'dataAbertura', direcao: 'desc' });

  const cards = {
    totalAtendimentos: records.length,
    pendentes: 0,
    concluidos: 0
  };
  const porSituacao = {};
  SITUACOES_PENDENCIA.forEach(function(situacao) { porSituacao[situacao] = 0; });

  records.forEach(function(record) {
    if (isFinalStatus_(record.status)) {
      cards.concluidos++;
    } else {
      cards.pendentes++;
      if (porSituacao[record.situacaoPendencia] !== undefined) {
        porSituacao[record.situacaoPendencia]++;
      }
    }
  });

  return {
    cards: cards,
    porSituacao: porSituacao,
    atendimentos: records,
    user: actor
  };
}

// ============================================================================
// RELATÓRIOS
// ============================================================================

function getRelatorio(filtros) {
  ensureDatabaseReady();
  const actor = getActor_();
  return decorateAtendimentos_(
    applyAtendimentoFilters_(restrictToOwnerIfNeeded_(getActiveAtendimentos_(), actor), filtros || {})
  );
}

// ============================================================================
// CONFIGURAÇÕES ADMINISTRÁVEIS (Produtos, Categorias, Usuários)
// ============================================================================

function getConfiguracoes() {
  ensureDatabaseReady();
  requireSupervisor_();
  const entities = getConfigurationEntities_();
  const result = {};
  Object.keys(entities).forEach(function(key) {
    result[key] = getAll(entities[key].sheet).map(serializeRecord_);
  });
  return { entities: result, user: getActor_() };
}

function salvarConfiguracao(entidade, dados, id) {
  ensureDatabaseReady();
  requireSupervisor_();
  const entities = getConfigurationEntities_();
  const meta = entities[sanitizeInput(entidade)];
  if (!meta) throw new Error('Tipo de configuração inválido.');

  const input = dados || {};
  const record = {};
  meta.columns.forEach(function(column) {
    if (column === 'Id') return;
    if (input[column] === undefined) return;
    if (column === 'Ativo') record[column] = isTrue_(input[column]);
    else if (column === 'Ordem') {
      record[column] = input[column] === '' ? '' : Number(input[column]);
    } else {
      record[column] = sanitizeInput(input[column]);
    }
  });

  if (!record.Nome) throw new Error('Nome é obrigatório.');
  if (meta.key === 'usuarios' && record.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.Email)) {
    throw new Error('E-mail inválido.');
  }
  if (meta.key === 'usuarios' && ['Analista', 'Supervisor'].indexOf(record.Perfil) === -1) {
    throw new Error('Perfil de usuário inválido.');
  }
  if (meta.key === 'categorias' && record.ProdutoId &&
      !getById(CONFIG.SHEET_NAMES.PRODUTOS, record.ProdutoId)) {
    throw new Error('Produto informado para a categoria não existe.');
  }

  let recordId = sanitizeInput(id);
  const exists = recordId ? getById(meta.sheet, recordId) : null;
  if (meta.key === 'usuarios' && exists && isTrue_(exists.Ativo) &&
      normalizeText_(exists.Perfil) === 'supervisor' &&
      (!isTrue_(record.Ativo) || normalizeText_(record.Perfil) !== 'supervisor')) {
    assertAnotherSupervisor_(recordId);
  }
  if (exists) {
    update(meta.sheet, recordId, record);
  } else {
    record.Id = recordId || generateId(meta.prefix);
    recordId = record.Id;
    if (meta.key === 'usuarios') {
      record.DataCadastro = record.DataCadastro || new Date();
    }
    insert(meta.sheet, record);
  }

  auditConfiguration_(exists ? 'Alteração' : 'Criação', meta.label, recordId, record);
  invalidateAllCache();
  SERVICE_CONTEXT_ = {};
  return { success: true, id: recordId };
}

function excluirConfiguracao(entidade, id) {
  ensureDatabaseReady();
  requireSupervisor_();
  const entities = getConfigurationEntities_();
  const meta = entities[sanitizeInput(entidade)];
  if (!meta) throw new Error('Tipo de configuração inválido.');
  const safeId = sanitizeInput(id);
  const existing = getById(meta.sheet, safeId);
  if (!existing) throw new Error('Registro não encontrado.');
  if (meta.key === 'usuarios' && isTrue_(existing.Ativo) && normalizeText_(existing.Perfil) === 'supervisor') {
    assertAnotherSupervisor_(safeId);
  }

  // Desativação lógica preserva o histórico dos atendimentos já vinculados.
  update(meta.sheet, safeId, { Ativo: false });
  auditConfiguration_('Desativação', meta.label, safeId, existing);
  invalidateAllCache();
  SERVICE_CONTEXT_ = {};
  return { success: true };
}

function getConfigurationEntities_() {
  return {
    produtos: {
      key: 'produtos', label: 'Produtos', sheet: CONFIG.SHEET_NAMES.PRODUTOS,
      columns: COLUMNS.PRODUTOS, prefix: 'PD'
    },
    categorias: {
      key: 'categorias', label: 'Categorias', sheet: CONFIG.SHEET_NAMES.CATEGORIAS,
      columns: COLUMNS.CATEGORIAS, prefix: 'CT'
    },
    usuarios: {
      key: 'usuarios', label: 'Usuários e responsáveis', sheet: CONFIG.SHEET_NAMES.USUARIOS,
      columns: COLUMNS.USUARIOS, prefix: 'USR'
    }
  };
}

function auditConfiguration_(action, label, id, value) {
  insert(CONFIG.SHEET_NAMES.HISTORICO, {
    Id: generateId('HIS'),
    AtendimentoId: '',
    Data: new Date(),
    Acao: action + ' de configuração',
    Campo: label,
    ValorAnterior: '',
    ValorNovo: id + ': ' + JSON.stringify(value || {}),
    Usuario: getActor_().nome,
    Justificativa: 'Alteração realizada pela tela de Configurações.'
  });
}

function assertAnotherSupervisor_(ignoredId) {
  const activeSupervisors = getAll(CONFIG.SHEET_NAMES.USUARIOS).filter(function(user) {
    return String(user.Id) !== String(ignoredId) &&
      isTrue_(user.Ativo) &&
      normalizeText_(user.Perfil) === 'supervisor';
  });
  if (!activeSupervisors.length) {
    throw new Error('Cadastre outro supervisor ativo antes de remover este acesso.');
  }
}

// ============================================================================
// CONVERSÃO E SEGURANÇA
// ============================================================================

function decorateAtendimentos_(records) {
  const colorMap = getStatusColorMap_();
  return records.map(function(record) {
    return toClientAtendimento_(record, colorMap);
  });
}

function toClientAtendimento_(record, colorMap) {
  return {
    id: String(record.Id || ''),
    numeroRA: String(record.NumeroRA || ''),
    protocoloOdin: String(record.NumeroRA || ''),
    dataAbertura: toIso_(record.DataAbertura),
    dataConclusao: toIso_(record.DataResolucao),
    canal: String(record.Canal || ''),
    cliente: String(record.Cliente || ''),
    cpf: String(record.CPF || ''),
    produto: String(record.Produto || ''),
    categoria: String(record.Categoria || ''),
    status: String(record.Status || ''),
    statusCor: colorMap[String(record.Status || '')] || '',
    situacaoPendencia: String(record.MotivoPendencia || ''),
    motivoPendencia: String(record.MotivoPendencia || ''),
    responsavel: String(record.Responsavel || ''),
    tempoResolucao: record.TempoResolucaoHoras === '' ? '' : Number(record.TempoResolucaoHoras || 0),
    observacoes: String(record.Observacoes || ''),
    criadoPor: String(record.CriadoPor || ''),
    dataCriacao: toIso_(record.DataCriacao),
    atualizadoPor: String(record.AtualizadoPor || ''),
    dataAtualizacao: toIso_(record.DataAtualizacao)
  };
}

function getActor_() {
  if (SERVICE_CONTEXT_.actor) return SERVICE_CONTEXT_.actor;
  let email = '';
  try {
    email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || '';
  } catch (e) {
    email = '';
  }
  const users = getAll(CONFIG.SHEET_NAMES.USUARIOS);
  let user = users.find(function(item) {
    return normalizeText_(item.Email) === normalizeText_(email) && isTrue_(item.Ativo);
  });
  if (!user && !email) {
    user = users.find(function(item) { return isTrue_(item.Ativo); });
  }
  SERVICE_CONTEXT_.actor = {
    id: user ? String(user.Id || '') : '',
    email: email,
    nome: user ? String(user.Nome || '') : (email ? email.split('@')[0] : 'Usuário'),
    perfil: user ? String(user.Perfil || 'Analista') : 'Analista',
    equipe: user ? String(user.Equipe || '') : ''
  };
  return SERVICE_CONTEXT_.actor;
}

function requireSupervisor_() {
  const actor = getActor_();
  if (!isSupervisorProfile_(actor.perfil)) {
    throw new Error('Apenas supervisores podem alterar as configurações.');
  }
}

/**
 * Verifica se um perfil corresponde a um nível de supervisão/gestão.
 * Usado para controlar quem vê/edita todos os atendimentos (Supervisor) e
 * quem vê/edita apenas os próprios (Analista).
 */
function isSupervisorProfile_(perfil) {
  return ['supervisor', 'gestor', 'administrador', 'admin'].indexOf(normalizeText_(perfil)) !== -1;
}

/**
 * Regra de permissão central: Supervisor acessa qualquer atendimento;
 * Analista só acessa os atendimentos dos quais é responsável ou criador.
 * Aplicada no backend (não apenas na interface) em todas as consultas e
 * gravações de atendimentos.
 */
function canAccessAtendimento_(record, actor) {
  if (isSupervisorProfile_(actor.perfil)) return true;
  const name = normalizeText_(actor.nome);
  if (!name) return false;
  return normalizeText_(record.Responsavel) === name || normalizeText_(record.CriadoPor) === name;
}

/**
 * Filtra uma lista de atendimentos para o perfil Analista (apenas os seus).
 * Supervisor recebe a lista completa, sem alteração.
 */
function restrictToOwnerIfNeeded_(records, actor) {
  if (isSupervisorProfile_(actor.perfil)) return records;
  return records.filter(function(record) {
    return canAccessAtendimento_(record, actor);
  });
}

// ============================================================================
// AUXILIARES DE DATA E VALORES
// ============================================================================

function parseInputDate_(value, endOfDay) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getTime());
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    );
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

function asDate_(value) {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function toIso_(value) {
  const date = asDate_(value);
  return date ? date.toISOString() : '';
}

function roundHours_(hours) {
  return Math.round(Number(hours || 0) * 100) / 100;
}

function comparableValue_(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return '';
  return String(value);
}

function serializeRecord_(record) {
  const result = {};
  Object.keys(record || {}).forEach(function(key) {
    result[key] = record[key] instanceof Date ? record[key].toISOString() : record[key];
  });
  return result;
}

function normalizeText_(value) {
  let text = String(value === null || value === undefined ? '' : value).trim().toLowerCase();
  try {
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // normalize pode não existir em runtimes legados.
  }
  return text;
}

function isTrue_(value) {
  return value === true || value === 1 ||
    ['true', 'sim', '1', 'ativo'].indexOf(normalizeText_(value)) !== -1;
}

function indexBy_(items, field) {
  const index = {};
  items.forEach(function(item) { index[String(item[field] || '')] = item; });
  return index;
}

function pluck_(items, field) {
  return items.map(function(item) { return String(item[field] || ''); }).filter(function(value) { return value; });
}

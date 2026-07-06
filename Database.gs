/**
 * PORTO RA - Acesso banco de dados
 */
function getSpreadsheetId() {
  return PropertiesService.getUserProperties().getProperty('SPREADSHEET_ID');
}

function getSpreadsheet() {
  const id = getSpreadsheetId();
  return id ? SpreadsheetApp.openById(id) : null;
}

function getSheet(name) {
  const ss = getSpreadsheet();
  return ss ? ss.getSheetByName(name) : null;
}

function clearCache() {
  CacheService.getUserCache().removeAll(['ATENDIMENTOS', 'USUARIOS', 'STATUS']);
}

function existeProtocolo(protocolo) {
  const sheet = getSheet('Atendimentos');
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === protocolo) return true;
  }
  return false;
}

function validarCPF(cpf) {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(limpo)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(limpo[i]) * (10 - i);
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  if (parseInt(limpo[9]) !== dv1) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(limpo[i]) * (11 - i);
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  return parseInt(limpo[10]) === dv2;
}

function criarAtendimento(data) {
  if (!data.protocolo || !data.nome || !data.cpf) {
    return { sucesso: false, mensagem: 'Campos obrigatórios ausentes' };
  }
  
  if (existeProtocolo(data.protocolo)) {
    return { sucesso: false, mensagem: 'Protocolo já existe' };
  }
  
  if (!validarCPF(data.cpf)) {
    return { sucesso: false, mensagem: 'CPF inválido' };
  }
  
  const id = 'ATD_' + Date.now();
  const sheet = getSheet('Atendimentos');
  const agora = new Date();
  
  sheet.appendRow([
    id,
    data.data || agora,
    data.protocolo,
    data.nome,
    formatarCPF(data.cpf),
    data.status,
    data.observacoes || '',
    data.analista,
    agora,
    agora
  ]);
  
  adicionarHistórico({
    idAtendimento: id,
    protocolo: data.protocolo,
    usuario: data.analista,
    acao: 'Criação',
    statusAnterior: '',
    novoStatus: data.status
  });
  
  clearCache();
  return { sucesso: true, id: id, mensagem: 'Atendimento criado!' };
}

function formatarCPF(cpf) {
  const limpo = cpf.replace(/\D/g, '');
  return limpo.substring(0, 3) + '.' + limpo.substring(3, 6) + '.' + limpo.substring(6, 9) + '-' + limpo.substring(9);
}

function adicionarHistórico(data) {
  const sheet = getSheet('Histórico');
  const agora = new Date();
  sheet.appendRow([
    data.idAtendimento,
    data.protocolo,
    data.usuario,
    agora,
    agora.toTimeString().split(' ')[0],
    data.acao,
    data.statusAnterior,
    data.novoStatus,
    data.observacao || ''
  ]);
}

function obterAtendimentos(usuarioEmail) {
  const sheet = getSheet('Atendimentos');
  if (!sheet) return [];
  
  const user = getUserProfile(usuarioEmail);
  const data = sheet.getDataRange().getValues();
  const atendimentos = [];
  
  for (let i = 1; i < data.length; i++) {
    const atend = {
      ID: data[i][0],
      Data: data[i][1],
      Protocolo: data[i][2],
      Nome: data[i][3],
      CPF: data[i][4],
      Status: data[i][5],
      Observações: data[i][6],
      Analista: data[i][7]
    };
    
    if (user.Perfil === 'Analista' && atend.Analista !== user.Nome) continue;
    atendimentos.push(atend);
  }
  
  return atendimentos;
}

function getUserProfile(email) {
  const sheet = getSheet('Usuários');
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      return {
        Nome: data[i][0],
        Email: data[i][1],
        Perfil: data[i][2],
        Ativo: data[i][3]
      };
    }
  }
  return null;
}

function getUsers() {
  const sheet = getSheet('Usuários');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const users = [];
  for (let i = 1; i < data.length; i++) {
    users.push({
      Nome: data[i][0],
      Email: data[i][1],
      Perfil: data[i][2]
    });
  }
  return users;
}

function addUser(nome, email, perfil) {
  if (getUserProfile(email)) return false;
  const sheet = getSheet('Usuários');
  sheet.appendRow([nome, email, perfil, 'Sim']);
  clearCache();
  return true;
}

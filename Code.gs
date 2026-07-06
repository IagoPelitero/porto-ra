/**
 * PORTO RA - Ponto de entrada
 */
function doGet(e) {
  try {
    initializeDatabase();
    const user = getCurrentUser();
    if (!user) return HtmlService.createHtmlOutput('<h2>Erro Autenticação</h2>');
    
    if (!getUserProfile(user.email)) {
      const existingUsers = getUsers();
      const profileType = existingUsers.length === 0 ? 'Supervisor' : 'Analista';
      addUser(user.name || user.email, user.email, profileType);
    }

    const template = HtmlService.createTemplateFromFile('Index');
    const html = template.evaluate();
    html.setTitle('PORTO RA - Gestão de Atendimentos');
    html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return html;
  } catch (e) {
    return HtmlService.createHtmlOutput('<h2>Erro</h2><p>' + e + '</p>');
  }
}

function getCurrentUser() {
  const email = Session.getEffectiveUser().getEmail();
  return email ? { email: email, name: email.split('@')[0] } : null;
}

function initializeDatabase() {
  if (!getSpreadsheetId()) setup();
}

function setup() {
  const ss = SpreadsheetApp.create('PORTO RA - Banco de Dados');
  PropertiesService.getUserProperties().setProperty('SPREADSHEET_ID', ss.getId());
  ss.deleteSheet(ss.getSheets()[0]);
  
  createSheet(ss, 'Atendimentos', getAtendimentosHeaders());
  createSheet(ss, 'Histórico', getHistóricoHeaders());
  createSheet(ss, 'Usuários', getUsuáriosHeaders());
  createSheet(ss, 'Configurações', getConfiguraçõesHeaders());
}

function createSheet(ss, name, headers) {
  const sheet = ss.insertSheet(name);
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setBackground('#2F5233').setFontColor('#FFF').setFontWeight('bold');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

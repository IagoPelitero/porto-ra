/**
 * PORTO RA - Configurações
 */
function getAtendimentosHeaders() {
  return ['ID', 'Data', 'Protocolo', 'Nome', 'CPF', 'Status', 'Observações', 'Analista', 'DataCriação', 'ÚltimaAtualização'];
}

function getHistóricoHeaders() {
  return ['IDAtendimento', 'Protocolo', 'Usuário', 'Data', 'Hora', 'AçãoRealizada', 'StatusAnterior', 'NovoStatus', 'Observação'];
}

function getUsuáriosHeaders() {
  return ['Nome', 'Email', 'Perfil', 'Ativo'];
}

function getConfiguraçõesHeaders() {
  return ['Chave', 'Valor'];
}

const CACHE_TTL = 3600;
const LOCK_TIMEOUT = 30000;

function getStatusOptions() {
  return ['Pendente', 'Em análise', 'Aguardando cliente', 'Aguardando área', 'Finalizado'];
}

function getPerfilOptions() {
  return ['Analista', 'Supervisor'];
}

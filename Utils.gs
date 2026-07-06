/**
 * PORTO RA - Utilitários
 */
function gerarUnicoID() {
  return 'ATD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function formatarData(data) {
  if (!data) return '';
  const d = data instanceof Date ? data : new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return dia + '/' + mes + '/' + ano;
}

function formatarDataHora(data) {
  if (!data) return '';
  const d = data instanceof Date ? data : new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return dia + '/' + mes + '/' + ano + ' ' + hora + ':' + min;
}

function formatarHora(data) {
  if (!data) return '';
  const d = data instanceof Date ? data : new Date(data);
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const seg = String(d.getSeconds()).padStart(2, '0');
  return hora + ':' + min + ':' + seg;
}

function parseData(dataStr) {
  if (!dataStr) return new Date();
  const partes = dataStr.split('/');
  if (partes.length !== 3) return new Date();
  const dia = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1;
  const ano = parseInt(partes[2]);
  return new Date(ano, mes, dia);
}

function obterDataHoje() {
  return formatarData(new Date());
}

function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function maiusculas(str) {
  return String(str).toUpperCase();
}

function minusculas(str) {
  return String(str).toLowerCase();
}

function limpar(str) {
  return String(str).trim();
}

function estaVazio(str) {
  return !str || String(str).trim() === '';
}

function truncar(str, max) {
  const s = String(str);
  return s.length <= max ? s : s.substring(0, max - 3) + '...';
}

function removerDuplicatas(arr) {
  return [...new Set(arr)];
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function eNumero(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function eInteiro(value) {
  return Number.isInteger(Number(value));
}

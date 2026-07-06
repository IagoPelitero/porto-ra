/**
 * PORTO RA - Serviços
 */
function apiCriarAtendimento(formData) {
  const user = getCurrentUser();
  if (!user) return { sucesso: false, mensagem: 'Usuário não autenticado' };
  
  const userProfile = getUserProfile(user.email);
  if (!userProfile) return { sucesso: false, mensagem: 'Usuário inativo' };
  
  const dados = {
    protocolo: String(formData.protocolo).trim().toUpperCase(),
    nome: String(formData.nome).trim(),
    cpf: String(formData.cpf).trim(),
    status: formData.status || 'Pendente',
    observacoes: String(formData.observacoes || '').trim(),
    data: formData.data ? new Date(formData.data) : new Date(),
    analista: userProfile.Nome
  };
  
  return criarAtendimento(dados);
}

function apiObterMeusAtendimentos() {
  const user = getCurrentUser();
  return user ? obterAtendimentos(user.email) : [];
}

function apiObterIndicadores() {
  const user = getCurrentUser();
  if (!user) return null;
  
  const atendimentos = obterAtendimentos(user.email);
  return {
    total: atendimentos.length,
    pendentes: atendimentos.filter(a => a.Status === 'Pendente').length,
    emAnalise: atendimentos.filter(a => a.Status === 'Em análise').length,
    aguardandoCliente: atendimentos.filter(a => a.Status === 'Aguardando cliente').length,
    aguardandoArea: atendimentos.filter(a => a.Status === 'Aguardando área').length,
    finalizados: atendimentos.filter(a => a.Status === 'Finalizado').length
  };
}

function apiObterMeuPerfil() {
  const user = getCurrentUser();
  if (!user) return null;
  const profile = getUserProfile(user.email);
  return {
    nome: profile.Nome,
    email: profile.Email,
    perfil: profile.Perfil
  };
}

function apiObterStatusOptions() {
  return getStatusOptions();
}

function apiValidarProtocolo(protocolo) {
  if (!protocolo || protocolo.length < 6) {
    return { disponivel: false, mensagem: 'Mínimo 6 caracteres' };
  }
  if (existeProtocolo(protocolo)) {
    return { disponivel: false, mensagem: 'Protocolo já existe' };
  }
  return { disponivel: true, mensagem: 'OK' };
}

function apiValidarCPF(cpf) {
  if (!cpf) return { valido: false, mensagem: 'CPF obrigatório' };
  if (!validarCPF(cpf)) return { valido: false, mensagem: 'CPF inválido' };
  return { valido: true, mensagem: 'OK' };
}

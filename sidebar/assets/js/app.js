// inicializa o Zendesk App Framework
const client = ZAFClient.init();

// ===============================
//    PRE-CHAT (MESSAGING ONLY)
// ===============================

Promise.all([
  client.get("ticket.comments"),
  client.get("ticket.requester")
])
.then(function ([commentsData, requesterData]) {

  const comments = commentsData["ticket.comments"];
  const userName = requesterData["ticket.requester"].name;

  // Localiza o comentário de sistema do pré-chat
  const blocoPreChat = comments
    .filter((c) => c.value && c.value.includes("Chat started"))
    .pop();

  const container = document.getElementById("prechat");

  if (!blocoPreChat) {
    container.innerText = "Pré-chat não encontrado";
    resizeApp();
    return;
  }

  // ===============================
  //        LIMPEZA DO TEXTO 
  // ===============================
  const textoLimpo = blocoPreChat.value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const conteudoFinal = textoLimpo.filter(
    (l) =>
      !l.startsWith("Chat started") &&
      !l.startsWith("URL:") &&
      !l.startsWith("Chat ID:") &&
      !/^\(\d{1,2}:\d{2}:\d{2}/.test(l)
  );

  // ===============================
  // 🔴 EXTRAÇÃO POR PALAVRA-CHAVE
  // ===============================
  let userCPF = null;
  let userEmail = null;
  let userTel = null;
  let solicitacaoID = null;
  let localRecarga = null;
  let userBU = null;

  conteudoFinal.forEach(linha => {
    const partes = linha.split(':');
    if (partes.length < 2) return;

    const label = partes[0].toLowerCase();
    const valor = partes.slice(1).join(':').trim();

    if (label.includes('cpf')) userCPF = valor;
    if (label.includes('email')) userEmail = valor;
    if (label.includes('telefone')) userTel = valor;
    if (label.includes('solicitação')) solicitacaoID = valor;
    if (label.includes('local')) localRecarga = valor;
    if (label.includes('bilhete')) userBU = valor;
  });

  // Exibe apenas o conteúdo útil (formato final)
  container.innerText = `
    Nome do usuário: ${userName || '-'}
    CPF: ${userCPF || '-'}
    Email: ${userEmail || '-'}
    Telefone: ${userTel || '-'}
    Bilhete Único: ${userBU || '-'}

    Solicitação: ${solicitacaoID || '-'}
    Local da Recarga: ${localRecarga || '-'}
  `.trim();

  // Ajusta altura do iframe após renderização
  resizeApp();

  console.log('Bilhete único: ' + userBU);

})
.catch(function (error) {
  console.error("Erro ao buscar dados do ticket:", error);
});

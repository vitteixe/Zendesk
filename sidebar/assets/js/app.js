// inicializa o Zendesk App Framework
const client = ZAFClient.init();

// ===============================
// PRE-CHAT (GAMBIARRA CONTROLADA)
// ===============================

client.get('ticket.comments')
  .then(function (data) {
    const comments = data['ticket.comments'];

    // pega o bloco do pré-chat
    const blocoPreChat = comments
      .filter(c => c.value && c.value.includes('Chat started'))
      .pop();

    const container = document.getElementById('prechat');

    if (!blocoPreChat) {
      container.innerText = 'Pré-chat não encontrado';
      resizeApp(); // função vem do resize.js
      return;
    }

    // exibe o bloco inteiro
    container.innerHTML = blocoPreChat.value;

    // sempre que renderizar algo novo
    resizeApp();
  })
  .catch(function (error) {
    console.error('Erro ao buscar comentários:', error);
  });

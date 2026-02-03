// inicializa o Zendesk App Framework
const client = ZAFClient.init();

// ===============================
//   LOCALIZA BLOCO DE PRÉ-CHAT
//   (Zendesk Messaging)
// ===============================
function localizarBlocoPreChat(comments) {
    return comments
        .filter((c) => {
            if (!c.value) return false;

            return (
                c.value.includes("Chat started") ||
                c.value.includes("A form was sent")
            );
        })
        .pop();
}

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

    // Localiza o comentário de sistema do pré-chat (Messaging)
    const blocoPreChat = localizarBlocoPreChat(comments);

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
            !l.startsWith("A form was sent") &&
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

    conteudoFinal.forEach(function (linha) {
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

    // ===============================
    //     Consulta Bilhete Único
    // ===============================
    const inputBU = document.getElementById('input-bu');

    if (inputBU && userBU) {
        inputBU.value = userBU;
    }

    // ===============================
    //   DISPARA API AUTOMATICAMENTE
    // ===============================
    if (
        userBU &&
        window.RechargeAPI &&
        typeof RechargeAPI.getRecharges === 'function'
    ) {
        RechargeAPI.getRecharges(userBU);
    }

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

})
.catch(function (error) {
    console.error("Erro ao buscar dados do ticket:", error);
});

// ===============================
//   RENDERIZA TABELA DE RECARGAS
// ===============================
function renderRechargeTable(data) {

    if (!Array.isArray(data)) {
        console.error("Dados de recarga inválidos:", data);
        return;
    }

    const tbody = document.getElementById("rechargeTableBody");

    if (!tbody) {
        console.error("Elemento rechargeTableBody não encontrado");
        return;
    }

    tbody.innerHTML = "";

    data.forEach(function (item) {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.created_at || "-"}</td>
            <td>${item.pdv || "-"}</td>
            <td>${item.serial || "-"}</td>
            <td>${item.recharge_acronym || "-"}</td>
            <td>${item.recharge_value || "-"}</td>
            <td>${item.payment_type || "-"}</td>
            <td>${item.payment_status || "-"}</td>
            <td>${item.status || "-"}</td>
        `;

        tbody.appendChild(tr);
    });

    resizeApp();
}

// ===============================
//   CALLBACK DA API DE RECARGAS
// ===============================
window.onRechargeDataLoaded = function (data) {
    console.log("Recargas recebidas no app.js:", data);
    renderRechargeTable(data);
};

// ===============================
//   CONSULTA MANUAL DE RECARGAS
// ===============================
(function () {

    const inputBU = document.getElementById('input-bu');
    const btnSearch = document.getElementById('btn-search');

    if (!inputBU || !btnSearch) return;

    btnSearch.addEventListener('click', function () {

        const bilhete = inputBU.value.trim();

        if (!bilhete) {
            console.warn("Bilhete Único vazio");
            return;
        }

        // limpa tabela antes da nova busca
        const tbody = document.getElementById("rechargeTableBody");
        if (tbody) {
            tbody.innerHTML = "";
        }

        if (
            window.RechargeAPI &&
            typeof RechargeAPI.getRecharges === 'function'
        ) {
            RechargeAPI.getRecharges(bilhete);
        }
    });

})();

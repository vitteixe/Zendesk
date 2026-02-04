// inicializa o Zendesk App Framework
const client = ZAFClient.init();

/**
 * ===============================
 * PRE-CHAT (Zendesk Messaging)
 * ===============================
 */
Promise.all([
    client.get("ticket.comments"),
    client.get("ticket.requester")
])
.then(function ([commentsData, requesterData]) {

    const comments = commentsData["ticket.comments"];
    const userName = requesterData["ticket.requester"].name;

    const container = document.getElementById("prechat");

    const blocoPreChat = localizarBlocoPreChat(comments);

    if (!blocoPreChat) {
        container.innerText = "Pré-chat não encontrado";
        resizeApp();
        return;
    }

    const textoLimpo = limparTextoPreChat(blocoPreChat.value);

    const conteudoFinal = textoLimpo.filter(function (linha) {
        return (
            !linha.startsWith("Chat started") &&
            !linha.startsWith("A form was sent") &&
            !linha.startsWith("URL:") &&
            !linha.startsWith("Chat ID:")
        );
    });

    const dados = extrairDadosPreChat(conteudoFinal);

    /**
     * ===============================
     * PREENCHE UI
     * ===============================
     */
    container.innerText = `
        Nome do usuário: ${userName || "-"}
        CPF: ${dados.cpf || "-"}
        Email: ${dados.email || "-"}
        Telefone: ${dados.telefone || "-"}
        Bilhete Único: ${dados.bilhete || "-"}

        Solicitação: ${dados.solicitacao || "-"}
        Local da Recarga: ${dados.local || "-"}
    `.trim();

    /**
     * ===============================
     * PREENCHE INPUT + DISPARA API
     * ===============================
     */
    const inputBU = document.getElementById("input-bu");

    if (inputBU && dados.bilhete) {
        inputBU.value = dados.bilhete;
        RechargeAPI.getRecharges(dados.bilhete);
    }

    resizeApp();

})
.catch(function (error) {
    console.error("Erro ao buscar dados do ticket:", error);
});

/**
 * ===============================
 * RENDERIZA TABELA DE RECARGAS
 * ===============================
 */
function renderRechargeTable(data) {

    const tbody = document.getElementById("rechargeTableBody");
    if (!tbody) return;

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

/**
 * ===============================
 * CALLBACK DA API
 * ===============================
 */
window.onRechargeDataLoaded = function (data) {
    console.log("Recargas recebidas:", data);
    renderRechargeTable(data);
};

/**
 * ===============================
 * CONSULTA MANUAL
 * ===============================
 */
(function () {

    const inputBU = document.getElementById("input-bu");
    const btnSearch = document.getElementById("btn-search");

    if (!inputBU || !btnSearch) return;

    btnSearch.addEventListener("click", function () {

        const bilhete = inputBU.value.trim();
        if (!bilhete) return;

        RechargeAPI.getRecharges(bilhete);
    });

})();

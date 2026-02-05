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
    
    container.innerHTML = `
        <div class="prechat-solicitacao-wrapper">
            <div class="prechat-solicitacao">
                ${dados.solicitacao || "-"}
            </div>
        </div>

        <div class="prechat-card-wrapper">

            <span class="prechat-title">INFORMAÇÕES</span>

            <div class="prechat-card">
                <div class="prechat-grid">

                    <div class="prechat-col">
                        <div>
                            <span class="label">Nome</span>
                            <span class="value">${userName || "-"}</span>
                        </div>

                        <div>
                            <span class="label">CPF</span>
                            <span class="value">${dados.cpf || "-"}</span>
                        </div>

                        <div>
                            <span class="label">Email</span>
                            <span class="value">${dados.email || "-"}</span>
                        </div>

                        <div>
                            <span class="label">Telefone</span>
                            <span class="value">${dados.telefone || "-"}</span>
                        </div>
                    </div>

                    <div class="prechat-col">
                        <div>
                            <span class="label">Bilhete Único</span>
                            <span class="value highlight">${dados.bilhete || "-"}</span>
                        </div>

                        <div>
                            <span class="label">Local da Recarga</span>
                            <span class="value">${dados.local || "-"}</span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    `;





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
 * RENDERIZAÇÃO DA API
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

            <td class="pdv-cell" title="${item.pdv || "-"}">
                ${item.pdv || "-"}
            </td>

            <td>${item.serial || "-"}</td>
            <td>${item.recharge_acronym || "-"}</td>
            <td>${item.recharge_value || "-"}</td>
            <td>${item.payment_type || "-"}</td>

            <!-- PAYMENT STATUS -->
            <td>
                <span
                    class="payment-status status-${(item.payment_status || "").toLowerCase()}"
                    title="${item.payment_status || "-"}">
                </span>
            </td>

            <!-- RECHARGE STATUS -->
            <td>
                <span
                    class="recharge-status status-${(item.status || "").toLowerCase()}"
                    title="${item.status || "-"}">
                </span>
            </td>
        `;

        tbody.appendChild(tr);
    });

    resizeApp();
}

/**
 * ===============================
 * CALLBACK API
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

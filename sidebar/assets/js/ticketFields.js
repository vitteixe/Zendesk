(function () {

    /**
     * ===============================
     * BUSCA CAMPOS DO TICKET
     * ===============================
     */

    function getTicketFields() {

        return client.get([
            "ticket.requester.name",
            "ticket.requester.email",
            "ticket.customField:custom_field_42948744993044", // CPF
            "ticket.customField:custom_field_40365794898836", // Telefone
            "ticket.customField:custom_field_38219546173588", // Bilhete Único
            "ticket.customField:custom_field_44360785170964"  // Local da Recarga
        ]);
    }

    /**
     * ===============================
     * RENDERIZA NOVO CARD
     * ===============================
     */

    function renderTicketFields(data) {

        const container = document.getElementById("ticket-fields");

        if (!container) return;

        const nome = data["ticket.requester.name"] || "-";
        const email = data["ticket.requester.email"] || "-";
        const cpf = data["ticket.customField:custom_field_42948744993044"] || "-";
        const telefone = data["ticket.customField:custom_field_40365794898836"] || "-";
        const bilhete = data["ticket.customField:custom_field_38219546173588"] || "-";
        const local = data["ticket.customField:custom_field_44360785170964"] || "-";

        container.innerHTML = `
            <div class="prechat-card-wrapper">

                <span class="prechat-title">INFORMAÇÕES (FIELDS)</span>

                <div class="prechat-card">
                    <div class="prechat-grid">

                        <div class="prechat-col">
                            <div>
                                <span class="label">Nome</span>
                                <span class="value">${nome}</span>
                            </div>

                            <div>
                                <span class="label">CPF</span>
                                <span class="value">${cpf}</span>
                            </div>

                            <div>
                                <span class="label">Email</span>
                                <span class="value">${email}</span>
                            </div>

                            <div>
                                <span class="label">Telefone</span>
                                <span class="value">${telefone}</span>
                            </div>
                        </div>

                        <div class="prechat-col">
                            <div>
                                <span class="label">Bilhete Único</span>
                                <span class="value highlight">${bilhete}</span>
                            </div>

                            <div>
                                <span class="label">Local da Recarga</span>
                                <span class="value">${local}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;
        
        // PREENCHE INPUT DE BUSCA COM O BILHETE
        const inputBU = document.getElementById("input-bu");

        if (inputBU && bilhete && bilhete !== "-") {
            inputBU.value = bilhete;
        }

        // DISPARA API COM BILHETE VINDO DO CAMPO
        if (bilhete && bilhete !== "-") {

        // Pequeno delay para garantir que API esteja disponível
        setTimeout(function () {

            if (window.RechargeAPI && window.RechargeAPI.getRecharges) {
                window.RechargeAPI.getRecharges(bilhete);
            } else {
                console.warn("RechargeAPI ainda não disponível.");
            }

        }, 100);
    }

        resizeApp();
    }

    /**
     * ===============================
     * INICIALIZA
     * ===============================
     */

    getTicketFields()
        .then(renderTicketFields)
        .catch(function (error) {
            console.error("Erro ao carregar campos do ticket:", error);
        });

})();
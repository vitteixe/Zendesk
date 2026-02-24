(function () {

    /**
     * ===============================
     * FORMATA DATA (pt-BR)
     * Corrige fuso horário (-3h)
     * ===============================
     */
    function formatDateBR(isoDate) {

        if (!isoDate) {
            return "-";
        }

        // Remove o Z para impedir conversão automática de fuso
        const semTimezone = isoDate.replace("Z", "");

        const date = new Date(semTimezone);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    }

    /**
     * ===============================
     * NORMALIZA DADOS DA API
     * ===============================
     */
    function normalizeRecharges(data) {

    if (!Array.isArray(data) || !data[0]) {
        return [];
    }

    const payload = data[0];

    const recharges = Array.isArray(payload.recharges)
        ? payload.recharges
        : [];

    const credits = Array.isArray(payload.credits)
        ? payload.credits
        : [];

    // Junta recargas físicas + créditos online
    const combined = recharges.concat(credits);

    // Ordena por data (mais recente primeiro)
    combined.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
    });

    return combined.map(function (item) {

        return {
            ...item,
            created_at: formatDateBR(item.created_at),

            recharge_value:
                item.recharge_value !== undefined
                    ? (Number(item.recharge_value) / 100).toFixed(2).replace(".", ",")
                    : (item.total_value !== undefined
                        ? Number(item.total_value).toFixed(2).replace(".", ",")
                        : "-"),

            payment_type:
                item.recharge_acronym === "VCL"
                    ? "Lista"
                    : (item.payment_type || "-")
        };
    });
}

    /**
     * ===============================
     * BUSCA RECARGAS POR BILHETE
     * ===============================
     */
    function getRecharges(bilhete) {

        console.log("🔥 APP LOCAL RODANDO - NOVA API ATIVA");

        return fetch("https://api-dash-prd.rederecarga.app.br/api/recharges/" + bilhete + "?limit=10&include_credit=true")
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                const normalizedData = normalizeRecharges(data);

                if (window.onRechargeDataLoaded) {
                    window.onRechargeDataLoaded(normalizedData);
                }


                return normalizedData;
            })
            .catch(function (error) {

                console.error("Erro ao buscar recargas:", error);

                if (window.onRechargeDataLoaded) {
                    window.onRechargeDataLoaded([]);
                }

                return [];
            });
    }

    /**
     * ===============================
     * API PÚBLICA
     * ===============================
     */
    window.RechargeAPI = {
        getRecharges: getRecharges
    };

})();

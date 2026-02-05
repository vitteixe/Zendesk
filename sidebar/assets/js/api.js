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

        const date = new Date(isoDate);
        date.setHours(date.getHours() - 3);

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

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(function (item) {

            return {
                ...item,
                created_at: formatDateBR(item.created_at),
                recharge_value: item.recharge_value !== undefined && item.recharge_value !== null
                    ? (Number(item.recharge_value) / 100).toFixed(2).replace(".", ",")
                    : "-",
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

        return fetch("https://api-dash-prd.rederecarga.app.br/api/recharges/" + bilhete)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                const normalizedData = normalizeRecharges(data);

                if (window.onRechargeDataLoaded) {
                    window.onRechargeDataLoaded(normalizedData);
                }

                console.log("API normalizada:", normalizedData);

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

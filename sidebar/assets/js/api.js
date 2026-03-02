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

            /**
             * ===============================
             * CALCULA SIGLA FINAL (TIPO)
             * ===============================
             */
            const siglaFinal = (function () {

                if (item.recharge_acronym) {
                    return item.recharge_acronym;
                }

                const desc = (item.product_description || "").toUpperCase();

                if (desc.includes("COMUM - DIÁRIO TRILHO")) return "VC DT";
                if (desc.includes("CREDITO COMUM")) return "VC";
                if (desc === "COMUM" || desc.includes(" COMUM")) return "VC";
                if (desc.includes("ESTUDANTE/PROFESSOR")) return "VE";

                return "CR";

            })();

            return {
                ...item,

                created_at: formatDateBR(item.created_at),

                /**
                 * ===============================
                 * STATUS REC
                 * ===============================
                 */
                status_normalized:
                    (function () {

                        const st = (item.status || "").toUpperCase();

                        if (st === "CONFIRM" || st === "CONFIRMED") {
                            return "confirmed";
                        }

                        if (st === "CANCELED") {
                            return "canceled";
                        }

                        if (st === "PENDING") {
                            return "pendente";
                        }

                        return "pendente";

                    })(),

                /**
                 * ===============================
                 * STATUS PAG
                 * ===============================
                 */
                payment_status_normalized:
                    (function () {

                        const ps = (item.payment_status || "").toUpperCase();
                        const st = (item.status || "").toUpperCase();

                        if (ps.includes("PAGO") || st === "CONFIRMED" || st === "CONFIRM") {
                            return "pago";
                        }

                        if (st === "CANCELED") {
                            return "canceled";
                        }

                        if (st === "PENDING" || ps.includes("CONSULTAR")) {
                            return "pendente";
                        }

                        return "pendente";

                    })(),

                /**
                 * ===============================
                 * PDV
                 * ===============================
                 */
                pdv:
                    item.pdv
                        ? item.pdv
                        : "-",

                /**
                 * ===============================
                 * SERIAL
                 * ===============================
                 */
                serial:
                    (function () {

                        if (item.serial) {
                            return item.serial;
                        }

                        const origem = (item.origin_order || "").toUpperCase();

                        if (origem === "APP") return "APP";
                        if (origem === "RECHARGE") return "CRÉDITO ON";
                        if (origem === "SOCIAL") return "SOCIAL";

                        return "-";

                    })(),

                /**
                 * ===============================
                 * SERIAL (LABEL HOVER)
                 * ===============================
                 */
                serial_label:
                    (function () {

                        if (item.serial) {
                            return item.serial;
                        }

                        const origem = (item.origin_order || "").toUpperCase();

                        if (origem === "APP") return "RecargaAPP";
                        if (origem === "RECHARGE") return "Crédito online";
                        if (origem === "SOCIAL") return "Social";

                        return origem || "-";

                    })(),

                /**
                 * ===============================
                 * TIPO (SIGLA)
                 * ===============================
                 */
                recharge_acronym: siglaFinal,

                /**
                 * ===============================
                 * TIPO (LABEL COMPLETO)
                 * ===============================
                 */
                recharge_acronym_label:
                    (function () {

                        if (siglaFinal === "VE") return "Estudante";
                        if (siglaFinal === "VC") return "Comum";
                        if (siglaFinal === "VC DT") return "Comum Diário Trilho";
                        if (siglaFinal === "VCL") return "Comum Lista";
                        if (siglaFinal === "VEL") return "Estudante Lista";

                        return siglaFinal;

                    })(),

                /**
                 * ===============================
                 * VALOR
                 * ===============================
                 */
                recharge_value:
                    item.recharge_value !== undefined
                        ? (Number(item.recharge_value) / 100).toFixed(2).replace(".", ",")
                        : (item.total_value !== undefined
                            ? Number(item.total_value).toFixed(2).replace(".", ",")
                            : "-"),

                /**
                 * ===============================
                 * PGTO
                 * ===============================
                 */
                payment_type:
                    (function () {

                        if (
                            siglaFinal === "VCL" ||
                            siglaFinal === "VEL"
                        ) {
                            return "Lista";
                        }

                        return item.payment_type || "-";

                    })(),
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

                console.log("RETORNO NORMALIZADO:", normalizedData);

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
(function () {

    function getRecharges(bilhete) {

        return fetch('https://api-dash-prd.rederecarga.app.br/api/recharges/' + bilhete)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                if (!Array.isArray(data)) {
                    data = [];
                }

                // ===============================
                // 🔴 TRATATIVA DO VALOR DA RECARGA
                // valor_de_recarga vem em centavos
                // ex: 500 -> 5,00 | 1000 -> 10,00
                // ===============================
                data.forEach(function (item) {

                    if (
                        item.recharge_value !== undefined &&
                        item.recharge_value !== null
                    ) {
                        item.recharge_value = (
                            Number(item.recharge_value) / 100
                        ).toFixed(2).replace('.', ',');
                    }

                });

                // ===============================
                // 🔵 CALLBACK PARA O APP.JS
                // ===============================
                if (window.onRechargeDataLoaded) {
                    window.onRechargeDataLoaded(data);
                }

                // console apenas do retorno final tratado
                console.log(data);

                return data;
            })
            .catch(function (error) {

                console.error("Erro ao buscar recargas:", error);

                if (window.onRechargeDataLoaded) {
                    window.onRechargeDataLoaded([]);
                }

                return [];
            });
    }

    window.RechargeAPI = {
        getRecharges: getRecharges
    };

})();
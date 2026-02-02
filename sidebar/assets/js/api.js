(function () {

    function getRecharges() {

        return fetch('https://api-dash-prd.rederecarga.app.br/api/recharges/1250369447')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                if (!Array.isArray(data)) {
                    return [];
                }

                // ===============================
                // 🔴 TRATATIVA DO VALOR DA RECARGA
                // valor_de_recarga vem em centavos
                // ex: 500 -> 5.00 | 1000 -> 10.00
                // ===============================
                data.forEach(function (item) {
                    if (
                        item.recharge_value !== undefined &&
                        item.recharge_value !== null
                    ) {
                        item.recharge_value = (
                            Number(item.recharge_value) / 100
                        ).toFixed(2).replace('.' , ',');
                    }
                });

                // console apenas do retorno final tratado
                console.log(data);

                return data;
            })
            .catch(function () {
                return [];
            });
    }

    window.RechargeAPI = {
        getRecharges: getRecharges
    };

})();

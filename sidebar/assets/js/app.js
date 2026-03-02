// inicializa o Zendesk App Framework
const client = ZAFClient.init();

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

            <td title="${item.serial_label || "-"}">
                ${item.serial || "-"}
            </td>

            <td title="${item.recharge_acronym_label || "-"}">
                ${item.recharge_acronym || "-"}
            </td>

            <td>${item.recharge_value || "-"}</td>
            <td>${item.payment_type || "-"}</td>

            <!-- PAYMENT STATUS -->
            <td>
                <span
                    class="payment-status status-${item.payment_status_normalized}"
                    title="${item.payment_status || "-"}">
                </span>
            </td>

            <!-- RECHARGE STATUS -->
            <td>
                <span
                    class="recharge-status status-${item.status_normalized}"
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
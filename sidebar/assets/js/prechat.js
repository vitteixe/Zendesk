/**
 * ===============================
 * LOCALIZA BLOCO DE PRÉ-CHAT
 * (Zendesk Messaging)
 * ===============================
 */
function localizarBlocoPreChat(comments) {

    return comments
        .filter(function (c) {

            if (!c.value) return false;

            return (
                c.value.includes("Chat started") ||
                c.value.includes("A form was sent")
            );
        })
        .pop();
}

/**
 * ===============================
 * LIMPA HTML DO PRÉ-CHAT
 * ===============================
 */
function limparTextoPreChat(valor) {

    return valor
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .split("\n")
        .map(function (linha) {
            return linha.trim();
        })
        .filter(Boolean);
}

/**
 * ===============================
 * EXTRAI CAMPOS POR PALAVRA-CHAVE
 * ===============================
 */
function extrairDadosPreChat(linhas) {

    const dados = {
        cpf: null,
        email: null,
        telefone: null,
        solicitacao: null,
        local: null,
        bilhete: null
    };

    linhas.forEach(function (linha) {

        const partes = linha.split(":");
        if (partes.length < 2) return;

        const label = partes[0].toLowerCase();
        const valor = partes.slice(1).join(":").trim();

        if (label.includes("cpf")) dados.cpf = valor;
        if (label.includes("email")) dados.email = valor;
        if (label.includes("telefone")) dados.telefone = valor;
        if (label.includes("solicitação")) dados.solicitacao = valor;
        if (label.includes("local")) dados.local = valor;
        if (label.includes("bilhete")) dados.bilhete = valor;
    });

    return dados;
}

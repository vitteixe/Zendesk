// inicializa o Zendesk App Framework
const client = ZAFClient.init();

// função que ajusta a altura do iframe
function resizeApp() {
  const altura = document.body.scrollHeight;

  client.invoke("resize", {
    width: "100%",
    height: `${altura}px`
  });
}

// garante resize ao carregar
resizeApp();

// garante resize depois que o DOM terminar de renderizar
window.addEventListener("load", () => {
  resizeApp();
});

// garante resize mesmo se algo mudar depois
setTimeout(() => {
  resizeApp();
}, 300);

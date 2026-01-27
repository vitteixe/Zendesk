// função que ajusta a altura do iframe
function resizeApp() {
  const altura = document.body.scrollHeight;

  client.invoke("resize", {
    width: "100%",
    height: `${altura}px`
  });
}

// resize inicial
resizeApp();

// resize ao carregar
window.addEventListener("load", () => {
  resizeApp();
});

// resize de segurança
setTimeout(() => {
  resizeApp();
}, 300);


document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("buscador");
  const filas = document.querySelectorAll("tbody tr");

  input.addEventListener("keyup", function () {
    const valor = this.value.toLowerCase();

    filas.forEach(fila => {
      const textoFila = fila.textContent.toLowerCase();
      if (textoFila.includes(valor)) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  });
});

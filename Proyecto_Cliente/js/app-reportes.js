document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".filtros nav a");
  const tipoSelects = ["Todos", "Inventario", "Clientes", "Mantenimiento", "Ventas"];
  let filtroTipo = "Todos";

  const rangoSelect = document.querySelector(".acciones select");
  let filtroDias = 7;

  const filas = document.querySelectorAll("tbody tr");

  navLinks.forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      filtroTipo = tipoSelects[index];
      navLinks.forEach(l => l.classList.remove("activo"));
      this.classList.add("activo");
      aplicarFiltros();
    });
  });

  rangoSelect.addEventListener("change", function () {
    const texto = this.value;
    filtroDias = texto.includes("30") ? 30 : 7;
    aplicarFiltros();
  });

  function aplicarFiltros() {
    const ahora = new Date();

    filas.forEach(fila => {
      const tipo = fila.dataset.tipo;
      const fecha = new Date(fila.dataset.fecha);

      const diferenciaDias = (ahora - fecha) / (1000 * 60 * 60 * 24);
      const coincideTipo = filtroTipo === "Todos" || tipo === filtroTipo;
      const coincideFecha = diferenciaDias <= filtroDias;

      if (coincideTipo && coincideFecha) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  }

  aplicarFiltros();
});

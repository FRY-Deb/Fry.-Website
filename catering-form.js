(function () {
  "use strict";
  var form = document.getElementById("cateringForm");
  if (!form) return;

  var WHATSAPP = "34669765785";
  var errorEl = document.getElementById("cfError");

  function val(id) { return (document.getElementById(id).value || "").trim(); }

  function formatDate(iso) {
    var p = iso.split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }

  var dateInput = document.getElementById("cfDate");
  var today = new Date();
  dateInput.min = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.style.display = "none";

    var required = [
      ["cfCompany", "la empresa"], ["cfName", "la persona de contacto"], ["cfPhone", "un teléfono"],
      ["cfType", "el tipo de evento"], ["cfPeople", "el número de personas"], ["cfDate", "la fecha"],
      ["cfTime", "la hora de entrega"], ["cfPlace", "el lugar de entrega"]
    ];
    for (var i = 0; i < required.length; i++) {
      if (!val(required[i][0])) {
        errorEl.textContent = "Falta indicar " + required[i][1] + ".";
        errorEl.style.display = "block";
        document.getElementById(required[i][0]).focus();
        return;
      }
    }
    if (!document.getElementById("cfConsent").checked) {
      errorEl.textContent = "Para enviar la solicitud tienes que aceptar la Política de Privacidad.";
      errorEl.style.display = "block";
      return;
    }

    var items = Array.prototype.map.call(
      form.querySelectorAll('input[name="cfItems"]:checked'),
      function (c) { return c.value; }
    );

    var lines = [
      "Hola! Quiero pedir presupuesto de catering para mi empresa:",
      "",
      "Empresa: " + val("cfCompany"),
      "Contacto: " + val("cfName"),
      "Teléfono: " + val("cfPhone")
    ];
    if (val("cfEmail")) lines.push("Email: " + val("cfEmail"));
    lines.push("",
      "Tipo de evento: " + val("cfType"),
      "Personas: " + val("cfPeople"),
      "Fecha: " + formatDate(val("cfDate")),
      "Hora de entrega: " + val("cfTime"),
      "Lugar: " + val("cfPlace")
    );
    if (items.length) lines.push("Nos interesa: " + items.join(", "));
    if (val("cfBudget")) lines.push("Presupuesto aproximado: " + val("cfBudget"));
    if (val("cfAllergies")) lines.push("Alergias o intolerancias: " + val("cfAllergies"));
    if (val("cfNotes")) lines.push("", "Comentarios: " + val("cfNotes"));

    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
  });
})();

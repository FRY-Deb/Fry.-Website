(function () {
  "use strict";
  var form = document.getElementById("cateringForm");
  if (!form) return;

  var TO_EMAIL = "info.frygroup@gmail.com";
  // Identificador de FormSubmit para este correo (así el email no va a la vista en el envío).
  var FORM_ID = "076952f42b32a670adb2b0cef4a40aa9";
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

    var payload = {
      _subject: "Solicitud de catering — " + val("cfCompany"),
      _template: "table",
      _captcha: "false",
      _honey: "",
      "Empresa": val("cfCompany"),
      "Persona de contacto": val("cfName"),
      "Teléfono": val("cfPhone"),
      "Email": val("cfEmail") || "—",
      "Tipo de evento": val("cfType"),
      "Número de personas": val("cfPeople"),
      "Fecha": formatDate(val("cfDate")),
      "Hora de entrega": val("cfTime"),
      "Lugar de entrega": val("cfPlace"),
      "Les interesa": items.length ? items.join(", ") : "—",
      "Presupuesto": val("cfBudget") || "—",
      "Alergias o intolerancias": val("cfAllergies") || "—",
      "Descripción del proyecto": val("cfNotes") || "—"
    };
    if (val("cfEmail")) payload._replyto = val("cfEmail");

    var btn = document.getElementById("cfSubmit");
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Enviando…";

    fetch("https://formsubmit.co/ajax/" + FORM_ID, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok || String(r.data.success) === "false") throw new Error("send failed");
        form.classList.add("is-sent");
        document.getElementById("cfSuccess").style.display = "block";
        document.getElementById("cfSuccess").scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = originalText;
        errorEl.textContent = "No hemos podido enviar la solicitud. Inténtalo de nuevo o escríbenos a " + TO_EMAIL + ".";
        errorEl.style.display = "block";
      });
  });
})();

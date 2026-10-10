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
  var todayIso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  dateInput.min = todayIso;

  // ---------------------------------------------------------------
  // Comprobación de datos
  // ---------------------------------------------------------------
  var TLD_TYPOS = {
    con: "com", cmo: "com", ocm: "com", vom: "com", xom: "com", cim: "com", cpm: "com",
    comm: "com", coom: "com", c0m: "com", co: "com",
    ez: "es", ed: "es"
  };
  var DOMAIN_TYPOS = {
    "gmial": "gmail", "gmai": "gmail", "gmal": "gmail", "gnail": "gmail", "gmaill": "gmail", "gamil": "gmail", "gmeil": "gmail",
    "hotmial": "hotmail", "hotmal": "hotmail", "hotmai": "hotmail", "hotamil": "hotmail", "hotmaill": "hotmail", "hotnail": "hotmail",
    "outlok": "outlook", "outllok": "outlook", "outook": "outlook", "outloock": "outlook",
    "yaho": "yahoo", "yahooo": "yahoo", "yhoo": "yahoo", "yahou": "yahoo",
    "iclod": "icloud", "iclud": "icloud", "icoud": "icloud"
  };
  var BIG_PROVIDERS = ["gmail", "hotmail", "outlook", "yahoo", "icloud", "live"];

  // Devuelve null si el email parece correcto, o el texto que explica dónde está el fallo.
  function emailProblem(email) {
    if (/\s/.test(email)) return "El email no puede llevar espacios. Quítalos y vuelve a probar.";
    var at = email.indexOf("@");
    if (at === -1) return "Falta la @ en el email (por ejemplo, nombre@empresa.com).";
    if (at !== email.lastIndexOf("@")) return "El email lleva más de una @. Revisa que solo haya una.";
    var local = email.slice(0, at);
    var domain = email.slice(at + 1).toLowerCase();
    if (!local) return "Falta lo que va antes de la @ en el email.";
    if (!domain) return "Falta el dominio después de la @ (por ejemplo, empresa.com).";
    if (domain.indexOf(".") === -1) return "Al dominio le falta el final (por ejemplo, .com o .es): \"" + domain + "\".";
    if (/\.\./.test(email) || domain.charAt(0) === "." || domain.charAt(domain.length - 1) === ".") {
      return "Hay un punto mal colocado en el email. Revisa los puntos del dominio.";
    }
    var parts = domain.split(".");
    var tld = parts[parts.length - 1];
    var name = parts[0];

    if (DOMAIN_TYPOS[name]) {
      return "Revisa el email: \"" + parts[0] + "\" parece un error. ¿Querías poner \"" + DOMAIN_TYPOS[name] + "\"?";
    }
    if (TLD_TYPOS.hasOwnProperty(tld)) {
      var onlyCoOk = tld === "co" && BIG_PROVIDERS.indexOf(name) === -1;
      if (!onlyCoOk) {
        return "Revisa el final del email: termina en \"." + tld + "\" y no parece correcto. ¿Querías poner \"." + TLD_TYPOS[tld] + "\"?";
      }
    }
    if (!/^[a-z]{2,}$/.test(tld)) return "El final del email no es válido (\"." + tld + "\"). Revisa lo que va después del último punto.";
    if (!/^[^\s@]+$/.test(local) || !/^[a-z0-9.-]+$/.test(domain)) return "El email tiene caracteres que no son válidos. Revísalo.";
    return null;
  }

  function phoneProblem(raw) {
    var s = raw.replace(/[\s.\-()]/g, "");
    if (!/^\+?\d+$/.test(s)) return "El teléfono solo puede llevar números (y un + al principio).";
    var intl = false;
    if (s.indexOf("+") === 0) {
      if (s.indexOf("+34") === 0) s = s.slice(3); else intl = true;
    } else if (s.indexOf("0034") === 0) {
      s = s.slice(4);
    }
    var digits = s.replace(/\D/g, "");
    if (intl) {
      return digits.length >= 8 && digits.length <= 15 ? null : "Revisa el teléfono: con prefijo internacional debe tener entre 8 y 15 cifras.";
    }
    if (digits.length !== 9) return "Revisa el teléfono: tiene " + digits.length + " cifras y debería tener 9.";
    if (!/^[6-9]/.test(digits)) return "Revisa el teléfono: los números de España empiezan por 6, 7, 8 o 9.";
    return null;
  }

  var checks = [
    ["cfCompany", function (v) { return v.length < 2 ? "Indica el nombre de la empresa." : null; }, true],
    ["cfName", function (v) { return v.length < 2 ? "Indica la persona de contacto." : null; }, true],
    ["cfPhone", function (v) { return v ? phoneProblem(v) : "Indica un teléfono de contacto."; }, true],
    ["cfEmail", function (v) { return v ? emailProblem(v) : null; }, false],
    ["cfType", function (v) { return v ? null : "Elige el tipo de evento."; }, true],
    ["cfPeople", function (v) {
      if (!v) return "Indica el número de personas.";
      var n = Number(v);
      if (!/^\d+$/.test(v) || n < 1) return "El número de personas tiene que ser un número entero, de 1 en adelante.";
      if (n > 2000) return "Revisa el número de personas: parece demasiado alto.";
      return null;
    }, true],
    ["cfDate", function (v) {
      if (!v) return "Indica la fecha del evento.";
      return v < todayIso ? "La fecha ya ha pasado. Elige una fecha de hoy en adelante." : null;
    }, true],
    ["cfTime", function (v) { return v ? null : "Indica la hora de entrega."; }, true],
    ["cfPlace", function (v) { return v.length < 5 ? "Indica el lugar y la dirección de entrega." : null; }, true],
    ["cfBudget", function (v) {
      if (!v) return null;
      return /^\d+([.,]\d+)?\s*€?$/.test(v) ? null : "El presupuesto tiene que ser una cantidad en euros, solo con números.";
    }, false]
  ];

  function fieldError(id) {
    var input = document.getElementById(id);
    var wrap = input.closest(".cf-field");
    var el = wrap.querySelector(".cf-fielderr");
    if (!el) {
      el = document.createElement("p");
      el.className = "cf-fielderr";
      el.setAttribute("role", "alert");
      wrap.appendChild(el);
    }
    return { input: input, el: el };
  }

  function setError(id, msg) {
    var f = fieldError(id);
    if (msg) {
      f.el.textContent = msg;
      f.el.style.display = "block";
      f.input.classList.add("has-error");
      f.input.setAttribute("aria-invalid", "true");
    } else {
      f.el.textContent = "";
      f.el.style.display = "none";
      f.input.classList.remove("has-error");
      f.input.removeAttribute("aria-invalid");
    }
  }

  function runCheck(c) {
    var msg = c[1](val(c[0]));
    setError(c[0], msg);
    return msg;
  }

  // Revisa cada campo en cuanto el cliente sale de él.
  checks.forEach(function (c) {
    var input = document.getElementById(c[0]);
    input.addEventListener("blur", function () { if (val(c[0]) || c[2]) runCheck(c); });
    input.addEventListener("input", function () { if (input.classList.contains("has-error")) runCheck(c); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.style.display = "none";

    var firstBad = null;
    checks.forEach(function (c) {
      if (runCheck(c) && !firstBad) firstBad = c[0];
    });
    if (firstBad) {
      errorEl.textContent = "Revisa los campos marcados en rojo antes de enviar.";
      errorEl.style.display = "block";
      document.getElementById(firstBad).focus();
      return;
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

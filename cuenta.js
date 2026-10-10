(function () {
  "use strict";

  var loading = document.getElementById("accLoading");
  var guestEl = document.getElementById("accGuest");
  var userEl = document.getElementById("accUser");
  if (!guestEl) return;

  if (typeof firebase === "undefined" || typeof FRY_FIREBASE_CONFIG === "undefined") {
    loading.textContent = "No se ha podido cargar el sistema de cuentas. Recarga la página.";
    return;
  }
  if (!firebase.apps.length) firebase.initializeApp(FRY_FIREBASE_CONFIG);
  var auth = firebase.auth();
  var db = firebase.database();
  var logRef = null, profileRef = null, profileCreating = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function authMessage(err) {
    switch (err && err.code) {
      case "auth/invalid-email": return "El email no es válido. Revísalo.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials": return "Email o contraseña incorrectos.";
      case "auth/email-already-in-use": return "Ya existe una cuenta con ese email. Prueba a entrar.";
      case "auth/weak-password": return "La contraseña es demasiado corta (mínimo 6 caracteres).";
      case "auth/too-many-requests": return "Demasiados intentos. Espera un momento y vuelve a probar.";
      case "auth/network-request-failed": return "Sin conexión. Inténtalo de nuevo.";
      default: return "No hemos podido completar la operación. Inténtalo de nuevo.";
    }
  }

  function showError(form, msg) {
    var el = form.querySelector("[data-acc-error]");
    el.textContent = msg;
    el.style.display = msg ? "block" : "none";
  }

  // Pestañas
  var tabs = document.querySelectorAll(".account-tab");
  var loginForm = document.getElementById("accLogin");
  var regForm = document.getElementById("accRegister");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      for (var j = 0; j < tabs.length; j++) tabs[j].classList.toggle("is-active", tabs[j] === this);
      var reg = this.dataset.tab === "register";
      loginForm.style.display = reg ? "none" : "";
      regForm.style.display = reg ? "" : "none";
    });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    showError(loginForm, "");
    var email = document.getElementById("loginEmail").value.trim();
    var pass = document.getElementById("loginPass").value;
    if (!email || !pass) { showError(loginForm, "Escribe tu email y tu contraseña."); return; }
    auth.signInWithEmailAndPassword(email, pass).catch(function (err) { showError(loginForm, authMessage(err)); });
  });

  document.getElementById("accForgot").addEventListener("click", function () {
    var email = document.getElementById("loginEmail").value.trim();
    if (!email) { showError(loginForm, "Escribe tu email arriba y pulsa de nuevo para recibir el enlace."); return; }
    auth.sendPasswordResetEmail(email).then(function () {
      showError(loginForm, "");
      alert("Si ese email tiene cuenta, te hemos enviado un enlace para crear una contraseña nueva. Mira también en spam.");
    }).catch(function (err) { showError(loginForm, authMessage(err)); });
  });

  regForm.addEventListener("submit", function (e) {
    e.preventDefault();
    showError(regForm, "");
    var name = document.getElementById("regName").value.trim();
    var phone = document.getElementById("regPhone").value.trim();
    var email = document.getElementById("regEmail").value.trim();
    var pass = document.getElementById("regPass").value;
    var pass2 = document.getElementById("regPass2").value;
    if (name.length < 2) { showError(regForm, "Escribe tu nombre."); return; }
    var digits = phone.replace(/[\s.\-()+]/g, "");
    if (!/^\d{9,15}$/.test(digits)) { showError(regForm, "Revisa el teléfono: debe tener entre 9 y 15 cifras."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { showError(regForm, "Revisa el email: no parece válido."); return; }
    if (/\.(con|cmo|ocm|vom)$/i.test(email) || /@(gmial|gmai|hotmial|hotmal|outlok|yaho)\./i.test(email)) {
      showError(regForm, "Revisa el email: parece que hay un error al escribirlo."); return;
    }
    if (pass.length < 6) { showError(regForm, "La contraseña debe tener al menos 6 caracteres."); return; }
    if (pass !== pass2) { showError(regForm, "Las dos contraseñas no coinciden. Escríbelas igual en los dos campos."); return; }
    if (!document.getElementById("regConsent").checked) { showError(regForm, "Tienes que aceptar la Política de Privacidad."); return; }

    auth.createUserWithEmailAndPassword(email, pass).then(function (cred) {
      return db.ref("users/" + cred.user.uid).set({
        name: name, phone: phone, email: email, createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    }).catch(function (err) { showError(regForm, authMessage(err)); });
  });

  document.getElementById("accLogout").addEventListener("click", function () { auth.signOut(); });

  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function renderUser(user, profile, log) {
    var bal = FRY_computeBalance(log, Date.now(), user.email);
    document.getElementById("accHello").textContent = "Hola, " + ((profile && profile.name) || "bienvenido") + ".";
    document.getElementById("accEmail").textContent = user.email;
    document.getElementById("accBalance").textContent = FRY_formatPoints(bal.available);
    document.getElementById("accExpiry").textContent = bal.nextExpiry && bal.available > 0
      ? "Los primeros puntos caducan el " + fmtDate(bal.nextExpiry) + "."
      : "100 puntos por cada 1€ gastado.";

    document.getElementById("accRewards").innerHTML = FRY_REWARD_ORDER.map(function (id) {
      var r = FRY_REWARDS[id];
      var ok = bal.available >= r.points;
      var pct = Math.min(100, Math.round(bal.available / r.points * 100));
      return (
        '<div class="reward-card' + (ok ? " is-ready" : "") + '">' +
          '<p class="reward-name">' + esc(r.label) + "</p>" +
          '<p class="reward-points">' + FRY_formatPoints(r.points) + " puntos</p>" +
          '<div class="reward-bar"><span style="width:' + pct + '%"></span></div>' +
          '<p class="reward-state">' + (ok ? "¡Ya la puedes canjear!" : "Te faltan " + FRY_formatPoints(r.points - bal.available) + " puntos") + "</p>" +
        "</div>"
      );
    }).join("");

    var keys = Object.keys(log || {}).sort(function (a, b) { return (log[b].ts || 0) - (log[a].ts || 0); });
    document.getElementById("accHistory").innerHTML = keys.length ? keys.map(function (k) {
      var e = log[k];
      var p = Number(e.points) || 0;
      var gain = e.type === "earn" || (e.type === "adjust" && p > 0);
      var text = e.type === "earn" ? "Pedido #" + esc(e.orderCode || "")
        : e.type === "redeem" ? "Canje: " + esc(e.reward || "")
        : "Ajuste de FRY." + (e.note ? " — " + esc(e.note) : "");
      return '<div class="history-row"><span>' + fmtDate(e.ts) + " · " + text + '</span><span class="' + (gain ? "pts-plus" : "pts-minus") + '">' +
        (gain ? "+" : "−") + FRY_formatPoints(Math.abs(p)) + "</span></div>";
    }).join("") : '<p class="account-note">Todavía no tienes movimientos. Tus puntos aparecerán aquí cuando FRY. confirme tu primer pedido.</p>';
  }

  auth.onAuthStateChanged(function (user) {
    if (logRef) { logRef.off(); logRef = null; }
    if (profileRef) { profileRef.off(); profileRef = null; }
    profileCreating = false;
    loading.style.display = "none";
    if (!user) {
      guestEl.style.display = "";
      userEl.style.display = "none";
      return;
    }
    guestEl.style.display = "none";
    userEl.style.display = "";
    var profile = null, log = {};
    profileRef = db.ref("users/" + user.uid);
    profileRef.on("value", function (s) {
      profile = s.val();
      // Cuentas que ya existían sin perfil (p. ej. la del dueño): se crea uno básico.
      if (!profile && !profileCreating) {
        profileCreating = true;
        profileRef.set({ name: (user.email || "cliente").split("@")[0], email: user.email || "" }).catch(function () {});
      }
      renderUser(user, profile, log);
    });
    logRef = db.ref("points/" + user.uid + "/log");
    logRef.on("value", function (s) { log = s.val() || {}; renderUser(user, profile, log); });
  });
})();

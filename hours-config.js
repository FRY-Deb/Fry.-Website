// Horarios por defecto. El panel de admin puede sobrescribir esto en
// Firebase (nodo "hours") sin tocar código — esto es solo el valor de
// respaldo si Firebase no responde o todavía no se ha configurado nada.
// null = cerrado ese día. { open, close } = horario en formato "HH:MM".
var FRY_HOURS_DEFAULT = {
  lunes: null,
  martes: null,
  miercoles: { open: "13:00", close: "23:30" },
  jueves: { open: "13:00", close: "23:30" },
  viernes: { open: "19:00", close: "23:30" },
  sabado: { open: "13:00", close: "23:30" },
  domingo: { open: "13:00", close: "23:30" }
};

var FRY_DAY_ORDER = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
var FRY_DAY_LABELS = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo"
};

// Comprueba si una fecha/hora concreta cae dentro del horario de apertura.
function fryIsWithinHours(date, hoursMap) {
  var dayKey = FRY_DAY_ORDER[date.getDay()];
  var today = hoursMap[dayKey];
  if (!today || !today.open || !today.close) return false;

  var minutes = date.getHours() * 60 + date.getMinutes();
  var openParts = today.open.split(":");
  var closeParts = today.close.split(":");
  var openMin = parseInt(openParts[0], 10) * 60 + parseInt(openParts[1], 10);
  var closeMin = parseInt(closeParts[0], 10) * 60 + parseInt(closeParts[1], 10);

  return minutes >= openMin && minutes < closeMin;
}

function fryTodayHoursText(date, hoursMap) {
  var dayKey = FRY_DAY_ORDER[date.getDay()];
  var today = hoursMap[dayKey];
  if (!today) return "Hoy cerrado";
  return "Hoy de " + today.open + " a " + today.close;
}
